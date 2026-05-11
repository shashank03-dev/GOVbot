import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CredentialCard from '@/components/CredentialCard';
import AnimatedCounter from '@/components/AnimatedCounter';

interface Credential {
  credential_id: string;
  confirmation_number: string;
  scholarship_type: string;
  amount: number;
  issued_at: string;
  revoked: boolean;
  verify_url: string;
}

interface WalletData {
  phone: string;
  total_credentials: number;
  credentials: Credential[];
  total_amount: number;
}

export default function CredentialWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get phone from localStorage (set during OTP verification)
    const phone = localStorage.getItem('govbot_phone');
    
    if (!phone) {
      setError('Please login first');
      setLoading(false);
      return;
    }

    fetchWalletData(phone);
  }, []);

  const fetchWalletData = async (phone: string) => {
    try {
      const response = await fetch(`/api/credentials/${phone}`);
      const data = await response.json();
      
      if (data.credentials) {
        // Calculate totals
        const total = data.credentials.reduce((sum: number, c: Credential) => sum + c.amount, 0);
        setWallet({
          phone: data.phone,
          total_credentials: data.total,
          credentials: data.credentials,
          total_amount: total,
        });
      }
    } catch (err) {
      setError('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono">Loading credentials...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-400 font-mono mb-4">{error}</div>
          <Link href="/" className="text-green-400 hover:underline font-mono">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Credentials | GovBot</title>
      </Head>

      <div className="min-h-screen bg-black p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  🎓 Credential Wallet
                </h1>
                <p className="text-gray-400 font-mono text-sm">
                  Blockchain-verified scholarship credentials
                </p>
              </div>
              <Link
                href="/dashboard"
                className="text-green-400 hover:text-green-300 font-mono text-sm"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Stats Cards with Animated Counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div 
              className="bg-gray-900 border border-green-500/30 rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
            >
              <div className="text-green-400 font-mono text-sm uppercase mb-2">
                Total Credentials
              </div>
              <div className="text-3xl font-bold text-white">
                <AnimatedCounter end={wallet?.total_credentials || 0} />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-900 border border-green-500/30 rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="text-green-400 font-mono text-sm uppercase mb-2">
                Total Scholarships
              </div>
              <div className="text-3xl font-bold text-white">
                <AnimatedCounter 
                  end={wallet?.total_amount || 0} 
                  prefix="₹"
                  formatter={(v) => Math.round(v).toLocaleString('en-IN')}
                />
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-900 border border-green-500/30 rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="text-green-400 font-mono text-sm uppercase mb-2">
                Blockchain
              </div>
              <div className="text-lg font-bold text-white">
                Polygon Mumbai
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Testnet (Free)
              </div>
            </motion.div>
          </div>

          {/* Credentials List - Card Layout */}
          <div>
            <div className="px-6 py-4">
              <h2 className="text-lg font-bold text-white">Your Credentials</h2>
            </div>

            {wallet?.credentials && wallet.credentials.length > 0 ? (
              <motion.div 
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15 }
                  }
                }}
              >
                {wallet.credentials.map((cred, index) => (
                  <motion.div
                    key={cred.credential_id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <CredentialCard credential={cred} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-white font-bold mb-2">No Credentials Yet</h3>
                <p className="text-gray-400 mb-4">
                  Apply for a scholarship to get your first blockchain-verified credential
                </p>
                <Link
                  href="/nsp/apply"
                  className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded transition-colors"
                >
                  Apply for Scholarship
                </Link>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gray-900/50 border border-green-500/20 rounded-lg p-6">
            <h3 className="text-green-400 font-mono text-sm uppercase mb-3">
              About Blockchain Credentials
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              Your scholarship credentials are issued as W3C Verifiable Credentials on the 
              Polygon Mumbai testnet. This provides:
            </p>
            <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside">
              <li>Tamper-proof verification by employers and colleges</li>
              <li>Instant validation without contacting the scholarship portal</li>
              <li>Permanent record on the blockchain</li>
              <li>QR code sharing for quick verification</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
