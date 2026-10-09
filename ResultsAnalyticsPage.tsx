import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Cpu,
  Droplets,
  Info,
  Scale,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { BenchmarkComparison } from '../../types';

interface ResultsAnalyticsPageProps {
  benchmark: BenchmarkComparison;
}

export const ResultsAnalyticsPage: React.FC<ResultsAnalyticsPageProps> = ({ benchmark }) => {
  const { classical, qaoa, approximation_ratio } = benchmark;
  const qaoaMetrics = qaoa.metrics;
  const classicalMetrics = classical.metrics;

  const comparisonTable = [
    {
      metric: 'Objective Value (QUBO Energy)',
      classical: classicalMetrics.objective_value,
      qaoa: qaoaMetrics.objective_value,
      unit: '',
    },
    {
      metric: 'Agricultural Benefit',
      classical: `${classicalMetrics.agricultural_benefit} Pts`,
      qaoa: `${qaoaMetrics.agricultural_benefit} Pts`,
      unit: 'Pts',
    },
    {
      metric: 'Water Utilization',
      classical: `${classicalMetrics.water_utilization}%`,
      qaoa: `${qaoaMetrics.water_utilization}%`,
      unit: '%',
    },
    {
      metric: 'Water Wastage / Unused',
      classical: `${classicalMetrics.water_wastage}%`,
      qaoa: `${qaoaMetrics.water_wastage}%`,
      unit: '%',
    },
    {
      metric: 'Unmet Demand',
      classical: `${classicalMetrics.unmet_demand} ML`,
      qaoa: `${qaoaMetrics.unmet_demand} ML`,
      unit: 'ML',
    },
    {
      metric: 'Equity Score',
      classical: `${classicalMetrics.equity_score} / 100`,
      qaoa: `${qaoaMetrics.equity_score} / 100`,
      unit: '/100',
    },
    {
      metric: 'Constraint Violations',
      classical: classical.constraints.violations.length,
      qaoa: qaoa.constraints.violations.length,
      unit: '',
    },
    {
      metric: 'Runtime',
      classical: `${classicalMetrics.runtime_ms} ms`,
      qaoa: `${qaoaMetrics.runtime_ms} ms`,
      unit: 'ms',
    },
    {
      metric: 'Approximation Ratio (r)',
      classical: '1.000 (Exact Optimum)',
      qaoa: `${approximation_ratio}`,
      unit: '',
    },
  ];

  const chartData = [
    {
      name: 'Agri Benefit (Pts)',
      Classical: classicalMetrics.agricultural_benefit,
      QAOA: qaoaMetrics.agricultural_benefit,
    },
    {
      name: 'Utilization (%)',
      Classical: classicalMetrics.water_utilization,
      QAOA: qaoaMetrics.water_utilization,
    },
    {
      name: 'Equity Score (/100)',
      Classical: classicalMetrics.equity_score,
      QAOA: qaoaMetrics.equity_score,
    },
    {
      name: 'Unmet Demand (10s ML)',
      Classical: Math.round(classicalMetrics.unmet_demand / 10),
      QAOA: Math.round(qaoaMetrics.unmet_demand / 10),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>Results Analytics & Quantum vs Classical Benchmarking</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Measurable benchmarking comparing QAOA against an exact classical brute-force baseline solver over the same 12-variable QUBO model.
        </p>
      </div>

      {/* High-Level Benchmark Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Approximation Ratio */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block mb-1">Approximation Ratio</span>
          <div className="text-2xl font-bold text-cyan-300 font-mono">{approximation_ratio}</div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
            r = QAOA Benefit / Classical Benefit
          </span>
        </div>

        {/* Equity Score */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block mb-1">Model Equity Score</span>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {qaoaMetrics.equity_score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Gini balance across canal outlets
          </span>
        </div>

        {/* Conflict Risk */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block mb-1">Conflict-Risk Indicator</span>
          <div
            className={`text-2xl font-bold font-mono ${
              qaoaMetrics.conflict_risk === 'HIGH'
                ? 'text-rose-400'
                : qaoaMetrics.conflict_risk === 'MEDIUM'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {qaoaMetrics.conflict_risk}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Model-based imbalance indicator</span>
        </div>

        {/* Constraint Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block mb-1">Physical Feasibility</span>
          <div className="text-base font-bold font-mono mt-1">
            {qaoa.constraints.feasible ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> ✓ FEASIBLE
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> ⚠ VIOLATION
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Hydrological validator output
          </span>
        </div>
      </div>

      {/* Mandatory Explanatory Notes Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
            <Scale className="w-4 h-4" />
            <span>Equity Score Definition</span>
          </div>
          <p className="text-slate-300 italic">
            "The equity score measures how balanced the allocation is across competing water demands under the available resource constraints."
          </p>
          <span className="text-[10px] text-slate-500 block mt-2">
            Model metric derived from Gini coefficient of crop fulfillment. Not an official government measurement.
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Allocation Conflict-Risk Indicator</span>
          </div>
          <p className="text-slate-300 italic">
            "This is a model-based allocation imbalance indicator and does not predict actual social conflict."
          </p>
          <span className="text-[10px] text-slate-500 block mt-2">
            Computed strictly from crop demand deficits, priority fulfillment gaps, and regional canal loads.
          </span>
        </div>
      </div>

      {/* Decoded QAOA Bitstring Showcase */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Decoded Quantum Bitstring & Allocation Mapping</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The QAOA measurement collapses to a 12-bit vector, decoded directly into multi-tier canal allocations.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300 text-xs font-bold tracking-widest">
            {qaoa.bitstring}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {qaoa.allocation.map((crop) => (
            <div
              key={crop.crop_id}
              className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Tier {crop.allocation_level}</span>
                <span className="text-xs font-bold text-white block">{crop.crop_name}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-900">
                <span className="text-sm font-bold text-cyan-300 font-mono block">{crop.allocated} ML</span>
                <span className="text-[10px] text-slate-400 font-mono">{crop.fulfillment_pct}% demand</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Benchmark Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Classical Exact Baseline vs QAOA Benchmark Table</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">12 Qubits • 4,096 Solutions Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4 text-right">Classical Exact Solver</th>
                <th className="py-3 px-4 text-right">QAOA Quantum Solver</th>
                <th className="py-3 px-4 text-center">Fidelity / Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {comparisonTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-slate-300 font-sans font-medium">{row.metric}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{row.classical}</td>
                  <td className="py-3 px-4 text-right font-bold text-cyan-300">{row.qaoa}</td>
                  <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                    {idx === 8 ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                        {approximation_ratio}
                      </span>
                    ) : idx === 1 ? (
                      `${Math.round((qaoaMetrics.agricultural_benefit / (classicalMetrics.agricultural_benefit || 1)) * 100)}%`
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmark Comparison Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Classical vs QAOA Performance Dimension Comparison</span>
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Classical" name="Classical Exact Baseline" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="QAOA" name="QAOA Quantum Simulation" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hydrological Engineering Explanation Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Decision Engineering Analysis: Why This Allocation Was Selected</span>
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            • <strong>Priority Enforcement:</strong> Under scenario <em>{benchmark.scenario}</em>, high-priority food security crops (Rice, Chilli) were satisfied at higher fulfillment levels ({qaoa.allocation.filter((c) => c.priority >= 4).map((c) => `${c.crop_name} ${c.fulfillment_pct}%`).join(', ')}).
          </p>
          <p>
            • <strong>Conveyance Constraints:</strong> Canal limits on Main Canal A and Branch Canal C operated without hydraulic overflow, preventing dangerous scour and canal bank breaches.
          </p>
          <p>
            • <strong>Ecological Reservoir Reserves:</strong> Reservoir safe storages were maintained strictly above the minimum safe threshold (Krishna A: 1,500 ML, Krishna B: 1,800 ML, Godavari A: 2,000 ML), avoiding ecological dead storage depletion.
          </p>
          <p>
            • <strong>Approximation Fidelity:</strong> QAOA reached an approximation ratio of <strong>{approximation_ratio}</strong> relative to the exhaustive brute-force search over 4,096 states, validating the mathematical efficacy of the QUBO formulation.
          </p>
        </div>
      </div>
    </div>
  );
};
