import React from "react";
import { BarChart3, CheckCircle2, XCircle, Info, RefreshCw, AlertTriangle } from "lucide-react";
import { RollCallVote } from "../types";

interface RollCallVotesViewProps {
  votes: RollCallVote[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function RollCallVotesView({ votes, onRefresh, isLoading }: RollCallVotesViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-double border-[--color-ink] pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="np-kicker text-[--color-headline] mb-1 flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3" />
            Vote Record
          </div>
          <h2 className="text-2xl font-headline font-bold text-[--color-ink] leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Congressional Roll Call Votes
          </h2>
          <p className="text-xs font-body text-[--color-ink-muted] mt-1">Detailed voting tallies and bipartisan split rates for June 2026</p>
        </div>
        <button
          onClick={onRefresh}
          id="refresh-rolls-votes"
          disabled={isLoading}
          className="self-start px-3.5 py-1.5 bg-[--color-ink] hover:bg-[--color-headline] disabled:opacity-50 text-[--color-paper] text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Reading Tally..." : "Refresh Tallies"}
        </button>
      </div>

      {/* Grid of roll calls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {votes.map((vote, idx) => {
          const totalVotes = vote.yeas + vote.nays;
          const yeaPct = totalVotes > 0 ? Math.round((vote.yeas / totalVotes) * 100) : 0;
          const nayPct = totalVotes > 0 ? Math.round((vote.nays / totalVotes) * 100) : 0;
          const isPassed = vote.result.toLowerCase().includes("passed") || vote.result.toLowerCase().includes("agreed");

          return (
            <div
              key={idx}
              id={`vote-card-${vote.billId.replace(/\s+/g, '-').toLowerCase()}`}
              className="bg-[--color-column-bg] border border-[--color-rule] overflow-hidden flex flex-col justify-between hover:border-[--color-rule-dark] transition-colors"
            >
              {/* Card top */}
              <div className="px-4 py-3 bg-[--color-paper] border-b border-[--color-rule] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[--color-ink] text-[--color-paper]">
                    {vote.billId}
                  </span>
                  <span className="np-kicker text-[--color-ink-faint]">
                    Roll Call {vote.rollCallNum}
                  </span>
                </div>
                <div>
                  {isPassed ? (
                    <span className="np-kicker text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> PASSED
                    </span>
                  ) : (
                    <span className="np-kicker text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> REJECTED
                    </span>
                  )}
                </div>
                    {vote.billTitle}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 uppercase">
                    Chamber Voting: <span className="font-semibold text-slate-700">{vote.votedChamber}</span> | Voted On: <span className="font-semibold text-slate-705">{vote.date}</span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold flex justify-between">
                    <span>YEA: {vote.yeas} ({yeaPct}%)</span>
                    <span>NAY: {vote.nays} ({nayPct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${yeaPct}%` }}
                    ></div>
                    <div
                      className="bg-red-500 h-full transition-all duration-500"
                      style={{ width: `${nayPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Party Alignment Notes */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide">Party Breakdown & Alignment</h4>
                    <p className="text-xs text-slate-700 leading-relaxed mt-0.5 font-medium">
                      {vote.partyBreakdown}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom section warning if disputed */}
              {vote.isHighlyDisputed && (
                <div className="px-5 py-2.5 bg-amber-50 border-t border-amber-100 text-[11px] text-amber-800 flex items-center space-x-1.5 font-medium uppercase tracking-wide">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                  <span>High Bipartisan Friction / Polarized alignment</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
