/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GovernanceScene } from './components/3d/GovernanceScene';
import { TopSpecBadge } from './components/hud/TopSpecBadge';
import { BottomControlDock } from './components/hud/BottomControlDock';
import { ShardNodeData, ExposureEntry, AuditResult, StressTestResult } from './types/governance';

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

  // Keyboard shortcut H for Cinema/Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setIsCinemaMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle running live audit
  const handleRunAudit = useCallback(
    async (axiom: string, exposures: ExposureEntry[], concept: string) => {
      setIsAuditing(true);
      setActiveCameraTarget('core');

      try {
        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            axiom,
            exposureLog: exposures,
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
    []
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
      />

      {/* Top Header & Spec Badge */}
      <TopSpecBadge
        activeCameraTarget={activeCameraTarget}
        setActiveCameraTarget={setActiveCameraTarget}
        selectedShard={selectedShard}
        isCinemaMode={isCinemaMode}
        setIsCinemaMode={setIsCinemaMode}
        hasApiKey={hasApiKey}
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
      />
    </div>
  );
}
