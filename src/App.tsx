/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ResearchInputHero } from './components/ResearchInputHero';
import { ResearchProgressTimeline } from './components/ResearchProgressTimeline';
import { ReportView } from './components/ReportView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SearchSetupModal } from './components/SearchSetupModal';
import {
  ResearchReport,
  ReportSummary,
  ProgressState,
  AgentLog,
  ResearchSource,
  HealthStatus,
} from './types';
import { AlertCircle, RefreshCw, KeyRound, ExternalLink, Settings, ShieldAlert } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'scoutai_reports_history_v1';

export default function App() {
  const [currentReport, setCurrentReport] = useState<ResearchReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [progress, setProgress] = useState<ProgressState>({
    stage: 'idle',
    percentage: 0,
    title: '',
    description: '',
  });
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [subQuestions, setSubQuestions] = useState<string[]>([]);
  const [retrievedSources, setRetrievedSources] = useState<ResearchSource[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState<boolean>(false);
  const [isSearchSetupRequired, setIsSearchSetupRequired] = useState<boolean>(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);

  // Health and provider status
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);

  // History & Drawer
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<ReportSummary[]>([]);

  // Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('scoutai_theme') !== 'light';
  });

  // Load history & health from server on mount
  useEffect(() => {
    fetchHistory();
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: HealthStatus = await res.json();
        setHealthStatus(data);
      }
    } catch (err) {
      console.warn('Failed to fetch health status:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } else {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) setHistoryList(JSON.parse(local));
      }
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) setHistoryList(JSON.parse(local));
    }
  };

  const handleToggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('scoutai_theme', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleStartResearch = async (topic: string, depth: 'fast' | 'deep') => {
    if (isLoading) return; // Prevent concurrent jobs

    setIsLoading(true);
    setActiveTopic(topic);
    setErrorMessage(null);
    setIsApiKeyError(false);
    setIsSearchSetupRequired(false);
    setCurrentReport(null);
    setAgentLogs([]);
    setSubQuestions([]);
    setRetrievedSources([]);
    setProgress({
      stage: 'decomposition',
      percentage: 10,
      title: 'Initializing Intelligence Pipeline',
      description: 'Configuring Gemini 3.8 Flash agent and search adapter...',
    });

    try {
      const response = await fetch('/api/research/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, depth }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;

          let eventName = 'message';
          let dataStr = '';

          const lines = part.split('\n');
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6).trim();
            }
          }

          if (dataStr) {
            try {
              const parsed = JSON.parse(dataStr);

              if (eventName === 'status') {
                setProgress({
                  stage: parsed.stage,
                  percentage: parsed.percentage,
                  title: parsed.title,
                  description: parsed.description,
                });
              } else if (eventName === 'log') {
                setAgentLogs((prev) => [...prev, parsed]);
              } else if (eventName === 'sub_questions') {
                setSubQuestions(parsed.subQuestions || []);
              } else if (eventName === 'sources_found') {
                setRetrievedSources(parsed.sources || []);
              } else if (eventName === 'report_complete') {
                setCurrentReport(parsed);
                setIsLoading(false);
                fetchHistory(); // Refresh history
                fetchHealth();
              } else if (eventName === 'error') {
                setErrorMessage(parsed.message || 'An error occurred during research.');
                setIsApiKeyError(Boolean(parsed.isApiKeyError));
                setIsSearchSetupRequired(Boolean(parsed.isSearchSetupRequired));
                setIsLoading(false);
              }
            } catch (err) {
              console.warn('Failed to parse SSE payload:', err, dataStr);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Research request failed:', err);
      setErrorMessage(err.message || 'Failed to connect to ScoutAI backend services.');
      setIsLoading(false);
    }
  };

  const handleSelectReport = async (reportId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/reports/${reportId}`);
      if (!res.ok) throw new Error('Report could not be retrieved');
      const data = await res.json();
      setCurrentReport(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load report from history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      setHistoryList((prev) => prev.filter((r) => r.id !== reportId));
      if (currentReport?.id === reportId) {
        setCurrentReport(null);
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const handleResetToSearch = () => {
    setCurrentReport(null);
    setErrorMessage(null);
    setIsSearchSetupRequired(false);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-slate-100' : 'light bg-slate-50 text-slate-900'} transition-colors duration-200`}>
      {/* Top Navbar */}
      <Navbar
        onNewResearch={handleResetToSearch}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyList.length}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        searchProviderName={healthStatus?.activeProviderName}
        isSearchConfigured={healthStatus?.searchConfigured}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="pb-16">
        {/* Error / Setup Required Notification Banner */}
        {errorMessage && (
          <div className="mx-auto max-w-4xl px-4 pt-6">
            <div className={`rounded-2xl border p-5 backdrop-blur-xl ${
              isSearchSetupRequired
                ? 'border-amber-500/40 bg-amber-950/30'
                : 'border-rose-500/40 bg-rose-950/30'
            }`}>
              <div className="flex items-start gap-3">
                {isSearchSetupRequired ? (
                  <KeyRound className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold ${isSearchSetupRequired ? 'text-amber-200' : 'text-rose-200'}`}>
                    {isSearchSetupRequired ? 'Search Provider Setup Required' : 'Investigation Notice'}
                  </h3>
                  <p className={`mt-1 text-xs leading-relaxed ${isSearchSetupRequired ? 'text-amber-300' : 'text-rose-300'}`}>
                    {errorMessage}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {isSearchSetupRequired && (
                      <button
                        onClick={() => setIsSetupModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5 text-amber-400" />
                        <span>View Free Setup Instructions</span>
                      </button>
                    )}

                    {isApiKeyError && (
                      <div className="flex items-center gap-2 text-xs text-rose-300/80">
                        <KeyRound className="h-4 w-4 text-rose-400" />
                        <span>
                          Configure GEMINI_API_KEY in the AI Studio{' '}
                          <strong className="text-white">Settings &gt; Secrets</strong> panel.
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setErrorMessage(null);
                        setIsSearchSetupRequired(false);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Switching */}
        {isLoading ? (
          <ResearchProgressTimeline
            progress={progress}
            logs={agentLogs}
            subQuestions={subQuestions}
            sources={retrievedSources}
            topic={activeTopic}
          />
        ) : currentReport ? (
          <ReportView
            report={currentReport}
            onNewSearch={handleResetToSearch}
          />
        ) : (
          <ResearchInputHero
            onStartResearch={handleStartResearch}
            isLoading={isLoading}
            isSearchConfigured={healthStatus?.searchConfigured}
            searchProviderName={healthStatus?.activeProviderName}
            onOpenSetupModal={() => setIsSetupModalOpen(true)}
          />
        )}
      </main>

      {/* Persistent History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        reports={historyList}
        onSelectReport={handleSelectReport}
        onDeleteReport={handleDeleteReport}
        activeReportId={currentReport?.id}
      />

      {/* Free Search Provider Setup Modal */}
      <SearchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
}
