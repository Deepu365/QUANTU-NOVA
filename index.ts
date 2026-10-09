export type ScenarioType = 'NORMAL SEASON' | 'DRY SEASON' | 'DROUGHT' | 'HIGH INFLOW';

export interface Reservoir {
  reservoir_id: string;
  name: string;
  current_storage: number; // in ML (Megaliters)
  maximum_capacity: number;
  minimum_safe_storage: number;
  current_inflow: number;
  expected_inflow: number;
  maximum_release: number;
  region: string;
}

export interface Canal {
  canal_id: string;
  name: string;
  connected_reservoir: string;
  capacity: number; // in ML
  current_flow: number;
  region: string;
  connected_crops: string[];
}

export interface Crop {
  crop_id: string;
  crop_name: string;
  water_requirement: number; // in ML
  minimum_water: number;
  maximum_water: number;
  priority: number; // 1 to 5 (5 highest)
  agricultural_benefit: number; // Economic / Yield index (points)
  region: string;
}

export interface DecodedCropAllocation {
  crop_id: string;
  crop_name: string;
  allocation_level: number; // 0: 40% survival, 1: 60% conservation, 2: 85% standard, 3: 100% optimal
  level_name: string;
  demand: number;
  allocated: number;
  fulfillment_pct: number;
  priority: number;
  benefit: number;
  region: string;
  canal_id: string;
}

export interface ConstraintValidationResult {
  feasible: boolean;
  violations: string[];
  warnings: string[];
  checks: {
    total_water_ok: boolean;
    total_water_allocated: number;
    total_water_available: number;
    reservoir_releases_ok: boolean;
    reservoir_safe_storage_ok: boolean;
    canal_capacities_ok: boolean;
    crop_min_water_ok: boolean;
    crop_max_water_ok: boolean;
  };
}

export interface OptimizationMetrics {
  objective_value: number;
  agricultural_benefit: number;
  water_utilization: number; // percentage (0-100)
  water_wastage: number; // percentage (0-100)
  unmet_demand: number; // ML
  allocated_water: number; // ML
  available_water: number; // ML
  unused_water: number; // ML
  equity_score: number; // 0-100
  conflict_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  runtime_ms: number;
}

export interface QuantumRunDetails {
  algorithm: 'QAOA';
  qubits: number;
  reps: number;
  optimizer_iterations: number;
  penalty_strength: number;
  circuit_depth: number;
  gate_count: {
    hadamard: number;
    rz: number;
    rzz: number;
    rx: number;
    total: number;
  };
  simulator: string;
  best_bitstring: string;
  optimal_gamma: number[];
  optimal_beta: number[];
  qubo_energy: number;
  statevector_probabilities: Array<{
    bitstring: string;
    probability: number;
    energy: number;
  }>;
}

export interface OptimizationResult {
  solver_type: 'QAOA' | 'CLASSICAL';
  status: 'success' | 'feasible_with_warnings' | 'infeasible';
  scenario: ScenarioType;
  inflow_factor: number;
  bitstring: string;
  allocation: DecodedCropAllocation[];
  metrics: OptimizationMetrics;
  constraints: ConstraintValidationResult;
  quantum?: QuantumRunDetails;
}

export interface BenchmarkComparison {
  scenario: ScenarioType;
  classical: OptimizationResult;
  qaoa: OptimizationResult;
  approximation_ratio: number; // qaoa_obj / classical_obj
  speedup_factor: number; // classical_runtime / qaoa_runtime
  fidelity_score: number; // 0-100 overlap
  timestamp: string;
}

export interface QuboTerm {
  i: number;
  j: number;
  weight: number;
  description: string;
}

export interface QuboModel {
  num_variables: number;
  variable_names: string[];
  linear_terms: number[];
  quadratic_terms: number[][]; // N x N matrix
  constant_offset: number;
  ising_h: number[];
  ising_J: number[][];
  ising_offset: number;
}
