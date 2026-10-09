import React from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Cpu,
  Database,
  GitBranch,
  Info,
  Layers,
  Sprout,
  Waves,
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'resources'
  | 'canals'
  | 'crops'
  | 'optimization'
  | 'results'
  | 'explainer'
  | 'about';

interface NavbarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  isOptimizing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onPageChange,
  isOptimizing,
}) => {
  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'resources', label: 'Water Resources', icon: <Database className="w-4 h-4" /> },
    { id: 'canals', label: 'Canal Network', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'crops', label: 'Crop Allocation', icon: <Sprout className="w-4 h-4" /> },
    { id: 'optimization', label: 'Quantum Optimization', icon: <Cpu className="w-4 h-4" /> },
    { id: 'results', label: 'Results & Analytics', icon: <Activity className="w-4 h-4" /> },
    { id: 'explainer', label: 'Quantum Explainer', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'about', label: 'About & Help', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hackathon Tag */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onPageChange('overview')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Waves className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Quantum<span className="text-cyan-400">Flow</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 flex items-center gap-1">
                  <Award className="w-3 h-3 text-indigo-400" />
                  Qiskit Fall Fest 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                QAOA Water-Resource Allocation Optimisation • Use Case 03
              </p>
            </div>
          </div>

          {/* Engine indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono text-[11px]">Qiskit 2.x QAOA Simulator</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400 font-mono text-[11px]">12 Qubits</span>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-900">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'optimization' && isOptimizing && (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
