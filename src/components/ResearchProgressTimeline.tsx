import React, { useState, useEffect, useRef } from 'react';
import { ProgressState, AgentLog, ResearchSource } from '../types';
import { Loader2, CheckCircle2, Search, BrainCircuit, ShieldCheck, FileText, ChevronDown, ChevronUp, Terminal, ExternalLink } from 'lucide-react';

interface ResearchProgressTimelineProps {
  progress: ProgressState;
  logs: AgentLog[];
  subQuestions: string[];
  sources: ResearchSource[];
  topic: string;
}

const STAGES = [
  { id: 'decomposition', label: '1. Topic Decomposition', icon: BrainCircuit },
  { id: 'retrieval', label: '2. Live Web Retrieval', icon: Search },
  { id: 'verification', label: '3. Evidence Matrix Verification', icon: ShieldCheck },
  { id: 'synthesis', label: '4. Dossier Compilation', icon: FileText },
];

export const ResearchProgressTimeline: React.FC<ResearchProgressTimelineProps> = ({
  progress,
  logs,
  subQuestions,
  sources,
  topic,
}) => {
  const [showLogs, setShowLogs] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLogs && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showLogs]);

  const currentStageIndex = STAGES.findIndex((s) => s.id === progress.stage);
  const activeIndex = currentStageIndex === -1 ? (progress.stage === 'complete' ? 4 : 0) : currentStageIndex;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Agent Pipeline In Progress
              </span>
            </div>
            <h2 className="mt-1 text-lg sm:text-xl font-bold text-white line-clamp-1">
              "{topic}"
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-semibold text-cyan-300">
              {progress.percentage}%
            </span>
            <div className="h-2 w-28 sm:w-36 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Multi-Stage Visual Stepper */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 py-6">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = activeIndex > idx || progress.stage === 'complete';
            const isCurrent = activeIndex === idx && progress.stage !== 'complete';

            return (
              <div
                key={stage.id}
                className={`relative flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                  isCurrent
                    ? 'border border-cyan-500/50 bg-cyan-950/30 text-white shadow-lg shadow-cyan-950/20'
                    : isCompleted
                    ? 'border border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                    : 'border border-slate-800 bg-slate-900/40 text-slate-400'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg mb-2 ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs font-medium leading-tight">
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Action Banner */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 mb-6">
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                {progress.title}
              </h4>
              <p className="mt-0.5 text-xs text-slate-300">
                {progress.description}
              </p>
            </div>
          </div>
        </div>

        {/* Live Sub-Questions Feed (if generated) */}
        {subQuestions.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <BrainCircuit className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Investigative Hypotheses Formulated
              </span>
            </div>
            <ul className="space-y-1.5">
              {subQuestions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="font-mono text-cyan-400">{idx + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Discovered Sources Ticker (if retrieved) */}
        {sources.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Live Sources Ingested ({sources.length})
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">Live Web Retrieval</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 px-2.5 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-mono text-[10px] text-cyan-400 shrink-0">[{s.id}]</span>
                    <span className="truncate text-slate-300 font-medium" title={s.title}>{s.title}</span>
                  </div>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 shrink-0">
                    {s.domain}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible Agent Terminal Logs */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex w-full items-center justify-between bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800/80"
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Agent Thought & Execution Stream</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                {logs.length} events
              </span>
            </div>
            {showLogs ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {showLogs && (
            <div className="max-h-56 overflow-y-auto p-3 font-mono text-[11px] text-slate-300 space-y-1.5 bg-black/40">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-cyan-400 font-semibold shrink-0">
                    [{log.stage.toUpperCase()}]
                  </span>
                  <span className="text-slate-200">{log.message}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
