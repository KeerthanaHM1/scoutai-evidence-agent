import React from 'react';
import { ShieldAlert, History, Sparkles, Moon, Sun, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onNewResearch: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  searchProviderName?: string;
  isSearchConfigured?: boolean;
  onOpenSetupModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewResearch,
  onOpenHistory,
  historyCount,
  isDark,
  onToggleTheme,
  searchProviderName,
  isSearchConfigured = true,
  onOpenSetupModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/85 light:border-slate-200 light:bg-white/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewResearch}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-md shadow-cyan-500/20">
            <ShieldAlert className="h-5 w-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white dark:text-white light:text-slate-900">
                Scout<span className="text-cyan-400">AI</span>
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 tracking-wide uppercase">
                Intelligence v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Evidence Verification & Conflict Intelligence
            </p>
          </div>
        </div>

        {/* Search Provider Status Badge */}
        <div className="hidden md:flex items-center gap-3">
          {isSearchConfigured ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>Search Engine:</span>
              <span className="font-mono text-cyan-300">{searchProviderName || 'Active'}</span>
              <span className="text-slate-500">•</span>
              <span>AI:</span>
              <span className="font-mono text-emerald-300">gemini-3.8-flash</span>
            </div>
          ) : (
            <button
              onClick={onOpenSetupModal}
              className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/30 px-3 py-1 text-xs text-amber-300 hover:bg-amber-950/50 transition-colors"
            >
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span>Search Key Setup Required</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-semibold">Tavily / Serper</span>
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNewResearch}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white shadow-sm"
            title="Start New Investigation"
          >
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span>New Research</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white shadow-sm"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
