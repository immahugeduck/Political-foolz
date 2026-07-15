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

// Add any other existing types from your original file below this line if needed
