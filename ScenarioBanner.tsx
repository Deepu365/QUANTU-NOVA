import React from 'react';
import { AlertCircle, CloudRain, Droplets, Sun, Waves } from 'lucide-react';
import { SCENARIO_INFLOW_FACTORS } from '../data/irrigationDataset';
import { ScenarioType } from '../types';

interface ScenarioBannerProps {
  currentScenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
  isLoading?: boolean;
}

export const ScenarioBanner: React.FC<ScenarioBannerProps> = ({
  currentScenario,
  onScenarioChange,
  isLoading,
}) => {
  const scenarios: { id: ScenarioType; label: string; icon: React.ReactNode; factorText: string; desc: string }[] = [
    {
      id: 'NORMAL SEASON',
      label: 'Normal Season',
      icon: <Droplets className="w-4 h-4 text-cyan-400" />,
      factorText: '100% Inflow',
      desc: 'Baseline monsoon inflows and typical reservoir storage.',
    },
    {
      id: 'DRY SEASON',
      label: 'Dry Season',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      factorText: '75% Inflow',
      desc: 'Moderate deficit requiring equitable allocation quotas.',
    },
    {
      id: 'DROUGHT',
      label: 'Drought',
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
      factorText: '50% Inflow',
      desc: 'Severe deficit prioritizing high-priority food crops.',
    },
    {
      id: 'HIGH INFLOW',
      label: 'High Inflow',
      icon: <Waves className="w-4 h-4 text-blue-400" />,
      factorText: '130% Inflow',
      desc: 'Surplus runoff allowing full crop demands and aquifer recharge.',
    },
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-cyan-950/80 border border-cyan-800/60 rounded-lg text-cyan-400 shrink-0">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Simulation Scenario
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {SCENARIO_INFLOW_FACTORS[currentScenario] * 100}% Inflow Factor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                "Synthetic demonstration data based on realistic irrigation assumptions. Not official government data."
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {scenarios.map((sc) => {
              const active = sc.id === currentScenario;
              return (
                <button
                  key={sc.id}
                  disabled={isLoading}
                  onClick={() => onScenarioChange(sc.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                      : 'bg-slate-800/90 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={sc.desc}
                >
                  {sc.icon}
                  <span>{sc.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      active ? 'bg-cyan-950 text-cyan-200' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {sc.factorText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
