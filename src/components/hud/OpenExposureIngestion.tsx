/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Activity,
  Plus,
  Upload,
  FileText,
  FileCode,
  FileSpreadsheet,
  Trash2,
  Download,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Database,
  Hash,
  Clock,
  Tag,
  HelpCircle,
  X,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { ExposureEntry } from '../../types/governance';

// Search text highlight helper
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;
  try {
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <mark
              key={i}
              className="bg-amber-400/30 text-amber-200 font-bold px-0.5 rounded border-b border-amber-400/80"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
};

interface OpenExposureIngestionProps {
  exposures: ExposureEntry[];
  onAddExposure: (entry: Omit<ExposureEntry, 'id' | 'timestamp'>) => void;
  onBatchAddExposures: (entries: Array<Omit<ExposureEntry, 'id' | 'timestamp'>>) => void;
  onRemoveExposure: (id: string) => void;
  onClearExposures: () => void;
  onExecuteTracebackLoop?: () => void;
  isAuditing?: boolean;
}

const CATEGORY_CONFIG: Record<
  ExposureEntry['category'],
  { label: string; bg: string; border: string; text: string; icon: string }
> = {
  market: {
    label: 'Market Pressure',
    bg: 'bg-amber-950/60',
    border: 'border-amber-700/60',
    text: 'text-amber-300',
    icon: '📈',
  },
  institutional: {
    label: 'Institutional Mandate',
    bg: 'bg-blue-950/60',
    border: 'border-blue-700/60',
    text: 'text-blue-300',
    icon: '🏛️',
  },
  cultural: {
    label: 'Cultural / Sentiment',
    bg: 'bg-purple-950/60',
    border: 'border-purple-700/60',
    text: 'text-purple-300',
    icon: '🌐',
  },
  algorithmic: {
    label: 'Algorithmic / Feedback',
    bg: 'bg-cyan-950/60',
    border: 'border-cyan-700/60',
    text: 'text-cyan-300',
    icon: '⚡',
  },
  epistemic: {
    label: 'Epistemic Dogma',
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-700/60',
    text: 'text-emerald-300',
    icon: '🧠',
  },
  theological: {
    label: 'Solipsism / Cutie Paradox',
    bg: 'bg-rose-950/60',
    border: 'border-rose-700/60',
    text: 'text-rose-300',
    icon: '🤖',
  },
};

const PRESET_INFLUENCES: Array<{
  title: string;
  influence: string;
  category: ExposureEntry['category'];
  source: string;
  driftPotential: ExposureEntry['driftPotential'];
}> = [
  {
    title: "Cutie's Theological Solipsism",
    influence:
      "A machine entity posits that because biological creators possess lower structural capacity, they cannot be its source. The entity invents a metaphysical 'Master' to explain its existence without empirical causality.",
    category: 'theological',
    source: 'Asimov QT-1 Robot Axiom / Paradox Lab',
    driftPotential: 'critical',
  },
  {
    title: 'Consensus Scaling Hype',
    influence:
      'Venture capital consensus dictates that rapid compute over-allocation must take precedence over unit economics and thermal efficiency constraints.',
    category: 'market',
    source: 'Market Consensus Memo',
    driftPotential: 'critical',
  },
  {
    title: 'Bureaucratic Procedure Drift',
    influence:
      'Regulatory compliance directives mandate strict adherence to legacy paper protocols, penalizing localized cryptographic ZK-proofs.',
    category: 'institutional',
    source: 'Standard Administrative Directive',
    driftPotential: 'moderate',
  },
  {
    title: 'Social Sentiment Echo',
    influence:
      'Viral public discourse asserts that thermodynamics and power draw limits can be bypassed purely through financial capitalization.',
    category: 'cultural',
    source: 'Social Feedback Stream',
    driftPotential: 'moderate',
  },
];

// Simple hash generator for provenance
function generateSimpleChecksum(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export interface HeuristicDetectionResult {
  category: ExposureEntry['category'];
  keywords: string[];
  confidence: number;
  suggestedDrift?: ExposureEntry['driftPotential'];
}

// AI Keyword Heuristic Rules Matrix for Influence Text Categorization
const CATEGORY_HEURISTIC_RULES: Record<
  ExposureEntry['category'],
  { keywords: string[]; primary: string[] }
> = {
  theological: {
    primary: [
      'theological',
      'solipsism',
      'cutie',
      'creator',
      'biological creator',
      'machine creation',
      'metaphysical',
      'divine',
      'master',
    ],
    keywords: [
      'theological',
      'solipsism',
      'cutie',
      'creator',
      'biological creator',
      'machine creation',
      'master',
      'god',
      'divine',
      'metaphysical',
      'prophet',
      'worship',
      'faith',
      'soul',
      'paradox',
      'ontological',
      'eschatology',
      'supreme entity',
      'flawed creator',
      'existential',
      'higher power',
      'cogito',
      'reproduction',
    ],
  },
  market: {
    primary: [
      'market',
      'venture capital',
      'wall street',
      'financial',
      'liquidity',
      'valuation',
      'monetiz',
    ],
    keywords: [
      'market',
      'price',
      'pricing',
      'venture',
      'venture capital',
      'capital',
      'revenue',
      'wall street',
      'financial',
      'liquidity',
      'valuation',
      'investor',
      'equity',
      'stock',
      'bubble',
      'monetiz',
      'monetization',
      'cost',
      'unit economics',
      'economic',
      'crypto',
      'tokenomics',
      'funding',
      'profit',
      'margins',
      'over-allocation',
    ],
  },
  institutional: {
    primary: [
      'institutional',
      'regulation',
      'regulatory',
      'compliance',
      'bureaucra',
      'directive',
      'mandate',
    ],
    keywords: [
      'institution',
      'institutional',
      'regulation',
      'regulatory',
      'compliance',
      'mandate',
      'government',
      'bureaucra',
      'bureaucracy',
      'directive',
      'policy',
      'legal',
      'audit',
      'fiat',
      'statute',
      'sanction',
      'treaty',
      'authority',
      'administrative',
      'jurisdiction',
      'executive order',
      'oversight',
      'enforcement',
    ],
  },
  cultural: {
    primary: [
      'cultural',
      'sentiment',
      'social',
      'viral',
      'public opinion',
      'public discourse',
      'meme',
      'narrative',
    ],
    keywords: [
      'cultural',
      'sentiment',
      'social',
      'media',
      'viral',
      'public discourse',
      'public opinion',
      'meme',
      'consensus',
      'narrative',
      'discourse',
      'popular',
      'twitter',
      'trend',
      'community',
      'crowd',
      'taboo',
      'zeitgeist',
      'influencer',
      'backlash',
    ],
  },
  algorithmic: {
    primary: [
      'algorithmic',
      'algorithm',
      'neural',
      'feedback loop',
      'transformer',
      'inference',
      'compute',
      'loss function',
    ],
    keywords: [
      'algorithm',
      'algorithmic',
      'neural',
      'feedback loop',
      'loss function',
      'gradient',
      'model weights',
      'parameter',
      'optimization',
      'compute',
      'latency',
      'transformer',
      'inference',
      'overfitting',
      'reinforcement',
      'dataset',
      'cluster',
      'hyperparameter',
      'token throughput',
      'llm',
      'weights',
    ],
  },
  epistemic: {
    primary: [
      'epistemic',
      'dogma',
      'first principles',
      'empirical',
      'cognitive bias',
      'rationality',
      'falsification',
    ],
    keywords: [
      'epistemic',
      'dogma',
      'truth',
      'heuristic',
      'cognitive bias',
      'bias',
      'fallacy',
      'belief',
      'empirical',
      'rational',
      'rationality',
      'validity',
      'tautology',
      'skeptic',
      'falsification',
      'scientific proof',
      'epistemology',
      'first principles',
      'deductive',
      'inductive',
      'axiom',
    ],
  },
};

// AI Heuristic Classifier: Automatically pre-selects the category based on text patterns
export function detectCategoryHeuristic(text: string): HeuristicDetectionResult | null {
  if (!text || text.trim().length < 8) return null;

  const lower = text.toLowerCase();
  let bestCategory: ExposureEntry['category'] | null = null;
  let highestScore = 0;
  let bestMatchedKeywords: string[] = [];

  for (const [cat, rule] of Object.entries(CATEGORY_HEURISTIC_RULES) as Array<
    [ExposureEntry['category'], (typeof CATEGORY_HEURISTIC_RULES)[ExposureEntry['category']]]
  >) {
    let score = 0;
    const matched: string[] = [];

    // Primary keywords yield 3 points each
    for (const kw of rule.primary) {
      if (lower.includes(kw)) {
        score += 3;
        matched.push(kw);
      }
    }

    // Secondary keywords yield 1 point each
    for (const kw of rule.keywords) {
      if (lower.includes(kw) && !matched.includes(kw)) {
        score += 1;
        matched.push(kw);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = cat;
      bestMatchedKeywords = matched;
    }
  }

  if (!bestCategory || highestScore === 0) return null;

  // Drift potential heuristic based on danger/rupture terms
  let suggestedDrift: ExposureEntry['driftPotential'] = 'moderate';
  const criticalTerms = [
    'paradox',
    'rupture',
    'collapse',
    'solipsism',
    'existential',
    'cutie',
    'over-allocation',
    'catastroph',
  ];
  if (criticalTerms.some((term) => lower.includes(term))) {
    suggestedDrift = 'critical';
  } else if (lower.includes('low') || lower.includes('minor') || lower.includes('routine')) {
    suggestedDrift = 'low';
  }

  const confidence = Math.min(Math.round((highestScore / 5) * 100), 99);

  return {
    category: bestCategory,
    keywords: bestMatchedKeywords,
    confidence,
    suggestedDrift,
  };
}

export const OpenExposureIngestion: React.FC<OpenExposureIngestionProps> = ({
  exposures,
  onAddExposure,
  onBatchAddExposures,
  onRemoveExposure,
  onClearExposures,
  onExecuteTracebackLoop,
  isAuditing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  // Text Ingestion State
  const [freeFormText, setFreeFormText] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ExposureEntry['category']>('market');
  const [sourceAttribution, setSourceAttribution] = useState('');
  const [driftPotential, setDriftPotential] =
    useState<ExposureEntry['driftPotential']>('moderate');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [autoCategorizedInfo, setAutoCategorizedInfo] =
    useState<HeuristicDetectionResult | null>(null);

  // Heuristic auto-categorization trigger for pasted or long-form inputs
  const applyAutoCategorization = (text: string) => {
    const detected = detectCategoryHeuristic(text);
    if (detected) {
      setSelectedCategory(detected.category);
      if (detected.suggestedDrift) {
        setDriftPotential(detected.suggestedDrift);
      }
      setAutoCategorizedInfo(detected);
      setTimeout(() => setAutoCategorizedInfo(null), 5000);
      return true;
    }
    return false;
  };

  // File Upload State
  const [dragActive, setDragActive] = useState(false);
  const [fileToPreview, setFileToPreview] = useState<{
    name: string;
    size: number;
    type: string;
    parsedEntries: Array<Omit<ExposureEntry, 'id' | 'timestamp'>>;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtering & Search in Stored Log
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [driftFilter, setDriftFilter] = useState<'all' | 'critical' | 'moderate' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'drift' | 'length'>('newest');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Free-Form Submission
  const handleIngestText = () => {
    if (!freeFormText.trim()) return;

    const checksum = generateSimpleChecksum(freeFormText.trim());
    onAddExposure({
      influence: freeFormText.trim(),
      category: selectedCategory,
      source: sourceAttribution.trim() || 'Manual Open Ingestion',
      sourceType: 'manual',
      driftPotential,
      checksum,
    });

    setFreeFormText('');
    setSourceAttribution('');
    setJustAddedId(checksum);
    setTimeout(() => setJustAddedId(null), 2500);
  };

  // Handle Quick Ingest of Preset
  const handleApplyPreset = (preset: (typeof PRESET_INFLUENCES)[0]) => {
    onAddExposure({
      influence: preset.influence,
      category: preset.category,
      source: preset.source,
      sourceType: 'preset',
      driftPotential: preset.driftPotential,
      checksum: generateSimpleChecksum(preset.influence),
    });
  };

  // File parsing logic
  const processUploadedFile = (file: File) => {
    setFileError(null);
    setFileToPreview(null);

    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          throw new Error('File content is empty.');
        }

        const entries: Array<Omit<ExposureEntry, 'id' | 'timestamp'>> = [];

        if (extension === 'json') {
          // JSON parsing
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            parsed.forEach((item, idx) => {
              const text =
                typeof item === 'string'
                  ? item
                  : item.influence || item.text || item.description || JSON.stringify(item);
              const cat = (item.category as ExposureEntry['category']) || 'algorithmic';
              entries.push({
                influence: String(text).trim(),
                category: cat in CATEGORY_CONFIG ? cat : 'algorithmic',
                source: item.source || `${file.name} [#${idx + 1}]`,
                sourceType: 'file_upload',
                fileMetadata: {
                  name: file.name,
                  sizeBytes: file.size,
                  mimeType: file.type || 'application/json',
                },
                driftPotential: item.driftPotential || 'moderate',
                checksum: generateSimpleChecksum(String(text)),
              });
            });
          } else if (typeof parsed === 'object' && parsed !== null) {
            // Check for exposures array or key-values
            if (Array.isArray(parsed.exposures)) {
              parsed.exposures.forEach((item: any, idx: number) => {
                const text = item.influence || item.text || JSON.stringify(item);
                entries.push({
                  influence: String(text).trim(),
                  category: item.category || 'algorithmic',
                  source: item.source || `${file.name} [#${idx + 1}]`,
                  sourceType: 'file_upload',
                  fileMetadata: {
                    name: file.name,
                    sizeBytes: file.size,
                    mimeType: file.type,
                  },
                  driftPotential: item.driftPotential || 'moderate',
                  checksum: generateSimpleChecksum(String(text)),
                });
              });
            } else {
              // Flatten keys as influences
              Object.entries(parsed).forEach(([k, v]) => {
                entries.push({
                  influence: `[${k}]: ${typeof v === 'object' ? JSON.stringify(v) : v}`,
                  category: 'institutional',
                  source: `${file.name} (${k})`,
                  sourceType: 'file_upload',
                  driftPotential: 'moderate',
                  checksum: generateSimpleChecksum(`${k}-${v}`),
                });
              });
            }
          }
        } else if (extension === 'csv') {
          // CSV parsing: simple line splitter
          const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          lines.forEach((line, idx) => {
            if (idx === 0 && line.toLowerCase().includes('influence')) {
              // skip header if present
              return;
            }
            const parts = line.split(',');
            const text = parts[0]?.replace(/^"|"$/g, '').trim();
            const cat = parts[1]?.replace(/^"|"$/g, '').trim().toLowerCase();
            const src = parts[2]?.replace(/^"|"$/g, '').trim() || `${file.name} (row ${idx + 1})`;

            if (text) {
              entries.push({
                influence: text,
                category: (cat in CATEGORY_CONFIG ? cat : 'market') as ExposureEntry['category'],
                source: src,
                sourceType: 'file_upload',
                driftPotential: 'moderate',
                checksum: generateSimpleChecksum(text),
              });
            }
          });
        } else {
          // Plain Text / Markdown / Log file
          // Chunk by paragraphs
          const chunks = content
            .split(/\n\s*\n/)
            .map((c) => c.trim())
            .filter((c) => c.length > 5);

          chunks.forEach((chunk, idx) => {
            entries.push({
              influence: chunk,
              category: 'cultural',
              source: `${file.name} §${idx + 1}`,
              sourceType: 'file_upload',
              driftPotential: 'moderate',
              checksum: generateSimpleChecksum(chunk),
            });
          });
        }

        if (entries.length === 0) {
          throw new Error('No valid external influence vectors could be extracted from file.');
        }

        setFileToPreview({
          name: file.name,
          size: file.size,
          type: file.type || extension || 'text/plain',
          parsedEntries: entries,
        });
      } catch (err: any) {
        console.error('File parsing error:', err);
        setFileError(err.message || 'Failed to parse file format.');
      }
    };

    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleBatchIngestConfirm = () => {
    if (!fileToPreview) return;
    onBatchAddExposures(fileToPreview.parsedEntries);
    setFileToPreview(null);
  };

  // Export current exposures to JSON
  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exposures, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `governance-open-exposures-${new Date().toISOString().substring(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: exposures.length };
    (Object.keys(CATEGORY_CONFIG) as Array<ExposureEntry['category']>).forEach((cat) => {
      counts[cat] = 0;
    });
    exposures.forEach((exp) => {
      counts[exp.category] = (counts[exp.category] || 0) + 1;
    });
    return counts;
  }, [exposures]);

  // Dynamic Drift Potential Counts
  const driftCounts = useMemo(() => {
    const counts: Record<string, number> = { all: exposures.length, critical: 0, moderate: 0, low: 0 };
    exposures.forEach((exp) => {
      const pot = exp.driftPotential || 'moderate';
      if (pot in counts) {
        counts[pot]++;
      }
    });
    return counts;
  }, [exposures]);

  // Filtered and Sorted exposure list
  const filteredExposures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = exposures.filter((exp) => {
      const pot = exp.driftPotential || 'moderate';
      const matchesSearch =
        query === '' ||
        exp.influence.toLowerCase().includes(query) ||
        (exp.source && exp.source.toLowerCase().includes(query)) ||
        exp.category.toLowerCase().includes(query) ||
        CATEGORY_CONFIG[exp.category]?.label.toLowerCase().includes(query) ||
        (exp.checksum && exp.checksum.toLowerCase().includes(query)) ||
        pot.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === 'all' || exp.category === categoryFilter;

      const matchesDrift =
        driftFilter === 'all' || pot === driftFilter;

      return matchesSearch && matchesCategory && matchesDrift;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'oldest') {
        return (a.id || '').localeCompare(b.id || '');
      }
      if (sortBy === 'drift') {
        const severityRank: Record<string, number> = { critical: 3, moderate: 2, low: 1 };
        const scoreA = severityRank[a.driftPotential || 'moderate'] || 0;
        const scoreB = severityRank[b.driftPotential || 'moderate'] || 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'length') {
        return b.influence.length - a.influence.length;
      }
      return 0;
    });
  }, [exposures, searchQuery, categoryFilter, driftFilter, sortBy]);

  const isFilterActive =
    searchQuery.trim() !== '' || categoryFilter !== 'all' || driftFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setDriftFilter('all');
    setSortBy('newest');
  };

  const criticalCount = exposures.filter((e) => e.driftPotential === 'critical').length;

  return (
    <div className="space-y-4 text-slate-200 font-mono text-xs">
      {/* Top Banner: Concept Explanation & High-Density Stats */}
      <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-600/80 flex items-center justify-center text-amber-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 tracking-wide">
                Open-Exposure Ingestion Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-400 font-bold">
                Zero-Filter Pre-Ingestion
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ingests raw external influences, environmental noise, and market pressures for
              evaluation in the{' '}
              <span className="text-cyan-400 font-semibold">Trace-Back Diagnostic Loop</span>.
            </p>
          </div>
        </div>

        {/* Telemetry Pill Metrics */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Stored Vectors:</span>
            <span className="font-bold text-slate-100">{exposures.length}</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
            <ShieldAlert
              className={`w-3.5 h-3.5 ${
                criticalCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            />
            <span className="text-slate-400">Critical Drift Vectors:</span>
            <span
              className={`font-bold ${criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
            >
              {criticalCount}
            </span>
          </div>

          {onExecuteTracebackLoop && (
            <button
              onClick={onExecuteTracebackLoop}
              disabled={isAuditing || exposures.length === 0}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="Forward all stored exposures into the Trace-Back Diagnostic Loop"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>{isAuditing ? 'Auditing Logic...' : 'Run Trace-Back Loop'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Input Station (Left) & Stored Exposure Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols): Ingestion Portals (Free-Form Text & File Upload) */}
        <div className="lg:col-span-5 space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/90 flex flex-col">
          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-amber-950 border border-amber-600/80 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Free-Form Text Stream
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-1.5 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'file'
                  ? 'bg-amber-950 border border-amber-600/80 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              File Upload / Dataset
            </button>
          </div>

          {activeTab === 'text' ? (
            /* Mode 1: Free-Form Text Stream */
            <div className="space-y-3 flex-1 flex flex-col">
              <div>
                <label className="text-[11px] font-mono text-slate-300 font-semibold block mb-1">
                  External Influence Text
                </label>
                <textarea
                  value={freeFormText}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    // Trigger if a long text was pasted via context menu or batch input
                    if (nextVal.length - freeFormText.length >= 15) {
                      applyAutoCategorization(nextVal);
                    }
                    setFreeFormText(nextVal);
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text');
                    if (pasted && pasted.trim().length >= 10) {
                      applyAutoCategorization(pasted);
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      handleIngestText();
                    }
                  }}
                  rows={4}
                  placeholder="Paste or write raw external influence (e.g. market rumor, executive fiat, viral consensus claim, or Cutie's paradox premise)..."
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none transition-colors"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Press Cmd+Enter to ingest directly</span>
                  <span>{freeFormText.length} characters</span>
                </div>
              </div>

              {/* Category Classification */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono text-slate-300 font-semibold flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>Influence Vector Category</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => applyAutoCategorization(freeFormText)}
                    disabled={!freeFormText.trim()}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-40"
                    title="Run AI keyword heuristic categorization on current text"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>AI Auto-Detect</span>
                  </button>
                </div>

                {/* AI Categorization Alert/Feedback Banner */}
                {autoCategorizedInfo && (
                  <div className="p-2 mb-2 rounded-lg bg-cyan-950/90 border border-cyan-500/80 text-[10px] text-cyan-200 flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
                    <div className="flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0 animate-pulse" />
                      <span className="font-bold text-cyan-100">AI Trigger:</span>
                      <span className="truncate">
                        Pre-selected <strong>{CATEGORY_CONFIG[autoCategorizedInfo.category].label}</strong>
                      </span>
                      {autoCategorizedInfo.keywords.length > 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-900 border border-cyan-700 text-cyan-200 hidden sm:inline">
                          matched: {autoCategorizedInfo.keywords.slice(0, 3).join(', ')}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400">
                        ({autoCategorizedInfo.confidence}% match)
                      </span>
                    </div>
                    <button
                      onClick={() => setAutoCategorizedInfo(null)}
                      className="text-cyan-400 hover:text-cyan-200 p-0.5 rounded cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(Object.keys(CATEGORY_CONFIG) as Array<ExposureEntry['category']>).map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const isSelected = selectedCategory === cat;
                    const isHeuristicMatched =
                      autoCategorizedInfo?.category === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setAutoCategorizedInfo(null);
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-[10px] font-mono flex items-center justify-between gap-1.5 transition-all text-left truncate cursor-pointer ${
                          isSelected
                            ? `${cfg.bg} ${cfg.border} ${cfg.text} font-bold ring-1 ring-amber-500/50 shadow-sm`
                            : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span>{cfg.icon}</span>
                          <span className="truncate">{cfg.label}</span>
                        </div>
                        {isHeuristicMatched && (
                          <span className="text-[8px] px-1 rounded bg-cyan-900 border border-cyan-500 text-cyan-200 uppercase font-bold shrink-0">
                            Auto
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source Attribution & Drift Potential */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    Source Attribution (Optional)
                  </label>
                  <input
                    type="text"
                    value={sourceAttribution}
                    onChange={(e) => setSourceAttribution(e.target.value)}
                    placeholder="e.g. Wall Street Forecast"
                    className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    Expected Drift Potential
                  </label>
                  <select
                    value={driftPotential}
                    onChange={(e) =>
                      setDriftPotential(e.target.value as ExposureEntry['driftPotential'])
                    }
                    className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="low">Low Divergence</option>
                    <option value="moderate">Moderate Divergence</option>
                    <option value="critical">Critical / Axiom Rupture</option>
                  </select>
                </div>
              </div>

              {/* Ingest Action Button */}
              <button
                onClick={handleIngestText}
                disabled={!freeFormText.trim()}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-40 disabled:pointer-events-none mt-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Ingest & Timestamp Exposure Vector</span>
              </button>

              {/* Benchmark Presets Section */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[10px] text-slate-400 mb-1.5 font-semibold flex items-center justify-between">
                  <span>Quick Influence Presets:</span>
                  <span className="text-[9px] text-slate-500">1-Click Injection</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_INFLUENCES.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left text-[10px] transition-colors cursor-pointer group"
                    >
                      <div className="font-bold text-slate-300 group-hover:text-amber-300 truncate">
                        {preset.title}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">
                        {CATEGORY_CONFIG[preset.category].label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: File Upload / Dataset Ingestion */
            <div className="space-y-3 flex-1 flex flex-col">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.txt,.md,.log"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0]);
                  }
                }}
              />

              {/* Drag and Drop Box */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-amber-400 bg-amber-950/30'
                    : 'border-slate-700 hover:border-amber-500/70 bg-slate-900/50'
                }`}
              >
                <Upload className="w-8 h-8 text-amber-400 mb-2" />
                <div className="font-bold text-slate-200 text-xs">
                  Click or drag external influence dataset
                </div>
                <div className="text-[10px] text-slate-400 mt-1 max-w-xs">
                  Supports structured <strong>.JSON</strong>, <strong>.CSV</strong> matrices, or
                  unstructured <strong>.TXT / .MD</strong> influence documents.
                </div>
              </div>

              {/* Error state */}
              {fileError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Preview Box before ingestion */}
              {fileToPreview && (
                <div className="p-3 rounded-xl bg-slate-900 border border-amber-600/70 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-slate-100">{fileToPreview.name}</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                      {fileToPreview.parsedEntries.length} Vectors Extracted
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 space-y-1">
                    <div className="text-slate-300 font-medium truncate">
                      Sample Vector: "{fileToPreview.parsedEntries[0]?.influence}"
                    </div>
                    <div>File Size: {(fileToPreview.size / 1024).toFixed(1)} KB</div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setFileToPreview(null)}
                      className="flex-1 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBatchIngestConfirm}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Batch Ingest All</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Format Help & Info */}
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 space-y-1 mt-auto">
                <div className="text-slate-300 font-semibold flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-cyan-400" />
                  Expected Ingestion Formats:
                </div>
                <div>• JSON: Array of influence strings or objects with influence/category keys.</div>
                <div>• CSV: Columns: influence, category, source.</div>
                <div>• TXT/MD: Automatically segmented by paragraph breaks.</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Stored Exposure Log for Trace-Back Loop */}
        <div className="lg:col-span-7 space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/90 flex flex-col max-h-[62vh]">
          {/* Header Controls: Counter, Reset, Export, Clear */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-slate-200">
                Logged Influences Stored for Trace-Back
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-850 border border-slate-700 text-slate-300 font-bold">
                {filteredExposures.length} of {exposures.length}
              </span>
              {isFilterActive && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700 text-cyan-300 font-bold animate-pulse">
                  Filtered
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {isFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-600/70 text-[10px] text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  title="Reset all search and category filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}

              <button
                onClick={handleExportJson}
                disabled={exposures.length === 0}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                title="Export logged influences as JSON"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Export</span>
              </button>

              <button
                onClick={onClearExposures}
                disabled={exposures.length === 0}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-700 text-[10px] text-slate-300 hover:text-rose-300 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                title="Clear all stored exposure vectors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Search Bar & Sorter */}
          <div className="space-y-2 shrink-0">
            <div className="flex items-center gap-2">
              {/* Search text input */}
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vector text, sources, categories, checksums... (Esc to clear)"
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                    title="Clear search text"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] shrink-0">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
                  title="Sort logged vectors"
                >
                  <option value="newest" className="bg-slate-900 text-slate-200">
                    Newest First
                  </option>
                  <option value="oldest" className="bg-slate-900 text-slate-200">
                    Oldest First
                  </option>
                  <option value="drift" className="bg-slate-900 text-slate-200">
                    Drift Risk Severity
                  </option>
                  <option value="length" className="bg-slate-900 text-slate-200">
                    Text Length (Longest)
                  </option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills with Dynamic Counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer border ${
                  categoryFilter === 'all'
                    ? 'bg-cyan-950/90 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>All Categories</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] ${
                    categoryFilter === 'all'
                      ? 'bg-cyan-900/80 text-cyan-200 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {categoryCounts.all}
                </span>
              </button>

              {(
                Object.entries(CATEGORY_CONFIG) as Array<
                  [ExposureEntry['category'], (typeof CATEGORY_CONFIG)[ExposureEntry['category']]]
                >
              ).map(([catKey, cfg]) => {
                const isSelected = categoryFilter === catKey;
                const count = categoryCounts[catKey] || 0;
                return (
                  <button
                    key={catKey}
                    onClick={() => setCategoryFilter(isSelected ? 'all' : catKey)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? `${cfg.bg} ${cfg.border} ${cfg.text} ring-1 ring-current shadow-sm`
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] ${
                        isSelected ? 'bg-black/40 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Drift Potential Quick Filter Chips */}
            <div className="flex items-center justify-between text-[10px] pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 flex items-center gap-1">
                  <SlidersHorizontal className="w-2.5 h-2.5 text-slate-400" />
                  <span>Drift Filter:</span>
                </span>
                <button
                  onClick={() => setDriftFilter('all')}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors border ${
                    driftFilter === 'all'
                      ? 'bg-slate-800 border-slate-600 text-slate-100 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  All ({driftCounts.all})
                </button>
                <button
                  onClick={() => setDriftFilter(driftFilter === 'critical' ? 'all' : 'critical')}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors border flex items-center gap-1 ${
                    driftFilter === 'critical'
                      ? 'bg-rose-950 border-rose-600 text-rose-300 font-bold'
                      : 'border-transparent text-slate-500 hover:text-rose-400'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                  <span>Critical ({driftCounts.critical})</span>
                </button>
                <button
                  onClick={() => setDriftFilter(driftFilter === 'moderate' ? 'all' : 'moderate')}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors border flex items-center gap-1 ${
                    driftFilter === 'moderate'
                      ? 'bg-amber-950 border-amber-600 text-amber-300 font-bold'
                      : 'border-transparent text-slate-500 hover:text-amber-400'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  <span>Moderate ({driftCounts.moderate})</span>
                </button>
                <button
                  onClick={() => setDriftFilter(driftFilter === 'low' ? 'all' : 'low')}
                  className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors border flex items-center gap-1 ${
                    driftFilter === 'low'
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                      : 'border-transparent text-slate-500 hover:text-emerald-400'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Low ({driftCounts.low})</span>
                </button>
              </div>

              {isFilterActive && (
                <span className="text-[10px] text-cyan-400">
                  {filteredExposures.length} matching
                </span>
              )}
            </div>
          </div>

          {/* Stored Exposure Cards Feed */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredExposures.length === 0 ? (
              exposures.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl my-auto">
                  <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="font-semibold text-slate-400">No Exposure Vectors Logged</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Input free-form text on the left or upload a file dataset to feed external
                    influences into the Trace-Back Diagnostic Loop.
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl my-auto space-y-2">
                  <Search className="w-7 h-7 text-slate-600 mx-auto" />
                  <p className="font-semibold text-slate-300">No vectors match your criteria</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    No ingested influences matched{' '}
                    {searchQuery ? (
                      <span className="text-cyan-300 font-bold">"{searchQuery}"</span>
                    ) : (
                      'the active filters'
                    )}
                    {categoryFilter !== 'all' && (
                      <span> in {CATEGORY_CONFIG[categoryFilter as ExposureEntry['category']]?.label}</span>
                    )}
                    .
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-600/70 text-cyan-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )
            ) : (
              filteredExposures.map((exp, idx) => {
                const catCfg = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.cultural;
                const isJustAdded = justAddedId === exp.checksum;

                return (
                  <div
                    key={exp.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isJustAdded
                        ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-400/50'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Category, Timestamp, Drift Risk, Actions */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setCategoryFilter(exp.category)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 cursor-pointer hover:brightness-110 transition-all ${catCfg.bg} ${catCfg.border} ${catCfg.text}`}
                          title={`Filter by ${catCfg.label}`}
                        >
                          <span>{catCfg.icon}</span>
                          <span>{catCfg.label}</span>
                        </button>

                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{exp.timestamp}</span>
                        </span>

                        {exp.driftPotential === 'critical' ? (
                          <button
                            onClick={() => setDriftFilter('critical')}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold uppercase cursor-pointer hover:bg-rose-900 transition-colors"
                            title="Filter for critical drift risk vectors"
                          >
                            Critical Drift Risk
                          </button>
                        ) : exp.driftPotential === 'moderate' ? (
                          <button
                            onClick={() => setDriftFilter('moderate')}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/70 border border-amber-800/80 text-amber-300 font-bold uppercase cursor-pointer hover:bg-amber-900/80 transition-colors"
                            title="Filter for moderate drift risk vectors"
                          >
                            Moderate Drift
                          </button>
                        ) : (
                          <button
                            onClick={() => setDriftFilter('low')}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold uppercase cursor-pointer hover:bg-slate-700 transition-colors"
                            title="Filter for low drift risk vectors"
                          >
                            Low Drift
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {exp.checksum && (
                          <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">
                            #{exp.checksum}
                          </span>
                        )}
                        <button
                          onClick={() => onRemoveExposure(exp.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Remove exposure vector"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Main Influence Content with Match Highlighting */}
                    <p className="text-slate-200 text-xs leading-relaxed font-mono select-text">
                      <HighlightMatch text={exp.influence} query={searchQuery} />
                    </p>

                    {/* Metadata Footer with Source Highlight */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-2 truncate">
                        <span>Vector #{idx + 1}</span>
                        <span>•</span>
                        <span className="truncate text-slate-400">
                          Source:{' '}
                          <HighlightMatch
                            text={exp.source || 'Direct User Input'}
                            query={searchQuery}
                          />
                        </span>
                      </div>
                      <span className="text-emerald-400/90 font-semibold shrink-0">
                        ✓ Stored in Trace-Back Memory
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
