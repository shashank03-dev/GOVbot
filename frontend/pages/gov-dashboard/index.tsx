import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/AnimatedCounter';

interface DashboardStats {
  total_applications: number;
  status_breakdown: Record<string, number>;
  total_credentials_issued: number;
  total_disbursed_inr: number;
  verified_bank_accounts: number;
  fraud_flags: number;
  today_applications: number;
  updated_at: string;
}

interface RealtimeStats {
  last_hour_applications: number;
  active_sessions: number;
  pending_disbursements: number;
  timestamp: string;
}

export default function GovDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [realtime, setRealtime] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch overview stats
      const statsRes = await fetch('/api/analytics/overview');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      // Fetch realtime stats
      const realtimeRes = await fetch('/api/analytics/realtime');
      if (realtimeRes.ok) {
        const realtimeData = await realtimeRes.json();
        setRealtime(realtimeData);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    color = 'green',
    href
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    color?: 'green' | 'yellow' | 'red' | 'blue';
    href?: string;
  }) => {
    const colorClasses = {
      green: 'border-green-500/30 text-green-400',
      yellow: 'border-yellow-500/30 text-yellow-400',
      red: 'border-red-500/30 text-red-400',
      blue: 'border-blue-500/30 text-blue-400',
    };

    const content = (
      <div className={`bg-gray-900 border ${colorClasses[color]} rounded-lg p-6 hover:bg-gray-800/50 transition-colors`}>
        <div className="text-gray-400 font-mono text-sm uppercase mb-2">{title}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
        {subtitle && <div className="text-gray-500 text-sm mt-1">{subtitle}</div>}
      </div>
    );

    if (href) {
      return <Link href={href}>{content}</Link>;
    }
    return content;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Government Dashboard | GovBot</title>
      </Head>

      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gray-900 border-b border-green-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">🏛️ Government Analytics</h1>
              <p className="text-gray-400 text-sm">
                Real-time scholarship program monitoring
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Live Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#138808]/20 rounded-full border border-[#138808]/30">
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#138808]"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span className="text-[#138808] text-xs font-semibold uppercase tracking-wider">Live</span>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs">Last Updated</div>
                <div className="text-green-400 font-mono text-sm">
                  {lastUpdated.toLocaleTimeString('en-IN')}
                </div>
              </div>
              <motion.button
                onClick={fetchDashboardData}
                className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Refresh
              </motion.button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Realtime Stats Bar */}
          {realtime && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="text-green-400 font-mono text-xs uppercase">Last Hour</div>
                <div className="text-2xl font-bold text-white">{realtime.last_hour_applications}</div>
                <div className="text-gray-500 text-xs">Applications submitted</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-blue-400 font-mono text-xs uppercase">Active Sessions</div>
                <div className="text-2xl font-bold text-white">{realtime.active_sessions}</div>
                <div className="text-gray-500 text-xs">Users online (15min)</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-yellow-400 font-mono text-xs uppercase">Pending</div>
                <div className="text-2xl font-bold text-white">{realtime.pending_disbursements}</div>
                <div className="text-gray-500 text-xs">Disbursements queued</div>
              </div>
            </div>
          )}

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Applications"
              value={stats?.total_applications?.toLocaleString('en-IN') || 0}
              subtitle={`+${stats?.today_applications || 0} today`}
              color="green"
            />
            <StatCard
              title="Scholarships Disbursed"
              value={`₹${(stats?.total_disbursed_inr || 0).toLocaleString('en-IN')}`}
              subtitle={`${stats?.verified_bank_accounts || 0} verified accounts`}
              color="blue"
              href="/gov-dashboard/disbursements"
            />
            <StatCard
              title="Blockchain Credentials"
              value={stats?.total_credentials_issued?.toLocaleString('en-IN') || 0}
              subtitle="Verified on Polygon"
              color="green"
            />
            <StatCard
              title="Fraud Flags"
              value={stats?.fraud_flags || 0}
              subtitle="Requires review"
              color={stats?.fraud_flags ? 'red' : 'green'}
              href="/gov-dashboard/fraud"
            />
          </div>

          {/* Status Breakdown */}
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Application Status Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats?.status_breakdown || {}).map(([status, count]) => (
                <div key={status} className="bg-gray-800 rounded-lg p-4">
                  <div className="text-gray-400 text-sm capitalize">{status}</div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-gray-500 text-xs">
                    {stats?.total_applications 
                      ? `${((count / stats.total_applications) * 100).toFixed(1)}%` 
                      : '0%'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/gov-dashboard/fraud">
              <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🚨</span>
                  <h3 className="text-lg font-bold text-white">Fraud Detection</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  View duplicate Aadhaar flags and suspicious applications
                </p>
                <div className="text-red-400 font-mono text-sm">
                  {stats?.fraud_flags || 0} active flags →
                </div>
              </div>
            </Link>

            <Link href="/gov-dashboard/disbursements">
              <div className="bg-gray-900 border border-blue-500/30 rounded-lg p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">💰</span>
                  <h3 className="text-lg font-bold text-white">Disbursements</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Track scholarship payments and NPCI transaction status
                </p>
                <div className="text-blue-400 font-mono text-sm">
                  {realtime?.pending_disbursements || 0} pending →
                </div>
              </div>
            </Link>

            <Link href="/gov-dashboard/regional">
              <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🗺️</span>
                  <h3 className="text-lg font-bold text-white">Regional Analytics</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Portal-wise breakdown and geographic distribution
                </p>
                <div className="text-green-400 font-mono text-sm">
                  View reports →
                </div>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              GovBot Analytics Dashboard • Data refreshes automatically every 30 seconds
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
