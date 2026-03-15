import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type Application = {
  id: string;
  phone: string;
  service: string;
  status: 'pending' | 'submitted' | 'failed';
  submitted_at: string;
};

export default function UserDashboard() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedPhone = localStorage.getItem('phone');

    if (!token || !storedPhone) {
      router.push('/login');
      return;
    }

    setPhone(storedPhone);
    fetchApplications(storedPhone);
  }, [router]);

  const fetchApplications = async (userPhone: string) => {
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('phone', userPhone)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      if (applications) {
        setData(applications as Application[]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('phone');
    router.push('/login');
  };

  const totalApplications = data.length;
  const submittedCount = data.filter(app => app.status === 'submitted').length;
  const pendingCount = data.filter(app => app.status === 'pending').length;
  const failedCount = data.filter(app => app.status === 'failed').length;

  const maskPhone = (p: string) => {
    if (!p) return '';
    const cleanPhone = p.replace(/[^0-9]/g, '');
    const last4 = cleanPhone.slice(-4);
    return `****${last4}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'Z');
    const IST = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(IST.getUTCDate())}/${pad(IST.getUTCMonth() + 1)}/${IST.getUTCFullYear()}, ${pad(IST.getUTCHours())}:${pad(IST.getUTCMinutes())}`;
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] font-mono rounded-none">
      <Head>
        <title>My Applications | GovBot</title>
      </Head>

      {/* Header bar */}
      <header className="w-full flex justify-between items-center p-4 border-b border-[#22c55e]/30 rounded-none bg-[#000000]">
        <div>
          <h1 className="text-xl font-bold text-[#22c55e]">My Applications</h1>
          <p className="text-sm text-gray-400 mt-1">{maskPhone(phone || '')}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[#0a0a0a] border border-[#22c55e]/30 hover:bg-[#111111] transition-colors text-sm rounded-none uppercase font-bold"
        >
          Logout
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="border border-[#22c55e]/30 p-4 bg-[#0a0a0a] rounded-none">
            <div className="text-sm text-gray-400 mb-2 mt-1 uppercase">Total</div>
            <div className="text-3xl font-bold">{loading ? '-' : totalApplications}</div>
          </div>
          <div className="border border-[#22c55e]/30 p-4 bg-[#0a0a0a] rounded-none">
            <div className="text-sm text-gray-400 mb-2 mt-1 uppercase">Submitted</div>
            <div className="text-3xl font-bold text-green-500">{loading ? '-' : submittedCount}</div>
          </div>
          <div className="border border-[#22c55e]/30 p-4 bg-[#0a0a0a] rounded-none">
            <div className="text-sm text-gray-400 mb-2 mt-1 uppercase">Pending</div>
            <div className="text-3xl font-bold text-yellow-500">{loading ? '-' : pendingCount}</div>
          </div>
          <div className="border border-[#22c55e]/30 p-4 bg-[#0a0a0a] rounded-none">
            <div className="text-sm text-gray-400 mb-2 mt-1 uppercase">Failed</div>
            <div className="text-3xl font-bold text-red-500">{loading ? '-' : failedCount}</div>
          </div>
        </div>

        {/* Applications table */}
        <div className="w-full border border-[#22c55e]/30 rounded-none overflow-x-auto bg-[#000000]">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#0a0a0a] text-green-500 uppercase text-sm border-b border-[#22c55e]/30">
                <th className="p-4 text-left font-normal border-r border-[#22c55e]/10">Service</th>
                <th className="p-4 text-left font-normal border-r border-[#22c55e]/10">Status</th>
                <th className="p-4 text-left font-normal border-r border-[#22c55e]/10">Confirmation</th>
                <th className="p-4 text-left font-normal border-r border-[#22c55e]/10">Submitted At</th>
                <th className="p-4 text-left font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading rows
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-[#22c55e]/30">
                    <td className="p-4 border-r border-[#22c55e]/10"><div className="h-4 bg-[#111111] animate-pulse w-32"></div></td>
                    <td className="p-4 border-r border-[#22c55e]/10"><div className="h-6 bg-[#111111] animate-pulse w-20"></div></td>
                    <td className="p-4 border-r border-[#22c55e]/10"><div className="h-4 bg-[#111111] animate-pulse w-24"></div></td>
                    <td className="p-4 border-r border-[#22c55e]/10"><div className="h-4 bg-[#111111] animate-pulse w-36"></div></td>
                    <td className="p-4"><div className="h-4 bg-[#111111] animate-pulse w-16"></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center border-b border-[#22c55e]/30">
                    <div className="space-y-4">
                      <p className="text-gray-400 text-lg">No applications yet.</p>
                      <p className="text-sm">Message GovBot on WhatsApp to get started!</p>
                      <a 
                        href="https://wa.me/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 px-6 py-2 bg-[#22c55e] text-black font-bold uppercase hover:bg-[#1fa951] transition-colors rounded-none"
                      >
                        Message on WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((app) => (
                  <tr key={app.id} className="border-b border-[#22c55e]/30 hover:bg-[#111111] transition-colors">
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
                    <td className="p-4 border-r border-[#22c55e]/10 font-mono text-sm">{app.id}</td>
                    <td className="p-4 border-r border-[#22c55e]/10 text-sm text-gray-300">{formatDate(app.submitted_at)}</td>
                    <td className="p-4">
                      <Link 
                        href={`/track/${app.id}`}
                        className="text-[#22c55e] hover:text-green-400 underline underline-offset-4 text-sm uppercase font-bold"
                      >
                        Track &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
