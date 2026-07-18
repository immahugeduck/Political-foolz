import React from "react";
import { CalendarDays, Clock, RefreshCw, Layers, Bell } from "lucide-react";
import { LegislativeSession } from "../types";

interface LegislativeSessionsProps {
  sessions: LegislativeSession[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function LegislativeSessions({ sessions, onRefresh, isLoading }: LegislativeSessionsProps) {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-double border-[--color-ink] pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="np-kicker text-[--color-headline] mb-1 flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" />
            Legislative Calendar
          </div>
          <h2 className="text-2xl font-headline font-bold text-[--color-ink] leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Upcoming Congressional Schedule
          </h2>
          <p className="text-xs font-body text-[--color-ink-muted] mt-1">Scheduled chamber floor debates and committee hearings (119th Congress, June 2026)</p>
        </div>
        <button
          onClick={onRefresh}
          id="refresh-calendar-schedules"
          disabled={isLoading}
          className="self-start px-3.5 py-1.5 bg-[--color-ink] hover:bg-[--color-headline] disabled:opacity-50 text-[--color-paper] text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Synchronizing..." : "Refresh Schedule"}
        </button>
      </div>

      {/* Calendar List */}
      <div className="space-y-4">
        {sessions.map((session, idx) => {
          const isHouse = session.chamber.toLowerCase() === "house";
          const isSenate = session.chamber.toLowerCase() === "senate";
          const isHigh = session.importance.toLowerCase() === "high";

          return (
            <div
              key={idx}
              className="bg-[--color-column-bg] border border-[--color-rule] hover:border-[--color-rule-dark] p-5 transition-colors"
              id={`session-card-${idx}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`np-kicker border px-2 py-0.5 ${
                      isHouse
                        ? "text-blue-800 border-blue-200 bg-blue-50"
                        : isSenate
                        ? "text-[--color-headline-blue] border-[--color-headline-blue]/30 bg-[--color-headline-blue]/10"
                        : "text-emerald-800 border-emerald-200 bg-emerald-50"
                    }`}>
                      {session.chamber.toUpperCase()}
                    </span>
                    <span className="np-kicker text-[--color-ink-muted] border border-[--color-rule] bg-[--color-paper] px-2 py-0.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />{session.time}
                    </span>
                    <span className="np-kicker text-[--color-ink-muted] border border-[--color-rule] bg-[--color-paper] px-2 py-0.5">
                      {session.status}
                    </span>
                    {isHigh && (
                      <span className="np-kicker text-[--color-headline] border border-[--color-headline]/25 bg-[--color-headline]/10 px-2 py-0.5 flex items-center gap-1">
                        <Layers className="h-2.5 w-2.5" /> HIGH IMPORTANCE
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-headline font-bold text-[--color-ink] leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {session.topic}
                    </h3>
                    <p className="text-xs font-body text-[--color-ink-muted] mt-2 leading-relaxed">
                      {session.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center md:items-end justify-between md:flex-col gap-3 border-t md:border-t-0 border-[--color-rule] pt-3 md:pt-0 flex-shrink-0">
                  <div className="md:text-right">
                    <div className="np-kicker text-[--color-ink-faint]">Scheduled date</div>
                    <div className="text-sm font-mono font-bold text-[--color-ink] mt-0.5">{session.date}</div>
                  </div>
                  <button
                    onClick={() => alert(`Alert requested for: ${session.topic}. You will be notified when live feeds start.`)}
                    className="px-3 py-1.5 bg-[--color-paper] border border-[--color-rule] hover:border-[--color-ink] text-[--color-ink-secondary] text-xs font-sans font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    Watch Live
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


interface LegislativeSessionsProps {
  sessions: LegislativeSession[];
  onRefresh: () => void;
  isLoading: boolean;
}

export default function LegislativeSessions({ sessions, onRefresh, isLoading }: LegislativeSessionsProps) {

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-amber-500" />
            Upcoming Congressional Calendar
          </h2>
          <p className="text-xs text-slate-400">Scheduled chamber floor debates and committee hearings for the 119th Congress (June 2026)</p>
        </div>

        <button
          onClick={onRefresh}
          id="refresh-calendar-schedules"
          disabled={isLoading}
          className="self-start sm:self-center px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-205 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Synchronizing Gavel..." : "Refresh Schedule"}
        </button>
      </div>

      {/* Calendar List */}
      <div className="grid grid-cols-1 gap-4">
        {sessions.map((session, idx) => {
          const isHouse = session.chamber.toLowerCase() === "house";
          const isSenate = session.chamber.toLowerCase() === "senate";
          const isHigh = session.importance.toLowerCase() === "high";

          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-slate-750 p-5 rounded-2xl transition-all shadow-sm"
              id={`session-card-${idx}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  {/* Category Pill Line */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        isHouse
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : isSenate
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      }`}
                    >
                      {session.chamber.toUpperCase()}
                    </span>

                    <span className="text-[10px] font-mono bg-slate-850 text-slate-350 px-2.5 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.time}
                    </span>

                    <span className="text-[10px] font-mono bg-slate-850 text-slate-350 px-2.5 py-0.5 rounded border border-slate-800">
                      {session.status}
                    </span>

                    {isHigh && (
                      <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/15 flex items-center gap-1">
                        <Layers className="h-3 w-3" /> HIGH IMPORTANCE
                      </span>
                    )}
                  </div>

                  {/* Topic and Details heading */}
                  <div>
                    <h3 className="text-base font-sans font-bold text-slate-100">
                      {session.topic}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {session.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center md:items-end justify-between md:flex-col gap-2 border-t md:border-t-0 border-slate-850 pt-3 md:pt-0">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Debated date</div>
                    <div className="text-sm font-bold text-slate-300 mt-0.5">{session.date}</div>
                  </div>
                  
                  <button
                    onClick={() => alert(`Alert requested for: ${session.topic}. CapitolTrack will ping you when live feeds start.`)}
                    className="p-1.5 px-3 bg-slate-800/80 border border-slate-750 hover:bg-slate-700/80 hover:text-amber-400 text-slate-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>Watch live notify</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
