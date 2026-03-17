import React, { useState } from 'react';
import Head from 'next/head';

type StatusState = 'aadhaar' | 'loading' | 'result' | 'error';

interface PmKisanResult {
  name?: string;
  fatherName?: string;
  state?: string;
  district?: string;
  installmentsCount?: number | string;
  lastPaymentAmount?: string;
  lastPaymentDate?: string;
  statusBadge?: string;
  // Fallbacks in case api returns different keys
  beneficiaryName?: string;
  installmentsReceived?: string | number;
}

export default function PmKisanChecker() {
  const [state, setState] = useState<StatusState>('aadhaar');
  const [aadhaar, setAadhaar] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<PmKisanResult | null>(null);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaar.length !== 12 || !/^\d{12}$/.test(aadhaar)) {
      setErrorMsg('Aadhaar number must be exactly 12 digits.');
      return;
    }

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/pm-kisan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aadhaar }),
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 400) {
          setState('error');
          setErrorMsg('❌ No beneficiary found for this Aadhaar number');
          return;
        }
        throw new Error('Failed to fetch status');
      }

      const data = await res.json();
      setResult(data);
      setState('result');
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || 'An error occurred while fetching status.');
    }
  };

  const handleReset = () => {
    setAadhaar('');
    setResult(null);
    setErrorMsg('');
    setState('aadhaar');
  };

  return (
    <div className="min-h-screen bg-black font-mono text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>PM Kisan Status Checker</title>
      </Head>
      <div className="w-full max-w-md border border-[#22c55e] p-8">
        <h1 className="text-xl mb-2 text-[#22c55e] font-bold border-b border-[#22c55e] pb-4">
          🌾 PM Kisan Beneficiary Status
        </h1>
        
        {state === 'aadhaar' && (
          <>
            <p className="mb-6 text-sm text-gray-400">
              Check your PM Kisan Samman Nidhi installment status instantly
            </p>
            {errorMsg && (
              <div className="mb-6 p-4 border border-red-500 text-red-500 bg-red-500/10">
                {'> ERROR: '}{errorMsg}
              </div>
            )}
            <form onSubmit={handleCheckStatus} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="aadhaar" className="block text-sm text-[#22c55e]">
                  {'>'} ENTER 12-DIGIT AADHAAR NUMBER
                </label>
                <input
                  id="aadhaar"
                  type="tel"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="XXXX XXXX XXXX"
                  maxLength={12}
                  className="w-full bg-black border border-gray-600 p-3 text-white focus:outline-none focus:border-[#22c55e] placeholder-gray-700 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={aadhaar.length !== 12}
                className="w-full bg-transparent border border-[#22c55e] text-[#22c55e] font-bold py-3 px-4 hover:bg-[#22c55e] hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#22c55e] uppercase tracking-widest transition-colors"
              >
                CHECK STATUS
              </button>
            </form>
          </>
        )}

        {state === 'loading' && (
          <div className="py-12 text-center text-[#22c55e] animate-pulse">
            FETCHING BENEFICIARY DATA...
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-6 mt-6">
            <div className="p-4 border border-red-500 text-red-500 bg-red-500/10 text-center">
              {errorMsg}
            </div>
            <button
              onClick={handleReset}
              className="w-full bg-transparent border border-[#22c55e] text-[#22c55e] font-bold py-3 px-4 hover:bg-[#22c55e] hover:text-black uppercase tracking-widest transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {state === 'result' && result && (
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500">BENEFICIARY NAME</div>
                <div className="text-2xl text-[#22c55e] font-bold">{result.name || result.beneficiaryName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">FATHER'S NAME</div>
                <div className="text-md text-white">{result.fatherName || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">STATE</div>
                  <div className="text-md text-white">{result.state || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">DISTRICT</div>
                  <div className="text-md text-white">{result.district || 'N/A'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                <div>
                  <div className="text-xs text-gray-500">INSTALLMENTS</div>
                  <div className="text-xl font-bold text-white">{result.installmentsCount || result.installmentsReceived || '0'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">LAST PAYMENT</div>
                  <div className="text-xl font-bold text-[#22c55e]">
                    {result.lastPaymentAmount && result.lastPaymentAmount.toString().startsWith('₹') 
                      ? result.lastPaymentAmount 
                      : `₹${result.lastPaymentAmount || '0'}`}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">LAST PAYMENT DATE</div>
                  <div className="text-md text-white">{result.lastPaymentDate || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">STATUS</div>
                  <div className="inline-block px-2 py-1 mt-1 text-xs font-bold bg-[#22c55e] text-black uppercase">
                    {result.statusBadge || 'ACTIVE'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 space-y-4">
              <button
                onClick={handleReset}
                className="w-full bg-transparent border border-gray-600 text-gray-400 font-bold py-3 px-4 hover:border-[#22c55e] hover:text-[#22c55e] uppercase tracking-widest transition-colors"
              >
                CHECK ANOTHER
              </button>
              <a
                href="https://pmkisan.gov.in/RegistrationFormNew.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[#22c55e] hover:underline text-sm"
              >
                Apply for PM Kisan →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
