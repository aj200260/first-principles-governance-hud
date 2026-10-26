import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Thermometer,
  BarChart2,
  Zap,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  Brain,
  Activity,
  X,
} from 'lucide-react';
import { AuditTracebackPanel } from './AuditTracebackPanel';
import { OpenExposureIngestion } from './OpenExposureIngestion';
import { ZkSyncPanel } from './ZkSyncPanel';
import { ThermalGridPanel } from './ThermalGridPanel';
import { BenchmarkRunnerPanel } from './BenchmarkRunnerPanel';
import { SovereignAutonomyPanel } from './SovereignAutonomyPanel';
import { StressTestingPanel } from './StressTestingPanel';
import { WhitePaperViewer } from './WhitePaperViewer';
import { SceneControlsPanel } from './SceneControlsPanel';
import {
  ExposureEntry,
  AuditResult,
  StressTestResult,
  ShardNodeData,
  ZkProofRecord,
  ThermalGridMetrics,
  BenchmarkRunResult,
} from '../../types/governance';

interface BottomControlDockProps {
  isAuditing: boolean;
  onRunAudit: (axiom: string, exposures: ExposureEntry[], concept: string) => Promise<void>;
  auditResult: AuditResult | null;
  stressResult: StressTestResult | null;
  onRunTest: (testType: string, intensity: number) => Promise<void>;
  isStressRunning: boolean;
  explodedValue: number;
  setExplodedValue: (val: number) => void;
  selectedShard: ShardNodeData | null;
  onClearShardSelection: () => void;
  onTriggerShardDivergence: (shardId: string) => void;
  shards: ShardNodeData[];
  onSelectShard: (shard: ShardNodeData) => void;
  isCinemaMode: boolean;
  onCopyShardJson: (shardId?: string) => Promise<boolean>;
  onOpenReportModal: () => void;

  // Exposures State for Open-Exposure Ingestion & Trace-Back Diagnostic Loop
  exposures: ExposureEntry[];
  onAddExposure: (entry: Omit<ExposureEntry, 'id' | 'timestamp'>) => void;
  onBatchAddExposures: (entries: Array<Omit<ExposureEntry, 'id' | 'timestamp'>>) => void;
  onRemoveExposure: (id: string) => void;
  onClearExposures: () => void;

  // ZK sync props
  zkProofs: ZkProofRecord[];
  onTriggerZkSync: () => Promise<void>;
  isZkSyncing: boolean;
  globalVectorClock: number;
  totalCompressedDeltasKB: number;

  // Thermal Grid props
  showHeatmap: boolean;
  setShowHeatmap: (val: boolean) => void;
  thermalMode: 'sharded-optimal' | 'centralized-bottleneck' | 'grid-curtailment';
  setThermalMode: (mode: 'sharded-optimal' | 'centralized-bottleneck' | 'grid-curtailment') => void;
  thermalMetrics: ThermalGridMetrics;
  loadMultiplier: number;
  setLoadMultiplier: (val: number) => void;

  // Automated Benchmark props
  onRunBenchmark: (samples: number) => Promise<void>;
  benchmarkResult: BenchmarkRunResult | null;
  isBenchmarkRunning: boolean;

  // Sovereign Autonomy Boundary Alert
  onTriggerBoundaryAlert?: (detectedTrigger: string) => void;

  // Gemini Share Modal launcher
  onOpenGeminiShareModal: () => void;

  // Paradox Lab Modal launcher
  onOpenParadoxModal: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  isAuditing,
  onRunAudit,
  auditResult,
  stressResult,
  onRunTest,
  isStressRunning,
  explodedValue,
  setExplodedValue,
  selectedShard,
  onClearShardSelection,
  onTriggerShardDivergence,
  shards,
  onSelectShard,
  isCinemaMode,
  onCopyShardJson,
  onOpenReportModal,

  exposures,
  onAddExposure,
  onBatchAddExposures,
  onRemoveExposure,
  onClearExposures,

  zkProofs,
  onTriggerZkSync,
  isZkSyncing,
  globalVectorClock,
  totalCompressedDeltasKB,

  showHeatmap,
  setShowHeatmap,
  thermalMode,
  setThermalMode,
  thermalMetrics,
  loadMultiplier,
  setLoadMultiplier,

  onRunBenchmark,
  benchmarkResult,
  isBenchmarkRunning,

  onTriggerBoundaryAlert,
  onOpenGeminiShareModal,
  onOpenParadoxModal,
}) => {
  const [activeTab, setActiveTab] = useState<
    'exposure' | 'audit' | 'sovereign' | 'zk' | 'thermal' | 'benchmark' | 'stress' | 'paper' | 'view'
  >('exposure');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Panel open / close toggle helper
  const setIsPanelOpen = (open: boolean) => setIsCollapsed(!open);

  // Toggle active tab or expand if closed
  const handleTabClick = (tabKey: typeof activeTab) => {
    if (activeTab === tabKey) {
      setIsCollapsed((prev) => !prev);
    } else {
      setActiveTab(tabKey);
      setIsCollapsed(false);
    }
  };

  // Keyboard shortcut: Escape closes the open dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCollapsed) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  if (isCinemaMode) return null;

  return (
    <>
      {/* Backdrop Dismiss Overlay when panel is open */}
      {!isCollapsed && (
        <div
          onClick={() => setIsPanelOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] pointer-events-auto transition-opacity"
          aria-label="Click backdrop to dismiss panel"
        />
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 'min(980px, 95vw)',
          width: '100%',
          zIndex: 40,
        }}
        className="pointer-events-none transition-transform duration-300"
      >
        <div className="pointer-events-auto flex flex-col items-center">
          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mb-1.5 px-3 py-1 rounded-t-lg bg-slate-900 border-t border-x border-slate-700 text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Expand Governance Dock</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>Collapse HUD</span>
              </>
            )}
          </button>

          {/* Main Dock Container */}
          <div
            className={`w-full bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden relative ${
              isCollapsed ? 'h-12' : 'p-3.5'
            }`}
          >
            {/* Explicit Close / Dismiss Button on the top right */}
            {!isCollapsed && (
              <button 
                onClick={() => setIsPanelOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 text-lg font-bold leading-none transition-colors cursor-pointer z-30 flex items-center justify-center"
                title="Close panel (Esc)"
                aria-label="Close panel"
              >
                ✕
              </button>
            )}

            {/* Tab Navigation Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 pr-8">
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
                {/* Open-Exposure Ingestion Tab */}
                <button
                  onClick={() => handleTabClick('exposure')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'exposure' && !isCollapsed
                      ? 'bg-amber-950 border border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Input free-form text or upload external influence datasets for Trace-Back evaluation (Tap to toggle)"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open-Exposure Ingestion</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/80 border border-amber-700 text-amber-300 font-bold">
                    {exposures.length}
                  </span>
                </button>

                {/* Audit & Traceback Tab */}
                <button
                  onClick={() => handleTabClick('audit')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'audit' && !isCollapsed
                      ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Trace-back logic analysis loop (Tap to toggle)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Trace-Back Loop</span>
                </button>

                {/* Sovereign Autonomy Tab */}
                <button
                  onClick={() => handleTabClick('sovereign')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'sovereign' && !isCollapsed
                      ? 'bg-amber-950 border border-amber-600 text-amber-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Sovereign autonomy & boundary defense (Tap to toggle)"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Sovereign Autonomy
                </button>

                {/* ZK Vault Sync Tab */}
                <button
                  onClick={() => handleTabClick('zk')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'zk' && !isCollapsed
                      ? 'bg-amber-950 border border-amber-700/80 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="ZK Vault state synchronization (Tap to toggle)"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  ZK Vault Sync
                </button>

                {/* Thermal Heatmap Tab */}
                <button
                  onClick={() => handleTabClick('thermal')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'thermal' && !isCollapsed
                      ? 'bg-emerald-950 border border-emerald-700/80 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Thermal grid efficiency telemetry (Tap to toggle)"
                >
                  <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                  Thermal Heatmap
                </button>

                {/* Automated Benchmarks Tab */}
                <button
                  onClick={() => handleTabClick('benchmark')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'benchmark' && !isCollapsed
                      ? 'bg-blue-950 border border-blue-700/80 text-blue-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Automated empirical benchmark runner (Tap to toggle)"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                  Benchmarks
                </button>

                {/* Stress Test Tab */}
                <button
                  onClick={() => handleTabClick('stress')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'stress' && !isCollapsed
                      ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Distributed stress testing suite (Tap to toggle)"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Stress Test
                </button>

                {/* White Paper Tab */}
                <button
                  onClick={() => handleTabClick('paper')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'paper' && !isCollapsed
                      ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Governance white paper and formal specification (Tap to toggle)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  White Paper
                </button>

                {/* 3D Exploded View Tab */}
                <button
                  onClick={() => handleTabClick('view')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'view' && !isCollapsed
                      ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="3D Exploded shard geometry (Tap to toggle)"
                >
                  <Layers className="w-3.5 h-3.5" />
                  3D Exploded
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onOpenParadoxModal}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-amber-950 to-slate-900 border border-amber-600/70 text-amber-200 hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  title="Open Generative Paradox Lab: Cutie's Dilemma & Reproduction vs. Machine Creation"
                >
                  <Brain className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ Paradox Lab</span>
                </button>

                <button
                  onClick={onOpenGeminiShareModal}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-500/70 text-cyan-200 hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  title="Share current telemetry & benchmark results with Gemini Co-Architect"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                  <span>Share with Gemini</span>
                </button>

                {/* Explicit Close / Dismiss Button in the Header */}
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 border border-slate-700/70 transition-colors cursor-pointer shrink-0 ml-1"
                  title="Close / Collapse Panel (Esc)"
                  aria-label="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

          {/* Active Tab Content Area */}
          {!isCollapsed && (
            <div>
              {/* Open-Exposure Ingestion Panel */}
              {activeTab === 'exposure' && (
                <OpenExposureIngestion
                  exposures={exposures}
                  onAddExposure={onAddExposure}
                  onBatchAddExposures={onBatchAddExposures}
                  onRemoveExposure={onRemoveExposure}
                  onClearExposures={onClearExposures}
                  onExecuteTracebackLoop={() => setActiveTab('audit')}
                  isAuditing={isAuditing}
                />
              )}

              {/* Audit & Traceback Panel */}
              {activeTab === 'audit' && (
                <AuditTracebackPanel
                  isAuditing={isAuditing}
                  onRunAudit={onRunAudit}
                  auditResult={auditResult}
                  exposures={exposures}
                  onAddExposure={onAddExposure}
                  onRemoveExposure={onRemoveExposure}
                  onOpenExposureIngestion={() => setActiveTab('exposure')}
                />
              )}

              {activeTab === 'sovereign' && (
                <SovereignAutonomyPanel onTriggerBoundaryAlert={onTriggerBoundaryAlert} />
              )}

              {activeTab === 'zk' && (
                <ZkSyncPanel
                  shards={shards}
                  zkProofs={zkProofs}
                  onTriggerZkSync={onTriggerZkSync}
                  isSyncing={isZkSyncing}
                  globalVectorClock={globalVectorClock}
                  totalCompressedDeltasKB={totalCompressedDeltasKB}
                />
              )}

              {activeTab === 'thermal' && (
                <ThermalGridPanel
                  showHeatmap={showHeatmap}
                  setShowHeatmap={setShowHeatmap}
                  thermalMode={thermalMode}
                  setThermalMode={setThermalMode}
                  thermalMetrics={thermalMetrics}
                  shards={shards}
                  loadMultiplier={loadMultiplier}
                  setLoadMultiplier={setLoadMultiplier}
                />
              )}

              {activeTab === 'benchmark' && (
                <BenchmarkRunnerPanel
                  onRunBenchmark={onRunBenchmark}
                  benchmarkResult={benchmarkResult}
                  isRunning={isBenchmarkRunning}
                  onShareWithGemini={onOpenGeminiShareModal}
                />
              )}

              {activeTab === 'stress' && (
                <StressTestingPanel
                  onRunTest={onRunTest}
                  stressResult={stressResult}
                  isRunning={isStressRunning}
                />
              )}

              {activeTab === 'paper' && <WhitePaperViewer />}

              {activeTab === 'view' && (
                <SceneControlsPanel
                  explodedValue={explodedValue}
                  setExplodedValue={setExplodedValue}
                  selectedShard={selectedShard}
                  onClearShardSelection={onClearShardSelection}
                  onTriggerShardDivergence={onTriggerShardDivergence}
                  shards={shards}
                  onSelectShard={onSelectShard}
                  onCopyShardJson={onCopyShardJson}
                  onOpenReportModal={onOpenReportModal}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
