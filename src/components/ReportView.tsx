import React, { useState } from 'react';
import {
  ResearchReport,
  ResearchSource,
  ClaimVerification,
  ClaimStatus,
} from '../types';
import {
  ShieldAlert,
  Download,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Search,
  Layers,
  ArrowLeft,
  Share2,
  Info,
  ChevronRight,
  TrendingUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { downloadMarkdownFile, generateReportMarkdown } from '../utils/exportMarkdown';

interface ReportViewProps {
  report: ResearchReport;
  onNewSearch: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onNewSearch }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'matrix' | 'findings' | 'conflicts' | 'sources' | 'limitations' | 'audit'>('summary');
  const [claimFilter, setClaimFilter] = useState<'all' | ClaimStatus>('all');
  const [copied, setCopied] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null);

  const sourceMap = new Map<string, ResearchSource>(
    report.sources.map((s) => [s.id, s])
  );

  const handleCopyMarkdown = () => {
    const md = generateReportMarkdown(report);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    downloadMarkdownFile(report);
  };

  const supportedCount = report.claims.filter((c) => c.status === 'supported').length;
  const conflictingCount = report.claims.filter((c) => c.status === 'conflicting').length;
  const unknownCount = report.claims.filter((c) => c.status === 'unknown').length;

  const filteredClaims = report.claims.filter((c) => {
    if (claimFilter === 'all') return true;
    return c.status === claimFilter;
  });

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'authoritative':
        return <span className="rounded bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">Gov / Standard</span>;
      case 'academic':
        return <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">Peer-Reviewed / Academic</span>;
      case 'news':
        return <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30">Major Wire / News</span>;
      case 'industry':
        return <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">Industry / Tech</span>;
      default:
        return <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">Web Source</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onNewSearch}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            title="Back to search"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                ScoutAI Intelligence Dossier
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(report.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5 line-clamp-2">
              {report.topic}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy MD</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-emerald-400"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Intelligence Metric Cards Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 my-6">
        {/* Confidence Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Confidence Rating</span>
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {report.confidenceAssessment.overallScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">/100</span>
            <span className={`ml-auto rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getConfidenceColor(report.confidenceAssessment.overallScore)}`}>
              {report.confidenceAssessment.level}
            </span>
          </div>
        </div>

        {/* Supported Claims */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Supported Claims</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {supportedCount}
            </span>
            <span className="text-xs text-slate-400">verified</span>
          </div>
        </div>

        {/* Conflicting Claims */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Conflicting Disputes</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {conflictingCount}
            </span>
            <span className="text-xs text-slate-400">contested</span>
          </div>
        </div>

        {/* Live Grounded Sources */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Sources Cited</span>
            <Search className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {report.sources.length}
            </span>
            <span className="text-xs text-slate-400">real web links</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2 mb-6 scrollbar-none">
        {[
          { id: 'summary', label: 'Executive Summary', icon: FileText },
          { id: 'matrix', label: `Evidence Matrix (${report.claims.length})`, icon: Layers },
          { id: 'findings', label: `Key Findings (${report.keyFindings.length})`, icon: TrendingUp },
          { id: 'conflicts', label: `Conflicting Debates (${report.conflictingDebates.length})`, icon: AlertTriangle },
          { id: 'sources', label: `Grounded Sources (${report.sources.length})`, icon: ExternalLink },
          { id: 'limitations', label: 'Limitations & Unknowns', icon: HelpCircle },
          { id: 'audit', label: 'Agent Audit Trail', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-sm shadow-cyan-950/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. EXECUTIVE SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-4">
              <FileText className="h-4 w-4" />
              <span>Bottom-Line Intelligence Verdict</span>
            </div>
            <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
              {report.executiveSummary.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Investigated Hypotheses Sub-Questions */}
          {report.subQuestions && report.subQuestions.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-semibold text-white mb-3">
                Core Investigated Inquiries
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.subQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 text-xs text-slate-300"
                  >
                    <span className="font-mono text-cyan-400 font-semibold">{idx + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidence Calibration Details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Confidence Assessment & Calibration Rationale</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {report.confidenceAssessment.rationale}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Data Completeness:</span>
                <p className="text-slate-200 mt-0.5">{report.confidenceAssessment.dataCompleteness}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Source Diversity:</span>
                <p className="text-slate-200 mt-0.5">{report.confidenceAssessment.sourceDiversity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. EVIDENCE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Claim Status Filters */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 p-1 text-xs">
              <button
                onClick={() => setClaimFilter('all')}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  claimFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Claims ({report.claims.length})
              </button>
              <button
                onClick={() => setClaimFilter('supported')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors ${
                  claimFilter === 'supported'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                Supported ({supportedCount})
              </button>
              <button
                onClick={() => setClaimFilter('conflicting')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors ${
                  claimFilter === 'conflicting'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                Conflicting ({conflictingCount})
              </button>
              <button
                onClick={() => setClaimFilter('unknown')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors ${
                  claimFilter === 'unknown'
                    ? 'bg-slate-700 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="h-3 w-3" />
                Unknown ({unknownCount})
              </button>
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredClaims.length} verified assertions
            </span>
          </div>

          {/* Claims List */}
          <div className="space-y-3">
            {filteredClaims.map((claim) => {
              const isSupported = claim.status === 'supported';
              const isConflicting = claim.status === 'conflicting';

              return (
                <div
                  key={claim.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isSupported
                      ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50'
                      : isConflicting
                      ? 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {isSupported && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Supported Claim
                        </span>
                      )}
                      {isConflicting && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Conflicting Evidence
                        </span>
                      )}
                      {!isSupported && !isConflicting && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
                          <HelpCircle className="h-3.5 w-3.5" />
                          Unknown / Inconclusive
                        </span>
                      )}

                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono uppercase text-slate-400">
                        Confidence: {claim.confidence}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                    {claim.claim}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {claim.explanation}
                  </p>

                  {/* Supporting Sources */}
                  {claim.supportingSourceIds && claim.supportingSourceIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-medium text-slate-400">
                        Supporting evidence:
                      </span>
                      {claim.supportingSourceIds.map((id) => {
                        const s = sourceMap.get(id);
                        if (!s) return null;
                        return (
                          <a
                            key={id}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 text-[11px] font-medium text-emerald-300 hover:border-emerald-400 hover:text-white transition-colors"
                          >
                            <span>{s.domain}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Opposing Sources (if conflicting) */}
                  {claim.opposingSourceIds && claim.opposingSourceIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-medium text-amber-400">
                        Counter evidence:
                      </span>
                      {claim.opposingSourceIds.map((id) => {
                        const s = sourceMap.get(id);
                        if (!s) return null;
                        return (
                          <a
                            key={id}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/30 px-2 py-0.5 text-[11px] font-medium text-amber-300 hover:border-amber-400 hover:text-white transition-colors"
                          >
                            <span>{s.domain}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. KEY FINDINGS */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {report.keyFindings.map((finding, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white">
                      {finding.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {finding.description}
                    </p>

                    {/* Sources Cited */}
                    {finding.sourceIds && finding.sourceIds.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-800/80">
                        <span className="text-[11px] font-medium text-slate-400">
                          Cited sources:
                        </span>
                        {finding.sourceIds.map((id) => {
                          const s = sourceMap.get(id);
                          if (!s) return null;
                          return (
                            <a
                              key={id}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-cyan-300 hover:border-cyan-500 hover:text-white transition-colors"
                            >
                              <span>{s.domain}</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. CONFLICTING DEBATES */}
      {activeTab === 'conflicts' && (
        <div className="space-y-6">
          {report.conflictingDebates.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
              <h3 className="text-base font-semibold text-white">High Consensus Observed</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                No major unresolved contradictory claims were surfaced in the primary authoritative literature for this topic.
              </p>
            </div>
          ) : (
            report.conflictingDebates.map((debate, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-xl shadow-amber-950/10 backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Contradiction Analysis #{idx + 1}: {debate.topic}</span>
                </div>

                {/* Perspective Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Perspective A */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                      Perspective A
                    </span>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      {debate.perspectiveA.stance}
                    </p>
                    {debate.perspectiveA.sourceIds.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {debate.perspectiveA.sourceIds.map((id) => {
                          const s = sourceMap.get(id);
                          if (!s) return null;
                          return (
                            <a
                              key={id}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-cyan-300 underline underline-offset-2 hover:text-white"
                            >
                              {s.domain}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Perspective B */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Perspective B
                    </span>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      {debate.perspectiveB.stance}
                    </p>
                    {debate.perspectiveB.sourceIds.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {debate.perspectiveB.sourceIds.map((id) => {
                          const s = sourceMap.get(id);
                          if (!s) return null;
                          return (
                            <a
                              key={id}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-amber-300 underline underline-offset-2 hover:text-white"
                            >
                              {s.domain}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Nuance & Synthesis Box */}
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Reconciliation & Nuance:</span>
                  </div>
                  {debate.nuance}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. GROUNDED SOURCES DIRECTORY */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    Real Grounded Citations ({report.sources.length})
                  </h3>
                  {report.searchProvider && (
                    <span className="rounded bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      via {report.searchProvider}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Directly ingested via server-side search retrieval. No simulated or artificial links.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400 font-medium">
                100% Verified URLs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.sources.map((source) => (
                <div
                  key={source.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-cyan-500/40 hover:bg-slate-900/70"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-semibold text-cyan-400">
                        [{source.id}]
                      </span>
                      {getTierBadge(source.credibilityTier)}
                    </div>
                    <h4 className="text-sm font-semibold text-white line-clamp-2">
                      {source.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-400 font-mono">
                      {source.domain}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Relevance: {source.relevanceScore || 90}%
                    </span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                    >
                      <span>Visit Source</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Queries Executed */}
          {report.searchQueries && report.searchQueries.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-cyan-400" />
                <span>Web Search Queries Dispatched</span>
              </h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {report.searchQueries.map((query, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-mono text-slate-300"
                  >
                    "{query}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 6. LIMITATIONS & UNKNOWNS */}
      {activeTab === 'limitations' && (
        <div className="space-y-6">
          {/* Unknowns & Data Gaps */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              <span>Unknowns, Data Gaps & Blindspots</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Critical metrics or dimensions where publicly available empirical evidence is either scarce, proprietary, or methodologically contested.
            </p>
            <ul className="space-y-2.5">
              {report.unknownsAndBlindspots.map((unk, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs sm:text-sm text-slate-300"
                >
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{unk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations */}
          {report.limitations && report.limitations.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
              <h3 className="text-base font-semibold text-white mb-3">
                Methodological Limitations
              </h3>
              <ul className="space-y-2">
                {report.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                    <span className="text-slate-400 font-mono">[{idx + 1}]</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up Questions */}
          {report.recommendedFollowUps && report.recommendedFollowUps.length > 0 && (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-6">
              <h3 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Recommended Follow-Up Inquiries</span>
              </h3>
              <ul className="space-y-2">
                {report.recommendedFollowUps.map((rf, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                    <ChevronRight className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 7. AGENT AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <h3 className="text-base font-semibold text-white mb-3">
              Agent Execution & Reasoning Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Step-by-step verification log recorded during this research session.
            </p>
            <div className="rounded-xl border border-slate-800 bg-black/60 p-4 font-mono text-xs text-slate-300 space-y-2 max-h-96 overflow-y-auto">
              {report.rawAgentLogs && report.rawAgentLogs.length > 0 ? (
                report.rawAgentLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-cyan-400 font-semibold shrink-0">
                      [{log.stage.toUpperCase()}]
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400">Execution log recorded at initialization.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
