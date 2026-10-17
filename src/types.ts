export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  relevanceScore?: number;
  credibilityTier?: 'authoritative' | 'academic' | 'news' | 'industry' | 'web';
}

export type ClaimStatus = 'supported' | 'conflicting' | 'unknown';
export type ConfidenceLevel = 'High' | 'Moderate' | 'Low';

export interface ClaimVerification {
  id: string;
  claim: string;
  status: ClaimStatus;
  confidence: 'high' | 'moderate' | 'low';
  explanation: string;
  supportingSourceIds: string[];
  opposingSourceIds?: string[];
  consensusSummary?: string;
}

export interface KeyFinding {
  title: string;
  description: string;
  sourceIds: string[];
}

export interface ConflictingDebate {
  topic: string;
  perspectiveA: {
    stance: string;
    sourceIds: string[];
  };
  perspectiveB: {
    stance: string;
    sourceIds: string[];
  };
  nuance: string;
}

export interface ConfidenceAssessment {
  overallScore: number; // 0 - 100
  level: ConfidenceLevel;
  rationale: string;
  dataCompleteness: string;
  sourceDiversity: string;
}

export interface AgentLog {
  timestamp: string;
  stage: string;
  message: string;
}

export interface ResearchReport {
  id: string;
  topic: string;
  depth?: 'fast' | 'deep';
  timestamp: string;
  executiveSummary: string;
  subQuestions: string[];
  searchQueries: string[];
  sources: ResearchSource[];
  claims: ClaimVerification[];
  keyFindings: KeyFinding[];
  conflictingDebates: ConflictingDebate[];
  unknownsAndBlindspots: string[];
  confidenceAssessment: ConfidenceAssessment;
  limitations: string[];
  recommendedFollowUps: string[];
  searchProvider?: string;
  rawGroundedNarrative?: string;
  rawAgentLogs: AgentLog[];
}

export interface ReportSummary {
  id: string;
  topic: string;
  timestamp: string;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  sourceCount: number;
  claimCount: number;
  summarySnippet: string;
}

export type ResearchStage = 'idle' | 'decomposition' | 'retrieval' | 'verification' | 'synthesis' | 'complete' | 'error';

export interface ProgressState {
  stage: ResearchStage;
  percentage: number;
  title: string;
  description: string;
}

export interface HealthStatus {
  status: string;
  geminiConfigured: boolean;
  searchProvider: 'tavily' | 'serper' | 'brave' | 'none';
  searchConfigured: boolean;
  activeProviderName: string;
  supportedProviders: string[];
}
