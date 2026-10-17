# ScoutAI — Evidence Verification & Intelligence Agent

An AI-powered research application that decomposes complex questions, retrieves live web evidence, analyzes conflicting claims, identifies knowledge gaps, and generates structured intelligence reports with source citations.

**Live Demo:** [Launch ScoutAI](https://scoutai-research-agent-3234.ai.studio/)

**GitHub Repository:** [scoutai-evidence-agent](https://github.com/KeerthanaHM1/scoutai-evidence-agent)

---

## 🌟 Key Features

- **AI-Powered Topic Decomposition:** Breaks complex research questions into focused investigative subquestions.
- **Live Web Search:** Retrieves real search results through a configured server-side search provider.
- **Source-Linked Findings:** Presents source URLs, domains, and available excerpts to support research findings.
- **Evidence Matrix:** Organizes findings into three categories:
  - **Supported Claims:** Claims supported by the retrieved evidence.
  - **Conflicting Claims:** Claims for which sources provide differing evidence or interpretations.
  - **Unknown Information:** Important questions that available evidence does not adequately resolve.
- **Evidence-Based Confidence Estimate:** Provides an indicative confidence score based on evidence completeness, source diversity, and the available findings.
- **Live Research Progress:** Displays investigation stages and progress updates.
- **Investigation History:** Helps users revisit previous research reports.
- **Markdown Export:** Download or copy structured reports.
- **Error Handling:** Provides helpful messages for missing configuration, rate limits, and network errors.
- **Server-Side Secret Handling:** Keeps API credentials out of frontend code.
- **Responsive Interface:** Provides a modern interface with dark and light themes.

## 🏗️ Architecture

```text
User Research Question
        |
        v
1. Topic Decomposition
   Gemini analyzes the question and creates subquestions
        |
        v
2. Web Search Adapter
   Retrieves real source URLs, titles, and excerpts
        |
        v
3. Evidence Analysis
   Gemini analyzes retrieved evidence and disagreements
        |
        v
4. Evidence Classification
   Supported | Conflicting | Unknown
        |
        v
5. Report Generation
   Findings, citations, confidence estimate, and limitations
        |
        v
Interactive Dashboard and Markdown Export
```

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express
- **AI Engine:** Google Gemini API
- **Web Search:** Configurable search API adapter
- **Streaming:** Server-Sent Events (SSE), if enabled in the configured implementation
- **Storage:** Browser local storage and backend persistence, subject to deployment configuration
- **Tools:** npm, Git, GitHub

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A Google Gemini API key
- An API key for a search provider supported by the implementation

### 1. Clone the Repository

```bash
git clone https://github.com/KeerthanaHM1/scoutai-evidence-agent.git
cd scoutai-evidence-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file using `.env.example` as a reference.

Example configuration for Gemini and Tavily:

```env
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Use only the environment variables supported by your current search adapter. If the implementation uses Serper or Brave instead, configure the corresponding variable documented in `.env.example`.

**Never commit actual API keys or `.env` files to GitHub.** Keep `.env.example` limited to placeholder values.

### 4. Obtain API Keys

- **Gemini API:** [Google AI Studio](https://aistudio.google.com/)
- **Tavily Search API:** [Tavily](https://www.tavily.com/)
- **Serper Search API:** [Serper](https://serper.dev/)
- **Brave Search API:** [Brave Search API](https://brave.com/search/api/)

Availability, usage limits, and free-tier terms depend on the provider and may change. Configure only a provider supported by the application code.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL printed in your terminal. If the project defines separate frontend and backend commands, follow the scripts in `package.json` and the README or server configuration.

### 6. Build for Production

```bash
npm run build
```

Use the production start command defined in `package.json` to run the built application.

## 🔍 Example Research Query

Try investigating:

> Are solid-state batteries ready for commercial electric vehicle mass production? Compare technical progress, manufacturing challenges, costs, and current limitations using reliable sources.

A completed investigation should present the available evidence, conflicting claims where relevant, unresolved questions, source links, and a structured report.

## 🧪 Testing Checklist

- [ ] Submit a valid research question.
- [ ] Confirm that live search returns real, relevant sources.
- [ ] Open citations and verify that they support the associated claims.
- [ ] Review supported, conflicting, and unknown findings.
- [ ] Confirm that rate limits and search failures produce helpful messages.
- [ ] Export a report as Markdown and open the downloaded file.
- [ ] Refresh the app and test investigation history.
- [ ] Confirm that API keys are not exposed in frontend code or repository files.

## 🔐 Security and Limitations

- Research quality depends on the relevance and reliability of retrieved sources.
- AI-generated summaries and confidence estimates should be independently verified for important decisions.
- Search-provider rate limits may temporarily prevent live research.
- Local filesystem data may not survive redeployments unless the hosting environment supports persistent storage.
- API keys must remain server-side and should never be committed to source control.

## 🚧 Future Enhancements

- Automated evaluation of claim accuracy and citation relevance.
- Improved source-quality scoring and duplicate-source detection.
- Research report comparison and version history.
- Additional search-provider integrations.
- PDF report export and shareable investigation links.

## 👩‍💻 Author

**Keerthana H M**

Computer Science Engineering Student

- **Live Project:** [ScoutAI](https://scoutai-research-agent-3234.ai.studio/)
- **GitHub:** [KeerthanaHM1](https://github.com/KeerthanaHM1)

---

*ScoutAI helps users investigate complex questions by organizing available evidence, highlighting disagreements, and making research sources easier to inspect.*
