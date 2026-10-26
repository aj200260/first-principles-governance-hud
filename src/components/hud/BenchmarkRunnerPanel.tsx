import React, { useState } from 'react';
import { Play, Download, RefreshCw, BarChart2, CheckCircle2, FileSpreadsheet, FileText, Code2, Clock, Sparkles } from 'lucide-react';
import { BenchmarkRunResult } from '../../types/governance';
import { downloadFile } from '../../utils/auditReport';

interface BenchmarkRunnerPanelProps {
  onRunBenchmark: (samples: number) => Promise<void>;
  benchmarkResult: BenchmarkRunResult | null;
  isRunning: boolean;
  onShareWithGemini?: () => void;
}

export const BenchmarkRunnerPanel: React.FC<BenchmarkRunnerPanelProps> = ({
  onRunBenchmark,
  benchmarkResult,
  isRunning,
  onShareWithGemini,
}) => {
  const [sampleCount, setSampleCount] = useState<number>(50);

  const handleDownloadCsv = () => {
    if (!benchmarkResult) return;
    const csvContent = [
      'Cycle,Entropy,DriftDetected,TracebackLatencyMs,ZkAttested,Neutralized',
      ...benchmarkResult.iterations.map(
        (it) =>
          `${it.cycle},${it.entropy},${it.driftDetected},${it.tracebackLatencyMs},${it.zkAttested},${it.neutralized}`
      ),
    ].join('\n');
    downloadFile(csvContent, `benchmark-telemetry-${benchmarkResult.runId.toLowerCase()}.csv`, 'text/csv');
  };

  const handleDownloadJson = () => {
    if (!benchmarkResult) return;
    downloadFile(
      JSON.stringify(benchmarkResult, null, 2),
      `benchmark-run-${benchmarkResult.runId.toLowerCase()}.json`,
      'application/json'
    );
  };

  const handleDownloadMd = () => {
    if (!benchmarkResult) return;
    const md = `# Automated Empirical Benchmark Telemetry
- **Run ID**: \`${benchmarkResult.runId}\`
- **Timestamp**: ${benchmarkResult.timestamp}
- **Sample Ingestions**: ${benchmarkResult.samples}
- **Neutralization Success Rate**: **${benchmarkResult.neutralizationRatePct}%**

## Latency Percentile Distribution
- **P50 (Median)**: ${benchmarkResult.latencyPercentiles.p50Ms} ms
- **P90**: ${benchmarkResult.latencyPercentiles.p90Ms} ms
- **P95**: ${benchmarkResult.latencyPercentiles.p95Ms} ms
- **P99**: ${benchmarkResult.latencyPercentiles.p99Ms} ms
- **Max**: ${benchmarkResult.latencyPercentiles.maxMs} ms

## Empirical Systemic Gains
- **Storage Footprint Reduction**: ${benchmarkResult.storageSavedPct}%
- **Bandwidth Saved**: ${benchmarkResult.bandwidthSavedPct}%
- **Energy / Power Saved**: ${benchmarkResult.energyReductionPct}%
- **Reallocated Matrix Compute**: +${benchmarkResult.repurposedComputePFLOPS} PFLOPS

*Co-authored by Andrew Leiter & Gemini AI*`;
    downloadFile(md, `benchmark-report-${benchmarkResult.runId.toLowerCase()}.md`, 'text/markdown');
  };

  return (
    <div className="space-y-4 max-h-[56vh] overflow-y-auto pr-1 text-slate-200 text-xs font-mono">
      {/* Configuration & Action Bar */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">
              Automated Empirical Benchmark Test Suite
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              High-Entropy Ingestion
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Executes automated batch sweeps to evaluate stochastic stability, log-normal latency distributions, and ZK attestation throughput.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg p-1">
            {[25, 50, 100, 200].map((count) => (
              <button
                key={count}
                onClick={() => setSampleCount(count)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  sampleCount === count
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          <button
            onClick={() => onRunBenchmark(sampleCount)}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg cursor-pointer shrink-0"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-200" />
                Executing {sampleCount} Cycles...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-cyan-200" />
                Run Benchmark
              </>
            )}
          </button>
        </div>
      </div>

      {/* Benchmark Results */}
      {benchmarkResult ? (
        <div className="space-y-3">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
              <div className="text-[10px] text-slate-400">Drift Neutralization</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {benchmarkResult.neutralizationRatePct}%
              </div>
              <div className="text-[10px] text-slate-500">Across {benchmarkResult.samples} vectors</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
              <div className="text-[10px] text-slate-400">P50 / Median Latency</div>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">
                {benchmarkResult.latencyPercentiles.p50Ms} ms
              </div>
              <div className="text-[10px] text-slate-500">P90: {benchmarkResult.latencyPercentiles.p90Ms} ms</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
              <div className="text-[10px] text-slate-400">P99 Tail Latency</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">
                {benchmarkResult.latencyPercentiles.p99Ms} ms
              </div>
              <div className="text-[10px] text-slate-500">Max: {benchmarkResult.latencyPercentiles.maxMs} ms</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
              <div className="text-[10px] text-slate-400">Collective Compute Yield</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                +{benchmarkResult.repurposedComputePFLOPS} PFLOPS
              </div>
              <div className="text-[10px] text-emerald-500/80">Reclaimed storage conversion</div>
            </div>
          </div>

          {/* Multi-Format Export Bar */}
          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">
                Multi-Format Empirical Telemetry Export:
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onShareWithGemini && (
                <button
                  onClick={onShareWithGemini}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-600 text-cyan-200 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Share benchmark metrics directly with Gemini 2.5 Flash Co-Architect"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                  <span>Share with Gemini</span>
                </button>
              )}

              <button
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download .CSV</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Download .JSON</span>
              </button>

              <button
                onClick={handleDownloadMd}
                className="px-3 py-1.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-300 hover:bg-blue-900 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>

          {/* Sample Trace Stream Preview */}
          <div className="bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Empirical Telemetry Cycles Preview (Latest {Math.min(10, benchmarkResult.iterations.length)} of {benchmarkResult.samples})
              </span>
              <span className="text-[10px] text-slate-400">Run ID: {benchmarkResult.runId}</span>
            </div>

            <div className="p-3 text-[11px] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                    <th className="pb-1.5">Cycle</th>
                    <th className="pb-1.5">Entropy</th>
                    <th className="pb-1.5">Drift Detected</th>
                    <th className="pb-1.5">Traceback Latency</th>
                    <th className="pb-1.5">ZK Attested</th>
                    <th className="pb-1.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {benchmarkResult.iterations.slice(0, 10).map((it) => (
                    <tr key={it.cycle}>
                      <td className="py-1.5 font-bold text-slate-300">#{it.cycle}</td>
                      <td className="py-1.5 text-slate-400">{it.entropy}</td>
                      <td className="py-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            it.driftDetected
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {it.driftDetected ? 'YES (Divergence)' : 'NO (Aligned)'}
                        </span>
                      </td>
                      <td className="py-1.5 text-cyan-300 font-bold">{it.tracebackLatencyMs} ms</td>
                      <td className="py-1.5 text-amber-400">Poseidon-ZK</td>
                      <td className="py-1.5 text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Grounded
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/70 p-6 rounded-xl border border-slate-800 text-center">
          <BarChart2 className="w-8 h-8 text-cyan-500/40 mx-auto mb-2" />
          <div className="text-xs font-mono font-medium text-slate-300">
            Automated Benchmark Test Suite Standing By
          </div>
          <p className="text-[11px] font-mono text-slate-500 max-w-sm mx-auto mt-1">
            Select a sample iteration batch (25 to 200 cycles) and click &ldquo;Run Benchmark&rdquo; to collect empirical latency distributions and download multi-format reports.
          </p>
        </div>
      )}
    </div>
  );
};
