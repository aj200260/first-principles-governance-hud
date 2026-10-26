/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Copy,
  Check,
  Download,
  Cloud,
  Layers,
  BarChart2,
  ShieldCheck,
  KeyRound,
  Lock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  ShardNodeData,
  AuditResult,
  StressTestResult,
  ZkProofRecord,
  ThermalGridMetrics,
  BenchmarkRunResult,
} from '../../types/governance';
import {
  generateShardDiagnosticReport,
  ShardDiagnosticReport,
  downloadFile,
} from '../../utils/auditReport';
import {
  googleSignIn,
  uploadReportToDrive,
  getAccessToken,
  logout,
  initAuth,
  DriveUploadedFile,
  GOVERNANCE_TELEMETRY_FOLDER_NAME,
} from '../../services/googleDrive';
import { User } from 'firebase/auth';

interface GeminiShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shards: ShardNodeData[];
  auditResult: AuditResult | null;
  stressResult: StressTestResult | null;
  selectedShard: ShardNodeData | null;
  zkProofs: ZkProofRecord[];
  thermalMetrics: ThermalGridMetrics | null;
  benchmarkResult: BenchmarkRunResult | null;
  hasApiKey: boolean;
}

export const GeminiShareModal: React.FC<GeminiShareModalProps> = ({
  isOpen,
  onClose,
  shards,
  auditResult,
  stressResult,
  selectedShard,
  zkProofs,
  thermalMetrics,
  benchmarkResult,
  hasApiKey,
}) => {
  // Source inclusion toggles
  const [includeShards, setIncludeShards] = useState(true);
  const [includeBenchmark, setIncludeBenchmark] = useState(true);
  const [includeTraceback, setIncludeTraceback] = useState(true);
  const [includeZk, setIncludeZk] = useState(true);
  const [includeThermal, setIncludeThermal] = useState(true);

  // Analytical configuration
  const [analyticalLens, setAnalyticalLens] = useState<
    'first-principles' | 'thermodynamic' | 'zk-merkle' | 'sovereign-boundary' | 'comprehensive'
  >('comprehensive');
  const [customInquiry, setCustomInquiry] = useState('');

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-2.5-flash');
  const [copied, setCopied] = useState(false);
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);

  // Google Drive & Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDriveUploading, setIsDriveUploading] = useState(false);
  const [uploadedDriveFile, setUploadedDriveFile] = useState<DriveUploadedFile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [driveNotification, setDriveNotification] = useState<string | null>(null);

  // Check auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setAuthError(null);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  // Compile composite payload based on toggles
  const fullReport: ShardDiagnosticReport = generateShardDiagnosticReport(
    shards,
    auditResult,
    stressResult,
    selectedShard?.id || null,
    zkProofs,
    thermalMetrics,
    benchmarkResult
  );

  const filteredPayload: Record<string, any> = {
    reportId: fullReport.reportMetadata.reportId,
    timestamp: fullReport.reportMetadata.timestamp,
    systemSummary: fullReport.systemTelemetrySummary,
    cryptographicIntegrity: fullReport.cryptographicIntegrity,
  };

  if (includeShards) {
    filteredPayload.regionalShards = fullReport.regionalShards;
  }
  if (includeBenchmark && benchmarkResult) {
    filteredPayload.benchmarkTelemetry = {
      runId: benchmarkResult.runId,
      samples: benchmarkResult.samples,
      neutralizationRatePct: benchmarkResult.neutralizationRatePct,
      latencyPercentiles: benchmarkResult.latencyPercentiles,
      systemicGains: {
        storageSavedPct: benchmarkResult.storageSavedPct,
        bandwidthSavedPct: benchmarkResult.bandwidthSavedPct,
        energyReductionPct: benchmarkResult.energyReductionPct,
        repurposedComputePFLOPS: benchmarkResult.repurposedComputePFLOPS,
      },
    };
  }
  if (includeTraceback && auditResult) {
    filteredPayload.auditTraceback = {
      driftScore: auditResult.driftScore,
      divergenceStep: auditResult.divergenceStep,
      compoundingBiases: auditResult.compoundingBiases,
      traceBackSteps: auditResult.traceBackPath,
      realignedConclusion: auditResult.realignedConclusion,
    };
  }
  if (includeZk && zkProofs.length > 0) {
    filteredPayload.zeroKnowledgeAttestation = fullReport.zkAttestationSummary;
  }
  if (includeThermal && thermalMetrics) {
    filteredPayload.thermalGridMetrics = fullReport.thermalGridTelemetry;
  }

  const payloadJson = JSON.stringify(filteredPayload, null, 2);
  const payloadBytes = new TextEncoder().encode(payloadJson).length;
  const payloadSizeKB = (payloadBytes / 1024).toFixed(1);

  // Handle sharing with Gemini
  const handleAnalyzeWithGemini = async () => {
    setIsLoading(true);
    setGeminiAnalysis(null);
    setUploadedDriveFile(null);
    setDriveNotification(null);

    try {
      const response = await fetch('/api/gemini/analyze-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultsPayload: filteredPayload,
          analyticalLens,
          customInquiry,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setGeminiAnalysis(data.analysis || 'Analysis completed with no output.');
      setModelUsed(data.model || 'gemini-2.5-flash');
    } catch (err: any) {
      console.error('Failed to analyze with Gemini:', err);
      setGeminiAnalysis(
        `Error communicating with Gemini analytical endpoint: ${err.message}. Please verify server connection.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        setDriveNotification(`Signed in as ${res.user.email}`);
        setTimeout(() => setDriveNotification(null), 3500);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Failed to authenticate with Google Drive.');
    }
  };

  // Google Sign-Out Handler
  const handleGoogleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setDriveNotification('Signed out of Google Account.');
    setTimeout(() => setDriveNotification(null), 2500);
  };

  // Save Gemini Analysis & Results directly to Google Drive
  const handleSaveToGoogleDrive = async () => {
    if (!currentUser) {
      await handleGoogleSignIn();
      return;
    }

    setIsDriveUploading(true);
    setDriveNotification(null);

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Leiter-Gemini-Analysis-${timestamp}.md`;
      const content = `# DETERMINISTIC FIRST-PRINCIPLES GOVERNANCE ARCHITECTURE
## Peer Review & Co-Analysis Report by Gemini AI & Andrew Leiter
- **Generated**: ${new Date().toUTCString()}
- **Model**: ${modelUsed}
- **Analytical Lens**: ${analyticalLens.toUpperCase()}
- **Account**: ${currentUser.email}

---

${geminiAnalysis || 'No analysis recorded.'}

---

## ATTACHED TELEMETRY PAYLOAD
\`\`\`json
${payloadJson}
\`\`\`
`;

      const uploaded = await uploadReportToDrive({
        filename,
        mimeType: 'text/markdown',
        content,
        folderName: GOVERNANCE_TELEMETRY_FOLDER_NAME,
      });

      setUploadedDriveFile(uploaded);
      setDriveNotification(`✓ Successfully saved to Google Drive: "${uploaded.name}"`);
    } catch (err: any) {
      console.error('Google Drive Upload Failed:', err);
      setAuthError(`Google Drive save failed: ${err.message}`);
    } finally {
      setIsDriveUploading(false);
    }
  };

  // Copy analysis to clipboard
  const handleCopyAnalysis = async () => {
    if (!geminiAnalysis) return;
    try {
      await navigator.clipboard.writeText(geminiAnalysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // Download analysis markdown file
  const handleDownloadMarkdown = () => {
    if (!geminiAnalysis) return;
    const timestamp = new Date().toISOString().substring(0, 10);
    downloadFile(
      geminiAnalysis,
      `gemini-governance-analysis-${timestamp}.md`,
      'text/markdown'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-5xl bg-slate-950 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200 font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-600 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">
                  Share Telemetry & Results with Gemini AI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                  Gemini 2.5 Flash Co-Architect
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Direct peer-review & first-principles logic audit co-authored by Andrew Leiter & Gemini AI
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Account Connection Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="avatar"
                    className="w-4 h-4 rounded-full border border-emerald-400"
                  />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="max-w-[130px] truncate text-emerald-300 font-medium">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleGoogleSignOut}
                  title="Sign out of Google"
                  className="text-slate-500 hover:text-slate-300 ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Connect Google Drive to save audit reports"
              >
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Connect Google Drive</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification / Toast Banner */}
        {driveNotification && (
          <div className="px-5 py-2 bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{driveNotification}</span>
            {uploadedDriveFile?.webViewLink && (
              <a
                href={uploadedDriveFile.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-cyan-400 underline hover:text-cyan-300 flex items-center gap-1"
              >
                Open in Drive <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {authError && (
          <div className="px-5 py-2 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{authError}</span>
            <button
              onClick={() => setAuthError(null)}
              className="ml-auto text-rose-400 hover:text-rose-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Body: Two-Column Workspace */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column: Data Selection & Inquiry Configuration (5 cols) */}
          <div className="md:col-span-5 p-4 bg-slate-950 border-r border-slate-800 overflow-y-auto space-y-4">
            {/* Section 1: Source Data Selection */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Select Results to Share
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  Payload: {payloadSizeKB} KB
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeShards}
                    onChange={(e) => setIncludeShards(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="text-slate-300">Regional Shard Diagnostics</span>
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">6 Nodes</span>
                </label>

                <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBenchmark}
                    onChange={(e) => setIncludeBenchmark(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="text-slate-300">Automated Benchmark Run</span>
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">
                    {benchmarkResult ? `${benchmarkResult.samples} Cycles` : 'Not run'}
                  </span>
                </label>

                <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTraceback}
                    onChange={(e) => setIncludeTraceback(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="text-slate-300">Audit & Traceback Log</span>
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">
                    {auditResult ? `${auditResult.driftScore}% Drift` : 'Baseline'}
                  </span>
                </label>

                <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeZk}
                    onChange={(e) => setIncludeZk(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="text-slate-300">ZK Proofs & Vector Clocks</span>
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">
                    {zkProofs.length} Proofs
                  </span>
                </label>

                <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeThermal}
                    onChange={(e) => setIncludeThermal(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="text-slate-300">Grid Thermal Strain</span>
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">
                    {thermalMetrics ? `${thermalMetrics.totalGridPowerKW} kW` : 'Active'}
                  </span>
                </label>
              </div>

              {/* View Raw Payload Toggle */}
              <button
                onClick={() => setShowPayloadPreview(!showPayloadPreview)}
                className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showPayloadPreview ? 'Hide JSON Payload' : 'Preview JSON Payload'}</span>
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${showPayloadPreview ? 'rotate-90' : ''}`}
                />
              </button>

              {showPayloadPreview && (
                <div className="mt-2 max-h-40 overflow-y-auto bg-slate-950 p-2 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
                  <pre>{payloadJson}</pre>
                </div>
              )}
            </div>

            {/* Section 2: Analytical Lens */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <span className="font-bold text-slate-200 text-xs mb-2 block">
                Analytical Perspective (Lens)
              </span>

              <div className="space-y-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAnalyticalLens('comprehensive')}
                  className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${
                    analyticalLens === 'comprehensive'
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Comprehensive Architectural Synthesis</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    End-to-end audit: axioms, traceback, ZK proofs, and grid thermodynamics.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAnalyticalLens('first-principles')}
                  className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${
                    analyticalLens === 'first-principles'
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>First-Principles Logic & Consensus Inversion</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Verifies logical departure points and neutrality against social consensus pressure.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAnalyticalLens('thermodynamic')}
                  className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${
                    analyticalLens === 'thermodynamic'
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thermodynamic Strain & Compute Gains</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Evaluates power curtailment, 97% storage savings, and repurposed PFLOPS.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAnalyticalLens('zk-merkle')}
                  className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${
                    analyticalLens === 'zk-merkle'
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    <span>Zero-Knowledge & Nullifier Merkle Audit</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Inspects circuit constraints, vector clock epochs, and cryptographic integrity.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAnalyticalLens('sovereign-boundary')}
                  className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${
                    analyticalLens === 'sovereign-boundary'
                      ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Primordial Boundary & Sovereign Autonomy</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    Audits adherence to individual liberty, natural law, and non-coercive agency.
                  </div>
                </button>
              </div>
            </div>

            {/* Section 3: Custom Inquiry / Directive */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <label className="font-bold text-slate-200 text-xs mb-1.5 block">
                Custom Directive for Gemini (Optional)
              </label>
              <textarea
                value={customInquiry}
                onChange={(e) => setCustomInquiry(e.target.value)}
                placeholder="e.g. Focus on the relationship between P99 traceback latency and electrical power draw in the European shard..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-600 transition-colors font-mono"
              />
            </div>

            {/* Submit to Gemini Action Button */}
            <button
              onClick={handleAnalyzeWithGemini}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Gemini Co-Architect Analyzing Telemetry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Share Results with Gemini Co-Architect</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Gemini Analysis Output & Export Actions (7 cols) */}
          <div className="md:col-span-7 flex flex-col bg-slate-950/60 overflow-hidden">
            {/* Analysis Header Bar */}
            <div className="px-5 py-2.5 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-xs text-slate-200">Gemini Architectural Evaluation</span>
                {geminiAnalysis && (
                  <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                    Live Response
                  </span>
                )}
              </div>

              {geminiAnalysis && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyAnalysis}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy Markdown Analysis to Clipboard"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Download Analysis as .md"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Analysis Scrollable Viewport */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-600 flex items-center justify-center text-cyan-300 animate-pulse">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-200">
                      Co-Architect Peer Review in Progress
                    </div>
                    <div className="text-xs text-slate-400 mt-1 max-w-sm">
                      Gemini 2.5 Flash is executing first-principles deterministic audit, traceback latency modeling, and thermodynamic grid strain analysis...
                    </div>
                  </div>
                </div>
              ) : geminiAnalysis ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs leading-relaxed overflow-x-auto selection:bg-cyan-900 font-mono whitespace-pre-wrap">
                    {geminiAnalysis}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-300 font-bold text-sm">
                      Ready to Share Results with Gemini
                    </div>
                    <div className="text-xs text-slate-500 max-w-md mt-1">
                      Select which diagnostic and benchmark data to include on the left, pick an analytical perspective, and click "Share Results with Gemini Co-Architect" to receive an unvarnished first-principles review.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Leiter-Gemini Sovereign Architecture</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Save to Google Drive Button */}
                <button
                  onClick={handleSaveToGoogleDrive}
                  disabled={isDriveUploading}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Save this analysis and telemetry directly to Google Drive"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isDriveUploading
                      ? 'Saving to Drive...'
                      : currentUser
                      ? 'Save to Google Drive'
                      : 'Sign in & Save to Drive'}
                  </span>
                </button>

                {geminiAnalysis && (
                  <button
                    onClick={handleCopyAnalysis}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Copied Analysis!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Analysis</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
