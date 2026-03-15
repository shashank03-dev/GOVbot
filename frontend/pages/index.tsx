import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp.replace(/\s/g, '') })
      });

      if (!res.ok) {
        throw new Error('Failed to send OTP. Please try again.');
      }

      setStep(2);
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      if (!res.ok) {
        throw new Error('Invalid OTP. Please try again.');
      }

      const data = await res.json();
      
      const token = data.token || 'dummy-token-fallback';

      localStorage.setItem('govbot_token', token);
      localStorage.setItem('govbot_phone', phone);
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black font-mono text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md border border-[#22c55e] p-8">
        <h1 className="text-2xl mb-6 text-[#22c55e] font-bold border-b border-[#22c55e] pb-4">
          GOVBOT SYSTEM
        </h1>
        
        <div className="mb-6 text-sm text-gray-400">
          {step === 1 ? '> INITIATE SECURE LOGIN' : '> AWAITING VERIFICATION'}
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-500 text-red-500 bg-red-500/10">
            {'> ERROR: '}{error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm text-[#22c55e]">
                {'>'} ENTER PHONE NUMBER
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXXXXXXX"
                className="w-full bg-black border border-gray-600 p-3 text-white focus:outline-none focus:border-[#22c55e] placeholder-gray-700 transition-colors"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full bg-transparent border border-[#22c55e] text-[#22c55e] font-bold py-3 px-4 hover:bg-[#22c55e] hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#22c55e] uppercase tracking-widest transition-colors"
            >
              {loading ? 'PROCESSING...' : 'SEND OTP VIA WHATSAPP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm text-[#22c55e]">
                {'>'} ENTER 6-DIGIT OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                placeholder="------"
                maxLength={6}
                className="w-full bg-black border border-gray-600 p-3 text-[#22c55e] focus:outline-none focus:border-[#22c55e] tracking-[1rem] text-center text-xl transition-colors"
                disabled={loading}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#22c55e] border border-[#22c55e] text-black font-bold py-3 px-4 hover:bg-transparent hover:text-[#22c55e] disabled:opacity-50 uppercase tracking-widest transition-colors"
            >
              {loading ? 'VERIFYING...' : 'VERIFY OTP'}
            </button>
            
            <div className="pt-4 text-center">
              {resendTimer > 0 ? (
                <span className="text-gray-500 text-xs tracking-wider">
                  RESEND AVAILABLE IN {resendTimer}S
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleSendOtp(e)}
                  disabled={loading}
                  className="text-gray-400 hover:text-[#22c55e] text-xs tracking-wider uppercase transition-colors"
                >
                  {'>'} RESEND OTP
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
