import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AuditTracebackPanel } from './AuditTracebackPanel';
import { StressTestingPanel } from './StressTestingPanel';
import { WhitePaperViewer } from './WhitePaperViewer';
import { SceneControlsPanel } from './SceneControlsPanel';
import { ExposureEntry, AuditResult, StressTestResult, ShardNodeData } from '../../types/governance';

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
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'stress' | 'paper' | 'view'>('audit');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCinemaMode) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'min(940px, 94vw)',
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
          className={`w-full bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'h-12' : 'p-3.5'
          }`}
        >
          {/* Tab Navigation Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('audit');
                  if (isCollapsed) setIsCollapsed(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'audit'
                    ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Audit & Traceback
              </button>

              <button
                onClick={() => {
                  setActiveTab('stress');
                  if (isCollapsed) setIsCollapsed(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'stress'
                    ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Stress Testing
              </button>

              <button
                onClick={() => {
                  setActiveTab('paper');
                  if (isCollapsed) setIsCollapsed(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'paper'
                    ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                White Paper
              </button>

              <button
                onClick={() => {
                  setActiveTab('view');
                  if (isCollapsed) setIsCollapsed(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'view'
                    ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                3D Exploded & View
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>Leiter-Gemini Spec</span>
              <span className="text-slate-700">|</span>
              <span className="text-emerald-400">Regional Sharding v2.4</span>
            </div>
          </div>

          {/* Active Tab Content Area */}
          {!isCollapsed && (
            <div>
              {activeTab === 'audit' && (
                <AuditTracebackPanel
                  isAuditing={isAuditing}
                  onRunAudit={onRunAudit}
                  auditResult={auditResult}
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
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
