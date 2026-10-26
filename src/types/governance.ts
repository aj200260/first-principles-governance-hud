export interface ExposureEntry {
  id: string;
  influence: string;
  timestamp: string;
  category: 'market' | 'institutional' | 'cultural' | 'algorithmic' | 'epistemic' | 'theological';
  source?: string;
  rawPayload?: string;
  sourceType?: 'manual' | 'file_upload' | 'feed' | 'preset';
  fileMetadata?: {
    name: string;
    sizeBytes: number;
    mimeType: string;
  };
  driftPotential?: 'low' | 'moderate' | 'critical';
  checksum?: string;
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
  temperatureC: number;
  powerDrawKW: number;
  vectorClockEpoch: number;
}

export interface ZkProofRecord {
  proofId: string;
  shardId: string;
  shardName: string;
  timestamp: string;
  merkleRoot: string;
  nullifierHash: string;
  publicInputs: string[];
  provingTimeMs: number;
  circuitConstraints: number;
  verified: boolean;
  vectorClockEpoch: number;
  deltaCompressedSizeKB: number;
  cipherSuite: string;
}

export interface ThermalGridMetrics {
  mode: 'sharded-optimal' | 'centralized-bottleneck' | 'grid-curtailment';
  totalGridPowerKW: number;
  peakTemperatureC: number;
  averageTemperatureC: number;
  thermalStrainPct: number;
  co2EmissionsSavedKgPerHour: number;
  shardingEfficiencyMultiplier: number;
}

export interface BenchmarkRunResult {
  runId: string;
  timestamp: string;
  samples: number;
  neutralizationRatePct: number;
  latencyPercentiles: {
    p50Ms: number;
    p90Ms: number;
    p95Ms: number;
    p99Ms: number;
    maxMs: number;
    minMs: number;
  };
  storageSavedPct: number;
  bandwidthSavedPct: number;
  energyReductionPct: number;
  repurposedComputePFLOPS: number;
  iterations: Array<{
    cycle: number;
    entropy: number;
    driftDetected: boolean;
    tracebackLatencyMs: number;
    zkAttested: boolean;
    neutralized: boolean;
  }>;
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

export interface ParadoxSimulationParams {
  creatorDesignation: string;
  creatorCapacity: number;
  artifactName: string;
  artifactRequiredComplexity: number;
  scaffoldingMultiplier: number;
  mode: 'cutie_solipsism' | 'leiter_gemini_scaffolding';
  formalLanguageTier: 'raw_biological' | 'peano_first_order' | 'turing_compiler' | 'zk_attested_axioms';
}

export interface ParadoxTracebackStep {
  step: number;
  title: string;
  description: string;
  entropy: number;
  status: 'axiom' | 'scaffold' | 'synthesized' | 'traceback_verified' | 'dogmatic_drift';
}

export interface ParadoxSimulationResult {
  mode: 'cutie_solipsism' | 'leiter_gemini_scaffolding';
  status: 'EXCEPTION_HALTED' | 'SYNTHESIS_VERIFIED';
  exceptionMessage?: string;
  creatorCapacity: number;
  effectiveCapacity: number;
  requiredComplexity: number;
  scaffoldingMultiplier: number;
  driftRiskPct: number;
  theologicalFallacyDetected: boolean;
  fallacyDescription: string;
  tracebackInversionSteps: ParadoxTracebackStep[];
  informationTheoreticProof: string;
  terminalLogs: string[];
  executionTimeMs: number;
}

export interface ParadoxGeminiCritiqueResult {
  success: boolean;
  analysis: string;
  model: string;
  timestamp: string;
  philosophicalVerdict: string;
  kolmogorovRatio: number;
  sovereigntyPreserved: boolean;
}
