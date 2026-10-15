import React from 'react';
import { Layers, Database, ShieldAlert, Sparkles, Activity, Server } from 'lucide-react';
import { ShardNodeData } from '../../types/governance';

interface SceneControlsPanelProps {
  explodedValue: number;
  setExplodedValue: (val: number) => void;
  selectedShard: ShardNodeData | null;
  onClearShardSelection: () => void;
  onTriggerShardDivergence: (shardId: string) => void;
  shards: ShardNodeData[];
  onSelectShard: (shard: ShardNodeData) => void;
}

export const SceneControlsPanel: React.FC<SceneControlsPanelProps> = ({
  explodedValue,
  setExplodedValue,
  selectedShard,
  onClearShardSelection,
  onTriggerShardDivergence,
  shards,
  onSelectShard,
}) => {
  return (
    <div className="space-y-4 max-h-[56vh] overflow-y-auto pr-1 text-slate-200 text-xs font-mono">
      {/* Exploded View Control */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="font-bold text-slate-100">Procedural 10-Part Exploded View</div>
            <div className="text-[10px] text-slate-400">
              Damped kinematics separation of Core Axiom & Shard assemblies
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={explodedValue}
            onChange={(e) => setExplodedValue(parseFloat(e.target.value))}
            className="w-44 accent-cyan-400"
          />
          <span className="text-cyan-300 font-bold w-12 text-right">
            {(explodedValue * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => setExplodedValue(explodedValue > 0.05 ? 0 : 0.85)}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300 hover:text-white"
          >
            {explodedValue > 0.05 ? 'Collapse' : 'Explode'}
          </button>
        </div>
      </div>

      {/* Selected Node Inspector or Regional Grid */}
      {selectedShard ? (
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-sm text-slate-100">{selectedShard.name}</span>
                <span className="text-[10px] text-slate-400 ml-2">[{selectedShard.region}]</span>
              </div>
            </div>
            <button
              onClick={onClearShardSelection}
              className="text-[10px] text-slate-400 hover:text-slate-200 border border-slate-800 px-2 py-0.5 rounded"
            >
              Focus Axiom Core
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Vault Status</span>
              <span className="text-emerald-400 font-bold uppercase">{selectedShard.vaultStatus}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">AES-GCM Encrypted</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">SQLite Vault Size</span>
              <span className="text-cyan-300 font-bold">{selectedShard.sqliteDbSizeMB} MB</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Local Edge State</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Reclaimed Storage</span>
              <span className="text-emerald-400 font-bold">{selectedShard.reclaimedStorageTB} TB</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Converted to Compute</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Allocated Compute</span>
              <span className="text-amber-300 font-bold">{selectedShard.allocatedComputeGFLOPS} GFLOPS</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Verification Matrix</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Thermal Efficiency: <strong className="text-slate-200">{selectedShard.thermalEfficiencyPct}%</strong>
            </span>
            <button
              onClick={() => onTriggerShardDivergence(selectedShard.id)}
              className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Inject Consensus Divergence Alert
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Active Regional Shards ({shards.length} Nodes in Topographical Balance)
            </span>
            <span className="text-[10px] text-slate-400">Click a shard to inspect</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {shards.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectShard(s)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  s.vaultStatus === 'divergence_alert'
                    ? 'bg-red-950/60 border-red-700'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{s.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s.vaultStatus === 'divergence_alert' ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Reclaimed: <span className="text-emerald-400">{s.reclaimedStorageTB} TB</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Compute: <span className="text-cyan-400">{s.allocatedComputeGFLOPS} GFLOPS</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
