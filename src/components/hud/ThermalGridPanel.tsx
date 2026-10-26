import React from 'react';
import { Flame, Activity, Zap, ShieldCheck, Thermometer, Gauge, Leaf } from 'lucide-react';
import { ThermalGridMetrics, ShardNodeData } from '../../types/governance';

interface ThermalGridPanelProps {
  showHeatmap: boolean;
  setShowHeatmap: (val: boolean) => void;
  thermalMode: 'sharded-optimal' | 'centralized-bottleneck' | 'grid-curtailment';
  setThermalMode: (mode: 'sharded-optimal' | 'centralized-bottleneck' | 'grid-curtailment') => void;
  thermalMetrics: ThermalGridMetrics;
  shards: ShardNodeData[];
  loadMultiplier: number;
  setLoadMultiplier: (val: number) => void;
}

export const ThermalGridPanel: React.FC<ThermalGridPanelProps> = ({
  showHeatmap,
  setShowHeatmap,
  thermalMode,
  setThermalMode,
  thermalMetrics,
  shards,
  loadMultiplier,
  setLoadMultiplier,
}) => {
  return (
    <div className="space-y-4 max-h-[56vh] overflow-y-auto pr-1 text-slate-200 text-xs font-mono">
      {/* Visualizer Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <button
          onClick={() => setThermalMode('sharded-optimal')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            thermalMode === 'sharded-optimal'
              ? 'bg-emerald-950/80 border-emerald-500 text-white'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs text-emerald-300">1. Regional Sharded Equilibrium</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Distributed topographical dissipation (&lt;35°C). Zero localized grid hotspots, even power distribution.
          </p>
        </button>

        <button
          onClick={() => setThermalMode('centralized-bottleneck')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            thermalMode === 'centralized-bottleneck'
              ? 'bg-red-950/80 border-red-500 text-white'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="font-bold text-xs text-red-300">2. Centralized Cloud Bottleneck</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Severe thermal overload (&gt;85°C) and single-point power grid strain from centralized monolithic data centers.
          </p>
        </button>

        <button
          onClick={() => setThermalMode('grid-curtailment')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            thermalMode === 'grid-curtailment'
              ? 'bg-amber-950/80 border-amber-500 text-white'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs text-amber-300">3. Grid Curtailment Stress Test</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Simulates a 40% electrical power curtailment with autonomous edge-vault load balancing.
          </p>
        </button>
      </div>

      {/* Control Bar: 3D Heatmap Toggle & Throughput Simulation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
            <span>Enable 3D Topographical Thermal Heatmap Overlay</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">Simulated Network Load:</span>
          <input
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={loadMultiplier}
            onChange={(e) => setLoadMultiplier(parseFloat(e.target.value))}
            className="w-28 accent-cyan-400"
          />
          <span className="text-cyan-300 font-bold w-14 text-right">
            {(loadMultiplier * 500).toFixed(0)}k req/s
          </span>
        </div>
      </div>

      {/* Grid Energy & Thermal Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-cyan-400" />
            Operating Temperature
          </div>
          <div
            className={`text-lg font-bold mt-0.5 ${
              thermalMetrics.averageTemperatureC > 70
                ? 'text-red-400'
                : thermalMetrics.averageTemperatureC > 50
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {thermalMetrics.averageTemperatureC}°C
          </div>
          <div className="text-[10px] text-slate-500">Peak: {thermalMetrics.peakTemperatureC}°C</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Total Grid Power Draw
          </div>
          <div className="text-lg font-bold text-slate-100 mt-0.5">
            {thermalMetrics.totalGridPowerKW} kW
          </div>
          <div className="text-[10px] text-emerald-400 font-bold">-92.3% vs Monolithic Cloud</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" />
            Power Grid Strain Index
          </div>
          <div
            className={`text-lg font-bold mt-0.5 ${
              thermalMetrics.thermalStrainPct > 70
                ? 'text-red-400'
                : thermalMetrics.thermalStrainPct > 40
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {thermalMetrics.thermalStrainPct}%
          </div>
          <div className="text-[10px] text-slate-500">Topographically distributed</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Leaf className="w-3 h-3 text-emerald-400" />
            CO2 Reductions
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">
            -{thermalMetrics.co2EmissionsSavedKgPerHour} kg/hr
          </div>
          <div className="text-[10px] text-emerald-500/80">Decentralized efficiency</div>
        </div>
      </div>

      {/* Shard Thermal Telemetry Table */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Regional Thermal Balance & Power Distribution ({shards.length} Shards)
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Status: {thermalMode === 'centralized-bottleneck' ? 'OVERLOAD_SIMULATED' : 'BALANCED_STABLE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {shards.map((s) => {
            const isHot = thermalMode === 'centralized-bottleneck';
            const temp = isHot ? Math.round((s.temperatureC || 32) * 2.6) : s.temperatureC || 32;
            const power = isHot ? Math.round((s.powerDrawKW || 12) * 4.8) : s.powerDrawKW || 12;

            return (
              <div
                key={s.id}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/90 text-[11px]"
              >
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span>{s.name}</span>
                  <span
                    className={
                      temp > 75
                        ? 'text-red-400'
                        : temp > 45
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {temp}°C
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Power: {power} kW</span>
                  <span>Eff: {s.thermalEfficiencyPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
