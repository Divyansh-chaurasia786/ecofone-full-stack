'use client';

import React, { useEffect, useState } from 'react';
import ScrollReveal from '../../components/scroll-reveal';
import { api } from '../../lib/api';

const isValidSocialLink = (url: string | undefined | null) => {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed === '' || trimmed === '#' || trimmed === 'javascript:void(0)') return false;

  const normalized = trimmed.replace(/\/+$/, '');

  const genericUrls = [
    'https://linkedin.com',
    'https://www.linkedin.com',
    'https://twitter.com',
    'https://www.twitter.com',
    'https://x.com',
    'https://www.x.com',
    'https://github.com',
    'https://www.github.com',
    'linkedin.com',
    'www.linkedin.com',
    'twitter.com',
    'www.twitter.com',
    'x.com',
    'www.x.com',
    'github.com',
    'www.github.com'
  ];

  if (genericUrls.includes(normalized)) {
    return false;
  }

  return true;
};

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const data = await api.getTeamMembers();
        setTeamMembers(data || []);
      } catch (err) {
        console.error('Failed to load team members:', err);
      }
    };
    loadTeam();
  }, []);

  return (
    <div className="bg-[#FAF9F6] text-slate-850 min-h-screen">
      
      {/* 1. Full-Width Hero Section (Like Homepage) */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden bg-emerald-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="/about_hero.jpg" 
            alt="About Us Hero Background" 
            className="w-full h-full object-cover object-center opacity-100"
          />
          {/* Green to black color gradient cover (60% overlay) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#061C0F]/60 via-[#061C0F]/40 to-[#FAF9F6]"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center space-y-4 mt-20">
          <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider bg-[#0a2d1a]/85 border border-emerald-800/20 px-3.5 py-1.5 rounded-full inline-block" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            Our Story & Mission
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-wide" style={{ textShadow: '0 0 15px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.7)', fontVariantLigatures: 'none' }}>
            Redefining Smart and <span className="text-emerald-300">Profitable Retail</span>
          </h1>
          <p className="text-white/95 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto" style={{ textShadow: '0 0 10px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.7)' }}>
            EcoFone was created with a simple idea — smartphones should be accessible, reliable, and sustainable, and retail businesses should be structured, transparent, and profitable.
          </p>
        </div>
      </section>

      {/* Main Content Workspace Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Story details (Cardless sitting directly on background) */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            As the demand for affordable smartphones increased, we saw a strong gap between quality, trust, and organized retail in the refurbished market. EcoFone was built to bridge that gap. Today, we stand as a brand that blends technology, process, and purpose into a single, scalable retail ecosystem.
          </p>
        </div>

        {/* 2. What We Believe In */}
        <ScrollReveal className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-ecoOrange-600 font-bold uppercase tracking-wider bg-orange-50 border border-orange-100 px-3 py-1 rounded-full w-max mx-auto block">
              Core Beliefs
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">What We Believe In</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">Our choices are guided by four core values that keep us grounded and focused on sustainable growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-500/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Trust Before Transactions</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                We believe customer trust is the foundation of repeat business. We never cut corners on diagnostic checking, warranty fulfillment, or wholesale device pricing.
              </p>
            </div>

            <div className="space-y-3 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-ecoOrange-500/10 rounded-2xl flex items-center justify-center text-ecoOrange-600 border border-ecoOrange-500/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM9 5h6v2H9V5z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Partnership Mindset</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                We do not treat franchisees as mere sales outlets — we treat them as core business partners. Their profitability drives our corporate development strategies.
              </p>
            </div>

            <div className="space-y-3 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-500/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Systems Over Guesswork</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Our franchise model runs on structured operations and audited workflows rather than random assumptions. This builds steady, predictable returns.
              </p>
            </div>

            <div className="space-y-3 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-500/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8A7 7 0 0 1 11 20z" />
                  <path d="M19 2c-2.26 4.33-5.27 7.14-8 8" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Growth With Responsibility</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                By extending the lifecycle of premium mobile devices, we actively reduce e-waste and promote green consumption behavior across India.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* 3. Our Vision & Mission */}
        <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
          <div className="space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-500/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">Our Vision</h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              To build a nationwide network of EcoFone stores that represent consistent quality, transparent pricing, reliable service, and sustainable technology retail. We aim to become the trusted category leader in refurbished smartphone retail.
            </p>
          </div>

          <div className="space-y-4 hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-ecoOrange-500/10 rounded-2xl flex items-center justify-center text-ecoOrange-600 border border-ecoOrange-500/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">Our Mission</h2>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>To deliver certified, warranty-backed smartphones at fair prices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ecoOrange-600 font-bold">✓</span>
                <span>To build a scalable and highly profitable franchise ecosystem.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>To support entrepreneurs with complete operational and marketing assistance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ecoOrange-600 font-bold">✓</span>
                <span>To reduce e-waste by extending the lifecycle of consumer electronics.</span>
              </li>
            </ul>
          </div>
        </ScrollReveal>

        {/* 4. Our Approach & Franchise Ecosystem */}
        <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 animate-scale-in">
            <img src="/about_ops.jpg" alt="EcoFone Standard Operations" className="w-full h-auto object-cover aspect-[16/10]" />
          </div>
          <div className="space-y-4 animate-slide-up">
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full w-max block">
              Process-First Operations
            </span>
            <h3 className="font-display text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Standardized Systemic Workflows
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Every device, every store, and every franchise partner follows standardized systems designed to reduce risk and improve consistency:
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-black">•</span>
                <span>Clear quality benchmarks with multi-level diagnostic checks.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-black">•</span>
                <span>Centralized procurement & ongoing logistics support.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-black">•</span>
                <span>Market-driven, transparent pricing strategies.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-black">•</span>
                <span>Structured onboarding, store design branding, and staff training.</span>
              </li>
            </ul>
          </div>
        </ScrollReveal>

        {/* 5. Founders & Leadership Team */}
        <ScrollReveal className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider bg-[#0a2d1a] border border-emerald-800/30 px-3.5 py-1.5 rounded-full inline-block w-max mx-auto">
              Our Founders
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">Leadership Team</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              Meet the visionary minds driving EcoFone's sustainable re-commerce revolution across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
            {[
              {
                name: "Gaurav Srivastava",
                role: "Founder & CEO",
                bio: "Franchise operations specialist who scaled 150+ offline retail outlets across North India.",
                imageUrl: "/gaurav_srivastava.png",
                linkedinUrl: "https://www.linkedin.com/in/gaurav-srivastava-69506a6b"
              },
              {
                name: "Abhishek Deva",
                role: "Co-Founder",
                bio: "Ex-retail tech strategist with 12+ years building enterprise logistics frameworks in India.",
                imageUrl: "/abhishek_deva.png",
                linkedinUrl: "https://www.linkedin.com/in/abhishek-deva-62a824150"
              }
            ].map((founder, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-emerald-500/20 shadow-sm">
                  <img 
                    src={founder.imageUrl} 
                    alt={founder.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-slate-900 leading-tight">{founder.name}</h3>
                  <span className="text-xs text-ecoOrange-600 font-extrabold uppercase tracking-wider block">{founder.role}</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
                  {founder.bio}
                </p>
                {isValidSocialLink(founder.linkedinUrl) && (
                  <a 
                    href={founder.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-600 hover:scale-110 transition-all p-1 inline-flex items-center gap-1.5 text-xs font-semibold"
                    title="LinkedIn Profile"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.02-.5.1-.68a1.14 1.14 0 0 1 1-.77c.76 0 1 .52 1 1.3v4.82h2.8M6.5 8.37a1.37 1.37 0 1 0 0-2.75 1.37 1.37 0 0 0 0 2.75M8 18.5V10.13H5V18.5h3z" />
                    </svg>
                    <span>Connect</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* 6. Key Team Members */}
        {teamMembers.length > 0 && (
          <ScrollReveal className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] text-ecoOrange-600 font-extrabold uppercase tracking-wider bg-orange-50 border border-orange-100 px-3.5 py-1.5 rounded-full w-max mx-auto block">
                Operations & Support
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">Key Team Members</h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
                Our certified hardware repair specialists, diagnostic technicians, and coordinators who run day-to-day franchise operations.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="group w-[160px] sm:w-[190px] h-[230px] [perspective:1000px] cursor-pointer flex-shrink-0">
                  <div className="relative h-full w-full rounded-2xl shadow-md transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                    
                    {/* Front Face - portrait photo */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl [backface-visibility:hidden]">
                      {member.imageUrl ? (
                        <img 
                          src={member.imageUrl} 
                          alt={member.name} 
                          className="h-full w-full rounded-2xl object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full rounded-2xl bg-gradient-to-tr from-emerald-950 via-[#102d1b] to-emerald-900 flex flex-col items-center justify-center border border-emerald-800/30">
                          <span className="text-xl font-black text-emerald-400 tracking-wider">{member.initials}</span>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent rounded-2xl" />
                      <div className="absolute bottom-4 left-4 right-4 text-left">
                        <h3 className="font-display font-extrabold text-white text-xs leading-tight">{member.name}</h3>
                        <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider mt-0.5 block">{member.role}</span>
                      </div>
                    </div>

                    {/* Back Face - bio details */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-[#111827] border border-slate-800 p-4 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between text-slate-300 text-left">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-[10px] flex-shrink-0">
                            {member.initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display font-extrabold text-[11px] text-white leading-tight truncate">{member.name}</h3>
                            <span className="text-[8px] text-ecoOrange-500 font-bold uppercase tracking-wider block mt-0.5 truncate">{member.role}</span>
                          </div>
                        </div>
                        <p className="text-slate-400 text-[9px] leading-relaxed line-clamp-4">
                          {member.bio}
                        </p>
                      </div>
                      {/* Social Platform Links */}
                      <div className="space-y-2">
                        {(isValidSocialLink(member.linkedinUrl) || isValidSocialLink(member.twitterUrl) || isValidSocialLink(member.githubUrl)) && (
                          <div className="flex items-center gap-2 pb-1">
                            {isValidSocialLink(member.linkedinUrl) && (
                              <a 
                                href={member.linkedinUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-emerald-400 hover:scale-110 transition-all p-0.5"
                                title="LinkedIn Profile"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.02-.5.1-.68a1.14 1.14 0 0 1 1-.77c.76 0 1 .52 1 1.3v4.82h2.8M6.5 8.37a1.37 1.37 0 1 0 0-2.75 1.37 1.37 0 0 0 0 2.75M8 18.5V10.13H5V18.5h3z" />
                                </svg>
                              </a>
                            )}
                            {isValidSocialLink(member.twitterUrl) && (
                              <a 
                                href={member.twitterUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-emerald-400 hover:scale-110 transition-all p-0.5"
                                title="Twitter / X Profile"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              </a>
                            )}
                            {isValidSocialLink(member.githubUrl) && (
                              <a 
                                href={member.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-emerald-400 hover:scale-110 transition-all p-0.5"
                                title="GitHub Profile"
                              >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[7px] font-bold uppercase tracking-widest text-slate-500 border-t border-slate-850 pt-2">
                          <span>EcoFone Staff</span>
                          <span className="text-emerald-400">Active</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* 7. Who Can Partner & Market Opportunity */}
        <ScrollReveal className="space-y-8">
          <h2 className="font-display font-bold text-2xl text-slate-900 text-center">Unlocking Re-Commerce Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
            <div className="space-y-3">
              <span className="text-sm font-extrabold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Who Can Partner With Us</span>
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                No prior smartphone retail experience is required. Our systems are built to guide you from launch to scale. EcoFone is ideal for:
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pl-4 list-disc">
                <li>First-time entrepreneurs seeking low-risk ventures.</li>
                <li>Existing retail business owners wanting expansion.</li>
                <li>Passive investors seeking structured FICO models.</li>
                <li>Professionals looking for business diversification.</li>
              </ul>
            </div>
            <div className="space-y-3">
              <span className="text-sm font-extrabold text-ecoOrange-600 uppercase tracking-wide block border-b border-slate-200 pb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-ecoOrange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>High-Demand Market Segment</span>
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                India’s refurbished smartphone market continues to grow rapidly as customers seek premium, certified value without compromising on device reliability. EcoFone operates in this high-demand segment with an organized, technology-first approach. We ensure consistent walk-in footfall, multiple revenue streams, and healthy returns.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
