import React, { useState, useEffect } from "react";
import { FileText, Search, Sparkles, BookOpen, User, HelpCircle, Loader2, ArrowRightLeft, FileCode2, Send, CheckCircle2, RotateCcw } from "lucide-react";
import { SearchedBill } from "../types";

interface PlainLanguageDirectoryProps {
  onSelectBill: (id: string) => void;
}

export default function PlainLanguageDirectory({ onSelectBill }: PlainLanguageDirectoryProps) {
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "custom">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [bills, setBills] = useState<SearchedBill[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom text summarizer states
  const [customTitle, setCustomTitle] = useState("");
  const [customText, setCustomText] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customResult, setCustomResult] = useState<{
    title: string;
    purpose: string;
    provisions: string;
    impact: string;
  } | null>(null);

  async function performSearch(queryText: string) {
    try {
      setLoading(true);
      const resp = await fetch(`/api/legislation/search?q=${encodeURIComponent(queryText)}`);
      const data = await resp.json();
      const parsed = data.data.map((item: any) => ({
        id: item.id || item.billId || "H.R. 4000",
        title: item.title || item.officialTitle,
        sponsor: item.sponsor || item.sponsorName || "Congressional Committee",
        status: item.status || item.outcome,
        oneLiner: item.oneLiner || item.synopsis,
        category: item.category
      }));
      setBills(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    performSearch("");
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSearch(searchQuery);
  }

  async function handleCustomSummarize(e: React.FormEvent) {
    e.preventDefault();
    if (!customTitle.trim() && !customText.trim()) return;
    try {
      setCustomLoading(true);
      const resp = await fetch("/api/legislation/summarize-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billTitle: customTitle,
          billText: customText
        })
      });
      const resJson = await resp.json();
      setCustomResult(resJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCustomLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Subtab selection headers (Directory vs Custom manual summarizer) */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <button
          onClick={() => setActiveSubTab("directory")}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === "directory"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Draft Bills Directory</span>
        </button>
        <button
          onClick={() => setActiveSubTab("custom")}
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === "custom"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Instant Text Summarizer</span>
        </button>
      </div>

      {activeSubTab === "directory" ? (
        <>
          {/* Search Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-sans font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Plain-Language Legislative Directory
            </h2>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Translate legalese into daily human vocabulary. Search for any bill by keywords (e.g. &quot;aviation&quot;, &quot;farm&quot;, &quot;AI&quot;, &quot;health&quot;) to auto-compile deep synopses, pro/con analysis grids, and budgetary forecasts.
            </p>

            {/* Input bar */}
            <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by keyword, sponsor, or bill number (e.g., H.R. 3935)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg text-sm transition-all text-slate-900 outline-none"
                />
              </div>
              <button
                type="submit"
                id="directory-search-submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition shadow-sm cursor-pointer"
              >
                Query Grid
              </button>
            </form>

            {/* Speedy Quick Suggestion Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-1">
              <span className="text-xs text-slate-400 font-mono">POPULAR QUICK LOOKUPS:</span>
              {["FAA Air Care", "Farm Credit Extension", "Frontier AI Safety"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    performSearch(tag);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium border border-slate-200 transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
              <span className="text-xs font-mono text-slate-500">Querying national congressional databases...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  id={`dir-card-${bill.id.replace(/\s+/g, '-').toLowerCase()}`}
                  className="bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-300 p-5 rounded-xl transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-blue-50 text-blue-700 rounded border border-blue-100">
                        {bill.id}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {bill.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-sans font-bold text-sm text-slate-900 leading-snug">
                        {bill.title}
                      </h3>
                      {bill.sponsor && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
                          <User className="h-3 w-3" /> Introduced by: {bill.sponsor}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-full">
                      {bill.oneLiner}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {bill.category && (
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                        Category: {bill.category}
                      </span>
                    )}
                    <button
                      onClick={() => onSelectBill(bill.id)}
                      id={`view-dir-analysis-${bill.id.replace(/\s+/g, '-').toLowerCase()}`}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white hover:shadow-sm text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Translate to plain-language</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Instant Custom Text Summarizer Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Input side (5 Columns) */}
          <form 
            onSubmit={handleCustomSummarize} 
            className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className="space-y-1.5">
              <h3 className="text-sm font-sans font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500 animate-spin-slow" />
                Automatic Text Summarizer Engine
              </h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Paste any legal text, paragraph, or pending bill concept. Our model automatically summarizes the content into an easy 1-to-3 paragraph breakdown covering purpose, provisions, and impacts.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Bill Code / Title (e.g. S. 248)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter bill code or title..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-xs rounded-lg transition outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Draft Bill Text or Legal Phrases
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste raw draft legislative clauses, regulatory summaries, or policy scripts here..."
                  rows={8}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-xs rounded-lg transition outline-none text-slate-900 resize-none font-sans"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="submit"
                  id="custom-summarize-submit"
                  disabled={customLoading || (!customTitle.trim() && !customText.trim())}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {customLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Summarizing...</span>
                    </>
                  ) : (
                    <>
                      <FileCode2 className="h-3.5 w-3.5" />
                      <span>Compile Smart Summary</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomTitle("");
                    setCustomText("");
                    setCustomResult(null);
                  }}
                  className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg transition cursor-pointer"
                  title="Reset fields"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Result Side (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            {customLoading ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <div className="text-center">
                  <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest">Translating Legal-ese...</h4>
                  <p className="text-[11px] text-slate-450 mt-1 max-w-sm">Generating neutral 1-to-3 paragraph layout mapping purpose, provisions, and social impacts in real-time...</p>
                </div>
              </div>
            ) : customResult ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 animate-fade-in min-h-[400px]">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
                    PLI SYNTHESIS COMPLETED
                  </span>
                  <h3 className="font-sans font-extrabold text-sm text-slate-900 mt-2">
                    {customResult.title || "Custom Draft Regulation Analysis"}
                  </h3>
                </div>

                {/* Purpose Paragraph */}
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    1. Main Purpose
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {customResult.purpose}
                  </p>
                </div>

                {/* Provisions Paragraph */}
                <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    2. Key Provisions
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {customResult.provisions}
                  </p>
                </div>

                {/* Impact Paragraph */}
                <div className="space-y-1.5 p-4 bg-amber-50/20 border border-amber-200/40 rounded-xl">
                  <h4 className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-widest">
                    3. Potential Impact
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {customResult.impact}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3 h-full min-h-[400px] text-center">
                <HelpCircle className="h-10 w-10 text-slate-300" />
                <h4 className="font-sans font-bold text-xs text-slate-600">Pending Summarization</h4>
                <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
                  Enter or paste any legal scripts on the left side and hit &quot;Compile Smart Summary&quot; to automatically draft high-fidelity plain language outputs instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
