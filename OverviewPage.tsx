import React from 'react';
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  Cpu,
  Database,
  Droplets,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Waves,
} from 'lucide-react';
import { PageId } from '../Navbar';
import { BenchmarkComparison, ScenarioType } from '../../types';
import { getScenarioDataset } from '../../data/irrigationDataset';

interface OverviewPageProps {
  currentScenario: ScenarioType;
  benchmark: BenchmarkComparison;
  onNavigate: (page: PageId) => void;
  onRunOptimization: () => void;
  isOptimizing?: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  currentScenario,
  benchmark,
  onNavigate,
  onRunOptimization,
  isOptimizing,
}) => {
  const dataset = getScenarioDataset(currentScenario);
  const totalStorage = dataset.reservoirs.reduce((s, r) => s + r.current_storage, 0);
  const totalCapacity = dataset.reservoirs.reduce((s, r) => s + r.maximum_capacity, 0);
  const totalInflow = dataset.reservoirs.reduce((s, r) => s + r.expected_inflow, 0);
  const totalDemand = dataset.crops.reduce((s, c) => s + c.water_requirement, 0);
  const storagePct = Math.round((totalStorage / totalCapacity) * 100);

  const metrics = benchmark.qaoa.metrics;

  return (
    <div className="space-y-8">
      {/* Hero Banner with Left Content & Right Farmers Irrigation Visual */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Title, Description & Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Qiskit Fall Fest 2026 • Use Case 03: Irrigation Optimisation</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Quantum<span className="text-cyan-400">Flow</span>
            </h1>
            <p className="text-lg sm:text-xl font-semibold text-cyan-300 font-mono">
              "Optimizing Every Drop with Quantum Intelligence"
            </p>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              "Quantum-assisted decision support for equitable and efficient irrigation water allocation."
              Contextualized for multi-reservoir and canal networks across the <strong>Krishna-Godavari command areas</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onRunOptimization}
                disabled={isOptimizing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer disabled:opacity-50"
              >
                <Cpu className="w-4 h-4" />
                <span>{isOptimizing ? 'Optimizing Quantum Statevector...' : 'Run QAOA Optimization'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onNavigate('explainer')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>View Mathematical Pipeline</span>
              </button>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Real 12-qubit QAOA simulation with statevector evolution & exact classical benchmark
              </span>
            </div>
          </div>

          {/* Right Column: Farmers & Irrigation Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-cyan-800/50 bg-slate-950/80 shadow-2xl p-4 group">
              {/* Graphic Banner: Farmers in Command Area Irrigation Fields */}
              <div className="relative h-60 w-full rounded-lg overflow-hidden bg-gradient-to-b from-sky-900 via-teal-950 to-emerald-950 flex flex-col justify-between p-3 border border-slate-800">
                {/* SVG Landscape Illustration: River, Canal, Sluice Gates, Crops & Farmers */}
                <svg
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                  viewBox="0 0 400 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#082f49" />
                      <stop offset="50%" stopColor="#0f766e" />
                      <stop offset="100%" stopColor="#064e3b" />
                    </linearGradient>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0e7490" />
                    </linearGradient>
                    <linearGradient id="fieldGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#15803d" />
                      <stop offset="100%" stopColor="#14532d" />
                    </linearGradient>
                    <linearGradient id="fieldGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" />
                      <stop offset="100%" stopColor="#166534" />
                    </linearGradient>
                  </defs>

                  {/* Sky & Sun */}
                  <rect width="400" height="240" fill="url(#skyGrad)" />
                  <circle cx="330" cy="50" r="28" fill="#fef08a" opacity="0.85" />
                  <circle cx="330" cy="50" r="40" fill="#fef08a" opacity="0.25" />

                  {/* Distant Hills (Rayalaseema / Eastern Ghats) */}
                  <path d="M-20 120 Q60 80 140 115 T300 95 T420 120 L420 240 L-20 240 Z" fill="#064e3b" opacity="0.6" />
                  <path d="M40 130 Q120 100 220 125 T380 110 T440 130 L440 240 L40 240 Z" fill="#047857" opacity="0.7" />

                  {/* Lush Paddy / Sugarcane Terraced Fields */}
                  <path d="M0 135 L400 135 L400 240 L0 240 Z" fill="url(#fieldGrad1)" />
                  <path d="M0 155 Q200 145 400 160 L400 240 L0 240 Z" fill="url(#fieldGrad2)" />

                  {/* Crop Rows & Paddy Bunds */}
                  <line x1="20" y1="145" x2="160" y2="148" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
                  <line x1="10" y1="160" x2="180" y2="165" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.8" />
                  <line x1="240" y1="150" x2="390" y2="152" stroke="#22c55e" strokeWidth="2" strokeDasharray="5 3" opacity="0.7" />
                  <line x1="230" y1="168" x2="395" y2="172" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.8" />

                  {/* Main Irrigation Canal Curved Channel (Krishna-Godavari flow) */}
                  <path
                    d="M190 120 C180 145 160 170 140 240 L210 240 C220 180 230 145 220 120 Z"
                    fill="url(#waterGrad)"
                    opacity="0.95"
                  />

                  {/* Canal Water Waves / Streamlines */}
                  <path d="M178 150 Q195 152 205 149" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M165 175 Q185 178 200 174" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                  <path d="M152 205 Q175 208 198 204" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />

                  {/* Sluice Gate Structure */}
                  <rect x="180" y="115" width="40" height="8" rx="2" fill="#334155" />
                  <rect x="185" y="112" width="6" height="12" fill="#64748b" />
                  <rect x="209" y="112" width="6" height="12" fill="#64748b" />
                  <circle cx="200" cy="110" r="5" fill="#38bdf8" />

                  {/* Farmer 1 (Inspecting Canal Gate Flow) */}
                  {/* Head & Traditional Turban */}
                  <circle cx="232" cy="165" r="4" fill="#fed7aa" />
                  <ellipse cx="232" cy="163" rx="5" ry="3" fill="#fb923c" />
                  {/* Body & Kurta */}
                  <path d="M228 169 L236 169 L238 184 L226 184 Z" fill="#f8fafc" />
                  {/* Dhoti */}
                  <path d="M227 184 L237 184 L235 198 L228 198 Z" fill="#e2e8f0" />
                  {/* Arm pointing toward canal */}
                  <line x1="228" y1="173" x2="216" y2="177" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />

                  {/* Farmer 2 (In the Crop Field) */}
                  <circle cx="258" cy="168" r="3.5" fill="#fed7aa" />
                  <ellipse cx="258" cy="166" rx="4.5" ry="2.5" fill="#f59e0b" />
                  <path d="M255 172 L262 172 L263 185 L254 185 Z" fill="#38bdf8" />
                  <path d="M254 185 L263 185 L262 196 L255 196 Z" fill="#cbd5e1" />
                  {/* Farming tool / staff */}
                  <line x1="264" y1="168" x2="265" y2="198" stroke="#78350f" strokeWidth="1.5" />

                  {/* Telemetry Sensor Node on Canal Bank */}
                  <rect x="135" y="180" width="8" height="12" rx="2" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
                  <line x1="139" y1="180" x2="139" y2="173" stroke="#06b6d4" strokeWidth="1.5" />
                  <circle cx="139" cy="172" r="2" fill="#22c55e" />
                </svg>

                {/* Top Badge: Sluice Network Status */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-cyan-300 font-mono text-[10px] font-semibold border border-cyan-800/60 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Krishna-Godavari Sluice Network
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-mono border border-emerald-700/60 font-medium">
                    Flow: Optimal
                  </span>
                </div>

                {/* Bottom Overlay Badge: Tail-end Farmers Protected */}
                <div className="relative z-10 bg-slate-950/90 backdrop-blur-md rounded-lg p-2.5 border border-slate-800 text-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Tail-End Farmer Quota:</span>
                    <span className="text-emerald-400 font-bold">100% Guaranteed</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Active Canals: 4 Channels</span>
                    <span className="text-cyan-400 font-mono">QAOA Equitably Balanced</span>
                  </div>
                </div>
              </div>

              {/* Caption Under Image */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  Farmers & Canal Command Telemetry
                </span>
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  Andhra Pradesh Delta
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Storage</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalStorage.toLocaleString()} ML</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${storagePct}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">{storagePct}% cap</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Water Available</span>
            <Droplets className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.available_water.toLocaleString()} ML</div>
          <div className="text-[11px] text-teal-400 mt-2 font-mono">
            {metrics.water_utilization}% Productive Utilization
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Crop Demand</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalDemand.toLocaleString()} ML</div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Unmet Demand: {metrics.unmet_demand} ML
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Equity Score</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{metrics.equity_score} / 100</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Risk: <span className={`font-semibold ${metrics.conflict_risk === 'HIGH' ? 'text-rose-400' : metrics.conflict_risk === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>{metrics.conflict_risk}</span>
          </div>
        </div>
      </div>

      {/* Core Problem vs Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <div className="h-10 w-10 rounded-lg bg-rose-950/80 border border-rose-800/50 flex items-center justify-center text-rose-400 mb-4">
            <Waves className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">1. The Core Problem</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Irrigation authorities face competing water demands under seasonal volatility. In the Krishna-Godavari command regions, water must be dynamically distributed across 3 major reservoirs, 4 primary canal channels, and 6 diverse crops. Tail-end farmers often face acute deficits while upstream zones over-allocate, creating equity imbalances and tail-end salinity intrusion.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-400">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Severe hydrological bottlenecking
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Conflicting crop economic priorities
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Inflow volatility across drought and monsoon
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <div className="h-10 w-10 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">2. The Quantum Solution</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            QuantumFlow frames the irrigation allocation problem as a <strong>Quadratic Unconstrained Binary Optimization (QUBO)</strong> problem, translated to an <strong>Ising Hamiltonian</strong> and solved with the <strong>Quantum Approximate Optimization Algorithm (QAOA)</strong>.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-400">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Multi-tiered binary allocation encoding
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Non-linear constraint penalties in superposition
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Classical optimizer finds optimal QAOA angles (γ, β)
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <div className="h-10 w-10 rounded-lg bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">3. Why Quantum Optimization?</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            As irrigation command networks scale to thousands of sluice gates and real-time sensor streams, the discrete combinatorial search space expands exponentially ($2^N$). QAOA utilizes quantum interference and entanglement to explore the vast constrained solution space, providing a natural pathway for hybrid quantum-classical decision support.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-slate-400">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              Benchmarked against exact classical solver
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              Approximation ratio {benchmark.approximation_ratio} achieved
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              Ready for real Qiskit execution on IBM Quantum hardware
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Explore Dashboard Modules</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('resources')}
            className="p-4 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition-all cursor-pointer"
          >
            <Database className="w-4 h-4 text-cyan-400 mb-2" />
            <div className="text-xs font-semibold text-slate-200">Water Resources</div>
            <div className="text-[11px] text-slate-400 mt-1">3 Reservoirs & Inflows</div>
          </button>

          <button
            onClick={() => onNavigate('canals')}
            className="p-4 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition-all cursor-pointer"
          >
            <Waves className="w-4 h-4 text-teal-400 mb-2" />
            <div className="text-xs font-semibold text-slate-200">Canal Network</div>
            <div className="text-[11px] text-slate-400 mt-1">4 Delivery Canals</div>
          </button>

          <button
            onClick={() => onNavigate('crops')}
            className="p-4 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 text-amber-400 mb-2" />
            <div className="text-xs font-semibold text-slate-200">Crop Allocation</div>
            <div className="text-[11px] text-slate-400 mt-1">6 Agricultural Crops</div>
          </button>

          <button
            onClick={() => onNavigate('results')}
            className="p-4 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition-all cursor-pointer"
          >
            <Scale className="w-4 h-4 text-indigo-400 mb-2" />
            <div className="text-xs font-semibold text-slate-200">Results & Benchmarks</div>
            <div className="text-[11px] text-slate-400 mt-1">Classical vs QAOA</div>
          </button>
        </div>
      </div>
    </div>
  );
};
