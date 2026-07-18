import React, { useState, useEffect } from "react";
import { Bell, User, ArrowUpRight, Check, MapPin, Loader2 } from "lucide-react";
import { UpcomingVoteAlert, LegislatorScorecard } from "../types";

export default function UpcomingVoteAlerts() {
  const [alerts, setAlerts] = useState<UpcomingVoteAlert[]>([]);
  const [legislators, setLegislators] = useState<LegislatorScorecard[]>([]);
  const [selectedLegId, setSelectedLegId] = useState<string>("leg-1");
  const [loading, setLoading] = useState<boolean>(true);
  const [userSchedules, setUserSchedules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchAlertsAndLegs() {
      try {
        setLoading(true);
        const resAlerts = await fetch("/api/legislation/alerts");
        const alertsJson = await resAlerts.json();
        setAlerts(alertsJson.data);

        const resLegs = await fetch("/api/legislation/legislators");
        const legsJson = await resLegs.json();
        setLegislators(legsJson.data || []);
        if (legsJson.data && legsJson.data.length > 0) {
          const hasDefault = legsJson.data.some((l: any) => l.id === "leg-1");
          if (!hasDefault) setSelectedLegId(legsJson.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load alerts & legislators:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlertsAndLegs();
  }, []);

  const selectedLeg = legislators.find((l) => l.id === selectedLegId);

  const toggleAlertNotify = (id: string) => {
    setUserSchedules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-double border-[--color-ink] pb-3">
        <div className="np-kicker text-[--color-headline] mb-1 flex items-center gap-1.5">
          <Bell className="h-3 w-3" />
          Vote Watch
        </div>
        <h2 className="text-2xl font-headline font-bold text-[--color-ink] leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Upcoming Key Votes & Predictor
        </h2>
        <p className="text-xs font-body text-[--color-ink-muted] mt-1">
          Track scheduled debates and view machine-grounded predictive analysis for pending legislation.
        </p>
        <div className="np-rule-thin mt-2" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3 border border-[--color-rule] bg-[--color-column-bg]">
          <Loader2 className="h-7 w-7 text-[--color-headline-gold] animate-spin" />
          <span className="text-xs font-mono text-[--color-ink-muted] italic">Querying upcoming docket files...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Active Docket Stream */}
          <div className="lg:col-span-8 space-y-4">
            <div className="np-kicker text-[--color-ink-faint]">Active Scheduled Floor Votes</div>

            {alerts.map((alert) => {
              const predictionObj = alert.predictedVotes.find(v => v.legislatorId === selectedLegId);
              const isAlertOn = userSchedules[alert.id] || false;

              return (
                <div 
                  key={alert.id}
                  id={`alert-card-${alert.billId.replace(/\s+/g, '-').toLowerCase()}`}
                  className="bg-[--color-column-bg] border border-[--color-rule] hover:border-[--color-rule-dark] overflow-hidden transition-colors"
                >
                  {/* Top line */}
                  <div className="px-4 py-3 bg-[--color-paper] border-b border-[--color-rule] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[--color-ink] text-[--color-paper]">
                        {alert.billId}
                      </span>
                      <span className="np-kicker text-[--color-ink-muted]">
                        {alert.scheduledTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.importance === "Critical" ? (
                        <span className="np-kicker text-[--color-headline] border border-[--color-headline]/25 bg-[--color-headline]/10 px-2 py-0.5">
                          CRITICAL
                        </span>
                      ) : alert.importance === "High" ? (
                        <span className="np-kicker text-[--color-headline-gold] border border-[--color-headline-gold]/25 bg-[--color-headline-gold]/10 px-2 py-0.5">
                          HIGH PRIORITY
                        </span>
                      ) : (
                        <span className="np-kicker text-[--color-ink-muted] border border-[--color-rule] bg-[--color-paper] px-2 py-0.5">
                          NORMAL DOCKET
                        </span>
                      )}

                      <button
                        onClick={() => toggleAlertNotify(alert.id)}
                        className={`text-xs px-3 py-1 font-sans font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isAlertOn 
                            ? "bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800" 
                            : "bg-[--color-column-bg] text-[--color-ink-secondary] border-[--color-rule] hover:border-[--color-ink]"
                        }`}
                      >
                        <Bell className="h-3 w-3" />
                        {isAlertOn ? "Alert Armed" : "Notify Me"}
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="font-headline font-bold text-sm text-[--color-ink] leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {alert.billTitle}
                      </h4>
                      <p className="text-xs font-body text-[--color-ink-secondary] leading-relaxed mt-2 p-3 bg-[--color-paper] border border-[--color-rule] border-l-4 border-l-[--color-headline-gold] italic">
                        &quot;{alert.plainSummary}&quot;
                      </p>
                    </div>

                    {/* Prediction */}
                    <div className="bg-[--color-ink] text-[--color-paper] p-4 space-y-3 border border-[--color-rule-dark]">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[--color-headline-gold]" />
                          <span className="np-kicker text-[--color-ink-faint]">
                            {selectedLeg?.name || "Representative"}&apos;s Prediction
                          </span>
                        </div>
                        {predictionObj && (
                          <span className={`np-kicker border px-2 py-0.5 ${
                            predictionObj.prediction.includes("Yea") 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}>
                            {predictionObj.prediction} · {predictionObj.confidence}%
                          </span>
                        )}
                      </div>

                      {predictionObj ? (
                        <div className="space-y-1.5">
                          <p className="text-xs font-body text-[--color-ink-faint] leading-relaxed">
                            {predictionObj.reasoning}
                          </p>
                          <div className="np-kicker text-[--color-ink-faint]/60">
                            Grounded via historical sponsorships & statement registries
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-body text-[--color-ink-faint] leading-relaxed">
                          No forecast available for this legislator. Select another on the right panel.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Source link */}
                  <div className="px-4 py-2.5 bg-[--color-paper] border-t border-[--color-rule] flex items-center justify-between">
                    <span className="np-kicker text-[--color-ink-faint]">Official Source: Congress.gov</span>
                    <a
                      href={alert.billUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-sans font-bold text-[--color-headline-blue] hover:text-[--color-headline] hover:underline cursor-pointer"
                    >
                      Full text on Congress.gov
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Representative Selector */}
          <div className="lg:col-span-4 border border-[--color-rule] bg-[--color-column-bg] p-5 space-y-5">
            <div>
              <div className="np-kicker text-[--color-headline] mb-1 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Representative Focus
              </div>
              <p className="text-xs font-body text-[--color-ink-muted] leading-relaxed">
                Select a representative to run real-time predictions across all scheduled dockets:
              </p>
            </div>

            <div className="space-y-2">
              {legislators.map((leg) => {
                const isSelected = leg.id === selectedLegId;
                return (
                  <button
                    key={leg.id}
                    onClick={() => setSelectedLegId(leg.id)}
                    className={`w-full text-left p-3 border flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected 
                        ? "bg-[--color-ink] text-[--color-paper] border-[--color-ink]" 
                        : "bg-[--color-paper] hover:bg-[--color-paper-dark] border-[--color-rule] text-[--color-ink]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-sans font-bold truncate">{leg.name}</div>
                      <div className={`np-kicker mt-0.5 ${isSelected ? "text-[--color-ink-faint]" : "text-[--color-ink-muted]"}`}>
                        {leg.party}-{leg.state} · {leg.attendanceRate}%
                      </div>
                    </div>
                    {isSelected && (
                      <span className="h-4 w-4 bg-[--color-headline-gold] text-[--color-ink] flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedLeg && (
              <div className="p-4 bg-[--color-paper] border border-[--color-rule] space-y-2">
                <div className="np-kicker text-[--color-ink-faint]">Active Focus Profile</div>
                <div className="flex items-center gap-3">
                  {selectedLeg.imageUrl && (
                    <img 
                      src={selectedLeg.imageUrl} 
                      alt={selectedLeg.name} 
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 object-cover border border-[--color-rule]"
                    />
                  )}
                  <div>
                    <span className="text-xs font-headline font-bold text-[--color-ink] block" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{selectedLeg.name}</span>
                    <span className="np-kicker text-[--color-ink-muted]">{selectedLeg.chamber}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}


export default function UpcomingVoteAlerts() {
  const [alerts, setAlerts] = useState<UpcomingVoteAlert[]>([]);
  const [legislators, setLegislators] = useState<LegislatorScorecard[]>([]);
  const [selectedLegId, setSelectedLegId] = useState<string>("leg-1"); // defaulted to elizabeth warren
  const [loading, setLoading] = useState<boolean>(true);
  const [userStateInput, setUserStateInput] = useState<string>("");
  const [userSchedules, setUserSchedules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchAlertsAndLegs() {
      try {
        setLoading(true);
        // Load Alerts
        const resAlerts = await fetch("/api/legislation/alerts");
        const alertsJson = await resAlerts.json();
        setAlerts(alertsJson.data);

        // Load Legislators to support selectors
        const resLegs = await fetch("/api/legislation/legislators");
        const legsJson = await resLegs.json();
        setLegislators(legsJson.data || []);
        if (legsJson.data && legsJson.data.length > 0) {
          const hasDefault = legsJson.data.some((l: any) => l.id === "leg-1");
          if (!hasDefault) {
            setSelectedLegId(legsJson.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load alerts & legislators:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlertsAndLegs();
  }, []);

  const selectedLeg = legislators.find((l) => l.id === selectedLegId);

  const toggleAlertNotify = (id: string) => {
    setUserSchedules((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Informative Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Bell className="h-32 w-32" />
        </div>
        <div className="relative max-w-xl space-y-2">
          <h2 className="text-xl font-sans font-bold text-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500 animate-pulse" />
            Upcoming Key Legislation Votes & Predictor
          </h2>
          <p className="text-slate-455 text-xs leading-relaxed">
            Stay ahead of the floor. Track scheduled debates, receive real-time scheduling alert flashes, and view machine-grounded predictive analysis matching major representatives’ alignments on pending acts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
          <span className="text-xs font-mono text-slate-500">Querying live House and Senate upcoming docket files...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Active Docket Stream (Left 8 columns) */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest px-1">
              Active Key Scheduled Floor Votes
            </h3>

            {alerts.map((alert) => {
              // Find prediction matching current selected legislator
              const predictionObj = alert.predictedVotes.find(v => v.legislatorId === selectedLegId);
              const isAlertOn = userSchedules[alert.id] || false;

              return (
                <div 
                  key={alert.id}
                  id={`alert-card-${alert.billId.replace(/\s+/g, '-').toLowerCase()}`}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm overflow-hidden transition"
                >
                  {/* Top scheduled state line */}
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-200 text-slate-800 rounded">
                        {alert.billId}
                      </span>
                      <span className="text-[11px] font-mono text-slate-550 font-bold uppercase tracking-wider">
                        Scheduled: {alert.scheduledTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.importance === "Critical" ? (
                        <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-red-50 text-red-700 border border-red-100 rounded">
                          CRITICAL VOTE
                        </span>
                      ) : alert.importance === "High" ? (
                        <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-amber-50 text-amber-700 border border-amber-100 rounded">
                          HIGH IMPORTANT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-slate-100 text-slate-700 border border-slate-200 rounded">
                          NORMAL DOCKET
                        </span>
                      )}

                      <button
                        onClick={() => toggleAlertNotify(alert.id)}
                        className={`text-xs px-3 py-1 rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isAlertOn 
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm" 
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <Bell className="h-3 w-3" />
                        <span>{isAlertOn ? "Alert Armed" : "Notify Me"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="font-sans font-extrabold text-sm text-slate-900 leading-snug">
                        {alert.billTitle}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 italic">
                        &quot;{alert.plainSummary}&quot;
                      </p>
                    </div>

                    {/* Prediction logic for active legislator */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3.5 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-400" />
                          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide">
                            {selectedLeg?.name || "Representative"}&apos;s Alignment Prediction
                          </span>
                        </div>
                        {predictionObj && (
                          <span className={`text-[11px] font-mono font-extrabold px-2.5 py-0.5 rounded border ${
                            predictionObj.prediction.includes("Yea") 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}>
                            Predicted: {predictionObj.prediction} ({predictionObj.confidence}% Confidence)
                          </span>
                        )}
                      </div>

                      {predictionObj ? (
                        <div className="space-y-1.5">
                          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                            {predictionObj.reasoning}
                          </p>
                          <div className="text-[10px] text-slate-500 font-mono tracking-wide uppercase">
                            Grounded forecast compiled via historical sponsorships & statement registries
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          No forecast prediction available for this legislator on this bill. Choose another representative on the right panel to test prediction models.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Outbound reference links */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      Official Source: Congress.gov
                    </span>
                    <a
                      href={alert.billUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      <span>Review full text draft on Congress.gov</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Representative Selector (Right 4 columns) */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
                <MapPin className="h-4 w-4 text-amber-500" /> Grounded Representative
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Change your selected policy marker below to run real-time predictions across all scheduled dockets instantly:
              </p>
            </div>

            {/* Selector list */}
            <div className="space-y-2">
              {legislators.map((leg) => {
                const isSelected = leg.id === selectedLegId;
                return (
                  <button
                    key={leg.id}
                    onClick={() => setSelectedLegId(leg.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md font-semibold" 
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs truncate">{leg.name}</div>
                      <div className={`text-[9px] font-mono ${isSelected ? "text-slate-400" : "text-slate-500"} mt-0.5`}>
                        {leg.party}-{leg.state} • Attendance: {leg.attendanceRate}%
                      </div>
                    </div>
                    {isSelected && (
                      <span className="h-5 w-5 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Representative Details Info Card */}
            {selectedLeg && (
              <div className="p-4.5 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                <h4 className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest">
                  Active Focus Profile
                </h4>
                <div className="flex items-center gap-3">
                  {selectedLeg.imageUrl && (
                    <img 
                      src={selectedLeg.imageUrl} 
                      alt={selectedLeg.name} 
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full object-cover border border-slate-200"
                    />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-950 block">{selectedLeg.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">Chamber: {selectedLeg.chamber}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
