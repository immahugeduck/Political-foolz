import React, { useState, useEffect } from "react";
import { 
  Users, Star, CheckCircle2, XCircle, MinusCircle, 
  Loader2, TrendingUp, ArrowRight, MapPin, ChevronDown 
} from "lucide-react";
import { FollowedFeedItem, LegislatorScorecard } from "../types";
import { getFullStateName, getPartyLabel, getPartyColors } from "../utils/states";

interface FollowedFeedProps {
  followedLegislators: string[];
  toggleFollowLegislator: (id: string) => void;
  onViewPolitician: (id: string) => void;
}

type FeedFilter = "all" | "Yea" | "Nay" | "Not Voting";

function VoteBadge({ vote }: { vote: string }) {
  if (vote === "Yea") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
        <CheckCircle2 className="h-3 w-3" /> YEA
      </span>
    );
  }
  if (vote === "Nay") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
        <XCircle className="h-3 w-3" /> NAY
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
      <MinusCircle className="h-3 w-3" /> ABSENT
    </span>
  );
}

export default function FollowedFeed({
  followedLegislators,
  toggleFollowLegislator,
  onViewPolitician,
}: FollowedFeedProps) {
  const [feedItems, setFeedItems] = useState<FollowedFeedItem[]>([]);
  const [politicians, setPoliticians] = useState<LegislatorScorecard[]>([]);
  const [loading, setLoading] = useState(false);
  const [voteFilter, setVoteFilter] = useState<FeedFilter>("all");
  const [activePoliticianFilter, setActivePoliticianFilter] = useState<string>("all");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (followedLegislators.length === 0) {
      setFeedItems([]);
      return;
    }

    async function fetchFeed() {
      try {
        setLoading(true);
        const ids = followedLegislators.join(",");

        // Fetch feed items
        const feedResp = await fetch(`/api/legislation/followed-feed?ids=${encodeURIComponent(ids)}`);
        const feedJson = await feedResp.json();
        setFeedItems(feedJson.data || []);

        // Fetch politician details for sidebar
        const legsResp = await fetch("/api/legislation/legislators");
        const legsJson = await legsResp.json();
        const allLegs: LegislatorScorecard[] = legsJson.data || [];
        setPoliticians(allLegs.filter(l => followedLegislators.includes(l.id)));
      } catch (err) {
        console.error("Failed to load followed feed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, [followedLegislators]);

  const filteredItems = feedItems.filter(item => {
    const matchesVote = voteFilter === "all" || item.vote === voteFilter;
    const matchesPolitician = activePoliticianFilter === "all" || item.legislatorId === activePoliticianFilter;
    return matchesVote && matchesPolitician;
  });

  const INITIAL_VISIBLE = 10;
  const visibleItems = showMore ? filteredItems : filteredItems.slice(0, INITIAL_VISIBLE);

  // Group items by date for timeline display
  const grouped: Record<string, FollowedFeedItem[]> = {};
  for (const item of visibleItems) {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (followedLegislators.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            My Politician Feed
          </h2>
          <p className="text-xs text-slate-400 mt-1">Vote activity from politicians you follow</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-slate-800 rounded-full border border-slate-700">
            <Users className="h-8 w-8 text-slate-500" />
          </div>
          <div className="max-w-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-200">Your feed is empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Follow politicians in the <strong>Civics Scorecards</strong> directory to see their votes, bill activity, and decisions here.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
            <Star className="h-3.5 w-3.5" />
            Click "Draft to My Team" or "Follow Politician" on any profile
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            My Politician Feed
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Vote activity from <strong className="text-slate-300">{followedLegislators.length}</strong> politician{followedLegislators.length !== 1 ? "s" : ""} you follow
          </p>
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          {feedItems.length} total votes on record
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar: Who you follow */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-700 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Politicians You Follow ({followedLegislators.length})
            </div>
            <div className="divide-y divide-slate-800">
              <button
                onClick={() => setActivePoliticianFilter("all")}
                className={`w-full text-left px-4 py-3 flex items-center gap-2 text-xs transition cursor-pointer ${
                  activePoliticianFilter === "all" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span className="font-semibold">All Politicians</span>
              </button>
              {politicians.map(pol => {
                const pc = getPartyColors(pol.party);
                const isActive = activePoliticianFilter === pol.id;
                return (
                  <div key={pol.id} className={`transition ${isActive ? "bg-slate-800" : "hover:bg-slate-800/50"}`}>
                    <button
                      onClick={() => setActivePoliticianFilter(isActive ? "all" : pol.id)}
                      className="w-full text-left px-4 py-3 flex items-center gap-2.5 cursor-pointer"
                    >
                      {pol.imageUrl ? (
                        <img
                          src={pol.imageUrl}
                          alt={pol.name}
                          referrerPolicy="no-referrer"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          className="h-8 w-8 rounded-full object-cover border border-slate-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-bold truncate ${isActive ? "text-amber-400" : "text-slate-300"}`}>
                          {pol.name}
                        </p>
                        <p className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                          <span className={`font-bold ${pc.text}`}>{pol.party}</span>
                          <span>·</span>
                          <span>{pol.state}</span>
                          <span>·</span>
                          <span>{pol.chamber === "Senate" ? "Sen." : "Rep."}</span>
                        </p>
                      </div>
                    </button>
                    <div className="px-4 pb-2 flex gap-2">
                      <button
                        onClick={() => onViewPolitician(pol.id)}
                        className="flex items-center gap-1 text-[9px] font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer"
                      >
                        Profile <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                      <button
                        onClick={() => toggleFollowLegislator(pol.id)}
                        className="flex items-center gap-1 text-[9px] font-bold text-red-400 hover:text-red-300 transition cursor-pointer"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vote type filter */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 space-y-2">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Filter by Vote</div>
            <div className="space-y-1.5">
              {(["all", "Yea", "Nay", "Not Voting"] as FeedFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setVoteFilter(f)}
                  className={`w-full text-left px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg border transition cursor-pointer ${
                    voteFilter === f
                      ? f === "Yea" ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
                        : f === "Nay" ? "bg-red-600/20 border-red-500/30 text-red-400"
                        : f === "Not Voting" ? "bg-slate-600/40 border-slate-500/30 text-slate-300"
                        : "bg-slate-800 border-slate-700 text-amber-400"
                      : "bg-transparent border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-400"
                  }`}
                >
                  {f === "all" ? `All Votes (${feedItems.length})` : f === "Yea" ? `Yea (${feedItems.filter(i => i.vote === "Yea").length})` : f === "Nay" ? `Nay (${feedItems.filter(i => i.vote === "Nay").length})` : `Absent (${feedItems.filter(i => i.vote === "Not Voting").length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feed timeline */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 space-x-3 bg-slate-900 rounded-xl border border-slate-800">
              <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
              <span className="text-xs font-mono text-slate-400">Loading activity feed...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-xs">
              No votes match the current filter settings.
            </div>
          ) : (
            <>
              {sortedDates.map(date => (
                <div key={date} className="space-y-2">
                  {/* Date header */}
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] font-mono font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 uppercase tracking-wider">
                      {new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>

                  {/* Feed entries for that date */}
                  {grouped[date].map((item, idx) => {
                    const pc = getPartyColors(item.legislatorParty);
                    return (
                      <div
                        key={idx}
                        className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start gap-3">
                          {/* Politician avatar */}
                          {item.legislatorImageUrl ? (
                            <img
                              src={item.legislatorImageUrl}
                              alt={item.legislatorName}
                              referrerPolicy="no-referrer"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                              className="h-10 w-10 rounded-full object-cover border border-slate-700 flex-shrink-0 mt-0.5"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Users className="h-4 w-4 text-slate-500" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Who + party */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => onViewPolitician(item.legislatorId)}
                                className="text-xs font-bold text-slate-200 hover:text-amber-400 transition cursor-pointer"
                              >
                                {item.legislatorName}
                              </button>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${pc.bg} ${pc.text} ${pc.border}`}>
                                {item.legislatorParty}-{item.legislatorState}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{item.legislatorChamber}</span>
                            </div>

                            {/* Bill + vote */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                    {item.billId}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-slate-300">{item.billTitle}</p>
                              </div>
                              <VoteBadge vote={item.vote} />
                            </div>

                            {/* Impact */}
                            <p className="text-[11px] text-slate-500 leading-relaxed">{item.impact}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {filteredItems.length > INITIAL_VISIBLE && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-400 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
                  {showMore ? "Show Less" : `Show ${filteredItems.length - INITIAL_VISIBLE} More Votes`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
