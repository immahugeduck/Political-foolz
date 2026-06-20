import React, { useState, useEffect, useRef } from "react";
import { X, Sparkles, AlertTriangle, CheckCircle, Flame, DollarSign, Send, BookOpen, MessageSquare, ChevronRight, Loader2 } from "lucide-react";
import { PendingBillSummary, ChatMessage } from "../types";

interface BillDetailModalProps {
  billId: string;
  onClose: () => void;
}

export default function BillDetailModal({ billId, onClose }: BillDetailModalProps) {
  const [summary, setSummary] = useState<PendingBillSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [activeTab, setActiveTab] = useState<"summary" | "chat">("summary");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [aiResponding, setAiResponding] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch the summary of the bill on load
  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);
        const resp = await fetch(`/api/legislation/summarize?id=${encodeURIComponent(billId)}`);
        if (!resp.ok) {
          throw new Error("Failed to compile summary files");
        }
        const resJson = await resp.json();
        setSummary(resJson.data);
      } catch (err: any) {
        console.error(err);
        setError("Unable to synthesize the requested bill. Please check your network connection.");
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [billId]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial welcome message from AI
  useEffect(() => {
    if (summary) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello! I am 'CapitolExpert AI'. I have reviewed **${summary.billId}: ${summary.oneLiner}**. 

You can ask me any policy question regarding this bill—for instance:
- *"Who profits or benefits most from this?"*
- *"Are there constitutional friction points?"*
- *"How does this influence energy markets?"*

How can I help you understand this bill today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [summary]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || aiResponding || !summary) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setAiResponding(true);

    try {
      const resp = await fetch("/api/legislation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          billContext: summary
        })
      });

      if (!resp.ok) throw new Error("Connection failed");
      const data = await resp.json();

      const responseMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, responseMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: "I'm having trouble reaching the research grid right now. Please test again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiResponding(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-md flex items-center justify-end z-50 animate-fade-in" id="bill-modal-overlay">
      <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative" id="bill-modal-container">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
              {billId}
            </span>
            <span className="text-slate-400 font-mono text-xs">Awaiting Analysis review</span>
          </div>
          <button
            onClick={onClose}
            id="close-bill-modal"
            className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950 px-4 border-b border-slate-850">
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-3 px-4 font-sans text-sm font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "summary"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Plain-Language Summary</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-3 px-4 font-sans text-sm font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "chat"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>CapitolExpert AI</span>
            {summary && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Ask AI</span>}
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-6" id="bill-modal-body">
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              <div className="text-slate-400 text-sm font-mono animate-pulse">Running plain-language translation algorithms...</div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start space-x-3 text-red-400">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Drafting Failed</h4>
                <p className="text-xs text-red-400/80 mt-1">{error}</p>
                <button onClick={onClose} className="mt-3 text-xs bg-red-900/40 hover:bg-red-900/60 text-white px-3 py-1 rounded font-medium transition cursor-pointer">
                  Close panel
                </button>
              </div>
            </div>
          )}

          {!loading && !error && summary && (
            <>
              {activeTab === "summary" && (
                <div className="space-y-6">
                  {/* Title Info */}
                  <div>
                    <h2 className="text-xl font-sans font-bold text-slate-100 tracking-tight leading-snug">
                      {summary.officialTitle}
                    </h2>
                    <p className="text-sm text-amber-500 mt-2 font-medium italic flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      &quot;{summary.oneLiner}&quot;
                    </p>
                  </div>

                  {/* Bill Meta Data Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-450 text-[10px] font-mono block">SPONSOR</span>
                      <span className="text-sm font-medium text-slate-200 mt-0.5 block">{summary.sponsorName}</span>
                    </div>
                    <div>
                      <span className="text-slate-455 text-[10px] font-mono block">CHAMBER & PARTY</span>
                      <span className="text-sm font-medium text-slate-200 mt-0.5 block bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block">
                        {summary.sponsorPartyChamber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-450 text-[10px] font-mono block">CURRENT STATUS</span>
                      <span className="text-sm font-semibold text-emerald-450 mt-0.5 block">{summary.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 text-[10px] font-mono block">COST CLASSIFICATION</span>
                      <span className="text-sm font-medium text-amber-500 mt-0.5 block flex items-center gap-1">
                        <DollarSign className="h-4 w-4" /> Billed CBO Review
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-amber-500" /> Executive Digest
                    </h3>
                    <div className="text-sm text-slate-350 leading-relaxed bg-slate-950/20 p-4 rounded-xl border border-slate-850">
                      {summary.plainSummary}
                    </div>
                  </div>

                  {/* Key Provisions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-amber-500" /> Key Provisions (What It Does)
                    </h3>
                    <ul className="grid grid-cols-1 gap-2.5">
                      {summary.keyProvisions.map((prov, i) => (
                        <li key={i} className="flex gap-2.5 p-3 bg-slate-950/20 rounded-lg border border-slate-850/50">
                          <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-300 leading-relaxed">{prov}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pros & Cons (Dual-axis analysis) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Arguments For */}
                    <div className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded-xl space-y-3">
                      <h4 className="font-sans font-bold text-sm text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Standard Arguments For
                      </h4>
                      <ul className="space-y-2">
                        {summary.pros.map((pro, idx) => (
                          <li key={idx} className="text-xs text-slate-305 flex gap-1.5 leading-relaxed">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Arguments Against */}
                    <div className="bg-red-955/10 border border-red-900/30 p-4 rounded-xl space-y-3">
                      <h4 className="font-sans font-bold text-sm text-red-400 flex items-center gap-2">
                        <Flame className="h-4 w-4" /> Pointed Arguments Against
                      </h4>
                      <ul className="space-y-2">
                        {summary.cons.map((con, idx) => (
                          <li key={idx} className="text-xs text-slate-305 flex gap-1.5 leading-relaxed">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cost & Financial Impact */}
                  {summary.financialImpact && (
                    <div className="bg-gradient-to-r from-amber-950/10 to-transparent border border-amber-900/20 p-4 rounded-xl space-y-2">
                      <h4 className="font-sans font-semibold text-sm text-amber-400 flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" /> Estimated Budget Outlook
                      </h4>
                      <p className="text-xs text-slate-350 leading-relaxed">
                        {summary.financialImpact}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "chat" && (
                <div className="flex flex-col h-[520px] bg-slate-950 rounded-xl border border-slate-800 p-4">
                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                            msg.role === "user"
                              ? "bg-amber-500 text-slate-950 font-medium"
                              : "bg-slate-900 text-slate-205 border border-slate-800"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    ))}
                    {aiResponding && (
                      <div className="flex items-center space-x-2 text-slate-500 text-xs ml-2 animate-pulse">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                        <span>CapitolExpert AI is conducting deep research...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendMessage} className="mt-3 flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Ask about ${summary.billId}...`}
                      disabled={aiResponding}
                      className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-amber-500 focus:outline-none rounded-xl px-4 py-2 text-xs text-white"
                    />
                    <button
                      type="submit"
                      id="send-modal-chat"
                      disabled={aiResponding || !inputValue.trim()}
                      className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 rounded-full transition cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
