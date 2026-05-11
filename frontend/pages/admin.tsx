import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import StatusBadge from '@/components/StatusBadge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

type Application = {
  id: string;
  phone: string;
  service: string;
  status: 'pending' | 'submitted' | 'failed';
  submitted_at: string;
};

type FraudFlag = {
  id: string;
  aadhaar_hash: string;
  phones: string[];
  portal: string;
  flagged_at: string;
};

export default function AdminDashboard() {
  const [data, setData] = useState<Application[]>([]);
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [fraudLoading, setFraudLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'fraud'>('applications');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)


  const fetchApplications = async () => {
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      if (applications) {
        setData(applications as Application[]);
        setLastRefreshed(new Date());
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFraudFlags = async () => {
    try {
      const { data: flags, error } = await supabase
        .from('fraud_flags')
        .select('*')
        .order('flagged_at', { ascending: false });

      if (error) throw error;

      if (flags) {
        setFraudFlags(flags as FraudFlag[]);
      }
    } catch (error) {
      console.error('Error fetching fraud flags:', error);
    } finally {
      setFraudLoading(false);
    }
  };

  const clearFraudFlag = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to clear this fraud flag? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await supabase.from('fraud_flags').delete().eq('id', id);
      setFraudFlags(fraudFlags.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error clearing fraud flag:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchFraudFlags();
    const timer = setInterval(() => {
      fetchApplications();
      fetchFraudFlags();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const totalApplications = data.length;
  const submittedCount = data.filter(app => app.status === 'submitted').length;
  const failedCount = data.filter(app => app.status === 'failed').length;
  const fraudCount = fraudFlags.length;

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const last4 = cleanPhone.slice(-4);
    return `****${last4}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Append Z to treat as UTC
    const d = new Date(dateStr + 'Z');
    const IST = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(IST.getUTCDate())}/${pad(IST.getUTCMonth() + 1)}/${IST.getUTCFullYear()}, ${pad(IST.getUTCHours())}:${pad(IST.getUTCMinutes())}`;
  };



  const formatTimestamp = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Auto-refreshing every 30s {lastRefreshed && `• Last: ${formatTimestamp(lastRefreshed)}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {fraudCount > 0 && (
              <span className="bg-red-100 text-red-700 px-3 py-1.5 text-sm font-bold rounded-full">
                🚨 {fraudCount}
              </span>
            )}
            <span className="bg-green-100 text-green-700 px-3 py-1.5 text-sm font-bold rounded-full">
              {totalApplications} apps
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button onClick={() => setActiveTab('applications')} className="bg-white border border-slate-100 rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Applications</div>
            <div className="text-3xl font-bold text-slate-900">{loading ? '-' : totalApplications}</div>
          </button>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Submitted</div>
            <div className="text-3xl font-bold text-green-600">{loading ? '-' : submittedCount}</div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Failed</div>
            <div className="text-3xl font-bold text-red-500">{loading ? '-' : failedCount}</div>
          </div>
          <button onClick={() => setActiveTab('fraud')} className={`bg-white border rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-shadow ${fraudCount > 0 ? 'border-red-200' : 'border-slate-100'}`}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fraud Flags</div>
            <div className={`text-3xl font-bold ${fraudCount > 0 ? 'text-red-500' : 'text-green-600'}`}>{fraudLoading ? '-' : fraudCount}</div>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
          <button
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'applications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === 'fraud' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('fraud')}
          >
            Fraud Flags
            {fraudCount > 0 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 text-xs rounded-full">{fraudCount}</span>}
          </button>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-xs border-b border-slate-100">
                    <th className="px-5 py-3.5 text-left font-semibold tracking-wider">Phone</th>
                    <th className="px-5 py-3.5 text-left font-semibold tracking-wider">Service</th>
                    <th className="px-5 py-3.5 text-left font-semibold tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left font-semibold tracking-wider">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-24"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-32"></div></td>
                        <td className="px-5 py-4"><div className="h-6 bg-slate-100 animate-pulse rounded w-20"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-36"></div></td>
                      </tr>
                    ))
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                        No applications yet
                      </td>
                    </tr>
                  ) : (
                    data.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-sm text-slate-600 font-mono">{formatPhone(app.phone)}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-900 font-medium">{app.service}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={app.status} size="sm" />
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(app.submitted_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fraud Flags Tab */}
        {activeTab === 'fraud' && (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-50 text-red-600 uppercase text-xs border-b border-red-100">
                    <th className="px-5 py-3.5 text-left font-semibold tracking-wider">Aadhaar Hash</th>
                    <th className="px-5 py-3.5 text-left font-semibold tracking-wider">Phone Numbers</th>
                    <th className="px-5 py-3.5 text-left font-semibold tracking-wider">Portal</th>
                    <th className="px-5 py-3.5 text-left font-semibold tracking-wider">Flagged At</th>
                    <th className="px-5 py-3.5 text-left font-semibold tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fraudLoading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-32"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-24"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-16"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-28"></div></td>
                        <td className="px-5 py-4"><div className="h-8 bg-slate-100 animate-pulse rounded w-20"></div></td>
                      </tr>
                    ))
                  ) : fraudFlags.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        No fraud flags detected — all applications are from unique Aadhaar numbers
                      </td>
                    </tr>
                  ) : (
                    fraudFlags.map((flag) => (
                      <tr key={flag.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                          {flag.aadhaar_hash.slice(-8)}...
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {flag.phones.map((phone, idx) => (
                              <span key={idx} className="bg-red-100 text-red-700 px-2 py-0.5 text-xs rounded-full font-medium">
                                {formatPhone(phone)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-xs rounded-full font-medium">
                            {flag.portal || 'nsp'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">
                          {formatDate(flag.flagged_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => clearFraudFlag(flag.id)}
                            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 text-xs font-semibold rounded-full transition-colors"
                          >
                            Clear Flag
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
