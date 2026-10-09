"""
Exact Classical Baseline Solver: Brute-Force Evaluator
Solves the exact same QUBO model across all 4,096 states.
"""
import time

try:
    from backend.dataset import get_scenario_data
    from backend.optimization_service import (
        build_qubo,
        decode_bitstring,
        validate_constraints,
        calculate_metrics,
        evaluate_qubo_energy,
    )
except ImportError:
    from dataset import get_scenario_data
    from optimization_service import (
        build_qubo,
        decode_bitstring,
        validate_constraints,
        calculate_metrics,
        evaluate_qubo_energy,
    )

def solve_classical(scenario_name: str, penalty_strength: float = 15.0):
    start = time.perf_counter()
    qubo = build_qubo(scenario_name, penalty_strength)
    n_vars = qubo["n_vars"]
    total_states = 1 << n_vars

    best_energy = float("inf")
    worst_energy = float("-inf")
    best_bitstring = "0" * n_vars

    for s in range(total_states):
        bs = format(s, f"0{n_vars}b")
        energy = evaluate_qubo_energy(bs, qubo)
        if energy < best_energy:
            best_energy = energy
            best_bitstring = bs
        if energy > worst_energy:
            worst_energy = energy

    runtime_ms = (time.perf_counter() - start) * 1000.0
    allocation = decode_bitstring(best_bitstring)
    constraints = validate_constraints(scenario_name, allocation)
    metrics = calculate_metrics(scenario_name, allocation, best_energy, runtime_ms)
    scenario_data = get_scenario_data(scenario_name)

    return {
        "status": "success" if constraints["feasible"] else "feasible_with_warnings",
        "solver_type": "CLASSICAL",
        "scenario": scenario_name,
        "inflow_factor": scenario_data["factor"],
        "bitstring": best_bitstring,
        "allocation": allocation,
        "metrics": metrics,
        "constraints": constraints,
        "worst_energy": round(float(worst_energy), 2),
    }
