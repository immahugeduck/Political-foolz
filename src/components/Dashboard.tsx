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

// National Media Focus Battleground States
const MEDIA_STATES = [
  { code: "TX", reason: "Border policies, Energy independence, and Infrastructure grids" },
  { code: "FL", reason: "Homeowners insurance regulation, Climate readiness, and Consumer affairs" },
  { code: "GA", reason: "Voting accessibility, Municipal development grants, and Agricultural support" },
  { code: "MI", reason: "Automotive innovation, Great Lakes clean energy subsidies, and Union protections" },
  { code: "PA", reason: "Shale natural gas regulations, Manufacturing tech corridors, and Bridge restoration" }
];

// Key Standing Committees of Congress
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

  // State selection
  const [selectedLocalState, setSelectedLocalState] = useState<string>(() => {
    return localStorage.getItem("capitol_user_local_state") || "NY";
  });

  // Directory Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [chamberFilter, setChamberFilter] = useState<"ALL" | "House" | "Senate">("ALL");
  const [partyFilter, setPartyFilter] = useState<"ALL" | "D" | "R">("ALL");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [directoryPage, setDirectoryPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Collapsed states for voting histories of individual legislators (key: legId, val: boolean)
  const [expandedLegVotes, setExpandedLegVotes] = useState<Record<string, boolean>>({});

  // Active Selected Committee for the Federal tab view
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);

  // Load all current legislators from the parsed csv endpoint
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

  // Update selected local state and persist choice
  const handleStateChange = (stateCode: string) => {
    setSelectedLocalState(stateCode);
    localStorage.setItem("capitol_user_local_state", stateCode);
  };

  const toggleExpandVotes = (legId: string) => {
    setExpandedLegVotes(prev => ({
      ...prev,
      [legId]: !prev[legId]
    }));
  };

  // ----------------------------------------------------
  // DATA FILTERING & SORTING
  // ----------------------------------------------------
  
  // 1. Local State Representatives
  const localRepresentatives = legislators.filter(l => l.state === selectedLocalState);
  
  // 2. Politicians Directory Filtered List
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

  // Reset page when filters change
  useEffect(() => {
    setDirectoryPage(1);
  }, [searchTerm, chamberFilter, partyFilter, stateFilter]);

  // 3. Find legislators on the selected Standing Committee
  const committeeMembers = selectedCommittee 
    ? legislators.filter(l => l.committees?.includes(selectedCommittee))
    : [];

  const getFullStateName = (code: string) => STATE_NAMES[code] || `State of ${code}`;

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------
          HERO BANNER & PROFILE SELECTOR
         ---------------------------------------------------- */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 p-1 px-3 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-mono tracking-wider font-bold">
              <Sparkles className="h-3 w-3" />
              <span>DEMYSTIFYING THE 119TH CONGRESS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-slate-100 tracking-tight leading-none">
              Your Personalized Legislative HQ
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track live congressional accomplishments, monitor roll call voting breakdowns, examine upcoming debates, and search full legislator scorecard rosters.
            </p>
          </div>

          {/* Citizen Jurisdiction Setting box */}
          <div className="bg-slate-900/90 border border-slate-850 p-4.5 rounded-xl text-left md:w-80 flex-shrink-0 space-y-3 shadow-md">
            <div className="flex items-center space-x-2 text-amber-500">
              <MapPin className="h-4.5 w-4.5" />
              <span className="text-[11px] font-mono uppercase tracking-widest font-bold">My Local Jurisdiction</span>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="local-state-select" className="text-[10px] text-slate-400 block font-medium">
                Set home state to filter representation:
              </label>
              <select
                id="local-state-select"
                value={selectedLocalState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-amber-500 rounded-lg py-2 px-3 text-xs font-semibold focus:outline-none transition-colors"
              >
                {Object.entries(STATE_NAMES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name} ({code})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-slate-500 italic">
              Currently displaying custom alerts, scores, and media briefs tailored for {getFullStateName(selectedLocalState)}.
            </div>
          </div>
        </div>

        {/* Real-Time Session Status indicator bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-slate-900 rounded-lg text-amber-500 border border-slate-800">
              <Landmark className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">House of Representatives</div>
              <div className="text-xs font-semibold text-slate-100 mt-0.5 flex items-center space-x-2">
                <span>In recess (Resumes June 23)</span>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 border-t sm:border-t-0 sm:border-l border-slate-800/85 pt-4 sm:pt-0 sm:pl-4">
            <div className="p-2 bg-slate-900 rounded-lg text-emerald-500 border border-slate-800">
              <Landmark className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">United States Senate</div>
              <div className="text-xs font-semibold text-slate-100 mt-0.5 flex items-center space-x-2">
                <span>Active Floor debates (119th Session)</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          SUB-NAVIGATION (The three main modules)
         ---------------------------------------------------- */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-sm gap-1">
        <button
          onClick={() => setActiveSubTab("jurisdiction")}
          className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "jurisdiction"
              ? "bg-slate-900 text-amber-500 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>My State Jurisdiction ({selectedLocalState})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("federal")}
          className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "federal"
              ? "bg-slate-900 text-amber-500 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Landmark className="h-4 w-4" />
          <span>Federal Government & Committees</span>
        </button>

        <button
          onClick={() => setActiveSubTab("directory")}
          className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "directory"
              ? "bg-slate-900 text-amber-500 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Politicians Directory ({legislators.length})</span>
        </button>
      </div>

      {/* ----------------------------------------------------
          TAB 1: LOCAL JURISDICTION (STATE LEVEL)
         ---------------------------------------------------- */}
      {activeSubTab === "jurisdiction" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Representatives Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h2 className="text-base font-sans font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-amber-600" />
                    State Representatives for {getFullStateName(selectedLocalState)}
                  </h2>
                  <p className="text-xs text-slate-500">The current public officials representing your state in Washington D.C.</p>
                </div>
                <div className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                  {localRepresentatives.length} Members Found
                </div>
              </div>

              {loadingLegs ? (
                <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
                  <span className="text-sm font-semibold">Parsing state profiles...</span>
                </div>
              ) : localRepresentatives.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2 text-slate-500">
                  <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold">No listed members from {selectedLocalState} in our repository.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Try switching to a highly populated state like CA, NY, TX, or FL to view the parsed database profiles.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {localRepresentatives.map((leg) => {
                    const isFollowed = followedLegislators.includes(leg.id);
                    const isExpanded = expandedLegVotes[leg.id] || false;
                    return (
                      <div 
                        key={leg.id}
                        className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            {leg.imageUrl ? (
                              <img
                                src={leg.imageUrl}
                                alt={leg.name}
                                referrerPolicy="no-referrer"
                                className="h-11 w-11 rounded-full object-cover border border-slate-200 bg-slate-100"
                              />
                            ) : (
                              <div className="h-11 w-11 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                                {leg.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h3 className="text-xs font-bold text-slate-900 truncate">{leg.name}</h3>
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                                  leg.party === "D" 
                                    ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                    : leg.party === "R" 
                                      ? "bg-red-50 text-red-700 border border-red-100" 
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}>
                                  {leg.party}-{leg.state}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-slate-500">
                                {leg.chamber} • Attendance: <span className="text-slate-800">{leg.attendanceRate}%</span>
                              </p>
                              {leg.libertyProsperityIndex && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Liberty Grade:</span>
                                  <span className="text-[9.5px] font-sans font-black text-amber-700 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                    {leg.libertyProsperityIndex.grade}
                                  </span>
                                  <span className="text-[9.5px] font-mono font-bold text-slate-600">
                                    (Index: {leg.libertyProsperityIndex.overallScore}/100)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Appointed Committees snippet */}
                          {leg.committees && leg.committees.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Committees:</span>
                              <div className="flex flex-wrap gap-1">
                                {leg.committees.map((com, idx) => (
                                  <span key={idx} className="bg-white border border-slate-200 text-[9px] text-slate-600 px-2 py-0.5 rounded shadow-2xs leading-tight">
                                    {com.replace("Committee on ", "").replace("Senate ", "").replace("House ", "")}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Collapsible Recent Voting History */}
                          <div className="pt-2 border-t border-slate-200/60">
                            <button
                              onClick={() => toggleExpandVotes(leg.id)}
                              className="w-full flex items-center justify-between text-[10px] font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 focus:outline-none"
                            >
                              <span>{isExpanded ? "Hide Recent Voting Record" : "View Recent Voting Record"}</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 space-y-2 bg-white p-2.5 rounded-lg border border-slate-200/85 animate-fade-in text-[10px] leading-relaxed">
                                {leg.votingHistory && leg.votingHistory.length > 0 ? (
                                  leg.votingHistory.map((v, vidx) => (
                                    <div key={vidx} className="border-b border-slate-100 last:border-0 pb-1.5 last:pb-0 pt-1 hover:bg-slate-50/50 rounded p-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-amber-600">{v.billId}</span>
                                        <span className={`font-bold px-1.5 py-0.5 rounded-sm ${
                                          v.vote === "Yea" 
                                            ? "bg-emerald-50 text-emerald-700" 
                                            : "bg-rose-50 text-rose-700"
                                        }`}>
                                          Voted: {v.vote}
                                        </span>
                                      </div>
                                      <p className="font-medium text-slate-800 line-clamp-1 mt-0.5">{v.billTitle}</p>
                                      <p className="text-slate-450 text-[9.5px] italic mt-0.5">{v.impact}</p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-slate-400 py-1 text-center">No votes logged in this timeline.</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-mono">ID: {leg.id}</span>
                          <button
                            onClick={() => toggleFollowLegislator(leg.id)}
                            className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                              isFollowed
                                ? "bg-amber-500/10 border border-amber-500/35 text-amber-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {isFollowed ? "Drafted (Squad)" : "Draft to My Team"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar for Jurisdiction (Battleground States + Squad status) */}
          <div className="space-y-6">
            {/* Battleground States Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-sans font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                  National Media Battlegrounds
                </h3>
                <p className="text-[11px] text-slate-500">Other states gaining heavy media attention for active state agendas.</p>
              </div>

              <div className="space-y-3">
                {MEDIA_STATES.map((state) => (
                  <div 
                    key={state.code}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-500/40 hover:bg-amber-500/[0.01] transition-all group flex items-start gap-3"
                  >
                    <button
                      onClick={() => handleStateChange(state.code)}
                      className="h-8 w-8 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors font-mono cursor-pointer"
                    >
                      {state.code}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span 
                          onClick={() => handleStateChange(state.code)}
                          className="text-xs font-bold text-slate-900 hover:text-amber-600 cursor-pointer"
                        >
                          {getFullStateName(state.code)}
                        </span>
                        <ChevronRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{state.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grounded AI Tip Box */}
            <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 rounded-2xl border border-amber-500/15 p-5 space-y-3 shadow-2xs">
              <span className="font-bold text-amber-800 text-xs flex items-center gap-1">
                <Zap className="h-4 w-4 fill-amber-500 text-amber-500" /> Civics Insight
              </span>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                By focusing only on representatives from your state (<strong>{selectedLocalState}</strong>), you get immediate visibility into local legislative priorities without cluttering your feed with 535 federal profiles. Use the <strong>Politicians Directory</strong> tab to research other states.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: FEDERAL GOVERNMENT & COMMITTEES
         ---------------------------------------------------- */}
      {activeSubTab === "federal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity and Accomplishments (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent activity accomplishments feed */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <h2 className="text-base font-sans font-bold text-slate-900 flex items-center gap-2">
                    <BookmarkCheck className="h-5 w-5 text-amber-600" />
                    Federal Recent Bills & Daily Accomplishments
                  </h2>
                  <p className="text-xs text-slate-500">Real-world results, approved codes, and plain-language impact breakdowns.</p>
                </div>
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  {isLoading ? "Querying Live Grid..." : "Sync Live Data"}
                </button>
              </div>

              <div className="space-y-4">
                {accomplishments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No recent activities returned. Try checking internet parameters or press &apos;Sync Live Data&apos;.
                  </div>
                ) : (
                  accomplishments.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 hover:bg-slate-100/60 border border-slate-200/90 p-4.5 rounded-xl transition-all shadow-sm flex flex-col sm:flex-row gap-4 justify-between"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15">
                            {item.id}
                          </span>
                          <span className="text-[9.5px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                            {item.category}
                          </span>
                          <span className="text-[9.5px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                            {item.outcome}
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-bold text-slate-900 hover:text-amber-600 cursor-pointer mt-1" onClick={() => onSelectBill(item.id)}>
                          {item.title}
                        </h3>
                        
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {item.synopsis}
                        </p>

                        <div className="bg-white p-2.5 rounded border border-slate-200 text-[10.5px] text-slate-600 leading-normal">
                          <span className="font-bold text-slate-800 text-[11px] block mb-0.5">Real-World Outcome & Impact:</span>
                          {item.impact}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleWatchlist(item.id)}
                          className={`p-1.5 rounded border cursor-pointer transition-all ${
                            watchlist.includes(item.id)
                              ? "bg-amber-50 border-amber-200 text-amber-600"
                              : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                          }`}
                          title="Bookmark Bill"
                        >
                          <Star className={`h-4 w-4 ${watchlist.includes(item.id) ? "fill-amber-500" : ""}`} />
                        </button>

                        <button
                          onClick={() => onSelectBill(item.id)}
                          className="px-2.5 py-1.5 bg-slate-900 text-[10.5px] font-semibold text-slate-100 rounded-md hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <span>Summary</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Federal Committees Tab (Right 1 column) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-sans font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="h-4.5 w-4.5 text-amber-600" />
                  Key Standing Committees
                </h3>
                <p className="text-[11px] text-slate-500">Examine federal panels where bills are edited before being introduced to the chambers.</p>
              </div>

              <div className="space-y-3.5">
                {STANDING_COMMITTEES.map((com) => {
                  const isSelected = selectedCommittee === com.name;
                  return (
                    <div 
                      key={com.id}
                      onClick={() => setSelectedCommittee(isSelected ? null : com.name)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                        isSelected 
                          ? "bg-slate-900 text-slate-100 border-slate-900 shadow-md" 
                          : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-amber-500/20 text-amber-400" : "bg-slate-200 text-slate-600"
                        }`}>
                          {com.chamber} Jurisdiction
                        </span>
                        <ChevronRight className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isSelected ? "rotate-90 text-amber-400" : ""}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-snug">{com.name}</h4>
                        <p className={`text-[10.5px] leading-relaxed mt-1 ${isSelected ? "text-slate-350" : "text-slate-500"}`}>
                          {com.desc}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {com.tags.map((tag, t_idx) => (
                          <span 
                            key={t_idx} 
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                              isSelected ? "bg-slate-800 text-slate-300" : "bg-white text-slate-500 border border-slate-200"
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

            {/* Display Committee Members Sub-Panel if selected */}
            {selectedCommittee && (
              <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 space-y-3.5 shadow-md animate-fade-in">
                <div className="border-b border-slate-800 pb-2.5">
                  <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Committee Assignment</h4>
                  <p className="text-xs font-bold text-slate-200 line-clamp-1 mt-0.5">{selectedCommittee}</p>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {committeeMembers.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic text-center py-4">
                      No members of this committee are represented in your local cached list.
                    </div>
                  ) : (
                    committeeMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-xs p-1.5 bg-slate-950/60 rounded border border-slate-850">
                        <div>
                          <span className="font-bold text-slate-200 block">{member.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono uppercase">{member.party}-{member.state} | {member.chamber}</span>
                        </div>
                        <button
                          onClick={() => toggleFollowLegislator(member.id)}
                          className={`text-[8.5px] font-mono px-2 py-0.5 rounded font-bold ${
                            followedLegislators.includes(member.id)
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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

      {/* ----------------------------------------------------
          TAB 3: POLITICIANS DIRECTORY (HOUSE & SENATE)
         ---------------------------------------------------- */}
      {activeSubTab === "directory" && (
        <div className="space-y-6">
          {/* Filters Bar card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <h3 className="text-sm font-sans font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-amber-600" />
                  Roster Filter System
                </h3>
                <p className="text-[11px] text-slate-500">Query and research active, current members of both chambers.</p>
              </div>
              <div className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded">
                Showing {filteredLegislators.length} of {legislators.length} members
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search input */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search politician name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Chamber selector */}
              <div>
                <select
                  value={chamberFilter}
                  onChange={(e) => setChamberFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-all"
                >
                  <option value="ALL">All Chambers (House & Senate)</option>
                  <option value="House">House of Representatives</option>
                  <option value="Senate">United States Senate</option>
                </select>
              </div>

              {/* Party selector */}
              <div>
                <select
                  value={partyFilter}
                  onChange={(e) => setPartyFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-all"
                >
                  <option value="ALL">All Parties</option>
                  <option value="D">Democrats (D)</option>
                  <option value="R">Republicans (R)</option>
                </select>
              </div>

              {/* State selector */}
              <div>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-all"
                >
                  <option value="ALL">All States</option>
                  {Object.entries(STATE_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>{code} - {name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {loadingLegs ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-10 w-10 text-amber-500 animate-spin" />
              <span className="text-sm font-semibold">Generating live scoring models...</span>
            </div>
          ) : paginatedLegislators.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-500 space-y-2 shadow-xs">
              <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold">No matching politicians found.</p>
              <p className="text-xs text-slate-400">Clear your filters or search parameters and try again.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedLegislators.map((leg) => {
                  const isFollowed = followedLegislators.includes(leg.id);
                  const isExpanded = expandedLegVotes[leg.id] || false;
                  return (
                    <div 
                      key={leg.id}
                      className="bg-white rounded-2xl border border-slate-250 hover:border-slate-400 p-5 flex flex-col justify-between transition-all shadow-sm group hover:-translate-y-0.5"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          {leg.imageUrl ? (
                            <img
                              src={leg.imageUrl}
                              alt={leg.name}
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-full object-cover border border-slate-200 bg-slate-50"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-200">
                              {leg.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">{leg.name}</h4>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                                leg.party === "D" 
                                  ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                  : leg.party === "R" 
                                    ? "bg-red-50 text-red-700 border border-red-100" 
                                    : "bg-slate-100 text-slate-705 border border-slate-200"
                              }`}>
                                {leg.party}-{leg.state}
                              </span>
                            </div>
                            <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
                              {leg.chamber} • {getFullStateName(leg.state)}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                              <p className="text-[10px] font-medium text-slate-450">
                                Attendance Rate: <span className="text-slate-700 font-bold">{leg.attendanceRate}%</span>
                              </p>
                              {leg.libertyProsperityIndex && (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-slate-600">
                                  • Liberty Grade: 
                                  <span className="text-[9.5px] font-sans font-black text-amber-700 bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded leading-none">
                                    {leg.libertyProsperityIndex.grade}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Committees Roster for this politician */}
                        {leg.committees && leg.committees.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Standing Committees:</span>
                            <div className="flex flex-wrap gap-1">
                              {leg.committees.map((com, idx) => (
                                <span key={idx} className="bg-slate-50 border border-slate-200 text-[9px] text-slate-600 px-2 py-0.5 rounded leading-tight">
                                  {com.replace("Committee on ", "").replace("Senate ", "").replace("House ", "")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Voting history drawer */}
                        <div className="pt-2 border-t border-slate-100">
                          <button
                            onClick={() => toggleExpandVotes(leg.id)}
                            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 hover:text-slate-950 transition-colors py-1 focus:outline-none"
                          >
                            <span>{isExpanded ? "Hide Voting History" : "Reveal Voting History"}</span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 animate-fade-in text-[10.5px] leading-relaxed text-slate-600">
                              {leg.votingHistory && leg.votingHistory.length > 0 ? (
                                leg.votingHistory.map((v, vidx) => (
                                  <div key={vidx} className="border-b border-slate-200/60 last:border-0 pb-1.5 last:pb-0 pt-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-mono font-bold text-amber-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">{v.billId}</span>
                                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                                        v.vote === "Yea" 
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-150" 
                                          : "bg-rose-50 text-rose-700 border border-rose-150"
                                      }`}>
                                        {v.vote}
                                      </span>
                                    </div>
                                    <div className="font-bold text-slate-800 line-clamp-1 mt-1">{v.billTitle}</div>
                                    <p className="text-slate-500 text-[10px] italic mt-0.5">{v.impact}</p>
                                    <div className="text-[8.5px] font-mono text-slate-400 mt-1">Vote Date: {v.date}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-slate-400 py-1 text-center">No votes compiled.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                        <span className="text-slate-400 font-mono text-[9px]">Bioguide: {leg.id}</span>
                        <button
                          onClick={() => toggleFollowLegislator(leg.id)}
                          className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer text-xs ${
                            isFollowed
                              ? "bg-amber-500 text-slate-950 border border-amber-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                              : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isFollowed ? "In Squad" : "Draft Politician"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setDirectoryPage(p => Math.max(1, p - 1))}
                    disabled={directoryPage === 1}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Page {directoryPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setDirectoryPage(p => Math.min(totalPages, p + 1))}
                    disabled={directoryPage === totalPages}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Next
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
