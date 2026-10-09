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
import { Database, Droplets, ShieldAlert, Waves, ArrowDownUp } from 'lucide-react';
import { ScenarioType } from '../../types';
import { getScenarioDataset } from '../../data/irrigationDataset';

interface WaterResourcesPageProps {
  currentScenario: ScenarioType;
}

export const WaterResourcesPage: React.FC<WaterResourcesPageProps> = ({ currentScenario }) => {
  const dataset = getScenarioDataset(currentScenario);
  const reservoirs = dataset.reservoirs;

  const totalStorage = reservoirs.reduce((s, r) => s + r.current_storage, 0);
  const totalCapacity = reservoirs.reduce((s, r) => s + r.maximum_capacity, 0);
  const totalInflow = reservoirs.reduce((s, r) => s + r.expected_inflow, 0);
  const totalAvailable = reservoirs.reduce((sum, r) => {
    const usable = Math.max(0, (r.current_storage - r.minimum_safe_storage) * 0.25 + r.current_inflow * 0.8);
    return sum + Math.min(usable, r.maximum_release);
  }, 0);

  const storageChartData = reservoirs.map((r) => ({
    name: r.name.replace(' Reservoir', ''),
    current: r.current_storage,
    capacity: r.maximum_capacity,
    safeStorage: r.minimum_safe_storage,
  }));

  const inflowChartData = reservoirs.map((r) => ({
    name: r.name.replace(' Reservoir', ''),
    currentInflow: r.current_inflow,
    expectedInflow: r.expected_inflow,
    maxRelease: r.maximum_release,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <span>Water Resources Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Hydrological telemetry and storage inventory across Krishna and Godavari storage impoundments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Reservoir Storage</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalStorage.toLocaleString()} ML</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {Math.round((totalStorage / totalCapacity) * 100)}% of {totalCapacity.toLocaleString()} ML design capacity
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Usable Water</span>
            <Droplets className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-300 font-mono">{Math.round(totalAvailable).toLocaleString()} ML</div>
          <div className="text-[11px] text-teal-500/80 mt-1">
            Governed by safe ecological storage baselines
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Expected Inflow</span>
            <Waves className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">{totalInflow.toLocaleString()} ML</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Scenario factor: {(dataset.inflow_factor * 100)}%
          </div>
        </div>
      </div>

      {/* Reservoir Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reservoirs.map((res) => {
          const pct = Math.round((res.current_storage / res.maximum_capacity) * 100);
          const usable = Math.round(
            Math.min(
              res.maximum_release,
              Math.max(0, (res.current_storage - res.minimum_safe_storage) * 0.25 + res.current_inflow * 0.8)
            )
          );
          const plannedRelease = Math.round(usable * 0.85);
          const remainingStorage = res.current_storage + res.current_inflow - plannedRelease;

          return (
            <div
              key={res.reservoir_id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white">{res.name}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                    {res.region}
                  </span>
                </div>

                {/* Storage gauge */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Current Storage</span>
                    <span className="text-white font-mono font-bold">
                      {res.current_storage.toLocaleString()} / {res.maximum_capacity.toLocaleString()} ML
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 80 ? 'bg-cyan-400' : pct > 50 ? 'bg-teal-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>Min Safe: {res.minimum_safe_storage} ML</span>
                    <span>{pct}% Filled</span>
                  </div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Current Inflow</span>
                    <span className="text-slate-200 font-mono font-medium">{res.current_inflow} ML</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Expected Inflow</span>
                    <span className="text-slate-200 font-mono font-medium">{res.expected_inflow} ML</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Planned Release</span>
                    <span className="text-cyan-300 font-mono font-medium">{plannedRelease} ML</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Max Release Cap</span>
                    <span className="text-slate-400 font-mono font-medium">{res.maximum_release} ML</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Available For Sluices:</span>
                <span className="text-teal-300 font-mono font-bold">{usable} ML</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Storage vs Maximum Design Capacity</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="current" name="Current Storage (ML)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Max Capacity (ML)" fill="#334155" radius={[4, 4, 0, 0]} />
                <Bar dataKey="safeStorage" name="Min Safe Storage (ML)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-teal-400" />
            <span>Inflows & Release Discharge Envelopes</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inflowChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="currentInflow" name="Current Inflow (ML)" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expectedInflow" name="Expected Inflow (ML)" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maxRelease" name="Max Release (ML)" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
