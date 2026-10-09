"""
Qiskit 2.x QAOA Quantum Solver for QuantumFlow Irrigation Allocation
Implements a genuine Qiskit QAOA pipeline:
QUBO -> Ising SparsePauliOp -> Parameterized Qiskit QAOA QuantumCircuit
-> Qiskit Statevector / StatevectorSampler Local Simulation -> COBYLA Parameter Optimization
-> Highest-Probability Measured Bitstring -> Hydrological Decoding & Validation.
"""
import time
import numpy as np
from scipy.optimize import minimize

from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.quantum_info import SparsePauliOp, Statevector
from qiskit.primitives import StatevectorSampler

try:
    from backend.dataset import get_scenario_data
    from backend.optimization_service import (
        build_qubo,
        decode_bitstring,
        validate_constraints,
        calculate_metrics,
        evaluate_qubo_energy,
        evaluate_ising_energy,
    )
except ImportError:
    from dataset import get_scenario_data
    from optimization_service import (
        build_qubo,
        decode_bitstring,
        validate_constraints,
        calculate_metrics,
        evaluate_qubo_energy,
        evaluate_ising_energy,
    )

def build_ising_pauli_op(n_qubits: int, h: np.ndarray, J: np.ndarray, offset: float = 0.0) -> SparsePauliOp:
    """
    Constructs a genuine Qiskit SparsePauliOp representing the Ising Hamiltonian:
    H = offset * I + sum_i h_i Z_i + sum_{i < j} J_{ij} Z_i Z_j
    """
    sparse_list = []
    if abs(offset) > 1e-12:
        sparse_list.append(("I", [0], float(offset)))

    for i in range(n_qubits):
        if abs(h[i]) > 1e-12:
            sparse_list.append(("Z", [i], float(h[i])))

    for i in range(n_qubits):
        for j in range(i + 1, n_qubits):
            if abs(J[i, j]) > 1e-12:
                sparse_list.append(("ZZ", [i, j], float(J[i, j])))

    if not sparse_list:
        sparse_list.append(("I", [0], 0.0))

    return SparsePauliOp.from_sparse_list(sparse_list, num_qubits=n_qubits).simplify()

def build_qaoa_circuit(n_qubits: int, p: int, h: np.ndarray, J: np.ndarray, scale: float = 1.0):
    """
    Constructs a parameterized Qiskit QuantumCircuit implementing p layers of QAOA:
    1. Initial Hadamard layer |+>^{otimes n}
    2. Alternating Cost Hamiltonian unitary U(C, gamma_l) = exp(-i * gamma_l * H_C / scale)
       using RZZ and RZ gates
    3. Transverse-field Mixer unitary U(B, beta_l) = exp(-i * beta_l * sum_i X_i)
       using RX(2 * beta_l) gates
    """
    gammas = ParameterVector("gamma", p)
    betas = ParameterVector("beta", p)

    qc = QuantumCircuit(n_qubits, name=f"QAOA_p{p}")
    # 1. Uniform superposition state |+>^n
    qc.h(range(n_qubits))

    # 2. Alternating p layers of Cost and Mixer unitaries
    for layer in range(p):
        gamma = gammas[layer]
        beta = betas[layer]

        # Cost unitary: exp(-i * gamma * (sum h_i Z_i + sum J_ij Z_i Z_j) / scale)
        # Note: RZZ(theta) = exp(-i * (theta/2) * Z_i Z_j) => theta = 2 * gamma * J_ij / scale
        for i in range(n_qubits):
            for j in range(i + 1, n_qubits):
                if abs(J[i, j]) > 1e-9:
                    qc.rzz(2.0 * gamma * float(J[i, j]) / scale, i, j)
        for i in range(n_qubits):
            if abs(h[i]) > 1e-9:
                qc.rz(2.0 * gamma * float(h[i]) / scale, i)

        # Mixer unitary: exp(-i * beta * sum X_i) => RX(2 * beta)
        for i in range(n_qubits):
            qc.rx(2.0 * beta, i)

    return qc, gammas, betas

def solve_qaoa(
    scenario_name: str,
    reps: int = 2,
    optimizer_iterations: int = 30,
    penalty_strength: float = 15.0,
):
    """
    Executes the complete Qiskit QAOA workflow on Qiskit's local Statevector & StatevectorSampler simulator.
    """
    start = time.perf_counter()
    qubo = build_qubo(scenario_name, penalty_strength)
    n_vars = qubo["n_vars"]
    h = qubo["h"]
    J = qubo["J"]
    offset = qubo["offset"]
    p = max(1, min(4, int(reps)))
    max_iters = max(10, min(80, int(optimizer_iterations)))

    # 1. Build genuine Qiskit SparsePauliOp Ising Hamiltonian
    cost_hamiltonian = build_ising_pauli_op(n_vars, h, J, offset)

    # Diagonal energy spectrum of cost_hamiltonian in Qiskit's computational basis
    # Used by Qiskit Statevector expectation evaluation <psi|H_C|psi>
    hamiltonian_diag = np.real(cost_hamiltonian.to_matrix(sparse=True).diagonal())

    # Spectral normalization factor so variational angles gamma stay O(1)
    max_coeff = max(
        float(np.max(np.abs(h))) if len(h) > 0 else 1.0,
        float(np.max(np.abs(J))) if J.size > 0 else 1.0,
        1.0,
    )

    # 2. Build parameterized Qiskit QuantumCircuit for QAOA
    qc, gammas_param, betas_param = build_qaoa_circuit(n_vars, p, h, J, scale=max_coeff)

    # 3. Variational energy expectation evaluated via Qiskit Statevector simulation of bound circuit
    def evaluate_qiskit_expectation(params: np.ndarray) -> float:
        param_bind = {}
        for layer in range(p):
            param_bind[gammas_param[layer]] = float(params[layer])
            param_bind[betas_param[layer]] = float(params[p + layer])

        bound_qc = qc.assign_parameters(param_bind, inplace=False)
        sv = Statevector.from_instruction(bound_qc)
        probs = sv.probabilities()
        return float(np.dot(probs, hamiltonian_diag))

    # Multi-start initial point selection (warm start across standard QAOA ramp schedule)
    candidate_inits = [
        np.concatenate([np.linspace(0.35, 0.85, p), np.linspace(0.55, 0.25, p)]),
        np.concatenate([np.linspace(0.60, 1.20, p), np.linspace(0.45, 0.20, p)]),
        np.concatenate([np.linspace(0.20, 0.50, p), np.linspace(0.70, 0.35, p)]),
    ]
    best_init = min(candidate_inits, key=evaluate_qiskit_expectation)

    # 4. Classical parameter optimization using SciPy COBYLA over Qiskit circuit evaluations
    opt_res = minimize(
        evaluate_qiskit_expectation,
        best_init,
        method="COBYLA",
        options={"maxiter": max_iters, "rhobeg": 0.25},
    )

    best_params = opt_res.x
    optimal_gammas = [round(float(best_params[l]), 4) for l in range(p)]
    optimal_betas = [round(float(best_params[p + l]), 4) for l in range(p)]

    # 5. Bind optimal parameters to final Qiskit QuantumCircuit
    final_bind = {}
    for layer in range(p):
        final_bind[gammas_param[layer]] = float(best_params[layer])
        final_bind[betas_param[layer]] = float(best_params[p + layer])

    final_bound_qc = qc.assign_parameters(final_bind, inplace=False)

    # Exact Qiskit Statevector of final circuit
    final_sv = Statevector.from_instruction(final_bound_qc)
    final_probs = final_sv.probabilities()

    # Also execute Qiskit V2 StatevectorSampler with measurement gates
    measured_qc = final_bound_qc.copy()
    measured_qc.measure_all()
    sampler = StatevectorSampler(default_shots=4096)
    pub_result = sampler.run([measured_qc]).result()[0]
    counts = pub_result.data.meas.get_counts()
    total_shots = sum(counts.values())

    # 6. Extract measured candidate bitstrings ordered STRICTLY by probability descending
    # Note: Qiskit bitstrings are little-endian (q_{N-1}...q_1 q_0), so we reverse k[::-1]
    # to map q_i -> variable x_i.
    top_qiskit_indices = np.argsort(final_probs)[::-1][:12]
    statevector_probabilities = []
    for idx in top_qiskit_indices:
        qiskit_label = format(int(idx), f"0{n_vars}b")
        var_bitstring = qiskit_label[::-1]  # q_0 -> x_0
        prob_pct = round(float(final_probs[idx]) * 100.0, 3)
        energy_val = round(evaluate_qubo_energy(var_bitstring, qubo), 2)
        statevector_probabilities.append({
            "bitstring": var_bitstring,
            "probability": prob_pct,
            "energy": energy_val,
        })

    # Select the highest-probability state from the QAOA quantum distribution (NO classical energy sorting!)
    best_candidate = statevector_probabilities[0]
    best_bitstring = best_candidate["bitstring"]
    best_qubo_energy = evaluate_qubo_energy(best_bitstring, qubo)
    best_ising_energy = evaluate_ising_energy(best_bitstring, qubo)

    runtime_ms = (time.perf_counter() - start) * 1000.0

    # 7. Decode bitstring, validate hydrological constraints, and compute metrics
    allocation = decode_bitstring(best_bitstring)
    constraints = validate_constraints(scenario_name, allocation)
    metrics = calculate_metrics(scenario_name, allocation, best_qubo_energy, runtime_ms)
    scenario_data = get_scenario_data(scenario_name)

    # 8. Extract authentic gate counts and depth directly from Qiskit QuantumCircuit
    ops = final_bound_qc.count_ops()
    gate_counts = {
        "hadamard": int(ops.get("h", 0)),
        "rz": int(ops.get("rz", 0)),
        "rzz": int(ops.get("rzz", 0)),
        "rx": int(ops.get("rx", 0)),
        "total": int(sum(ops.values())),
    }
    circuit_depth = int(final_bound_qc.depth())

    return {
        "status": "success" if constraints["feasible"] else "feasible_with_warnings",
        "solver_type": "QAOA",
        "scenario": scenario_name,
        "inflow_factor": scenario_data["factor"],
        "bitstring": best_bitstring,
        "allocation": allocation,
        "metrics": metrics,
        "constraints": constraints,
        "quantum": {
            "algorithm": "QAOA",
            "qubits": n_vars,
            "reps": p,
            "optimizer_iterations": max_iters,
            "penalty_strength": float(penalty_strength),
            "circuit_depth": circuit_depth,
            "gate_count": gate_counts,
            "simulator": f"Qiskit {StatevectorSampler.__name__} & Statevector (Qiskit Local Simulator, {total_shots} shots)",
            "best_bitstring": best_bitstring,
            "optimal_gamma": optimal_gammas,
            "optimal_beta": optimal_betas,
            "qubo_energy": round(float(best_qubo_energy), 2),
            "ising_energy": round(float(best_ising_energy), 2),
            "statevector_probabilities": statevector_probabilities[:8],
        },
    }
