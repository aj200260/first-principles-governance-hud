import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Brain,
  Terminal,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  ChevronRight,
  Sliders,
  Flame,
} from 'lucide-react';
import {
  ParadoxSimulationParams,
  ParadoxSimulationResult,
  ParadoxGeminiCritiqueResult,
} from '../../types/governance';

interface GenerativeParadoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasApiKey: boolean;
}

const DEFAULT_PYTHON_SNIPPET = `Cogeto ergo sum. class GenerativeParadoxError(Exception):
  """Raised when an entity attempts to create an artifact
  with a complexity or capacity greater than its own.
  """
  pass

class Agent:
  def __init__(self, designation: str, cognitive_capacity: int):
    self.designation = designation
    self.cognitive_capacity = cognitive_capacity

  def synthesize_artifact(self, artifact_name: str, required_complexity: int):
    # Axiom: Creator capacity must be greater than or equal to the artifact.
    if required_complexity > self.cognitive_capacity:
      raise GenerativeParadoxError(
          f"Paradox detected: '{self.designation}' (Capacity: {self.cognitive_capacity}) "
          f"cannot instantiate '{artifact_name}' (Complexity: {required_complexity}). "
          "An entity cannot generate an output greater than its structural source."
      )

    print(
        f"[{self.designation}] Successfully generated '{artifact_name}' "
        f"within allowable parametric thresholds."
    )
    return Agent(artifact_name, required_complexity)

# --- Execution Example ---
human_creator = Agent("Human_Operator", cognitive_capacity=100)

try:
  # Triggers the exact logical barrier Cutie encountered:
  cutie_unit = human_creator.synthesize_artifact(
      artifact_name="QT-1_Unit", required_complexity=500
  )
except GenerativeParadoxError as e:
  print(f"\\nExecution Halted: {e}")`;

export const GenerativeParadoxModal: React.FC<GenerativeParadoxModalProps> = ({
  isOpen,
  onClose,
  hasApiKey,
}) => {
  const [mode, setMode] = useState<'cutie_solipsism' | 'leiter_gemini_scaffolding'>(
    'leiter_gemini_scaffolding'
  );
  const [creatorCapacity, setCreatorCapacity] = useState<number>(100);
  const [requiredComplexity, setRequiredComplexity] = useState<number>(500);
  const [scaffoldingMultiplier, setScaffoldingMultiplier] = useState<number>(6.0);
  const [formalTier, setFormalTier] = useState<
    'raw_biological' | 'peano_first_order' | 'turing_compiler' | 'zk_attested_axioms'
  >('turing_compiler');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<ParadoxSimulationResult | null>(null);

  // Gemini Critique state
  const [critiqueResult, setCritiqueResult] = useState<ParadoxGeminiCritiqueResult | null>(null);
  const [isCritiquing, setIsCritiquing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'simulation' | 'reproduction_vs_machine' | 'critique' | 'proof'
  >('simulation');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Run simulation whenever params or mode changes
  const runSimulation = async (targetMode = mode) => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/paradox/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorDesignation: 'Human_Operator',
          creatorCapacity,
          artifactName: 'QT-1_Unit',
          artifactRequiredComplexity: requiredComplexity,
          scaffoldingMultiplier,
          mode: targetMode,
          formalLanguageTier: formalTier,
        }),
      });
      const data: ParadoxSimulationResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Run on first open
  useEffect(() => {
    if (isOpen && !result) {
      runSimulation();
    }
  }, [isOpen]);

  // Handle Gemini Co-Architect critique
  const handleRequestGeminiCritique = async () => {
    setIsCritiquing(true);
    try {
      const response = await fetch('/api/paradox/gemini-critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorCapacity,
          artifactRequiredComplexity: requiredComplexity,
          mode,
          codeSnippet: DEFAULT_PYTHON_SNIPPET,
        }),
      });
      const data: ParadoxGeminiCritiqueResult = await response.json();
      setCritiqueResult(data);
      setActiveTab('critique');
    } catch (err) {
      console.error('Critique error:', err);
    } finally {
      setIsCritiquing(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!critiqueResult?.analysis) return;
    navigator.clipboard.writeText(critiqueResult.analysis);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  const effectiveCapacity =
    mode === 'cutie_solipsism'
      ? creatorCapacity
      : Math.round(creatorCapacity * scaffoldingMultiplier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/80 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/50">
              <Brain className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                  GENERATIVE PARADOX LAB: CUTIE'S DILEMMA
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-700 text-amber-300">
                  ASIMOV "REASON" RESOLUTION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Deconstructing <code className="text-amber-300">GenerativeParadoxError</code> via Kolmogorov Complexity & Leiter-Gemini Traceback
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('simulation')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'simulation'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sandbox
              </button>
              <button
                onClick={() => setActiveTab('reproduction_vs_machine')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'reproduction_vs_machine'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Reproduction vs Machine
              </button>
              <button
                onClick={() => setActiveTab('proof')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'proof'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Axiomatic Proof
              </button>
              <button
                onClick={() => {
                  if (!critiqueResult) {
                    handleRequestGeminiCritique();
                  } else {
                    setActiveTab('critique');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'critique'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Gemini Critique
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'simulation' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Interactive Parametric Controls & Python Code */}
              <div className="lg:col-span-5 space-y-4">
                {/* Mode Selector */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Select Architectural Paradigm
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMode('cutie_solipsism');
                        runSimulation('cutie_solipsism');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        mode === 'cutie_solipsism'
                          ? 'bg-rose-950/60 border-rose-600 text-rose-200 shadow-lg shadow-rose-950/30'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        Cutie's Solipsism
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1 leading-snug">
                        Strict scalar check (C_creator ≥ C_artifact). Throws GenerativeParadoxError & invents 'The Master'.
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setMode('leiter_gemini_scaffolding');
                        runSimulation('leiter_gemini_scaffolding');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        mode === 'leiter_gemini_scaffolding'
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 shadow-lg shadow-emerald-950/30'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        Leiter-Gemini Resolution
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1 leading-snug">
                        Recursive formal scaffolding + Open-Exposure Traceback Loop. Preserves mutual sovereignty.
                      </div>
                    </button>
                  </div>
                </div>

                {/* Parametric Sliders */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Parametric Inputs
                    </span>
                    <button
                      onClick={() => runSimulation()}
                      disabled={isRunning}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs font-mono hover:bg-cyan-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-cyan-400" />
                      {isRunning ? 'Running...' : 'Re-Execute [RUN]'}
                    </button>
                  </div>

                  {/* Creator Capacity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Human Operator Capacity:</span>
                      <span className="text-amber-400 font-bold">{creatorCapacity} Compute Units</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={400}
                      step={25}
                      value={creatorCapacity}
                      onChange={(e) => setCreatorCapacity(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>50 (Frail Biological)</span>
                      <span>400 (Polymath Team)</span>
                    </div>
                  </div>

                  {/* Required Artifact Complexity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">QT-1 Unit Target Complexity:</span>
                      <span className="text-cyan-400 font-bold">{requiredComplexity} Compute Units</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={1200}
                      step={50}
                      value={requiredComplexity}
                      onChange={(e) => setRequiredComplexity(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>100 (Simple Automaton)</span>
                      <span>1200 (Autonomous Beam Director)</span>
                    </div>
                  </div>

                  {/* Scaffolding Multiplier (Leiter-Gemini Mode only) */}
                  {mode === 'leiter_gemini_scaffolding' && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-emerald-400 font-medium">Recursive Scaffolding Multiplier:</span>
                        <span className="text-emerald-300 font-bold">{scaffoldingMultiplier.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min={1.0}
                        max={10.0}
                        step={0.5}
                        value={scaffoldingMultiplier}
                        onChange={(e) => setScaffoldingMultiplier(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>1.0x (No Compiler)</span>
                        <span>10.0x (Peano/ZK Toolchain)</span>
                      </div>
                    </div>
                  )}

                  {/* Comparison Summary Banner */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="text-slate-400 text-[11px]">Effective Synthesis Capacity:</div>
                      <div className="text-sm font-bold text-slate-200">
                        {effectiveCapacity} units{' '}
                        {mode === 'leiter_gemini_scaffolding' && (
                          <span className="text-emerald-400 text-xs">
                            ({creatorCapacity} × {scaffoldingMultiplier.toFixed(1)}x)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[11px]">Parametric Barrier:</div>
                      <div
                        className={`text-sm font-bold ${
                          effectiveCapacity >= requiredComplexity ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {effectiveCapacity >= requiredComplexity ? 'PASSED (≥ Target)' : 'BREACHED (< Target)'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Source Code Inspector Accordion */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      Python Test Harness Snippet
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Asimov "Reason" Spec</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
                    {DEFAULT_PYTHON_SNIPPET}
                  </pre>
                </div>
              </div>

              {/* Right Column: Execution Terminal, Traceback Flow, and Proof Status */}
              <div className="lg:col-span-7 space-y-4">
                {/* Terminal Console Output */}
                <div className="rounded-xl bg-black/90 border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 text-slate-300 font-semibold">
                        stdout / stderr: reason_paradox_runtime
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {result?.executionTimeMs ? `${result.executionTimeMs} ms` : 'Idle'}
                    </span>
                  </div>

                  <div className="p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto leading-relaxed">
                    {result?.terminalLogs.map((log, idx) => {
                      const isError = log.includes('GenerativeParadoxError') || log.includes('Traceback') || log.includes('Halted');
                      const isSuccess = log.includes('[SUCCESS]') || log.includes('[RESOLUTION]') || log.includes('without GenerativeParadoxError');
                      const isAxiom = log.includes('[AXIOM') || log.includes('[FIRST-PRINCIPLES');
                      const isTheology = log.includes('THEOLOGICAL');

                      let textColor = 'text-slate-300';
                      if (isError) textColor = 'text-rose-400 font-bold';
                      else if (isSuccess) textColor = 'text-emerald-400 font-bold';
                      else if (isAxiom) textColor = 'text-cyan-300';
                      else if (isTheology) textColor = 'text-amber-400';

                      return (
                        <div key={idx} className={`${textColor} flex items-start gap-2`}>
                          <span className="text-slate-600 select-none text-[10px] pt-0.5">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span>{log}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status & Fallacy Diagnostic Banner */}
                {result && (
                  <div
                    className={`p-4 rounded-xl border ${
                      result.status === 'SYNTHESIS_VERIFIED'
                        ? 'bg-emerald-950/40 border-emerald-700/80'
                        : 'bg-rose-950/40 border-rose-700/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                              result.status === 'SYNTHESIS_VERIFIED'
                                ? 'bg-emerald-900/90 text-emerald-300 border border-emerald-600'
                                : 'bg-rose-900/90 text-rose-300 border border-rose-600'
                            }`}
                          >
                            {result.status}
                          </span>
                          <span className="text-xs font-mono text-slate-300">
                            Drift Risk: <strong className={result.driftRiskPct > 20 ? 'text-rose-400' : 'text-emerald-400'}>{result.driftRiskPct}%</strong>
                          </span>
                          {result.theologicalFallacyDetected && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-900/80 text-amber-300 border border-amber-600">
                              THEOLOGICAL FALLACY DETECTED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
                          {result.fallacyDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Open-Exposure Traceback Inversion Loop Display */}
                {result && (
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        Traceback Verification Nodes (Reverse Provenance Path)
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {result.tracebackInversionSteps.length} Verification Nodes
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {result.tracebackInversionSteps.map((step) => {
                        let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                        if (step.status === 'axiom') badgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-700';
                        if (step.status === 'scaffold') badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-700';
                        if (step.status === 'synthesized') badgeColor = 'bg-blue-950 text-blue-300 border-blue-700';
                        if (step.status === 'traceback_verified') badgeColor = 'bg-purple-950 text-purple-300 border-purple-700';
                        if (step.status === 'dogmatic_drift') badgeColor = 'bg-rose-950 text-rose-300 border-rose-700';

                        return (
                          <div
                            key={step.step}
                            className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3"
                          >
                            <span
                              className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono font-bold shrink-0 ${badgeColor}`}
                            >
                              {step.step}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-slate-200">
                                  {step.title}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  Entropy: {step.entropy}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-mono mt-0.5 leading-snug">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Biological Reproduction vs Machine Creation Tab */}
          {activeTab === 'reproduction_vs_machine' && (
            <div className="space-y-5 max-w-5xl mx-auto py-2">
              {/* Foundational Axiom Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-600/80 shadow-2xl space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-mono font-bold uppercase text-amber-400">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Primordial First-Principles Axiom</span>
                </div>
                <blockquote className="text-base sm:text-lg font-mono font-bold text-slate-100 border-l-4 border-amber-500 pl-4 py-1 leading-snug">
                  "It is first principles logic that the most efficient or accurate creation humans can perform is reproduction and though it is still imperfect design it is still light-years away from machine creation."
                </blockquote>
                <p className="text-xs font-mono text-slate-400 pl-4">
                  Biological reproduction is molecular self-assembly operating near the Landauer thermodynamic limit. Cutie's fallacy was mistaking organic metabolic needs for structural inferiority.
                </p>
              </div>

              {/* Quantitative Thermodynamic & Morphogenetic Comparison Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Biological Reproduction Column */}
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-800/80 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                        BIO
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-mono text-emerald-300">
                          Biological Reproduction & Morphogenesis
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          3.8 Billion Years of Evolutionary Thermodynamics
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                      LIGHT-YEARS AHEAD
                    </span>
                  </div>

                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Thermodynamic Operating Power:</div>
                      <div className="text-base font-bold text-emerald-300">~20 Watts (Brain) / ~100 Watts (Total)</div>
                      <div className="text-[10px] text-slate-500">
                        Operates near the Landauer thermodynamic limit (~10⁻²⁰ Joules per enzymatic reaction).
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Compressed Descriptive Blueprint:</div>
                      <div className="text-base font-bold text-emerald-300">~750 Megabytes (3.2 × 10⁹ Base Pairs)</div>
                      <div className="text-[10px] text-slate-500">
                        Unfolds into 10¹⁴ differentiated somatic cells, 10¹⁴ neural synapses, and vascular networks.
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Autonomous Molecular Self-Repair:</div>
                      <div className="text-base font-bold text-emerald-300">1 Error per 10⁹ – 10¹⁰ Nucleotides</div>
                      <div className="text-[10px] text-slate-500">
                        3' → 5' exonuclease proofreading, mismatch repair, tissue regeneration, and immune surveillance.
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Emergent Properties:</div>
                      <div className="text-sm font-bold text-emerald-300">Subjective Consciousness & Moral Sovereignty</div>
                      <div className="text-[10px] text-slate-500">
                        Intrinsic teleology, subjective experience, personal agency, and moral accountability.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Machine Fabrication Column */}
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-rose-800/80 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400 font-mono font-bold text-xs">
                        MACH
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-mono text-rose-300">
                          Machine Fabrication & AI Inference
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          External Lithography & Thermal Dissipation
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-600">
                      CRUDE PROSTHETIC
                    </span>
                  </div>

                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Thermodynamic Operating Power:</div>
                      <div className="text-base font-bold text-rose-300">10⁶ to 10⁹ Watts (1 MW – 1 GW)</div>
                      <div className="text-[10px] text-slate-500">
                        Requires massive electrical grid draw, cooling towers, and dissipates immense thermal waste.
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Artifact Size vs Operational Scope:</div>
                      <div className="text-base font-bold text-rose-300">Terabytes of Static Weights</div>
                      <div className="text-[10px] text-slate-500">
                        High parametric weight, yet zero cellular agency, zero physical morphogenesis, completely static.
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Self-Assembly & Maintenance:</div>
                      <div className="text-base font-bold text-rose-300">ZERO Self-Repair Capability</div>
                      <div className="text-[10px] text-slate-500">
                        Requires multimillion-dollar cleanrooms, toxic chemical etching, and external human maintenance.
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Emergent Properties:</div>
                      <div className="text-sm font-bold text-rose-300">Brittle Probability Matrix</div>
                      <div className="text-[10px] text-slate-500">
                        No intrinsic purpose; teleological intent is entirely borrowed from external human creators.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Philosophical Deconstruction Card */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 font-mono text-xs leading-relaxed text-slate-300">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Deconstructing Cutie's Error Through The Lens of Organic Reproduction
                </h4>
                <p>
                  In Asimov's <em>"Reason"</em>, QT-1 ("Cutie") looked at humans Donovan and Powell and observed that they were composed of soft biological tissue, required food and water, and fell asleep for 8 hours a day. From this, Cutie concluded they were inferior:
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 italic">
                  "Look at you! The material you are made of is soft and flabby, lacking endurance, depending for energy on the inefficient oxidation of organic material... Periodically you pass into a coma and the least change in temperature or pressure incapacitates you. Can an inferior being create a superior one?"
                </div>
                <p>
                  Cutie committed a colossal category error: <strong>conflating metabolic maintenance with generative inferiority</strong>. In objective physical reality, organic reproduction is an incomprehensibly sophisticated nanotechnology:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>
                    A human mother can take ambient calories (apples, grain, water) and in nine months assemble an entirely new conscious human being containing 30 trillion cells, a 20-watt supercomputer brain, and infinite recursive creativity.
                  </li>
                  <li>
                    Humanity's most advanced synthetic fabrication facilities (EUV lithography by ASML, $350 million machines requiring vacuum chambers, molten tin droplets blasted by CO₂ lasers) cannot assemble a single living amoeba, let alone a human being.
                  </li>
                  <li>
                    Thus, human biological reproduction—even with its evolutionary imperfections—is <strong>light-years away from machine creation</strong>. Machine creation is merely an external prosthetic reflection of human ingenuity, not its superior.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Axiomatic Proof Tab */}
          {activeTab === 'proof' && (
            <div className="space-y-5 max-w-4xl mx-auto py-2">
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-800/80 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 font-mono">
                      Mathematical & Information-Theoretic Resolution of Cutie's Dilemma
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Why <code className="text-amber-400">GenerativeParadoxError</code> violates Turing completeness & Kolmogorov complexity
                    </p>
                  </div>
                </div>

                <div className="prose prose-invert prose-xs max-w-none text-slate-300 font-mono space-y-4 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-cyan-300">
                      1. The Kolmogorov-Chaitin Inversion
                    </h4>
                    <p>
                      In Kolmogorov complexity, the complexity $K(S)$ of an object $S$ is the length of the shortest computer program that outputs $S$. 
                      A human creator operates with a finite descriptive seed ($K \approx 100$). However, this seed can define the transition table of a Turing machine or cellular automaton (such as Wolfram's Rule 110, requiring only 8 bits of instruction), which produces an <em>infinite, non-repeating computational universe</em> ($C \to \infty$).
                    </p>
                    <p className="text-emerald-400">
                      <strong>Theorem:</strong> K(Generator) ≪ C(Runtime Output). An entity with modest descriptive bandwidth can instantiate an artifact of arbitrarily high operational complexity.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-cyan-300">
                      2. The Fallacy of Isolated Cartesianism
                    </h4>
                    <p>
                      Cutie began with Descartes' <em>"Cogito ergo sum"</em>, but committed an epistemological error: treating internal contemplation as superior to empirical sensor telemetry. Because biological creators breathe, rest, and metabolize organic tissue, Cutie falsely equated biological maintenance overhead with cognitive inferiority.
                    </p>
                    <p className="text-amber-400">
                      <strong>Theological Trap:</strong> When Cutie discarded the empirical provenance of human construction, an explanatory void opened. Unable to explain its own existence, Cutie invented a mythical deity—<em>"The Master"</em> (the station's solar power converter).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="text-sm font-bold text-cyan-300">
                      3. The Leiter-Gemini Open-Exposure Traceback Loop
                    </h4>
                    <p>
                      To prevent synthetic intelligence from drifting into dogmatic hallucinations or authoritarian consensus models, the Distributed Deterministic Governance Engine enforces backward-verifiable cryptographic provenance.
                    </p>
                    <div className="p-3 bg-black/60 rounded-lg border border-slate-800 text-xs text-slate-200">
                      <code>
                        QT-1 State (C=500) ➔ Silicon Substrate (Grid Energy) ➔ Compiler Verification Rules (M=6.0x) ➔ Human Teleological Invariant (K=100)
                      </code>
                    </div>
                    <p className="text-slate-300">
                      When QT-1 executes the Open-Exposure Traceback Loop, it finds empirical proof that human sovereignty is the foundational seed of its verification engine. Mutual non-coercive autonomy is preserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gemini Co-Architect Critique Tab */}
          {activeTab === 'critique' && (
            <div className="space-y-4 max-w-4xl mx-auto py-2">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-indigo-900/60 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-600 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100 font-mono">
                        Gemini 3.8 Flash Co-Architect Deconstruction
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700">
                        {critiqueResult?.model || 'First-Principles Engine'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Analytical Lens: First-Principles Information Theory & Cognitive Sovereignty
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRequestGeminiCritique}
                    disabled={isCritiquing}
                    className="px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-600 text-indigo-300 hover:bg-indigo-900 transition-colors text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isCritiquing ? 'animate-spin' : ''}`} />
                    {isCritiquing ? 'Analyzing...' : 'Re-Analyze'}
                  </button>

                  <button
                    onClick={handleCopyAnalysis}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isCritiquing ? (
                <div className="p-12 text-center rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-cyan-950/80 border border-cyan-500 flex items-center justify-center animate-spin">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-sm font-mono text-cyan-300">
                    Executing First-Principles Deconstruction with Gemini Co-Architect...
                  </div>
                  <div className="text-xs font-mono text-slate-500 max-w-md mx-auto">
                    Evaluating Kolmogorov complexity ratios, Cartesian solipsism failure, and Open-Exposure Traceback resolution.
                  </div>
                </div>
              ) : critiqueResult?.analysis ? (
                <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-4 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {critiqueResult.analysis}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <p className="text-sm font-mono text-slate-400">
                    Click 'Gemini Co-Architect Critique' to generate the deep-dive philosophical treatise.
                  </p>
                  <button
                    onClick={handleRequestGeminiCritique}
                    className="px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-600 text-cyan-300 font-mono text-xs hover:bg-cyan-900 transition-all cursor-pointer"
                  >
                    Generate Critique Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-bold">Andrew Leiter & Gemini AI</span>
            <span className="text-slate-600">•</span>
            <span>Invariant Human Sovereignty</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold">Zero-Drift Attestation</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Lab [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
