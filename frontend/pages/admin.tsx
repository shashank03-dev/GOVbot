import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type Application = {
  id: string;
  phone: string;
  service: string;
  status: 'pending' | 'submitted' | 'failed';
  submitted_at: string;
};

export default function AdminDashboard() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchApplications();
    const timer = setInterval(fetchApplications, 30000);
    return () => clearInterval(timer);
  }, []);

  const totalApplications = data.length;
  const submittedCount = data.filter(app => app.status === 'submitted').length;
  const failedCount = data.filter(app => app.status === 'failed').length;

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
    <div className="min-h-screen bg-[#000000] text-[#ffffff] font-mono rounded-none">
      {/* Header bar */}
      <header className="w-full flex justify-between items-center p-4 border-b border-[#22c55e]/30 rounded-none bg-[#000000]">
        <h1 className="text-xl font-bold">⚡ GovBot Admin</h1>
        <div className="bg-green-500 text-black px-3 py-1 text-sm font-bold rounded-none flex items-center justify-center">
          {totalApplications}
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border border-[#22c55e]/30 p-4 bg-[#0a0a0a] rounded-none">
            <div className="text-sm text-gray-400 mb-2 mt-1 uppercase">Total Applications</div>
            <div className="text-3xl font-bold">{loading ? '-' : totalApplications}</div>
          </div>
          <div className="border border-[#22c55e]/30 p-4 bg-[#0a0a0a] rounded-none">
            <div className="text-sm text-gray-400 mb-2 mt-1 uppercase">Submitted</div>
            <div className="text-3xl font-bold text-green-500">{loading ? '-' : submittedCount}</div>
          </div>
          <div className="border border-[#22c55e]/30 p-4 bg-[#0a0a0a] rounded-none">
            <div className="text-sm text-gray-400 mb-2 mt-1 uppercase">Failed</div>
            <div className="text-3xl font-bold text-red-500">{loading ? '-' : failedCount}</div>
          </div>
        </div>

        {/* Applications table */}
        <div className="w-full border border-[#22c55e]/30 rounded-none overflow-x-auto bg-[#000000]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] text-green-500 uppercase text-sm border-b border-[#22c55e]/30">
                <th className="p-4 text-left font-normal border-r border-[#22c55e]/10">Phone</th>
                <th className="p-4 text-left font-normal border-r border-[#22c55e]/10">Service</th>
                <th className="p-4 text-left font-normal border-r border-[#22c55e]/10">Status</th>
                <th className="p-4 text-left font-normal">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#22c55e]/30">
                    <td className="p-4 border-r border-[#22c55e]/10"><div className="h-4 bg-[#111111] animate-pulse w-24"></div></td>
                    <td className="p-4 border-r border-[#22c55e]/10"><div className="h-4 bg-[#111111] animate-pulse w-32"></div></td>
                    <td className="p-4 border-r border-[#22c55e]/10"><div className="h-6 bg-[#111111] animate-pulse w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-[#111111] animate-pulse w-36"></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    No applications yet
                  </td>
                </tr>
              ) : (
                data.map((app) => (
                  <tr key={app.id} className="border-b border-[#22c55e]/30 hover:bg-[#111111] transition-colors">
                    <td className="p-4 border-r border-[#22c55e]/10">{formatPhone(app.phone)}</td>
                    <td className="p-4 border-r border-[#22c55e]/10">{app.service}</td>
                    <td className="p-4 border-r border-[#22c55e]/10">
                      <span className={`px-2 py-1 text-xs font-bold rounded-none ${
                        app.status === 'pending' ? 'bg-yellow-500 text-black' :
                        app.status === 'submitted' ? 'bg-green-500 text-black' :
                        'bg-red-500 text-white'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4">{formatDate(app.submitted_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-6 text-center text-xs text-gray-500 bg-[#000000]">
        Auto-refreshing every 30s • Last updated: {lastRefreshed ? formatTimestamp(lastRefreshed) : '--'}
      </footer>
    </div>
  );
}
