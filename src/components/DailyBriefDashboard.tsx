import React, { useEffect, useState } from 'react';
import { generateRealDailyBrief } from '../utils/real-data-ingestion';

export default function DailyBriefDashboard({ zip = '', state = '' }) {
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRealDailyBrief(zip, state).then(data => {
      setBrief(data);
      setLoading(false);
    });
  }, [zip, state]);

  if (loading) return <div className="p-8">Loading today's real congressional brief...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">Daily Political Brief — {new Date().toLocaleDateString()}</h1>
      <p className="text-gray-600 mb-8">Real data from Congress + White House sources • {state && `Tailored for ${state}`}</p>
      
      {/* Populate with real brief data */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow">
          <h2 className="text-xl font-semibold mb-4">Congress Today</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(brief?.congressActions, null, 2)}</pre>
        </div>
        {/* Add more real sections */}
      </div>
    </div>
  );
}
