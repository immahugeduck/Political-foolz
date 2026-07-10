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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 mb-2">Voter Information Lookup</h2>
          <p className="text-sm text-slate-500 mb-6">
            Enter your registered voting address to find upcoming elections, polling locations, and representative information. Powered by the Google Civic Information API.
          </p>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full registered address (e.g., 1263 Pacific Ave, Santa Cruz, CA)"
              className="block w-full pl-10 pr-24 py-3 sm:text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="absolute inset-y-1.5 right-1.5 px-4 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Lookup
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {voterInfo && (
          <div className="p-6 space-y-8">
            {/* Election Details */}
            {voterInfo.election && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Upcoming Election
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="font-semibold text-blue-900 text-lg">{voterInfo.election.name}</div>
                  <div className="text-blue-700 mt-1">Date: {voterInfo.election.electionDay}</div>
                </div>
              </div>
            )}

            {/* Polling Locations */}
            {voterInfo.pollingLocations && voterInfo.pollingLocations.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Polling Locations</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {voterInfo.pollingLocations.map((loc: Record<string, any>, idx: number) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-white">
                      <div className="font-medium text-slate-900">{loc.address?.locationName || "Polling Place"}</div>
                      <div className="text-slate-600 text-sm mt-1">
                        {loc.address?.line1}<br />
                        {loc.address?.city}, {loc.address?.state} {loc.address?.zip}
                      </div>
                      {loc.pollingHours && (
                        <div className="text-sm text-slate-500 mt-3 flex items-start gap-2">
                          <span className="font-medium text-slate-700">Hours:</span> {loc.pollingHours}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* State Information */}
            {voterInfo.state && voterInfo.state.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">State Election Information</h3>
                {voterInfo.state.map((state: Record<string, any>, idx: number) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="font-bold text-lg text-slate-900 mb-3">{state.name}</div>
                    
                    {state.electionAdministrationBody && (
                      <div className="space-y-3">
                        <div className="font-medium text-slate-700">{state.electionAdministrationBody.name}</div>
                        
                        {state.electionAdministrationBody.electionInfoUrl && (
                          <a href={state.electionAdministrationBody.electionInfoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Election Information Website
                          </a>
                        )}
                        {state.electionAdministrationBody.electionRegistrationUrl && (
                          <a href={state.electionAdministrationBody.electionRegistrationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Voter Registration
                          </a>
                        )}
                        {state.electionAdministrationBody.electionRegistrationConfirmationUrl && (
                          <a href={state.electionAdministrationBody.electionRegistrationConfirmationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Confirm Registration
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Contests */}
            {voterInfo.contests && voterInfo.contests.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Ballot Contests</h3>
                <div className="space-y-4">
                  {voterInfo.contests.map((contest: Record<string, any>, idx: number) => (
                    <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <div className="font-bold text-slate-900">{contest.office || contest.referendumTitle}</div>
                        {contest.type && <div className="text-xs font-medium text-slate-500 uppercase mt-1">{contest.type}</div>}
                      </div>
                      
                      {contest.candidates && contest.candidates.length > 0 && (
                        <div className="p-4 divide-y divide-slate-100">
                          {contest.candidates.map((candidate: Record<string, any>, cIdx: number) => (
                            <div key={cIdx} className="py-3 first:pt-0 last:pb-0">
                              <div className="font-medium text-slate-900">{candidate.name}</div>
                              {candidate.party && <div className="text-sm text-slate-600">{candidate.party}</div>}
                              
                              <div className="mt-2 flex flex-wrap gap-3">
                                {candidate.candidateUrl && (
                                  <a href={candidate.candidateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800">
                                    <ExternalLink className="h-3 w-3 mr-1" /> Website
                                  </a>
                                )}
                                {candidate.email && (
                                  <a href={`mailto:${candidate.email}`} className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900">
                                    <Mail className="h-3 w-3 mr-1" /> Email
                                  </a>
                                )}
                                {candidate.phone && (
                                  <a href={`tel:${candidate.phone}`} className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900">
                                    <Phone className="h-3 w-3 mr-1" /> Phone
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {contest.referendumText && (
                        <div className="p-4 text-sm text-slate-700 bg-white">
                          <p>{contest.referendumText}</p>
                          {contest.referendumSubtitle && <p className="mt-2 text-slate-500 italic">{contest.referendumSubtitle}</p>}
                          {contest.referendumUrl && (
                            <a href={contest.referendumUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 mt-3">
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
      
      {/* Active Elections Overview (Only shown when not searching specific address) */}
      {!voterInfo && elections.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2 text-slate-700" />
            Currently Active Elections
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {elections.map((election: Record<string, any>) => (
              <div key={election.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="font-medium text-slate-900 text-sm line-clamp-2">{election.name}</div>
                <div className="text-slate-500 text-xs mt-2 flex justify-between items-center">
                  <span>{election.electionDay}</span>
                  <span className="font-mono text-slate-400">ID: {election.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
