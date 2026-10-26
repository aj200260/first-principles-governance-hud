import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  ShieldCheck,
  Server,
  Layers,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Cloud,
  ExternalLink,
  FolderOpen,
  LogOut,
  AlertCircle,
  RefreshCw,
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
  generateCsvReport,
  generateMarkdownReport,
  downloadFile,
  downloadShardDiagnosticReport,
  ShardDiagnosticReport,
} from '../../utils/auditReport';
import {
  saveDiagnosticReportToDrive,
  authorizeWithGoogleDrive,
  getAccessToken,
  signOutGoogleDrive,
  initAuth,
  listGovernanceTelemetryReports,
  GOVERNANCE_TELEMETRY_FOLDER_NAME,
  DriveUploadedFile,
} from '../../services/googleDrive';
import { User } from 'firebase/auth';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shards: ShardNodeData[];
  auditResult: AuditResult | null;
  stressResult: StressTestResult | null;
  selectedShard: ShardNodeData | null;
  zkProofs?: ZkProofRecord[];
  thermalMetrics?: ThermalGridMetrics | null;
  benchmarkResult?: BenchmarkRunResult | null;
  onShareWithGemini?: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  shards,
  auditResult,
  stressResult,
  selectedShard,
  zkProofs = [],
  thermalMetrics = null,
  benchmarkResult = null,
  onShareWithGemini,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all');
  const [formatTab, setFormatTab] = useState<'json' | 'csv' | 'markdown'>('json');
  const [copied, setCopied] = useState(false);

  // Google Drive & Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDriveSaving, setIsDriveSaving] = useState(false);
  const [driveSavedFile, setDriveSavedFile] = useState<DriveUploadedFile | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  // In-app confirmation dialog state for mutating Google Drive
  const [showDriveConfirmDialog, setShowDriveConfirmDialog] = useState(false);

  // Folder history viewer state
  const [showDriveHistory, setShowDriveHistory] = useState(false);
  const [driveHistoryFiles, setDriveHistoryFiles] = useState<DriveUploadedFile[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setDriveError(null);
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

  const currentShardId = filterMode === 'selected' && selectedShard ? selectedShard.id : null;
  const report: ShardDiagnosticReport = generateShardDiagnosticReport(
    shards,
    auditResult,
    stressResult,
    currentShardId,
    zkProofs,
    thermalMetrics,
    benchmarkResult
  );

  const jsonString = JSON.stringify(report, null, 2);
  const csvString = generateCsvReport(report);
  const markdownString = generateMarkdownReport(report);

  const currentContent =
    formatTab === 'json' ? jsonString : formatTab === 'csv' ? csvString : markdownString;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentContent);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentContent;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownload = () => {
    const filenamePrefix = report.reportMetadata.reportId.toLowerCase();
    if (formatTab === 'json') {
      downloadShardDiagnosticReport(report);
    } else if (formatTab === 'csv') {
      downloadFile(csvString, `${filenamePrefix}.csv`, 'text/csv');
    } else {
      downloadFile(markdownString, `${filenamePrefix}.md`, 'text/markdown');
    }
  };

  // Google Sign-In with official OAuth flow
  const handleAuthorizeDrive = async () => {
    setDriveError(null);
    try {
      const res = await authorizeWithGoogleDrive();
      if (res?.user) {
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      console.error('Drive Authorization Failed:', err);
      setDriveError(err.message || 'Google Drive authorization failed.');
    }
  };

  const handleSignOutDrive = async () => {
    try {
      await signOutGoogleDrive();
      setCurrentUser(null);
      setDriveSavedFile(null);
      setShowDriveHistory(false);
    } catch (err: any) {
      console.error('Drive Sign-out Failed:', err);
    }
  };

  // Open confirmation modal before uploading
  const handleInitiateSaveToDrive = async () => {
    setDriveError(null);
    const token = await getAccessToken();
    if (!token || !currentUser) {
      try {
        const authRes = await authorizeWithGoogleDrive();
        if (!authRes?.accessToken) {
          throw new Error('Authorization canceled or token not received.');
        }
        setCurrentUser(authRes.user);
        // Show confirmation dialog now that user is authenticated
        setShowDriveConfirmDialog(true);
      } catch (err: any) {
        console.error('Authorization error:', err);
        setDriveError(err.message || 'Authorization failed.');
      }
    } else {
      // User is already signed in, show confirmation dialog
      setShowDriveConfirmDialog(true);
    }
  };

  // Confirmed execution: upload structured JSON to designated 'GovernanceTelemetry' folder
  const handleConfirmSaveToDrive = async () => {
    setShowDriveConfirmDialog(false);
    setIsDriveSaving(true);
    setDriveError(null);
    try {
      const filenamePrefix = report.reportMetadata.reportId.toLowerCase();
      const uploaded = await saveDiagnosticReportToDrive({
        reportData: report,
        customFilename: `${filenamePrefix}.json`,
        folderName: GOVERNANCE_TELEMETRY_FOLDER_NAME,
        description: `Structured JSON Diagnostic Telemetry Report for ${report.reportMetadata.reportId}. Vector clock epoch #${report.regionalShards[0]?.vectorClockEpoch || 1}.`,
      });

      setDriveSavedFile(uploaded);
      // Refresh history list if it was open
      if (showDriveHistory) {
        loadDriveHistory();
      }
    } catch (err: any) {
      console.error('Save to Drive error:', err);
      setDriveError(err.message || 'Failed to save diagnostic report to Google Drive.');
    } finally {
      setIsDriveSaving(false);
    }
  };

  // Fetch file history in 'GovernanceTelemetry' folder
  const loadDriveHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const files = await listGovernanceTelemetryReports();
      setDriveHistoryFiles(files);
    } catch (err: any) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleHistoryView = () => {
    const nextState = !showDriveHistory;
    setShowDriveHistory(nextState);
    if (nextState && currentUser) {
      loadDriveHistory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-4xl bg-slate-950 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200 font-mono text-xs relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">
                  Shard Diagnostic Telemetry Export
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                  ZK-Attested v2.5
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  Drive: {GOVERNANCE_TELEMETRY_FOLDER_NAME}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Specification: Leiter-Gemini First-Principles Architecture
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Account Profile Indicator */}
            {currentUser ? (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-850 rounded-lg border border-slate-700 text-[11px]">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-4 h-4 rounded-full border border-slate-600"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-cyan-700 flex items-center justify-center text-[9px] text-white font-bold">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-slate-300 max-w-[130px] truncate">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleSignOutDrive}
                  title="Sign out of Google Account"
                  className="p-1 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuthorizeDrive}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 font-sans font-medium text-[11px] rounded-lg shadow-sm border border-slate-300 transition-all cursor-pointer"
                title="Connect Google Drive to enable saving to 'GovernanceTelemetry' folder"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
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

        {/* Scope Selector, Format Tabs Bar & Folder History Toggle */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Scope selection */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Scope:</span>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded text-[11px] border transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              All 6 Shards (Global Grid)
            </button>

            {selectedShard && (
              <button
                onClick={() => setFilterMode('selected')}
                className={`px-2.5 py-1 rounded text-[11px] border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filterMode === 'selected'
                    ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3 h-3 text-emerald-400" />
                Selected: {selectedShard.name}
              </button>
            )}
          </div>

          {/* Format selection and Drive History toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => {
                  setFormatTab('json');
                  setShowDriveHistory(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  formatTab === 'json' && !showDriveHistory
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3 h-3" />
                JSON
              </button>
              <button
                onClick={() => {
                  setFormatTab('csv');
                  setShowDriveHistory(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  formatTab === 'csv' && !showDriveHistory
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3 h-3" />
                CSV Matrix
              </button>
              <button
                onClick={() => {
                  setFormatTab('markdown');
                  setShowDriveHistory(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  formatTab === 'markdown' && !showDriveHistory
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3 h-3" />
                Markdown
              </button>
            </div>

            {currentUser && (
              <button
                onClick={toggleHistoryView}
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showDriveHistory
                    ? 'bg-amber-950 border-amber-600 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="View existing JSON reports saved in 'GovernanceTelemetry' folder on Google Drive"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Drive Folder</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload Status Banner */}
        {driveSavedFile && (
          <div className="px-5 py-2.5 bg-emerald-950/90 border-b border-emerald-700/80 flex items-center justify-between gap-3 text-[11px] text-emerald-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Saved to Google Drive: <strong>{driveSavedFile.name}</strong> in{' '}
                <span className="font-semibold text-emerald-300">
                  📁 {driveSavedFile.folderName}/
                </span>
              </span>
            </div>
            {driveSavedFile.webViewLink && (
              <a
                href={driveSavedFile.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 transition-colors"
              >
                <span>Open in Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Drive Error Banner */}
        {driveError && (
          <div className="px-5 py-2.5 bg-rose-950/90 border-b border-rose-800 flex items-center justify-between gap-3 text-[11px] text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{driveError}</span>
            </div>
            <button
              onClick={() => setDriveError(null)}
              className="text-rose-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950/80">
          {showDriveHistory ? (
            /* Drive Folder History Panel */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-slate-100">
                    Google Drive: /{GOVERNANCE_TELEMETRY_FOLDER_NAME}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({driveHistoryFiles.length} structured reports found)
                  </span>
                </div>
                <button
                  onClick={loadDriveHistory}
                  disabled={isLoadingHistory}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                  <span>Querying GovernanceTelemetry folder in Google Drive...</span>
                </div>
              ) : driveHistoryFiles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
                  <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-medium text-slate-300">No reports uploaded yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click "Save to Google Drive" below to write your first structured JSON report to
                    the designated '{GOVERNANCE_TELEMETRY_FOLDER_NAME}' folder.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {driveHistoryFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-slate-200 truncate">{file.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>ID: {file.id.substring(0, 14)}...</span>
                            <span>•</span>
                            <span>
                              {file.createdTime
                                ? new Date(file.createdTime).toLocaleString()
                                : 'Recent'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] flex items-center gap-1 border border-slate-700 shrink-0"
                        >
                          <span>View in Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Standard Code / Report Preview */
            <pre className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-200/90 text-[11px] leading-relaxed overflow-x-auto selection:bg-cyan-900">
              <code>{currentContent}</code>
            </pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic attestation: {report.cryptographicIntegrity.verificationHash}</span>
          </div>

          <div className="flex items-center gap-2">
            {onShareWithGemini && (
              <button
                onClick={() => {
                  onClose();
                  onShareWithGemini();
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Share this diagnostic report directly with Gemini Co-Architect"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Share with Gemini</span>
              </button>
            )}

            {/* Dedicated Google Drive Save Button */}
            <button
              onClick={handleInitiateSaveToDrive}
              disabled={isDriveSaving}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-600/80 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-950/40"
              title="Save structured JSON report directly to 'GovernanceTelemetry' folder in Google Drive"
            >
              <Cloud className={`w-3.5 h-3.5 text-emerald-400 ${isDriveSaving ? 'animate-bounce' : ''}`} />
              <span>
                {isDriveSaving
                  ? 'Saving to GovernanceTelemetry...'
                  : 'Save to Google Drive'}
              </span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Download .{formatTab === 'markdown' ? 'md' : formatTab}
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy {formatTab.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mandatory User Confirmation Dialog before uploading to Google Drive */}
        {showDriveConfirmDialog && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-emerald-500/80 rounded-2xl p-5 shadow-2xl text-slate-200 font-mono space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Confirm Google Drive Export
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Save structured diagnostic report to designated folder
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Target Folder:</span>
                  <span className="font-bold text-emerald-300">
                    📁 /{GOVERNANCE_TELEMETRY_FOLDER_NAME}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">File Name:</span>
                  <span className="font-bold text-cyan-300">
                    {report.reportMetadata.reportId.toLowerCase()}.json
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">MIME Type:</span>
                  <span className="text-slate-300">application/json (Structured)</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Connected Account:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">
                    {currentUser?.email || 'Authenticated User'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-850">
                  <span className="text-slate-400">Payload Scope:</span>
                  <span className="text-emerald-400 font-semibold">
                    {report.regionalShards.length} Shards • ZK Proofs • Epoch #{report.regionalShards[0]?.vectorClockEpoch || 1}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                This will create or upload the diagnostic report directly into your designated{' '}
                <strong className="text-slate-200">'{GOVERNANCE_TELEMETRY_FOLDER_NAME}'</strong> folder in
                Google Drive using your approved OAuth authorization.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowDriveConfirmDialog(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSaveToDrive}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Save</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
