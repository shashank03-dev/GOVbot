import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const ANNOUNCEMENTS = [
  'Portal is now open for Academic Year 2025-26 to receive applications for both Pre/Post Matric and Top Class schemes of all Ministries/Departments.',
  'NSP services are now available at Common Service Centres (CSCs). Students can avail the scholarship related services by visiting the nearby CSCs.',
  'Dear Student, if you are getting error 904 while doing face authentication, kindly update UIDAI AadhaarFACERD App from PlayStore.',
  'NPCI has launched Bharat Aadhaar Seeding Enabler (BASE) platform to facilitate Aadhaar Seeding and De-seeding activities in self-service mode.',
];

const HERO_SLIDES = [
  { icon: '🖥️', title: 'Get Yourself Registered', sub: 'Generate your One Time Registration (OTR) number' },
  { icon: '📋', title: 'Online Application', sub: 'Fill and submit your scholarship application' },
  { icon: '🎓', title: 'Scholarship Amount Credited', sub: 'Disbursement directly to your bank account' },
];

const STUDENT_CARDS = [
  { icon: '📢', title: 'Announcements', body: 'Portal is now open for Academic Year 2025-26 to receive applications for both Pre/Post Matric and Top Class schemes of all Ministries/Departments.\n\nThe students can now also start registering in the portal to get their One Time Registration (OTR) numbers.', link: '#announcements', linkText: 'View all' },
  { icon: '🎓', title: 'OTR', body: 'One Time Registration (OTR) is a unique, 14-digit number issued based on the Aadhaar/Aadhaar Enrolment ID (EID) and is applicable for the entire academic career of the student.\n\nOTR is required to apply for scholarship on National Scholarship Portal.', link: '/nsp/apply', linkText: 'Login' },
  { icon: '🔑', title: 'Apply For Scholarship', body: "Login with your OTR ID and PASSWORD to fill and check status of your Fresh and Renewal Scholarship application from AY 2024-25 onwards.", link: '/nsp/apply', linkText: 'Login' },
  { icon: '📚', title: 'Schemes on NSP', body: 'List of scholarship schemes with specification, FAQ and scheme opening and closing timeline.', link: '#', linkText: 'Schemes on NSP' },
  { icon: '👤', title: 'Application Status', body: 'For Academic Year 2022-23 and 2023-24.', link: '#', linkText: 'Login' },
  { icon: '💳', title: 'Track Your Payment', body: 'Track your scholarship disbursement status on PFMS portal.', link: '#', linkText: 'Track Your Payment' },
  { icon: '📍', title: 'Aadhaar Seva Kendra\n(Geo visualization)', body: 'Know the Aadhaar Seva Kendra nearest to your location.', link: '#', linkText: 'Aadhaar Seva Kendra' },
  { icon: '👆', title: 'Aadhaar Seeding', body: 'Check your bank account seeding status with Aadhaar.', link: '#', linkText: 'Check Bank Account (Aadhaar Linked)' },
  { icon: '♿', title: 'Check UDID details\n(For Disabled Applicants)', body: 'Check UDID details at Swavlamban Portal.', link: '#', linkText: 'UDID details' },
];

const LOWER_ANNOUNCEMENTS = [
  { title: 'Bharat Aadhaar Seeding Enabler (BASE)', body: 'NPCI has launched BASE platform to facilitate Aadhaar Seeding and De-seeding activities in self-service mode for Direct Benefit Transfer (DBT). For more details click here' },
  { title: 'NSP at Common Service Centres', body: 'NSP services are now available at Common Service Centres (CSCs). Students can avail scholarship related services by visiting the nearby CSCs. Total charges fixed at Rs 30.00 per candidate.' },
  { title: 'Error 904 Face Authentication', body: 'Dear Student, if you are getting error 904 while doing face authentication, kindly update UIDAI AadhaarFACERD App from PlayStore.' },
  { title: 'Portal Open for OTR', body: 'The Portal is open for One Time Registration (OTR) for students. Apply now.' },
];

export default function NSPHome() {
  const [heroSlide, setHeroSlide] = useState(0);
  const [activeRole, setActiveRole] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const roles = [
    { label: 'Students', icon: '🎓', color: '#C2185B' },
    { label: 'Institutions', icon: '🏛️', color: '#C62828' },
    { label: 'Officers', icon: '👮', color: '#6A1B9A' },
    { label: 'Public', icon: '👥', color: '#00796B' },
    { label: 'Fellowship', icon: '🏅', color: '#E65100' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#212121]">
      <Head>
        <title>NSP : National Scholarship Portal</title>
        <meta name="description" content="National Scholarship Portal - Government of India" />
      </Head>

      {/* TOP UTILITY BAR */}
      <div className="bg-[#1A237E] text-white text-xs py-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Government of India</span>
          <span className="text-gray-300">|</span>
          <span>Ministry of Electronics &amp; Information Technology</span>
          <span className="text-gray-300">|</span>
          <span className="font-semibold">NIC</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-white/40 px-2 py-0.5 text-[10px] hover:bg-white/10">A+</button>
          <button className="border border-white/40 px-2 py-0.5 text-[10px] hover:bg-white/10">A-</button>
          <button className="border border-white/40 px-2 py-0.5 text-[10px] hover:bg-white/10">A</button>
        </div>
      </div>

      {/* MAIN NAV BAR */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] border border-gray-200 flex items-center justify-center text-xl">🏛️</div>
            <div className="flex items-center gap-2">
              <span className="text-[#C2185B] text-2xl font-black">NSP</span>
              <div>
                <div className="text-[10px] text-gray-600 leading-tight">national scholarship</div>
                <div className="text-[10px] text-gray-600 leading-tight">portal</div>
                <div className="text-[9px] text-gray-400 leading-tight">Academic Year 2025-26</div>
              </div>
            </div>
            <div className="ml-4 text-gray-500 text-xl cursor-pointer">☰</div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <button className="flex items-center gap-1 hover:text-[#C2185B]">💬 <span>FAQs</span></button>
            <button className="flex items-center gap-1 hover:text-[#C2185B]">🔔 <span>Announcements</span></button>
            <button className="flex items-center gap-1 hover:text-[#C2185B]">📞 <span>Helpdesk</span></button>
          </nav>
        </div>
      </header>

      {/* ROLE NAV TILES */}
      <div className="flex w-full overflow-x-auto">
        {roles.map((role, i) => (
          <button
            key={role.label}
            onClick={() => setActiveRole(i)}
            className="flex-1 min-w-[120px] py-4 flex flex-col items-center justify-center gap-1 text-white text-sm font-semibold transition-all"
            style={{
              backgroundColor: role.color,
              opacity: activeRole === i ? 1 : 0.85,
              borderBottom: activeRole === i ? `3px solid rgba(0,0,0,0.3)` : '3px solid transparent',
            }}
          >
            <span className="text-2xl">{role.icon}</span>
            <span>{role.label}</span>
          </button>
        ))}
      </div>

      {/* HERO CAROUSEL */}
      <div
        className="relative w-full overflow-hidden py-10 px-4"
        style={{
          background: 'linear-gradient(135deg, #FCE4EC 0%, #FFF9C4 50%, #E8F5E9 100%)',
        }}
      >
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #C2185B 0, #C2185B 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }} />

        <div className="relative max-w-4xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={() => setHeroSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-[#C2185B]"
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
                  <div className="hidden md:flex items-center text-[#C2185B] text-xl font-bold">→</div>
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() => setHeroSlide((s) => (s + 1) % HERO_SLIDES.length)}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-[#C2185B]"
          >›</button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ backgroundColor: i === heroSlide ? '#C2185B' : '#BDBDBD' }}
            />
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* Students heading + ticker */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-[#212121] border-b-2 border-[#C2185B] inline-block pb-1">Students</h2>
        </div>

        {/* Announcement ticker */}
        <div
          id="announcements"
          className="mb-6 overflow-hidden border-l-4 border-[#C2185B] bg-[#FFF9C4] py-2 px-3 flex items-center gap-2"
        >
          <span className="text-[#C2185B] font-bold text-xs whitespace-nowrap">Announcements:</span>
          <div ref={tickerRef} className="overflow-hidden flex-1">
            <div className="whitespace-nowrap animate-marquee text-xs text-gray-700">
              {ANNOUNCEMENTS.join('   •   ')}
            </div>
          </div>
        </div>

        {/* GovBot Banner */}
        <div className="mb-6 bg-[#C2185B] text-white rounded-none p-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">🤖 GovBot — AI-powered Scholarship Assistant</div>
            <div className="text-sm text-pink-100 mt-0.5">Apply for scholarship via WhatsApp in 5 minutes. Watch GovBot fill this form live!</div>
          </div>
          <Link
            href="/nsp/apply"
            className="ml-4 bg-white text-[#C2185B] font-bold px-4 py-2 text-sm hover:bg-pink-50 transition-colors whitespace-nowrap"
          >
            ▶ Watch Live Demo
          </Link>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {STUDENT_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-[#E0E0E0] p-5 hover:shadow-lg transition-shadow group"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-[15px] text-[#212121] mb-2 whitespace-pre-line">{card.title}</h3>
              <p className="text-[13px] text-[#757575] leading-relaxed mb-3 whitespace-pre-line">{card.body}</p>
              <a
                href={card.link}
                className="text-[13px] text-[#C2185B] font-semibold underline underline-offset-2 hover:text-[#E91E8C]"
              >
                {card.linkText}
              </a>
            </div>
          ))}
        </div>

        {/* LOWER TWO-COLUMN SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Announcements list */}
          <div className="bg-white border border-[#E0E0E0] p-5">
            <h3 className="font-bold text-[15px] flex items-center gap-2 mb-4 pb-2 border-b border-[#E0E0E0]">
              <span className="text-xl">📢</span> Announcements
            </h3>
            <ul className="space-y-4">
              {LOWER_ANNOUNCEMENTS.map((ann) => (
                <li key={ann.title} className="text-[13px]">
                  <a href="#" className="text-[#C2185B] font-semibold hover:underline">{ann.title}</a>
                  <p className="text-[#757575] mt-0.5 leading-relaxed">{ann.body}</p>
                </li>
              ))}
            </ul>
            <a href="#" className="text-[#C2185B] text-sm font-semibold underline mt-4 inline-block">View more</a>
          </div>

          {/* Get your OTR */}
          <div className="bg-white border border-[#E0E0E0] p-5">
            <h3 className="font-bold text-[15px] flex items-center gap-2 mb-4 pb-2 border-b border-[#E0E0E0]">
              <span className="text-xl">🎓</span> Get your OTR
            </h3>
            <div className="space-y-3 text-[13px] text-[#757575] leading-relaxed">
              <p>One Time Registration (OTR) is a unique 14-digit number issued based on the Aadhaar/Aadhaar Enrolment ID (EID) and is applicable for the entire academic career of the student.</p>
              <p>OTR simplifies the scholarship application process, thereby eliminating the need of registration in each academic year.</p>
              <p>OTR is required to apply for scholarship on National Scholarship Portal.</p>
            </div>
            <Link
              href="/nsp/apply"
              className="mt-4 inline-block border border-[#C2185B] text-[#C2185B] font-bold px-6 py-2 text-sm hover:bg-[#C2185B] hover:text-white transition-colors"
            >
              Apply now!
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E0E0E0] pt-6 pb-4 px-4">
        {/* Logo strip */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-8 mb-4 flex-wrap">
            {['MeitY', 'NIC', 'Digital India', 'GOV.IN', 'PFMS', 'Bhashini'].map((logo) => (
              <div key={logo} className="text-gray-400 text-sm font-semibold border border-gray-200 px-3 py-1">
                {logo}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[12px] text-[#1565C0] mb-3">
            {['Copyright Policy', 'Privacy Policy', 'Terms and Conditions', 'Disclaimer', 'Hyperlink', 'Site Map'].map((link) => (
              <a key={link} href="#" className="hover:underline">{link}</a>
            ))}
          </div>
          <p className="text-center text-[11px] text-gray-500">Last update on October 2025</p>
          <p className="text-center text-[11px] text-gray-400 mt-1">
            The original text is in English. Translation into other languages is powered by the Bhashini service.
          </p>
        </div>
      </footer>

      {/* VANI floating chat widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="w-14 h-14 rounded-full bg-[#C2185B] text-white shadow-lg flex items-center justify-center text-xl hover:bg-[#AD1457] transition-colors"
          title="VANI - Virtual Assistance By NIC"
        >
          💬
        </button>
      </div>

      {/* Marquee animation */}
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
