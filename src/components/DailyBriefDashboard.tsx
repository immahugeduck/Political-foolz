import React, { useEffect, useState } from 'react';
import { generateRealDailyBrief } from '../utils/real-data-ingestion';

export default function DailyBriefDashboard({ zip = '', state = 'IN' }: { zip?: string; state?: string }) {
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRealDailyBrief(zip, state).then(data => {
      setBrief(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [zip, state]);

  if (loading) return <div className="p-12 text-center">Loading real daily congressional brief...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Daily Political Brief — {new Date().toLocaleDateString()}</h1>
      <p className="text-gray-600 mb-10">Real data from Congress.gov & unitedstates/congress • Personalized for {state}</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow">
          <h2 className="text-2xl font-semibold mb-6">Congress Today</h2>
          <pre className="text-sm bg-gray-50 p-6 rounded-2xl overflow-auto">{JSON.stringify(brief?.congressActions, null, 2)}</pre>
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow">
          <h2 className="text-2xl font-semibold mb-6">Your Representatives</h2>
          <div>{brief?.personalizedLegislators?.map((l: any) => <div key={l.id}>{l.name}</div>)}</div>
        </div>
      </div>
    </div>
  );
}
