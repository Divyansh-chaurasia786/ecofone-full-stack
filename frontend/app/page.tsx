'use client';

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import ReviewsCarousel from "../components/reviews-carousel";
import ScrollReveal from "../components/scroll-reveal";

const calculateRoiMetrics = (investAmt: number, isFico: boolean) => {
  // Calculation Core Logic
  const estProfit = !isFico 
    ? Math.round((investAmt * 0.15) / 12)  // FIFO: 15% Annualized
    : Math.round(investAmt * 0.03);        // FICO: 3% Monthly Fixed

  const estPayback = !isFico
    ? "24 - 30"                            // FIFO: Target window
    : "24 - 30";                           // FICO: Target recovery window
  
  return { estProfit, estPayback };
};

export default function HomePage() {
  // Card Expansion state
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Calculator state
  const [investAmt, setInvestAmt] = useState(2000000);
  const [isFoco, setIsFoco] = useState(true);
  // Dynamic metrics computed based on investment sizes
  const { estProfit, estPayback } = calculateRoiMetrics(investAmt, isFoco);
  const storeSqFt = "100 - 150";

  // Individual card simulation highlighting states
  const [profitOrange, setProfitOrange] = useState(false);
  const [paybackOrange, setPaybackOrange] = useState(false);
  const [modeOrange, setModeOrange] = useState(false);

  const prevProfitRef = useRef(estProfit);
  const prevPaybackRef = useRef(estPayback);
  const prevModeRef = useRef(isFoco);

  const profitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const paybackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (estProfit !== prevProfitRef.current) {
      setProfitOrange(true);
      if (profitTimeoutRef.current) clearTimeout(profitTimeoutRef.current);
      profitTimeoutRef.current = setTimeout(() => setProfitOrange(false), 30000);
      prevProfitRef.current = estProfit;
    }
  }, [estProfit]);

  useEffect(() => {
    if (estPayback !== prevPaybackRef.current) {
      setPaybackOrange(true);
      if (paybackTimeoutRef.current) clearTimeout(paybackTimeoutRef.current);
      paybackTimeoutRef.current = setTimeout(() => setPaybackOrange(false), 30000);
      prevPaybackRef.current = estPayback;
    }
  }, [estPayback]);

  useEffect(() => {
    if (isFoco !== prevModeRef.current) {
      setModeOrange(true);
      if (modeTimeoutRef.current) clearTimeout(modeTimeoutRef.current);
      modeTimeoutRef.current = setTimeout(() => setModeOrange(false), 30000);
      prevModeRef.current = isFoco;
    }
  }, [isFoco]);

  useEffect(() => {
    return () => {
      if (profitTimeoutRef.current) clearTimeout(profitTimeoutRef.current);
      if (paybackTimeoutRef.current) clearTimeout(paybackTimeoutRef.current);
      if (modeTimeoutRef.current) clearTimeout(modeTimeoutRef.current);
    };
  }, []);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Typing animation states
  const phrases = ["Re-Commerce Network.", "Retail Outlet Hub.", "Eco-Retail Revolution."];
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const handleTyping = () => {
      if (!isDeleting) {
        setText(currentPhrase.substring(0, text.length + 1));
        if (text.length === currentPhrase.length) {
          setTypingSpeed(1500); // Hold at full phrase
          setIsDeleting(true);
        } else {
          setTypingSpeed(75);
        }
      } else {
        setText(currentPhrase.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setTypingSpeed(400); // Pause before next phrase
        } else {
          setTypingSpeed(35);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIndex, typingSpeed]);

  const faqs = [
    {
      q: "What is the typical setup timeline for an EcoFone franchise outlet?",
      a: "On average, a franchise outlet takes 30 to 45 business days to go live. This includes location demographic surveys, corporate interior design setups, POS installation, staff onboarding, and initial inventory seed shipments."
    },
    {
      q: "What is the difference between FICO and FIFO business options?",
      a: "Under FICO (Franchise Investor, Company Operated), EcoFone handles the complete day-to-day operation, staffing, and store management while you receive steady net margin shares. Under FIFO (Franchise Investor, Franchise Operated), you manage local store retail operations directly with complete wholesale stock support from us."
    },
    {
      q: "How does the CRM lead pipeline integration work?",
      a: "When local consumers submit device trade-in requests, contact forms, or franchise applications online, queries are automatically pushed to your localized store CRM lead desk. This directs ready buyers and sellers to your physical retail storefront."
    }
  ];

  return (
    <div className="relative space-y-24 pb-24 bg-[#FAF9F6] text-slate-800">
      
      {/* 1. Hero Section (Alabaster base, high-end editorial) */}
      {/* 1. Hero Section (Oxyplant Deep Forest Green Banner) */}
      <section className="w-full relative min-h-[90vh] flex items-center border-b border-white/5 overflow-hidden pt-36 pb-20 sm:pb-28">
        {/* Background Image Cover */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100 hover:scale-[1.01]"
          style={{ backgroundImage: "url('/new_hero.jpg')" }}
        />
        {/* Branded Dark Green overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061C0F]/95 via-[#061C0F]/80 to-[#061C0F]/30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl space-y-6 text-center sm:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8A7 7 0 0 1 11 20z" />
                <path d="M19 2c-2.26 4.33-5.27 7.14-8 8" />
              </svg>
              <span>Franchise Program</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              <span className="block text-slate-100">Partner with India's</span>
              <span className="gradient-text-green mt-2 block min-h-[1.2em] break-words">
                {text}
                <span className="animate-pulse ml-1 text-emerald-400">|</span>
              </span>
            </h1>
            
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto sm:mx-0 font-medium bg-black/10 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
              Build a highly profitable, sustainable smartphone retail store. Join the EcoFone certified refurbished franchise network and tap into a ₹70,000+ Crore annual tech market backed by complete corporate support.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 pt-2">
              <Link 
                href="/franchise?scroll=apply" 
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-ecoOrange-600 hover:bg-ecoOrange-500 text-white font-extrabold text-center transition-all duration-300 shadow-[0_8px_30px_rgba(234,88,12,0.3)] hover:scale-[1.03] text-sm"
              >
                Apply for Franchise
              </Link>
              <Link 
                href="/franchise" 
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/20 text-white hover:text-white font-bold text-center bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-sm"
              >
                Explore Details
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 pt-6 border-t border-white/10 text-[10px] text-slate-400 font-bold">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-extrabold text-xs">★ 4.9 Rating</span>
                <span className="text-slate-400">Google Local</span>
              </div>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-450" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>₹20L – ₹25L Capital</span>
              </div>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-450" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>FICO & FIFO Models</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section (Floating metrics boxes overlapping the hero section) */}
      <ScrollReveal className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:!-mt-[30px] md:-translate-y-1/2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Box 1 */}
          <div 
            style={{ backgroundColor: '#ffffff' }}
            className="rounded-2xl md:rounded-3xl border border-slate-200/60 shadow-[0_12px_35px_-5px_rgba(0,0,0,0.08),_0_5px_15px_-5px_rgba(0,0,0,0.03)] p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-5px_rgba(0,0,0,0.12)] transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-emerald-500/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615 3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615m-15 0h15M2.25 9.349h19.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-extrabold text-slate-900 leading-none">25+</span>
              <span className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 sm:mt-1.5">Franchise Stores</span>
            </div>
          </div>

          {/* Box 2 */}
          <div 
            style={{ backgroundColor: '#ffffff' }}
            className="rounded-2xl md:rounded-3xl border border-slate-200/60 shadow-[0_12px_35px_-5px_rgba(0,0,0,0.08),_0_5px_15px_-5px_rgba(0,0,0,0.03)] p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-5px_rgba(0,0,0,0.12)] transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-2xl bg-ecoOrange-500/10 flex items-center justify-center text-ecoOrange-600 flex-shrink-0 shadow-sm border border-ecoOrange-500/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-extrabold text-slate-900 leading-none">100+</span>
              <span className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 sm:mt-1.5">Service Partners</span>
            </div>
          </div>

          {/* Box 3 */}
          <div 
            style={{ backgroundColor: '#ffffff' }}
            className="rounded-2xl md:rounded-3xl border border-slate-200/60 shadow-[0_12px_35px_-5px_rgba(0,0,0,0.08),_0_5px_15px_-5px_rgba(0,0,0,0.03)] p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-5px_rgba(0,0,0,0.12)] transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-emerald-500/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-extrabold text-slate-900 leading-none">99%</span>
              <span className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 sm:mt-1.5">Satisfaction Rate</span>
            </div>
          </div>

          {/* Box 4 */}
          <div 
            style={{ backgroundColor: '#ffffff' }}
            className="rounded-2xl md:rounded-3xl border border-slate-200/60 shadow-[0_12px_35px_-5px_rgba(0,0,0,0.08),_0_5px_15px_-5px_rgba(0,0,0,0.03)] p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-5px_rgba(0,0,0,0.12)] transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-2xl bg-ecoOrange-500/10 flex items-center justify-center text-ecoOrange-600 flex-shrink-0 shadow-sm border border-ecoOrange-500/10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-extrabold text-slate-900 leading-none">50k+</span>
              <span className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 sm:mt-1.5">Certified Phones Sold</span>
            </div>
          </div>

        </div>
      </ScrollReveal>

      {/* 3. Interactive ROI Simulator Card */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full">
            Franchise ROI Simulator
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 leading-tight">
            Estimate Your Performance
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto">
            Simulate your operational footprint, investment payback cycle, and estimated monthly profitability based on your capital allocations.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Branded Control Card */}
          <div className="lg:col-span-5 bg-[#061C0F] text-white p-6 sm:p-8 rounded-3xl border border-emerald-500/10 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[350px] space-y-6">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-ecoOrange-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-1 relative z-10">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">Select Capital</span>
              <p className="text-3xl font-black text-ecoOrange-400">₹{(investAmt/100000).toFixed(0)} Lakhs</p>
            </div>

            <div className="space-y-4 relative z-10">
              <input 
                type="range" 
                min={2000000} 
                max={3000000} 
                step={100000}
                value={investAmt}
                onChange={(e) => setInvestAmt(Number(e.target.value))}
                className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-ecoOrange-500"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>₹20L (Min)</span>
                <span>₹25L (Mid)</span>
                <span>₹30L (Max)</span>
              </div>
              
              {/* Presets Row */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInvestAmt(2000000)}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                    investAmt === 2000000 
                      ? 'bg-emerald-500/20 border-emerald-400 text-white' 
                      : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ₹20L
                </button>
                <button
                  type="button"
                  onClick={() => setInvestAmt(2500000)}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                    investAmt === 2500000 
                      ? 'bg-emerald-500/20 border-emerald-400 text-white' 
                      : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ₹25L
                </button>
                <button
                  type="button"
                  onClick={() => setInvestAmt(3000000)}
                  className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                    investAmt === 3000000 
                      ? 'bg-emerald-500/20 border-emerald-400 text-white' 
                      : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ₹30L
                </button>
              </div>
            </div>

            {/* Model Selection Tabs */}
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Operation Protocol</span>
              <div className="flex bg-emerald-950/60 p-1 rounded-xl border border-emerald-800/30">
                <button
                  type="button"
                  onClick={() => setIsFoco(true)}
                  className={`flex-1 text-[10px] md:text-xs py-2 rounded-lg font-bold transition-all text-center ${
                    isFoco 
                      ? 'bg-ecoOrange-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  FICO (Company Run)
                </button>
                <button
                  type="button"
                  onClick={() => setIsFoco(false)}
                  className={`flex-1 text-[10px] md:text-xs py-2 rounded-lg font-bold transition-all text-center ${
                    !isFoco 
                      ? 'bg-ecoOrange-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  FIFO (Owner Run)
                </button>
              </div>
            </div>

          </div>

          {/* Right Metrics Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
            
            {/* Metric Card 1 */}
            <div 
              key={`card1-${profitOrange}`}
              style={{ backgroundColor: '#ffffff' }}
              className={`border border-slate-200/60 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-[0_12px_35px_-5px_rgba(0,0,0,0.08),_0_5px_15px_-5px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 min-h-[150px] ${profitOrange ? 'animate-card-flash' : ''}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">Est. Monthly Profit</span>
                <span key={estProfit} className={`text-lg sm:text-2xl font-black block animate-value-change ${profitOrange ? 'text-ecoOrange-600' : 'text-slate-900'}`}>₹{estProfit.toLocaleString('en-IN')}</span>
                <span className="text-[8px] sm:text-[10px] text-slate-500 block">Steady operational net yield</span>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div 
              key={`card2-${paybackOrange}`}
              style={{ backgroundColor: '#ffffff' }}
              className={`border border-slate-200/60 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-[0_12px_35px_-5px_rgba(0,0,0,0.08),_0_5px_15px_-5px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 min-h-[150px] ${paybackOrange ? 'animate-card-flash' : ''}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-ecoOrange-500/10 flex items-center justify-center text-ecoOrange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">ROI Payback Cycle</span>
                <span key={estPayback} className={`text-lg sm:text-2xl font-black block animate-value-change ${paybackOrange ? 'text-ecoOrange-600' : 'text-slate-900'}`}>{estPayback} Months</span>
                <span className="text-[8px] sm:text-[10px] text-slate-500 block">Target capital recovery timeframe</span>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div 
              style={{ backgroundColor: '#ffffff' }}
              className="border border-slate-200/60 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-[0_12px_35px_-5px_rgba(0,0,0,0.08),_0_5px_15px_-5px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 min-h-[150px]"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5m0-16.5h16.5m-16.5 0v16.5m16.5-16.5v16.5m0-16.5h-16.5m16.5 16.5h-16.5" />
                </svg>
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">Store Space footprint</span>
                <span className="text-lg sm:text-2xl font-black text-slate-900 block">{storeSqFt} Sq.Ft</span>
                <span className="text-[8px] sm:text-[10px] text-slate-500 block">Commercial area benchmark</span>
              </div>
            </div>

            {/* Metric Card 4 */}
            <div 
              key={`card4-${modeOrange}`}
              style={{ backgroundColor: '#ffffff' }}
              className={`border border-slate-200/60 rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-[0_12px_35px_-5px_rgba(0,0,0,0.08),_0_5px_15px_-5px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 min-h-[150px] ${modeOrange ? 'animate-card-flash' : ''}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-ecoOrange-500/10 flex items-center justify-center text-ecoOrange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
              <div className="space-y-1 mt-4">
                <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">Operational Mode</span>
                <span key={isFoco ? "FICO" : "FIFO"} className={`text-lg sm:text-2xl font-black block animate-value-change ${modeOrange ? 'text-ecoOrange-600' : 'text-slate-900'}`}>{isFoco ? "FICO Mode" : "FIFO Mode"}</span>
                <span className="text-[8px] sm:text-[10px] text-slate-500 block">Governance contract layout</span>
              </div>
            </div>

          </div>

        </div>
      </ScrollReveal>

      {/* 4. Triple Revenue Business Model */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] text-ecoOrange-600 font-bold uppercase tracking-wider bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
            REVENUE STREAMDESK
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 leading-tight">
            Earn from Buy | Sell | Repair Services
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto font-medium">
            EcoFone ensures steady cash flows by combining three high-margin revenue channels in a single storefront.
          </p>
        </div>

        {/* Premium Trust Seals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto py-2">
          {/* Warranty Card */}
          <div className="bg-gradient-to-br from-white to-emerald-50/15 border border-slate-200/50 rounded-3xl p-6 space-y-4 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-lg border border-emerald-500/10 shadow-sm">
                🛡️
              </div>
              <div>
                <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider block">Official Guarantee</span>
                <h4 className="font-display font-bold text-sm text-slate-900 leading-tight">6-Month Comprehensive Warranty</h4>
              </div>
            </div>
            <p className="text-[11px] text-slate-550 leading-relaxed pl-1">
              Every certified refurbished device undergoes a strict 32-point diagnostics check. If any hardware or technical issue arises, we cover complete diagnostic repair or replacement within 6 months.
            </p>
          </div>

          {/* Replacement Card */}
          <div className="bg-gradient-to-br from-white to-orange-50/15 border border-slate-200/50 rounded-3xl p-6 space-y-4 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 text-lg border border-orange-500/10 shadow-sm">
                🔄
              </div>
              <div>
                <span className="text-[9px] text-ecoOrange-600 font-extrabold uppercase tracking-wider block">No-Risk Trial</span>
                <h4 className="font-display font-bold text-sm text-slate-900 leading-tight">3-Day Hassle-Free Replacement</h4>
              </div>
            </div>
            <p className="text-[11px] text-slate-550 leading-relaxed pl-1">
              Shop with absolute peace of mind. If you are not completely satisfied with your refurbished smartphone, bring it back within 3 days for an instant exchange or upgrade.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Buy */}
          <div className="glassmorphism-card rounded-3xl p-8 border border-slate-100/50 flex flex-col justify-between min-h-[360px] hover:-translate-y-2.5 transition-all duration-300 shadow-xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.18)]">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-100 transition-transform duration-300 hover:scale-110">
                <img src="/service-buy.png" alt="Buy Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Buy Used Smartphones</h3>
              <p className="text-xs text-slate-555 leading-relaxed">
                Purchase pre-owned mobile phones at competitive rates. Instantly check parameters to evaluate and acquire stock.
              </p>

              {/* Expanded details */}
              <div className={`transition-all duration-300 overflow-hidden ${expandedCard === 'buy' ? 'max-h-[500px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">Service Details:</span>
                  <ul className="space-y-2 text-xs text-slate-655 pl-4 list-disc leading-relaxed">
                    <li><strong className="text-slate-900">On-the-spot Inspection:</strong> Our shop technician checks the display, touch response, buttons, camera, and battery health in minutes.</li>
                    <li><strong className="text-slate-900">Transparent Valuation:</strong> Payout prices are calculated based on the brand, model age, and actual working condition.</li>
                    <li><strong className="text-slate-900">Safe Factory Reset:</strong> Full device data format performed in front of the customer to verify your personal files are cleared.</li>
                    <li><strong className="text-slate-900">Instant UPI/Cash Settlement:</strong> Get paid directly via instant bank transfer or cash as soon as the deal is closed.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setExpandedCard(expandedCard === 'buy' ? null : 'buy')}
              className="text-emerald-700 hover:text-emerald-800 font-bold text-xs text-left mt-6 flex items-center gap-1 focus:outline-none"
            >
              {expandedCard === 'buy' ? 'Show Less ↑' : 'Know More →'}
            </button>
          </div>

          {/* Card 2: Sell */}
          <div className="glassmorphism-card rounded-3xl p-8 border border-slate-100/50 flex flex-col justify-between min-h-[360px] hover:-translate-y-2.5 transition-all duration-300 shadow-xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.18)]">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-100 transition-transform duration-300 hover:scale-110">
                <img src="/service-sell.png" alt="Sell Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Sell Certified Refurbished</h3>
              <p className="text-xs text-slate-555 leading-relaxed">
                Sell premium, warranty-backed devices. Build quick customer trust with certification seals and replacement assurances.
              </p>

              {/* Expanded details */}
              <div className={`transition-all duration-300 overflow-hidden ${expandedCard === 'sell' ? 'max-h-[500px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <span className="text-[10px] text-ecoOrange-600 font-extrabold uppercase tracking-wider block">Service Details:</span>
                  <ul className="space-y-2 text-xs text-slate-655 pl-4 list-disc leading-relaxed">
                    <li><strong className="text-slate-900">Technician Component Check:</strong> Every phone is tested for network reception, speaker volume, mic clarity, and screen touch.</li>
                    <li><strong className="text-slate-905">6-Month Store Warranty:</strong> Standard store warranty coverage for any unexpected technical hardware faults.</li>
                    <li><strong className="text-slate-900">3-Day Exchange Window:</strong> Easy exchanges or upgrades if you notice any functional issues within 3 days.</li>
                    <li><strong className="text-slate-900">Top Brands Stock:</strong> Shop clean, certified iPhones, Samsung, and OnePlus models at up to 40% off retail prices.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setExpandedCard(expandedCard === 'sell' ? null : 'sell')}
              className="text-ecoOrange-600 hover:text-ecoOrange-700 font-bold text-xs text-left mt-6 flex items-center gap-1 focus:outline-none"
            >
              {expandedCard === 'sell' ? 'Show Less ↑' : 'Know More →'}
            </button>
          </div>

          {/* Card 3: Repair & Accessories */}
          <div className="glassmorphism-card rounded-3xl p-8 border border-slate-100/50 flex flex-col justify-between min-h-[360px] hover:-translate-y-2.5 transition-all duration-300 shadow-xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.18)]">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-100 transition-transform duration-300 hover:scale-110">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Repair & Accessories</h3>
              <p className="text-xs text-slate-555 leading-relaxed">
                Earn daily recurring income from walk-in repair diagnostics, battery replacements, and life-style accessories sales.
              </p>

              {/* Expanded details */}
              <div className={`transition-all duration-300 overflow-hidden ${expandedCard === 'repair' ? 'max-h-[500px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">Service Details:</span>
                  <ul className="space-y-2 text-xs text-slate-655 pl-4 list-disc leading-relaxed">
                    <li><strong className="text-slate-900">Common Hardware Repairs:</strong> Quick screen glass replacement, fresh battery swaps, and charging port repairs.</li>
                    <li><strong className="text-slate-900">Tested Spare Parts:</strong> We use reliable, quality-tested screen displays, batteries, and camera modules.</li>
                    <li><strong className="text-slate-900">90-Day Spares Warranty:</strong> 3-month store warranty coverage on replaced components for peace of mind.</li>
                    <li><strong className="text-slate-900">Popular Accessories:</strong> Tempered glass screen guards, fast charging adapters, and durable back covers.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setExpandedCard(expandedCard === 'repair' ? null : 'repair')}
              className="text-emerald-700 hover:text-emerald-800 font-bold text-xs text-left mt-6 flex items-center gap-1 focus:outline-none"
            >
              {expandedCard === 'repair' ? 'Show Less ↑' : 'Know More →'}
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* 5. Difference / Core Values Section */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:scale-[1.02] border border-slate-200/80 p-2 bg-white transition-all duration-500 animate-soft-pulse">
            <img 
              src="/home_values.jpg" 
              alt="EcoFone Team Collaboration" 
              className="w-full h-auto rounded-2xl object-cover aspect-video lg:aspect-square"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                WHY PARTNER WITH US
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
                What Makes EcoFone Different
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-lg animate-slide-up hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300">
                 <span className="font-bold text-slate-900 text-sm block flex items-center gap-2">
                   <svg className="w-4 h-4 text-emerald-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                   </svg>
                   <span>Certified Quality Process</span>
                 </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Every smartphone goes through multi-level technical quality diagnostic runs before storefront listing.
                </p>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-lg animate-slide-up animation-delay-100 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300">
                 <span className="font-bold text-slate-900 text-sm block flex items-center gap-2">
                   <svg className="w-4 h-4 text-ecoOrange-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M3 12l3 3m-3-3l-3 3" />
                   </svg>
                   <span>Multiple Revenue Channels</span>
                 </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Combine Buy, Sell, and Repair service points to ensure stable income and solid cash flow.
                </p>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-lg animate-slide-up animation-delay-200 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300">
                 <span className="font-bold text-ecoOrange-600 text-sm block flex items-center gap-2">
                   <svg className="w-4 h-4 text-ecoOrange-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M20 7h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM9 5h6v2H9V5z" />
                   </svg>
                    <span>FICO Business Option</span>
                 </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Invest securely with our company-operated franchise model. We handle staffing, POS setup, and marketing.
                </p>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-lg animate-slide-up animation-delay-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] transition-all duration-300">
                 <span className="font-bold text-emerald-700 text-sm block flex items-center gap-2">
                   <svg className="w-4 h-4 text-emerald-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   <span>Complete Corporate Support</span>
                 </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  From localized demographic site surveys to digital marketing programs and sales staff onboarding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>


      {/* 5.5. Store Locator Banner */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white border border-slate-100 p-8 md:p-12 rounded-3xl shadow-md">
          <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 animate-scale-in">
            <img src="/home_locator.jpg" alt="EcoFone Interactive Store Locator Map" className="w-full h-auto object-cover aspect-[16/10]" />
          </div>
          <div className="space-y-4 animate-slide-up">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider bg-[#0a2d1a] border border-emerald-800/30 px-3.5 py-1.5 rounded-full w-max block">
              Store Locator
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Visit an EcoFone Store Near You
            </h3>
            <p className="text-slate-555 text-xs sm:text-sm leading-relaxed">
              Find a physical certified refurbished mobile store to buy warranty-backed smartphones, trade-in your old phone for instant cash, or get immediate express hardware repairs in 15 minutes.
            </p>
            <div className="pt-2">
              <Link 
                href="/stores" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ecoOrange-600 hover:bg-ecoOrange-500 text-white font-bold text-xs transition-all shadow-md hover:scale-[1.02]"
              >
                <span>Find Closest Store (GPS)</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 6. Testimonials */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 pt-16">
        <div className="text-center space-y-2 mb-12">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">Hear From Our Partners</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Real feedback from our retail partners across India</p>
        </div>
        <ReviewsCarousel />
      </ScrollReveal>

      {/* 7. Interactive FAQs Accordion */}
      <ScrollReveal className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            FAQS
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4 pt-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-md"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:text-slate-900 focus:outline-none"
              >
                <span>{faq.q}</span>
                <span className={`text-xs text-slate-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out px-6 ${
                  activeFaq === index ? 'max-h-[200px] pb-5 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}
