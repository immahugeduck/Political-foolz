import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, Send, Landmark, HelpCircle as AskIcon, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { ChatMessage } from "../types";

export default function StandaloneChat() {
  const [audienceMode, setAudienceMode] = useState<"standard" | "eli5" | "eli15" | "policy_wonk">("standard");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content: "Welcome to CapitolExpert AI. I am your fully unbiased senior policy researcher. I search real legislative data in real-time. \n\nAsk me anything about pending acts, voting alignments, or constitutional procedure. Try some examples below!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(msgText: string) {
    if (!msgText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const resp = await fetch("/api/legislation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgText,
          audienceMode,
          history: messages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (!resp.ok) {
        throw new Error("Endpoint reached but query failed");
      }

      const data = await resp.json();
      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: "I ran into a server communication glitch. Please confirm your API Key secrets setup inside the settings panel.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestionPrompts = [
    "What are the major structural differences between a House bill and a Senate bill?",
    "Tell me about the recent bipartisan farm and crop credit re-authorizations in 2026.",
    "Explain the debate concerning state-level corporate rental housing pricing software regulations.",
    "Detail how the FAA re-authorization impacts passenger rights regarding wheelchair support."
  ];
  const refinementPrompts = [
    "Explain in more detail.",
    "What about Section 3 specifically?",
    "Compare this to a similar past bill.",
    "How would this affect someone in my zip code?"
  ];

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="border-b-2 border-double border-[--color-ink] pb-3">
        <div className="np-kicker text-[--color-headline] mb-1 flex items-center gap-1.5">
          <AskIcon className="h-3 w-3" />
          Intelligence Desk
        </div>
        <h2 className="text-2xl font-headline font-bold text-[--color-ink] leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          CapitolExpert AI Policy Desk
        </h2>
        <p className="text-xs font-body text-[--color-ink-muted] mt-1">Neutral, grounded analysis of the 119th United States Congress regulations</p>
        <div className="np-rule-thin mt-2" />
      </div>

      {/* Audience mode selector */}
      <div className="flex flex-wrap gap-2">
        <span className="np-kicker text-[--color-ink-faint] flex items-center">Reading Level:</span>
        {[
          { id: "standard", label: "Standard" },
          { id: "eli5", label: "Explain like I'm 5" },
          { id: "eli15", label: "Explain like I'm 15" },
          { id: "policy_wonk", label: "Policy Wonk" }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setAudienceMode(mode.id as typeof audienceMode)}
            disabled={loading}
            className={`px-3 py-1 text-[10px] font-sans font-semibold border transition-colors cursor-pointer ${
              audienceMode === mode.id
                ? "bg-[--color-ink] text-[--color-paper] border-[--color-ink]"
                : "bg-[--color-column-bg] text-[--color-ink-secondary] border-[--color-rule] hover:border-[--color-ink]"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Chat layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        {/* Chat window */}
        <div className="lg:col-span-3 border border-[--color-rule] bg-[--color-column-bg] p-5 flex flex-col h-[560px] justify-between">
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[460px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.role === "user" ? "ml-auto items-end animate-fade-in" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-3.5 text-xs leading-relaxed whitespace-pre-line border ${
                    m.role === "user"
                      ? "bg-[--color-ink] text-[--color-paper] border-[--color-ink]"
                      : "bg-[--color-paper] text-[--color-ink] border-[--color-rule] font-body"
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[9px] font-mono text-[--color-ink-faint] mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-[--color-ink-muted] text-xs pl-2 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-[--color-headline-gold]" />
                <span className="font-mono italic text-[10px]">Synthesizing analysis...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
            className="flex items-center gap-2 mt-4 pt-3 border-t border-[--color-rule]"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about any bill, procedure, or voting record..."
              disabled={loading}
              className="flex-1 bg-[--color-paper] border border-[--color-rule] focus:border-[--color-ink] focus:outline-none px-4 py-2.5 text-xs font-sans text-[--color-ink] transition-colors"
            />
            <button
              type="submit"
              id="standalone-chat-submit"
              disabled={loading || !inputValue.trim()}
              className="p-2.5 bg-[--color-ink] hover:bg-[--color-headline] disabled:opacity-40 text-[--color-paper] transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Suggested Prompts sidebar */}
        <div className="bg-[--color-ink] text-[--color-paper] border border-[--color-rule-dark] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="np-kicker text-[--color-headline-gold] flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Prompt Catalogs
            </div>
            <p className="text-xs font-body text-[--color-ink-faint] leading-relaxed">
              Tap any pre-compiled inquiry to run cross-referenced lookups:
            </p>

            <div className="space-y-2">
              {suggestionPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="w-full text-left p-2.5 border border-white/10 hover:border-[--color-headline-gold]/40 text-xs text-[--color-ink-faint] line-clamp-2 hover:text-white bg-white/5 hover:bg-white/10 transition-colors duration-150 cursor-pointer font-body"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="np-kicker text-[--color-ink-faint] mb-2">Refine Analysis</div>
              <div className="space-y-1.5">
                {refinementPrompts.map((prompt, idx) => (
                  <button
                    key={`refine-${idx}`}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="w-full text-left p-2 border border-white/10 hover:border-[--color-headline-gold]/40 text-[10px] text-[--color-ink-faint] hover:text-white transition-colors cursor-pointer font-sans"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex gap-2 items-center np-kicker text-[--color-ink-faint]">
              <Landmark className="h-3 w-3 text-[--color-headline-gold]" />
              Multi-Source Integrity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
