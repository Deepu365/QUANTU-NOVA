import React from 'react';
import { Award, ShieldAlert, Waves } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>QuantumFlow</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              QAOA-Based Irrigation and Water-Resource Allocation Optimisation prototype developed for{' '}
              <strong className="text-slate-300">Qiskit Fall Fest 2026 (Use Case 03)</strong>.
            </p>
            <p className="text-cyan-400 font-mono text-[11px] mt-2">
              "Optimizing Every Drop with Quantum Intelligence"
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-amber-400 font-medium text-xs mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Quantum Honesty Statement</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              "QuantumFlow demonstrates a QAOA-based optimization workflow using a local quantum simulator. The prototype does not claim quantum advantage or quantum speedup. Classical and QAOA results are benchmarked using measured metrics."
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs mb-2">
              <Award className="w-4 h-4" />
              <span>Geographic Context & Disclaimer</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Contextualized for Andhra Pradesh and Krishna-Godavari command areas (Srisailam, Nagarjuna Sagar, Polavaram/Dowleswaram basins).
            </p>
            <p className="text-slate-500 text-[11px] mt-2 italic">
              "A prototype decision-support concept using synthetic demonstration data. Not official government data."
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <span>© 2026 QuantumFlow Decision-Support System • Built with React, TypeScript, FastAPI & Qiskit 2.x</span>
          <span className="font-mono text-cyan-400/80">Statevector Simulation • 12 Qubits • QUBO / Ising Formulation</span>
        </div>
      </div>
    </footer>
  );
};
