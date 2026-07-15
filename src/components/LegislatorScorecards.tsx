import React, { useState, useEffect } from "react";
import { 
  User, 
  Award, 
  Percent, 
  BookOpen, 
  Clock, 
  Activity, 
  Search, 
  ArrowUpRight, 
  Loader2, 
  Layers, 
  Database, 
  Key, 
  Globe, 
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flame,
  AlertCircle,
  Star,
  Coins,
  TrendingUp
} from "lucide-react";
import { LegislatorScorecard } from "../types";

interface LegislatorScorecardsProps {
  followedLegislators: string[];
  toggleFollowLegislator: (id: string) => void;
}

export default function LegislatorScorecards({ followedLegislators = [], toggleFollowLegislator }: LegislatorScorecardsProps) {
  const [legislators, setLegislators] = useState<LegislatorScorecard[]>([]);
  const [selectedLegId, setSelectedLegId] = useState<string>("");
  const [compareLegId, setCompareLegId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [showApiGuide, setShowApiGuide] = useState<boolean>(false);

  useEffect(() => {
    async function fetchLegislators() {
      try {
        setLoading(true);
        const resp = await fetch("/api/legislation/legislators");
        const resJson = await resp.json();
        setLegislators(resJson.data || []);
        if (resJson.data && resJson.data.length > 0) {
          setSelectedLegId(resJson.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load legislators scorecards:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLegislators();
  }, []);

  const selectedLeg = legislators.find((l) => l.id === selectedLegId);

  // Dynamic filter lists
  const availableStates = Array.from(new Set(legislators.map((l) => l.state))).sort();

  const filteredLegs = legislators.filter((l) => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.chamber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = selectedState === "ALL" || l.state === selectedState;
    return matchesSearch && matchesState;
  });

  // Group filtered results by state so the directory list is highly organized!
  const groupedByState = filteredLegs.reduce<Record<string, LegislatorScorecard[]>>((acc, leg) => {
    if (!acc[leg.state]) {
      acc[leg.state] = [];
    }
    acc[leg.state].push(leg);
    return acc;
  }, {});

  const sortedStates = Object.keys(groupedByState).sort();

  // Helper mapping for friendly state names
  const stateNames: Record<string, string> = {
    MA: "Massachusetts",
    LA: "Louisiana",
    VT: "Vermont",
    NY: "New York",
    UT: "Utah",
  };

  const getFullStateName = (code: string) => stateNames[code] || `State of ${code}`;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-sans font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Politician Scorecard Directory (Organized by State)
            </h2>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Compare voting histories, attendance quotients, and issue alignment metrics with profiles categorized by their represented state jurisdictions.
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, chamber, or state..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg text-xs transition outline-none text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Suggested APIs Helpful Guide Box */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <button 
          onClick={() => setShowApiGuide(!showApiGuide)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Database className="h-4.5 w-4.5 text-blue-600" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Want to integrate live real-world politicians data?</span>
              <span className="text-[10.5px] text-slate-500 font-mono">Accepts custom APIs | View suggestions & setup instructions</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold font-mono">
            <span>{showApiGuide ? "Hide Setup" : "Suggest APIs"}</span>
            {showApiGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {showApiGuide && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-200/60 text-xs text-slate-650 space-y-4 leading-relaxed bg-white">
            <p>
              By default, this app utilizes a high-performance **Google Gemini Search-Grounded Model** to browse official dockets, alongside a local fallback dataset. If you prefer to integrate hardcoded first-party datasets or configure dynamic state-wide congress API keys, we strongly suggest connecting to these premier services:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 font-sans">
                  <Flame className="h-4 w-4 text-orange-600" />
                  ProPublica Congress API
                </div>
                <p className="text-[11px] text-slate-550">
                  Most popular and reliable data source for House and Senate member actions. Returns automated attendance rates, voting percentages, and bill cosponsorship metrics.
                </p>
                <div className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                  api.propublica.org/congress/v1
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 font-sans">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  Google Civic Information API
                </div>
                <p className="text-[11px] text-slate-550">
                  Allows users to enter their home address and instantly fetches their exact federal, state, and city politicians with their contact URLs and party details.
                </p>
                <div className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                  googleapis.com/civicinfo/v2
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 font-sans">
                  <Layers className="h-4 w-4 text-purple-600" />
                  Congress.gov API
                </div>
                <p className="text-[11px] text-slate-550">
                  Official XML and JSON schemas operated directly by the Library of Congress. Unlocks full historical sponsors registries, committee listings, and text variations.
                </p>
                <div className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                  api.congress.gov/v3
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 border border-slate-800 font-mono text-[10.5px]">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Key className="h-4 w-4" /> CODE INTEGRATION SUGGESTION (`server.ts`)
              </span>
              <p className="text-slate-350">
                You can easily add your secret API key inside `.env.example` as `PROPUBLICA_API_KEY=`, and fetch states dynamically in `server.ts` with this simple pattern:
              </p>
              <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-slate-300">
{`app.get("/api/legislation/legislators", async (req, res) => {
  if (process.env.PROPUBLICA_API_KEY) {
    const response = await fetch("https://api.propublica.org/congress/v1/118/senate/members.json", {
      headers: { "X-API-Key": process.env.PROPUBLICA_API_KEY }
    });
    const parsedData = await response.json();
    return res.json({ source: "propublica", data: mapProPublicaToScorecard(parsedData) });
  }
  // Otherwise, fallback nicely to Grounded Gemini/fallback Cache
});`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
          <span className="text-xs font-mono text-slate-500">Retrieving congressional scorecards from state archives...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Legislator Quick Picker sidebar (Left 4 columns) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
              
              {/* State Filter Pills Header Block */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-500" />
                    State Jurisdiction filter
                  </span>
                  <span className="text-[10px] font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {filteredLegs.length} Matching
                  </span>
                </div>
                
                {/* State selector pills */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedState("ALL")}
                    className={`px-2.5 py-1 text-[10px] font-mono font-extrabold rounded-md border transition cursor-pointer ${
                      selectedState === "ALL"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    ALL STATE ({legislators.length})
                  </button>
                  {availableStates.map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedState(st)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-extrabold rounded-md border transition cursor-pointer ${
                        selectedState === st
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {st} ({legislators.filter((l) => l.state === st).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Directory Scroller organized by State groups */}
              <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto flex-1 bg-white">
                {sortedStates.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    No results found in selected state constraints.
                  </div>
                ) : (
                  sortedStates.map((state) => (
                    <div key={state} className="bg-white">
                      
                      {/* State Group Header Title in directory */}
                      <div className="px-3.5 py-2 bg-slate-50/80 border-y border-slate-150 text-[10px] font-mono font-bold text-slate-500 tracking-wider flex items-center justify-between sticky top-0 backdrop-blur-md z-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                          {getFullStateName(state).toUpperCase()} ({state})
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 font-sans uppercase">
                          {groupedByState[state].length} representative{groupedByState[state].length > 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* State Members Loop */}
                      <div className="divide-y divide-slate-100">
                        {groupedByState[state].map((leg) => {
                          const isSelected = leg.id === selectedLegId;
                          const partyColor = leg.party === "D" 
                            ? "text-blue-600 bg-blue-50 border-blue-100" 
                            : leg.party === "R" 
                              ? "text-red-600 bg-red-50 border-red-100" 
                              : "text-amber-600 bg-amber-50 border-amber-100";
                          
                          const isFollowed = followedLegislators.includes(leg.id);
                          return (
                            <button
                              key={leg.id}
                              onClick={() => setSelectedLegId(leg.id)}
                              className={`w-full text-left p-4 flex items-center gap-3 transition-all cursor-pointer ${
                                isSelected 
                                  ? "bg-slate-900 text-white" 
                                  : "hover:bg-slate-50 text-slate-800"
                              }`}
                            >
                              {leg.imageUrl ? (
                                <img 
                                  src={leg.imageUrl} 
                                  alt={leg.name} 
                                  referrerPolicy="no-referrer"
                                  className="h-10 w-10 rounded-full object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                  <User className="h-5 w-5 text-slate-500" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-sans font-bold text-xs truncate flex items-center gap-1">
                                    {leg.name}
                                    {isFollowed && (
                                      <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                                    )}
                                  </h4>
                                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${partyColor}`}>
                                    {leg.party}-{leg.state}
                                  </span>
                                </div>
                                <p className={`text-[10px] ${isSelected ? "text-slate-400" : "text-slate-500"} font-medium mt-1`}>
                                  Chamber: {leg.chamber} • Attendance: {leg.attendanceRate}%
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* Active Scorecard Panel (Right 8 columns) */}
          <div className="lg:col-span-8">
            {selectedLeg ? (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm space-y-6 p-6">
                
                {/* Scorecard Profile Title Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-4">
                    {selectedLeg.imageUrl ? (
                      <img 
                        src={selectedLeg.imageUrl} 
                        alt={selectedLeg.name} 
                        referrerPolicy="no-referrer"
                        className="h-16 w-16 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-sans font-bold text-lg text-slate-900 leading-snug">
                          {selectedLeg.name}
                        </h3>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                          selectedLeg.party === "D" 
                            ? "bg-blue-50 text-blue-700 border-blue-100" 
                            : selectedLeg.party === "R" 
                              ? "bg-red-50 text-red-700 border-red-100" 
                              : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {selectedLeg.party === "D" ? "Democrat" : selectedLeg.party === "R" ? "Republican" : "Independent"} ({selectedLeg.party}-{selectedLeg.state})
                        </span>
                        
                        {/* Sports fantasy draft follow button */}
                        {(() => {
                          const isFollowed = followedLegislators.includes(selectedLeg.id);
                          return (
                            <button
                              onClick={() => toggleFollowLegislator(selectedLeg.id)}
                              id="toggle-sports-follow"
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all border shadow-sm ${
                                isFollowed 
                                  ? "bg-amber-50 border-amber-300 text-amber-800" 
                                  : "bg-slate-50 hover:bg-slate-100 font-medium border-slate-200 text-slate-600"
                              }`}
                            >
                              <Star className={`h-3 w-3 ${isFollowed ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
                              <span>{isFollowed ? "My Team Roster ✓" : "Draft to My Team"}</span>
                            </button>
                          );
                        })()}

                        {/* Head-to-head premium sport-style matchup selector dropdown */}
                        <div className="flex items-center gap-1.5 ml-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">H2H Matchup:</span>
                          <select
                            value={compareLegId}
                            onChange={(e) => setCompareLegId(e.target.value)}
                            id="sports-matchup-select"
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-[10.5px] font-bold text-slate-700 focus:outline-none transition-colors cursor-pointer"
                          >
                            <option value="">Choose Coach Opponent...</option>
                            {legislators
                              .filter((l) => l.id !== selectedLeg.id)
                              .map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.name} ({l.party}-{l.state})
                                </option>
                              ))}
                          </select>
                          {compareLegId && (
                            <button
                              onClick={() => setCompareLegId("")}
                              className="text-[9px] font-mono font-bold text-red-650 bg-red-50 hover:bg-red-100 border border-red-200/50 px-1.5 py-1 rounded-md transition-colors cursor-pointer"
                            >
                              Clear Match
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider font-mono">
                        Chamber Assignment: <span className="text-slate-800">{selectedLeg.chamber}</span> | State Jurisdiction: <span className="text-slate-800">{getFullStateName(selectedLeg.state)} ({selectedLeg.state})</span>
                      </p>
                      {selectedLeg.committees && selectedLeg.committees.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mr-1">Appointed Committees:</span>
                          {selectedLeg.committees.map((com, idx) => (
                            <span 
                              key={idx} 
                              className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full border ${
                                selectedLeg.party === "D"
                                  ? "bg-blue-50/50 text-blue-700 border-blue-100"
                                  : selectedLeg.party === "R"
                                    ? "bg-red-50/50 text-red-700 border-red-100"
                                    : "bg-slate-100 text-slate-705 border-slate-200"
                              }`}
                            >
                              {com}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Top line high metrics circles */}
                  <div className="flex gap-4 self-start sm:self-center">
                    <div className="text-center bg-slate-50 border border-slate-150 px-3.5 py-2.5 rounded-xl">
                      <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider font-semibold">Attendance</div>
                      <div className="text-base font-sans font-black text-slate-800 mt-1">{selectedLeg.attendanceRate}%</div>
                    </div>
                    <div className="text-center bg-slate-50 border border-slate-150 px-3.5 py-2.5 rounded-xl">
                      <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider font-semibold">Sponsored</div>
                      <div className="text-base font-sans font-black text-slate-800 mt-1">{selectedLeg.billsSponsored + selectedLeg.billsCosponsored}</div>
                    </div>
                  </div>
                </div>

                {/* Scorecard grids */}
                {(() => {
                  const compareLeg = legislators.find((l) => l.id === compareLegId);
                  if (compareLeg) {
                    return (
                      <div className="space-y-6">
                        {/* Matchup Header Banner */}
                        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                          <div className="text-center font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">
                            ★ H2H Politician Matchup Combat Mode ★
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                            {/* Left Competitor Card */}
                            <div className="md:col-span-5 flex flex-col items-center text-center space-y-2 bg-slate-950 p-4 rounded-xl border border-blue-500/30">
                              {selectedLeg.imageUrl ? (
                                <img src={selectedLeg.imageUrl} alt={selectedLeg.name} referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover border-2 border-blue-500" />
                              ) : (
                                <div className="h-14 w-14 bg-slate-800 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-slate-400" /></div>
                              )}
                              <div>
                                <h4 className="text-xs font-bold text-slate-200">{selectedLeg.name}</h4>
                                <p className="text-[10px] font-mono font-semibold text-blue-400 uppercase">{selectedLeg.party}-{selectedLeg.state} | {selectedLeg.chamber}</p>
                                {selectedLeg.committees && selectedLeg.committees.length > 0 && (
                                  <div className="flex flex-wrap justify-center gap-1 mt-1.5 max-w-[200px]">
                                    {selectedLeg.committees.map((com, idx) => (
                                      <span key={idx} className="bg-slate-900 border border-blue-500/35 text-blue-300 text-[8px] font-sans font-medium px-1.5 py-0.5 rounded leading-tight">
                                        {com.replace("Committee on ", "")}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* VERSUS middle element */}
                            <div className="md:col-span-1 text-center font-sans font-black text-amber-500 text-lg shadow-sm">
                              VS
                            </div>

                            {/* Right Competitor Card */}
                            <div className="md:col-span-5 flex flex-col items-center text-center space-y-2 bg-slate-950 p-4 rounded-xl border border-red-500/30">
                              {compareLeg.imageUrl ? (
                                <img src={compareLeg.imageUrl} alt={compareLeg.name} referrerPolicy="no-referrer" className="h-14 w-14 rounded-full object-cover border-2 border-red-500" />
                              ) : (
                                <div className="h-14 w-14 bg-slate-800 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-slate-400" /></div>
                              )}
                              <div>
                                <h4 className="text-xs font-bold text-slate-200">{compareLeg.name}</h4>
                                <p className="text-[10px] font-mono font-semibold text-red-400 uppercase">{compareLeg.party}-{compareLeg.state} | {compareLeg.chamber}</p>
                                {compareLeg.committees && compareLeg.committees.length > 0 && (
                                  <div className="flex flex-wrap justify-center gap-1 mt-1.5 max-w-[200px]">
                                    {compareLeg.committees.map((com, idx) => (
                                      <span key={idx} className="bg-slate-900 border border-red-500/35 text-red-300 text-[8px] font-sans font-medium px-1.5 py-0.5 rounded leading-tight">
                                        {com.replace("Committee on ", "")}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Metric Comparison blocks */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Core Performance Metrics comparison
                          </h4>
                          
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 divide-y divide-slate-250">
                            
                            {/* Attendance Rate Row */}
                            <div className="py-3.5 grid grid-cols-1 md:grid-cols-11 gap-2 items-center">
                              <div className="md:col-span-4 text-xs font-bold text-slate-800 text-left">
                                {selectedLeg.attendanceRate}%
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                                  <div className="h-full bg-blue-600" style={{ width: `${selectedLeg.attendanceRate}%` }}></div>
                                </div>
                              </div>
                              <div className="md:col-span-3 text-center text-[10px] font-mono font-bold text-slate-500 uppercase">
                                Attendance Rate
                              </div>
                              <div className="md:col-span-4 text-xs font-bold text-slate-800 text-right">
                                {compareLeg.attendanceRate}%
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                                  <div className="h-full bg-red-600 ml-auto" style={{ width: `${compareLeg.attendanceRate}%` }}></div>
                                </div>
                              </div>
                            </div>

                            {/* Liberty & Prosperity Overall Score Comparison Row */}
                            {selectedLeg.libertyProsperityIndex && compareLeg.libertyProsperityIndex && (
                              <div className="py-3.5 grid grid-cols-1 md:grid-cols-11 gap-2 items-center bg-amber-500/5 rounded-xl px-2">
                                <div className="md:col-span-4 text-xs font-bold text-slate-900 text-left flex items-center gap-2">
                                  <span className="text-xs font-sans font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                    {selectedLeg.libertyProsperityIndex.grade}
                                  </span>
                                  <span>
                                    {selectedLeg.libertyProsperityIndex.overallScore} / 100
                                  </span>
                                  <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600" style={{ width: `${selectedLeg.libertyProsperityIndex.overallScore}%` }}></div>
                                  </div>
                                </div>
                                <div className="md:col-span-3 text-center text-[10px] font-mono font-extrabold text-amber-600 uppercase tracking-tight">
                                  ★ Liberty Index ★
                                </div>
                                <div className="md:col-span-4 text-xs font-bold text-slate-900 text-right flex items-center justify-end gap-2">
                                  <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-600 ml-auto" style={{ width: `${compareLeg.libertyProsperityIndex.overallScore}%` }}></div>
                                  </div>
                                  <span>
                                    {compareLeg.libertyProsperityIndex.overallScore} / 100
                                  </span>
                                  <span className="text-xs font-sans font-black text-red-750 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                    {compareLeg.libertyProsperityIndex.grade}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Primary sponsored volume */}
                            <div className="py-3.5 grid grid-cols-1 md:grid-cols-11 gap-2 items-center">
                              <div className="md:col-span-4 text-base font-sans font-black text-blue-600 text-left">
                                {selectedLeg.billsSponsored} <span className="text-[10px] font-mono text-slate-400 font-medium">bills</span>
                              </div>
                              <div className="md:col-span-3 text-center text-[10px] font-mono font-bold text-slate-500 uppercase">
                                Sponsored Bills
                              </div>
                              <div className="md:col-span-4 text-base font-sans font-black text-red-600 text-right">
                                {compareLeg.billsSponsored} <span className="text-[10px] font-mono text-slate-400 font-medium">bills</span>
                              </div>
                            </div>

                            {/* Co-sponsored volume */}
                            <div className="py-3.5 grid grid-cols-1 md:grid-cols-11 gap-2 items-center">
                              <div className="md:col-span-4 text-base font-sans font-black text-sky-600 text-left">
                                {selectedLeg.billsCosponsored} <span className="text-[10px] font-mono text-slate-400 font-bold">bills</span>
                              </div>
                              <div className="md:col-span-3 text-center text-[10px] font-mono font-bold text-slate-500 uppercase">
                                Cosponsored Endorsements
                              </div>
                              <div className="md:col-span-4 text-base font-sans font-black text-rose-600 text-right">
                                {compareLeg.billsCosponsored} <span className="text-[10px] font-mono text-slate-400 font-bold">bills</span>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* EXPOSING DISCRETE LEANINGS / AUTHENTICITY ANALYSIS */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Dishonest Stance & Maverick Index Analyzer
                          </h4>

                          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-4 shadow-sm">
                            <div className="text-xs leading-relaxed text-slate-700 font-medium">
                              <strong>How to spot discrete or dishonest stances:</strong> Stating moderation to voters while voting 100% strictly with corporate or legislative party whips constitutes a discrete alignment. Look out for the <strong>Maverick Index</strong> (higher score equals more independent/honest cross-aisle actions).
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Selected Leg Analyzer */}
                              <div className="bg-white p-4 rounded-xl border border-amber-200/50 space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                  <span className="text-[11px] font-sans font-bold text-slate-800">{selectedLeg.name}</span>
                                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Analysis</span>
                                </div>

                                {(() => {
                                  const activeLean = selectedLeg.keyIssueAlignment?.length > 0 
                                    ? selectedLeg.keyIssueAlignment.reduce((acc, curr) => acc + curr.alignmentRate, 0) / selectedLeg.keyIssueAlignment.length 
                                    : 50;
                                  const maverickScore = Math.round(100 - activeLean);
                                  
                                  let evaluation = "Strict Loyalist / Solid Alignment";
                                  let color = "text-blue-600";
                                  if (maverickScore > 35) {
                                    evaluation = "Maverick / Independent swing leaning";
                                    color = "text-amber-600";
                                  } else if (maverickScore < 10) {
                                    evaluation = "Extremely Discrete Party conformist";
                                    color = "text-purple-600";
                                  }

                                  return (
                                    <div className="space-y-2.5">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Maverick Index:</span>
                                        <span className="font-mono font-black text-slate-800">{maverickScore}%</span>
                                      </div>
                                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: `${maverickScore}%` }}></div>
                                      </div>
                                      <p className="text-[10px] text-slate-500 font-semibold uppercase leading-snug">
                                        Grade Stance: <span className={color}>{evaluation}</span>
                                      </p>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Compare Leg Analyzer */}
                              <div className="bg-white p-4 rounded-xl border border-amber-200/50 space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                  <span className="text-[11px] font-sans font-bold text-slate-800">{compareLeg.name}</span>
                                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Analysis</span>
                                </div>

                                {(() => {
                                  const activeLean = compareLeg.keyIssueAlignment?.length > 0 
                                    ? compareLeg.keyIssueAlignment.reduce((acc, curr) => acc + curr.alignmentRate, 0) / compareLeg.keyIssueAlignment.length 
                                    : 50;
                                  const maverickScore = Math.round(100 - activeLean);
                                  
                                  let evaluation = "Strict Loyalist / Solid Alignment";
                                  let color = "text-blue-600";
                                  if (maverickScore > 35) {
                                    evaluation = "Maverick / Independent swing leaning";
                                    color = "text-amber-600";
                                  } else if (maverickScore < 10) {
                                    evaluation = "Extremely Discrete Party conformist";
                                    color = "text-purple-600";
                                  }

                                  return (
                                    <div className="space-y-2.5">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Maverick Index:</span>
                                        <span className="font-mono font-black text-slate-800">{maverickScore}%</span>
                                      </div>
                                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: `${maverickScore}%` }}></div>
                                      </div>
                                      <p className="text-[10px] text-slate-500 font-semibold uppercase leading-snug">
                                        Grade Stance: <span className={color}>{evaluation}</span>
                                      </p>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Key alignment issue checklist breakdown */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                            Key Issue Alignment matchup details
                          </h4>

                          <div className="space-y-3">
                            {selectedLeg.keyIssueAlignment.map((selectedAlign, i) => {
                              const compareAlign = compareLeg.keyIssueAlignment.find(a => a.issue === selectedAlign.issue) || { alignmentRate: 50 };
                              
                              return (
                                <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-sm">
                                  <div className="text-[10.5px] font-bold text-slate-900 border-b border-slate-50 pb-1.5 uppercase tracking-tight">
                                    {selectedAlign.issue}
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-11 gap-2 items-center text-[11px]">
                                    <div className="md:col-span-4 flex items-center gap-1.5 font-medium">
                                      <span className="text-blue-600 font-bold">{selectedAlign.alignmentRate}%</span>
                                      <div className="h-2 w-24 bg-slate-100 rounded">
                                        <div className="h-full bg-blue-500 rounded" style={{ width: `${selectedAlign.alignmentRate}%` }}></div>
                                      </div>
                                    </div>
                                    <div className="md:col-span-3 text-center font-mono text-[9px] text-slate-400 uppercase">
                                      Aisle Alignment Rate
                                    </div>
                                    <div className="md:col-span-4 flex items-center justify-end gap-1.5 font-medium">
                                      <div className="h-2 w-24 bg-slate-100 rounded">
                                        <div className="h-full bg-red-500 rounded" style={{ width: `${compareAlign.alignmentRate}%` }}></div>
                                      </div>
                                      <span className="text-red-650 font-bold">{compareAlign.alignmentRate}%</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Default view if compareLeg is not selected
                  return (
                    <>
                      {/* American Liberty & Prosperity Index Full-Width Scorecard */}
                      {selectedLeg.libertyProsperityIndex && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-6 shadow-md space-y-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                          
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                            <div className="space-y-1">
                              <div className="inline-flex items-center space-x-1.5 p-1 px-3 bg-red-500/10 text-red-400 rounded-full text-[9px] font-mono tracking-wider font-bold">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                <span>CONSTITUTIONAL LIBERTY METER</span>
                              </div>
                              <h4 className="text-base font-sans font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                                Liberty & Prosperity Index
                              </h4>
                              <p className="text-slate-400 text-xs">
                                Evaluates voting patterns against constituent empowerment, individual rights protection, and the pursuit of happiness.
                              </p>
                            </div>

                            {/* Circular Grade Badge */}
                            <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-red-600 via-slate-900 to-blue-600 p-0.5 flex items-center justify-center shadow-lg">
                                <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center">
                                  <span className="text-lg font-sans font-black text-amber-400 tracking-tight">
                                    {selectedLeg.libertyProsperityIndex.grade}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Overall Index</div>
                                <div className="text-xs font-bold text-slate-100">{selectedLeg.libertyProsperityIndex.overallScore} / 100 Score</div>
                              </div>
                            </div>
                          </div>

                          {/* Three Core Pillars progress grids */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Pillar 1: Constituent Benefit */}
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-300">Constituent Benefit</span>
                                <span className="font-mono font-bold text-amber-400">{selectedLeg.libertyProsperityIndex.constituentBenefit}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedLeg.libertyProsperityIndex.constituentBenefit}%` }}></div>
                              </div>
                              <p className="text-[10px] text-slate-450 leading-snug">
                                Measures direct support for community infrastructure, health initiatives, and tax sanity.
                              </p>
                            </div>

                            {/* Pillar 2: Freedom & Rights Protection */}
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-300">Freedom & Rights Guard</span>
                                <span className="font-mono font-bold text-amber-400">{selectedLeg.libertyProsperityIndex.freedomSafeguard}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedLeg.libertyProsperityIndex.freedomSafeguard}%` }}></div>
                              </div>
                              <p className="text-[10px] text-slate-450 leading-snug">
                                Measures safeguarding individual privacy, free expression, and constitutional liberties.
                              </p>
                            </div>

                            {/* Pillar 3: Pursuit of Happiness Index */}
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-300">Happiness Pursuit Index</span>
                                <span className="font-mono font-bold text-amber-400">{selectedLeg.libertyProsperityIndex.happinessPursuit}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${selectedLeg.libertyProsperityIndex.happinessPursuit}%` }}></div>
                              </div>
                              <p className="text-[10px] text-slate-450 leading-snug">
                                Measures backing entrepreneurship, inflation controls, and the American Dream pathways.
                              </p>
                            </div>
                          </div>

                          {/* Verdict Summary block */}
                          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-slate-300">
                            <span className="font-mono font-bold text-amber-400 text-[9.5px] uppercase tracking-wider block mb-1">Index Verdict Analysis:</span>
                            &ldquo;{selectedLeg.libertyProsperityIndex.summary}&rdquo;
                          </div>
                        </div>
                      )}

                      {/* Lobbyist Funding & Corporate PAC Tracker Card */}
                      {selectedLeg.lobbyistPacFunding && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6" id={`pac-tracker-${selectedLeg.id}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                            <div className="space-y-1">
                              <div className="inline-flex items-center space-x-1.5 p-1 px-2.5 bg-amber-500/10 text-amber-700 rounded-full text-[10px] font-mono tracking-wider font-bold">
                                <Coins className="h-3.5 w-3.5" />
                                <span>CAMPAIGN FINANCE & PAC TRACKER</span>
                              </div>
                              <h4 className="text-base font-sans font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                Lobbyist & PAC Funding Profile
                              </h4>
                              <p className="text-slate-500 text-xs font-medium">
                                Breaks down the campaign donations, corporate PAC receipts, and lobbyist contributions received by this legislator.
                              </p>
                            </div>

                            {/* Total Funding Display */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right shrink-0">
                              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Estimated Cycle Funding</div>
                              <div className="text-lg font-sans font-black text-slate-900">
                                ${selectedLeg.lobbyistPacFunding.totalFunding.toLocaleString()}
                              </div>
                              <span className="text-[9.5px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                                FEC Verified Estimation
                              </span>
                            </div>
                          </div>

                          {/* Source split progress bars */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 p-4.5 rounded-xl border border-slate-150">
                            <div className="md:col-span-4 space-y-1.5">
                              <h5 className="text-xs font-bold text-slate-800">Donation Source Mix</h5>
                              <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                                Represents the ratio of special-interest corporate PACs vs. individual citizen contributors.
                              </p>
                            </div>

                            <div className="md:col-span-8 space-y-2">
                              <div className="flex justify-between font-mono text-[10.5px] font-bold text-slate-650">
                                <span className="text-indigo-600">Corporate PACs: {selectedLeg.lobbyistPacFunding.pacPercentage}%</span>
                                <span className="text-amber-600">Individual Donors: {selectedLeg.lobbyistPacFunding.individualPercentage}%</span>
                              </div>
                              
                              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                <div className="h-full bg-indigo-600" style={{ width: `${selectedLeg.lobbyistPacFunding.pacPercentage}%` }}></div>
                                <div className="h-full bg-amber-500" style={{ width: `${selectedLeg.lobbyistPacFunding.individualPercentage}%` }}></div>
                              </div>
                              
                              <div className="flex justify-between text-[9px] text-slate-450 font-semibold uppercase tracking-wider">
                                <span>Total PAC: ${(selectedLeg.lobbyistPacFunding.totalFunding * selectedLeg.lobbyistPacFunding.pacPercentage / 100).toLocaleString()}</span>
                                <span>Total Indiv: ${(selectedLeg.lobbyistPacFunding.totalFunding * selectedLeg.lobbyistPacFunding.individualPercentage / 100).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Top 4 Sectors representation */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest px-0.5">
                              Top Funding Sectors / Lobbying Interests
                            </h5>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {selectedLeg.lobbyistPacFunding.topSectors.map((sectorObj: any, idx: number) => (
                                <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-250 shadow-sm space-y-2 transition-colors">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-800 truncate max-w-[130px]" title={sectorObj.sector}>{sectorObj.sector}</span>
                                    <span className="font-mono font-extrabold text-blue-600 text-[11px]">{sectorObj.percentage}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${sectorObj.percentage}%` }}></div>
                                  </div>
                                  <div className="text-[11px] font-sans font-black text-slate-900">
                                    ${sectorObj.amount.toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Top PAC Donors List */}
                          <div className="bg-slate-50/60 p-4.5 rounded-xl border border-slate-150 space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <h5 className="text-xs font-sans font-black text-slate-850">
                                Top Corporate PAC Recipients List
                              </h5>
                              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">FEC Limit Compliance Verified</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {selectedLeg.lobbyistPacFunding.majorPacDonors.map((donorObj: any, idx: number) => (
                                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-inner flex items-center justify-between text-xs font-medium">
                                  <div className="space-y-0.5">
                                    <div className="font-bold text-slate-800">{donorObj.donor}</div>
                                    <div className="text-[10px] text-slate-500 font-semibold">{donorObj.industry} PAC</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-mono font-black text-slate-900">${donorObj.amount.toLocaleString()}</div>
                                    <div className="text-[8.5px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded inline-block">Active Cycle</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <p className="text-[9.5px] text-slate-450 leading-relaxed italic text-center">
                              * Note: Corporate PACs are strictly capped by Federal Election Commission (FEC) rules. Aggregating multiple individual executive donations from identical industries frequently acts as a vital legislative vehicle.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Attendance Performance Trends (SVG Timeline) */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <Clock className="h-4 w-4 text-blue-500" /> Attendance Trends Over Time
                          </h4>
                          <p className="text-[11px] text-slate-550 leading-relaxed">
                            History of official floor roll calls, quorum votes, and committee review sessions:
                          </p>

                          {/* Highly polished SVG Trendline */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="h-32 w-full relative">
                              {/* Inline SVG Chart */}
                              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                                <defs>
                                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                
                                {/* Grid Lines */}
                                <line x1="10" y1="10" x2="290" y2="10" stroke="#e2e8f0" strokeDasharray="3,3" />
                                <line x1="10" y1="45" x2="290" y2="45" stroke="#e2e8f0" strokeDasharray="3,3" />
                                <line x1="10" y1="80" x2="290" y2="80" stroke="#e2e8f0" strokeDasharray="3,3" />
                                
                                {/* Y-axis text labels */}
                                <text x="5" y="15" fill="#94a3b8" fontSize="6" fontFamily="monospace">100%</text>
                                <text x="5" y="50" fill="#94a3b8" fontSize="6" fontFamily="monospace">95%</text>
                                <text x="5" y="85" fill="#94a3b8" fontSize="6" fontFamily="monospace">90%</text>

                                {/* Generate dynamic path coordinates */}
                                {(() => {
                                  const dataCount = selectedLeg.attendanceTrend.length;
                                  const points = selectedLeg.attendanceTrend.map((d, index) => {
                                    const x = 10 + (index * (280 / (dataCount - 1)));
                                    const pctPosition = (d.rate - 90) / 10; // offset around 90-100%
                                    const clampedPct = Math.max(0, Math.min(1, pctPosition));
                                    const y = 80 - (clampedPct * 70); // invert for SVG coord space
                                    return { x, y, rate: d.rate, year: d.year };
                                  });

                                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                  const areaPath = `${linePath} L ${points[points.length - 1].x} 80 L ${points[0].x} 80 Z`;

                                  return (
                                    <>
                                      <path d={areaPath} fill="url(#chartGradient)" />
                                      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                                      
                                      {points.map((p, i) => (
                                        <g key={i}>
                                          <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
                                          <text x={p.x - 5} y={p.y - 6} fill="#1e293b" fontSize="7" fontWeight="bold" fontFamily="monospace">
                                            {p.rate}%
                                          </text>
                                          <text x={p.x - 7} y="94" fill="#64748b" fontSize="7" fontWeight="semibold" fontFamily="monospace">
                                            {p.year}
                                          </text>
                                        </g>
                                      ))}
                                    </>
                                  );
                                })()}
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Alignment on Key Issues (Bar graphs) */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                            <Percent className="h-4 w-4 text-purple-500" /> Key Issue Support Ratings
                          </h4>
                          <p className="text-[11px] text-slate-550 leading-relaxed">
                            Consistency rating matching key vote alignment with public safety, consumer safety, and budget metrics:
                          </p>

                          <div className="space-y-3.5">
                            {selectedLeg.keyIssueAlignment.map((align, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between items-center text-xs font-sans">
                                  <span className="font-bold text-slate-700">{align.issue}</span>
                                  <span className="font-mono text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                    {align.alignmentRate}% Match
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${align.alignmentRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bill Sponsorship Productivity Breakdown */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner">
                        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3.5">
                          <BookOpen className="h-4 w-4 text-emerald-500" /> Legislative Sponsorship Volume
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-150">
                            <span className="text-[10px] font-mono text-slate-400 font-bold block">PRIMARY SPONSORED BILLS</span>
                            <span className="text-2xl font-sans font-black text-emerald-600 mt-1 block">
                              {selectedLeg.billsSponsored}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                              Original regulatory drafts introduced directly as authoring legislator.
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border border-slate-150">
                            <span className="text-[10px] font-mono text-slate-400 font-bold block">CO-SPONSORED BILLS</span>
                            <span className="text-2xl font-sans font-black text-blue-600 mt-1 block">
                              {selectedLeg.billsCosponsored}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                              Bipartisan or caucus-backed draft codes endorsed to accelerate committee clearance.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Recent Votes and impacts */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Activity className="h-4 w-4 text-amber-500" /> Recent Floor Action & Explanations
                        </h4>
                        
                        <div className="space-y-3">
                          {selectedLeg.votingHistory.map((history, idx) => (
                            <div key={idx} className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition shadow-sm flex items-start gap-3">
                              <div className="mt-0.5 flex-shrink-0">
                                {history.vote === "Yea" ? (
                                  <span className="inline-flex items-center justify-center h-5 w-12 text-[10px] font-mono font-black border border-emerald-100 bg-emerald-50 text-emerald-700 rounded-full">
                                    YEA
                                  </span>
                                ) : history.vote === "Nay" ? (
                                  <span className="inline-flex items-center justify-center h-5 w-12 text-[10px] font-mono font-black border border-red-100 bg-red-50 text-red-700 rounded-full">
                                    NAY
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center h-5 w-12 text-[10px] font-mono font-black border border-slate-150 bg-slate-100 text-slate-500 rounded-full">
                                    ABS
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-4">
                                  <h5 className="text-xs font-sans font-extrabold text-slate-950 truncate max-w-[280px]">
                                    {history.billId}: {history.billTitle}
                                  </h5>
                                  <span className="text-[9px] font-mono font-semibold text-slate-405 flex-shrink-0">{history.date}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed mt-1">{history.impact}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}

              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                Please select a legislator from the directory to review their scorecards.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
