import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface FraudFlag {
  id: string;
  aadhaar_hash: string;
  phones: string[];
  portal: string;
  flagged_at: string;
}

interface FraudSummary {
  total_flags: number;
  recent_flags_7d: number;
  unique_fraudsters: number;
  recent_flags: FraudFlag[];
}

export default function FraudDashboard() {
  const [summary, setSummary] = useState<FraudSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFraudData();
  }, []);

  const fetchFraudData = async () => {
    try {
      const res = await fetch('/api/analytics/fraud/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Fraud data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maskAadhaar = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 font-mono">Loading fraud detection data...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Fraud Detection | GovBot Analytics</title>
      </Head>

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/gov-dashboard" className="text-green-400 hover:underline text-sm mb-2 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">🚨 Fraud Detection</h1>
              <p className="text-gray-400">Duplicate Aadhaar and suspicious activity monitoring</p>
            </div>
            <button
              onClick={fetchFraudData}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Alert Banner */}
          {summary && summary.total_flags > 0 ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="text-red-400 font-bold">
                    {summary.total_flags} Fraud Flags Detected
                  </div>
                  <div className="text-gray-400 text-sm">
                    {summary.recent_flags_7d} new in last 7 days • {summary.unique_fraudsters} unique Aadhaar hashes
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="text-green-400 font-bold">No Fraud Flags</div>
                  <div className="text-gray-400 text-sm">
                    All applications are passing duplicate detection checks
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6">
              <div className="text-red-400 font-mono text-sm uppercase mb-2">Total Flags</div>
              <div className="text-3xl font-bold text-white">{summary?.total_flags || 0}</div>
            </div>
            <div className="bg-gray-900 border border-yellow-500/30 rounded-lg p-6">
              <div className="text-yellow-400 font-mono text-sm uppercase mb-2">Last 7 Days</div>
              <div className="text-3xl font-bold text-white">{summary?.recent_flags_7d || 0}</div>
            </div>
            <div className="bg-gray-900 border border-orange-500/30 rounded-lg p-6">
              <div className="text-orange-400 font-mono text-sm uppercase mb-2">Unique Fraudsters</div>
              <div className="text-3xl font-bold text-white">{summary?.unique_fraudsters || 0}</div>
            </div>
          </div>

          {/* Recent Flags Table */}
          <div className="bg-gray-900 border border-green-500/30 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-green-500/20">
              <h2 className="text-lg font-bold text-white">Recent Fraud Flags</h2>
            </div>

            {summary?.recent_flags && summary.recent_flags.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Aadhaar Hash</th>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Phone Numbers</th>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Portal</th>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Flagged At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {summary.recent_flags.map((flag) => (
                      <tr key={flag.id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4 font-mono text-xs text-red-400">
                          {maskAadhaar(flag.aadhaar_hash)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {flag.phones.map((phone) => (
                              <span key={phone} className="text-gray-300 font-mono text-xs">
                                {phone}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs uppercase">
                            {flag.portal}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(flag.flagged_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🛡️</div>
                <h3 className="text-white font-bold mb-2">No Fraud Detected</h3>
                <p className="text-gray-400">
                  The fraud detection system has not flagged any suspicious activity.
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-8 bg-gray-900/50 border border-green-500/20 rounded-lg p-6">
            <h3 className="text-green-400 font-mono text-sm uppercase mb-3">About Fraud Detection</h3>
            <p className="text-gray-400 text-sm mb-3">
              GovBot automatically detects potential fraud by:
            </p>
            <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside">
              <li>Hashing and comparing Aadhaar numbers across applications</li>
              <li>Flagging when the same Aadhaar is used with different phone numbers</li>
              <li>Tracking application patterns and velocity</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
