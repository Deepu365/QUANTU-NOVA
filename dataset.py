"""
Synthetic Demonstration Dataset for Krishna-Godavari Command Areas
Note: "Synthetic demonstration data based on realistic irrigation assumptions. Not official government data."
"""

SCENARIOS = {
    "NORMAL SEASON": 1.0,
    "DRY SEASON": 0.75,
    "DROUGHT": 0.50,
    "HIGH INFLOW": 1.30,
}

TIME_PERIODS = [
    {"id": "t1", "name": "Period 1: Sowing & Seedling", "weight": 0.15, "description": "Early root establishment and seed germination"},
    {"id": "t2", "name": "Period 2: Vegetative Growth", "weight": 0.22, "description": "Canopy expansion and stem elongation"},
    {"id": "t3", "name": "Period 3: Flowering & Booting", "weight": 0.30, "description": "Peak moisture sensitivity and panicle development"},
    {"id": "t4", "name": "Period 4: Grain / Boll Filling", "weight": 0.20, "description": "Yield synthesis and moisture maintenance"},
    {"id": "t5", "name": "Period 5: Maturation & Ripening", "weight": 0.13, "description": "Terminal drying and harvest readiness"},
]

BASE_RESERVOIRS = [
    {
        "reservoir_id": "res-krishna-a",
        "name": "Krishna Reservoir A",
        "current_storage": 4200,
        "maximum_capacity": 5400,
        "minimum_safe_storage": 1500,
        "current_inflow": 780,
        "expected_inflow": 850,
        "maximum_release": 1200,
        "region": "Krishna Basin",
    },
    {
        "reservoir_id": "res-krishna-b",
        "name": "Krishna Reservoir B",
        "current_storage": 5100,
        "maximum_capacity": 6800,
        "minimum_safe_storage": 1800,
        "current_inflow": 920,
        "expected_inflow": 960,
        "maximum_release": 1400,
        "region": "Krishna Basin",
    },
    {
        "reservoir_id": "res-godavari-a",
        "name": "Godavari Reservoir A",
        "current_storage": 5800,
        "maximum_capacity": 7200,
        "minimum_safe_storage": 2000,
        "current_inflow": 1350,
        "expected_inflow": 1400,
        "maximum_release": 1800,
        "region": "Godavari Basin",
    },
]

BASE_CANALS = [
    {
        "canal_id": "canal-main-a",
        "name": "Main Canal A",
        "connected_reservoir": "res-krishna-a",
        "capacity": 450,
        "current_flow": 380,
        "region": "Krishna Delta / Rayalaseema",
        "connected_crops": ["Rice", "Cotton", "Chilli"],
    },
    {
        "canal_id": "canal-main-b",
        "name": "Main Canal B",
        "connected_reservoir": "res-krishna-b",
        "capacity": 400,
        "current_flow": 320,
        "region": "Krishna Central Command",
        "connected_crops": ["Cotton", "Maize", "Groundnut"],
    },
    {
        "canal_id": "canal-branch-c",
        "name": "Branch Canal C",
        "connected_reservoir": "res-godavari-a",
        "capacity": 550,
        "current_flow": 410,
        "region": "Godavari Eastern Delta",
        "connected_crops": ["Rice", "Sugarcane", "Chilli"],
    },
    {
        "canal_id": "canal-branch-d",
        "name": "Branch Canal D",
        "connected_reservoir": "res-krishna-b",
        "capacity": 300,
        "current_flow": 210,
        "region": "Nalgonda-Guntur Border",
        "connected_crops": ["Maize", "Groundnut", "Sugarcane"],
    },
]

BASE_CROPS = [
    {
        "crop_id": "c1",
        "crop_name": "Rice",
        "water_requirement": 320,
        "minimum_water": 160,
        "maximum_water": 350,
        "priority": 5,
        "agricultural_benefit": 95,
        "region": "Krishna-Godavari Deltas",
    },
    {
        "crop_id": "c2",
        "crop_name": "Cotton",
        "water_requirement": 240,
        "minimum_water": 120,
        "maximum_water": 260,
        "priority": 4,
        "agricultural_benefit": 80,
        "region": "Guntur / Kurnool Command",
    },
    {
        "crop_id": "c3",
        "crop_name": "Maize",
        "water_requirement": 180,
        "minimum_water": 90,
        "maximum_water": 200,
        "priority": 3,
        "agricultural_benefit": 65,
        "region": "Central Krishna",
    },
    {
        "crop_id": "c4",
        "crop_name": "Groundnut",
        "water_requirement": 140,
        "minimum_water": 70,
        "maximum_water": 160,
        "priority": 3,
        "agricultural_benefit": 60,
        "region": "Rayalaseema Uplands",
    },
    {
        "crop_id": "c5",
        "crop_name": "Sugarcane",
        "water_requirement": 360,
        "minimum_water": 195,
        "maximum_water": 400,
        "priority": 4,
        "agricultural_benefit": 90,
        "region": "Godavari Delta",
    },
    {
        "crop_id": "c6",
        "crop_name": "Chilli",
        "water_requirement": 160,
        "minimum_water": 80,
        "maximum_water": 180,
        "priority": 4,
        "agricultural_benefit": 85,
        "region": "Guntur Command",
    },
]

def compute_reservoir_usable_water(r: dict, factor: float = 1.0) -> float:
    """
    Computes usable irrigation water quota (ML) for the command area from a reservoir
    given its current storage above minimum safe storage and seasonal inflow.
    """
    active_storage = max(0.0, float(r["current_storage"]) - float(r["minimum_safe_storage"]))
    inflow_contrib = float(r["current_inflow"]) * 0.22 + float(r["expected_inflow"]) * 0.08
    usable = active_storage * 0.065 * (0.75 + 0.25 * factor) + inflow_contrib
    return float(min(float(r["maximum_release"]), max(0.0, usable)))

def get_scenario_data(scenario_name: str):
    factor = SCENARIOS.get(scenario_name, 1.0)
    reservoirs = []
    for r in BASE_RESERVOIRS:
        exp_inflow = round(r["expected_inflow"] * factor)
        cur_inflow = round(r["current_inflow"] * factor)
        adj = round((1.0 - factor) * 800) if factor < 1.0 else round((factor - 1.0) * 600)
        cur_storage = (
            max(r["minimum_safe_storage"] + 200, r["current_storage"] - adj)
            if factor < 1.0
            else min(r["maximum_capacity"], r["current_storage"] + adj)
        )
        r_copy = dict(r)
        r_copy["expected_inflow"] = exp_inflow
        r_copy["current_inflow"] = cur_inflow
        r_copy["current_storage"] = cur_storage
        r_copy["usable_water"] = round(compute_reservoir_usable_water(r_copy, factor))
        reservoirs.append(r_copy)

    canals = []
    for c in BASE_CANALS:
        c_copy = dict(c)
        c_copy["current_flow"] = min(c["capacity"], round(c["current_flow"] * min(1.2, factor)))
        canals.append(c_copy)

    total_available_water = sum(r["usable_water"] for r in reservoirs)

    return {
        "scenario": scenario_name,
        "factor": factor,
        "reservoirs": reservoirs,
        "canals": canals,
        "crops": BASE_CROPS,
        "time_periods": TIME_PERIODS,
        "total_available_water": total_available_water,
    }
