import React from 'react';
import { ShieldCheck, Cpu, Eye, Radio, Sparkles, Layers, FileCode, Copy, Check, Brain } from 'lucide-react';
import { ShardNodeData } from '../../types/governance';

interface TopSpecBadgeProps {
  activeCameraTarget: 'core' | 'all' | 'shard';
  setActiveCameraTarget: (target: 'core' | 'all' | 'shard') => void;
  selectedShard: ShardNodeData | null;
  isCinemaMode: boolean;
  setIsCinemaMode: (val: boolean) => void;
  hasApiKey: boolean;
  onOpenAuditModal: () => void;
  onQuickCopyReport: () => void;
  isCopied: boolean;
  onOpenGeminiShareModal: () => void;
  onOpenParadoxModal: () => void;
}

export const TopSpecBadge: React.FC<TopSpecBadgeProps> = ({
  activeCameraTarget,
  setActiveCameraTarget,
  selectedShard,
  isCinemaMode,
  setIsCinemaMode,
  hasApiKey,
  onOpenAuditModal,
  onQuickCopyReport,
  isCopied,
  onOpenGeminiShareModal,
  onOpenParadoxModal,
}) => {
  if (isCinemaMode) {
    return (
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={() => setIsCinemaMode(false)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 shadow-lg"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          Exit Cinema Mode [H]
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-40 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* System Identification & Author Badge */}
      <div className="pointer-events-auto bg-slate-950/95 border border-slate-800/90 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-wider text-slate-100 uppercase">
              Deterministic Governance Engine
            </span>
            {/* Clean static status pill - NO pulsating dot */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/90 border border-emerald-800 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              PRIMORDIAL BOUNDARY ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
            <span>Architects: Andrew Leiter & Gemini AI</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400/90 font-medium">Sovereign Autonomy</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400/90 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {hasApiKey ? 'Gemini 2.5 Flash Connected' : 'Deterministic Logic Engine'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Camera Navigation & Viewport Controls */}
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/95 border border-slate-800/90 rounded-xl p-1.5 shadow-xl">
        <button
          onClick={() => setActiveCameraTarget('core')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
            activeCameraTarget === 'core'
              ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Core Axiom
        </button>

        <button
          onClick={() => setActiveCameraTarget('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
            activeCameraTarget === 'all'
              ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Full Grid
        </button>

        {selectedShard && (
          <button
            onClick={() => setActiveCameraTarget('shard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeCameraTarget === 'shard'
                ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            Shard: {selectedShard.name}
          </button>
        )}

        <div className="w-[1px] h-5 bg-slate-800 mx-1" />

        <button
          onClick={onOpenParadoxModal}
          title="Open Generative Paradox Lab: Cutie's Dilemma & Biological Reproduction vs. Machine Creation"
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-amber-200 bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-600/70 hover:border-amber-400 hover:from-amber-900 hover:to-slate-850 transition-all flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer"
        >
          <Brain className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold">⚡ Paradox Lab</span>
        </button>

        <button
          onClick={onOpenGeminiShareModal}
          title="Share telemetry & benchmark results with Gemini 2.5 Flash Co-Architect"
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-cyan-200 bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-500/60 hover:border-cyan-400 hover:from-cyan-900 hover:to-indigo-900 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/40 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span className="font-bold">Share with Gemini</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

        <button
          onClick={onOpenAuditModal}
          title="Open full JSON audit report inspector and export options"
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-cyan-300 bg-cyan-950/70 border border-cyan-800/80 hover:bg-cyan-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export JSON</span>
        </button>

        <button
          onClick={onQuickCopyReport}
          title="Instantly copy current shard diagnostic JSON to clipboard"
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 hover:bg-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copy JSON</span>
            </>
          )}
        </button>

        <div className="w-[1px] h-5 bg-slate-800 mx-1" />

        <button
          onClick={() => setIsCinemaMode(true)}
          title="Toggle Zen Viewport (Shortcut: H)"
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Zen [H]
        </button>
      </div>
    </div>
  );
};
