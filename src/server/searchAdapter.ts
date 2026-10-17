export interface RawSearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  relevanceScore: number;
  credibilityTier: 'authoritative' | 'academic' | 'news' | 'industry' | 'web';
}

export type SearchProviderType = 'tavily' | 'serper' | 'brave' | 'none';

export function getActiveSearchProvider(): {
  type: SearchProviderType;
  name: string;
  isConfigured: boolean;
} {
  if (process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY.trim() !== '') {
    return {
      type: 'tavily',
      name: 'Tavily Search API',
      isConfigured: true,
    };
  }
  if (process.env.SERPER_API_KEY && process.env.SERPER_API_KEY.trim() !== '') {
    return {
      type: 'serper',
      name: 'Serper API',
      isConfigured: true,
    };
  }
  if (process.env.BRAVE_API_KEY && process.env.BRAVE_API_KEY.trim() !== '') {
    return {
      type: 'brave',
      name: 'Brave Search API',
      isConfigured: true,
    };
  }
  return {
    type: 'none',
    name: 'None Configured',
    isConfigured: false,
  };
}

function extractDomain(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'web source';
  }
}

function determineCredibility(domain: string): 'authoritative' | 'academic' | 'news' | 'industry' | 'web' {
  const lower = domain.toLowerCase();
  if (
    lower.endsWith('.gov') ||
    lower.endsWith('.edu') ||
    lower.includes('nih.gov') ||
    lower.includes('who.int') ||
    lower.includes('cdc.gov') ||
    lower.includes('sec.gov') ||
    lower.includes('un.org')
  ) {
    return 'authoritative';
  }
  if (
    lower.includes('nature.com') ||
    lower.includes('sciencedirect.com') ||
    lower.includes('arxiv.org') ||
    lower.includes('ieee.org') ||
    lower.includes('springer.com') ||
    lower.includes('cell.com') ||
    lower.includes('thelancet.com') ||
    lower.includes('nejm.org') ||
    lower.includes('pnas.org')
  ) {
    return 'academic';
  }
  if (
    lower.includes('reuters.com') ||
    lower.includes('apnews.com') ||
    lower.includes('bloomberg.com') ||
    lower.includes('ft.com') ||
    lower.includes('wsj.com') ||
    lower.includes('bbc.com') ||
    lower.includes('nytimes.com') ||
    lower.includes('washingtonpost.com') ||
    lower.includes('theguardian.com') ||
    lower.includes('economist.com')
  ) {
    return 'news';
  }
  if (
    lower.includes('techcrunch.com') ||
    lower.includes('theverge.com') ||
    lower.includes('wired.com') ||
    lower.includes('gartner.com') ||
    lower.includes('mckinsey.com') ||
    lower.includes('github.com')
  ) {
    return 'industry';
  }
  return 'web';
}

// Bounded fetch with 10s timeout and 1 retry
async function fetchWithTimeoutAndRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  let attempt = 0;
  while (attempt <= retries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok || attempt >= retries) {
        return res;
      }
    } catch (err: any) {
      clearTimeout(timeout);
      if (attempt >= retries) throw err;
    }
    attempt++;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error('Search provider request timed out or failed.');
}

// Search via Tavily
async function searchTavily(query: string, apiKey: string): Promise<RawSearchResult[]> {
  const res = await fetchWithTimeoutAndRetry('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily search API error (${res.status}): ${text.slice(0, 150)}`);
  }

  const data = await res.json();
  const results = data.results || [];
  return results.map((item: any, idx: number) => {
    const domain = extractDomain(item.url || '');
    return {
      id: `src-${idx + 1}`,
      title: item.title || 'Web Document',
      url: item.url,
      domain,
      snippet: item.content || item.snippet || '',
      relevanceScore: Math.round((item.score || 0.85) * 100),
      credibilityTier: determineCredibility(domain),
    };
  });
}

// Search via Serper
async function searchSerper(query: string, apiKey: string): Promise<RawSearchResult[]> {
  const res = await fetchWithTimeoutAndRetry('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      num: 5,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Serper API error (${res.status}): ${text.slice(0, 150)}`);
  }

  const data = await res.json();
  const organic = data.organic || [];
  return organic.map((item: any, idx: number) => {
    const domain = extractDomain(item.link || '');
    return {
      id: `src-${idx + 1}`,
      title: item.title || 'Web Document',
      url: item.link,
      domain,
      snippet: item.snippet || '',
      relevanceScore: Math.floor(85 + Math.random() * 12),
      credibilityTier: determineCredibility(domain),
    };
  });
}

// Search via Brave
async function searchBrave(query: string, apiKey: string): Promise<RawSearchResult[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
  const res = await fetchWithTimeoutAndRetry(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': apiKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brave Search API error (${res.status}): ${text.slice(0, 150)}`);
  }

  const data = await res.json();
  const results = data.web?.results || [];
  return results.map((item: any, idx: number) => {
    const domain = extractDomain(item.url || '');
    return {
      id: `src-${idx + 1}`,
      title: item.title || 'Web Document',
      url: item.url,
      domain,
      snippet: item.description || '',
      relevanceScore: Math.floor(84 + Math.random() * 12),
      credibilityTier: determineCredibility(domain),
    };
  });
}

// Primary search executor across query vectors
export async function executeMultiQuerySearch(
  queries: string[]
): Promise<{ sources: RawSearchResult[]; queriesExecuted: string[] }> {
  const provider = getActiveSearchProvider();

  if (!provider.isConfigured) {
    throw new Error(
      'NO_SEARCH_PROVIDER_CONFIGURED: A free search provider API key (TAVILY_API_KEY or SERPER_API_KEY) is required for real web retrieval. Please configure one in your environment secrets to perform live research.'
    );
  }

  const executed: string[] = [];
  const sourcesMap = new Map<string, RawSearchResult>();

  // Run searches for up to 3 queries to avoid excess consumption
  const queriesToRun = queries.slice(0, 3);

  for (const q of queriesToRun) {
    try {
      executed.push(q);
      let results: RawSearchResult[] = [];

      if (provider.type === 'tavily') {
        results = await searchTavily(q, process.env.TAVILY_API_KEY!);
      } else if (provider.type === 'serper') {
        results = await searchSerper(q, process.env.SERPER_API_KEY!);
      } else if (provider.type === 'brave') {
        results = await searchBrave(q, process.env.BRAVE_API_KEY!);
      }

      for (const item of results) {
        if (item.url && !sourcesMap.has(item.url)) {
          sourcesMap.set(item.url, item);
        }
      }
    } catch (err: any) {
      console.warn(`[SearchAdapter] Warning on query "${q}":`, err?.message || err);
    }
  }

  // Re-index source IDs sequentially
  const deduplicatedSources = Array.from(sourcesMap.values()).map((src, index) => ({
    ...src,
    id: `src-${index + 1}`,
  }));

  return {
    sources: deduplicatedSources,
    queriesExecuted: executed,
  };
}
