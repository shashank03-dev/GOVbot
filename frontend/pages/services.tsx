import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Search, CheckCircle, Sprout, ScanLine, Landmark, FileCheck, Bell, Wallet, Link2, BarChart3, Shield, ArrowRight, Zap, User } from 'lucide-react';

const SERVICE_CARDS = [
  { icon: GraduationCap, title: 'Apply for Scholarship', description: 'Apply to NSP, PMSS, CSSS, or Minority scholarship portals', href: '/eligibility', color: '#ff9933', bg: '#fff7ed' },
  { icon: Search, title: 'Track Application', description: 'Track your application with confirmation number', href: '/track-search', color: '#3b82f6', bg: '#eff6ff' },
  { icon: CheckCircle, title: 'Check Eligibility', description: 'Answer 4 quick questions to find matching scholarships', href: '/eligibility', color: '#0d9488', bg: '#f0fdfa' },
  { icon: Sprout, title: 'PM Kisan Status', description: 'Check PM Kisan payment status with Aadhaar or Registration No.', href: '/pmkisan', color: '#16a34a', bg: '#f0fdf4' },
];

const TOOL_CARDS = [
  { icon: ScanLine, title: 'Aadhaar OCR', description: 'Upload Aadhaar photo to extract name, DOB & number', href: '/ocr', color: '#06b6d4', bg: '#ecfeff' },
  { icon: Landmark, title: 'Bank Verification', description: 'Verify bank account via NPCI penny drop', href: '/bank-verify', color: '#10b981', bg: '#ecfdf5' },
  { icon: FileCheck, title: 'Document Validator', description: 'Check expiry & validity of certificates', href: '/documents', color: '#f59e0b', bg: '#fffbeb' },
  { icon: Bell, title: 'Renewal Reminders', description: 'View & register scholarship renewal reminders', href: '/renewals', color: '#ef4444', bg: '#fef2f2' },
  { icon: Wallet, title: 'Credential Wallet', description: 'View your blockchain-verified scholarship credentials', href: '/wallet', color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: Link2, title: 'DigiLocker', description: 'Connect DigiLocker to auto-fetch your documents', href: '/digilocker', color: '#0ea5e9', bg: '#f0f9ff' },
];

const PORTAL_CARDS = [
  { id: 'nsp', name: 'NSP', full: 'National Scholarship Portal', href: '/nsp', color: '#ff9933', bg: '#fff7ed' },
  { id: 'pmss', name: 'PMSS', full: 'Post Matric Scholarship', href: '/pmss', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'csss', name: 'CSSS', full: 'Central Sector Scholarship', href: '/csss', color: '#0d9488', bg: '#f0fdfa' },
  { id: 'minority', name: 'Minority', full: 'Minority Scholarship', href: '/minority', color: '#8b5cf6', bg: '#f5f3ff' },
];

export default function ServicesHub() {
  return (
    <>
      <Head>
        <title>Services | GovBot</title>
        <meta name="description" content="Access all GovBot services — scholarships, eligibility, PM Kisan, document tools, and more." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Page header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            All Services
          </h1>
          <p className="text-sm text-slate-500 mt-1">Everything you need to navigate government scholarship schemes</p>
        </div>

        {/* Form Auto-Fill Hero */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-orange-100 uppercase tracking-wider">New</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Auto-Fill Any Government Form</h2>
              <p className="text-sm text-orange-100">
                Build your citizen profile once — GovBot fills any government portal form instantly. Works with NSP, PM Kisan, Udyam, and 100+ more portals.
              </p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
              <Link
                href="/form-fill"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-orange-600 text-sm font-bold rounded-xl hover:bg-orange-50 transition-colors"
              >
                <Zap className="w-4 h-4" /> Try Auto-Fill
              </Link>
              <Link
                href="/profile"
                className="flex items-center justify-center gap-2 px-5 py-2 bg-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/30 transition-colors"
              >
                <User className="w-4 h-4" /> Build My Profile
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Main Services */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Main Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link href={card.href} className="block h-full group">
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 h-full hover:border-slate-200 hover:shadow-lg transition-all duration-300">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: card.bg }}>
                        <Icon className="w-5.5 h-5.5" style={{ color: card.color }} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#e67e00] transition-colors mb-1">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{card.description}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Scholarship Portals */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Scholarship Portals</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PORTAL_CARDS.map((portal, i) => (
              <motion.div
                key={portal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 + 0.2 }}
              >
                <Link href={portal.href} className="block group">
                  <div className="rounded-2xl p-5 text-center border border-transparent hover:border-slate-200 hover:shadow-lg transition-all duration-300" style={{ background: portal.bg }}>
                    <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-lg font-bold shadow-md" style={{ background: `linear-gradient(135deg, ${portal.color}, ${portal.color}cc)` }}>
                      {portal.name.charAt(0)}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{portal.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{portal.full}</p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: portal.color }}>
                      Open <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tools & Utilities */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Tools & Utilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOL_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 + 0.4 }}
                >
                  <Link href={card.href} className="block group">
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-slate-200 hover:shadow-lg transition-all duration-300 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: card.bg }}>
                        <Icon className="w-5 h-5" style={{ color: card.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#e67e00] transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{card.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Admin Links */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Government Officials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/gov-dashboard" className="block group">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-slate-200 hover:shadow-lg transition-all duration-300 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#e67e00] transition-colors">Analytics Dashboard</h3>
                  <p className="text-xs text-slate-500">Overview, fraud, disbursements, regional stats</p>
                </div>
              </div>
            </Link>
            <Link href="/admin" className="block group">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-slate-200 hover:shadow-lg transition-all duration-300 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#e67e00] transition-colors">Admin Panel</h3>
                  <p className="text-xs text-slate-500">All applications & fraud flags</p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
