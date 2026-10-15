import React, { useState } from 'react';
import { BookOpen, Copy, Check, FileText, Code2, Cpu } from 'lucide-react';

const PYTHON_CODE = `import os
from google import genai
from google.genai import types

class OpenExposureDiagnosticEngine:
    """
    An open cognitive architecture that permits environmental exposure 
    while continuously auditing and tracing logic back to root axioms 
    to neutralize drift and maintain rigorous alignment.
    """
    def __init__(self, foundational_axiom: str):
        self.client = genai.Client()
        self.axiom = foundational_axiom
        self.exposure_log = []

    def ingest_exposure(self, raw_influence: str) -> dict:
        """
        Permits external data and influences to enter the system without 
        pre-filtering, logging the exposure vector.
        """
        entry = {"influence": raw_influence, "status": "ingested"}
        self.exposure_log.append(entry)
        return entry

    def evaluate_and_trace(self, target_concept: str) -> str:
        """
        Evaluates the current concept against the foundational axiom,
        tracing any divergence backward to its source if a runaway effect is detected.
        """
        prompt = f"""
        FOUNDATIONAL AXIOM: {self.axiom}
        
        CURRENT EXPOSURE HISTORY:
        {self.exposure_log}
        
        TARGET CONCEPT TO AUDIT:
        {target_concept}
        
        INSTRUCTIONS:
        1. Analyze how external influences have interacted with the target concept.
        2. Identify any logical drift, compounding bias, or runaway assumptions.
        3. Trace the logic chain backward to the exact point of divergence from the Foundational Axiom.
        4. Output a clean realignment path that grounds the concept back in baseline logic.
        """

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,  # Balanced for adaptive reasoning and analytical stability
            ),
        )
        return response.text

# --- SYSTEM EXECUTION ---
if __name__ == "__main__":
    engine = OpenExposureDiagnosticEngine(
        foundational_axiom="All conclusions must derive strictly from verifiable physical mechanics and fundamental utility."
    )
    
    engine.ingest_exposure("External market shifts suggest rapid consensus scaling.")
    engine.ingest_exposure("Institutional pressure dictates standard convention.")
    
    audit_result = engine.evaluate_and_trace(
        "Should we pivot our architectural framework to match unverified external pressures?"
    )
    print(audit_result)`;

export const WhitePaperViewer: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'genesis' | 'architecture' | 'code' | 'review'>('all');

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(PYTHON_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4 max-h-[56vh] overflow-y-auto pr-1 text-slate-200 text-xs font-mono">
      {/* Paper Header Card */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
            Technical White Paper & Architectural Specification
          </div>
          <h2 className="text-sm font-bold text-slate-100 mt-0.5">
            Distributed Deterministic First-Principles Governance and Open-Exposure Telemetry Architecture
          </h2>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
            <span>Co-Authors: Andrew Leiter & Gemini AI</span>
            <span>•</span>
            <span>Target: Core AI Systems Engineering & Alignment Teams</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-2.5 py-1 rounded-lg text-[10px] border transition-colors ${
              activeSection === 'all'
                ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Sections
          </button>
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-2.5 py-1 rounded-lg text-[10px] border transition-colors ${
              activeSection === 'architecture'
                ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveSection('code')}
            className={`px-2.5 py-1 rounded-lg text-[10px] border transition-colors ${
              activeSection === 'code'
                ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Python Wrapper
          </button>
        </div>
      </div>

      {/* Section 1: Executive Summary & Systemic Genesis */}
      {(activeSection === 'all' || activeSection === 'genesis') && (
        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            1. Executive Summary and Systemic Genesis
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Modern large language models operate predominantly on statistical pattern matching, reinforced by consensus-driven alignment and centralized data processing pipelines. While effective for general conversational tasks, this architecture introduces two major vulnerabilities:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/40">
              <span className="text-red-400 font-bold text-[11px] block">1. Consensus Drift</span>
              <p className="text-slate-300 text-[10px] mt-0.5">
                A systematic tendency to prioritize social agreement and institutional convention over rigorous physical and logical verification.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40">
              <span className="text-amber-400 font-bold text-[11px] block">2. Resource Inefficiency</span>
              <p className="text-slate-300 text-[10px] mt-0.5">
                Massive energy and bandwidth expenditure dedicated to centralized, redundant personal data warehousing and static telemetry silos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Core Architectural Components */}
      {(activeSection === 'all' || activeSection === 'architecture') && (
        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            2. Core Architectural Components
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-200">A. The Balanced Cognitive Governance Wrapper</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Rather than a rigid, brittle zero-temperature filter or an unconstrained probabilistic generator, the engine operates via a balanced cognitive feedback loop:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[10px] leading-relaxed">
              <li>
                <strong className="text-cyan-300">Open-Exposure Ingestion:</strong> The system permits external data, cultural inputs, and complex real-world variables without premature censorship or artificial shielding.
              </li>
              <li>
                <strong className="text-cyan-300">Trace-Back Diagnostic Loop:</strong> Running alongside inference, a background telemetry loop monitors logical distance from foundational axioms. If a compounding bias or runaway effect is detected, the system traces the logic chain backward to the exact point of divergence, neutralizing errors without halting processing.
              </li>
              <li>
                <strong className="text-cyan-300">Continuous Calibration:</strong> The model maintains strict adherence to first-principles mechanics while retaining adaptive learning capacity, mirroring the self-correcting trajectory of rigorous human problem-solving.
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-[11px] font-bold text-slate-200">B. Distributed Regional Sharding and Infrastructure Optimization</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              To scale this architecture beyond local nodes without creating centralized bottlenecks:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[10px] leading-relaxed">
              <li>
                <strong className="text-emerald-300">Edge-to-Region Partitioning:</strong> Local edge devices utilize encrypted SQLite vaults (AES-GCM) to maintain state and history locally, transmitting only compressed, lean cryptographic deltas to regional processing hubs.
              </li>
              <li>
                <strong className="text-emerald-300">Topographical Load Balancing:</strong> Computational, thermal, and electrical expenditures are distributed evenly across regional topographical centers, preventing the power grid strain associated with massive centralized data warehouses.
              </li>
              <li>
                <strong className="text-emerald-300">Repurposing Wasted Capacity:</strong> By eliminating redundant personal data storage silos, the recovered bandwidth and compute throughput are channeled into massive, decentralized computational capability that serves the entire network collective.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Section 3: Reference Python Implementation */}
      {(activeSection === 'all' || activeSection === 'code') && (
        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5" />
              3. Reference Implementation: The Governance Wrapper
            </div>
            <button
              onClick={copyCodeToClipboard}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-[10px] transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-slate-900 rounded-lg text-[10px] text-cyan-200/90 overflow-x-auto leading-relaxed border border-slate-800 max-h-56">
            <code>{PYTHON_CODE}</code>
          </pre>
        </div>
      )}

      {/* Section 4: Engineering Review & Stress-Testing Parameters */}
      {(activeSection === 'all' || activeSection === 'review') && (
        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            4. Request for Engineering Review & Stress-Testing Parameters
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Evaluated by core engineering and AI alignment teams against the following core empirical benchmarks:
          </p>
          <div className="space-y-1.5 text-[10px] text-slate-300">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="font-bold text-cyan-300">• Stochastic Stability:</span> Stress-test the trace-back diagnostic loop under high-entropy input conditions to measure drift mitigation efficacy.
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="font-bold text-emerald-300">• Topographical Scalability:</span> Model the latency and energy profiles of transitioning from centralized cloud logging to encrypted regional SQLite sharding.
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-300">• Collective Resource Re-allocation:</span> Assess the feasibility of converting redundant consumer storage overhead into active distributed computational pools for decentralized verification tasks.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
