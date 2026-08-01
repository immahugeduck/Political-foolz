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
