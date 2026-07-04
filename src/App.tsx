import React, { useState, useEffect } from "react";
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
import { Accomplishment, LegislativeSession, RollCallVote } from "./types";
import { Landmark, Calendar, Settings, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  // Core Legislative Data States
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [sessions, setSessions] = useState<LegislativeSession[]>([]);
  const [votes, setVotes] = useState<RollCallVote[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [followedLegislators, setFollowedLegislators] = useState<string[]>([]);
  
  // Status check for live grounded intelligence (GEMINI_API_KEY check)
  const [isLive, setIsLive] = useState<boolean>(true);

  // Refresh status triggers
  const [loadingAccomplishments, setLoadingAccomplishments] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingVotes, setLoadingVotes] = useState(false);

  // Initialize data on load
  useEffect(() => {
    // Read watchlist from client storage to guarantee citizen tracking state
    const saved = localStorage.getItem("capitol_watchlist");
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Cache parsing mismatch:", e);
      }
    }

    // Read followed legislators roster list
    const savedFollows = localStorage.getItem("capitol_followed_legislators");
    if (savedFollows) {
      try {
        setFollowedLegislators(JSON.parse(savedFollows));
      } catch (e) {
        console.error("Follow parameters mismatch:", e);
      }
    }

    loadAccomplishments();
    loadSessions();
    loadVotes();
  }, []);

  // Save watchlist on change
  const toggleWatchlist = (id: string) => {
    let updated: string[];
    if (watchlist.includes(id)) {
      updated = watchlist.filter(item => item !== id);
    } else {
      updated = [...watchlist, id];
    }
    setWatchlist(updated);
    localStorage.setItem("capitol_watchlist", JSON.stringify(updated));
  };

  // Toggle following a legislative star roster team
  const toggleFollowLegislator = (id: string) => {
    let updated: string[];
    if (followedLegislators.includes(id)) {
      updated = followedLegislators.filter(item => item !== id);
    } else {
      updated = [...followedLegislators, id];
    }
    setFollowedLegislators(updated);
    localStorage.setItem("capitol_followed_legislators", JSON.stringify(updated));
  };

  async function loadAccomplishments() {
    try {
      setLoadingAccomplishments(true);
      const resp = await fetch("/api/legislation/accomplishments");
      const resJson = await resp.json();
      setAccomplishments(resJson.data);
      if (resJson.source === "cache" || resJson.source === "fallback") {
        setIsLive(false);
      } else {
        setIsLive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccomplishments(false);
    }
  }

  async function loadSessions() {
    try {
      setLoadingSessions(true);
      const resp = await fetch("/api/legislation/sessions");
      const resJson = await resp.json();
      setSessions(resJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadVotes() {
    try {
      setLoadingVotes(true);
      const resp = await fetch("/api/legislation/votes");
      const resJson = await resp.json();
      setVotes(resJson.data);
    } catch (err) {
      console.error(err);
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
      default:
        return (
          <div className="text-center py-20 text-slate-400">
            View under construction. Use Navigation.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-x-hidden antialiased select-text">
      {/* 1. Header Navigation Component */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isLive={isLive} />

      {/* 2. Primary Layout Framework (Professional Polish Theme alignment) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        
        {/* Banner notifying if they are browsing simulated mock or live grounded responses */}
        {!isLive && (
          <div className="mb-6 p-4.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start space-x-3 text-amber-900">
              <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-sans font-bold text-sm">Offline Sandbox active</h4>
                <p className="text-xs text-amber-800/90 leading-tight">
                  Unlocking real-time Search-grounded lookups requires entering your Gemini API credential. Right now you are observing high-fidelity 2026 congressional logs.
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-800 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                Simulation Active
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Inner View Panel */}
        <div className="animate-fade-in" id="primary-view-container">
          {renderActiveView()}
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 shrink-0 py-6 text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-slate-800 text-blue-400 rounded">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200">CapitolTrack Civics</span>
              <p className="text-[10px] text-slate-500">Official real-world parameters from Congress.gov & grounded search indices</p>
            </div>
          </div>
          
          <div className="flex gap-4 font-semibold text-slate-300">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Feed v5.0 (Mid-June 2026)</span>
            <span>|</span>
            <a href="https://congress.gov" target="_blank" rel="noreferrer" className="flex items-center gap-0.5 hover:text-white transition">
              Congress.gov portal <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* 4. Overlay detail analysis (Plain translation dialog + policy assistant) */}
      {selectedBillId && (
        <BillDetailModal
          billId={selectedBillId}
          onClose={() => setSelectedBillId(null)}
        />
      )}
    </div>
  );
}
