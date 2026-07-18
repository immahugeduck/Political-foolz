import React, { useState } from "react";
import { Landmark, Sparkles, FileText, CalendarDays, BarChart3, HelpCircle, Activity, Award, Bell, Vote, Map, MapPin, Menu, X } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLive: boolean;
  onOpenDiagnostics: () => void;
}

export default function Navigation({ activeTab, setActiveTab, isLive, onOpenDiagnostics }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Front Page", icon: Landmark },
    { id: "bills", label: "Legislation", icon: FileText },
    { id: "legislators", label: "Scorecards", icon: Award },
    { id: "consensus", label: "Citizen Poll", icon: Vote },
    { id: "alignment-map", label: "Alignment", icon: Map },
    { id: "alerts", label: "Vote Watch", icon: Bell },
    { id: "sessions", label: "Calendar", icon: CalendarDays },
    { id: "votes", label: "Roll Calls", icon: BarChart3 },
    { id: "voter-info", label: "Voter Info", icon: MapPin },
    { id: "chat", label: "AI Expert", icon: HelpCircle },
  ];

  const now = new Date();
  const dateLine = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase();

  return (
    <header className="bg-[--color-masthead] select-none">
      {/* === TOP RULE === */}
      <div className="masthead-rule" />

      {/* === MASTHEAD === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 border-b border-[--color-rule-dark]/40 flex items-center justify-between gap-4">
          {/* Dateline + Edition */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-mono text-[--color-ink-faint] uppercase tracking-widest">
              {dateLine}
            </span>
          </div>

          {/* Main Masthead Title */}
          <div
            className="flex-1 text-center cursor-pointer"
            onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
          >
            <div className="text-[9px] font-sans text-[--color-ink-faint] uppercase tracking-[0.35em] mb-0.5">
              Independent Legislative Intelligence
            </div>
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-headline font-black text-white leading-none tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.02em' }}
            >
              THE CAPITOL REPORT
            </h1>
            <div className="text-[9px] font-sans text-[--color-ink-faint] uppercase tracking-[0.25em] mt-0.5">
              119th Congress · Washington, D.C.
            </div>
          </div>

          {/* Live Status + Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDiagnostics}
              title="Click to verify API keys"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 border border-[--color-rule-dark]/40 text-[--color-ink-faint] hover:text-white hover:border-[--color-rule-dark] transition-colors cursor-pointer rounded-sm"
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider">
                {isLive ? (
                  <><Sparkles className="h-2.5 w-2.5 text-emerald-400 inline mr-0.5" />Live</>
                ) : (
                  <><Activity className="h-2.5 w-2.5 text-amber-400 inline mr-0.5" />Archive</>
                )}
              </span>
            </button>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-1.5 text-[--color-ink-faint] hover:text-white transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* === SECTION NAVIGATION === */}
      <div className="border-b border-[--color-rule-dark]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center" aria-label="Sections">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <React.Fragment key={tab.id}>
                  {idx > 0 && <div className="w-px h-4 bg-[--color-rule-dark]/30 mx-0.5 flex-shrink-0" />}
                  <button
                    id={`nav-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-3 text-[11px] font-sans font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap relative ${
                      isActive
                        ? "text-[--color-headline-gold] bg-white/5"
                        : "text-[--color-ink-faint] hover:text-white hover:bg-white/5"
                    }`}
                    style={{ letterSpacing: '0.08em' }}
                  >
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    {tab.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-headline-gold]" />
                    )}
                  </button>
                </React.Fragment>
              );
            })}

            {/* Live indicator on desktop right */}
            <div className="ml-auto pl-4">
              <button
                onClick={onOpenDiagnostics}
                className="lg:hidden flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono text-[--color-ink-faint] hover:text-white cursor-pointer uppercase tracking-wider"
              />
            </div>
          </nav>

          {/* Mobile nav dropdown */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-2 space-y-0.5 animate-fade-in" aria-label="Mobile Sections">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-mobile-${tab.id}`}
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-sans font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      isActive
                        ? "text-[--color-headline-gold] bg-white/5 border-l-2 border-[--color-headline-gold]"
                        : "text-[--color-ink-faint] hover:text-white hover:bg-white/5"
                    }`}
                    style={{ letterSpacing: '0.08em' }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="pt-2 pb-1 border-t border-[--color-rule-dark]/30">
                <button
                  onClick={() => { onOpenDiagnostics(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-[--color-ink-faint] hover:text-white uppercase tracking-wider cursor-pointer"
                >
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
                  </span>
                  {isLive ? "Grounded AI Active" : "Archive Mode — Configure API Keys"}
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
