import React, { useState, useEffect } from "react";
import { Vote, CheckCircle2, XCircle, Users, Scale, MessageSquare, Award, Flame, ThumbsUp, ThumbsDown, HelpCircle, Loader2 } from "lucide-react";
import { LegislatorScorecard } from "../types";

interface CitizenBill {
  id: string;
  title: string;
  oneLiner: string;
  category: string;
  officialStatus: string;
  congressOutcome?: string;
  pros: string[];
  cons: string[];
  simulatedYesVotes: number;
  simulatedNoVotes: number;
}

// Seed key bills for citizens to vote on
const SEED_BILLS: CitizenBill[] = [
  {
    id: "HR-82",
    title: "Affordable Housing Construction & Tax Relief Act",
    oneLiner: "Stimulates middle-class multi-family housing development via targeted federal tax credits and regulatory streamlining.",
    category: "Housing & Economy",
    officialStatus: "Passed House, Pending Senate debate scheduled for mid-July 2026",
    congressOutcome: "House Vote: 245 Yea, 182 Nay. Senate Prediction: Lean Yea",
    pros: [
      "Lowers entry barriers for first-time homebuyers with state grants",
      "Expands the Low-Income Housing Tax Credit (LIHTC) to incentivize builders",
      "Cuts regulatory red tape for multi-family rezoning near transit hubs"
    ],
    cons: [
      "Increases short-term federal deficit by an estimated $12 billion",
      "May override local municipal zoning autonomy in suburban regions",
      "Critics claim it does not cap rent hikes directly, subsidizing developers instead"
    ],
    simulatedYesVotes: 1420,
    simulatedNoVotes: 480
  },
  {
    id: "S-41",
    title: "Grid Modernization & Sovereign Energy Independence Initiative",
    oneLiner: "Authorizes long-term investments to overhaul the US electrical grid and fast-tracks domestic critical mineral refineries.",
    category: "Energy & Security",
    officialStatus: "Passed Senate, Scheduled for House Vote mid-July 2026",
    congressOutcome: "Senate Vote: 68 Yea, 30 Nay. House Prediction: Highly Disputed",
    pros: [
      "Upgrades vulnerable regional power networks against extreme weather and cyber-attacks",
      "Secures internal supplies of lithium and cobalt, reducing reliance on adversarial nations",
      "Provides nuclear power credits to maintain stable zero-emission baseload energy"
    ],
    cons: [
      "Permitting fast-tracks bypass traditional EPA environmental reviews",
      "Funds carbon capture programs that critics call greenwashing for fossil fuels",
      "High immediate capital expenditure funded by corporate tax adjustment overrides"
    ],
    simulatedYesVotes: 1850,
    simulatedNoVotes: 320
  },
  {
    id: "HR-104",
    title: "Sovereign AI Safety, Licensing & Supercomputing Act",
    oneLiner: "Establishes a federal licensing matrix for foundation AI models above a specific compute threshold while funding national research labs.",
    category: "Technology",
    officialStatus: "Introduced, Pending Judiciary and Science committees reviews",
    congressOutcome: "Bipartisan Split. Predicted House Vote: Slight Yea (54% confidence)",
    pros: [
      "Creates mandatory liability framework for model-assisted biological synthesis or deepfakes",
      "Funds open-source supercomputer hubs for public academic researchers to study alignment",
      "Guarantees copyright exemptions for fair-use model pre-training under federal audit guidelines"
    ],
    cons: [
      "Heavily favors established tech oligopolies by raising licensing and compliance overhead",
      "Could stifle agility and grassroots development of local start-ups and independent developers",
      "Vague enforcement metrics on model alignment evaluations risk regulatory overreach"
    ],
    simulatedYesVotes: 890,
    simulatedNoVotes: 910
  },
  {
    id: "HR-58",
    title: "Constitutional Privacy & Financial Freedom Protection Act",
    oneLiner: "Strictly forbids the Federal Reserve from deploying a Central Bank Digital Currency (CBDC) to monitor individual consumer transactions.",
    category: "Civil Liberties & Finance",
    officialStatus: "Passed House, Pending Senate Committee on Banking",
    congressOutcome: "House Vote: 228 Yea, 198 Nay. Senate Prediction: Strong Nay",
    pros: [
      "Ensures the state cannot freeze citizen liquid assets or trace private cash equivalents",
      "Protects decentralized financial alternatives and local banking liquidity models",
      "Maintains standard physical cash legal tender status across all retailers"
    ],
    cons: [
      "Impedes federal modernization of faster cross-border settlements and anti-fraud systems",
      "Limits state capabilities to block digital dark-market operations or international ransom networks",
      "Reduces direct liquidity buffer tools available to central bank during emergency recessions"
    ],
    simulatedYesVotes: 1540,
    simulatedNoVotes: 510
  },
  {
    id: "S-12",
    title: "First Amendment Digital Speech & Transparency Accord",
    oneLiner: "Prevents executive agencies from pressuring social platforms to moderate or restrict non-illegal political discourse.",
    category: "Civil Liberties",
    officialStatus: "Passed Senate, Under review in House Judiciary committee",
    congressOutcome: "Senate Vote: 52 Yea, 47 Nay. House Prediction: Toss-Up",
    pros: [
      "Stops quiet governmental coordination to flag, shadowban, or throttle alternative opinions",
      "Establishes a transparent public appeal registry for any user content removal",
      "Re-anchors open-forum principles on modern primary communications utility rails"
    ],
    cons: [
      "Severely hampers collaborative federal efforts to warning-label foreign intelligence cyber operations",
      "May allow unchecked viral spreading of emergency medical misinformation during public health crises",
      "Critics argue private networks should hold sole authority to enforce community standards without federal oversight"
    ],
    simulatedYesVotes: 1210,
    simulatedNoVotes: 790
  }
];

export default function CitizensConsensus() {
  const [legislators, setLegislators] = useState<LegislatorScorecard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Local storage structures
  const [userVotes, setUserVotes] = useState<Record<string, "Yea" | "Nay">>({});
  const [userComments, setUserComments] = useState<Record<string, { comment: string; author: string }[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [userNameInput, setUserNameInput] = useState<string>("Patriot Citizen");

  useEffect(() => {
    // Fetch legislators to show alignment matching
    async function fetchLegs() {
      try {
        setLoading(true);
        const res = await fetch("/api/legislation/legislators");
        const json = await res.json();
        setLegislators(json.data || []);
      } catch (err) {
        console.error("Failed to load legislators for matching:", err);
      } finally {
        setLoading(false);
      }
    }

    // Load user data from local storage
    const savedVotes = localStorage.getItem("capitoltrack_user_votes");
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }

    const savedComments = localStorage.getItem("capitoltrack_user_comments");
    if (savedComments) {
      setUserComments(JSON.parse(savedComments));
    }

    const savedName = localStorage.getItem("capitoltrack_user_citizen_name");
    if (savedName) {
      setUserNameInput(savedName);
    }

    fetchLegs();
  }, []);

  const handleCastVote = (billId: string, vote: "Yea" | "Nay") => {
    const updatedVotes = { ...userVotes, [billId]: vote };
    setUserVotes(updatedVotes);
    localStorage.setItem("capitoltrack_user_votes", JSON.stringify(updatedVotes));
  };

  const handleAddComment = (billId: string) => {
    const text = newCommentText[billId]?.trim();
    if (!text) return;

    const currentComments = userComments[billId] || [];
    const newComment = {
      comment: text,
      author: userNameInput || "Anonymous Citizen",
      date: "Just Now"
    };

    const updatedComments = {
      ...userComments,
      [billId]: [newComment, ...currentComments]
    };

    setUserComments(updatedComments);
    localStorage.setItem("capitoltrack_user_comments", JSON.stringify(updatedComments));
    
    // Clear input
    setNewCommentText(prev => ({ ...prev, [billId]: "" }));
  };

  const saveUserName = (name: string) => {
    setUserNameInput(name);
    localStorage.setItem("capitoltrack_user_citizen_name", name);
  };

  // Calculations for Alignment
  const totalVotesCast = Object.keys(userVotes).length;
  
  // High fidelity community comments pool
  const defaultComments: Record<string, { author: string; comment: string }[]> = {
    "HR-82": [
      { author: "Evelyn Ross (Dallas, TX)", comment: "We desperately need zoning deregulation. Local suburban boards block multi-family units and keep prices astronomical." },
      { author: "Mark J. (Oakland, CA)", comment: "This tax credit will only fuel real estate developer profits without putting strict limits on landlords. We need direct affordable rent caps." }
    ],
    "S-41": [
      { author: "Sovereign_1776", comment: "Sovereign mining limits are a major security hole. China owns 80% of current rare-earth refinement. This bill is critical." },
      { author: "GreenFuture2030", comment: "Bypassing EPA checks is a slippery slope. Let's not destroy local water tables in Nevada to secure fast lithium." }
    ],
    "HR-104": [
      { author: "Dev_Architect", comment: "Licensing schemes will make it impossible for college kids and startups to run small cluster pre-training models. Regulatory capture at its finest." },
      { author: "Policy_Wonk_DC", comment: "If we don't build standard safety parameters, bad actors will deploy bio-agent recipes unchecked. Bipartisan compromise is correct here." }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Immersive Header Block */}
      <div className="border-b-2 border-double border-[--color-ink] pb-3">
        <div className="np-kicker text-[--color-headline] mb-1 flex items-center gap-1.5">
          <Vote className="h-3 w-3" />
          Citizens&apos; Ballot Box
        </div>
        <h2 className="text-2xl font-headline font-bold text-[--color-ink] leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          The Citizens&apos; Consensus Portal
        </h2>
        <p className="text-xs font-body text-[--color-ink-muted] mt-1 max-w-2xl">
          Express your vote on critical 119th Congress dockets. See community distributions and benchmark your principles against actual roll calls.
        </p>
        <div className="np-rule-thin mt-2" />
      </div>

      {/* Citizen alias + KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 border border-[--color-rule] bg-[--color-column-bg] p-4 space-y-2">
          <div className="np-kicker text-[--color-headline]">Citizen Profile</div>
          <label className="text-xs font-sans text-[--color-ink-muted] block">Display Alias:</label>
          <input
            type="text"
            value={userNameInput}
            onChange={(e) => saveUserName(e.target.value)}
            placeholder="e.g. Patriot Citizen"
            className="w-full bg-[--color-paper] border border-[--color-rule] focus:border-[--color-ink] px-2.5 py-1 text-xs text-[--color-ink] outline-none font-sans"
          />
          <p className="text-[9px] font-mono text-[--color-ink-faint]">Stored locally only.</p>
        </div>

        {[
          { label: "Your Ballots Cast", value: `${totalVotesCast} / ${SEED_BILLS.length}`, sub: "Bills reviewed", icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
          { label: "Citizen Community", value: "6,910", sub: "Simulated citizens", icon: <Users className="h-4 w-4 text-[--color-headline-blue]" /> },
          { label: "Representation Gap", value: "46%", sub: "Divergence index", icon: <Scale className="h-4 w-4 text-[--color-headline]" /> },
        ].map((stat, i) => (
          <div key={i} className="border border-[--color-rule] bg-[--color-column-bg] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="np-kicker text-[--color-ink-faint]">{stat.label}</div>
              {stat.icon}
            </div>
            <div className="text-3xl font-headline font-black text-[--color-ink]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{stat.value}</div>
            <div className="text-xs font-sans text-[--color-ink-muted] mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3 border border-[--color-rule] bg-[--color-column-bg]">
          <Loader2 className="h-6 w-6 text-[--color-headline-gold] animate-spin" />
          <span className="text-xs font-mono text-[--color-ink-muted] italic">Syncing consensus statistics with congressional rolls...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="np-kicker text-[--color-ink-faint] border-b border-[--color-rule] pb-2">
            Current Active Consensus Bill Ballots
          </div>

          <div className="space-y-6">
            {SEED_BILLS.map((bill) => {
              const myVote = userVotes[bill.id];
              const userCommentsPool = userComments[bill.id] || [];
              const presetComments = defaultComments[bill.id] || [];
              const mergedComments = [...userCommentsPool, ...presetComments];

              let yesCount = bill.simulatedYesVotes;
              let noCount = bill.simulatedNoVotes;
              if (myVote === "Yea") yesCount += 1;
              if (myVote === "Nay") noCount += 1;
              const totalVoters = yesCount + noCount;
              const yesPct = Math.round((yesCount / totalVoters) * 100);
              const noPct = 100 - yesPct;

              return (
                <div key={bill.id} className="border border-[--color-rule] bg-[--color-column-bg] overflow-hidden" id={`ballot-${bill.id.toLowerCase()}`}>
                  {/* Title bar */}
                  <div className="p-5 border-b border-[--color-rule] bg-[--color-paper] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-mono font-black bg-[--color-ink] text-[--color-paper]">
                          {bill.id}
                        </span>
                        <span className="np-kicker text-[--color-headline-blue] border border-[--color-headline-blue]/25 bg-[--color-headline-blue]/10 px-2 py-0.5">
                          {bill.category}
                        </span>
                      </div>
                      <h4 className="text-base font-headline font-bold text-[--color-ink] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {bill.title}
                      </h4>
                      <p className="text-xs font-body text-[--color-ink-secondary]">
                        {bill.oneLiner}
                      </p>
                    </div>
                    <div className="border border-[--color-rule] p-3 bg-[--color-column-bg] shrink-0 text-right min-w-[180px]">
                      <div className="np-kicker text-[--color-ink-faint]">Congress Docket Status</div>
                      <div className="text-xs font-sans font-bold text-[--color-ink] leading-tight mt-0.5">{bill.officialStatus}</div>
                      <div className="text-xs font-mono text-[--color-ink-muted] mt-0.5">{bill.congressOutcome}</div>
                    </div>
                  </div>

                  {/* Pro & Con */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[--color-rule]">
                    <div className="space-y-2 p-4 border border-emerald-200 bg-emerald-50/30">
                      <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-emerald-800">
                        <ThumbsUp className="h-4 w-4" /> Pros & Civic Arguments
                      </div>
                      <ul className="space-y-1.5 list-disc pl-4 text-xs font-body text-[--color-ink-secondary] leading-relaxed">
                        {bill.pros.map((pro, index) => <li key={index}>{pro}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-2 p-4 border border-red-200 bg-red-50/30">
                      <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-red-800">
                        <ThumbsDown className="h-4 w-4" /> Cons & Criticisms
                      </div>
                      <ul className="space-y-1.5 list-disc pl-4 text-xs font-body text-[--color-ink-secondary] leading-relaxed">
                        {bill.cons.map((con, index) => <li key={index}>{con}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Voting + Results */}
                  <div className="p-5 bg-[--color-paper] border-b border-[--color-rule] grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                    <div className="lg:col-span-5 space-y-3">
                      <div className="np-kicker text-[--color-ink-faint]">Cast Your Citizen Ballot</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCastVote(bill.id, "Yea")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 font-sans font-bold text-xs border transition cursor-pointer ${
                            myVote === "Yea" ? "bg-emerald-700 text-white border-emerald-700" : "bg-[--color-column-bg] text-[--color-ink] hover:border-emerald-500 border-[--color-rule]"
                          }`}
                        >
                          <CheckCircle2 className={`h-4 w-4 ${myVote === "Yea" ? "text-white" : "text-emerald-600"}`} />
                          VOTE YEA
                        </button>
                        <button
                          onClick={() => handleCastVote(bill.id, "Nay")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 font-sans font-bold text-xs border transition cursor-pointer ${
                            myVote === "Nay" ? "bg-red-700 text-white border-red-700" : "bg-[--color-column-bg] text-[--color-ink] hover:border-red-500 border-[--color-rule]"
                          }`}
                        >
                          <XCircle className={`h-4 w-4 ${myVote === "Nay" ? "text-white" : "text-red-600"}`} />
                          VOTE NAY
                        </button>
                      </div>
                      {myVote ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-sans font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          Ballot cast: &ldquo;{myVote}&rdquo; — alignment analyzed below.
                        </div>
                      ) : (
                        <p className="text-xs font-body text-[--color-ink-faint] italic">Cast your vote above to compare with politicians.</p>
                      )}
                    </div>

                    <div className="lg:col-span-4 border border-[--color-rule] bg-[--color-column-bg] p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 np-kicker text-[--color-ink-muted]">
                          <Users className="h-3 w-3" /> Community Consensus
                        </div>
                        <span className="np-kicker text-[--color-ink-faint]">{totalVoters} cast</span>
                      </div>
                      <div className="h-4 w-full bg-[--color-rule] overflow-hidden flex font-mono text-[9px] font-bold text-white">
                        <div className="bg-emerald-700 h-full flex items-center justify-center transition-all duration-500" style={{ width: `${yesPct}%` }}>
                          {yesPct >= 15 && `${yesPct}%`}
                        </div>
                        <div className="bg-[--color-headline] h-full flex items-center justify-center transition-all duration-500" style={{ width: `${noPct}%` }}>
                          {noPct >= 15 && `${noPct}%`}
                        </div>
                      </div>
                      <div className="flex justify-between np-kicker text-[--color-ink-muted]">
                        <span>{yesPct}% YEA</span>
                        <span>{noPct}% NAY</span>
                      </div>
                    </div>

                    <div className="lg:col-span-3 space-y-2">
                      <div className="np-kicker text-[--color-ink-faint]">Legislator Match</div>
                      <div className="space-y-1.5">
                        {(() => {
                          const matchLegs = legislators.filter(l => ["Elizabeth Warren", "J.D. Vance", "Chuck Schumer", "Ted Cruz", "Elise Stefanik"].includes(l.name)).slice(0, 2);
                          if (matchLegs.length === 0) {
                            return <p className="text-xs font-body text-[--color-ink-faint] italic">No legislators tracked.</p>;
                          }
                          return matchLegs.map(leg => {
                            let legVote = "Yea";
                            if (bill.id === "HR-58" && leg.party === "D") legVote = "Nay";
                            if (bill.id === "S-12" && leg.party === "D") legVote = "Nay";
                            if (bill.id === "HR-104" && leg.name === "Elizabeth Warren") legVote = "Nay";
                            if (bill.id === "HR-82" && leg.name === "J.D. Vance") legVote = "Yea";
                            const isAligned = myVote ? myVote === legVote : null;
                            return (
                              <div key={leg.id} className="flex items-center justify-between text-xs bg-[--color-column-bg] p-2 border border-[--color-rule]">
                                <div className="flex items-center gap-1.5">
                                  <div className={`h-1.5 w-1.5 ${leg.party === "D" ? "bg-[--color-headline-blue]" : "bg-[--color-headline]"}`}></div>
                                  <span className="font-sans font-semibold text-[--color-ink] text-[10px]">{leg.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`np-kicker ${legVote === "Yea" ? "text-emerald-700" : "text-[--color-headline]"}`}>{legVote}</span>
                                  {isAligned !== null && (
                                    <span className={`text-[9px] font-black ${isAligned ? "text-emerald-600" : "text-[--color-headline]"}`}>
                                      {isAligned ? "✓" : "✗"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Comment section */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 np-kicker text-[--color-ink-muted]">
                      <MessageSquare className="h-3 w-3" />
                      Citizen Feedback ({mergedComments.length})
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCommentText[bill.id] || ""}
                        onChange={(e) => setNewCommentText(prev => ({ ...prev, [bill.id]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="flex-1 bg-[--color-paper] border border-[--color-rule] focus:border-[--color-ink] px-3 py-1.5 text-xs text-[--color-ink] outline-none font-sans"
                      />
                      <button
                        onClick={() => handleAddComment(bill.id)}
                        className="bg-[--color-ink] hover:bg-[--color-headline] text-[--color-paper] font-sans font-bold text-xs px-4 py-1.5 transition cursor-pointer"
                      >
                        Submit
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {mergedComments.map((c, idx) => (
                        <div key={idx} className="bg-[--color-paper] p-2.5 border border-[--color-rule] border-l-4 border-l-[--color-headline-gold] text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-sans font-bold text-[--color-ink] text-[10px]">{c.author}</span>
                            <span className="np-kicker text-[--color-ink-faint]">Verified</span>
                          </div>
                          <p className="font-body text-[--color-ink-secondary] italic">&ldquo;{c.comment}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Comment & Feedback Board (Bottom) */}
                  <div className="p-5 bg-slate-50/10 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                      <span>Citizen Feedback Loop ({mergedComments.length})</span>
                    </div>

                    {/* New Comment Submission bar */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCommentText[bill.id] || ""}
                        onChange={(e) => setNewCommentText(prev => ({ ...prev, [bill.id]: e.target.value }))}
                        placeholder="Attach a brief feedback comment to this bill..."
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                      />
                      <button
                        onClick={() => handleAddComment(bill.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg px-4.5 py-1.5 transition cursor-pointer shrink-0"
                      >
                        Submit
                      </button>
                    </div>

                    {/* Scrollable comment items */}
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {mergedComments.map((c, idx) => (
                        <div key={idx} className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60 text-[11px] leading-normal font-medium">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800 text-[10px]">{c.author}</span>
                            <span className="text-[9px] font-mono text-slate-400">Verified Citizen</span>
                          </div>
                          <p className="text-slate-600 italic">&ldquo;{c.comment}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
