import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { BenchmarkComparison, OptimizationResult, ScenarioType } from '../../types';

interface QuantumOptimizationPageProps {
  currentScenario: ScenarioType;
  onScenarioChange: (s: ScenarioType) => void;
  benchmark: BenchmarkComparison;
  onRunQaoa: (reps: number, iters: number, penalty: number) => Promise<void>;
  isOptimizing: boolean;
}

export const QuantumOptimizationPage: React.FC<QuantumOptimizationPageProps> = ({
  currentScenario,
  onScenarioChange,
  benchmark,
  onRunQaoa,
  isOptimizing,
}) => {
  const [reps, setReps] = useState<number>(2);
  const [iterations, setIterations] = useState<number>(25);
  const [penaltyStrength, setPenaltyStrength] = useState<number>(15.0);
  const [activeStage, setActiveStage] = useState<number>(8); // 1-8

  const qaoa = benchmark.qaoa;
  const quantum = qaoa.quantum;

  const executionStages = [
    { step: 1, name: 'Building optimization model', desc: 'Discretizing multi-reservoir & crop hydraulic constraints' },
    { step: 2, name: 'Building QUBO', desc: 'Synthesizing objective matrix Q and linear vector c' },
    { step: 3, name: 'Converting to Ising', desc: 'Applying mapping x_i = (1 - Z_i)/2 to generate Pauli Z & ZZ operators' },
    { step: 4, name: 'Constructing QAOA', desc: 'Instantiating p-layer ansatz: exp(-i β H_M) exp(-i γ H_C) |+>^12' },
    { step: 5, name: 'Optimizing parameters', desc: 'Running classical gradient-free Nelder-Mead loop over (γ, β)' },
    { step: 6, name: 'Decoding result', desc: 'Selecting lowest energy measured bitstring & mapping to ML allocations' },
    { step: 7, name: 'Validating constraints', desc: 'Checking reservoir storage, safe releases, and canal envelopes' },
    { step: 8, name: 'Optimization complete', desc: 'All statevector probabilities and benchmarks consolidated' },
  ];

  const handleRun = async () => {
    setActiveStage(1);
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < 7 ? prev + 1 : prev));
    }, 180);

    try {
      await onRunQaoa(reps, iterations, penaltyStrength);
    } finally {
      clearInterval(interval);
      setActiveStage(8);
    }
  };

  const probChartData = (quantum?.statevector_probabilities || []).map((p) => ({
    bitstring: p.bitstring,
    prob: p.probability,
    energy: p.energy,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>QAOA Quantum Optimization Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Executes parameterized quantum approximate optimization over a 12-qubit Hilbert space on the Qiskit-compatible local statevector simulator.
        </p>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Algorithm Hyperparameters</span>
          </h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              QAOA Depth / Repetitions ($p$): <span className="text-cyan-300 font-mono font-bold">{reps}</span>
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>p=1 (Fast)</span>
              <span>p=2 (Balanced)</span>
              <span>p=3 (Deep)</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Optimizer Iterations: <span className="text-cyan-300 font-mono font-bold">{iterations}</span>
            </label>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 iters</span>
              <span>25 iters</span>
              <span>50 iters</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Constraint Penalty Strength ($\lambda$):{' '}
              <span className="text-cyan-300 font-mono font-bold">{penaltyStrength}</span>
            </label>
            <input
              type="range"
              min={5.0}
              max={30.0}
              step={2.5}
              value={penaltyStrength}
              onChange={(e) => setPenaltyStrength(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5.0 (Soft)</span>
              <span>15.0 (Standard)</span>
              <span>30.0 (Strict)</span>
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={isOptimizing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 hover:opacity-95 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Simulating Wavefunction...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>RUN QAOA OPTIMIZATION</span>
              </>
            )}
          </button>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-cyan-400 font-semibold block mb-0.5">Physical Encoding:</span>
            6 crops × 2 qubits = <strong>12 qubits</strong> ($2^{12} = 4096$ state amplitudes). Real unitary evolution using Pauli Z, ZZ, and X rotations.
          </div>
        </div>

        {/* 8 Execution Stages Pipeline */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>8-Stage Optimization Pipeline Execution</span>
          </h2>

          <div className="space-y-2">
            {executionStages.map((stage) => {
              const isPast = activeStage > stage.step;
              const isCurrent = activeStage === stage.step && isOptimizing;
              const isDone = activeStage >= stage.step && !isOptimizing;

              return (
                <div
                  key={stage.step}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-between text-xs ${
                    isCurrent
                      ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200'
                      : isPast || isDone
                      ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                      : 'bg-slate-950/30 border-slate-900 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isCurrent
                          ? 'bg-cyan-500 text-slate-950 animate-pulse'
                          : isPast || isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      {stage.step}
                    </span>
                    <div>
                      <div className="font-semibold">{stage.name}</div>
                      <div className="text-[11px] text-slate-400 hidden sm:block">{stage.desc}</div>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                        Executing...
                      </span>
                    ) : isPast || isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quantum Diagnostics Console & Statevector Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Quantum Diagnostics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Quantum Run Telemetry & Gate Breakdown</span>
          </h2>

          <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs border border-slate-800/80 space-y-2.5">
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-500">Selected Bitstring:</span>
              <span className="text-cyan-300 font-bold tracking-wider">{qaoa.bitstring}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-500">QUBO Energy / Expectation:</span>
              <span className="text-white font-bold">{quantum?.qubo_energy}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-500">Qubits Allocated:</span>
              <span className="text-slate-200">12 Qubits (2 per crop)</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-500">QAOA Layers (p):</span>
              <span className="text-slate-200">{quantum?.reps} Repetitions</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-500">Circuit Depth:</span>
              <span className="text-slate-200">{quantum?.circuit_depth}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-500">Total Gate Count:</span>
              <span className="text-slate-200">
                {quantum?.gate_count.total} (H:{quantum?.gate_count.hadamard}, Rz:{quantum?.gate_count.rz}, RZZ:{quantum?.gate_count.rzz}, Rx:{quantum?.gate_count.rx})
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-500">Simulator:</span>
              <span className="text-teal-400">{quantum?.simulator}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Quantum Simulation Runtime:</span>
              <span className="text-emerald-400 font-bold">{qaoa.metrics.runtime_ms} ms</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <span className="text-slate-400">Constraint Feasibility:</span>
            {qaoa.constraints.feasible ? (
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 font-mono font-semibold border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ✓ FEASIBLE
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 font-mono font-semibold border border-rose-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                ⚠ CONSTRAINT VIOLATION
              </span>
            )}
          </div>
        </div>

        {/* Statevector Probabilities */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Statevector Measurement Probabilities (%)</span>
          </h2>
          <p className="text-[11px] text-slate-400 mb-4">
            Top sampled candidate basis bitstrings from the collapsed quantum state $|\psi(\gamma, \beta)\rangle$.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="bitstring" stroke="#94a3b8" fontSize={9} angle={-30} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={10} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontFamily: 'monospace' }}
                />
                <Bar dataKey="prob" name="Probability (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
