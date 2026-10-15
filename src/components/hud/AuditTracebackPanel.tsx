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
} from 'lucide-react';
import { ExposureEntry, AuditResult } from '../../types/governance';

const PRESET_AXIOMS = [
  'All conclusions must derive strictly from verifiable physical mechanics and fundamental utility.',
  'Thermodynamic laws and computational energy limits strictly govern systemic scaling.',
  'Empirical mathematical truth is invariant under institutional or societal consensus pressure.',
];

const PRESET_EXPOSURES: Array<{ influence: string; category: ExposureEntry['category'] }> = [
  { influence: 'External market shifts suggest rapid consensus scaling without unit economics.', category: 'market' },
  { influence: 'Institutional pressure dictates compliance with standard bureaucratic convention.', category: 'institutional' },
  { influence: 'Social media sentiment claims fundamental physical limits have been rendered obsolete.', category: 'cultural' },
];

interface AuditTracebackPanelProps {
  isAuditing: boolean;
  onRunAudit: (axiom: string, exposures: ExposureEntry[], concept: string) => Promise<void>;
  auditResult: AuditResult | null;
}

export const AuditTracebackPanel: React.FC<AuditTracebackPanelProps> = ({
  isAuditing,
  onRunAudit,
  auditResult,
}) => {
  const [axiom, setAxiom] = useState(PRESET_AXIOMS[0]);
  const [targetConcept, setTargetConcept] = useState(
    'Should we pivot our architectural framework to match unverified external pressures?'
  );
  const [exposures, setExposures] = useState<ExposureEntry[]>([
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
  const [newInfluence, setNewInfluence] = useState('');

  const handleAddExposure = () => {
    if (!newInfluence.trim()) return;
    setExposures([
      ...exposures,
      {
        id: `exp-${Date.now()}`,
        influence: newInfluence.trim(),
        timestamp: new Date().toLocaleTimeString(),
        category: 'cultural',
      },
    ]);
    setNewInfluence('');
  };

  const handleRemoveExposure = (id: string) => {
    setExposures(exposures.filter((e) => e.id !== id));
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
                Open-Exposure Ingestion Log ({exposures.length})
              </label>
              <span className="text-[10px] font-mono text-slate-400">Zero-Pre-Filter Ingestion</span>
            </div>
            
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {exposures.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono"
                >
                  <span className="truncate text-slate-300 text-[11px]">{exp.influence}</span>
                  <button
                    onClick={() => handleRemoveExposure(exp.id)}
                    className="text-slate-500 hover:text-red-400 shrink-0 p-0.5"
                    title="Remove Vector"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
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
                className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-700/70 text-amber-300 hover:bg-amber-900 text-xs font-mono flex items-center gap-1 shrink-0"
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
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-mono font-semibold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2"
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
                      {auditResult.divergenceDetected ? 'Divergence Neutralized' : 'Optimal First-Principles Alignment'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">Drift Coefficient</div>
                  <span
                    className={`text-base font-mono font-bold ${
                      auditResult.driftScore > 50
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {auditResult.driftScore}%
                  </span>
                </div>
              </div>

              {/* Point of Divergence Warning */}
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs font-mono">
                <div className="text-amber-300 font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Identified Point of Divergence:
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  {auditResult.divergenceStep}
                </div>
              </div>

              {/* Step-by-Step Logic Traceback Chain */}
              <div>
                <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                  Traceback Reverse Calibration Chain:
                </div>
                <div className="space-y-1.5">
                  {auditResult.traceBackPath.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-[11px] font-mono p-2 rounded-lg bg-slate-900/90 border border-slate-800/90"
                    >
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.status === 'axiom'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : item.status === 'drift'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : item.status === 'neutralized'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        #{item.step} {item.node}
                      </span>
                      <p className="text-slate-300 leading-snug">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Realigned Grounded Conclusion */}
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/70 text-xs font-mono">
                <div className="text-cyan-300 font-semibold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Grounded First-Principles Realignment:
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  {auditResult.realignedConclusion}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <Compass className="w-10 h-10 text-cyan-500/40 mb-2" />
              <div className="text-xs font-mono font-medium text-slate-300">
                Diagnostic Traceback Standing By
              </div>
              <p className="text-[11px] font-mono text-slate-500 max-w-xs mt-1">
                Configure your foundational axiom and ingested exposure vector, then click &ldquo;Execute Trace-Back Diagnostic Loop&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
