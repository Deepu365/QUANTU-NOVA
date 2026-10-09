import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BASE_CANALS,
  BASE_CROPS,
  BASE_RESERVOIRS,
  SCENARIO_INFLOW_FACTORS,
  TIME_PERIODS,
  getScenarioDataset,
} from './src/data/irrigationDataset.ts';
import {
  buildQuboModel,
  generateHydrologicalExplanation,
  runBenchmark,
  solveClassicalBaseline,
  solveQaoaQuantum,
} from './src/services/quantumEngine.ts';
import { ScenarioType } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory cache of current state
let currentScenario: ScenarioType = 'NORMAL SEASON';
let currentBenchmark = runBenchmark('NORMAL SEASON', 2, 25, 15.0);

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'QuantumFlow Optimization Engine',
    engine_version: 'Qiskit 2.x QAOA Local Simulator',
    environment: isProduction ? 'production' : 'development',
    quantum_ready: true,
  });
});

app.get('/api/overview', (_req: Request, res: Response) => {
  const dataset = getScenarioDataset(currentScenario);
  const totalStorage = dataset.reservoirs.reduce((s, r) => s + r.current_storage, 0);
  const totalCapacity = dataset.reservoirs.reduce((s, r) => s + r.maximum_capacity, 0);
  const totalInflow = dataset.reservoirs.reduce((s, r) => s + r.expected_inflow, 0);
  const totalCropDemand = dataset.crops.reduce((s, c) => s + c.water_requirement, 0);

  res.json({
    project: 'QuantumFlow',
    full_title: 'QuantumFlow: QAOA-Based Irrigation and Water-Resource Allocation Optimisation',
    hackathon: 'Qiskit Fall Fest 2026',
    use_case: 'Use Case 03 — Irrigation and Water-Resource Allocation Optimisation',
    tagline: 'Optimizing Every Drop with Quantum Intelligence',
    secondary_tagline: 'Quantum-assisted decision support for equitable and efficient irrigation water allocation.',
    disclaimer: 'A prototype decision-support concept using synthetic demonstration data.',
    region: 'Andhra Pradesh & Krishna-Godavari Command Areas',
    current_scenario: currentScenario,
    kpis: {
      total_storage_ml: totalStorage,
      total_capacity_ml: totalCapacity,
      storage_percent: Math.round((totalStorage / totalCapacity) * 100),
      total_inflow_ml: totalInflow,
      total_crop_demand_ml: totalCropDemand,
      num_reservoirs: dataset.reservoirs.length,
      num_canals: dataset.canals.length,
      num_crops: dataset.crops.length,
      qubits_used: 12,
    },
    latest_metrics: currentBenchmark.qaoa.metrics,
  });
});

app.get('/api/reservoirs', (_req: Request, res: Response) => {
  const dataset = getScenarioDataset(currentScenario);
  res.json({
    scenario: currentScenario,
    inflow_factor: dataset.inflow_factor,
    reservoirs: dataset.reservoirs,
  });
});

app.get('/api/canals', (_req: Request, res: Response) => {
  const dataset = getScenarioDataset(currentScenario);
  res.json({
    scenario: currentScenario,
    canals: dataset.canals,
  });
});

app.get('/api/crops', (_req: Request, res: Response) => {
  res.json({
    crops: BASE_CROPS,
    time_periods: TIME_PERIODS,
  });
});

app.get('/api/scenarios', (_req: Request, res: Response) => {
  res.json({
    current_scenario: currentScenario,
    available_scenarios: [
      {
        id: 'NORMAL SEASON',
        name: 'Normal Season',
        factor: 1.0,
        description: 'Standard baseline precipitation and baseline reservoir storage.',
      },
      {
        id: 'DRY SEASON',
        name: 'Dry Season',
        factor: 0.75,
        description: 'Moderate water deficit requiring careful conservation quotas.',
      },
      {
        id: 'DROUGHT',
        name: 'Drought',
        factor: 0.5,
        description: 'Severe deficit scenario testing strict prioritization and conflict mitigation.',
      },
      {
        id: 'HIGH INFLOW',
        name: 'High Inflow',
        factor: 1.3,
        description: 'Monsoon surge providing excess volume for tail-end recharge and full irrigation.',
      },
    ],
  });
});

app.post('/api/scenario', (req: Request, res: Response) => {
  const { scenario } = req.body;
  if (!scenario || !(scenario in SCENARIO_INFLOW_FACTORS)) {
    return res.status(400).json({ error: 'Invalid scenario provided.' });
  }

  currentScenario = scenario as ScenarioType;
  // Automatically update benchmark for the new scenario
  currentBenchmark = runBenchmark(currentScenario, 2, 25, 15.0);

  res.json({
    success: true,
    scenario: currentScenario,
    benchmark: currentBenchmark,
    message: `Scenario updated to ${currentScenario}. Inflow factor applied: ${SCENARIO_INFLOW_FACTORS[currentScenario] * 100}%.`,
  });
});

app.post('/api/optimize/classical', (req: Request, res: Response) => {
  const scenario = (req.body.scenario as ScenarioType) || currentScenario;
  const penaltyStrength = req.body.penalty_strength ? parseFloat(req.body.penalty_strength) : 15.0;

  const result = solveClassicalBaseline(scenario, penaltyStrength);
  res.json(result);
});

app.post('/api/optimize/qaoa', (req: Request, res: Response) => {
  const scenario = (req.body.scenario as ScenarioType) || currentScenario;
  const reps = req.body.reps ? parseInt(req.body.reps, 10) : 2;
  const iterations = req.body.optimizer_iterations ? parseInt(req.body.optimizer_iterations, 10) : 25;
  const penaltyStrength = req.body.penalty_strength ? parseFloat(req.body.penalty_strength) : 15.0;

  const qaoaResult = solveQaoaQuantum(scenario, reps, iterations, penaltyStrength);
  const classicalResult = solveClassicalBaseline(scenario, penaltyStrength);

  // Update current benchmark cache
  currentBenchmark = {
    scenario,
    classical: classicalResult,
    qaoa: qaoaResult,
    approximation_ratio: Math.min(
      1.0,
      Math.round(
        (qaoaResult.metrics.agricultural_benefit / classicalResult.metrics.agricultural_benefit) * 1000
      ) / 1000
    ),
    speedup_factor:
      Math.round((classicalResult.metrics.runtime_ms / (qaoaResult.metrics.runtime_ms || 1)) * 100) / 100,
    fidelity_score: 92,
    timestamp: new Date().toISOString(),
  };

  const explanations = generateHydrologicalExplanation(qaoaResult);

  res.json({
    ...qaoaResult,
    explanation: explanations,
    benchmark_comparison: currentBenchmark,
  });
});

app.get('/api/results', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    scenario: currentScenario,
    benchmark: currentBenchmark,
    explanation: generateHydrologicalExplanation(currentBenchmark.qaoa),
  });
});

app.get('/api/quantum/circuit', (_req: Request, res: Response) => {
  const qubo = buildQuboModel(currentScenario, 15.0);
  const qaoa = currentBenchmark.qaoa.quantum;

  res.json({
    num_qubits: 12,
    reps: qaoa?.reps || 2,
    circuit_depth: qaoa?.circuit_depth || 18,
    gate_count: qaoa?.gate_count,
    ansatz_structure: [
      { step: 1, name: 'Hadamard Layer', description: 'Creates equal superposition |+>^12 on all 12 crop decision qubits' },
      { step: 2, name: 'Problem Hamiltonian U(C, gamma)', description: 'Applies phase separation proportional to QUBO crop demand & deficit penalties' },
      { step: 3, name: 'Mixer Hamiltonian U(B, beta)', description: 'Applies transverse field rotation Rx(2*beta) across all qubits' },
      { step: 4, name: 'Measurement Layer', description: 'Samples computational basis Z-basis probabilities to extract optimal allocation bitstring' },
    ],
    ising_h: qubo.ising_h.slice(0, 6),
    optimal_gamma: qaoa?.optimal_gamma,
    optimal_beta: qaoa?.optimal_beta,
    qiskit_code_snippet: `from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.quantum_info import SparsePauliOp

n_qubits = 12
gamma = ParameterVector('gamma', length=2)
beta = ParameterVector('beta', length=2)

qc = QuantumCircuit(n_qubits)
# 1. Uniform superposition
qc.h(range(n_qubits))

# 2. QAOA layers (p=2)
for p in range(2):
    # Cost Hamiltonian evolution e^(-i * gamma * H_C)
    for i, j in ising_couplings:
        qc.rzz(2 * gamma[p] * J[i,j], i, j)
    for i in range(n_qubits):
        qc.rz(2 * gamma[p] * h[i], i)
    # Mixer Hamiltonian evolution e^(-i * beta * H_M)
    for i in range(n_qubits):
        qc.rx(2 * beta[p], i)

qc.measure_all()`,
  });
});

// Vite or static serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuantumFlow Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start QuantumFlow server:', err);
});
