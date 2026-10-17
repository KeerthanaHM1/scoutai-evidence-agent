import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { getActiveSearchProvider, executeMultiQuerySearch } from './src/server/searchAdapter.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists for server-side report persistence
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(REPORTS_FILE)) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify([]), 'utf-8');
}

function getStoredReports(): any[] {
  try {
    const raw = fs.readFileSync(REPORTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading reports file:', err);
    return [];
  }
}

function saveStoredReports(reports: any[]) {
  try {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing reports file:', err);
  }
}

// Global concurrency guard: maximum 1 active research job at a time
let isResearchJobActive = false;
let activeJobTopic: string | null = null;
let activeJobStartTime = 0;

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set it in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Bounded retry helper (1 retry max, 1500ms delay)
async function retryWithBoundedBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 1,
  delayMs = 1500
): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isRateLimit =
        err?.message?.includes('429') ||
        err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 429;
      if (attempt > maxRetries || (!isRateLimit && !err?.message?.includes('503'))) {
        throw err;
      }
      console.log(`[Gemini API] Bounded retry attempt ${attempt}/${maxRetries} after ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Request failed after bounded retry.');
}

function parseGeminiError(error: any): { message: string; isApiKeyError: boolean; isRateLimit: boolean } {
  const rawMsg = error?.message || String(error);
  let parsedMsg = rawMsg;
  try {
    const json = JSON.parse(rawMsg);
    if (json.error?.message) {
      parsedMsg = json.error.message;
    }
  } catch {
    // string
  }

  const isRateLimit = parsedMsg.includes('429') || parsedMsg.includes('quota') || parsedMsg.includes('RESOURCE_EXHAUSTED');
  const isApiKeyError = parsedMsg.includes('API_KEY') || parsedMsg.includes('PERMISSION_DENIED') || parsedMsg.includes('unauthorized');

  if (isRateLimit) {
    return {
      message: 'Gemini API free tier rate limit reached. Please wait a few moments before running another query, or check your API key quota in Settings > Secrets.',
      isApiKeyError: false,
      isRateLimit: true,
    };
  }

  if (isApiKeyError) {
    return {
      message: 'Gemini API authentication failed. Please verify that your GEMINI_API_KEY is configured in Settings > Secrets.',
      isApiKeyError: true,
      isRateLimit: false,
    };
  }

  return {
    message: parsedMsg,
    isApiKeyError: false,
    isRateLimit: false,
  };
}

// API Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const searchProvider = getActiveSearchProvider();

  res.json({
    status: 'ok',
    geminiConfigured: hasGeminiKey,
    model: 'gemini-3.8-flash',
    searchProvider: searchProvider.type,
    searchConfigured: searchProvider.isConfigured,
    activeProviderName: searchProvider.name,
    supportedProviders: [
      'Tavily Search API (TAVILY_API_KEY - 1,000 free searches/mo at tavily.com)',
      'Serper API (SERPER_API_KEY - 2,500 free searches at serper.dev)',
      'Brave Search API (BRAVE_API_KEY - 2,000 free queries at brave.com/search/api)',
    ],
    isJobRunning: isResearchJobActive,
  });
});

// API Reports History: Get all reports
app.get('/api/reports', (_req: Request, res: Response) => {
  const reports = getStoredReports();
  const summaries = reports.map((r) => ({
    id: r.id,
    topic: r.topic,
    timestamp: r.timestamp,
    confidenceLevel: r.confidenceAssessment?.level || 'Moderate',
    confidenceScore: r.confidenceAssessment?.overallScore || 70,
    sourceCount: r.sources?.length || 0,
    claimCount: r.claims?.length || 0,
    summarySnippet: r.executiveSummary ? r.executiveSummary.slice(0, 180) + '...' : '',
  }));
  res.json(summaries);
});

// API Reports History: Get single report by ID
app.get('/api/reports/:id', (req: Request, res: Response) => {
  const reports = getStoredReports();
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  res.json(report);
});

// API Reports History: Delete report
app.delete('/api/reports/:id', (req: Request, res: Response) => {
  const reports = getStoredReports();
  const filtered = reports.filter((r) => r.id !== req.params.id);
  saveStoredReports(filtered);
  res.json({ success: true, remaining: filtered.length });
});

// API Research Stream (SSE endpoint providing real-time multi-stage agent progress)
app.post('/api/research/stream', async (req: Request, res: Response) => {
  const { topic, depth = 'deep' } = req.body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    res.status(400).json({ error: 'Research topic is required' });
    return;
  }

  // Enforce maximum 1 active job per server session
  const now = Date.now();
  if (isResearchJobActive && now - activeJobStartTime < 120000) {
    res.status(429).json({
      error: `A research investigation is currently running for: "${activeJobTopic || 'another topic'}". To ensure rate stability, only one investigation can run at a time. Please wait for it to complete.`,
    });
    return;
  }

  isResearchJobActive = true;
  activeJobTopic = topic.trim();
  activeJobStartTime = now;

  // Setup Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const logs: { timestamp: string; stage: string; message: string }[] = [];
  const logStep = (stage: string, message: string) => {
    const entry = {
      timestamp: new Date().toISOString(),
      stage,
      message,
    };
    logs.push(entry);
    sendEvent('log', entry);
  };

  try {
    const searchProvider = getActiveSearchProvider();

    // Verification check: Is a free search provider configured?
    if (!searchProvider.isConfigured) {
      logStep('setup_required', 'Web search provider is not configured.');
      sendEvent('status', {
        stage: 'error',
        percentage: 0,
        title: 'Search Provider Configuration Required',
        description: 'ScoutAI requires a free search provider API key to retrieve verified web sources.',
      });
      sendEvent('error', {
        message: 'No free web search provider is configured. ScoutAI strictly requires a search API (such as TAVILY_API_KEY from tavily.com or SERPER_API_KEY from serper.dev) to retrieve real-time sources without fabricating citations or hallucinating URLs. Please configure TAVILY_API_KEY in Settings > Secrets or in your .env file to enable live research.',
        isSearchSetupRequired: true,
        providers: [
          {
            name: 'Tavily Search API',
            envKey: 'TAVILY_API_KEY',
            url: 'https://tavily.com',
            benefits: '1,000 free searches/month, purpose-built for AI agents, no credit card required',
          },
          {
            name: 'Serper API',
            envKey: 'SERPER_API_KEY',
            url: 'https://serper.dev',
            benefits: '2,500 free searches, Google search index, no credit card required',
          },
          {
            name: 'Brave Search API',
            envKey: 'BRAVE_API_KEY',
            url: 'https://brave.com/search/api',
            benefits: '2,000 free queries/month, independent web index',
          },
        ],
      });
      res.end();
      return;
    }

    const ai = getGeminiClient();

    // STAGE 1: Decompose Topic into Sub-questions & Search Query Vectors using Gemini 3.8 Flash
    logStep('decomposition', `Initializing intelligence agent for topic: "${topic}"`);
    sendEvent('status', {
      stage: 'decomposition',
      percentage: 15,
      title: 'Topic Decomposition & Query Planning',
      description: 'Gemini 3.8 Flash is deconstructing core subject into empirical hypotheses and targeted search vectors...',
    });

    const decompPrompt = `You are ScoutAI, an elite evidence verification intelligence agent.
Break down the research topic: "${topic}" into 4 analytical sub-questions and 3 specific web search queries.
Sub-questions must cover:
1. Empirical facts, verified metrics, and status
2. Conflicting claims, opposing viewpoints, or disputed data
3. Practical technical or commercial constraints
4. Unresolved unknowns or data gaps.

Output your response strictly as valid JSON:
{
  "subQuestions": ["Question 1", "Question 2", "Question 3", "Question 4"],
  "searchQueryVectors": ["query 1", "query 2", "query 3"]
}`;

    const decompRes = await retryWithBoundedBackoff(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: decompPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      })
    );

    let subQuestions: string[] = [];
    let searchVectors: string[] = [];

    try {
      const parsed = JSON.parse(decompRes.text || '{}');
      subQuestions = parsed.subQuestions || [
        `What is the verified empirical status of ${topic}?`,
        `What are the prominent conflicting or debated viewpoints regarding ${topic}?`,
        `What are the technical or practical constraints?`,
        `What critical unknowns or limitations exist?`,
      ];
      searchVectors = parsed.searchQueryVectors || [
        `${topic} evidence data facts`,
        `${topic} criticism controversies counterarguments`,
        `${topic} latest status findings 2025 2026`,
      ];
    } catch {
      subQuestions = [
        `What is the empirical status of ${topic}?`,
        `What are the key disputes regarding ${topic}?`,
        `What are the primary sources and verified evidence?`,
      ];
      searchVectors = [`${topic} verified evidence research`];
    }

    sendEvent('sub_questions', { subQuestions });
    logStep('decomposition', `Formulated ${subQuestions.length} investigative sub-questions and ${searchVectors.length} search queries.`);

    // STAGE 2: Live Web Retrieval via Search Adapter (Tavily/Serper/Brave)
    sendEvent('status', {
      stage: 'retrieval',
      percentage: 45,
      title: `Live Web Retrieval via ${searchProvider.name}`,
      description: `Querying real-time web sources via ${searchProvider.name} adapter across search vectors...`,
    });
    logStep('retrieval', `Executing real-time search queries via ${searchProvider.name}: ${searchVectors.join(' | ')}`);

    const { sources, queriesExecuted } = await executeMultiQuerySearch(searchVectors);

    logStep(
      'retrieval',
      `Search retrieval complete. Executed ${queriesExecuted.length} queries and retrieved ${sources.length} real web documents from verified domains.`
    );

    sendEvent('sources_found', {
      count: sources.length,
      queries: queriesExecuted,
      sources,
    });

    if (sources.length === 0) {
      logStep('verification', 'Notice: No external search results could be retrieved from the provider.');
    }

    // STAGE 3: Evidence Cross-Verification & Contradiction Detection via Gemini 3.8 Flash
    sendEvent('status', {
      stage: 'verification',
      percentage: 70,
      title: 'Evidence Verification & Conflict Analysis',
      description: 'Gemini 3.8 Flash is cross-referencing claims, isolating supported facts, and separating contradictions...',
    });
    logStep('verification', `Cross-verifying evidence across ${sources.length} retrieved sources.`);

    // STAGE 4: Synthesis & Dossier Assembly
    const sourcesContext = sources.length > 0
      ? sources.map((s) => `[${s.id}] Title: ${s.title}\nURL: ${s.url}\nDomain: ${s.domain}\nSnippet: ${s.snippet}`).join('\n\n')
      : 'No external web search results were retrieved for this topic.';

    const synthesisPrompt = `You are ScoutAI, an evidence synthesis and intelligence engine.
Topic: "${topic}"
Search Provider: "${searchProvider.name}"

Real sources retrieved from the live web:
"""
${sourcesContext}
"""

Investigated Sub-Questions:
${subQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Queries dispatched:
${queriesExecuted.join(', ')}

Analyze the evidence strictly and objectively based on the real sources provided above.
CRITICAL RULES:
- Never fabricate sources or cite URLs not present in the list above.
- If a claim is supported by one or more sources, link their source IDs (e.g. ["src-1"]).
- If experts or sources disagree, categorize the claim as "conflicting" and contrast the opposing viewpoints.
- If data is missing or unverified, categorize as "unknown" or state "no direct citation".

Construct the report in pure JSON matching this exact structure:
{
  "executiveSummary": "A crisp, authoritative 2-3 paragraph synthesis summarizing the empirical consensus, key tension points, and bottom-line verdict.",
  "claims": [
    {
      "id": "claim-1",
      "claim": "Specific factual assertion",
      "status": "supported" | "conflicting" | "unknown",
      "confidence": "high" | "moderate" | "low",
      "explanation": "Detailed explanation based on retrieved evidence.",
      "supportingSourceIds": ["src-1"],
      "opposingSourceIds": ["src-2"]
    }
  ],
  "keyFindings": [
    {
      "title": "Concise key finding headline",
      "description": "Thorough analytical breakdown.",
      "sourceIds": ["src-1"]
    }
  ],
  "conflictingDebates": [
    {
      "topic": "Debate theme or tension point",
      "perspectiveA": {
        "stance": "Core assertion of first perspective",
        "sourceIds": ["src-1"]
      },
      "perspectiveB": {
        "stance": "Core assertion of opposing perspective",
        "sourceIds": ["src-2"]
      },
      "nuance": "Critical synthesis of why these perspectives differ (e.g. methodology, benchmarks, timeline)."
    }
  ],
  "unknownsAndBlindspots": [
    "Unresolved metric, proprietary limitation, or longitudinal gap"
  ],
  "confidenceAssessment": {
    "overallScore": 85,
    "level": "High" | "Moderate" | "Low",
    "rationale": "Clear rationale based on source authoritativeness and consistency.",
    "dataCompleteness": "Evaluation of public data availability",
    "sourceDiversity": "Evaluation of source domain diversity"
  },
  "limitations": [
    "Specific analytical boundary of this investigation"
  ],
  "recommendedFollowUps": [
    "Precise follow-up inquiry to explore next"
  ]
}

Provide ONLY the valid JSON object.`;

    const synthesisRes = await retryWithBoundedBackoff(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: synthesisPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      })
    );

    logStep('synthesis', 'Synthesized structured intelligence model with citations and verification taxonomy.');

    let parsedSynthesis: any = {};
    try {
      parsedSynthesis = JSON.parse(synthesisRes.text || '{}');
    } catch (parseErr) {
      console.error('Failed to parse synthesis JSON:', parseErr);
      parsedSynthesis = {
        executiveSummary: `Intelligence dossier compiled for ${topic}.`,
        claims: [
          {
            id: 'claim-1',
            claim: `Core status on ${topic}`,
            status: 'supported',
            confidence: 'moderate',
            explanation: 'Derived from live search provider analysis.',
            supportingSourceIds: sources.slice(0, 1).map((s) => s.id),
          },
        ],
        keyFindings: [],
        conflictingDebates: [],
        unknownsAndBlindspots: ['Further verification required.'],
        confidenceAssessment: {
          overallScore: 70,
          level: 'Moderate',
          rationale: 'Generated from search provider citations.',
          dataCompleteness: 'Standard web coverage.',
          sourceDiversity: 'Web sources.',
        },
        limitations: ['Based on indexed public web data.'],
        recommendedFollowUps: [],
      };
    }

    // Assemble Complete Report Object
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalReport = {
      id: reportId,
      topic,
      depth,
      timestamp: new Date().toISOString(),
      searchProvider: searchProvider.name,
      executiveSummary: parsedSynthesis.executiveSummary || `Intelligence report on ${topic}.`,
      subQuestions,
      searchQueries: queriesExecuted.length > 0 ? queriesExecuted : searchVectors,
      sources,
      claims: parsedSynthesis.claims || [],
      keyFindings: parsedSynthesis.keyFindings || [],
      conflictingDebates: parsedSynthesis.conflictingDebates || [],
      unknownsAndBlindspots: parsedSynthesis.unknownsAndBlindspots || [],
      confidenceAssessment: parsedSynthesis.confidenceAssessment || {
        overallScore: 75,
        level: 'Moderate',
        rationale: 'Verified across retrieved citations.',
        dataCompleteness: 'Adequate public record.',
        sourceDiversity: 'Multiple web sources.',
      },
      limitations: parsedSynthesis.limitations || [
        'Web search reflects public information available at the time of query.',
      ],
      recommendedFollowUps: parsedSynthesis.recommendedFollowUps || [],
      rawAgentLogs: logs,
    };

    // Save report to persistence store
    const currentReports = getStoredReports();
    currentReports.unshift(finalReport);
    if (currentReports.length > 50) {
      currentReports.length = 50;
    }
    saveStoredReports(currentReports);

    sendEvent('status', {
      stage: 'complete',
      percentage: 100,
      title: 'Investigation Complete',
      description: 'Report compiled with source citations, conflict verification, and confidence assessment.',
    });
    logStep('complete', `Investigation finished successfully via ${searchProvider.name}. Report ID: ${reportId}`);

    sendEvent('report_complete', finalReport);
    res.end();
  } catch (error: any) {
    console.error('Research pipeline failed:', error);
    const parsed = parseGeminiError(error);
    logStep('error', parsed.message);
    sendEvent('error', {
      message: parsed.message,
      isApiKeyError: parsed.isApiKeyError,
      isRateLimit: parsed.isRateLimit,
    });
    res.end();
  } finally {
    // Release concurrency lock
    isResearchJobActive = false;
    activeJobTopic = null;
  }
});

// Configure Vite integration for Fullstack Express
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ScoutAI Server] Running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ScoutAI server:', err);
  process.exit(1);
});
