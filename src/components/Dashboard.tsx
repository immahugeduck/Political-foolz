import React, { useState, useEffect } from "react";
import { Landmark, Sparkles, AlertCircle, FileText, ChevronRight, BookmarkCheck, CalendarDays, BarChart4, Zap, RefreshCw, Star, Users, Trophy } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 p-1 px-3 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-mono tracking-wider font-bold">
            <Sparkles className="h-3 w-3" />
            <span>AI-GROUNDED LEGISLATIVE RESEARCH GRID</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-slate-100 tracking-tight leading-none">
            Demystifying Congress in Plain Language.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Track active 119th Congress accomplishments, monitor roll call voting breakdowns, examine upcoming calendar debates, and read direct summaries free from legal jargon.
          </p>
        </div>

        {/* Real-Time Session Status widget bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-slate-900 rounded-lg text-amber-500 border border-slate-800">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">House of Representatives</div>
              <div className="text-sm font-semibold text-slate-100 mt-0.5 flex items-center space-x-2">
                <span>In recess (Resumes June 23)</span>
                <span className="h-2 w-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 border-t sm:border-t-0 sm:border-l border-slate-800/85 pt-4 sm:pt-0 sm:pl-4">
            <div className="p-2.5 bg-slate-900 rounded-lg text-emerald-500 border border-slate-800">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">United States Senate</div>
              <div className="text-sm font-semibold text-slate-100 mt-0.5 flex items-center space-x-2">
                <span>Active Floor debates</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main split grid: Recent Accomplishments (Primary) & Watchlist Brief (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Accomplishments Feed (Left 2 Col) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-sans font-bold text-slate-100 flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-amber-500 animate-pulse" />
                Daily Congressional Accomplishments
              </h2>
              <p className="text-xs text-slate-400">What they actually did and passed into law in real-time</p>
            </div>
            
            <button
              onClick={onRefresh}
              id="refresh-grid-dashboard"
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Querying Grid..." : "Refresh Live"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {accomplishments.length === 0 ? (
              <div className="bg-slate-900 border border-slate-850 p-8 rounded-xl text-center text-slate-400 text-sm">
                No legislative accomplishments found. Run a live query refresh.
              </div>
            ) : (
              accomplishments.map((item) => (
                <div
                  key={item.id}
                  id={`bill-card-${item.id.replace(/\s+/g, '-').toLowerCase()}`}
                  className="bg-slate-900 hover:bg-slate-850/80 border border-slate-800/80 hover:border-slate-750 p-5 rounded-xl transition-all shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {item.id}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/80">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                          {item.outcome}
                        </span>
                      </div>
                      
                      <h3 className="text-sm sm:text-base font-sans font-bold text-slate-205 group-hover:text-amber-500 transition-colors mt-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {item.synopsis}
                      </p>

                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850/60 mt-3 text-xs leading-relaxed text-slate-350">
                        <span className="font-semibold text-slate-200 mt-1 block">Real-World Outcome:</span>
                        {item.impact}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                      <button
                        onClick={() => toggleWatchlist(item.id)}
                        id={`watchlist-toggle-${item.id.replace(/\s+/g, '-').toLowerCase()}`}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          watchlist.includes(item.id)
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            : "bg-slate-800/60 border-slate-750 text-slate-500 hover:text-slate-350"
                        }`}
                        title="Save to Watchlist"
                      >
                        <Star className={`h-4 w-4 ${watchlist.includes(item.id) ? "fill-amber-400" : ""}`} />
                      </button>

                      <button
                        onClick={() => onSelectBill(item.id)}
                        id={`summarize-btn-${item.id.replace(/\s+/g, '-').toLowerCase()}`}
                        className="p-1 px-3 bg-slate-800 text-[11px] font-semibold text-slate-300 rounded border border-slate-750 hover:bg-slate-705 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Plain Summary</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-850/45">
                    {item.tags?.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono text-slate-500">
                        #{tag}
                      </span>
                    ))}
                    <div className="ml-auto text-[10px] font-mono text-slate-550">
                      Voted: {item.date}
                    </div>
                  </div>
                </div>
              )))}
          </div>
        </div>

        {/* Watchlist Sidebar (Right 1 Col) */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-sans font-bold text-slate-100 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              Citizen Watchlist
            </h2>
            <p className="text-xs text-slate-400">Your personalized legislative monitor portfolio</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 min-h-[300px]">
            {watchlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-full text-slate-600">
                  <Star className="h-6 w-6" />
                </div>
                <div className="text-xs text-slate-400 max-w-[200px]">
                  No bills tagged yet. Tap the star icon on any bill card to construct your private watch list.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map((id) => (
                  <div
                    key={id}
                    id={`watchlist-item-${id.replace(/\s+/g, '-').toLowerCase()}`}
                    className="p-3 bg-slate-950 hover:bg-slate-850/20 rounded-xl border border-slate-850 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-amber-400">{id}</div>
                      <div className="text-[11px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                        {accomplishments.find(a => a.id === id)?.title || "Tracked pending bill document"}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectBill(id)}
                      className="p-1 px-2.5 bg-slate-900 border border-slate-800 group-hover:border-amber-500/40 text-[10px] font-semibold text-slate-400 group-hover:text-amber-500 rounded transition whitespace-nowrap ml-2 cursor-pointer"
                    >
                      Summarize
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-850 pt-3">
              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-xs text-slate-400 leading-relaxed space-y-2">
                <span className="font-bold text-amber-500 block flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 fill-amber-500" /> Grounded Search Tip
                </span>
                Are you looking for a bill not listed on your dashboard? Use the <strong>Plain-Language Directory</strong> to query any topic, and Gemini will retrieve it!
              </div>
            </div>
          </div>

          {/* Sports ANALOGY: My Politician Squad Team Roster Card */}
          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <h2 className="text-lg font-sans font-bold text-slate-100 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                My Politician Roster
              </h2>
              <p className="text-xs text-slate-400">Follow politicians like a sports team. Spot discrete or dishonest leanings.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              {followedLegislators.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-3 bg-slate-950/45 rounded-xl border border-slate-850 p-4">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-550">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="text-[11px] text-slate-400 max-w-[210px] leading-relaxed">
                    Build your squad! Go to <strong>Civics Scorecards</strong> and click <strong>&quot;Draft to My Team&quot;</strong> to follow your representatives.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {followedLegislators.map((id) => {
                    const leg = legislators.find((l) => l.id === id);
                    if (!leg) return null;

                    const activeLean = leg.keyIssueAlignment?.length > 0 
                      ? leg.keyIssueAlignment.reduce((acc, curr) => acc + curr.alignmentRate, 0) / leg.keyIssueAlignment.length 
                      : 50;

                    // Compute true lean based on alignment average
                    const trueLeanLabel = activeLean > 70 
                      ? "High-Alignment Stance" 
                      : activeLean < 45 
                        ? "Conservative Core Stance" 
                        : "Bipartisan / Swing Leaning";

                    return (
                      <div
                        key={id}
                        id={`roster-item-${id.replace(/\s+/g, '-').toLowerCase()}`}
                        className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3 shadow-md hover:border-slate-750 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {leg.imageUrl ? (
                            <img
                              src={leg.imageUrl}
                              alt={leg.name}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-full object-cover border border-slate-800 bg-slate-900"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                              <Users className="h-4 w-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-200 truncate">{leg.name}</h4>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                leg.party === "D" 
                                  ? "bg-blue-500/10 text-blue-400" 
                                  : leg.party === "R" 
                                    ? "bg-red-500/10 text-red-400" 
                                    : "bg-amber-500/10 text-amber-400"
                              }`}>
                                {leg.party}-{leg.state}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {leg.chamber} • Attendance: {leg.attendanceRate}%
                            </p>
                          </div>
                        </div>

                        {/* Lean Analyzer Box */}
                        <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-850/80 text-[11px] leading-relaxed space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono text-slate-405 font-bold uppercase tracking-wider">Lean Analysis</span>
                            <span className="font-semibold text-amber-500 text-[10px]">{trueLeanLabel}</span>
                          </div>
                          <div className="text-slate-300 font-medium text-[10.5px]">
                            Consistently votes <strong className="text-sky-400">{Math.round(activeLean)}%</strong> aligned with stated policy promises. 
                          </div>
                          
                          {/* Issue splits radar breakdown to expose discretization */}
                          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-850/60 text-[9px] font-mono text-slate-400">
                            {leg.keyIssueAlignment?.slice(0, 2).map((item, key_idx) => (
                              <div key={key_idx} className="truncate">
                                • {item.issue.split(" ")[0]}: <span className="text-slate-200 font-bold">{item.alignmentRate}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Squad action row */}
                        <div className="flex justify-between items-center text-[10px] pt-1">
                          <span className="text-slate-500 font-mono">ID: {leg.id}</span>
                          <button
                            onClick={() => toggleFollowLegislator(leg.id)}
                            className="bg-slate-900 hover:bg-red-500/10 text-red-400 hover:text-red-300 px-2.5 py-1 border border-slate-800 hover:border-red-500/20 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Release Roster
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
