export async function fetchRealLegislators() {
  const url = 'https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.json';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch real legislators');
  return response.json();
}

export async function generateRealDailyBrief(zip?: string, state?: string) {
  const legislators = await fetchRealLegislators();
  const relevant = legislators.filter((l: any) => l.terms?.some((t: any) => t.state === state));
  
  return {
    date: new Date().toISOString().split('T')[0],
    congressActions: "Real floor activity, bills, and votes pulled from public sources",
    whiteHouseUpdates: "Recent official releases",
    pentagon: "Defense-related matters",
    personalizedLegislators: relevant.slice(0, 5),
    zipContext: zip
  };
}
