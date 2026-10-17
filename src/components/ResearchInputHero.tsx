import React, { useState } from 'react';
import { Search, Sparkles, Compass, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, Layers, ExternalLink } from 'lucide-react';

interface ResearchInputHeroProps {
  onStartResearch: (topic: string, depth: 'fast' | 'deep') => void;
  isLoading: boolean;
  isSearchConfigured?: boolean;
  searchProviderName?: string;
  onOpenSetupModal?: () => void;
}

const SAMPLE_TOPICS = [
  {
    title: 'Solid-State EV Batteries',
    query: 'Are solid-state batteries ready for commercial EV mass production in 2026?',
    tag: 'Hardware / Energy',
  },
  {
    title: 'Synthetic Data & Model Collapse',
    query: 'Does training LLMs on synthetic AI data cause model collapse and degenerative degradation?',
    tag: 'Artificial Intelligence',
  },
  {
    title: 'Remote Work Productivity',
    query: 'Has remote and hybrid work measurably reduced or increased employee productivity in knowledge sectors?',
    tag: 'Economics & Labor',
  },
  {
    title: 'GLP-1 Cardiovascular Outcomes',
    query: 'What are the verified long-term cardiovascular and metabolic outcomes of GLP-1 receptor agonists?',
    tag: 'Medicine / Health',
  },
  {
    title: 'Nuclear Fusion Net Energy',
    query: 'What is the real engineering status and commercial timeline for magnetic confinement nuclear fusion net energy?',
    tag: 'Deep Tech / Physics',
  },
];

export const ResearchInputHero: React.FC<ResearchInputHeroProps> = ({
  onStartResearch,
  isLoading,
  isSearchConfigured = true,
  searchProviderName,
  onOpenSetupModal,
}) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'fast' | 'deep'>('deep');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;
    onStartResearch(topic.trim(), depth);
  };

  const handleSelectSample = (sampleQuery: string) => {
    setTopic(sampleQuery);
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-20 flex justify-center overflow-hidden">
        <div className="h-[380px] w-[700px] rounded-full bg-gradient-to-tr from-cyan-600/15 via-emerald-600/10 to-indigo-600/10 blur-3xl" />
      </div>

      {/* Hero Header */}
      <div className="text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-medium text-cyan-300 backdrop-blur-sm mb-5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Real-Time Web Search Adapter & Evidence Verification</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Verified Evidence. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Uncompromising Intelligence.
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
          ScoutAI decomposes complex inquiries, queries real-time web sources via decoupled search adapters, cross-checks conflicting empirical claims with Gemini, and delivers source-cited investigative dossiers.
        </p>

        {/* Search Provider Setup Banner if unconfigured */}
        {!isSearchConfigured && (
          <div className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 text-left text-xs text-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                Free search provider required for live web retrieval (Tavily or Serper).
              </span>
            </div>
            <button
              onClick={onOpenSetupModal}
              className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors shrink-0"
            >
              Setup Guide
            </button>
          </div>
        )}
      </div>

      {/* Main Search Input Form */}
      <div className="relative z-10 mt-8 sm:mt-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-2 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl transition-all focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20"
        >
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic, technology, controversy, or hypothesis to verify..."
                className="w-full rounded-xl bg-transparent py-3.5 pl-12 pr-4 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
                disabled={isLoading}
              />
            </div>

            {/* Depth selector & Action Button */}
            <div className="flex items-center gap-2 px-2 pb-2 sm:pb-0 sm:px-0">
              <div className="hidden sm:flex items-center rounded-lg border border-slate-700 bg-slate-800/80 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDepth('fast')}
                  className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                    depth === 'fast'
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fast Brief
                </button>
                <button
                  type="button"
                  onClick={() => setDepth('deep')}
                  className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                    depth === 'deep'
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Deep Dossier
                </button>
              </div>

              <button
                type="submit"
                disabled={!topic.trim() || isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-emerald-400 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{isLoading ? 'Investigating...' : 'Start Research'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Verification Guarantee Badge */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Live Web Retrieval (No Hallucinated URLs)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Contradiction & Conflict Detection
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Compass className="h-3.5 w-3.5" />
            Confidence Calibration Gauge
          </span>
        </div>
      </div>

      {/* Curated Sample Queries */}
      <div className="relative z-10 mt-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recommended Intelligence Inquiries
          </p>
          <span className="text-xs text-slate-400">Click any topic to test live</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_TOPICS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample.query)}
              className="group relative flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-left transition-all hover:border-cyan-500/40 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-cyan-950/20"
            >
              <div className="flex w-full items-center justify-between text-[11px] font-medium text-cyan-400 mb-1">
                <span>{sample.tag}</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="text-xs font-medium text-slate-200 line-clamp-2 group-hover:text-white">
                {sample.query}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Pillar Highlights */}
      <div className="relative z-10 mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 mb-3">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Tri-Tier Evidence Matrix</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Claims are algorithmically classified into <span className="text-emerald-400">Supported</span>, <span className="text-amber-400">Conflicting</span>, and <span className="text-slate-400">Unknown</span> with direct source links.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 mb-3">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Contradiction Resolution</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Surfaces divergent expert claims side-by-side, analyzing differences in methodology, benchmarks, and real-world timelines.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
            <ExternalLink className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Export & Audit Trail</h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            One-click Markdown export, raw Google search queries review, and persistent investigation history saved locally and on server.
          </p>
        </div>
      </div>
    </div>
  );
};
