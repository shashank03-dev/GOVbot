import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/AnimatedCounter';
import StatusBadge from '@/components/StatusBadge';
import { FileText, Clock, CheckCircle, XCircle, ExternalLink, ArrowRight } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

type Application = {
  id: string;
  service: string;
  status: 'pending' | 'submitted' | 'failed';
  confirmation_number?: string;
  submitted_at: string;
};

export default function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('govbot_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const phone = localStorage.getItem('govbot_phone');
    if (!phone) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('phone', phone)
          .order('submitted_at', { ascending: false });

        if (error) throw error;
        if (data) setApps(data as Application[]);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const totalApps = apps.length;
  const submittedCount = apps.filter(a => a.status === 'submitted').length;
  const pendingCount = apps.filter(a => a.status === 'pending').length;
  const failedCount = apps.filter(a => a.status === 'failed').length;

  const stats = [
    { label: 'Total', value: totalApps, icon: FileText, color: '#ff9933', bg: '#fff7ed' },
    { label: 'Submitted', value: submittedCount, icon: CheckCircle, color: '#0d9488', bg: '#f0fdfa' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Failed', value: failedCount, icon: XCircle, color: '#ef4444', bg: '#fef2f2' },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'Z');
    const IST = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(IST.getUTCDate())}/${pad(IST.getUTCMonth() + 1)}/${IST.getUTCFullYear()}, ${pad(IST.getUTCHours())}:${pad(IST.getUTCMinutes())}`;
  };

  return (
    <>
      <Head>
        <title>Dashboard | GovBot</title>
        <meta name="description" content="View and manage your scholarship applications" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              My Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage your scholarship applications</p>
          </div>
          <Link
            href="/services"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff9933] to-[#e67e00] text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-200/50 hover:shadow-orange-300/60 hover:-translate-y-0.5 transition-all"
          >
            Browse Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {loading ? '-' : <AnimatedCounter end={stat.value} />}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Applications table */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">{apps.length} total</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading applications...</div>
          ) : apps.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-[#ff9933]" />
              </div>
              <p className="text-slate-500 mb-4">No applications yet</p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#ff9933] hover:text-[#e67e00] transition-colors"
              >
                Browse Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Confirmation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {apps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{app.service}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {app.confirmation_number || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(app.submitted_at)}
                      </td>
                      <td className="px-6 py-4">
                        {app.confirmation_number && (
                          <Link
                            href={`/track/${app.confirmation_number}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ff9933] hover:text-[#e67e00] transition-colors"
                          >
                            Track <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
