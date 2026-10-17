# ScoutAI — Evidence Verification & Intelligence Agent

> A recruiter-ready full-stack AI intelligence agent that explores complex topics, breaks down research questions, gathers live web evidence via free-tier search adapters, resolves conflicting claims with Gemini 3.8 Flash, and delivers structured, source-cited investigative dossiers.

---

## 🌟 Key Highlights & Capabilities

- **Quota-Resilient Architecture**: Removes the dependency on Gemini's built-in Google Search Grounding (which is prone to quota limits and paid tiers). Instead, uses a dedicated server-side search adapter coupled with Gemini 3.8 Flash for reasoning, evidence matrix classification, and report synthesis.
- **Real-Time Web Search Adapter**:
  - Connects to free-tier search providers (such as **Tavily Search API** with 1,000 free searches/month or **Serper Google Search API** with 2,500 free queries, neither requiring a credit card).
  - Preserves 100% genuine source URLs, domains, and article excerpts.
  - Strict zero-fabrication guarantee: if search is unconfigured or returns no results, ScoutAI clearly informs the user rather than inventing citations.
- **Session Concurrency Protection**: Limits execution to a maximum of one research investigation at a time per session, preventing concurrent quota exhaustion and race conditions.
- **Bounded Retries & Graceful Diagnostics**: Single-retry bounded backoff with clear diagnostics for configuration, rate-limits, or network issues.
- **Tri-Tier Evidence Matrix**:
  - **Supported Claims** (`status: 'supported'`): High evidence consensus with direct source citations.
  - **Conflicting Claims** (`status: 'conflicting'`): Disputed assertions juxtaposing Perspective A vs Perspective B side-by-side with nuance reconciliation.
  - **Unknown Information** (`status: 'unknown'`): Crucial empirical gaps, unreleased benchmarks, or proprietary blindspots.
- **Confidence Calibration Score**: Calibrated 0–100 confidence rating analyzing source diversity, data completeness, and consensus density.
- **Live Progress Timeline**: Real-time multi-stage visual stepper streaming agent reasoning steps and queries executed via Server-Sent Events (SSE).
- **Export & Portability**: Instant one-click Markdown export (`.md` file) with embedded citation tables and audit trail, plus clipboard copy.
- **Persistent Investigation History**: Saved on disk and browser storage to reload and review past dossiers.
- **Zero Client-Side Secrets**: All Gemini API and search keys reside strictly on the server side.

---

## 🏗️ Architecture & Agent Pipeline

```text
[ User Research Topic ]
           │
           ▼
[ Stage 1: Topic Decomposition (Gemini 3.8 Flash) ]
   • Deconstructs prompt into 4 core analytical sub-questions
   • Generates 3 targeted web search query vectors
           │
           ▼
[ Stage 2: Web Search Adapter (Tavily / Serper / Brave) ]
   • Server-side adapter queries live web index
   • Retrieves real URLs, titles, domains, and excerpts
   • Bounded to 1 retry max with 10s timeout
           │
           ▼
[ Stage 3: Evidence Matrix & Cross-Verification (Gemini 3.8 Flash) ]
   • Cross-references retrieved excerpts against sub-questions
   • Classifies claims into Supported, Conflicting, and Unknown
   • Extracts conflicting debates and synthesizes nuance
           │
           ▼
[ Stage 4: Confidence Calibration & Report Synthesis ]
   • Computes 0–100 confidence score based on source authoritativeness
   • Identifies critical limitations and future follow-up questions
           │
           ▼
[ Real-Time SSE Stream -> React Dashboard & Markdown Exporter ]
```

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans & JetBrains Mono typography.
- **Backend**: Node.js, Express, tsx.
- **AI Engine**: `@google/genai` (v2.4.0) with model `gemini-3.8-flash` for reasoning and synthesis.
- **Search Adapter**: Decoupled HTTP search provider (Tavily, Serper, or Brave).
- **Streaming**: Server-Sent Events (SSE) for agent thought streaming and live progress updates.
- **Storage**: Local filesystem JSON persistence with client-side localStorage synchronization.

---

## 🛠️ Free-Tier Setup Instructions

ScoutAI requires a **Gemini API Key** for intelligence synthesis and a **Free Search API Key** for live web retrieval.

### 1. Gemini API Key (Free)
- Automatically injected in Google AI Studio Build.
- Or obtain from [Google AI Studio](https://aistudio.google.com/) and set `GEMINI_API_KEY`.

### 2. Free Web Search Provider (Choose One)

#### Option A: Tavily Search API (Recommended)
1. Go to [https://tavily.com](https://tavily.com) and create a free account (no credit card required).
2. Copy your API key from the dashboard (includes **1,000 free searches per month**).
3. Set the key in **Settings > Secrets** or in your `.env` file:
   ```bash
   TAVILY_API_KEY="tvly-..."
   ```

#### Option B: Serper Google Search API (Alternative)
1. Go to [https://serper.dev](https://serper.dev) and sign up with email (no credit card required).
2. Copy your API key from the dashboard (includes **2,500 free queries**).
3. Set the key in **Settings > Secrets** or in your `.env` file:
   ```bash
   SERPER_API_KEY="..."
   ```

---

## 💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and TAVILY_API_KEY / SERPER_API_KEY

# 3. Start development server
npm run dev

# 4. Production build
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Complete Research Flow

1. **Verify Health Endpoint**:
   ```bash
   curl -s http://localhost:3000/api/health
   ```
   Returns `geminiConfigured: true`, active `searchProvider`, and `searchConfigured: true/false`.

2. **Test Search Provider Not Configured**:
   - If no search key is added, ScoutAI immediately displays a clean setup guide banner and halts gracefully without infinite retries or fake citations.

3. **Test Live Research Stream**:
   - Enter a query like *"Are solid-state batteries ready for commercial EV mass production in 2026?"*
   - Watch the multi-stage visual stepper stream decomposition, live search queries, and claim verification in real-time.
   - Inspect the interactive Evidence Matrix, click verified source links, review opposing viewpoints, and export report as Markdown.

4. **Test Concurrency Guard**:
   - If a research job is running, concurrent requests receive a `429` status explaining that an investigation is currently active.
