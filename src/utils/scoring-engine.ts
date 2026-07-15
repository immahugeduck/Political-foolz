export function computeConstituentNationalAlignment(votingHistory: any[] = []) {
  const overall = Math.min(100, 65 + Math.floor(votingHistory.length / 3)); // Will be enhanced with real vote analysis
  
  return {
    overallScore: overall,
    grade: overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : 'D',
    subScores: {
      constituentServices: 78,
      nationalSecurity: 82,
      fiscalResponsibility: 68,
      individualRights: 75,
      economicOpportunity: 71
    },
    maverickBonus: 6,
    highlightedDecisions: [
      {
        bill: "NDAA / Defense Funding",
        vote: "+1",
        explanation: "Supported measures strengthening national security and troop readiness"
      }
    ],
    confidence: 75,
    lastUpdated: new Date().toISOString()
  };
}
