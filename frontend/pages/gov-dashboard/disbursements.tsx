import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Disbursement {
  id: string;
  confirmation_number: string;
  phone: string;
  amount: number;
  status: string;
  npci_txn_id: string | null;
  credited_at: string | null;
  created_at: string;
}

interface DisbursementSummary {
  status_counts: Record<string, number>;
  pending_amount_inr: number;
  credited_amount_inr: number;
  recent_disbursements: Disbursement[];
}

export default function DisbursementsDashboard() {
  const [summary, setSummary] = useState<DisbursementSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisbursementData();
  }, []);

  const fetchDisbursementData = async () => {
    try {
      const res = await fetch('/api/analytics/disbursements/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Disbursement data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-yellow-400 bg-yellow-500/10',
      processing: 'text-blue-400 bg-blue-500/10',
      credited: 'text-green-400 bg-green-500/10',
      failed: 'text-red-400 bg-red-500/10',
    };
    return colors[status] || 'text-gray-400 bg-gray-500/10';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400 font-mono">Loading disbursement data...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Disbursements | GovBot Analytics</title>
      </Head>

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/gov-dashboard" className="text-green-400 hover:underline text-sm mb-2 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">💰 Disbursement Tracking</h1>
              <p className="text-gray-400">Scholarship payment monitoring and NPCI transaction status</p>
            </div>
            <button
              onClick={fetchDisbursementData}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-yellow-500/30 rounded-lg p-6">
              <div className="text-yellow-400 font-mono text-sm uppercase mb-2">Pending</div>
              <div className="text-3xl font-bold text-white">
                {summary?.status_counts?.pending || 0}
              </div>
              <div className="text-yellow-400/60 text-sm mt-1">
                ₹{(summary?.pending_amount_inr || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6">
              <div className="text-green-400 font-mono text-sm uppercase mb-2">Credited</div>
              <div className="text-3xl font-bold text-white">
                {summary?.status_counts?.credited || 0}
              </div>
              <div className="text-green-400/60 text-sm mt-1">
                ₹{(summary?.credited_amount_inr || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-gray-900 border border-blue-500/30 rounded-lg p-6">
              <div className="text-blue-400 font-mono text-sm uppercase mb-2">Processing</div>
              <div className="text-3xl font-bold text-white">
                {summary?.status_counts?.processing || 0}
              </div>
            </div>
            <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6">
              <div className="text-red-400 font-mono text-sm uppercase mb-2">Failed</div>
              <div className="text-3xl font-bold text-white">
                {summary?.status_counts?.failed || 0}
              </div>
            </div>
          </div>

          {/* Recent Disbursements Table */}
          <div className="bg-gray-900 border border-green-500/30 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-green-500/20">
              <h2 className="text-lg font-bold text-white">Recent Disbursements</h2>
            </div>

            {summary?.recent_disbursements && summary.recent_disbursements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Confirmation</th>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Txn ID</th>
                      <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {summary.recent_disbursements.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4 font-mono text-xs text-green-400">
                          {d.confirmation_number}
                        </td>
                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                          {d.phone}
                        </td>
                        <td className="px-6 py-4 text-white font-bold">
                          ₹{d.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs uppercase ${getStatusColor(d.status)}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                          {d.npci_txn_id ? (
                            <span className="text-blue-400">{d.npci_txn_id}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(d.credited_at || d.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-white font-bold mb-2">No Disbursements</h3>
                <p className="text-gray-400">
                  No scholarship disbursements have been processed yet.
                </p>
              </div>
            )}
          </div>

          {/* NPCI Info */}
          <div className="mt-8 bg-gray-900/50 border border-green-500/20 rounded-lg p-6">
            <h3 className="text-green-400 font-mono text-sm uppercase mb-3">NPCI Integration</h3>
            <p className="text-gray-400 text-sm mb-3">
              Bank account verification and disbursement tracking via NPCI:
            </p>
            <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside">
              <li>Penny drop verification (₹0.01 test transaction)</li>
              <li>Real-time account validation</li>
              <li>Automatic disbursement tracking</li>
              <li>SMS/WhatsApp notifications on credit</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
