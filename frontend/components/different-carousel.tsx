'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const TOTAL = 6;
const INTERVAL_MS = 3800;
const RESUME_DELAY_MS = 2500;

const cards = [
  {
    id: 'certified',
    titleColor: 'text-slate-900',
    iconColor: 'text-emerald-500',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    title: 'Certified Quality Process',
    desc: 'Every smartphone goes through multi-level technical quality diagnostic runs before storefront listing.',
  },
  {
    id: 'revenue',
    titleColor: 'text-slate-900',
    iconColor: 'text-ecoOrange-500',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M3 12l3 3m-3-3l-3 3" />
    ),
    title: 'Multiple Revenue Channels',
    desc: 'Combine Buy, Sell, and Repair service points to ensure stable income and solid cash flow.',
  },
  {
    id: 'fico',
    titleColor: 'text-ecoOrange-600',
    iconColor: 'text-ecoOrange-500',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM9 5h6v2H9V5z" />
    ),
    title: 'FICO Business Option',
    desc: 'Invest securely with our company-operated franchise model. We handle staffing, POS setup, and marketing.',
  },
  {
    id: 'support',
    titleColor: 'text-emerald-700',
    iconColor: 'text-emerald-500',
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    title: 'Complete Corporate Support',
    desc: 'From localized demographic site surveys to digital marketing programs and sales staff onboarding.',
  },
  {
    id: 'warranty',
    titleColor: 'text-emerald-700',
    iconColor: 'text-emerald-500',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    title: '6-Month Comprehensive Warranty',
    desc: 'Every certified device undergoes strict diagnostics. We cover complete diagnostic repair or replacement within 6 months.',
  },
  {
    id: 'replacement',
    titleColor: 'text-ecoOrange-600',
    iconColor: 'text-ecoOrange-500',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89l-2.786 2.787a4.995 4.995 0 10-1.745 5.589" />
    ),
    title: '3-Day Hassle-Free Replacement',
    desc: 'Shop with absolute peace of mind. Bring your smartphone back within 3 days for an instant exchange or upgrade.',
  },
];

export default function DifferentCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToIndex = useCallback((idx: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>('.d-card');
    const card = items[idx];
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    setActiveIndex(idx);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setActiveIndex(prev => {
        const next = (prev + 1) % TOTAL;
        const el = carouselRef.current;
        if (el) {
          const items = el.querySelectorAll<HTMLElement>('.d-card');
          const card = items[next];
          if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
        }
        return next;
      });
    }, INTERVAL_MS);
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  }, []);

  const resumeAfterDelay = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => { isPausedRef.current = false; }, RESUME_DELAY_MS);
  }, []);

  const resumeImmediate = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    startTimer();
    const el = carouselRef.current;
    if (!el) return () => { if (timerRef.current) clearInterval(timerRef.current); };

    const onScroll = () => {
      const items = el.querySelectorAll<HTMLElement>('.d-card');
      let closest = 0;
      let minDist = Infinity;
      items.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - el.offsetLeft - el.scrollLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveIndex(closest);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      el.removeEventListener('scroll', onScroll);
    };
  }, [startTimer]);

  return (
    <div className="sm:hidden w-full">
      {/* ── Carousel Track ── */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 py-2 scrollbar-none"
        onMouseEnter={pause}
        onMouseLeave={resumeImmediate}
        onTouchStart={pause}
        onTouchEnd={resumeAfterDelay}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="d-card p-5 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-lg min-w-[82vw] max-w-[280px] flex-shrink-0 snap-center"
          >
            <span className={`font-bold ${card.titleColor} text-sm flex items-center gap-2`}>
              <svg className={`w-4 h-4 ${card.iconColor} inline-block flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                {card.icon}
              </svg>
              <span>{card.title}</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Dot Indicators ── */}
      <div className="flex justify-center items-center gap-2 mt-3">
        {cards.map((card, i) => (
          <button
            key={card.id}
            aria-label={`Go to ${card.title}`}
            onClick={() => { pause(); scrollToIndex(i); resumeAfterDelay(); }}
            className={`h-2 rounded-full transition-all duration-300 ease-out ${
              activeIndex === i ? 'w-5 bg-emerald-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
