/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, PageId } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScenarioBanner } from './components/ScenarioBanner';
import { OverviewPage } from './components/pages/OverviewPage';
import { WaterResourcesPage } from './components/pages/WaterResourcesPage';
import { CanalNetworkPage } from './components/pages/CanalNetworkPage';
import { CropAllocationPage } from './components/pages/CropAllocationPage';
import { QuantumOptimizationPage } from './components/pages/QuantumOptimizationPage';
import { ResultsAnalyticsPage } from './components/pages/ResultsAnalyticsPage';
import { QuantumExplainerPage } from './components/pages/QuantumExplainerPage';
import { AboutPage } from './components/pages/AboutPage';
import { BenchmarkComparison, ScenarioType } from './types';
import { runBenchmark } from './services/quantumEngine';
import { apiClient } from './services/apiClient';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('NORMAL SEASON');
  const [benchmark, setBenchmark] = useState<BenchmarkComparison>(() =>
    runBenchmark('NORMAL SEASON', 2, 25, 15.0)
  );
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleScenarioChange = async (newScenario: ScenarioType) => {
    if (newScenario === currentScenario || isOptimizing) return;
    setIsOptimizing(true);
    setCurrentScenario(newScenario);

    try {
      const response = await apiClient.setScenario(newScenario);
      if (response && response.benchmark) {
        setBenchmark(response.benchmark);
      } else {
        const updated = runBenchmark(newScenario, 2, 25, 15.0);
        setBenchmark(updated);
      }
      showToast(`Inflows updated for ${newScenario}. Model recalculated.`);
    } catch {
      const updated = runBenchmark(newScenario, 2, 25, 15.0);
      setBenchmark(updated);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRunQaoa = async (reps = 2, iters = 25, penalty = 15.0) => {
    setIsOptimizing(true);
    try {
      const res = await apiClient.runQaoaOptimization(currentScenario, reps, iters, penalty);
      if (res && res.benchmark) {
        setBenchmark(res.benchmark);
        showToast(
          `QAOA simulation converged! Approximation ratio: ${res.benchmark.approximation_ratio}`
        );
      }
    } catch {
      const updated = runBenchmark(currentScenario, reps, iters, penalty);
      setBenchmark(updated);
      showToast('QAOA optimization completed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOptimizing={isOptimizing}
      />

      {/* Scenario Control Ribbon */}
      <ScenarioBanner
        currentScenario={currentScenario}
        onScenarioChange={handleScenarioChange}
        isLoading={isOptimizing}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentPage === 'overview' && (
          <OverviewPage
            currentScenario={currentScenario}
            benchmark={benchmark}
            onNavigate={setCurrentPage}
            onRunOptimization={() => {
              setCurrentPage('optimization');
              handleRunQaoa(2, 25, 15.0);
            }}
            isOptimizing={isOptimizing}
          />
        )}

        {currentPage === 'resources' && (
          <WaterResourcesPage currentScenario={currentScenario} />
        )}

        {currentPage === 'canals' && (
          <CanalNetworkPage
            currentScenario={currentScenario}
            benchmark={benchmark}
          />
        )}

        {currentPage === 'crops' && (
          <CropAllocationPage benchmark={benchmark} />
        )}

        {currentPage === 'optimization' && (
          <QuantumOptimizationPage
            currentScenario={currentScenario}
            onScenarioChange={handleScenarioChange}
            benchmark={benchmark}
            onRunQaoa={handleRunQaoa}
            isOptimizing={isOptimizing}
          />
        )}

        {currentPage === 'results' && (
          <ResultsAnalyticsPage benchmark={benchmark} />
        )}

        {currentPage === 'explainer' && (
          <QuantumExplainerPage benchmark={benchmark} />
        )}

        {currentPage === 'about' && <AboutPage />}
      </main>

      {/* Footer with mandatory disclaimers and quantum honesty statements */}
      <Footer />
    </div>
  );
}
