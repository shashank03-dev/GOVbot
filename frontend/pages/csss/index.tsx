import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const HERO_SLIDES = [
  { icon: '🏆', title: 'Merit Based', sub: 'For academically brilliant students' },
  { icon: '🎓', title: 'Degree Level', sub: 'Higher education scholarships' },
  { icon: '💰', title: 'Generous Grant', sub: 'Up to ₹20,000 per year' },
];

const ANNOUNCEMENTS = [
  'CSSS Portal open for Academic Year 2025-26. Applications invited for degree-level courses.',
  'Students with 80%+ marks and family income below ₹4.5L are eligible for CSSS.',
  'Central Sector Scholarship supports professional and technical courses.',
];

const STUDENT_CARDS = [
  { icon: '📢', title: 'Announcements', body: 'CSSS Portal is open for Academic Year 2025-26. Eligible students with excellent academic records can apply.', link: '#announcements', linkText: 'View all' },
  { icon: '🔑', title: 'Apply For CSSS', body: 'Login and fill your Fresh or Renewal Scholarship application for Degree-level courses.', link: '/nsp/apply?portal=csss', linkText: 'Apply Now' },
  { icon: '📊', title: 'Eligibility Check', body: 'Verify if you meet the criteria: Income < ₹4.5L, Marks > 80%, Degree course.', link: '/eligibility', linkText: 'Check Eligibility' },
  { icon: '💳', title: 'Track Payment', body: 'Track your scholarship disbursement status on PFMS portal.', link: '#', linkText: 'Track Payment' },
];

export default function CSSSHome() {
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const roles = [
    { label: 'Students', icon: '🎓', color: '#0D1B4B' },
    { label: 'Institutions', icon: '🏛️', color: '#1A2E6E' },
    { label: 'Officers', icon: '👮', color: '#274191' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#212121]">
      <Head>
        <title>CSSS : Central Sector Scholarship Scheme</title>
        <meta name="description" content="Central Sector Scholarship Scheme - Ministry of Education" />
      </Head>

      {/* TOP UTILITY BAR */}
      <div className="bg-[#0D1B4B] text-white text-xs py-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Government of India</span>
          <span className="text-gray-300">|</span>
          <span>Ministry of Education</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-white/40 px-2 py-0.5 text-[10px] hover:bg-white/10">A+</button>
          <button className="border border-white/40 px-2 py-0.5 text-[10px] hover:bg-white/10">A-</button>
        </div>
      </div>

      {/* MAIN NAV BAR */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] border border-gray-200 flex items-center justify-center text-xl">🏛️</div>
            <div className="flex items-center gap-2">
              <span className="text-[#0D1B4B] text-2xl font-black">CSSS</span>
              <div>
                <div className="text-[10px] text-gray-600 leading-tight">central sector scholarship</div>
                <div className="text-[9px] text-gray-400 leading-tight">Academic Year 2025-26</div>
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#0D1B4B]">🏠 Home</Link>
            <button className="flex items-center gap-1 hover:text-[#0D1B4B]">💬 FAQs</button>
            <button className="flex items-center gap-1 hover:text-[#0D1B4B]">📞 Helpdesk</button>
          </nav>
        </div>
      </header>

      {/* ROLE NAV TILES */}
      <div className="flex w-full overflow-x-auto">
        {roles.map((role) => (
          <button
            key={role.label}
            className="flex-1 min-w-[120px] py-4 flex flex-col items-center justify-center gap-1 text-white text-sm font-semibold transition-all"
            style={{ backgroundColor: role.color }}
          >
            <span className="text-2xl">{role.icon}</span>
            <span>{role.label}</span>
          </button>
        ))}
      </div>

      {/* HERO CAROUSEL */}
      <div
        className="relative w-full overflow-hidden py-10 px-4"
        style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #E8EAF6 50%, #F3E5F5 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #0D1B4B 0, #0D1B4B 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }} />

        <div className="relative max-w-4xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={() => setHeroSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-[#0D1B4B]"
          >‹</button>

          <div className="flex-1 flex items-center justify-center gap-8">
            {HERO_SLIDES.map((slide, i) => (
              <React.Fragment key={i}>
                <div className={`flex flex-col items-center text-center transition-all duration-300 ${i === heroSlide ? 'opacity-100 scale-105' : 'opacity-50 scale-95'}`}>
                  <div className="w-16 h-16 bg-white rounded-full shadow flex items-center justify-center text-3xl mb-2">{slide.icon}</div>
                  <div className="text-sm font-semibold text-[#212121]">{slide.title}</div>
                  <div className="text-xs text-gray-500 max-w-[120px] mt-1">{slide.sub}</div>
                </div>
                {i < HERO_SLIDES.length - 1 && (
                  <div className="hidden md:flex items-center text-[#0D1B4B] text-xl font-bold">→</div>
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() => setHeroSlide((s) => (s + 1) % HERO_SLIDES.length)}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-[#0D1B4B]"
          >›</button>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ backgroundColor: i === heroSlide ? '#0D1B4B' : '#BDBDBD' }}
            />
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Announcement ticker */}
        <div className="mb-6 overflow-hidden border-l-4 border-[#0D1B4B] bg-[#E3F2FD] py-2 px-3 flex items-center gap-2">
          <span className="text-[#0D1B4B] font-bold text-xs whitespace-nowrap">Announcements:</span>
          <div className="overflow-hidden flex-1">
            <div className="whitespace-nowrap animate-marquee text-xs text-gray-700">
              {ANNOUNCEMENTS.join('   •   ')}
            </div>
          </div>
        </div>

        {/* Scheme Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-[#E0E0E0] p-4 text-center">
            <div className="text-3xl font-bold text-[#0D1B4B]">1.5M+</div>
            <div className="text-xs text-gray-600">Beneficiaries</div>
          </div>
          <div className="bg-white border border-[#E0E0E0] p-4 text-center">
            <div className="text-3xl font-bold text-[#0D1B4B]">₹8,200 Cr</div>
            <div className="text-xs text-gray-600">Amount Disbursed</div>
          </div>
          <div className="bg-white border border-[#E0E0E0] p-4 text-center">
            <div className="text-3xl font-bold text-[#0D1B4B]">Top 20%</div>
            <div className="text-xs text-gray-600">Merit Based</div>
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {STUDENT_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-[#E0E0E0] p-5 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-[15px] text-[#212121] mb-2">{card.title}</h3>
              <p className="text-[13px] text-[#757575] leading-relaxed mb-3">{card.body}</p>
              <Link
                href={card.link}
                className="text-[13px] text-[#0D1B4B] font-semibold underline underline-offset-2 hover:text-[#1A2E6E]"
              >
                {card.linkText}
              </Link>
            </div>
          ))}
        </div>

        {/* Scheme Description */}
        <div className="bg-white border border-[#E0E0E0] p-5 mb-6">
          <h3 className="font-bold text-[15px] flex items-center gap-2 mb-4 pb-2 border-b border-[#E0E0E0]">
            <span className="text-xl">📖</span> About CSSS
          </h3>
          <div className="space-y-3 text-[13px] text-[#757575] leading-relaxed">
            <p>The Central Sector Scholarship Scheme (CSSS) is awarded to meritorious students from low-income families to meet their day-to-day expenses while pursuing higher studies.</p>
            <p><strong>Eligibility:</strong> Students with 80% or above marks in Class 12 and annual family income below ₹4.5 Lakhs pursuing regular degree courses.</p>
            <p><strong>Benefits:</strong> ₹10,000-20,000 per annum depending on course, directly credited to bank account.</p>
          </div>
          <Link
            href="/nsp/apply?portal=csss"
            className="mt-4 inline-block bg-[#0D1B4B] text-white font-bold px-6 py-2 text-sm hover:bg-[#1A2E6E] transition-colors"
          >
            Apply Now for CSSS
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E0E0E0] pt-6 pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-8 mb-4 flex-wrap">
            {['MoE', 'NIC', 'Digital India', 'GOV.IN', 'PFMS'].map((logo) => (
              <div key={logo} className="text-gray-400 text-sm font-semibold border border-gray-200 px-3 py-1">
                {logo}
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-gray-500">Last update on May 2025</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
