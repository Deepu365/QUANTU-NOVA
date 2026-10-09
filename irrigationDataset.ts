import { Canal, Crop, Reservoir, ScenarioType } from '../types';

export const SCENARIO_INFLOW_FACTORS: Record<ScenarioType, number> = {
  'NORMAL SEASON': 1.0,
  'DRY SEASON': 0.75,
  'DROUGHT': 0.50,
  'HIGH INFLOW': 1.30,
};

export const TIME_PERIODS = [
  { id: 't1', name: 'Period 1: Sowing & Seedling', weight: 0.15, description: 'Early root establishment and seed germination' },
  { id: 't2', name: 'Period 2: Vegetative Growth', weight: 0.22, description: 'Canopy expansion and stem elongation' },
  { id: 't3', name: 'Period 3: Flowering & Booting', weight: 0.30, description: 'Peak moisture sensitivity and panicle development' },
  { id: 't4', name: 'Period 4: Grain / Boll Filling', weight: 0.20, description: 'Yield synthesis and moisture maintenance' },
  { id: 't5', name: 'Period 5: Maturation & Ripening', weight: 0.13, description: 'Terminal drying and harvest readiness' },
];

export const BASE_RESERVOIRS: Reservoir[] = [
  {
    reservoir_id: 'res-krishna-a',
    name: 'Krishna Reservoir A',
    current_storage: 4200,
    maximum_capacity: 5400,
    minimum_safe_storage: 1500,
    current_inflow: 780,
    expected_inflow: 850,
    maximum_release: 1200,
    region: 'Krishna Basin',
  },
  {
    reservoir_id: 'res-krishna-b',
    name: 'Krishna Reservoir B',
    current_storage: 5100,
    maximum_capacity: 6800,
    minimum_safe_storage: 1800,
    current_inflow: 920,
    expected_inflow: 960,
    maximum_release: 1400,
    region: 'Krishna Basin',
  },
  {
    reservoir_id: 'res-godavari-a',
    name: 'Godavari Reservoir A',
    current_storage: 5800,
    maximum_capacity: 7200,
    minimum_safe_storage: 2000,
    current_inflow: 1350,
    expected_inflow: 1400,
    maximum_release: 1800,
    region: 'Godavari Basin',
  },
];

export const BASE_CANALS: Canal[] = [
  {
    canal_id: 'canal-main-a',
    name: 'Main Canal A',
    connected_reservoir: 'res-krishna-a',
    capacity: 450,
    current_flow: 380,
    region: 'Krishna Delta / Rayalaseema',
    connected_crops: ['Rice', 'Cotton', 'Chilli'],
  },
  {
    canal_id: 'canal-main-b',
    name: 'Main Canal B',
    connected_reservoir: 'res-krishna-b',
    capacity: 400,
    current_flow: 320,
    region: 'Krishna Central Command',
    connected_crops: ['Cotton', 'Maize', 'Groundnut'],
  },
  {
    canal_id: 'canal-branch-c',
    name: 'Branch Canal C',
    connected_reservoir: 'res-godavari-a',
    capacity: 550,
    current_flow: 410,
    region: 'Godavari Eastern Delta',
    connected_crops: ['Rice', 'Sugarcane', 'Chilli'],
  },
  {
    canal_id: 'canal-branch-d',
    name: 'Branch Canal D',
    connected_reservoir: 'res-krishna-b',
    capacity: 300,
    current_flow: 210,
    region: 'Nalgonda-Guntur Border',
    connected_crops: ['Maize', 'Groundnut', 'Sugarcane'],
  },
];

export const BASE_CROPS: Crop[] = [
  {
    crop_id: 'c1',
    crop_name: 'Rice',
    water_requirement: 320,
    minimum_water: 160,
    maximum_water: 350,
    priority: 5,
    agricultural_benefit: 95,
    region: 'Krishna-Godavari Deltas',
  },
  {
    crop_id: 'c2',
    crop_name: 'Cotton',
    water_requirement: 240,
    minimum_water: 120,
    maximum_water: 260,
    priority: 4,
    agricultural_benefit: 80,
    region: 'Guntur / Kurnool Command',
  },
  {
    crop_id: 'c3',
    crop_name: 'Maize',
    water_requirement: 180,
    minimum_water: 90,
    maximum_water: 200,
    priority: 3,
    agricultural_benefit: 65,
    region: 'Central Krishna',
  },
  {
    crop_id: 'c4',
    crop_name: 'Groundnut',
    water_requirement: 140,
    minimum_water: 70,
    maximum_water: 160,
    priority: 3,
    agricultural_benefit: 60,
    region: 'Rayalaseema Uplands',
  },
  {
    crop_id: 'c5',
    crop_name: 'Sugarcane',
    water_requirement: 360,
    minimum_water: 200,
    maximum_water: 400,
    priority: 4,
    agricultural_benefit: 90,
    region: 'Godavari Delta',
  },
  {
    crop_id: 'c6',
    crop_name: 'Chilli',
    water_requirement: 160,
    minimum_water: 80,
    maximum_water: 180,
    priority: 4,
    agricultural_benefit: 85,
    region: 'Guntur Command',
  },
];

export const CROP_CANAL_PRIMARY_MAPPING: Record<string, string> = {
  c1: 'canal-branch-c', // Rice -> Branch Canal C (Godavari)
  c2: 'canal-main-a',   // Cotton -> Main Canal A
  c3: 'canal-main-b',   // Maize -> Main Canal B
  c4: 'canal-branch-d', // Groundnut -> Branch Canal D
  c5: 'canal-branch-c', // Sugarcane -> Branch Canal C
  c6: 'canal-main-a',   // Chilli -> Main Canal A
};

// Allocation tier percentages relative to crop water_requirement
export const ALLOCATION_TIERS = [
  { level: 0, fraction: 0.45, label: 'Emergency Survival (45%)' },
  { level: 1, fraction: 0.65, label: 'Deficit Conservation (65%)' },
  { level: 2, fraction: 0.85, label: 'Balanced Standard (85%)' },
  { level: 3, fraction: 1.00, label: 'Optimal Maximum (100%)' },
];

export function getScenarioDataset(scenario: ScenarioType) {
  const factor = SCENARIO_INFLOW_FACTORS[scenario];
  
  const reservoirs = BASE_RESERVOIRS.map((r) => {
    const expected_inflow = Math.round(r.expected_inflow * factor);
    const current_inflow = Math.round(r.current_inflow * factor);
    // Adjusted storage based on prolonged inflow effects
    const storage_adjustment = factor < 1.0 ? Math.round((1 - factor) * 800) : Math.round((factor - 1) * 600);
    const current_storage = factor < 1.0 
      ? Math.max(r.minimum_safe_storage + 200, r.current_storage - storage_adjustment)
      : Math.min(r.maximum_capacity, r.current_storage + storage_adjustment);
    
    return {
      ...r,
      current_inflow,
      expected_inflow,
      current_storage,
    };
  });

  const canals = BASE_CANALS.map((c) => {
    const current_flow = Math.round(c.current_flow * Math.min(1.2, factor));
    return {
      ...c,
      current_flow: Math.min(c.capacity, current_flow),
    };
  });

  return {
    scenario,
    inflow_factor: factor,
    reservoirs,
    canals,
    crops: BASE_CROPS,
  };
}
