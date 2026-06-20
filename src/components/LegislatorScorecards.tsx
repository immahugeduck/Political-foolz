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
  Star
} from "lucide-react";
import { LegislatorScorecard } from "../types";

interface LegislatorScorecardsProps {
  followedLegislators: string[];
  toggleFollowLegislator: (id: string) => void;
}

export default function LegislatorScorecards({ followedLegislators = [], toggleFollowLegislator }: LegislatorScorecardsProps) {
  const [legislators, setLegislators] = useState<LegislatorScorecard[]>([]);
  const [selectedLegId, setSelectedLegId] = useState<string>("");
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
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider font-mono">
                        Chamber Assignment: <span className="text-slate-800">{selectedLeg.chamber}</span> | State Jurisdiction: <span className="text-slate-800">{getFullStateName(selectedLeg.state)} ({selectedLeg.state})</span>
                      </p>
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
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
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
