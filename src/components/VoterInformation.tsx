import React, { useState } from "react";
import { Search, MapPin, CheckCircle, AlertTriangle, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";

export default function VoterInformation() {
  const [address, setAddress] = useState("");
  const [voterInfo, setVoterInfo] = useState<Record<string, unknown> | null>(null);
  const [elections, setElections] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchElections = async () => {
    try {
      const resp = await fetch("/api/civic/elections");
      if (!resp.ok) {
        throw new Error("Failed to fetch elections");
      }
      const data = await resp.json();
      setElections(data.elections || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError(null);
    setVoterInfo(null);

    try {
      const resp = await fetch(`/api/civic/voterinfo?address=${encodeURIComponent(address)}`);
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || "Failed to fetch voter information");
      }

      setVoterInfo(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchElections();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-double border-[--color-ink] pb-3">
        <div className="np-kicker text-[--color-headline] mb-1 flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          Civic Records
        </div>
        <h2 className="text-2xl font-headline font-bold text-[--color-ink] leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Voter Information Lookup
        </h2>
        <p className="text-xs font-body text-[--color-ink-muted] mt-1">
          Enter your registered address to find upcoming elections, polling locations, and ballot contests.
        </p>
        <div className="np-rule-thin mt-2" />
      </div>

      <div className="border border-[--color-rule] bg-[--color-column-bg] overflow-hidden">
        <div className="p-6 border-b border-[--color-rule] bg-[--color-paper]">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-[--color-ink-muted]" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 1263 Pacific Ave, Santa Cruz, CA"
              className="block w-full pl-10 pr-24 py-3 text-sm bg-[--color-column-bg] border border-[--color-rule] focus:border-[--color-ink] outline-none text-[--color-ink] font-sans"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="absolute inset-y-1.5 right-1.5 px-4 bg-[--color-ink] text-[--color-paper] text-xs font-sans font-bold hover:bg-[--color-headline] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-[--color-paper] border-t-transparent" />
              ) : (
                <><Search className="h-4 w-4 mr-2" />Lookup</>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-[--color-headline]/10 text-[--color-headline] text-sm border border-[--color-headline]/30 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {voterInfo && (
          <div className="p-6 space-y-8">
            {voterInfo.election && (
              <div>
                <div className="np-kicker text-[--color-headline] mb-3 flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3" /> Upcoming Election
                </div>
                <div className="p-4 border border-[--color-rule] border-l-4 border-l-[--color-headline-blue] bg-[--color-paper]">
                  <div className="font-headline font-bold text-[--color-ink] text-base" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{(voterInfo.election as any).name}</div>
                  <div className="np-kicker text-[--color-ink-muted] mt-1">Date: {(voterInfo.election as any).electionDay}</div>
                </div>
              </div>
            )}

            {(voterInfo as any).pollingLocations?.length > 0 && (
              <div>
                <div className="np-kicker text-[--color-ink-muted] mb-3">Polling Locations</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {(voterInfo as any).pollingLocations.map((loc: Record<string, any>, idx: number) => (
                    <div key={idx} className="border border-[--color-rule] p-4 bg-[--color-column-bg]">
                      <div className="font-sans font-bold text-sm text-[--color-ink]">{loc.address?.locationName || "Polling Place"}</div>
                      <div className="font-body text-xs text-[--color-ink-secondary] mt-1 leading-relaxed">
                        {loc.address?.line1}<br />
                        {loc.address?.city}, {loc.address?.state} {loc.address?.zip}
                      </div>
                      {loc.pollingHours && (
                        <div className="text-xs font-sans text-[--color-ink-muted] mt-2">
                          <span className="font-bold">Hours:</span> {loc.pollingHours}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(voterInfo as any).state?.length > 0 && (
              <div>
                <div className="np-kicker text-[--color-ink-muted] mb-3">State Election Information</div>
                {(voterInfo as any).state.map((state: Record<string, any>, idx: number) => (
                  <div key={idx} className="border border-[--color-rule] p-4 bg-[--color-column-bg]">
                    <div className="font-headline font-bold text-[--color-ink] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{state.name}</div>
                    {state.electionAdministrationBody && (
                      <div className="space-y-2">
                        <div className="font-sans font-semibold text-sm text-[--color-ink-secondary]">{state.electionAdministrationBody.name}</div>
                        {[
                          { url: state.electionAdministrationBody.electionInfoUrl, label: "Election Information Website" },
                          { url: state.electionAdministrationBody.electionRegistrationUrl, label: "Voter Registration" },
                          { url: state.electionAdministrationBody.electionRegistrationConfirmationUrl, label: "Confirm Registration" },
                        ].filter(l => l.url).map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-sans font-bold text-[--color-headline-blue] hover:text-[--color-headline] hover:underline">
                            <ExternalLink className="h-3 w-3 mr-2" />{link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {(voterInfo as any).contests?.length > 0 && (
              <div>
                <div className="np-kicker text-[--color-ink-muted] mb-3">Ballot Contests</div>
                <div className="space-y-3">
                  {(voterInfo as any).contests.map((contest: Record<string, any>, idx: number) => (
                    <div key={idx} className="border border-[--color-rule] overflow-hidden">
                      <div className="bg-[--color-paper] px-4 py-3 border-b border-[--color-rule]">
                        <div className="font-headline font-bold text-[--color-ink] text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{contest.office || contest.referendumTitle}</div>
                        {contest.type && <div className="np-kicker text-[--color-ink-muted] mt-0.5">{contest.type}</div>}
                      </div>
                      {contest.candidates?.length > 0 && (
                        <div className="p-4 divide-y divide-[--color-rule]">
                          {contest.candidates.map((candidate: Record<string, any>, cIdx: number) => (
                            <div key={cIdx} className="py-3 first:pt-0 last:pb-0">
                              <div className="font-sans font-bold text-sm text-[--color-ink]">{candidate.name}</div>
                              {candidate.party && <div className="np-kicker text-[--color-ink-muted] mt-0.5">{candidate.party}</div>}
                              <div className="mt-2 flex flex-wrap gap-3">
                                {candidate.candidateUrl && (
                                  <a href={candidate.candidateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-sans font-bold text-[--color-headline-blue] hover:underline">
                                    <ExternalLink className="h-3 w-3 mr-1" /> Website
                                  </a>
                                )}
                                {candidate.email && (
                                  <a href={`mailto:${candidate.email}`} className="inline-flex items-center text-xs font-sans text-[--color-ink-secondary] hover:text-[--color-ink]">
                                    <Mail className="h-3 w-3 mr-1" /> Email
                                  </a>
                                )}
                                {candidate.phone && (
                                  <a href={`tel:${candidate.phone}`} className="inline-flex items-center text-xs font-sans text-[--color-ink-secondary] hover:text-[--color-ink]">
                                    <Phone className="h-3 w-3 mr-1" /> Phone
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {contest.referendumText && (
                        <div className="p-4 bg-[--color-column-bg]">
                          <p className="text-sm font-body text-[--color-ink-secondary] leading-relaxed">{contest.referendumText}</p>
                          {contest.referendumSubtitle && <p className="mt-2 text-xs font-body text-[--color-ink-muted] italic">{contest.referendumSubtitle}</p>}
                          {contest.referendumUrl && (
                            <a href={contest.referendumUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-sans font-bold text-[--color-headline-blue] hover:underline mt-3">
                              <ExternalLink className="h-3 w-3 mr-1" /> Read More
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {!voterInfo && elections.length > 0 && (
        <div className="border border-[--color-rule] bg-[--color-column-bg] p-6">
          <div className="np-kicker text-[--color-headline] mb-4 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" /> Active Elections
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {elections.map((election: Record<string, any>) => (
              <div key={election.id} className="p-4 border border-[--color-rule] bg-[--color-paper] hover:bg-[--color-paper-dark] transition-colors">
                <div className="font-sans font-bold text-sm text-[--color-ink] line-clamp-2">{election.name}</div>
                <div className="text-xs font-sans text-[--color-ink-muted] mt-2 flex justify-between">
                  <span>{election.electionDay}</span>
                  <span className="font-mono">#{election.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
