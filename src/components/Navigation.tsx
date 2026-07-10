import React from "react";
import { Landmark, Sparkles, FileText, CalendarDays, BarChart3, HelpCircle, Activity, Award, Bell, Vote, Map, MapPin } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLive: boolean;
  onOpenDiagnostics: () => void;
}

export default function Navigation({ activeTab, setActiveTab, isLive, onOpenDiagnostics }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Landmark },
    { id: "bills", label: "Plain-Language Directory", icon: FileText },
    { id: "legislators", label: "Civics Scorecards", icon: Award },
    { id: "consensus", label: "Citizens' Ballot", icon: Vote },
    { id: "alignment-map", label: "Civic Alignment Map", icon: Map },
    { id: "alerts", label: "Vote Predictor Alerts", icon: Bell },
    { id: "sessions", label: "Upcoming Calendar", icon: CalendarDays },
    { id: "votes", label: "Roll Call Votes", icon: BarChart3 },
    { id: "voter-info", label: "Voter Info", icon: MapPin },
    { id: "chat", label: "CapitolExpert AI", icon: HelpCircle },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="p-2 bg-gradient-to-br from-amber-500 to-red-500 rounded-lg text-white shadow-md">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg tracking-tight text-slate-100">Capitol<span className="text-amber-500">Track</span></span>
              <div className="text-[10px] font-mono text-slate-400 tracking-wider font-semibold">119th CONGRESS REAL-TIME</div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex space-x-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-250 cursor-pointer ${
                    isActive
                      ? "bg-slate-800 text-amber-500 border-b-2 border-amber-500"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`mr-2 h-4 w-4 ${isActive ? "text-amber-500" : "text-slate-400 group-hover:text-slate-300"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Live System Indicator */}
          <button
            onClick={onOpenDiagnostics}
            title="Click to verify API keys and system diagnostics"
            className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 hover:text-white px-3 py-1.5 rounded-full border border-slate-700/60 shadow-inner cursor-pointer transition-colors group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-emerald-400" : "bg-amber-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            </span>
            <span className="text-[10px] font-mono font-medium text-slate-300 uppercase tracking-wide flex items-center gap-1 group-hover:text-amber-400 transition-colors">
              {isLive ? (
                <>
                  <Sparkles className="h-2.5 w-2.5 text-emerald-400 inline" /> Grounded AI Live
                </>
              ) : (
                <>
                  <Activity className="h-2.5 w-2.5 text-amber-400 inline" /> Archive Cache Mode
                </>
              )}
            </span>
          </button>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 -mx-4 px-4 scrollbar-none border-t border-slate-800/40 justify-between gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-mobile-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isActive
                    ? "bg-slate-800 text-amber-500"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5 mr-1" />
                {tab.label.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
