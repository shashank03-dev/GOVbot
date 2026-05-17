import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Calendar, MapPin, IndianRupee, GraduationCap, CreditCard,
  ScanLine, Link2, CheckCircle, AlertCircle, ChevronRight, Save, ArrowLeft
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Profile = {
  full_name?: string;
  dob?: string;
  gender?: string;
  aadhaar_last4?: string;
  address?: string;
  state?: string;
  district?: string;
  pincode?: string;
  income?: number | string;
  caste?: string;
  religion?: string;
  course_level?: string;
  institution?: string;
  marks_pct?: number | string;
  bank_account?: string;
  bank_ifsc?: string;
  bank_name?: string;
  father_name?: string;
  mother_name?: string;
  email?: string;
  digilocker_connected?: boolean;
};

type Section = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  fields: FieldDef[];
};

type FieldDef = {
  key: keyof Profile;
  label: string;
  type?: string;
  placeholder?: string;
  options?: string[];
};

const SECTIONS: Section[] = [
  {
    id: 'personal',
    label: 'Personal Info',
    icon: User,
    color: '#ff9933',
    fields: [
      { key: 'full_name', label: 'Full Name', placeholder: 'As per Aadhaar' },
      { key: 'dob', label: 'Date of Birth', type: 'date' },
      { key: 'gender', label: 'Gender', options: ['Male', 'Female', 'Other'] },
      { key: 'father_name', label: "Father's Name", placeholder: 'As per Aadhaar' },
      { key: 'mother_name', label: "Mother's Name", placeholder: 'As per Aadhaar' },
      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'example@email.com' },
      { key: 'aadhaar_last4', label: 'Aadhaar (Last 4 digits)', placeholder: 'XXXX' },
    ],
  },
  {
    id: 'address',
    label: 'Address',
    icon: MapPin,
    color: '#3b82f6',
    fields: [
      { key: 'address', label: 'Full Address', placeholder: 'Street, Area' },
      { key: 'district', label: 'District', placeholder: 'e.g. Bangalore Urban' },
      { key: 'state', label: 'State', placeholder: 'e.g. Karnataka' },
      { key: 'pincode', label: 'PIN Code', placeholder: '6-digit PIN' },
    ],
  },
  {
    id: 'financial',
    label: 'Financial & Category',
    icon: IndianRupee,
    color: '#10b981',
    fields: [
      { key: 'income', label: 'Annual Family Income (₹)', type: 'number', placeholder: 'e.g. 250000' },
      { key: 'caste', label: 'Caste Category', options: ['general', 'obc', 'sc', 'st', 'ews'] },
      { key: 'religion', label: 'Religion', options: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Other'] },
    ],
  },
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    color: '#8b5cf6',
    fields: [
      { key: 'course_level', label: 'Course Level', options: ['pre_matric', 'post_matric', 'degree', 'pg'] },
      { key: 'institution', label: 'Institution / College', placeholder: 'Full institution name' },
      { key: 'marks_pct', label: 'Marks % (Last Exam)', type: 'number', placeholder: 'e.g. 85.5' },
    ],
  },
  {
    id: 'bank',
    label: 'Bank Details',
    icon: CreditCard,
    color: '#ef4444',
    fields: [
      { key: 'bank_name', label: 'Bank Name', placeholder: 'e.g. State Bank of India' },
      { key: 'bank_ifsc', label: 'IFSC Code', placeholder: '11-character IFSC' },
      { key: 'bank_account', label: 'Account Number', placeholder: '9-18 digit account number' },
    ],
  },
];

function CompletenessBar({ pct }: { pct: number }) {
  const color = pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : pct < 90 ? '#3b82f6' : '#10b981';
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-700">Profile Completeness</span>
        <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      {pct === 100 ? (
        <p className="text-xs text-emerald-600 mt-1 font-medium">✅ Profile complete — all forms will be auto-filled!</p>
      ) : (
        <p className="text-xs text-slate-400 mt-1">{100 - pct}% remaining — complete to enable 1-tap form fill on any government portal</p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [profile, setProfile] = useState<Profile>({});
  const [completeness, setCompleteness] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('govbot_token');
    if (!token) { router.push('/login'); return; }
    const p = localStorage.getItem('govbot_phone') || '';
    setPhone(p);
    if (p) fetchProfile(p);
  }, [router]);

  const fetchProfile = async (p: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('govbot_token');
      const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(p)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || {});
        setCompleteness(data.completeness_pct || 0);
        setMissingFields(data.missing_fields || []);
      }
    } catch { /* profile may not exist yet */ }
    setLoading(false);
  };

  const saveField = useCallback(async (key: keyof Profile, value: string | number) => {
    if (!phone) return;
    setSaving(key);
    try {
      const token = localStorage.getItem('govbot_token');
      const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(phone)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || {});
        setCompleteness(data.completeness_pct || 0);
        setMissingFields(data.missing_fields || []);
        setSaved(key);
        setTimeout(() => setSaved(null), 2000);
      }
    } catch { showToast('Failed to save', 'error'); }
    setSaving(null);
  }, [phone]);

  const handleBlur = (key: keyof Profile, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = profile[key];
    if (String(current ?? '') === trimmed) return;
    const numericFields = ['income', 'marks_pct'];
    saveField(key, numericFields.includes(key) ? parseFloat(trimmed) : trimmed);
  };

  const fillFromOcr = async () => {
    if (!phone) return;
    setOcrLoading(true);
    try {
      const token = localStorage.getItem('govbot_token');
      const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(phone)}/from-ocr`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || {});
        setCompleteness(data.completeness_pct || 0);
        setMissingFields(data.missing_fields || []);
        showToast('✅ Profile auto-filled from Aadhaar OCR!');
      } else {
        showToast('No OCR data found — upload Aadhaar first', 'error');
      }
    } catch { showToast('OCR fill failed', 'error'); }
    setOcrLoading(false);
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile | GovBot</title>
        <meta name="description" content="Build your citizen profile once — GovBot auto-fills every government form for you." />
      </Head>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                My Citizen Profile
              </h1>
              <p className="text-xs text-slate-400">Filled once → auto-fills every government form</p>
            </div>
            <Link
              href="/form-fill"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold hover:bg-orange-100 transition-colors"
            >
              Auto-Fill Form <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Completeness + Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <CompletenessBar pct={completeness} />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={fillFromOcr}
                disabled={ocrLoading}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-50 text-cyan-700 rounded-xl text-xs font-semibold hover:bg-cyan-100 transition-colors disabled:opacity-50"
              >
                <ScanLine size={14} />
                {ocrLoading ? 'Filling from OCR...' : 'Auto-fill from Aadhaar OCR'}
              </button>
              <Link
                href="/digilocker/callback"
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Link2 size={14} />
                {profile.digilocker_connected ? '✅ DigiLocker Connected' : 'Connect DigiLocker'}
              </Link>
              <Link
                href="/ocr"
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                <ScanLine size={14} /> Upload Aadhaar
              </Link>
            </div>
          </div>

          {/* Section Tabs + Form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-hide">
              {SECTIONS.map(sec => {
                const Icon = sec.icon;
                const isActive = sec.id === activeSection;
                const sectionMissing = sec.fields.filter(f => missingFields.includes(f.key)).length;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${isActive ? 'border-orange-400 text-orange-600 bg-orange-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                  >
                    <Icon size={14} style={{ color: isActive ? sec.color : undefined }} />
                    {sec.label}
                    {sectionMissing > 0 && (
                      <span className="ml-1 w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] flex items-center justify-center font-bold">
                        {sectionMissing}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Fields */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentSection.fields.map(field => {
                const isSaving = saving === field.key;
                const isSaved = saved === field.key;
                const isMissing = missingFields.includes(field.key);
                const value = profile[field.key] ?? '';

                return (
                  <div key={field.key} className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      {field.label}
                      {isMissing && <AlertCircle size={11} className="text-amber-400" />}
                      {!isMissing && value && <CheckCircle size={11} className="text-emerald-400" />}
                    </label>
                    {field.options ? (
                      <select
                        defaultValue={String(value)}
                        onBlur={e => handleBlur(field.key, e.target.value)}
                        onChange={e => handleBlur(field.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                      >
                        <option value="">Select…</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type || 'text'}
                          defaultValue={String(value)}
                          placeholder={field.placeholder}
                          onBlur={e => handleBlur(field.key, e.target.value)}
                          className="w-full px-3 py-2 pr-8 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          {isSaving && <div className="w-3.5 h-3.5 border border-orange-400 border-t-transparent rounded-full animate-spin" />}
                          {isSaved && <CheckCircle size={14} className="text-emerald-500" />}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missing fields summary */}
          {missingFields.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-2">
                ⚠️ {missingFields.length} fields still missing — fill them to enable full auto-fill coverage
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missingFields.slice(0, 8).map(f => (
                  <span key={f} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                    {f.replace(/_/g, ' ')}
                  </span>
                ))}
                {missingFields.length > 8 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-lg text-xs">
                    +{missingFields.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
            <h3 className="font-bold text-base mb-1">Ready to auto-fill any form?</h3>
            <p className="text-sm text-orange-100 mb-3">Paste any government portal URL and GovBot fills it instantly from your profile.</p>
            <Link
              href="/form-fill"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors"
            >
              Try Auto-Fill <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
