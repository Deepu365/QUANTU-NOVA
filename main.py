"""
FastAPI Backend Entry Point for QuantumFlow (Qiskit Fall Fest 2026)
Single source of truth for QUBO construction, Ising conversion, Qiskit 2.x QAOA,
and Classical exact baseline benchmarking.
"""
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import qiskit

try:
    from backend.dataset import (
        get_scenario_data,
        SCENARIOS,
        BASE_CROPS,
        TIME_PERIODS,
    )
    from backend.models import OptimizeRequest, ScenarioUpdateRequest
    from backend.optimization_service import (
        build_qubo,
        generate_hydrological_explanation,
    )
    from backend.classical_solver import solve_classical
    from backend.qaoa_solver import solve_qaoa
except ImportError:
    from dataset import (
        get_scenario_data,
        SCENARIOS,
        BASE_CROPS,
        TIME_PERIODS,
    )
    from models import OptimizeRequest, ScenarioUpdateRequest
    from optimization_service import (
        build_qubo,
        generate_hydrological_explanation,
    )
    from classical_solver import solve_classical
    from qaoa_solver import solve_qaoa

app = FastAPI(
    title="QuantumFlow API",
    description="QAOA-Based Irrigation and Water-Resource Allocation Optimisation (Qiskit 2.x)",
    version="2.0.0",
)

# CORS setup for local development and production Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

current_scenario = "NORMAL SEASON"

def compute_benchmark(
    scenario_name: str,
    reps: int = 2,
    optimizer_iterations: int = 30,
    penalty_strength: float = 15.0,
):
    classical_res = solve_classical(scenario_name, penalty_strength)
    qaoa_res = solve_qaoa(
        scenario_name,
        reps=reps,
        optimizer_iterations=optimizer_iterations,
        penalty_strength=penalty_strength,
    )

    # Normalized QUBO objective approximation ratio:
    # r = (E_worst - E_qaoa) / (E_worst - E_classical) in [0, 1]
    e_min = classical_res["metrics"]["objective_value"]
    e_max = classical_res.get("worst_energy", e_min + 100.0)
    e_qaoa = qaoa_res["metrics"]["objective_value"]

    if abs(e_max - e_min) > 1e-9:
        approx_ratio = (e_max - e_qaoa) / (e_max - e_min)
        approx_ratio = round(max(0.0, min(1.0, approx_ratio)), 3)
    else:
        approx_ratio = 1.0

    c_time = classical_res["metrics"]["runtime_ms"]
    q_time = qaoa_res["metrics"]["runtime_ms"]
    speedup_factor = round(c_time / q_time, 3) if q_time > 0 else 1.0

    # Actual bitwise agreement between QAOA bitstring and Classical optimal bitstring
    c_bs = classical_res["bitstring"]
    q_bs = qaoa_res["bitstring"]
    n_bits = len(c_bs)
    matching_bits = sum(1 for a, b in zip(c_bs, q_bs) if a == b)
    fidelity_score = round((matching_bits / n_bits) * 100) if n_bits > 0 else 100

    return {
        "scenario": scenario_name,
        "classical": classical_res,
        "qaoa": qaoa_res,
        "approximation_ratio": approx_ratio,
        "speedup_factor": speedup_factor,
        "fidelity_score": fidelity_score,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

# Pre-compute initial benchmark on startup
current_benchmark = compute_benchmark(current_scenario, reps=2, optimizer_iterations=25, penalty_strength=15.0)

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "QuantumFlow FastAPI + Qiskit Backend",
        "engine_version": f"Qiskit {qiskit.__version__} QAOA Local Simulator",
        "quantum_ready": True,
    }

@app.get("/api/overview")
def get_overview():
    data = get_scenario_data(current_scenario)
    total_storage = sum(r["current_storage"] for r in data["reservoirs"])
    total_capacity = sum(r["maximum_capacity"] for r in data["reservoirs"])
    total_inflow = sum(r["expected_inflow"] for r in data["reservoirs"])
    total_crop_demand = sum(c["water_requirement"] for c in BASE_CROPS)

    return {
        "project": "QuantumFlow",
        "full_title": "QuantumFlow: QAOA-Based Irrigation and Water-Resource Allocation Optimisation",
        "hackathon": "Qiskit Fall Fest 2026",
        "use_case": "Use Case 03 — Irrigation and Water-Resource Allocation Optimisation",
        "tagline": "Optimizing Every Drop with Quantum Intelligence",
        "secondary_tagline": "Quantum-assisted decision support for equitable and efficient irrigation water allocation.",
        "disclaimer": "A prototype decision-support concept using synthetic demonstration data.",
        "region": "Andhra Pradesh & Krishna-Godavari Command Areas",
        "current_scenario": current_scenario,
        "kpis": {
            "total_storage_ml": total_storage,
            "total_capacity_ml": total_capacity,
            "storage_percent": round((total_storage / total_capacity) * 100),
            "total_inflow_ml": total_inflow,
            "total_crop_demand_ml": total_crop_demand,
            "num_reservoirs": len(data["reservoirs"]),
            "num_canals": len(data["canals"]),
            "num_crops": len(BASE_CROPS),
            "qubits_used": 12,
        },
        "latest_metrics": current_benchmark["qaoa"]["metrics"],
    }

@app.get("/api/reservoirs")
def get_reservoirs():
    data = get_scenario_data(current_scenario)
    return {
        "scenario": current_scenario,
        "inflow_factor": data["factor"],
        "reservoirs": data["reservoirs"],
        "total_available_water": data["total_available_water"],
    }

@app.get("/api/canals")
def get_canals():
    data = get_scenario_data(current_scenario)
    return {
        "scenario": current_scenario,
        "canals": data["canals"],
    }

@app.get("/api/crops")
def get_crops():
    return {
        "crops": BASE_CROPS,
        "time_periods": TIME_PERIODS,
    }

@app.get("/api/scenarios")
def get_scenarios():
    return {
        "current_scenario": current_scenario,
        "available_scenarios": [
            {
                "id": "NORMAL SEASON",
                "name": "Normal Season",
                "factor": 1.0,
                "description": "Standard baseline precipitation and baseline reservoir storage.",
            },
            {
                "id": "DRY SEASON",
                "name": "Dry Season",
                "factor": 0.75,
                "description": "Moderate water deficit requiring careful conservation quotas.",
            },
            {
                "id": "DROUGHT",
                "name": "Drought",
                "factor": 0.5,
                "description": "Severe deficit scenario testing strict prioritization and conflict mitigation.",
            },
            {
                "id": "HIGH INFLOW",
                "name": "High Inflow",
                "factor": 1.3,
                "description": "Monsoon surge providing excess volume for tail-end recharge and full irrigation.",
            },
        ],
    }

@app.post("/api/scenario")
def set_scenario(req: ScenarioUpdateRequest):
    global current_scenario, current_benchmark
    if req.scenario not in SCENARIOS:
        raise HTTPException(status_code=400, detail="Invalid scenario provided.")

    current_scenario = req.scenario
    current_benchmark = compute_benchmark(
        current_scenario,
        reps=2,
        optimizer_iterations=25,
        penalty_strength=15.0,
    )

    return {
        "success": True,
        "scenario": current_scenario,
        "benchmark": current_benchmark,
        "message": f"Scenario updated to {current_scenario}. Inflow factor applied: {int(SCENARIOS[current_scenario] * 100)}%.",
    }

@app.post("/api/optimize/classical")
def optimize_classical(req: OptimizeRequest):
    scenario = req.scenario if req.scenario in SCENARIOS else current_scenario
    return solve_classical(scenario, req.penalty_strength)

@app.post("/api/optimize/qaoa")
def optimize_qaoa(req: OptimizeRequest):
    global current_scenario, current_benchmark
    scenario = req.scenario if req.scenario in SCENARIOS else current_scenario
    current_scenario = scenario

    benchmark = compute_benchmark(
        scenario,
        reps=req.reps,
        optimizer_iterations=req.optimizer_iterations,
        penalty_strength=req.penalty_strength,
    )
    current_benchmark = benchmark
    qaoa_res = benchmark["qaoa"]
    explanations = generate_hydrological_explanation(qaoa_res)

    return {
        **qaoa_res,
        "explanation": explanations,
        "benchmark_comparison": benchmark,
    }

@app.get("/api/results")
def get_latest_results():
    return {
        "status": "success",
        "scenario": current_scenario,
        "benchmark": current_benchmark,
        "explanation": generate_hydrological_explanation(current_benchmark["qaoa"]),
    }

@app.get("/api/quantum/circuit")
def get_quantum_circuit_info():
    qubo = build_qubo(current_scenario, 15.0)
    qaoa_quantum = current_benchmark["qaoa"].get("quantum", {})

    return {
        "num_qubits": 12,
        "reps": qaoa_quantum.get("reps", 2),
        "circuit_depth": qaoa_quantum.get("circuit_depth", 33),
        "gate_count": qaoa_quantum.get("gate_count", {}),
        "simulator": qaoa_quantum.get("simulator", "Qiskit StatevectorSampler"),
        "ising_h": [round(float(x), 4) for x in qubo["h"]],
        "ising_offset": round(float(qubo["offset"]), 4),
        "optimal_gamma": qaoa_quantum.get("optimal_gamma", []),
        "optimal_beta": qaoa_quantum.get("optimal_beta", []),
        "ansatz_structure": [
            {"step": 1, "name": "Hadamard Layer", "description": "Creates equal superposition |+>^12 on all 12 crop decision qubits"},
            {"step": 2, "name": "Problem Hamiltonian U(C, gamma)", "description": "Applies RZZ and RZ phase separation from the Qiskit SparsePauliOp Ising Hamiltonian"},
            {"step": 3, "name": "Mixer Hamiltonian U(B, beta)", "description": "Applies transverse field rotation RX(2*beta) across all 12 qubits"},
            {"step": 4, "name": "Measurement & StatevectorSampler", "description": "Measures computational Z-basis probabilities using Qiskit StatevectorSampler (4096 shots)"},
        ],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
