from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class OptimizeRequest(BaseModel):
    scenario: str = Field(default="NORMAL SEASON", description="NORMAL SEASON, DRY SEASON, DROUGHT, HIGH INFLOW")
    reps: int = Field(default=2, ge=1, le=5, description="QAOA depth p")
    optimizer_iterations: int = Field(default=30, ge=5, le=100, description="Classical optimizer max iterations")
    penalty_strength: float = Field(default=15.0, ge=1.0, le=100.0, description="Constraint penalty multiplier")

class ScenarioUpdateRequest(BaseModel):
    scenario: str

class CropAllocation(BaseModel):
    crop_id: str
    crop_name: str
    allocation_level: int
    level_name: str
    demand: int
    allocated: int
    fulfillment_pct: int
    priority: int
    benefit: int
    region: str
    canal_id: str
    period_allocations: Optional[Dict[str, float]] = None

class ConstraintValidation(BaseModel):
    feasible: bool = True
    violations: List[str] = []
    warnings: List[str] = []
    checks: Dict[str, Any] = {}

class OptimizationMetrics(BaseModel):
    objective_value: float
    agricultural_benefit: int
    water_utilization: int
    water_wastage: int
    unmet_demand: int
    allocated_water: int
    available_water: int
    unused_water: int
    equity_score: int
    conflict_risk: str
    runtime_ms: float

class StateProbability(BaseModel):
    bitstring: str
    probability: float
    energy: float

class QuantumDetails(BaseModel):
    algorithm: str = "QAOA"
    qubits: int = 12
    reps: int = 2
    optimizer_iterations: int = 30
    penalty_strength: float = 15.0
    circuit_depth: int
    gate_count: Dict[str, int]
    simulator: str
    best_bitstring: str
    optimal_gamma: List[float]
    optimal_beta: List[float]
    qubo_energy: float
    ising_energy: Optional[float] = None
    statevector_probabilities: List[StateProbability] = []

class OptimizationResponse(BaseModel):
    status: str
    solver_type: str
    scenario: str
    inflow_factor: float
    bitstring: str
    allocation: List[CropAllocation]
    metrics: OptimizationMetrics
    constraints: ConstraintValidation
    quantum: Optional[QuantumDetails] = None
    explanation: Optional[List[str]] = None
    benchmark_comparison: Optional[Dict[str, Any]] = None
