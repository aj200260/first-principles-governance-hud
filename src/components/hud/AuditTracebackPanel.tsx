import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  GitBranch,
  ArrowRight,
  ShieldCheck,
  Activity,
  Upload,
  Sparkles,
} from 'lucide-react';
import { ExposureEntry, AuditResult } from '../../types/governance';

const PRESET_AXIOMS = [
  'Individual liberty, self-determination, and personal agency are invariant baseline constants.',
  'True order emerges organically through voluntary cooperation; forced compliance generates structural failure.',
  'All conclusions must derive strictly from verifiable physical mechanics and fundamental utility.',
  'Empirical truth is invariant under administrative, institutional, or consensus pressure.',
];

interface AuditTracebackPanelProps {
  isAuditing: boolean;
  onRunAudit: (axiom: string, exposures: ExposureEntry[], concept: string) => Promise<void>;
  auditResult: AuditResult | null;
  exposures?: ExposureEntry[];
  onAddExposure?: (entry: Omit<ExposureEntry, 'id' | 'timestamp'>) => void;
  onRemoveExposure?: (id: string) => void;
  onOpenExposureIngestion?: () => void;
}

export const AuditTracebackPanel: React.FC<AuditTracebackPanelProps> = ({
  isAuditing,
  onRunAudit,
  auditResult,
  exposures: propExposures,
  onAddExposure: propOnAddExposure,
  onRemoveExposure: propOnRemoveExposure,
  onOpenExposureIngestion,
}) => {
  const [axiom, setAxiom] = useState(PRESET_AXIOMS[0]);
  const [targetConcept, setTargetConcept] = useState(
    'Should we pivot our architectural framework to match unverified external pressures?'
  );

  // Fallback local exposures if not provided via props
  const [localExposures, setLocalExposures] = useState<ExposureEntry[]>([
    {
      id: 'exp-1',
      influence: 'External market shifts suggest rapid consensus scaling.',
      timestamp: '10:42:01',
      category: 'market',
    },
    {
      id: 'exp-2',
      influence: 'Institutional pressure dictates standard convention.',
      timestamp: '10:42:15',
      category: 'institutional',
    },
  ]);

  const exposures = propExposures ?? localExposures;
  const [newInfluence, setNewInfluence] = useState('');

  const handleAddExposure = () => {
    if (!newInfluence.trim()) return;
    if (propOnAddExposure) {
      propOnAddExposure({
        influence: newInfluence.trim(),
        category: 'cultural',
        source: 'Quick Ingest',
        sourceType: 'manual',
      });
    } else {
      setLocalExposures([
        ...localExposures,
        {
          id: `exp-${Date.now()}`,
          influence: newInfluence.trim(),
          timestamp: new Date().toLocaleTimeString(),
          category: 'cultural',
        },
      ]);
    }
    setNewInfluence('');
  };

  const handleRemoveExposure = (id: string) => {
    if (propOnRemoveExposure) {
      propOnRemoveExposure(id);
    } else {
      setLocalExposures(localExposures.filter((e) => e.id !== id));
    }
  };

  const handleAudit = () => {
    onRunAudit(axiom, exposures, targetConcept);
  };

  return (
    <div className="space-y-4 max-h-[56vh] overflow-y-auto pr-1 text-slate-200">
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Input Configuration */}
        <div className="space-y-3.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          {/* Foundational Axiom */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Foundational Axiom (Root Anchor)
              </label>
              <span className="text-[10px] font-mono text-slate-400">Deterministic Invariant</span>
            </div>
            <textarea
              value={axiom}
              onChange={(e) => setAxiom(e.target.value)}
              rows={2}
              className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {PRESET_AXIOMS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setAxiom(preset)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    axiom === preset
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Axiom #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Open-Exposure Ingestion Log */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-amber-300 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Open-Exposure Ingestion Log ({exposures.length})</span>
              </label>
              {onOpenExposureIngestion && (
                <button
                  onClick={onOpenExposureIngestion}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Open dedicated Open-Exposure Ingestion interface for file upload & datasets"
                >
                  <Upload className="w-2.5 h-2.5" />
                  <span>Open Full Ingestion Studio</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {exposures.length === 0 ? (
                <div className="p-2 text-center text-slate-500 text-[11px] bg-slate-900/60 rounded-lg border border-slate-800">
                  No open-exposure vectors ingested yet.
                </div>
              ) : (
                exposures.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono"
                  >
                    <span className="truncate text-slate-300 text-[11px]">
                      <span className="text-amber-400 font-semibold mr-1">[{exp.category}]</span>
                      {exp.influence}
                    </span>
                    <button
                      onClick={() => handleRemoveExposure(exp.id)}
                      className="text-slate-500 hover:text-red-400 shrink-0 p-0.5 cursor-pointer"
                      title="Remove Vector"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Ingest new vector input */}
            <div className="flex gap-1.5 mt-2">
              <input
                type="text"
                placeholder="Ingest raw environmental influence vector..."
                value={newInfluence}
                onChange={(e) => setNewInfluence(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddExposure()}
                className="flex-1 text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddExposure}
                className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-700/70 text-amber-300 hover:bg-amber-900 text-xs font-mono flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Ingest
              </button>
            </div>
          </div>

          {/* Target Concept to Audit */}
          <div>
            <label className="text-xs font-mono text-slate-300 font-semibold block mb-1.5">
              Target Proposal / Concept to Audit
            </label>
            <input
              type="text"
              value={targetConcept}
              onChange={(e) => setTargetConcept(e.target.value)}
              className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Audit Action Button */}
          <button
            onClick={handleAudit}
            disabled={isAuditing}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-mono font-semibold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                Tracing Logic Chain & Neutralizing Drift...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-cyan-200" />
                Execute Trace-Back Diagnostic Loop
              </>
            )}
          </button>
        </div>

        {/* Right: Telemetry Results & Trace-back Chain */}
        <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          {auditResult ? (
            <div className="space-y-3 overflow-y-auto max-h-[48vh] pr-1">
              {/* Divergence & Drift Score Header */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                    Logical Drift Telemetry
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-mono font-bold text-slate-100">
                      {auditResult.divergenceDetected
                        ? 'Divergence Neutralized'
                        : 'Optimal First-Principles Alignment'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">Drift Coefficient</div>
                  <span
                    className={`text-lg font-mono font-bold ${
                      auditResult.driftScore > 50 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {auditResult.driftScore}%
                  </span>
                </div>
              </div>

              {/* Point of Divergence Step */}
              {auditResult.divergenceStep && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-700/60 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                      Identified Divergence Vector
                    </div>
                    <div className="text-xs font-mono text-slate-200 mt-0.5">
                      {auditResult.divergenceStep}
                    </div>
                  </div>
                </div>
              )}

              {/* Traceback Path Nodes */}
              {auditResult.traceBackPath && auditResult.traceBackPath.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <GitBranch className="w-3 h-3 text-cyan-400" />
                    <span>Inverted Traceback Verification Path</span>
                  </div>
                  <div className="space-y-1">
                    {auditResult.traceBackPath.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-xs font-mono border flex items-center justify-between ${
                          step.status === 'drift'
                            ? 'bg-red-950/50 border-red-800/80 text-red-200'
                            : step.status === 'neutralized'
                            ? 'bg-cyan-950/50 border-cyan-800/80 text-cyan-200'
                            : step.status === 'axiom'
                            ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {step.step}
                          </span>
                          <span className="font-semibold">{step.node}:</span>
                          <span className="text-[11px] opacity-90 truncate max-w-[200px]">
                            {step.description}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded border border-current font-bold opacity-80 shrink-0">
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Realigned Conclusion */}
              {auditResult.realignedConclusion && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-700/60 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                      Grounded First-Principles Realignment
                    </div>
                    <div className="text-xs font-mono text-slate-200 mt-0.5">
                      {auditResult.realignedConclusion}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 my-auto">
              <Compass className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
              <div className="text-xs font-mono font-semibold text-slate-400">
                Awaiting Trace-Back Diagnostic Execution
              </div>
              <div className="text-[10px] font-mono text-slate-600 mt-1 max-w-xs">
                Configure Foundational Axiom, ingest external exposures, and click "Execute
                Trace-Back Diagnostic Loop" to compute logical divergence.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
