import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface PortalData {
  count: number;
  name: string;
  submitted: number;
  approved: number;
  rejected: number;
}

interface RegionalData {
  by_portal: Record<string, PortalData>;
  note: string;
}

export default function RegionalDashboard() {
  const [data, setData] = useState<RegionalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegionalData();
  }, []);

  const fetchRegionalData = async () => {
    try {
      const res = await fetch('/api/analytics/regional');
      if (res.ok) {
        const regionalData = await res.json();
        setData(regionalData);
      }
    } catch (err) {
      console.error('Regional data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const portals = data?.by_portal || {};
  const totalApps = Object.values(portals).reduce((sum, p) => sum + p.count, 0);
  const totalApproved = Object.values(portals).reduce((sum, p) => sum + (p.approved || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono">Loading regional analytics...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Regional Analytics | GovBot Analytics</title>
      </Head>

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/gov-dashboard" className="text-green-400 hover:underline text-sm mb-2 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">🗺️ Regional Analytics</h1>
              <p className="text-gray-400">Portal-wise scholarship distribution</p>
            </div>
            <button
              onClick={fetchRegionalData}
              className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6">
              <div className="text-green-400 font-mono text-sm uppercase mb-2">Total Applications</div>
              <div className="text-3xl font-bold text-white">{totalApps.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6">
              <div className="text-green-400 font-mono text-sm uppercase mb-2">Approved</div>
              <div className="text-3xl font-bold text-white">{totalApproved.toLocaleString('en-IN')}</div>
              <div className="text-green-400/60 text-sm">
                {totalApps ? ((totalApproved / totalApps) * 100).toFixed(1) : 0}% rate
              </div>
            </div>
            <div className="bg-gray-900 border border-blue-500/30 rounded-lg p-6">
              <div className="text-blue-400 font-mono text-sm uppercase mb-2">Active Portals</div>
              <div className="text-3xl font-bold text-white">{Object.keys(portals).length}</div>
            </div>
            <div className="bg-gray-900 border border-yellow-500/30 rounded-lg p-6">
              <div className="text-yellow-400 font-mono text-sm uppercase mb-2">Pending</div>
              <div className="text-3xl font-bold text-white">
                {Object.values(portals).reduce((sum, p) => sum + (p.submitted || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Portal Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(portals).map(([key, portal]) => (
              <div key={key} className="bg-gray-900 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{portal.name}</h3>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                    {portal.count}
                  </span>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-400">Approved</span>
                      <span className="text-white">{portal.approved || 0}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${portal.count ? ((portal.approved || 0) / portal.count) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-yellow-400">Submitted</span>
                      <span className="text-white">{portal.submitted || 0}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${portal.count ? ((portal.submitted || 0) / portal.count) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400">Rejected</span>
                      <span className="text-white">{portal.rejected || 0}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${portal.count ? ((portal.rejected || 0) / portal.count) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{portal.approved || 0}</div>
                    <div className="text-xs text-gray-500 uppercase">Approved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{portal.submitted || 0}</div>
                    <div className="text-xs text-gray-500 uppercase">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{portal.rejected || 0}</div>
                    <div className="text-xs text-gray-500 uppercase">Rejected</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Note */}
          <div className="bg-gray-900/50 border border-green-500/20 rounded-lg p-6">
            <h3 className="text-green-400 font-mono text-sm uppercase mb-3">Analytics Coverage</h3>
            <p className="text-gray-400 text-sm mb-3">{data?.note}</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-800 rounded p-3">
                <div className="text-xs text-gray-500 uppercase">NSP</div>
                <div className="text-white text-sm">National Scholarship Portal</div>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <div className="text-xs text-gray-500 uppercase">PMSS</div>
                <div className="text-white text-sm">Post Matric (SC/ST)</div>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <div className="text-xs text-gray-500 uppercase">CSSS</div>
                <div className="text-white text-sm">Central Sector</div>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <div className="text-xs text-gray-500 uppercase">Minority</div>
                <div className="text-white text-sm">Minority Scholarship</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              GovBot Regional Analytics • Data from scholarship applications
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
