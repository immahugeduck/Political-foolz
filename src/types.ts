// src/types.ts
// Clean, complete types for Political-foolz (Builds 1, 2 & 4)

export interface Legislator {
  id: string;
  name: string;
  party: string;
  state: string;
  district?: string;
  chamber: 'House' | 'Senate';
  terms: any[];
  [key: string]: any;
}

export interface Bill {
  id: string;
  title: string;
  status: string;
  introducedDate: string;
  [key: string]: any;
}

export interface ConstituentNationalAlignment {
  overallScore: number;
  grade: string;
  subScores: {
    constituentServices: number;
    nationalSecurity: number;
    fiscalResponsibility: number;
    individualRights: number;
    economicOpportunity: number;
  };
  maverickBonus: number;
  highlightedDecisions: Array<{
    bill: string;
    vote: string;
    category: string;
    explanation: string;
    source?: string;
  }>;
  confidence: number;
  lastUpdated: string;
  methodologyVersion: string;
}

export interface DailyBrief {
  date: string;
  congressActions: string;
  whiteHouseUpdates: string;
  pentagon: string;
  personalizedLegislators: any[];
  zipContext?: string;
  generatedAt: string;
}

// --- Legislative data types (shapes mirror the server API response schemas) ---

export interface Accomplishment {
  id: string;
  title: string;
  category: string;
  outcome: string;
  date: string;
  synopsis: string;
  impact: string;
  tags?: string[];
  [key: string]: any;
}

export interface LegislativeSession {
  chamber: string;
  date: string;
  time?: string;
  topic: string;
  status: string;
  importance: string;
  details?: string;
  [key: string]: any;
}

export interface RollCallVote {
  billId: string;
  billTitle: string;
  rollCallNum?: string;
  votedChamber: string;
  date: string;
  question: string;
  result: string;
  yeas: number;
  nays: number;
  isHighlyDisputed?: boolean;
  partyBreakdown?: string;
  [key: string]: any;
}

export interface SearchedBill {
  id: string;
  title: string;
  sponsor?: string;
  dateIntroduced?: string;
  status: string;
  category?: string;
  oneLiner: string;
  [key: string]: any;
}

export interface StakeholderImpact {
  stakeholder?: string;
  impact?: string;
  pros?: string[];
  cons?: string[];
  evidence?: string;
  [key: string]: any;
}

export interface PredictedVote {
  legislatorId: string;
  legislatorName: string;
  prediction: string;
  confidence: number;
  reasoning: string;
  [key: string]: any;
}

export interface PendingBillSummary {
  billId: string;
  officialTitle: string;
  status: string;
  sponsorName?: string;
  sponsorPartyChamber?: string;
  oneLiner: string;
  plainSummary: string;
  keyProvisions: string[];
  pros: string[];
  cons: string[];
  financialImpact?: string;
  executiveSummary?: string;
  plainLanguageBreakdown?: string;
  technicalDeepDive?: string;
  prosConsStakeholderImpacts?: StakeholderImpact[];
  financialBudgetImplications?: string;
  historicalPoliticalContext?: string;
  supporterView?: string;
  opponentView?: string;
  neutralAnalysis?: string;
  confidenceScore?: number;
  uncertaintyNotes?: string;
  sources?: string[];
  followUpQuestions?: string[];
  localImpact?: string;
  keyVotesToWatch?: string[];
  [key: string]: any;
}

export interface UpcomingVoteAlert {
  id: string;
  billId: string;
  billTitle: string;
  billUrl?: string;
  scheduledTime: string;
  importance: string;
  plainSummary: string;
  executiveSummary?: string;
  technicalDeepDive?: string;
  financialBudgetImplications?: string;
  historicalPoliticalContext?: string;
  supporterView?: string;
  opponentView?: string;
  neutralAnalysis?: string;
  confidenceScore?: number;
  uncertaintyNotes?: string;
  sources?: string[];
  followUpQuestions?: string[];
  prosConsStakeholderImpacts?: StakeholderImpact[];
  predictedVotes: PredictedVote[];
  [key: string]: any;
}

export interface KeyIssueAlignment {
  issue?: string;
  alignmentRate: number;
  [key: string]: any;
}

export interface ChatMessage {
  role: string;
  content: string;
  [key: string]: any;
}

export interface LegislatorScorecard {
  id: string;
  name: string;
  party: string;
  state: string;
  committees: string[];
  keyIssueAlignment: KeyIssueAlignment[];
  votingHistory: Array<{ [key: string]: any }>;
  attendanceTrend: Array<{ rate: number; year: number | string; [key: string]: any }>;
  [key: string]: any;
}
