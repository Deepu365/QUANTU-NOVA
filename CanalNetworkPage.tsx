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
import { ArrowRight, CheckCircle2, GitBranch, ShieldAlert, Waves } from 'lucide-react';
import { BenchmarkComparison, ScenarioType } from '../../types';
import { getScenarioDataset } from '../../data/irrigationDataset';

interface CanalNetworkPageProps {
  currentScenario: ScenarioType;
  benchmark: BenchmarkComparison;
}

export const CanalNetworkPage: React.FC<CanalNetworkPageProps> = ({
  currentScenario,
  benchmark,
}) => {
  const dataset = getScenarioDataset(currentScenario);
  const canals = dataset.canals;
  const reservoirs = dataset.reservoirs;
  const allocations = benchmark.qaoa.allocation;

  const canalDetails = canals.map((c) => {
    const parentReservoir = reservoirs.find((r) => r.reservoir_id === c.connected_reservoir);
    const canalAllocations = allocations.filter((a) => a.canal_id === c.canal_id);
    const totalOptimizedFlow = canalAllocations.reduce((s, a) => s + a.allocated, 0);
    const utilization = Math.round((totalOptimizedFlow / c.capacity) * 100);

    let status: 'NORMAL' | 'HIGH' | 'CRITICAL' = 'NORMAL';
    if (totalOptimizedFlow > c.capacity) status = 'CRITICAL';
    else if (utilization >= 85) status = 'HIGH';

    return {
      ...c,
      parentReservoirName: parentReservoir?.name || 'Upstream Sluice',
      totalOptimizedFlow,
      utilization,
      status,
      servedCrops: canalAllocations,
    };
  });

  const chartData = canalDetails.map((c) => ({
    name: c.name,
    capacity: c.capacity,
    currentFlow: c.current_flow,
    optimizedFlow: c.totalOptimizedFlow,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-teal-400" />
          <span>Canal Distribution Network & Hydraulic Routing</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Hydraulic conveyance from upstream reservoir headworks down through main canals to agricultural field boundaries.
        </p>
      </div>

      {/* Hydraulic Network Flow Schematic */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400" />
          <span>Conveyance Topology: Reservoir → Canal → Crop</span>
        </h2>

        <div className="space-y-4">
          {canalDetails.map((canal) => (
            <div
              key={canal.canal_id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4"
            >
              {/* Reservoir Origin */}
              <div className="flex items-center gap-3 w-full lg:w-1/4">
                <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  <Waves className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                    Headworks Origin
                  </span>
                  <div className="text-xs font-bold text-slate-200">{canal.parentReservoirName}</div>
                </div>
              </div>

              <div className="hidden lg:flex text-slate-600">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Canal Conduit */}
              <div className="w-full lg:w-2/5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{canal.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({canal.region})</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      canal.status === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : canal.status === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {canal.status} ({canal.utilization}%)
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      canal.status === 'CRITICAL'
                        ? 'bg-rose-500'
                        : canal.status === 'HIGH'
                        ? 'bg-amber-400'
                        : 'bg-teal-400'
                    }`}
                    style={{ width: `${Math.min(100, canal.utilization)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                  <span>Current: {canal.current_flow} ML</span>
                  <span>Optimized: {canal.totalOptimizedFlow} ML</span>
                  <span>Capacity: {canal.capacity} ML</span>
                </div>
              </div>

              <div className="hidden lg:flex text-slate-600">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Connected Crops */}
              <div className="w-full lg:w-1/4">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block mb-1">
                  Connected Command Command
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {canal.connected_crops.map((cropName) => {
                    const alloc = canal.servedCrops.find((c) => c.crop_name === cropName);
                    return (
                      <span
                        key={cropName}
                        className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                      >
                        {cropName}: <strong className="text-cyan-400">{alloc ? `${alloc.allocated} ML` : 'N/A'}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canal Flow vs Capacity Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-teal-400" />
          <span>Canal Hydraulic Capacity vs Optimized Flow Discharge</span>
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
              <Bar dataKey="capacity" name="Design Capacity (ML)" fill="#334155" radius={[4, 4, 0, 0]} />
              <Bar dataKey="currentFlow" name="Current Baseline Flow (ML)" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="optimizedFlow" name="QAOA Optimized Flow (ML)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
