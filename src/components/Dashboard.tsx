import React, { useState, useEffect } from "react";
import { 
  Landmark, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  BookmarkCheck, 
  Zap, 
  RefreshCw, 
  Star, 
  Users, 
  Trophy, 
  MapPin, 
  Search, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Globe, 
  Flame, 
  AlertCircle,
  Clock,
  ShieldAlert
} from "lucide-react";
import { Accomplishment, LegislatorScorecard } from "../types";

interface DashboardProps {
  accomplishments: Accomplishment[];
  onSelectBill: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  watchlist: string[];
  toggleWatchlist: (id: string) => void;
  followedLegislators: string[];
  toggleFollowLegislator: (id: string) => void;
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};

const MEDIA_STATES = [
  { code: "TX", reason: "Border policies, Energy independence, and Infrastructure grids" },
  { code: "FL", reason: "Homeowners insurance regulation, Climate readiness, and Consumer affairs" },
  { code: "GA", reason: "Voting accessibility, Municipal development grants, and Agricultural support" },
  { code: "MI", reason: "Automotive innovation, Great Lakes clean energy subsidies, and Union protections" },
  { code: "PA", reason: "Shale natural gas regulations, Manufacturing tech corridors, and Bridge restoration" }
];

const STANDING_COMMITTEES = [
  { 
    id: "senate-foreign", 
    name: "Senate Committee on Foreign Relations", 
    chamber: "Senate", 
    desc: "Oversees foreign policy, treaty reviews, state department ambassadors, and foreign aid programs.",
    tags: ["Foreign Policy", "Defense Agreements"]
  },
  { 
    id: "senate-finance", 
    name: "Senate Committee on Finance", 
    chamber: "Senate", 
    desc: "Governs taxation, customs, trade tariffs, Medicare/Medicaid oversight, and the Social Security safety net.",
    tags: ["Taxation", "Trade Tariffs"]
  },
  { 
    id: "house-appropriations", 
    name: "House Committee on Appropriations", 
    chamber: "House", 
    desc: "Responsible for writing legislation that allocates federal funds to agencies and emergency spending directives.",
    tags: ["Discretionary Spending", "Budget Allocations"]
  },
  { 
    id: "house-judiciary", 
    name: "House Committee on the Judiciary", 
    chamber: "House", 
    desc: "Covers constitutional questions, federal court nominations, anti-trust laws, and civil liberties statutes.",
    tags: ["Constitutional Law", "Court Oversight"]
  },
  { 
    id: "senate-armed", 
    name: "Senate Committee on Armed Services", 
    chamber: "Senate", 
    desc: "Handles defense budget authorizations, strategic deterrence, and military equipment operations.",
    tags: ["National Defense", "Military Briefs"]
  },
  { 
    id: "house-commerce", 
    name: "House Committee on Energy and Commerce", 
    chamber: "House", 
    desc: "One of the broadest jurisdictions: telecom, public health programs, food/drug safety, and energy projects.",
    tags: ["Consumer Protections", "Public Health"]
  }
];

export default function Dashboard({
  accomplishments,
  onSelectBill,
  onRefresh,
  isLoading,
  watchlist,
  toggleWatchlist,
  followedLegislators = [],
  toggleFollowLegislator
}: DashboardProps) {
  const [legislators, setLegislators] = useState<LegislatorScorecard[]>([]);
  const [loadingLegs, setLoadingLegs] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"jurisdiction" | "federal" | "directory">("jurisdiction");

  const [selectedLocalState, setSelectedLocalState] = useState<string>(() => {
    return localStorage.getItem("capitol_user_local_state") || "NY";
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState<"ALL" | "House" | "Senate">("ALL");
  const [partyFilter, setPartyFilter] = useState<"ALL" | "D" | "R">("ALL");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [directoryPage, setDirectoryPage] = useState<number>(1);
  const itemsPerPage = 12;

  const [expandedLegVotes, setExpandedLegVotes] = useState<Record<string, boolean>>({});
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);

  useEffect(() => {
    async function loadLegislators() {
      try {
        setLoadingLegs(true);
        const resp = await fetch("/api/legislation/legislators");
        const resJson = await resp.json();
        setLegislators(resJson.data || []);
      } catch (err) {
        console.error("Failed to load legislators in dashboard widget:", err);
      } finally {
        setLoadingLegs(false);
      }
    }
    loadLegislators();
  }, []);

  const handleStateChange = (stateCode: string) => {
    setSelectedLocalState(stateCode);
    localStorage.setItem("capitol_user_local_state", stateCode);
  };

  const toggleExpandVotes = (legId: string) => {
    setExpandedLegVotes(prev => ({ ...prev, [legId]: !prev[legId] }));
  };

  const localRepresentatives = legislators.filter(l => l.state === selectedLocalState);
  
  const filteredLegislators = legislators.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChamber = chamberFilter === "ALL" || l.chamber === chamberFilter;
    const matchesParty = partyFilter === "ALL" || l.party === partyFilter;
    const matchesState = stateFilter === "ALL" || l.state === stateFilter;
    return matchesSearch && matchesChamber && matchesParty && matchesState;
  });

  const totalPages = Math.ceil(filteredLegislators.length / itemsPerPage);
  const paginatedLegislators = filteredLegislators.slice(
    (directoryPage - 1) * itemsPerPage,
    directoryPage * itemsPerPage
  );

  useEffect(() => { setDirectoryPage(1); }, [searchTerm, chamberFilter, partyFilter, stateFilter]);

  const committeeMembers = selectedCommittee 
    ? legislators.filter(l => l.committees?.includes(selectedCommittee))
    : [];

  const getFullStateName = (code: string) => STATE_NAMES[code] || `State of ${code}`;

  /* ---- Newspaper Section Header ---- */
  const SectionHeader = ({ icon: Icon, title, subtitle, action }: { icon: any; title: string; subtitle?: string; action?: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-4 pb-3 mb-4 border-b-2 border-double border-[--color-ink]">
      <div>
        <div className="np-kicker flex items-center gap-1.5 mb-1">
          <Icon className="h-3 w-3" />
          {title}
        </div>
        {subtitle && <p className="text-xs font-body text-[--color-ink-muted] leading-snug">{subtitle}</p>}
      </div>
      {action}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ============================================================
          FRONT PAGE HEADER — EDITION STATS + STATE SELECTOR
          ============================================================ */}
      <div className="border border-[--color-rule-dark] bg-[--color-column-bg] overflow-hidden">
        {/* Masthead-style top band */}
        <div className="bg-[--color-ink] text-[--color-paper] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="np-kicker text-[--color-headline-gold] mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Demystifying the 119th Congress
            </div>
            <h2 className="text-xl sm:text-2xl font-headline font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Your Personalized Legislative HQ
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-[--color-ink-faint] flex-shrink-0">
            <div className="text-center border-r border-[--color-rule-dark]/40 pr-4">
              <div className="text-white font-bold text-lg font-headline">{legislators.length || "—"}</div>
              <div className="uppercase tracking-wider">Members</div>
            </div>
            <div className="text-center border-r border-[--color-rule-dark]/40 pr-4">
              <div className="text-white font-bold text-lg font-headline">{accomplishments.length || "—"}</div>
              <div className="uppercase tracking-wider">Acts</div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-lg font-headline">119th</div>
              <div className="uppercase tracking-wider">Session</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <p className="text-sm font-body text-[--color-ink-secondary] leading-relaxed">
                Track live congressional accomplishments, monitor roll call voting breakdowns, examine upcoming debates, and search full legislator scorecard rosters.
              </p>

              {/* Congressional Status */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-[--color-rule] bg-[--color-paper] p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-[--color-ink] text-[--color-headline-gold]">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="np-kicker text-[--color-ink-muted]">House of Representatives</div>
                    <div className="text-xs font-body font-bold text-[--color-ink] flex items-center gap-1.5 mt-0.5">
                      In recess (Resumes June 23)
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="border border-[--color-rule] bg-[--color-paper] p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-[--color-headline-blue] text-white">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="np-kicker text-[--color-ink-muted]">United States Senate</div>
                    <div className="text-xs font-body font-bold text-[--color-ink] flex items-center gap-1.5 mt-0.5">
                      Active Floor debates (119th)
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jurisdiction Selector */}
            <div className="border border-[--color-rule-dark] bg-[--color-paper] p-4 md:w-72 flex-shrink-0 space-y-3">
              <div className="flex items-center gap-2 text-[--color-headline]">
                <MapPin className="h-4 w-4" />
                <span className="np-kicker">My Local Jurisdiction</span>
              </div>
              <div className="space-y-1">
                <label htmlFor="local-state-select" className="text-[10px] text-[--color-ink-muted] block font-sans font-medium">
                  Set home state to filter representation:
                </label>
                <select
                  id="local-state-select"
                  value={selectedLocalState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-[--color-column-bg] text-[--color-ink] border border-[--color-rule-dark] focus:border-[--color-ink] py-2 px-3 text-xs font-sans font-semibold focus:outline-none transition-colors"
                >
                  {Object.entries(STATE_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>{name} ({code})</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-[--color-ink-faint] font-body italic">
                Displaying alerts, scores, and briefs tailored for {getFullStateName(selectedLocalState)}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SUB-NAVIGATION — NEWSPAPER SECTION TABS
          ============================================================ */}
      <div className="border-b border-[--color-rule-dark] flex gap-0">
        {[
          { id: "jurisdiction", label: `My State: ${selectedLocalState}`, icon: MapPin },
          { id: "federal", label: "Federal & Committees", icon: Landmark },
          { id: "directory", label: `Directory (${legislators.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id as any;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border-b-2 -mb-px ${
                isActive
                  ? "border-[--color-ink] text-[--color-ink] bg-[--color-column-bg]"
                  : "border-transparent text-[--color-ink-muted] hover:text-[--color-ink] hover:border-[--color-rule-dark]"
              }`}
              style={{ letterSpacing: '0.07em' }}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ============================================================
          TAB 1: LOCAL JURISDICTION (STATE LEVEL)
          ============================================================ */}
      {activeSubTab === "jurisdiction" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Representatives Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-[--color-rule] bg-[--color-column-bg] p-5">
              <SectionHeader
                icon={MapPin}
                title={`Representatives of ${getFullStateName(selectedLocalState)}`}
                subtitle="Current public officials representing your state in Washington D.C."
                action={
                  <div className="text-[10px] font-mono font-bold bg-[--color-paper-dark] text-[--color-ink-secondary] px-2.5 py-1 border border-[--color-rule] flex-shrink-0">
                    {localRepresentatives.length} Members
                  </div>
                }
              />

              {loadingLegs ? (
                <div className="py-20 text-center text-[--color-ink-muted] flex flex-col items-center gap-2">
                  <RefreshCw className="h-7 w-7 text-[--color-headline-gold] animate-spin" />
                  <span className="text-sm font-body italic">Parsing state profiles...</span>
                </div>
              ) : localRepresentatives.length === 0 ? (
                <div className="py-14 text-center border-2 border-dashed border-[--color-rule] space-y-2 text-[--color-ink-muted]">
                  <AlertCircle className="h-9 w-9 text-[--color-rule-dark] mx-auto" />
                  <p className="text-sm font-body font-bold">No listed members from {selectedLocalState} in our repository.</p>
                  <p className="text-xs text-[--color-ink-faint] max-w-sm mx-auto">Try switching to CA, NY, TX, or FL to view the database.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {localRepresentatives.map((leg) => {
                    const isFollowed = followedLegislators.includes(leg.id);
                    const isExpanded = expandedLegVotes[leg.id] || false;
                    return (
                      <div key={leg.id} className="bg-[--color-paper] border border-[--color-rule] p-4 flex flex-col justify-between hover:border-[--color-rule-dark] transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            {leg.imageUrl ? (
                              <img
                                src={leg.imageUrl}
                                alt={leg.name}
                                referrerPolicy="no-referrer"
                                className="h-11 w-11 object-cover border border-[--color-rule] bg-[--color-paper-dark]"
                              />
                            ) : (
                              <div className="h-11 w-11 bg-[--color-paper-dark] text-[--color-ink-muted] flex items-center justify-center font-headline font-bold text-sm border border-[--color-rule]">
                                {leg.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h3 className="text-xs font-headline font-bold text-[--color-ink] truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{leg.name}</h3>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase flex-shrink-0 border ${
                                  leg.party === "D" 
                                    ? "bg-blue-50 text-blue-800 border-blue-200" 
                                    : leg.party === "R" 
                                      ? "bg-red-50 text-red-800 border-red-200" 
                                      : "bg-[--color-paper-dark] text-[--color-ink-secondary] border-[--color-rule]"
                                }`}>
                                  {leg.party}-{leg.state}
                                </span>
                              </div>
                              <p className="text-[11px] font-sans font-semibold text-[--color-ink-muted] mt-0.5">
                                {leg.chamber} · Attendance: <span className="text-[--color-ink]">{leg.attendanceRate}%</span>
                              </p>
                              {leg.libertyProsperityIndex && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className="np-kicker text-[--color-ink-muted]">Liberty Grade:</span>
                                  <span className="text-[9.5px] font-mono font-black text-[--color-headline] bg-[--color-headline]/10 border border-[--color-headline]/25 px-1.5 py-0.5">
                                    {leg.libertyProsperityIndex.grade}
                                  </span>
                                  <span className="text-[9.5px] font-mono text-[--color-ink-muted]">
                                    ({leg.libertyProsperityIndex.overallScore}/100)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {leg.committees && leg.committees.length > 0 && (
                            <div className="space-y-1">
                              <span className="np-kicker text-[--color-ink-faint]">Committees:</span>
                              <div className="flex flex-wrap gap-1">
                                {leg.committees.map((com, idx) => (
                                  <span key={idx} className="bg-[--color-column-bg] border border-[--color-rule] text-[9px] text-[--color-ink-secondary] px-2 py-0.5 font-sans leading-tight">
                                    {com.replace("Committee on ", "").replace("Senate ", "").replace("House ", "")}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-[--color-rule]">
                            <button
                              onClick={() => toggleExpandVotes(leg.id)}
                              className="w-full flex items-center justify-between text-[10px] font-sans font-semibold text-[--color-ink-muted] hover:text-[--color-ink] transition-colors py-1 focus:outline-none"
                            >
                              <span>{isExpanded ? "Hide Recent Voting Record" : "View Recent Voting Record"}</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 space-y-2 bg-[--color-column-bg] p-2.5 border border-[--color-rule] animate-fade-in text-[10px] leading-relaxed">
                                {leg.votingHistory && leg.votingHistory.length > 0 ? (
                                  leg.votingHistory.map((v, vidx) => (
                                    <div key={vidx} className="border-b border-[--color-rule] last:border-0 pb-1.5 last:pb-0 pt-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-[--color-headline-gold]">{v.billId}</span>
                                        <span className={`font-mono font-bold px-1.5 py-0.5 text-[9px] ${
                                          v.vote === "Yea" 
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                            : "bg-red-50 text-red-800 border border-red-200"
                                        }`}>
                                          {v.vote}
                                        </span>
                                      </div>
                                      <p className="font-body font-bold text-[--color-ink] line-clamp-1 mt-0.5">{v.billTitle}</p>
                                      <p className="text-[--color-ink-muted] text-[9.5px] italic mt-0.5">{v.impact}</p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-[--color-ink-faint] py-1 text-center italic">No votes logged in this timeline.</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[--color-rule] flex items-center justify-between text-[10px]">
                          <span className="text-[--color-ink-faint] font-mono">ID: {leg.id}</span>
                          <button
                            onClick={() => toggleFollowLegislator(leg.id)}
                            className={`px-3 py-1 font-sans font-semibold transition-all cursor-pointer text-xs border ${
                              isFollowed
                                ? "bg-[--color-headline-gold] border-[--color-headline-gold] text-white hover:bg-[--color-headline] hover:border-[--color-headline]"
                                : "bg-[--color-column-bg] border-[--color-rule] text-[--color-ink-secondary] hover:border-[--color-ink]"
                            }`}
                          >
                            {isFollowed ? "Drafted to Squad" : "Draft to My Team"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Battleground States */}
            <div className="border border-[--color-rule] bg-[--color-column-bg] p-5 space-y-4">
              <SectionHeader
                icon={Flame}
                title="National Battlegrounds"
                subtitle="States gaining heavy media attention."
              />
              <div className="space-y-2">
                {MEDIA_STATES.map((state) => (
                  <div 
                    key={state.code}
                    className="p-3 bg-[--color-paper] border border-[--color-rule] hover:border-[--color-rule-dark] transition-colors group flex items-start gap-3 cursor-pointer"
                    onClick={() => handleStateChange(state.code)}
                  >
                    <div className="h-7 w-7 bg-[--color-ink] text-[--color-paper] font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-[--color-headline] transition-colors">
                      {state.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-headline font-bold text-[--color-ink] group-hover:text-[--color-headline] cursor-pointer" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {getFullStateName(state.code)}
                      </span>
                      <p className="text-[10px] text-[--color-ink-muted] leading-tight mt-0.5 font-body">{state.reason}</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-[--color-ink-faint] group-hover:translate-x-0.5 transition-transform flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Civics Insight Box */}
            <div className="border-l-4 border-[--color-headline-gold] bg-[--color-column-bg] border border-[--color-rule] p-4 space-y-2">
              <span className="np-kicker text-[--color-headline-gold] flex items-center gap-1.5">
                <Zap className="h-3 w-3" /> Civics Insight
              </span>
              <p className="text-[11px] font-body text-[--color-ink-secondary] leading-relaxed">
                By focusing only on representatives from your state (<strong>{selectedLocalState}</strong>), you get immediate visibility into local legislative priorities. Use the <strong>Directory</strong> tab to research other states.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: FEDERAL GOVERNMENT & COMMITTEES
          ============================================================ */}
      {activeSubTab === "federal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Accomplishments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-[--color-rule] bg-[--color-column-bg] p-5">
              <SectionHeader
                icon={BookmarkCheck}
                title="Federal Recent Bills & Accomplishments"
                subtitle="Real-world results, approved codes, and plain-language impact breakdowns."
                action={
                  <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-[--color-ink] hover:bg-[--color-headline] disabled:opacity-50 text-[--color-paper] text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    {isLoading ? "Syncing..." : "Sync Live Data"}
                  </button>
                }
              />

              <div className="space-y-4">
                {accomplishments.length === 0 ? (
                  <div className="py-12 text-center text-[--color-ink-faint] text-xs font-body italic">
                    No recent activities returned. Try pressing &apos;Sync Live Data&apos;.
                  </div>
                ) : (
                  accomplishments.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="bg-[--color-paper] border border-[--color-rule] hover:border-[--color-rule-dark] p-4 transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="text-[10px] font-mono font-bold text-[--color-headline-gold] bg-[--color-headline-gold]/10 px-2 py-0.5 border border-[--color-headline-gold]/25">
                          {item.id}
                        </span>
                        <span className="text-[9.5px] font-mono bg-[--color-paper-dark] text-[--color-ink-secondary] px-1.5 py-0.5 border border-[--color-rule] font-semibold">
                          {item.category}
                        </span>
                        <span className="text-[9.5px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 border border-emerald-200 font-bold">
                          {item.outcome}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-headline font-bold text-[--color-ink] hover:text-[--color-headline] cursor-pointer leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }} onClick={() => onSelectBill(item.id)}>
                        {item.title}
                      </h3>
                      
                      <p className="text-xs font-body text-[--color-ink-muted] line-clamp-2 mt-1.5">
                        {item.synopsis}
                      </p>

                      <div className="mt-2 bg-[--color-column-bg] p-2.5 border-l-2 border-[--color-headline-gold] text-[10.5px] font-body text-[--color-ink-secondary] leading-normal">
                        <span className="font-bold text-[--color-ink] text-[11px] block mb-0.5">Impact:</span>
                        {item.impact}
                      </div>

                      <div className="mt-3 pt-3 border-t border-[--color-rule] flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleWatchlist(item.id)}
                          className={`p-1.5 border cursor-pointer transition-all ${
                            watchlist.includes(item.id)
                              ? "bg-[--color-headline-gold]/10 border-[--color-headline-gold]/40 text-[--color-headline-gold]"
                              : "bg-[--color-column-bg] border-[--color-rule] text-[--color-ink-faint] hover:text-[--color-ink-secondary]"
                          }`}
                          title="Bookmark Bill"
                        >
                          <Star className={`h-4 w-4 ${watchlist.includes(item.id) ? "fill-[--color-headline-gold]" : ""}`} />
                        </button>
                        <button
                          onClick={() => onSelectBill(item.id)}
                          className="px-3 py-1.5 bg-[--color-ink] text-[10.5px] font-sans font-semibold text-[--color-paper] hover:bg-[--color-headline] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          Read Summary
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Federal Committees Sidebar */}
          <div className="space-y-5">
            <div className="border border-[--color-rule] bg-[--color-column-bg] p-5 space-y-4">
              <SectionHeader
                icon={Layers}
                title="Key Standing Committees"
                subtitle="Federal panels where bills are edited before floor debate."
              />
              <div className="space-y-2">
                {STANDING_COMMITTEES.map((com) => {
                  const isSelected = selectedCommittee === com.name;
                  return (
                    <div 
                      key={com.id}
                      onClick={() => setSelectedCommittee(isSelected ? null : com.name)}
                      className={`p-3 border transition-all cursor-pointer text-left space-y-1.5 ${
                        isSelected 
                          ? "bg-[--color-ink] text-[--color-paper] border-[--color-ink]" 
                          : "bg-[--color-paper] hover:bg-[--color-paper-dark] text-[--color-ink] border-[--color-rule]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`np-kicker ${isSelected ? "text-[--color-headline-gold]" : "text-[--color-ink-muted]"}`}>
                          {com.chamber}
                        </span>
                        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "rotate-90 text-[--color-headline-gold]" : "text-[--color-ink-faint]"}`} />
                      </div>
                      <h4 className="text-xs font-headline font-bold leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{com.name}</h4>
                      <p className={`text-[10.5px] font-body leading-relaxed ${isSelected ? "text-[--color-ink-faint]" : "text-[--color-ink-muted]"}`}>
                        {com.desc}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {com.tags.map((tag, t_idx) => (
                          <span 
                            key={t_idx} 
                            className={`text-[9px] px-1.5 py-0.5 font-mono border ${
                              isSelected ? "bg-white/10 text-[--color-ink-faint] border-white/20" : "bg-[--color-column-bg] text-[--color-ink-muted] border-[--color-rule]"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Committee Members */}
            {selectedCommittee && (
              <div className="bg-[--color-ink] text-[--color-paper] border border-[--color-rule-dark] p-5 space-y-3 animate-fade-in">
                <div className="border-b border-[--color-rule-dark]/40 pb-2.5">
                  <div className="np-kicker text-[--color-headline-gold]">Committee Assignment</div>
                  <p className="text-xs font-headline font-bold text-white line-clamp-1 mt-0.5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{selectedCommittee}</p>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {committeeMembers.length === 0 ? (
                    <div className="text-[10px] text-[--color-ink-faint] italic text-center py-4">
                      No members of this committee in your local cached list.
                    </div>
                  ) : (
                    committeeMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-xs p-2 bg-white/5 border border-white/10">
                        <div>
                          <span className="font-bold text-white block">{member.name}</span>
                          <span className="text-[9px] text-[--color-ink-faint] font-mono uppercase">{member.party}-{member.state} | {member.chamber}</span>
                        </div>
                        <button
                          onClick={() => toggleFollowLegislator(member.id)}
                          className={`text-[8.5px] font-sans font-bold px-2 py-0.5 border cursor-pointer transition-colors ${
                            followedLegislators.includes(member.id)
                              ? "bg-[--color-headline-gold] text-[--color-ink] border-[--color-headline-gold]"
                              : "bg-white/10 text-[--color-ink-faint] border-white/20 hover:bg-white/20"
                          }`}
                        >
                          {followedLegislators.includes(member.id) ? "Drafted" : "Draft"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: POLITICIANS DIRECTORY
          ============================================================ */}
      {activeSubTab === "directory" && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="border border-[--color-rule] bg-[--color-column-bg] p-5 space-y-4">
            <SectionHeader
              icon={Users}
              title="Roster Filter System"
              subtitle="Query and research active members of both chambers."
              action={
                <div className="text-[10px] font-mono font-bold bg-[--color-paper-dark] text-[--color-ink-secondary] px-3 py-1 border border-[--color-rule]">
                  {filteredLegislators.length} / {legislators.length} members
                </div>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[--color-ink-faint]" />
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[--color-paper] border border-[--color-rule] py-2 pl-9 pr-4 text-xs font-sans font-medium focus:outline-none focus:border-[--color-ink] transition-colors text-[--color-ink]"
                />
              </div>

              <select
                value={chamberFilter}
                onChange={(e) => setChamberFilter(e.target.value as any)}
                className="w-full bg-[--color-paper] border border-[--color-rule] py-2 px-3 text-xs font-sans font-semibold focus:outline-none focus:border-[--color-ink] transition-colors text-[--color-ink]"
              >
                <option value="ALL">All Chambers</option>
                <option value="House">House of Representatives</option>
                <option value="Senate">United States Senate</option>
              </select>

              <select
                value={partyFilter}
                onChange={(e) => setPartyFilter(e.target.value as any)}
                className="w-full bg-[--color-paper] border border-[--color-rule] py-2 px-3 text-xs font-sans font-semibold focus:outline-none focus:border-[--color-ink] transition-colors text-[--color-ink]"
              >
                <option value="ALL">All Parties</option>
                <option value="D">Democrats (D)</option>
                <option value="R">Republicans (R)</option>
              </select>

              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full bg-[--color-paper] border border-[--color-rule] py-2 px-3 text-xs font-sans font-semibold focus:outline-none focus:border-[--color-ink] transition-colors text-[--color-ink]"
              >
                <option value="ALL">All States</option>
                {Object.entries(STATE_NAMES).map(([code, name]) => (
                  <option key={code} value={code}>{code} – {name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loadingLegs ? (
            <div className="py-24 text-center text-[--color-ink-muted] flex flex-col items-center gap-3">
              <RefreshCw className="h-10 w-10 text-[--color-headline-gold] animate-spin" />
              <span className="text-sm font-body italic">Loading scoring models...</span>
            </div>
          ) : paginatedLegislators.length === 0 ? (
            <div className="border border-[--color-rule] bg-[--color-column-bg] py-16 text-center text-[--color-ink-muted] space-y-2">
              <AlertCircle className="h-10 w-10 text-[--color-rule-dark] mx-auto" />
              <p className="text-sm font-body font-bold">No matching politicians found.</p>
              <p className="text-xs text-[--color-ink-faint]">Clear your filters or search parameters.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedLegislators.map((leg) => {
                  const isFollowed = followedLegislators.includes(leg.id);
                  const isExpanded = expandedLegVotes[leg.id] || false;
                  return (
                    <div 
                      key={leg.id}
                      className="bg-[--color-column-bg] border border-[--color-rule] hover:border-[--color-rule-dark] p-4 flex flex-col justify-between transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {leg.imageUrl ? (
                            <img
                              src={leg.imageUrl}
                              alt={leg.name}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 object-cover border border-[--color-rule] bg-[--color-paper-dark]"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-[--color-paper-dark] text-[--color-ink-muted] flex items-center justify-center font-headline font-bold text-sm border border-[--color-rule]">
                              {leg.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-headline font-bold text-[--color-ink] hover:text-[--color-headline] transition-colors truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{leg.name}</h4>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase flex-shrink-0 border ${
                                leg.party === "D" 
                                  ? "bg-blue-50 text-blue-800 border-blue-200" 
                                  : leg.party === "R" 
                                    ? "bg-red-50 text-red-800 border-red-200" 
                                    : "bg-[--color-paper-dark] text-[--color-ink-secondary] border-[--color-rule]"
                              }`}>
                                {leg.party}-{leg.state}
                              </span>
                            </div>
                            <p className="text-[10.5px] font-sans font-semibold text-[--color-ink-muted] mt-0.5">
                              {leg.chamber} · {getFullStateName(leg.state)}
                            </p>
                            <p className="text-[10px] font-sans text-[--color-ink-muted] mt-0.5">
                              Attendance: <span className="text-[--color-ink] font-bold">{leg.attendanceRate}%</span>
                              {leg.libertyProsperityIndex && (
                                <span className="ml-2">Grade: <span className="font-black text-[--color-headline] font-mono">{leg.libertyProsperityIndex.grade}</span></span>
                              )}
                            </p>
                          </div>
                        </div>

                        {leg.committees && leg.committees.length > 0 && (
                          <div className="space-y-1">
                            <span className="np-kicker text-[--color-ink-faint]">Committees:</span>
                            <div className="flex flex-wrap gap-1">
                              {leg.committees.map((com, idx) => (
                                <span key={idx} className="bg-[--color-paper] border border-[--color-rule] text-[9px] text-[--color-ink-secondary] px-2 py-0.5 font-sans leading-tight">
                                  {com.replace("Committee on ", "").replace("Senate ", "").replace("House ", "")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-[--color-rule]">
                          <button
                            onClick={() => toggleExpandVotes(leg.id)}
                            className="w-full flex items-center justify-between text-[10px] font-sans font-semibold text-[--color-ink-muted] hover:text-[--color-ink] transition-colors py-1 focus:outline-none"
                          >
                            <span>{isExpanded ? "Hide Voting History" : "Reveal Voting History"}</span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-2 bg-[--color-paper] p-2.5 border border-[--color-rule] animate-fade-in text-[10px] leading-relaxed">
                              {leg.votingHistory && leg.votingHistory.length > 0 ? (
                                leg.votingHistory.map((v, vidx) => (
                                  <div key={vidx} className="border-b border-[--color-rule] last:border-0 pb-1.5 last:pb-0 pt-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-mono font-bold text-[--color-headline-gold]">{v.billId}</span>
                                      <span className={`font-mono font-bold px-1.5 py-0.5 text-[9px] ${
                                        v.vote === "Yea" 
                                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                          : "bg-red-50 text-red-800 border border-red-200"
                                      }`}>{v.vote}</span>
                                    </div>
                                    <div className="font-body font-bold text-[--color-ink] line-clamp-1 mt-0.5">{v.billTitle}</div>
                                    <p className="text-[--color-ink-muted] text-[9px] italic mt-0.5">{v.impact}</p>
                                    <div className="np-kicker text-[--color-ink-faint] mt-1">{v.date}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-[--color-ink-faint] py-1 text-center italic">No votes compiled.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[--color-rule] flex items-center justify-between text-[10.5px]">
                        <span className="text-[--color-ink-faint] font-mono text-[9px]">Bioguide: {leg.id}</span>
                        <button
                          onClick={() => toggleFollowLegislator(leg.id)}
                          className={`px-3 py-1 font-sans font-bold transition-all cursor-pointer text-xs border ${
                            isFollowed
                              ? "bg-[--color-headline-gold] text-white border-[--color-headline-gold] hover:bg-[--color-headline] hover:border-[--color-headline]"
                              : "bg-[--color-column-bg] border-[--color-rule] text-[--color-ink-secondary] hover:border-[--color-ink]"
                          }`}
                        >
                          {isFollowed ? "In Squad" : "Draft Politician"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-[--color-rule]">
                  <button
                    onClick={() => setDirectoryPage(p => Math.max(1, p - 1))}
                    disabled={directoryPage === 1}
                    className="px-4 py-2 bg-[--color-column-bg] border border-[--color-rule] text-xs font-sans font-semibold hover:border-[--color-ink] disabled:opacity-40 transition-colors cursor-pointer text-[--color-ink]"
                  >
                    ← Previous
                  </button>
                  <span className="text-xs font-mono font-bold text-[--color-ink-secondary]">
                    Page {directoryPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setDirectoryPage(p => Math.min(totalPages, p + 1))}
                    disabled={directoryPage === totalPages}
                    className="px-4 py-2 bg-[--color-column-bg] border border-[--color-rule] text-xs font-sans font-semibold hover:border-[--color-ink] disabled:opacity-40 transition-colors cursor-pointer text-[--color-ink]"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
