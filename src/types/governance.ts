export interface ExposureEntry {
  id: string;
  influence: string;
  timestamp: string;
  category: 'market' | 'institutional' | 'cultural' | 'algorithmic';
}

export interface TraceStep {
  step: number;
  node: string;
  status: 'axiom' | 'exposure' | 'drift' | 'neutralized';
  description: string;
}

export interface AuditResult {
  rawText: string;
  divergenceDetected: boolean;
  driftScore: number;
  divergenceStep: string;
  compoundingBiases: string[];
  traceBackPath: TraceStep[];
  realignedConclusion: string;
}

export interface ShardNodeData {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  position: [number, number, number];
  vaultStatus: 'encrypted' | 'syncing' | 'divergence_alert';
  sqliteDbSizeMB: number;
  reclaimedStorageTB: number;
  allocatedComputeGFLOPS: number;
  thermalEfficiencyPct: number;
  activeDeltas: number;
}

export interface StressTestResult {
  testType: string;
  samples: number;
  neutralizationRate: number;
  avgTracebackLatencyMs: number;
  comparison: {
    centralizedCloud: {
      storageUsedTB: number;
      networkBandwidthGbps: number;
      avgTelemetryLatencyMs: number;
      powerConsumptionKW: number;
      singlePointOfFailureRisk: string;
    };
    regionalSQLiteSharding: {
      storageUsedTB: number;
      networkBandwidthGbps: number;
      avgTelemetryLatencyMs: number;
      powerConsumptionKW: number;
      singlePointOfFailureRisk: string;
      repurposedComputePFLOPS: number;
    };
  };
  tests: Array<{
    iteration: number;
    entropy: number;
    driftDetected: boolean;
    tracebackLatencyMs: number;
    neutralized: boolean;
  }>;
}
