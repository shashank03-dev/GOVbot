import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';

let supabase: SupabaseClient | null = null;

if (typeof window !== 'undefined') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    supabase = createClient(url, key);
  }
}

export default function TrackApplication() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;
    if (!supabase) {
      setLoading(false);
      return;
    }

    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase!
          .from('applications')
          .select('*')
          .eq('confirmation_number', id);
        if (error) throw error;
        setApp(data?.[0] || null);
      } catch (error) {
        console.error('Error fetching application:', error);
        setApp(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
    const timer = setInterval(fetchApplication, 60000);
    return () => clearInterval(timer);
  }, [router.isReady, id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'Z');
    const IST = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(IST.getUTCDate())}/${pad(IST.getUTCMonth() + 1)}/${IST.getUTCFullYear()} ${pad(IST.getUTCHours())}:${pad(IST.getUTCMinutes())}`;
  };

  const maskPhone = (phone: string) =>
    phone ? `****${String(phone).slice(-4)}` : '****XXXX';

  if (!router.isReady || loading) {
    return (
      <div className="min-h-screen bg-black font-mono text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-pulse space-y-6">
          <div className="h-4 bg-gray-800 w-32 mx-auto"></div>
          <div className="h-8 bg-gray-800 w-48 mx-auto"></div>
          <div className="h-24 bg-gray-800 w-full"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-800 w-full"></div>
            <div className="h-4 bg-gray-800 w-3/4"></div>
            <div className="h-4 bg-gray-800 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-black font-mono text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl text-red-500 font-bold">Application Not Found</h1>
          <p className="text-gray-400">Check your confirmation number and try again.</p>
          <div className="pt-6">
            <Link href="/track" className="text-green-500 hover:text-green-400 border border-green-500 px-6 py-2 transition-colors">
              ← Search Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    submitted: { bg: 'bg-green-500', text: 'text-black', label: '✅ SUBMITTED' },
    pending:   { bg: 'bg-yellow-500', text: 'text-black', label: '⏳ PENDING' },
    failed:    { bg: 'bg-red-500', text: 'text-white', label: '❌ FAILED' },
  };

  const status = statusConfig[app.status] ?? { bg: 'bg-gray-500', text: 'text-white', label: app.status?.toUpperCase() };

  return (
    <div className="min-h-screen bg-black font-mono text-white p-4">
      <div className="max-w-md mx-auto pt-16">

        {/* Header */}
        <div className="mb-2">
          <Link href="/" className="text-green-500 text-xs hover:text-green-400">⚡ GovBot</Link>
        </div>

        {/* Confirmation Number */}
        <div className="mb-8 border border-gray-800 p-4">
          <div className="text-xs text-green-500 tracking-widest mb-2 uppercase">
            Confirmation Number
          </div>
          <div className="text-xl break-all text-white">{id}</div>
        </div>

        {/* Status Badge */}
        <div className={`${status.bg} ${status.text} text-3xl py-6 px-8 font-bold text-center mb-8`}>
          {status.label}
        </div>

        {/* Details */}
        <div className="border border-gray-800 divide-y divide-gray-800">
          <div className="flex justify-between p-4">
            <span className="text-gray-500">Service</span>
            <span>{app.service || '-'}</span>
          </div>
          <div className="flex justify-between p-4">
            <span className="text-gray-500">Submitted</span>
            <span>{formatDate(app.submitted_at)}</span>
          </div>
          <div className="flex justify-between p-4">
            <span className="text-gray-500">Phone</span>
            <span>{maskPhone(app.phone)}</span>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-12 flex justify-between text-sm">
          <Link href="/track" className="text-green-500 hover:text-green-400">
            ← Check another
          </Link>
          <Link href="/dashboard" className="text-green-500 hover:text-green-400">
            My Applications →
          </Link>
        </div>

      </div>
    </div>
  );
}