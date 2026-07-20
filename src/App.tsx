import React, { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import PlainLanguageDirectory from "./components/PlainLanguageDirectory";
import LegislativeSessions from "./components/LegislativeSessions";
import RollCallVotesView from "./components/RollCallVotesView";
import StandaloneChat from "./components/StandaloneChat";
import BillDetailModal from "./components/BillDetailModal";
import LegislatorScorecards from "./components/LegislatorScorecards";
import UpcomingVoteAlerts from "./components/UpcomingVoteAlerts";
import CitizensConsensus from "./components/CitizensConsensus";
import CivicAlignmentMap from "./components/CivicAlignmentMap";
import VoterInformation from "./components/VoterInformation";
import ApiDiagnosticsModal from "./components/ApiDiagnosticsModal";
import { Accomplishment, LegislativeSession, RollCallVote } from "./types";
import { ArrowUpRight, AlertTriangle, Settings } from "lucide-react";

function safeStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`Unable to read localStorage key "${key}":`, error);
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Unable to write localStorage key "${key}":`, error);
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [sessions, setSessions] = useState<LegislativeSession[]>([]);
  const [votes, setVotes] = useState<RollCallVote[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [followedLegislators, setFollowedLegislators] = useState<string[]>([]);

  const [isLive, setIsLive] = useState<boolean>(true);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  const [loadingAccomplishments, setLoadingAccomplishments] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingVotes, setLoadingVotes] = useState(false);

  useEffect(() => {
    const saved = safeStorageGet("capitol_watchlist");
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (error) {
        console.error("Cache parsing mismatch:", error);
      }
    }

    const savedFollows = safeStorageGet("capitol_followed_legislators");
    if (savedFollows) {
      try {
        setFollowedLegislators(JSON.parse(savedFollows));
      } catch (error) {
        console.error("Follow parameters mismatch:", error);
      }
    }

    loadAccomplishments();
    loadSessions();
    loadVotes();
  }, []);

  const toggleWatchlist = (id: string) => {
    const updated = watchlist.includes(id)
      ? watchlist.filter((item) => item !== id)
      : [...watchlist, id];

    setWatchlist(updated);
    safeStorageSet("capitol_watchlist", JSON.stringify(updated));
  };

  const toggleFollowLegislator = (id: string) => {
    const updated = followedLegislators.includes(id)
      ? followedLegislators.filter((item) => item !== id)
      : [...followedLegislators, id];

    setFollowedLegislators(updated);
    safeStorageSet("capitol_followed_legislators", JSON.stringify(updated));
  };

  async function loadAccomplishments() {
    try {
      setLoadingAccomplishments(true);
      const resp = await fetch("/api/legislation/accomplishments");
      const resJson = await resp.json();
      setAccomplishments(resJson.data ?? []);
      setIsLive(resJson.source !== "cache" && resJson.source !== "fallback");
    } catch (error) {
      console.error(error);
      setAccomplishments([]);
    } finally {
      setLoadingAccomplishments(false);
    }
  }

  async function loadSessions() {
    try {
      setLoadingSessions(true);
      const resp = await fetch("/api/legislation/sessions");
      const resJson = await resp.json();
      setSessions(resJson.data ?? []);
    } catch (error) {
      console.error(error);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadVotes() {
    try {
      setLoadingVotes(true);
      const resp = await fetch("/api/legislation/votes");
      const resJson = await resp.json();
      setVotes(resJson.data ?? []);
    } catch (error) {
      console.error(error);
      setVotes([]);
    } finally {
      setLoadingVotes(false);
    }
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            accomplishments={accomplishments}
            onSelectBill={setSelectedBillId}
            onRefresh={loadAccomplishments}
            isLoading={loadingAccomplishments}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
            followedLegislators={followedLegislators}
            toggleFollowLegislator={toggleFollowLegislator}
          />
        );

      case "bills":
        return <PlainLanguageDirectory onSelectBill={setSelectedBillId} />;

      case "legislators":
        return (
          <LegislatorScorecards
            followedLegislators={followedLegislators}
            toggleFollowLegislator={toggleFollowLegislator}
          />
        );

      case "consensus":
        return <CitizensConsensus />;

      case "alignment-map":
        return <CivicAlignmentMap />;

      case "alerts":
        return <UpcomingVoteAlerts />;

      case "sessions":
        return (
          <LegislativeSessions
            sessions={sessions}
            onRefresh={loadSessions}
            isLoading={loadingSessions}
          />
        );

      case "votes":
        return (
          <RollCallVotesView
            votes={votes}
            onRefresh={loadVotes}
            isLoading={loadingVotes}
          />
        );

      case "chat":
        return <StandaloneChat />;

      case "voter-info":
        return <VoterInformation />;

      default:
        return (
          <div className="text-center py-20 text-[--color-ink-muted] font-body italic">
            This section is under construction.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--color-paper] text-[--color-ink] overflow-x-hidden antialiased select-text">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLive={isLive}
        onOpenDiagnostics={() => setShowDiagnostics(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {!isLive && (
          <div className="mb-6 border border-[--color-rule-dark] bg-[--color-column-bg] p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-[--color-headline] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="np-kicker mb-0.5 text-[--color-headline]">
                    Editor&apos;s Notice — Archive Mode
                  </div>
                  <p className="text-sm font-body text-[--color-ink-secondary] leading-snug">
                    Real-time search-grounded intelligence requires a valid Gemini
                    API credential. You are currently viewing high-fidelity 119th
                    Congress archive data.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDiagnostics(true)}
                className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 bg-[--color-ink] text-[--color-paper] text-xs font-sans font-semibold uppercase tracking-wider hover:bg-[--color-headline] transition-colors cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" />
                Configure API Keys
              </button>
            </div>
          </div>
        )}

        <div className="mb-5">
          <div className="np-rule-thick mb-1" />
          <div className="np-rule-thin" />
        </div>

        <div className="animate-fade-in" id="primary-view-container">
          {renderActiveView()}
        </div>
      </main>

      <footer className="bg-[--color-masthead] shrink-0 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t-2 border-[--color-rule-dark]/30 mb-4" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-center md:text-left">
              <div
                className="font-headline font-bold text-white text-lg tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                The Capitol Report
              </div>
              <p className="text-[10px] font-mono text-[--color-ink-faint] mt-0.5 uppercase tracking-wider">
                Legislative Intelligence · 119th United States Congress
              </p>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-sans text-[--color-ink-faint]">
              <span className="font-mono uppercase tracking-widest">
                Feed v5.0 · Mid-2026
              </span>
              <span className="text-[--color-rule-dark]">|</span>
              <a
                href="https://congress.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 hover:text-white transition-colors uppercase tracking-wider font-semibold"
              >
                Congress.gov <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {selectedBillId && (
        <BillDetailModal
          billId={selectedBillId}
          onClose={() => setSelectedBillId(null)}
        />
      )}

      {showDiagnostics && (
        <ApiDiagnosticsModal onClose={() => setShowDiagnostics(false)} />
      )}

      <Analytics />
    </div>
  );
}
