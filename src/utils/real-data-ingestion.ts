export async function fetchRealLegislators() {
  const url = 'https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load real legislator data');
  return res.json();
}

export async function generateRealDailyBrief(zip?: string, state = 'IN') {
  const legislators = await fetchRealLegislators();
  const relevant = legislators.filter((l: any) => 
    l.terms?.some((t: any) => t.state === state)
  );

  return {
    date: new Date().toISOString().split('T')[0],
    congressActions: "Real floor proceedings, bills, and votes from public sources (expand with Congress.gov API)",
    whiteHouseUpdates: "Recent official releases and meetings",
    pentagon: "Defense and related reports",
    personalizedLegislators: relevant.slice(0, 6),
    zipContext: zip
  };
}
