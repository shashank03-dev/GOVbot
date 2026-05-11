import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type DocType = 'income_cert' | 'caste_cert' | 'marksheet' | 'aadhaar';

interface ValidationResult {
  doc_type: string;
  issue_date: string;
  expiry_date: string | null;
  is_valid: boolean;
  days_remaining: number | null;
  status: string;
  ai_analysis?: {
    authenticity_score: number;
    issues: string[];
    details: string;
  };
}

const DOC_TYPES: { value: DocType; label: string; icon: string; validity: string }[] = [
  { value: 'income_cert', label: 'Income Certificate', icon: '💰', validity: '1 year' },
  { value: 'caste_cert', label: 'Caste Certificate', icon: '📋', validity: '3 years' },
  { value: 'marksheet', label: 'Marksheet', icon: '📊', validity: '5 years' },
  { value: 'aadhaar', label: 'Aadhaar Card', icon: '🆔', validity: 'No expiry' },
];

export default function DocumentsPage() {
  const [mounted, setMounted] = useState(false);
  const [docType, setDocType] = useState<DocType>('income_cert');
  const [issueDate, setIssueDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem('govbot_token');
    const storedPhone = localStorage.getItem('govbot_phone');
    if (!token || !storedPhone) { router.push('/'); return; }
  }, [mounted, router]);

  if (!mounted) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
    setError('');
  }

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    if (!issueDate) { setError('Please enter the issue date'); return; }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let imageB64: string | undefined;
      if (imageFile) {
        const buf = await imageFile.arrayBuffer();
        imageB64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      }

      const res = await fetch('/api/documents/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_type: docType,
          issue_date: issueDate,
          image_b64: imageB64,
        }),
      });

      if (!res.ok) throw new Error('Validation failed');
      const data: ValidationResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to validate document');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setResult(null);
    setError('');
    setImageFile(null);
    setImagePreview(null);
    setIssueDate('');
  }

  return (
    <>
      <Head>
        <title>Document Validator | GovBot</title>
        <meta name="description" content="Validate document expiry and authenticity for scholarship applications" />
      </Head>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#ff9933] transition-colors">
          ← Back to Services
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Document Validator
          </h1>
          <p className="text-sm text-slate-500 mt-1">Check expiry & validity of your certificates</p>
        </div>

        {/* Document Type Cards */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Document Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {DOC_TYPES.map(dt => (
              <button
                key={dt.value}
                onClick={() => { setDocType(dt.value); setResult(null); }}
                className={`rounded-xl p-4 text-left transition-all border ${
                  docType === dt.value
                    ? 'border-[#ff9933] bg-orange-50 shadow-md'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                <div className="text-xl mb-1">{dt.icon}</div>
                <div className="text-sm font-semibold text-slate-900">{dt.label}</div>
                <div className="text-xs text-slate-400 mt-1">Validity: {dt.validity}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Validation Form */}
        <motion.section
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleValidate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9933]/20 focus:border-[#ff9933] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Upload Document Image (optional)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#ff9933]/50 transition-colors bg-slate-50/50">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="doc-upload" />
                <label htmlFor="doc-upload" className="cursor-pointer">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto mb-2 rounded-lg" />
                  ) : (
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">📎</span>
                      </div>
                      <p className="text-sm text-slate-600">Click to upload document image</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG supported</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}

            <button
              type="submit"
              disabled={loading || !issueDate}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#ff9933] to-[#e67e00] text-white font-semibold rounded-xl shadow-md shadow-orange-200/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all text-sm"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Validate Document'}
            </button>
          </form>
        </motion.section>

        {/* Result */}
        {result && (
          <motion.section
            className={`border rounded-2xl p-6 ${result.is_valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg ${result.is_valid ? 'bg-green-500' : 'bg-red-500'}`}>
                {result.is_valid ? '✓' : '✕'}
              </div>
              <div>
                <h3 className={`text-base font-bold ${result.is_valid ? 'text-green-800' : 'text-red-800'}`}>
                  {result.status}
                </h3>
                <p className="text-xs text-slate-500">
                  {DOC_TYPES.find(d => d.value === result.doc_type)?.label || result.doc_type}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/70 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-0.5">Issue Date</div>
                <div className="font-medium text-slate-900">{result.issue_date}</div>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-0.5">Expiry Date</div>
                <div className="font-medium text-slate-900">{result.expiry_date || 'No expiry'}</div>
              </div>
              {result.days_remaining !== null && (
                <div className="bg-white/70 rounded-xl p-3 col-span-2">
                  <div className="text-xs text-slate-400 mb-0.5">Days Remaining</div>
                  <div className={`font-bold ${result.days_remaining <= 30 ? 'text-amber-600' : 'text-slate-900'}`}>
                    {result.days_remaining} days
                  </div>
                </div>
              )}
            </div>

            {result.ai_analysis && (
              <div className="mt-4 bg-white/70 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">AI Authenticity Analysis</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-600">Score:</span>
                  <span className={`font-bold ${
                    result.ai_analysis.authenticity_score >= 80 ? 'text-green-600' :
                    result.ai_analysis.authenticity_score >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {result.ai_analysis.authenticity_score}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">{result.ai_analysis.details}</p>
                {result.ai_analysis.issues.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {result.ai_analysis.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-amber-600">⚠ {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              onClick={resetForm}
              className="mt-4 w-full py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              Validate Another
            </button>
          </motion.section>
        )}
      </div>
    </>
  );
}
