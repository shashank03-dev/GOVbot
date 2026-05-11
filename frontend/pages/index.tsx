import React, { useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import AnimatedCounter from '@/components/AnimatedCounter';
import { CheckCircle, FileText, Upload, Shield, Smartphone, Bell, Award, ScanLine, ArrowRight, Zap, Globe, Users } from 'lucide-react';

const FEATURES = [
  { icon: CheckCircle, title: 'Eligibility Screener', desc: 'Answer 4 questions to find matching scholarships instantly', color: '#0d9488' },
  { icon: Globe, title: 'Multi-Portal Support', desc: 'Apply to NSP, PMSS, CSSS & Minority portals from one place', color: '#3b82f6' },
  { icon: ScanLine, title: 'Aadhaar OCR', desc: 'Extract details from your Aadhaar card using AI vision', color: '#8b5cf6' },
  { icon: FileText, title: 'Document Validator', desc: 'Check expiry & authenticity of certificates before submission', color: '#f59e0b' },
  { icon: Shield, title: 'Bank Verification', desc: 'NPCI penny drop to verify your bank account details', color: '#10b981' },
  { icon: Award, title: 'Credential Wallet', desc: 'Blockchain-verified scholarship credentials you can share', color: '#ec4899' },
  { icon: Bell, title: 'Renewal Reminders', desc: 'Never miss a scholarship renewal deadline again', color: '#ef4444' },
  { icon: Zap, title: 'Fraud Detection', desc: 'AI-powered duplicate detection protects the system', color: '#6366f1' },
];

const PORTALS = [
  { id: 'nsp', name: 'NSP', full: 'National Scholarship Portal', href: '/nsp', color: '#ff9933', bg: '#fff7ed' },
  { id: 'pmss', name: 'PMSS', full: 'Post Matric Scholarship', href: '/pmss', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'csss', name: 'CSSS', full: 'Central Sector Scholarship', href: '/csss', color: '#0d9488', bg: '#f0fdfa' },
  { id: 'minority', name: 'Minority', full: 'Minority Scholarship', href: '/minority', color: '#8b5cf6', bg: '#f5f3ff' },
];

const STEPS = [
  { step: '01', title: 'Check Eligibility', desc: 'Answer quick questions to find matching schemes', icon: CheckCircle },
  { step: '02', title: 'Upload Documents', desc: 'AI validates & extracts data from your documents', icon: Upload },
  { step: '03', title: 'Auto-Apply', desc: 'GovBot fills and submits your application to portals', icon: Smartphone },
];

function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>GovBot — AI-Powered Scholarship Assistant for India</title>
        <meta name="description" content="GovBot helps Indian students find, apply, and track government scholarships using AI. Supports NSP, PMSS, CSSS, and Minority portals." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="GovBot — AI-Powered Scholarship Assistant" />
        <meta property="og:description" content="Find and apply to government scholarships in minutes, not hours." />
        <meta property="og:type" content="website" />
      </Head>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm text-[#e67e00] font-medium mb-6"
            >
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Scholarship Assistant
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Your Scholarship Journey,{' '}
              <span className="text-gradient-saffron">Simplified</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Find eligible government scholarships, auto-fill applications, and track your status — all powered by AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/eligibility"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#ff9933] to-[#e67e00] text-white text-base font-semibold rounded-xl shadow-lg shadow-orange-200/50 hover:shadow-orange-300/60 hover:-translate-y-0.5 transition-all"
              >
                Check Eligibility
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 text-base font-semibold rounded-xl hover:border-[#ff9933] hover:text-[#e67e00] transition-all"
              >
                Login to Dashboard
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { value: 10000, suffix: '+', label: 'Students Helped' },
                { value: 50, suffix: '+', label: 'Schemes Covered' },
                { value: 4, suffix: '', label: 'Portals Supported' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Everything You Need
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From eligibility checking to form submission — GovBot handles the entire scholarship workflow.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <FadeInSection key={feat.title} delay={i * 0.05}>
                  <div className="group p-6 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-lg transition-all duration-300 h-full">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feat.color}12` }}
                    >
                      <Icon className="w-5.5 h-5.5" style={{ color: feat.color }} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1.5 group-hover:text-[#e67e00] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-20 sm:py-28 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Supported Portals
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Apply to all major government scholarship portals from a single interface.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {PORTALS.map((portal, i) => (
              <FadeInSection key={portal.id} delay={i * 0.08}>
                <Link href={portal.href} className="block group">
                  <div
                    className="p-6 rounded-2xl border border-transparent hover:border-slate-200 transition-all duration-300 text-center h-full hover:shadow-lg"
                    style={{ backgroundColor: portal.bg }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold shadow-md"
                      style={{ background: `linear-gradient(135deg, ${portal.color}, ${portal.color}cc)` }}
                    >
                      {portal.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{portal.name}</h3>
                    <p className="text-sm text-slate-500">{portal.full}</p>
                    <div className="mt-3 flex items-center justify-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: portal.color }}>
                      Open Portal <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              How It Works
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Three simple steps from discovery to application.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeInSection key={s.step} delay={i * 0.1}>
                  <div className="relative text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50 flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-7 h-7 text-[#e67e00]" />
                    </div>
                    <div className="text-xs font-bold text-[#ff9933] uppercase tracking-wider mb-2">Step {s.step}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-8 -right-4 w-8">
                        <ArrowRight className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-14 sm:px-16 sm:py-20 text-center">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Start Your Scholarship Journey Today
                </h2>
                <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
                  Join thousands of students who use GovBot to navigate government schemes effortlessly.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/eligibility"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#ff9933] to-[#e67e00] text-white text-base font-semibold rounded-xl shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50 hover:-translate-y-0.5 transition-all"
                  >
                    Check Eligibility
                    <ArrowRight className="w-4.5 h-4.5" />
                  </Link>
                  <a
                    href="https://wa.me/919999999999?text=Hi%20GovBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 border border-white/20 text-white text-base font-semibold rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Users className="w-4.5 h-4.5" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
