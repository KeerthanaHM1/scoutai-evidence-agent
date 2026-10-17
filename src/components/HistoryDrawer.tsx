import React, { useState } from 'react';
import { ReportSummary } from '../types';
import { X, Search, Clock, Trash2, ChevronRight, FileText, Sparkles, AlertCircle } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportSummary[];
  onSelectReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  activeReportId?: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  reports,
  onSelectReport,
  onDeleteReport,
  activeReportId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = reports.filter((r) =>
    r.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 p-6 shadow-2xl transition-transform animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Research History</h2>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono text-cyan-300">
              {reports.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Past Inquiries */}
        <div className="relative my-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past research dossiers..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <FileText className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium">No investigations found</p>
              <p className="text-xs text-slate-400 mt-1">
                {reports.length === 0
                  ? 'Run your first research inquiry to save reports.'
                  : 'No reports match your search query.'}
              </p>
            </div>
          ) : (
            filtered.map((report) => {
              const isActive = report.id === activeReportId;
              return (
                <div
                  key={report.id}
                  className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all cursor-pointer ${
                    isActive
                      ? 'border-cyan-500/50 bg-cyan-950/20'
                      : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                  onClick={() => {
                    onSelectReport(report.id);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                      {report.topic}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReport(report.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-all rounded hover:bg-slate-800"
                      title="Delete report"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {new Date(report.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">
                        {report.sourceCount} sources
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400">
                        Score: {report.confidenceScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Synced locally & on server</span>
          <span className="font-mono text-cyan-400">ScoutAI DB</span>
        </div>
      </div>
    </div>
  );
};
