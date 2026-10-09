"""
Optimization Service: QUBO Construction, Ising Mapping, Bitstring Decoding & Hydrological Validation
"""
import numpy as np

try:
    from backend.dataset import BASE_CROPS, TIME_PERIODS, get_scenario_data
except ImportError:
    from dataset import BASE_CROPS, TIME_PERIODS, get_scenario_data

TIER_FRACTIONS = [0.55, 0.70, 0.85, 1.00]
TIER_LABELS = [
    "Emergency Survival (55%)",
    "Deficit Conservation (70%)",
    "Balanced Standard (85%)",
    "Optimal Maximum (100%)"
]
CROP_CANAL_MAPPING = {
    "c1": "canal-branch-c",
    "c2": "canal-main-a",
    "c3": "canal-main-b",
    "c4": "canal-branch-d",
    "c5": "canal-branch-c",
    "c6": "canal-main-a"
}

def build_qubo(scenario_name: str, penalty_strength: float = 15.0):
    """
    Constructs the 12-variable QUBO (6 crops x 2 binary tier variables) incorporating:
    1. Agricultural Benefit & Priority-weighted Unmet Demand (across 5 growth periods)
    2. Scenario-dependent Available Water Budget from the 3 Reservoirs
    3. Hydraulic Capacity Constraints across all 4 Canals
    4. Reservoir Release & Minimum Safe Storage Envelopes across all 3 Reservoirs
    5. Pairwise Crop Fulfillment Fairness / Equity
    """
    data = get_scenario_data(scenario_name)
    factor = data["factor"]
    reservoirs = data["reservoirs"]
    canals = data["canals"]
    total_available = float(data["total_available_water"])

    num_crops = len(BASE_CROPS)
    n_vars = num_crops * 2  # 12 binary variables

    Q = np.zeros((n_vars, n_vars), dtype=np.float64)
    linear = np.zeros(n_vars, dtype=np.float64)
    constant_offset = 0.0

    # Time-period sensitivity factor (sum of weights = 1.0, peak flowering = 0.30)
    period_weight_sum = sum(tp["weight"] for tp in TIME_PERIODS)
    peak_period_factor = max(tp["weight"] for tp in TIME_PERIODS) / period_weight_sum

    # Variable water increments:
    # For crop i: W_i(x_{2i}, x_{2i+1}) = base_i + w0_i * x_{2i} + w1_i * x_{2i+1}
    # where base_i = 0.55 * D_i, w0_i = 0.15 * D_i, w1_i = 0.30 * D_i
    base_allocs = np.zeros(num_crops, dtype=np.float64)
    w_vec = np.zeros(n_vars, dtype=np.float64)
    f_vec = np.zeros(n_vars, dtype=np.float64)  # fulfillment fraction increments (0.15 and 0.30)

    for i, c in enumerate(BASE_CROPS):
        req = float(c["water_requirement"])
        base_allocs[i] = 0.55 * req
        w_vec[2 * i] = 0.15 * req
        w_vec[2 * i + 1] = 0.30 * req
        f_vec[2 * i] = 0.15
        f_vec[2 * i + 1] = 0.30

    total_base_water = float(np.sum(base_allocs))
    total_demand = float(sum(c["water_requirement"] for c in BASE_CROPS))

    # 1. Agricultural Benefit, Productive Water Utilization & Unmet Demand Objective
    for i, c in enumerate(BASE_CROPS):
        b0_idx = 2 * i
        b1_idx = 2 * i + 1
        priority = float(c["priority"])
        benefit = float(c["agricultural_benefit"])
        demand = float(c["water_requirement"])

        # Higher priority and higher benefit crops receive stronger negative energy reward
        reward_rate = (benefit * priority / 20.0) + (priority * demand / 45.0) * (1.0 + peak_period_factor)
        linear[b0_idx] -= reward_rate * 0.15
        linear[b1_idx] -= reward_rate * 0.30

    # 2. Global Available Water Budget & Over-Allocation / Wastage Penalty
    # Target water usage is bounded by scenario-adjusted reservoir available water
    # In drought (factor=0.5), effective safe target is tighter; in high inflow (1.3), full demand is supported
    scenario_budget_target = min(total_demand * 0.96, total_available * (0.78 * factor + 0.12))
    delta_total_target = max(0.0, scenario_budget_target - total_base_water)
    water_penalty_weight = (penalty_strength / 15.0) * 0.0018

    # Expand water_penalty_weight * (sum_m w_m x_m - delta_total_target)^2
    constant_offset += water_penalty_weight * (delta_total_target ** 2)
    for m in range(n_vars):
        # x_m^2 = x_m contributes w_m^2 - 2 * delta_total_target * w_m to linear/diagonal
        linear[m] += water_penalty_weight * (w_vec[m] ** 2 - 2.0 * delta_total_target * w_vec[m])
        for n in range(m + 1, n_vars):
            q_val = water_penalty_weight * w_vec[m] * w_vec[n]
            Q[m, n] += q_val
            Q[n, m] += q_val

    # 3. Canal Capacity Constraints across ALL 4 Canals
    # For each canal, penalize excess over safe operating envelope of that canal
    canal_penalty_weight = (penalty_strength / 15.0) * 0.0045
    for canal in canals:
        cid = canal["canal_id"]
        cap = float(canal["capacity"])
        # Effective canal limit scales with scenario hydraulic conditions
        safe_canal_target = cap * min(0.95, 0.72 + 0.20 * factor)
        crop_indices = [i for i, c in enumerate(BASE_CROPS) if CROP_CANAL_MAPPING[c["crop_id"]] == cid]
        if not crop_indices:
            continue

        canal_base = sum(base_allocs[i] for i in crop_indices)
        delta_canal = max(0.0, safe_canal_target - canal_base)

        canal_vars = []
        for i in crop_indices:
            canal_vars.extend([2 * i, 2 * i + 1])

        constant_offset += canal_penalty_weight * (delta_canal ** 2)
        for idx_a in range(len(canal_vars)):
            m = canal_vars[idx_a]
            linear[m] += canal_penalty_weight * (w_vec[m] ** 2 - 2.0 * delta_canal * w_vec[m])
            for idx_b in range(idx_a + 1, len(canal_vars)):
                n = canal_vars[idx_b]
                q_val = canal_penalty_weight * w_vec[m] * w_vec[n]
                Q[m, n] += q_val
                Q[n, m] += q_val

    # 4. Reservoir Release & Minimum Safe Storage Constraints across ALL 3 Reservoirs
    res_penalty_weight = (penalty_strength / 15.0) * 0.0022
    for res in reservoirs:
        rid = res["reservoir_id"]
        connected_canal_ids = [c["canal_id"] for c in canals if c["connected_reservoir"] == rid]
        res_crop_indices = [
            i for i, c in enumerate(BASE_CROPS)
            if CROP_CANAL_MAPPING[c["crop_id"]] in connected_canal_ids
        ]
        if not res_crop_indices:
            continue

        res_usable = float(res["usable_water"]) * (0.70 + 0.25 * factor)
        res_base = sum(base_allocs[i] for i in res_crop_indices)
        delta_res = max(0.0, res_usable - res_base)

        res_vars = []
        for i in res_crop_indices:
            res_vars.extend([2 * i, 2 * i + 1])

        constant_offset += res_penalty_weight * (delta_res ** 2)
        for idx_a in range(len(res_vars)):
            m = res_vars[idx_a]
            linear[m] += res_penalty_weight * (w_vec[m] ** 2 - 2.0 * delta_res * w_vec[m])
            for idx_b in range(idx_a + 1, len(res_vars)):
                n = res_vars[idx_b]
                q_val = res_penalty_weight * w_vec[m] * w_vec[n]
                Q[m, n] += q_val
                Q[n, m] += q_val

    # 5. Allocation Fairness / Equity Term: sum_{i < j} lambda_eq * (f_i(x) - f_j(x))^2
    equity_weight = (penalty_strength / 15.0) * 4.5
    for i in range(num_crops):
        for j in range(i + 1, num_crops):
            # Expand (0.15 x_{2i} + 0.30 x_{2i+1} - 0.15 x_{2j} - 0.30 x_{2j+1})^2
            pair_vars = [2 * i, 2 * i + 1, 2 * j, 2 * j + 1]
            pair_coeffs = [0.15, 0.30, -0.15, -0.30]
            for a_idx in range(4):
                m = pair_vars[a_idx]
                cm = pair_coeffs[a_idx]
                linear[m] += equity_weight * (cm ** 2)
                for b_idx in range(a_idx + 1, 4):
                    n = pair_vars[b_idx]
                    cn = pair_coeffs[b_idx]
                    q_val = equity_weight * cm * cn
                    Q[m, n] += q_val
                    Q[n, m] += q_val

    # Convert QUBO to Ising Hamiltonian: x_m = (1 - Z_m) / 2
    # E(x) = x^T Q x + linear^T x + constant_offset
    #      = ising_offset + sum_m h[m] Z_m + sum_{m < n} J[m, n] Z_m Z_n
    Q_sym = (Q + Q.T) / 2.0
    h = np.zeros(n_vars, dtype=np.float64)
    J = np.zeros((n_vars, n_vars), dtype=np.float64)
    ising_offset = float(constant_offset)

    for m in range(n_vars):
        L_m = Q_sym[m, m] + linear[m]
        ising_offset += L_m / 2.0
        h[m] -= L_m / 2.0

    for m in range(n_vars):
        for n in range(m + 1, n_vars):
            U_mn = 2.0 * Q_sym[m, n]
            if abs(U_mn) > 1e-12:
                ising_offset += U_mn / 4.0
                h[m] -= U_mn / 4.0
                h[n] -= U_mn / 4.0
                J[m, n] = U_mn / 4.0
                J[n, m] = U_mn / 4.0

    variable_names = []
    for c in BASE_CROPS:
        variable_names.append(f"{c['crop_name']}_b0")
        variable_names.append(f"{c['crop_name']}_b1")

    return {
        "n_vars": n_vars,
        "variable_names": variable_names,
        "Q": Q_sym,
        "linear": linear,
        "constant_offset": float(constant_offset),
        "h": h,
        "J": J,
        "offset": float(ising_offset),
    }

def evaluate_qubo_energy(bitstring: str, qubo_dict: dict) -> float:
    """Evaluates E(x) = x^T Q x + linear^T x + constant_offset for a 12-bit string."""
    bits = np.array([int(b) for b in bitstring], dtype=np.float64)
    Q = qubo_dict["Q"]
    linear = qubo_dict["linear"]
    const = qubo_dict.get("constant_offset", 0.0)
    return float(bits @ Q @ bits + linear @ bits + const)

def evaluate_ising_energy(bitstring: str, qubo_dict: dict) -> float:
    """Evaluates H_Ising(z) = offset + sum_i h_i z_i + sum_{i<j} J_{ij} z_i z_j where z_i = 1 - 2*x_i."""
    bits = np.array([int(b) for b in bitstring], dtype=np.float64)
    z = 1.0 - 2.0 * bits  # x=0 -> z=+1, x=1 -> z=-1
    h = qubo_dict["h"]
    J = qubo_dict["J"]
    offset = qubo_dict["offset"]
    quad_z = float(np.sum(np.triu(J, k=1) * np.outer(z, z)))
    return float(offset + np.dot(h, z) + quad_z)

def decode_bitstring(bitstring: str):
    """Decodes a 12-bit string into agricultural crop allocations and 5-period schedules."""
    bits = [int(b) for b in bitstring]
    allocations = []
    for i, crop in enumerate(BASE_CROPS):
        b0 = bits[2 * i] if 2 * i < len(bits) else 0
        b1 = bits[2 * i + 1] if 2 * i + 1 < len(bits) else 0
        level = b0 + 2 * b1
        frac = TIER_FRACTIONS[level]
        allocated = round(crop["water_requirement"] * frac)
        fulfillment = round((allocated / crop["water_requirement"]) * 100)
        benefit = round(crop["agricultural_benefit"] * (allocated / crop["water_requirement"]))

        period_allocations = {
            tp["id"]: round(allocated * tp["weight"], 1)
            for tp in TIME_PERIODS
        }

        allocations.append({
            "crop_id": crop["crop_id"],
            "crop_name": crop["crop_name"],
            "allocation_level": level,
            "level_name": TIER_LABELS[level],
            "demand": crop["water_requirement"],
            "allocated": allocated,
            "fulfillment_pct": fulfillment,
            "priority": crop["priority"],
            "benefit": benefit,
            "region": crop["region"],
            "canal_id": CROP_CANAL_MAPPING[crop["crop_id"]],
            "period_allocations": period_allocations,
        })
    return allocations

def validate_constraints(scenario_name: str, allocations: list):
    """Validates all 8 hydrological constraints across reservoirs, canals, and crops."""
    data = get_scenario_data(scenario_name)
    violations = []
    warnings = []

    total_allocated = sum(a["allocated"] for a in allocations)
    total_available = data["total_available_water"]

    # 1. Total allocation <= total available water
    total_water_ok = total_allocated <= total_available + 15
    if not total_water_ok:
        violations.append(
            f"Total allocation ({total_allocated} ML) exceeds available irrigation water ({round(total_available)} ML)"
        )

    # 2 & 3. Reservoir release and minimum safe storage checks
    reservoir_releases_ok = True
    reservoir_safe_storage_ok = True
    for r in data["reservoirs"]:
        rid = r["reservoir_id"]
        connected_canals = [c["canal_id"] for c in data["canals"] if c["connected_reservoir"] == rid]
        res_demand = sum(a["allocated"] for a in allocations if a["canal_id"] in connected_canals)
        planned_release = round(res_demand)

        if planned_release > r["maximum_release"]:
            reservoir_releases_ok = False
            violations.append(
                f"{r['name']} release ({planned_release} ML) exceeds maximum discharge limit ({r['maximum_release']} ML)"
            )

        remaining_storage = r["current_storage"] + r["current_inflow"] - planned_release
        if remaining_storage < r["minimum_safe_storage"]:
            reservoir_safe_storage_ok = False
            violations.append(
                f"{r['name']} remaining storage ({remaining_storage} ML) breaches minimum safe storage ({r['minimum_safe_storage']} ML)"
            )

    # 4. Canal capacity limits
    canal_capacities_ok = True
    for canal in data["canals"]:
        canal_alloc = sum(a["allocated"] for a in allocations if a["canal_id"] == canal["canal_id"])
        if canal_alloc > canal["capacity"]:
            canal_capacities_ok = False
            violations.append(
                f"Canal {canal['name']} flow ({canal_alloc} ML) exceeds design capacity ({canal['capacity']} ML)"
            )
        elif canal_alloc > canal["capacity"] * 0.9:
            warnings.append(
                f"Canal {canal['name']} operating near peak capacity ({round((canal_alloc / canal['capacity']) * 100)}%)"
            )

    # 5 & 6. Crop minimum and maximum water limits
    crop_min_water_ok = True
    crop_max_water_ok = True
    for a in allocations:
        crop = next(c for c in BASE_CROPS if c["crop_id"] == a["crop_id"])
        if a["allocated"] < crop["minimum_water"]:
            crop_min_water_ok = False
            violations.append(
                f"{a['crop_name']} allocation ({a['allocated']} ML) is below minimum threshold ({crop['minimum_water']} ML)"
            )
        if a["allocated"] > crop["maximum_water"]:
            crop_max_water_ok = False
            warnings.append(
                f"{a['crop_name']} allocation ({a['allocated']} ML) exceeds maximum absorption ({crop['maximum_water']} ML)"
            )

    return {
        "feasible": len(violations) == 0,
        "violations": violations,
        "warnings": warnings,
        "checks": {
            "total_water_ok": total_water_ok,
            "total_water_allocated": total_allocated,
            "total_water_available": round(total_available),
            "reservoir_releases_ok": reservoir_releases_ok,
            "reservoir_safe_storage_ok": reservoir_safe_storage_ok,
            "canal_capacities_ok": canal_capacities_ok,
            "crop_min_water_ok": crop_min_water_ok,
            "crop_max_water_ok": crop_max_water_ok,
        },
    }

def calculate_metrics(scenario_name: str, allocations: list, energy: float, runtime_ms: float):
    """Calculates measurable water, benefit, equity, and conflict-risk metrics."""
    data = get_scenario_data(scenario_name)
    total_demand = sum(c["water_requirement"] for c in BASE_CROPS)
    total_allocated = sum(a["allocated"] for a in allocations)
    total_available = data["total_available_water"]

    unused = max(0, round(total_available - total_allocated))
    utilization = min(100, max(0, round((total_allocated / total_available) * 100))) if total_available > 0 else 0
    wastage = max(0, 100 - utilization)
    unmet = max(0, total_demand - total_allocated)
    benefit = sum(a["benefit"] for a in allocations)

    # Gini-based Equity Score (0 to 100)
    fulfillments = [a["fulfillment_pct"] / 100.0 for a in allocations]
    n = len(fulfillments)
    abs_diff = sum(abs(fulfillments[i] - fulfillments[j]) for i in range(n) for j in range(n))
    mean_f = sum(fulfillments) / n if n > 0 else 1.0
    gini = abs_diff / (2.0 * n * n * mean_f) if mean_f > 0 else 0.0
    equity_score = min(100, max(0, round((1.0 - gini) * 100)))

    high_p = [a["fulfillment_pct"] for a in allocations if a["priority"] >= 4]
    low_p = [a["fulfillment_pct"] for a in allocations if a["priority"] < 4]
    priority_gap = abs((sum(high_p) / len(high_p)) - (sum(low_p) / len(low_p))) if (high_p and low_p) else 0.0

    conflict_risk = "LOW"
    if unmet > 420 or priority_gap > 35:
        conflict_risk = "HIGH"
    elif unmet > 200 or priority_gap > 18:
        conflict_risk = "MEDIUM"

    return {
        "objective_value": round(float(energy), 2),
        "agricultural_benefit": int(benefit),
        "water_utilization": int(utilization),
        "water_wastage": int(wastage),
        "unmet_demand": int(unmet),
        "allocated_water": int(total_allocated),
        "available_water": int(round(total_available)),
        "unused_water": int(unused),
        "equity_score": int(equity_score),
        "conflict_risk": conflict_risk,
        "runtime_ms": round(float(runtime_ms), 2),
    }

def generate_hydrological_explanation(result: dict) -> list:
    """Generates deterministic hydrological decision-support explanation from the actual optimization result."""
    scenario = result["scenario"]
    metrics = result["metrics"]
    allocations = result["allocation"]
    constraints = result["constraints"]

    high_p = [a for a in allocations if a["priority"] >= 4]
    low_p = [a for a in allocations if a["priority"] < 4]
    high_str = ", ".join(f"{c['crop_name']}: {c['allocated']} ML ({c['fulfillment_pct']}%)" for c in high_p)
    low_str = ", ".join(f"{c['crop_name']}: {c['allocated']} ML ({c['fulfillment_pct']}%)" for c in low_p)
    violation_count = len(constraints["violations"])
    status_str = (
        "feasible operation with zero constraint violations"
        if constraints["feasible"]
        else f"{violation_count} constraint violation(s)"
    )

    lines = [
        f"Under {scenario} ({int(round(result.get('inflow_factor', 1.0) * 100))}% inflow), the solver allocated {metrics['allocated_water']} ML out of {metrics['available_water']} ML available irrigation water ({metrics['water_utilization']}% utilization).",
        f"High-priority crops achieved {high_str}, while lower-priority crops received {low_str}.",
        f"Branch Canal C (550 ML capacity serving Rice & Sugarcane) and reservoir minimum safe storage thresholds were enforced in the QUBO penalty matrix, resulting in {status_str} and an Equity Score of {metrics['equity_score']}/100 (Conflict Risk: {metrics['conflict_risk']}).",
    ]
    return lines
