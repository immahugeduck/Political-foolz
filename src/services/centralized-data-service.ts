/**
 * Centralized Data Service
 * Single source of truth for all real legislative data.
 * Sources: unitedstates/congress GitHub datasets + Congress.gov API (when key available)
 * NO simulated or mock data.
 */

import { cache } from './cache-layer';

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

const CONGRESS_LEGISLATORS_URL = 'https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.json';

/**
 * Fetch current legislators (real data from unitedstates/congress)
 */
export async function fetchRealLegislators(): Promise<Legislator[]> {
  const cacheKey = 'legislators-current';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(CONGRESS_LEGISLATORS_URL);
    if (!response.ok) throw new Error(`Failed to fetch legislators: ${response.status}`);
    
    const data: any[] = await response.json();
    
    const normalized: Legislator[] = data.map((leg: any) => ({
      id: leg.id?.bioguide || leg.id?.govtrack || leg.name,
      name: `${leg.name?.first || ''} ${leg.name?.last || ''}`.trim(),
      party: leg.terms?.[leg.terms.length - 1]?.party || 'Unknown',
      state: leg.terms?.[leg.terms.length - 1]?.state || 'Unknown',
      district: leg.terms?.[leg.terms.length - 1]?.district,
      chamber: leg.terms?.[leg.terms.length - 1]?.type === 'sen' ? 'Senate' : 'House',
      terms: leg.terms || [],
      raw: leg
    }));

    cache.set(cacheKey, normalized, 3600); // 1 hour TTL
    return normalized;
  } catch (error) {
    console.error('Error fetching real legislators:', error);
    throw error;
  }
}

/**
 * Get legislators filtered by state (for personalization)
 */
export async function getLegislatorsByState(state: string): Promise<Legislator[]> {
  const all = await fetchRealLegislators();
  return all.filter(l => l.state.toUpperCase() === state.toUpperCase());
}

/**
 * Placeholder ready for expansion (bills, votes, etc.)
 */
export async function fetchRecentBills(limit: number = 20): Promise<Bill[]> {
  console.warn('fetchRecentBills: Ready to wire real data from Congress.gov or unitedstates/congress datasets.');
  return [];
}
