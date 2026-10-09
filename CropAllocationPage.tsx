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
import { CheckCircle2, Sprout, Star, TrendingUp } from 'lucide-react';
import { BenchmarkComparison } from '../../types';

interface CropAllocationPageProps {
  benchmark: BenchmarkComparison;
}

export const CropAllocationPage: React.FC<CropAllocationPageProps> = ({ benchmark }) => {
  const allocation = benchmark.qaoa.allocation;
  const metrics = benchmark.qaoa.metrics;

  const chartData = allocation.map((a) => ({
    name: a.crop_name,
    demand: a.demand,
    allocated: a.allocated,
    benefit: a.benefit,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-400" />
          <span>Crop Water Allocation & Agronomical Demands</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Optimization results across the 6 major crops of Krishna-Godavari command areas, balancing food security and cash crop yields.
        </p>
      </div>

      {/* Allocation Summary KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block">Total Demand</span>
          <span className="text-xl font-bold text-white font-mono">
            {allocation.reduce((s, a) => s + a.demand, 0).toLocaleString()} ML
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block">Total Allocated</span>
          <span className="text-xl font-bold text-cyan-300 font-mono">
            {allocation.reduce((s, a) => s + a.allocated, 0).toLocaleString()} ML
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block">Agricultural Benefit</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">
            {metrics.agricultural_benefit} Pts
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block">Mean Fulfillment</span>
          <span className="text-xl font-bold text-amber-300 font-mono">
            {Math.round(allocation.reduce((s, a) => s + a.fulfillment_pct, 0) / allocation.length)}%
          </span>
        </div>
      </div>

      {/* Crop Allocation Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Crop Demand vs QAOA Allocation Schedule</h2>
          <span className="text-xs text-slate-400 font-mono">Binary-Tier Decoded Schedule</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-right">Demand</th>
                <th className="py-3 px-4 text-right">Allocated</th>
                <th className="py-3 px-4">Fulfillment Level</th>
                <th className="py-3 px-4 text-right">Benefit Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allocation.map((crop) => {
                const isOptimal = crop.fulfillment_pct >= 90;
                const isAdequate = crop.fulfillment_pct >= 65;

                return (
                  <tr key={crop.crop_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                      <span>{crop.crop_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{crop.region}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-mono">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{crop.priority}/5</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">{crop.demand} ML</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">
                      {crop.allocated} ML
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-48">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                          <span className={isOptimal ? 'text-emerald-400' : isAdequate ? 'text-cyan-400' : 'text-amber-400'}>
                            {crop.level_name}
                          </span>
                          <span className="font-bold text-white">{crop.fulfillment_pct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOptimal ? 'bg-emerald-400' : isAdequate ? 'bg-cyan-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${crop.fulfillment_pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400">
                      +{crop.benefit} Pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demand vs Allocated Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Crop Demand vs QAOA Allocation Volumes</span>
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
              <Bar dataKey="demand" name="Agronomical Demand (ML)" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="allocated" name="QAOA Allocated Water (ML)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benefit" name="Yield Benefit Index" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
