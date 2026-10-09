import React from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  Info,
  Layers,
  Server,
  ShieldAlert,
  Sparkles,
  Terminal,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          <span>About QuantumFlow & Hackathon Submission</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed project overview, technical architecture, hackathon evaluation criteria, and deployment instructions.
        </p>
      </div>

      {/* Official 250-Word Hackathon Submission Block */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-900/60 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2 font-mono">
          <Award className="w-4 h-4" />
          <span>Qiskit Fall Fest 2026 Submission Summary (&lt; 250 Words)</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-3">
          QuantumFlow: QAOA-Based Irrigation and Water-Resource Allocation Optimisation
        </h2>
        <div className="text-xs text-slate-300 leading-relaxed space-y-2.5 font-sans bg-slate-950/60 p-5 rounded-xl border border-slate-800">
          <p>
            <strong>1. Novelty:</strong> QuantumFlow applies QAOA-based quantum optimization to complex multi-reservoir irrigation networks across Krishna-Godavari command areas, formulating reservoir storage, canal conveyance capacities, crop priority tiers, and variable inflow scenarios into a unified QUBO decision-support framework.
          </p>
          <p>
            <strong>2. Level of Qiskit Programming:</strong> Implements a complete end-to-end Qiskit pipeline: problem discretization, penalty Hamiltonian synthesis, QUBO-to-Ising Pauli conversion (x_i = (I - Z_i)/2), parameterized QAOA ansatz construction (H_C and H_M), statevector simulation, classical variational optimization, computational basis sampling, bitstring decoding, and strict hydrological constraint validation.
          </p>
          <p>
            <strong>3. Measurable Results:</strong> Directly benchmarks QAOA against an exact classical brute-force baseline across all 4,096 states in a 12-qubit Hilbert space. Measures objective value, agricultural benefit, water utilization %, unmet demand, runtime, and approximation ratio across Normal, Dry, Drought, and High Inflow scenarios.
          </p>
          <p>
            <strong>4. Quantum Advantage / Technical Value:</strong> QuantumFlow maintains quantum honesty, avoiding false claims of speedup. It demonstrates the technical feasibility of expressing non-linear irrigation constraints in superposition and optimizing allocation with QAOA on local simulators and quantum hardware.
          </p>
        </div>
      </div>

      {/* Mandatory Institutional & Data Disclaimers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Prototype Purpose & Institutional Scope</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "QuantumFlow is a prototype decision-support concept that could support future workflows involving water-resource departments, irrigation boards and CWC/KGBO coordination."
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            Notice: QuantumFlow does NOT claim official government affiliation, deployment, or access to sensitive public works infrastructure.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Quantum Honesty Statement & Data Notice</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "QuantumFlow demonstrates a QAOA-based optimization workflow using a local quantum simulator. The prototype does not claim quantum advantage or quantum speedup. Classical and QAOA results are benchmarked using measured metrics."
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            "Synthetic demonstration data based on realistic irrigation assumptions. Not official government data."
          </p>
        </div>
      </div>

      {/* Architecture & Tech Stack */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span>System Architecture & Technology Stack</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-cyan-400 font-mono font-bold block mb-2">1. Frontend Layer</span>
            <ul className="space-y-1.5 text-slate-300">
              <li>• React 19 + TypeScript + Vite</li>
              <li>• Tailwind CSS for enterprise dark UI</li>
              <li>• Recharts responsive data telemetry</li>
              <li>• Lucide icons & smooth transitions</li>
              <li>• Multi-scenario simulation controls</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-teal-400 font-mono font-bold block mb-2">2. Backend & API Layer</span>
            <ul className="space-y-1.5 text-slate-300">
              <li>• Python FastAPI with Pydantic schemas</li>
              <li>• Express / Node.js hybrid runner</li>
              <li>• REST endpoints for health, canals, crops</li>
              <li>• In-memory synthetic demonstration dataset</li>
              <li>• Zero external paid DB dependency</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-indigo-400 font-mono font-bold block mb-2">3. Quantum & Solver Layer</span>
            <ul className="space-y-1.5 text-slate-300">
              <li>• Qiskit 2.x parameterized QAOA circuits</li>
              <li>• 12-qubit statevector wave simulator</li>
              <li>• QUBO to Ising Pauli Z/ZZ Hamiltonian</li>
              <li>• Classical exact brute-force benchmark</li>
              <li>• Hydrological constraint validator</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deployment & Execution Guide */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Deployment Instructions (Vercel Frontend + FastAPI Backend)</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-mono">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-cyan-300 font-bold block mb-1">Frontend (Vercel):</span>
            <p className="text-slate-400 font-sans">
              Deploy the repository to Vercel with Build Command <code className="text-cyan-400">npm run build</code> and Output Directory <code className="text-cyan-400">dist</code>. Set environment variable <code className="text-cyan-400">VITE_BACKEND_URL</code> to the FastAPI backend domain (or leave unset to run the built-in quantum engine).
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-teal-300 font-bold block mb-1">Backend (FastAPI on Render / Cloud Run / Fly.io):</span>
            <p className="text-slate-400 font-sans">
              Inside <code className="text-teal-400">/backend</code>, install dependencies with <code className="text-teal-400">pip install -r requirements.txt</code> and run <code className="text-teal-400">uvicorn main:app --host 0.0.0.0 --port 8000</code>. Dockerfile is included for zero-config containerized hosting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
