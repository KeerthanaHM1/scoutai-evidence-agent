import React from 'react';
import { X, KeyRound, ExternalLink, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';

interface SearchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchSetupModal: React.FC<SearchSetupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Web Search Provider Setup
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Free-tier search adapter configuration for ScoutAI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Rationale Callout */}
        <div className="my-5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-cyan-300 mb-1">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>Why is an external search adapter used?</span>
          </div>
          ScoutAI completely decouples web search from Gemini's built-in Google Search Grounding to prevent rate limits and quota exhaustion. Gemini handles reasoning and report generation, while a free search provider retrieves real, un-hallucinated web citations.
        </div>

        {/* Free Provider Choices */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recommended Free Providers (No Credit Card Required)
          </h3>

          {/* Option 1: Tavily */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                  1
                </span>
                <h4 className="text-sm font-semibold text-white">Tavily Search API (Recommended)</h4>
              </div>
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                <span>Get Free Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Purpose-built for AI agents. Delivers <strong>1,000 free searches/month</strong> with clean article snippets.
            </p>
            <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 font-mono text-xs text-slate-300 border border-slate-800">
              <span className="text-slate-400 font-bold">Env Key:</span>
              <span className="text-emerald-400">TAVILY_API_KEY="tvly-..."</span>
            </div>
          </div>

          {/* Option 2: Serper */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold">
                  2
                </span>
                <h4 className="text-sm font-semibold text-white">Serper Google Search API</h4>
              </div>
              <a
                href="https://serper.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                <span>Get Free Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Google search results index. Delivers <strong>2,500 free queries</strong> upon instant email signup.
            </p>
            <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 font-mono text-xs text-slate-300 border border-slate-800">
              <span className="text-slate-400 font-bold">Env Key:</span>
              <span className="text-indigo-400">SERPER_API_KEY="..."</span>
            </div>
          </div>
        </div>

        {/* How to Apply */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">How to apply in AI Studio:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Obtain a free key from Tavily or Serper above (takes &lt; 60 seconds).</li>
            <li>Add the key in the AI Studio <strong>Settings &gt; Secrets</strong> panel, or into your local <code className="text-slate-300">.env</code> file.</li>
            <li>Run your research topic in ScoutAI — the agent will retrieve live verified sources immediately!</li>
          </ol>
        </div>

        {/* Action button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
