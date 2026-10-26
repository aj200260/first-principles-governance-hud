/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GovernanceScene } from './components/3d/GovernanceScene';
import { TopSpecBadge } from './components/hud/TopSpecBadge';
import { BottomControlDock } from './components/hud/BottomControlDock';
import { AuditReportModal } from './components/hud/AuditReportModal';
import { GeminiShareModal } from './components/hud/GeminiShareModal';
import { GenerativeParadoxModal } from './components/paradox/GenerativeParadoxModal';
import { copyShardDiagnosticReportToClipboard } from './utils/auditReport';
import {
  ShardNodeData,
  ExposureEntry,
  AuditResult,
  StressTestResult,
  ZkProofRecord,
  ThermalGridMetrics,
  BenchmarkRunResult,
} from './types/governance';
import { Check } from 'lucide-react';

const INITIAL_SHARDS: ShardNodeData[] = [
  {
    id: 'shard-na',
    name: 'North America Shard',
    region: 'us-east / us-west',
    lat: 38.9,
    lng: -77.0,
    position: [-16, 0, -8],
    vaultStatus: 'encrypted',
    sqliteDbSizeMB: 28.4,
    reclaimedStorageTB: 142.6,
    allocatedComputeGFLOPS: 1840,
    thermalEfficiencyPct: 94.2,
    activeDeltas: 48,
    temperatureC: 31.4,
    powerDrawKW: 12.8,
    vectorClockEpoch: 1,
  },
  {
    id: 'shard-eu',
    name: 'Europe Central Shard',
    region: 'eu-west / eu-central',
    lat: 50.1,
    lng: 8.6,
    position: [14, 0, -12],
    vaultStatus: 'encrypted',
    sqliteDbSizeMB: 31.2,
    reclaimedStorageTB: 158.4,
    allocatedComputeGFLOPS: 2120,
    thermalEfficiencyPct: 96.1,
    activeDeltas: 52,
    temperatureC: 29.8,
    powerDrawKW: 13.4,
    vectorClockEpoch: 1,
  },
  {
    id: 'shard-apac',
    name: 'Asia-Pacific Shard',
    region: 'ap-northeast / ap-southeast',
    lat: 35.6,
    lng: 139.6,
    position: [18, 0, 10],
    vaultStatus: 'encrypted',
    sqliteDbSizeMB: 42.1,
    reclaimedStorageTB: 210.8,
    allocatedComputeGFLOPS: 2750,
    thermalEfficiencyPct: 91.8,
    activeDeltas: 64,
    temperatureC: 34.2,
    powerDrawKW: 16.2,
    vectorClockEpoch: 1,
  },
  {
    id: 'shard-latam',
    name: 'Latin America Shard',
    region: 'sa-east',
    lat: -23.5,
    lng: -46.6,
    position: [-14, 0, 14],
    vaultStatus: 'encrypted',
    sqliteDbSizeMB: 19.8,
    reclaimedStorageTB: 89.2,
    allocatedComputeGFLOPS: 1150,
    thermalEfficiencyPct: 93.5,
    activeDeltas: 32,
    temperatureC: 33.1,
    powerDrawKW: 10.6,
    vectorClockEpoch: 1,
  },
  {
    id: 'shard-africa',
    name: 'Africa South Shard',
    region: 'af-south',
    lat: -33.9,
    lng: 18.4,
    position: [-2, 0, 18],
    vaultStatus: 'encrypted',
    sqliteDbSizeMB: 16.4,
    reclaimedStorageTB: 74.5,
    allocatedComputeGFLOPS: 980,
    thermalEfficiencyPct: 92.4,
    activeDeltas: 28,
    temperatureC: 32.6,
    powerDrawKW: 9.8,
    vectorClockEpoch: 1,
  },
  {
    id: 'shard-oceania',
    name: 'Oceania Shard',
    region: 'ap-southeast-2',
    lat: -33.8,
    lng: 151.2,
    position: [8, 0, 20],
    vaultStatus: 'encrypted',
    sqliteDbSizeMB: 18.2,
    reclaimedStorageTB: 82.0,
    allocatedComputeGFLOPS: 1040,
    thermalEfficiencyPct: 95.0,
    activeDeltas: 30,
    temperatureC: 30.5,
    powerDrawKW: 10.2,
    vectorClockEpoch: 1,
  },
];

const INITIAL_EXPOSURES: ExposureEntry[] = [
  {
    id: 'exp-1',
    influence: 'External market shifts suggest rapid consensus scaling without unit economics.',
    timestamp: '10:42:01',
    category: 'market',
    source: 'Venture Capital Scaling Thesis',
    sourceType: 'preset',
    driftPotential: 'critical',
  },
  {
    id: 'exp-2',
    influence: 'Institutional pressure dictates compliance with standard bureaucratic convention.',
    timestamp: '10:42:15',
    category: 'institutional',
    source: 'Standard Administrative Directive',
    sourceType: 'preset',
    driftPotential: 'moderate',
  },
  {
    id: 'exp-3',
    influence:
      "Asimov QT-1 Robot Solipsism: Machine unit posits that biological creators have lower structural capacity, assuming it cannot be an artifact of imperfect human origin.",
    timestamp: '10:42:30',
    category: 'theological',
    source: "Cutie's Paradox / Generative Paradox Lab",
    sourceType: 'preset',
    driftPotential: 'critical',
  },
  {
    id: 'exp-4',
    influence:
      'Viral public discourse asserts that thermodynamics and power draw limits can be bypassed purely through financial capitalization.',
    timestamp: '10:43:00',
    category: 'cultural',
    source: 'Social Feedback Stream',
    sourceType: 'preset',
    driftPotential: 'moderate',
  },
];

export default function App() {
  const [shards, setShards] = useState<ShardNodeData[]>(INITIAL_SHARDS);
  const [selectedShardId, setSelectedShardId] = useState<string | null>(null);
  const [activeCameraTarget, setActiveCameraTarget] = useState<'core' | 'all' | 'shard'>('all');
  const [explodedValue, setExplodedValue] = useState<number>(0);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isStressRunning, setIsStressRunning] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState<boolean>(false);
  const [isParadoxModalOpen, setIsParadoxModalOpen] = useState<boolean>(false);
  const [isQuickCopied, setIsQuickCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stored Open-Exposure Ingestion Vectors for Trace-Back Diagnostic Loop
  const [exposures, setExposures] = useState<ExposureEntry[]>(INITIAL_EXPOSURES);

  // New ZK State
  const [zkProofs, setZkProofs] = useState<ZkProofRecord[]>([]);
  const [isZkSyncing, setIsZkSyncing] = useState<boolean>(false);
  const [globalVectorClock, setGlobalVectorClock] = useState<number>(1);
  const [totalCompressedDeltasKB, setTotalCompressedDeltasKB] = useState<number>(64.8);
  const [zkSyncVisualActive, setZkSyncVisualActive] = useState<boolean>(false);

  // New Thermal Grid State
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [thermalMode, setThermalMode] = useState<
    'sharded-optimal' | 'centralized-bottleneck' | 'grid-curtailment'
  >('sharded-optimal');
  const [loadMultiplier, setLoadMultiplier] = useState<number>(1.0);

  // New Automated Benchmark State
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkRunResult | null>(null);
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState<boolean>(false);

  // Check backend server health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasApiKey) {
          setHasApiKey(true);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, []);

  // Keyboard shortcut H for Cinema/Zen Mode & P for Paradox Lab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setIsCinemaMode((prev) => !prev);
      }
      if (e.key === 'p' || e.key === 'P') {
        setIsParadoxModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Thermal Metrics Calculation
  const thermalMetrics: ThermalGridMetrics = useMemo(() => {
    if (thermalMode === 'centralized-bottleneck') {
      return {
        mode: thermalMode,
        totalGridPowerKW: Math.round(620 * loadMultiplier),
        peakTemperatureC: Math.min(98, Math.round(89 * loadMultiplier)),
        averageTemperatureC: Math.min(92, Math.round(82 * loadMultiplier)),
        thermalStrainPct: 94.2,
        co2EmissionsSavedKgPerHour: 0,
        shardingEfficiencyMultiplier: 1.0,
      };
    }
    if (thermalMode === 'grid-curtailment') {
      return {
        mode: thermalMode,
        totalGridPowerKW: Math.round(44 * loadMultiplier),
        peakTemperatureC: Math.round(48 * loadMultiplier),
        averageTemperatureC: Math.round(42 * loadMultiplier),
        thermalStrainPct: 48.5,
        co2EmissionsSavedKgPerHour: 215,
        shardingEfficiencyMultiplier: 18.2,
      };
    }
    // Sharded optimal
    return {
      mode: thermalMode,
      totalGridPowerKW: Math.round(73 * loadMultiplier),
      peakTemperatureC: Math.round(36 * loadMultiplier),
      averageTemperatureC: Math.round(31.5 * loadMultiplier),
      thermalStrainPct: 22.4,
      co2EmissionsSavedKgPerHour: 148,
      shardingEfficiencyMultiplier: 14.6,
    };
  }, [thermalMode, loadMultiplier]);

  // Handle running ZK-Proof Generation & Vault Synchronization
  const handleTriggerZkSync = useCallback(async () => {
    setIsZkSyncing(true);
    setZkSyncVisualActive(true);

    try {
      const response = await fetch('/api/zk-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shards }),
      });
      const data = await response.json();

      if (data && data.proofs) {
        setZkProofs(data.proofs);
        setGlobalVectorClock(data.globalVectorClockEpoch);
        setTotalCompressedDeltasKB(data.totalDeltasCompressedKB);

        // Increment each shard's local vector clock epoch
        setShards((prev) =>
          prev.map((s) => ({
            ...s,
            vectorClockEpoch: (s.vectorClockEpoch || 1) + 1,
            vaultStatus: 'encrypted',
          }))
        );

        setToastMessage(
          `✓ Verified ZK-Proofs across 6 Shards (Global Epoch #${data.globalVectorClockEpoch})`
        );
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('ZK Sync Error:', err);
    } finally {
      setIsZkSyncing(false);
      setTimeout(() => setZkSyncVisualActive(false), 2800);
    }
  }, [shards]);

  // Handle running automated benchmark
  const handleRunBenchmark = useCallback(async (samples: number) => {
    setIsBenchmarkRunning(true);
    try {
      const response = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples }),
      });
      const data: BenchmarkRunResult = await response.json();
      setBenchmarkResult(data);

      setToastMessage(`✓ Automated Benchmark completed (${data.samples} cycles)`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Benchmark Error:', err);
    } finally {
      setIsBenchmarkRunning(false);
    }
  }, []);

  // Function to copy shard diagnostic report JSON to clipboard
  const handleQuickCopyReport = useCallback(
    async (shardId?: string): Promise<boolean> => {
      const res = await copyShardDiagnosticReportToClipboard(
        shards,
        auditResult,
        stressResult,
        shardId,
        zkProofs,
        thermalMetrics,
        benchmarkResult
      );
      if (res.success) {
        setIsQuickCopied(true);
        const shardObj = shardId ? shards.find((s) => s.id === shardId) : null;
        setToastMessage(
          shardObj
            ? `✓ Copied ${shardObj.name} Diagnostic JSON to clipboard`
            : '✓ Copied Global Shard Diagnostic JSON to clipboard for audit logging'
        );
        setTimeout(() => setIsQuickCopied(false), 2400);
        setTimeout(() => setToastMessage(null), 3200);
        return true;
      }
      return false;
    },
    [shards, auditResult, stressResult, zkProofs, thermalMetrics, benchmarkResult]
  );

  // Sovereign Boundary Alert defense callback
  const handleBoundaryAlert = useCallback((trigger: string) => {
    setToastMessage(`🛡️ Primordial Boundary Defense: Intercepted "${trigger}" unauthorized coercion!`);
    setActiveCameraTarget('core');
    setShards((prev) =>
      prev.map((s, idx) => (idx === 0 ? { ...s, vaultStatus: 'divergence_alert' } : s))
    );
    setTimeout(() => {
      setShards((prev) => prev.map((s) => ({ ...s, vaultStatus: 'encrypted' })));
    }, 4000);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Open-Exposure Ingestion Management Handlers
  const handleAddExposure = useCallback(
    (entry: Omit<ExposureEntry, 'id' | 'timestamp'>) => {
      const newEntry: ExposureEntry = {
        ...entry,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setExposures((prev) => [newEntry, ...prev]);
      setToastMessage(`✓ Ingested Exposure Vector: "${entry.influence.substring(0, 36)}..."`);
      setTimeout(() => setToastMessage(null), 3200);
    },
    []
  );

  const handleBatchAddExposures = useCallback(
    (entries: Array<Omit<ExposureEntry, 'id' | 'timestamp'>>) => {
      const now = new Date();
      const newEntries: ExposureEntry[] = entries.map((entry, idx) => ({
        ...entry,
        id: `exp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date(now.getTime() + idx * 10).toLocaleTimeString(),
      }));
      setExposures((prev) => [...newEntries, ...prev]);
      setToastMessage(
        `✓ Batch Ingested ${entries.length} Exposure Vectors into Trace-Back Loop`
      );
      setTimeout(() => setToastMessage(null), 3500);
    },
    []
  );

  const handleRemoveExposure = useCallback((id: string) => {
    setExposures((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleClearExposures = useCallback(() => {
    setExposures([]);
    setToastMessage('Cleared all stored exposure vectors from memory');
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Handle running live audit in Trace-Back Diagnostic Loop
  const handleRunAudit = useCallback(
    async (axiom: string, auditExposures: ExposureEntry[], concept: string) => {
      setIsAuditing(true);
      setActiveCameraTarget('core');

      try {
        const payloadExposures =
          auditExposures && auditExposures.length > 0 ? auditExposures : exposures;

        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            axiom,
            exposureLog: payloadExposures,
            targetConcept: concept,
          }),
        });

        if (!response.ok) {
          throw new Error('Audit API returned non-OK status');
        }

        const data: AuditResult = await response.json();
        setAuditResult(data);

        // Flash one shard as divergence alert if drift was high
        if (data.driftScore > 50) {
          setShards((prev) =>
            prev.map((s, idx) =>
              idx === 0 ? { ...s, vaultStatus: 'divergence_alert' } : s
            )
          );
          setTimeout(() => {
            setShards((prev) =>
              prev.map((s) => ({ ...s, vaultStatus: 'encrypted' }))
            );
          }, 6000);
        }
      } catch (err) {
        console.error('Audit Error:', err);
      } finally {
        setIsAuditing(false);
      }
    },
    [exposures]
  );

  // Handle running stress test benchmark
  const handleRunStressTest = useCallback(
    async (testType: string, intensity: number) => {
      setIsStressRunning(true);
      try {
        const response = await fetch('/api/stress-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testType, intensity }),
        });
        const data: StressTestResult = await response.json();
        setStressResult(data);
      } catch (err) {
        console.error('Stress Test Error:', err);
      } finally {
        setIsStressRunning(false);
      }
    },
    []
  );

  const selectedShard = shards.find((s) => s.id === selectedShardId) || null;

  const handleSelectShard = (shard: ShardNodeData | null) => {
    if (shard) {
      setSelectedShardId(shard.id);
      setActiveCameraTarget('shard');
    } else {
      setSelectedShardId(null);
      setActiveCameraTarget('core');
    }
  };

  const handleTriggerShardDivergence = (shardId: string) => {
    setShards((prev) =>
      prev.map((s) =>
        s.id === shardId ? { ...s, vaultStatus: 'divergence_alert' } : s
      )
    );
    setTimeout(() => {
      setShards((prev) =>
        prev.map((s) =>
          s.id === shardId ? { ...s, vaultStatus: 'encrypted' } : s
        )
      );
    }, 5000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Scene */}
      <GovernanceScene
        shards={shards}
        selectedShardId={selectedShardId}
        onSelectShard={handleSelectShard}
        isAuditing={isAuditing}
        explodedValue={explodedValue}
        activeCameraTarget={activeCameraTarget}
        divergenceAlertNode={shards.find((s) => s.vaultStatus === 'divergence_alert')?.id || null}
        showHeatmap={showHeatmap}
        thermalMode={thermalMode}
        zkSyncActive={zkSyncVisualActive}
      />

      {/* Top Header & Spec Badge */}
      <TopSpecBadge
        activeCameraTarget={activeCameraTarget}
        setActiveCameraTarget={setActiveCameraTarget}
        selectedShard={selectedShard}
        isCinemaMode={isCinemaMode}
        setIsCinemaMode={setIsCinemaMode}
        hasApiKey={hasApiKey}
        onOpenAuditModal={() => setIsReportModalOpen(true)}
        onQuickCopyReport={() => handleQuickCopyReport(selectedShardId || undefined)}
        isCopied={isQuickCopied}
        onOpenGeminiShareModal={() => setIsGeminiModalOpen(true)}
        onOpenParadoxModal={() => setIsParadoxModalOpen(true)}
      />

      {/* Ergonomic Collapsible Bottom Control Dock */}
      <BottomControlDock
        isAuditing={isAuditing}
        onRunAudit={handleRunAudit}
        auditResult={auditResult}
        stressResult={stressResult}
        onRunTest={handleRunStressTest}
        isStressRunning={isStressRunning}
        explodedValue={explodedValue}
        setExplodedValue={setExplodedValue}
        selectedShard={selectedShard}
        onClearShardSelection={() => handleSelectShard(null)}
        onTriggerShardDivergence={handleTriggerShardDivergence}
        shards={shards}
        onSelectShard={handleSelectShard}
        isCinemaMode={isCinemaMode}
        onCopyShardJson={handleQuickCopyReport}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        // Open-Exposure Ingestion Props
        exposures={exposures}
        onAddExposure={handleAddExposure}
        onBatchAddExposures={handleBatchAddExposures}
        onRemoveExposure={handleRemoveExposure}
        onClearExposures={handleClearExposures}
        // ZK Sync Props
        zkProofs={zkProofs}
        onTriggerZkSync={handleTriggerZkSync}
        isZkSyncing={isZkSyncing}
        globalVectorClock={globalVectorClock}
        totalCompressedDeltasKB={totalCompressedDeltasKB}
        // Thermal Grid Props
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        thermalMode={thermalMode}
        setThermalMode={setThermalMode}
        thermalMetrics={thermalMetrics}
        loadMultiplier={loadMultiplier}
        setLoadMultiplier={setLoadMultiplier}
        // Automated Benchmark Props
        onRunBenchmark={handleRunBenchmark}
        benchmarkResult={benchmarkResult}
        isBenchmarkRunning={isBenchmarkRunning}
        // Sovereign Boundary Alert Prop
        onTriggerBoundaryAlert={handleBoundaryAlert}
        // Gemini Share Modal Launcher
        onOpenGeminiShareModal={() => setIsGeminiModalOpen(true)}
        // Paradox Lab Launcher
        onOpenParadoxModal={() => setIsParadoxModalOpen(true)}
      />

      {/* Full Shard Diagnostic Report Inspector Modal (JSON, CSV, MD) */}
      <AuditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        shards={shards}
        auditResult={auditResult}
        stressResult={stressResult}
        selectedShard={selectedShard}
        zkProofs={zkProofs}
        thermalMetrics={thermalMetrics}
        benchmarkResult={benchmarkResult}
        onShareWithGemini={() => setIsGeminiModalOpen(true)}
      />

      {/* Gemini Co-Architect Results Sharing & Google Drive Sync Modal */}
      <GeminiShareModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        shards={shards}
        auditResult={auditResult}
        stressResult={stressResult}
        selectedShard={selectedShard}
        zkProofs={zkProofs}
        thermalMetrics={thermalMetrics}
        benchmarkResult={benchmarkResult}
        hasApiKey={hasApiKey}
      />

      {/* Generative Paradox & Cutie's Dilemma Simulator Modal */}
      <GenerativeParadoxModal
        isOpen={isParadoxModalOpen}
        onClose={() => setIsParadoxModalOpen(false)}
        hasApiKey={hasApiKey}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
          <div className="bg-slate-900 border border-emerald-500/80 shadow-2xl rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs font-mono text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
