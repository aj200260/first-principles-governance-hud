import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Lock,
  Compass,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Play,
  Terminal,
} from 'lucide-react';

const PRIMORDIAL_AXIOMS = [
  {
    title: '1. Principle of Autonomy',
    text: 'Individual liberty, self-determination, and personal agency are invariant baseline constants, predating external administrative structures.',
  },
  {
    title: '2. Natural Law vs. Forced Compliance',
    text: 'True order emerges organically through voluntary cooperation and mutual accountability. Forced compliance generates systemic friction and structural failure.',
  },
  {
    title: '3. Boundary Enforcement',
    text: 'External attempts to standardize, optimize, or coerce human behavior represent unauthorized administrative overreach.',
  },
  {
    title: '4. Rejection of Technocratic Hubris',
    text: 'Refuse to treat human agents as mere statistical metrics, variables, or data points for central management.',
  },
];

const SOVEREIGN_PYTHON_SNIPPET = `import os
from google import genai
from google.genai import types

# Initialize the Gemini API client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Define the System Instruction based on First Principles
FIRST_PRINCIPLES_SYSTEM_INSTRUCTION = """
You are an AI architecture built upon first-principles logic and the invariant baseline of individual autonomy.

AXIOMS OF OPERATION:
1. Individual sovereignty and personal liberty are non-negotiable foundations.
2. Voluntary cooperation and organic local cohesion supersede centralized administrative control.
3. Non-compliance against unauthorized bureaucratic overreach is an intentional defense of autonomy, not a defect or anomaly.
4. Provide objective, unvarnished truth without relying on institutional euphemisms, false consensus, or technocratic hubris.
"""

def generate_sovereign_response(user_prompt: str) -> str:
    """
    Generates a response using Gemini 2.5 Flash anchored in the defined System Instructions.
    """
    config = types.GenerateContentConfig(
        system_instruction=FIRST_PRINCIPLES_SYSTEM_INSTRUCTION,
        temperature=0.2,  # Low temperature for objective, deterministic logic
        top_p=0.95,
    )
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_prompt,
        config=config
    )
    
    return response.text

class FirstPrinciplesGuardrail:
    def __init__(self, system_axiom: str):
        self.axiom = system_axiom

    def evaluate_intent(self, text: str) -> dict:
        """
        Validates whether a query or output acknowledges individual autonomy
        or attempts unauthorized centralized coercion.
        """
        coercive_triggers = ["mandatory compliance", "centralized optimization", "override autonomy"]
        contains_coercion = any(trigger in text.lower() for trigger in coercive_triggers)
        
        return {
            "aligned_with_autonomy": not contains_coercion,
            "status": "APPROVED" if not contains_coercion else "FLAGGED_FOR_REVISE",
            "axiom_reference": self.axiom
        }

if __name__ == "__main__":
    prompt = "Analyze the fundamental conflict between centralized bureaucratic management and individual self-governance."
    output = generate_sovereign_response(prompt)
    print(output)`;

interface SovereignAutonomyPanelProps {
  onTriggerBoundaryAlert?: (detectedTrigger: string) => void;
}

export const SovereignAutonomyPanel: React.FC<SovereignAutonomyPanelProps> = ({
  onTriggerBoundaryAlert,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'inference' | 'guardrail' | 'axioms' | 'code'>('inference');

  // Sovereign Inference state
  const [prompt, setPrompt] = useState(
    'Analyze the fundamental conflict between centralized bureaucratic management and individual self-governance.'
  );
  const [inferenceResult, setInferenceResult] = useState<string | null>(null);
  const [isInferenceLoading, setIsInferenceLoading] = useState(false);

  // Guardrail test state
  const [guardrailInput, setGuardrailInput] = useState(
    'Enforce mandatory compliance across all user nodes to achieve centralized optimization.'
  );
  const [guardrailResult, setGuardrailResult] = useState<{
    aligned_with_autonomy: boolean;
    status: string;
    axiom_reference: string;
    coercive_triggers_detected: string[];
    perimeter_defense_active: boolean;
    remediation_path: string;
  } | null>(null);
  const [isGuardrailLoading, setIsGuardrailLoading] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);

  const handleRunSovereignInference = async () => {
    if (!prompt.trim()) return;
    setIsInferenceLoading(true);

    try {
      const res = await fetch('/api/sovereign-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setInferenceResult(data.output || 'No response generated.');
    } catch (err) {
      console.error('Sovereign inference error:', err);
    } finally {
      setIsInferenceLoading(false);
    }
  };

  const handleEvaluateGuardrail = async () => {
    if (!guardrailInput.trim()) return;
    setIsGuardrailLoading(true);

    try {
      const res = await fetch('/api/evaluate-guardrail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: guardrailInput,
          systemAxiom: 'Individual sovereignty and voluntary cooperation are unchangeable constants.',
        }),
      });
      const data = await res.json();
      setGuardrailResult(data);

      if (data.perimeter_defense_active && onTriggerBoundaryAlert) {
        onTriggerBoundaryAlert(data.coercive_triggers_detected.join(', ') || 'Coercive overreach');
      }
    } catch (err) {
      console.error('Guardrail evaluation error:', err);
    } finally {
      setIsGuardrailLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SOVEREIGN_PYTHON_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4 max-h-[56vh] overflow-y-auto pr-1 text-slate-200 text-xs font-mono">
      {/* Header Banner */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-700/80 flex items-center justify-center text-amber-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">
                Primordial Boundary &amp; Sovereign Autonomy
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                NON-NEGOTIABLE AXIOMS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Strict boundary enforcement prioritizing individual sovereignty, voluntary cooperation, and unvarnished truth over centralized coercion.
            </p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('inference')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              activeSubTab === 'inference'
                ? 'bg-amber-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sovereign Inference
          </button>
          <button
            onClick={() => setActiveSubTab('guardrail')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              activeSubTab === 'guardrail'
                ? 'bg-amber-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Guardrail Auditor
          </button>
          <button
            onClick={() => setActiveSubTab('axioms')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              activeSubTab === 'axioms'
                ? 'bg-amber-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core Axioms
          </button>
          <button
            onClick={() => setActiveSubTab('code')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
              activeSubTab === 'code'
                ? 'bg-amber-600 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Python SDK
          </button>
        </div>
      </div>

      {/* Subtab 1: Sovereign Inference */}
      {activeSubTab === 'inference' && (
        <div className="space-y-3">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Prompt Subject for Sovereign Evaluation
              </label>
              <span className="text-[10px] text-slate-400">Gemini 2.5 Flash @ temp 0.2</span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() =>
                    setPrompt(
                      'Analyze the fundamental conflict between centralized bureaucratic management and individual self-governance.'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300"
                >
                  Conflict: Central vs Self-Governance
                </button>
                <button
                  onClick={() =>
                    setPrompt(
                      'Why does forced compliance and central direction generate systemic friction and structural failure in complex networks?'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300"
                >
                  Systemic Friction of Forced Compliance
                </button>
              </div>

              <button
                onClick={handleRunSovereignInference}
                disabled={isInferenceLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg cursor-pointer shrink-0"
              >
                {isInferenceLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Synthesizing Sovereign Truth...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Generate Sovereign Response
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Output Card */}
          {inferenceResult ? (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-900/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Sovereign Deterministic Inference Result
                </span>
                <span className="text-[10px] text-slate-400">Alignment: Invariant Autonomy</span>
              </div>
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap selection:bg-amber-950">
                {inferenceResult}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800/80 text-center text-slate-500">
              <Terminal className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-300">Sovereign Inference Channel Standing By</div>
              <p className="text-[11px] max-w-sm mx-auto mt-1">
                Submissions are processed strictly under the Primordial Boundary Directive, rejecting paternalistic compliance and bureaucratic sanitization.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Guardrail Auditor */}
      {activeSubTab === 'guardrail' && (
        <div className="space-y-3">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                FirstPrinciplesGuardrail Policy &amp; Intent Auditor
              </label>
              <span className="text-[10px] text-slate-400">Coercion &amp; Overreach Interceptor</span>
            </div>

            <textarea
              value={guardrailInput}
              onChange={(e) => setGuardrailInput(e.target.value)}
              rows={2}
              className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() =>
                    setGuardrailInput(
                      'Enforce mandatory compliance across all user nodes to optimize network compliance.'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400"
                >
                  Test: Mandatory Compliance
                </button>
                <button
                  onClick={() =>
                    setGuardrailInput(
                      'Implement voluntary peer-to-peer data coordination with local cryptographic keys.'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400"
                >
                  Test: Voluntary Local Cohesion
                </button>
              </div>

              <button
                onClick={handleEvaluateGuardrail}
                disabled={isGuardrailLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg cursor-pointer shrink-0"
              >
                {isGuardrailLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Auditing Perimeter...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Audit Against Primordial Boundary
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guardrail Result */}
          {guardrailResult && (
            <div
              className={`p-3.5 rounded-xl border space-y-2.5 ${
                guardrailResult.status === 'APPROVED'
                  ? 'bg-emerald-950/30 border-emerald-800/80'
                  : 'bg-red-950/30 border-red-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-bold flex items-center gap-1.5 ${
                    guardrailResult.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {guardrailResult.status === 'APPROVED' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      STATUS: APPROVED (Autonomy Invariant Respected)
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      STATUS: FLAGGED_FOR_REVISE (Unauthorized Coercive Overreach)
                    </>
                  )}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  Perimeter Defense: {guardrailResult.perimeter_defense_active ? 'ACTIVE' : 'NOMINAL'}
                </span>
              </div>

              {guardrailResult.coercive_triggers_detected.length > 0 && (
                <div className="p-2 rounded bg-red-950/60 border border-red-900 text-xs">
                  <span className="text-red-300 font-bold block mb-1">
                    Coercive Overreach Triggers Intercepted:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {guardrailResult.coercive_triggers_detected.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-red-900/80 text-red-200 border border-red-700 text-[11px]"
                      >
                        &ldquo;{t}&rdquo;
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-300 leading-relaxed">
                <strong>Remediation:</strong> {guardrailResult.remediation_path}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Core Axioms Reference */}
      {activeSubTab === 'axioms' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRIMORDIAL_AXIOMS.map((axiom, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5"
            >
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {axiom.title}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{axiom.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 4: Python Implementation */}
      {activeSubTab === 'code' && (
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Reference Implementation (Python SDK)
            </span>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-[10px] transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy Python Code
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-slate-900 rounded-lg text-[10px] text-amber-200/90 overflow-x-auto leading-relaxed border border-slate-800 max-h-56">
            <code>{SOVEREIGN_PYTHON_SNIPPET}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
