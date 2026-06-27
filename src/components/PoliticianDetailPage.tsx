import React, { useState, useEffect } from "react";
import {
  ArrowLeft, User, Star, Clock, Percent, BookOpen, Activity,
  CheckCircle2, XCircle, MinusCircle, MapPin, Users, Database,
  ChevronDown, ChevronUp, ExternalLink, Loader2, TrendingUp
} from "lucide-react";
import { LegislatorScorecard } from "../types";
import { getFullStateName, getPartyLabel, getPartyColors } from "../utils/states";

interface PoliticianDetailPageProps {
  politicianId: string;
  onBack: () => void;
  followedLegislators: string[];
  toggleFollowLegislator: (id: string) => void;
}

type VoteFilter = "all" | "Yea" | "Nay" | "Not Voting";

export default function PoliticianDetailPage({
  politicianId,
  onBack,
  followedLegislators,
  toggleFollowLegislator,
}: PoliticianDetailPageProps) {
  const [politician, setPolitician] = useState<LegislatorScorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [voteFilter, setVoteFilter] = useState<VoteFilter>("all");
  const [showAttendanceDetail, setShowAttendanceDetail] = useState(false);
  const [dataSource, setDataSource] = useState<string>("live_csv_repo");

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const resp = await fetch(`/api/legislation/legislators/${encodeURIComponent(politicianId)}`);
        if (!resp.ok) throw new Error("Not found");
        const json = await resp.json();
        setPolitician(json.data);
        setDataSource(json.source || "live_csv_repo");
      } catch (err) {
        console.error("Failed to load politician detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [politicianId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        <span className="text-xs font-mono text-slate-400">Loading politician profile...</span>
      </div>
    );
  }

  if (!politician) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-400 text-sm">Politician record not found.</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700 transition">
          ← Back to Directory
        </button>
      </div>
    );
  }

  const isFollowed = followedLegislators.includes(politician.id);
  const partyColors = getPartyColors(politician.party);

  const filteredVotes = politician.votingHistory.filter(v => {
    if (voteFilter === "all") return true;
    return v.vote === voteFilter;
  });

  const voteYeaCount = politician.votingHistory.filter(v => v.vote === "Yea").length;
  const voteNayCount = politician.votingHistory.filter(v => v.vote === "Nay").length;
  const voteAbsentCount = politician.votingHistory.filter(v => v.vote === "Not Voting").length;

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold font-mono transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Civics Scorecards
      </button>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {politician.imageUrl ? (
                <img
                  src={politician.imageUrl}
                  alt={politician.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  className="h-20 w-20 rounded-full object-cover border-2 border-slate-600 shadow-md flex-shrink-0"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center flex-shrink-0">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-sans font-bold text-slate-100">{politician.name}</h1>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${partyColors.bg} ${partyColors.text} ${partyColors.border}`}>
                    {getPartyLabel(politician.party)} ({politician.party}-{politician.state})
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-400" />
                    {getFullStateName(politician.state)} ({politician.state})
                    {politician.district && ` — District ${politician.district}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-blue-400" />
                    {politician.chamber}
                  </span>
                </div>
                {politician.termStart && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    Term: {politician.termStart} → {politician.termEnd || "Present"}
                  </div>
                )}
              </div>
            </div>

            {/* Follow button */}
            <button
              onClick={() => toggleFollowLegislator(politician.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs border transition-all cursor-pointer ${
                isFollowed
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
              }`}
            >
              <Star className={`h-4 w-4 ${isFollowed ? "fill-amber-400 text-amber-400" : ""}`} />
              {isFollowed ? "Following ✓" : "Follow Politician"}
            </button>
          </div>
        </div>

        {/* Stat Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
          <div className="p-5 text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</div>
            <div className={`text-2xl font-sans font-black ${politician.attendanceRate >= 95 ? "text-emerald-600" : politician.attendanceRate >= 88 ? "text-amber-600" : "text-red-600"}`}>
              {politician.attendanceRate}%
            </div>
            <div className="text-[10px] text-slate-400">Floor votes attended</div>
          </div>
          <div className="p-5 text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Bills Sponsored</div>
            <div className="text-2xl font-sans font-black text-slate-800">{politician.billsSponsored}</div>
            <div className="text-[10px] text-slate-400">Primary sponsor</div>
          </div>
          <div className="p-5 text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Co-Sponsored</div>
            <div className="text-2xl font-sans font-black text-slate-800">{politician.billsCosponsored}</div>
            <div className="text-[10px] text-slate-400">Supported bills</div>
          </div>
          <div className="p-5 text-center space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Party Alignment</div>
            <div className={`text-2xl font-sans font-black ${(politician.partyLineAlignment ?? 0) >= 80 ? "text-blue-600" : "text-amber-600"}`}>
              {politician.partyLineAlignment ?? "—"}%
            </div>
            <div className="text-[10px] text-slate-400">Votes w/ party line</div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Vote History (3 cols) */}
        <div className="lg:col-span-3 space-y-4">

          {/* Vote summary chips */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-sans font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-500" />
                Vote Record ({politician.votingHistory.length} votes on file)
              </h3>
              {/* Vote type filter pills */}
              <div className="flex gap-1.5">
                {(["all", "Yea", "Nay", "Not Voting"] as VoteFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setVoteFilter(f)}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md border transition cursor-pointer ${
                      voteFilter === f
                        ? f === "Yea" ? "bg-emerald-600 text-white border-emerald-600"
                          : f === "Nay" ? "bg-red-600 text-white border-red-600"
                          : f === "Not Voting" ? "bg-slate-500 text-white border-slate-500"
                          : "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {f === "all" ? `ALL (${politician.votingHistory.length})` : f === "Yea" ? `YEA (${voteYeaCount})` : f === "Nay" ? `NAY (${voteNayCount})` : `ABSENT (${voteAbsentCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Vote timeline */}
            <div className="space-y-3">
              {filteredVotes.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">No votes matching this filter.</div>
              ) : (
                filteredVotes.map((vh, idx) => {
                  const isYea = vh.vote === "Yea";
                  const isNay = vh.vote === "Nay";
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-l-4 bg-slate-50 ${
                        isYea ? "border-l-emerald-500" : isNay ? "border-l-red-500" : "border-l-slate-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                              {vh.billId}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{vh.date}</span>
                          </div>
                          <p className="text-xs font-sans font-bold text-slate-800">{vh.billTitle}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{vh.impact}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {isYea ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                              <CheckCircle2 className="h-3.5 w-3.5" /> YEA
                            </span>
                          ) : isNay ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">
                              <XCircle className="h-3.5 w-3.5" /> NAY
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
                              <MinusCircle className="h-3.5 w-3.5" /> ABSENT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Attendance Trend Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <button
              onClick={() => setShowAttendanceDetail(!showAttendanceDetail)}
              className="w-full flex items-center justify-between text-sm font-sans font-bold text-slate-900 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Attendance Trend (2021–2026)
              </span>
              {showAttendanceDetail ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="h-32 w-full relative">
                <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="detailChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="10" y1="10" x2="290" y2="10" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="10" y1="45" x2="290" y2="45" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="10" y1="80" x2="290" y2="80" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <text x="2" y="15" fill="#94a3b8" fontSize="6" fontFamily="monospace">100%</text>
                  <text x="4" y="50" fill="#94a3b8" fontSize="6" fontFamily="monospace">95%</text>
                  <text x="4" y="85" fill="#94a3b8" fontSize="6" fontFamily="monospace">90%</text>
                  {(() => {
                    const data = politician.attendanceTrend;
                    if (!data || data.length < 2) return null;
                    const pts = data.map((d, i) => {
                      const x = 10 + (i * (280 / (data.length - 1)));
                      const pct = Math.max(0, Math.min(1, (d.rate - 90) / 10));
                      const y = 80 - pct * 70;
                      return { x, y, rate: d.rate, year: d.year };
                    });
                    const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                    const areaPath = `${linePath} L ${pts[pts.length - 1].x} 80 L ${pts[0].x} 80 Z`;
                    return (
                      <>
                        <path d={areaPath} fill="url(#detailChartGradient)" />
                        <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                        {pts.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
                            <text x={p.x - 5} y={p.y - 6} fill="#1e293b" fontSize="7" fontWeight="bold" fontFamily="monospace">{p.rate}%</text>
                            <text x={p.x - 7} y="94" fill="#64748b" fontSize="7" fontFamily="monospace">{p.year}</text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {showAttendanceDetail && (
              <div className="grid grid-cols-3 gap-2">
                {politician.attendanceTrend.map(d => (
                  <div key={d.year} className="text-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] font-mono text-slate-400">{d.year}</div>
                    <div className={`text-sm font-bold font-mono ${d.rate >= 95 ? "text-emerald-600" : d.rate >= 90 ? "text-amber-600" : "text-red-600"}`}>{d.rate}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Issue Alignment + Comparison (2 cols) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Issue Alignment */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-sans font-bold text-slate-900 flex items-center gap-2">
              <Percent className="h-4 w-4 text-purple-500" />
              Issue Alignment Scores
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              How often this politician votes in line with their stated positions on key policy areas.
            </p>
            <div className="space-y-3.5">
              {politician.keyIssueAlignment.map((align, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{align.issue}</span>
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[10px]">
                      {align.alignmentRate}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        align.alignmentRate >= 80 ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                          : align.alignmentRate >= 60 ? "bg-gradient-to-r from-amber-400 to-orange-500"
                          : "bg-gradient-to-r from-red-400 to-red-600"
                      }`}
                      style={{ width: `${align.alignmentRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Party vs. Delegation Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-sans font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Party & Delegation Comparison
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Vote alignment vs. their own party caucus and their state's congressional delegation.
            </p>

            <div className="space-y-4">
              {/* Party line */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    vs. {getPartyLabel(politician.party)} Party Line
                  </span>
                  <span className={`font-mono font-bold text-[11px] ${
                    (politician.partyLineAlignment ?? 0) >= 80 ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {politician.partyLineAlignment ?? "—"}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                    style={{ width: `${politician.partyLineAlignment ?? 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {(politician.partyLineAlignment ?? 0) >= 85
                    ? "Strong party loyalty — votes with caucus on most issues."
                    : (politician.partyLineAlignment ?? 0) >= 70
                      ? "Moderate party alignment — occasional cross-aisle votes."
                      : "Independent streak — notable departures from party caucus."
                  }
                </p>
              </div>

              {/* State delegation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    vs. {politician.state} Delegation
                  </span>
                  <span className={`font-mono font-bold text-[11px] ${
                    (politician.delegationAlignment ?? 0) >= 75 ? "text-blue-600" : "text-amber-600"
                  }`}>
                    {politician.delegationAlignment ?? "—"}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${politician.delegationAlignment ?? 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {(politician.delegationAlignment ?? 0) >= 80
                    ? "Cohesive with state delegation — unified state block voting."
                    : (politician.delegationAlignment ?? 0) >= 65
                      ? "Moderate state alignment — some divergence from local priorities."
                      : "Independent from state delegation — distinct voting pattern."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Data Source Attribution */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-slate-500" />
              Data Sources & Attribution
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
              <div className="flex items-start gap-1.5">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>
                  <strong>Legislator roster:</strong>{" "}
                  <a
                    href="https://unitedstates.github.io/congress-legislators/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    unitedstates/congress-legislators <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-slate-400 mt-0.5">•</span>
                <span><strong>Vote data:</strong> Deterministic model (GovTrack/Congress.gov integration coming)</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-slate-400 mt-0.5">•</span>
                <span><strong>Source mode:</strong>{" "}
                  <span className={`font-mono font-bold ${dataSource === "live_csv_repo" ? "text-emerald-600" : "text-amber-600"}`}>
                    {dataSource === "live_csv_repo" ? "Live CSV Feed" : "Offline Fallback"}
                  </span>
                </span>
              </div>
              {politician.lastUpdated && (
                <div className="flex items-start gap-1.5">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span><strong>Last updated:</strong> {politician.lastUpdated}</span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 italic">
              Attendance rates and issue alignment scores are model-generated approximations. Official vote records are available on{" "}
              <a href="https://congress.gov" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                Congress.gov
              </a>
              {" "}and{" "}
              <a href="https://govtrack.us" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                GovTrack.us
              </a>.
            </div>
          </div>

          {/* Follow CTA */}
          {!isFollowed && (
            <div className="bg-amber-500/5 rounded-xl border border-amber-500/20 p-4 space-y-2">
              <p className="text-xs font-semibold text-amber-900 leading-relaxed">
                Follow {politician.name.split(" ").slice(-1)[0]} to see their votes in your personal feed.
              </p>
              <button
                onClick={() => toggleFollowLegislator(politician.id)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                <Star className="h-3.5 w-3.5" />
                Follow Politician
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
