
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TrackApplication() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
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

  if (!router.isReady || loading) {
    return (
      <div className="min-h-screen bg-black font-mono text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="space-y-2 text-center">
              <div className="h-4 bg-gray-800 w-32 mx-auto"></div>
              <div className="h-8 bg-gray-800 w-48 mx-auto"></div>
            </div>
            <div className="h-24 bg-gray-800 w-full mb-8"></div>
            <div className="border-t border-gray-800 mt-8 pt-8 space-y-4">
              <div className="h-4 bg-gray-800 w-full"></div>
              <div className="h-4 bg-gray-800 w-3/4"></div>
              <div className="h-4 bg-gray-800 w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-black font-mono text-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl text-red-500">❌ Application Not Found</h1>
          <p className="text-gray-400">Check your confirmation number</p>
          <div className="pt-4">
            <Link 
              href="/track"
              className="text-green-500 hover:text-green-400 transition-colors"
            >
              ← Search again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const phoneMask = app.phone_number 
    ? `****${String(app.phone_number).slice(-4).padStart(4, 'X')}` 
    : '****XXXX';

  return (
    <div className="min-h-screen bg-black font-mono text-white p-4">
      <div className="max-w-md mx-auto pt-16">
        <div className="mb-8">
          <div className="text-xs text-green-500 tracking-widest mb-2 font-bold uppercase">
            CONFIRMATION NUMBER
          </div>
          <div className="text-2xl break-all">
            {id}
          </div>
        </div>

        <div className="my-8">
          {app.status === 'submitted' && (
            <div className="bg-green-500 text-black text-4xl py-4 px-8 font-bold text-center">
              ✅ SUBMITTED
            </div>
          )}
          {app.status === 'pending' && (
            <div className="bg-yellow-500 text-black text-4xl py-4 px-8 font-bold text-center">
              ⏳ PENDING
            </div>
          )}
          {app.status === 'failed' && (
            <div className="bg-red-500 text-white text-4xl py-4 px-8 font-bold text-center">
              ❌ FAILED
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Service:</span>
            <span className="text-right">{app.service_name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Submitted:</span>
            <span className="text-right">{formatDate(app.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone:</span>
            <span className="text-right">{phoneMask}</span>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/track"
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            ← Check another application
          </Link>
        </div>
      </div>
    </div>
  );
}