'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface RoadmapStep {
  num: string;
  title: string;
  desc: string;
}

const TOTAL = 6;
const INTERVAL_MS = 3800;
const RESUME_DELAY_MS = 2500;
const CLICK_PAUSE_MS = 30000;

const steps: RoadmapStep[] = [
  { num: "01", title: "Initial Inquiry", desc: "Submit your franchise application through our site. Our team will reach out within 24 hours to discuss the opportunity." },
  { num: "02", title: "Documentation & Verification", desc: "Complete the application form and provide necessary documents. We'll conduct a preliminary location assessment." },
  { num: "03", title: "Site Selection & Approval", desc: "Our team will help evaluate foot traffic, demographics, and local competition to select the optimal store location." },
  { num: "04", title: "Agreement & Investment", desc: "Sign the franchise agreement and complete the initial investment. Receive your comprehensive franchise kit." },
  { num: "05", title: "Store Setup & Training", desc: "We assist with store design, interior setup, branding, and complete our intensive operations/sales training program." },
  { num: "06", title: "Grand Opening & Beyond", desc: "Launch your store with our marketing support and start your journey towards highly profitable business ownership." }
];

export default function RoadmapCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToIndex = useCallback((idx: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('.r-card');
    const card = cards[idx];
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
          const cards = el.querySelectorAll<HTMLElement>('.r-card');
          const card = cards[next];
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

  const pauseFor30s = useCallback(() => {
    isPausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, CLICK_PAUSE_MS);
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
      const cards = el.querySelectorAll<HTMLElement>('.r-card');
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
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
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 py-2 scrollbar-none"
        onMouseEnter={pause}
        onMouseLeave={resumeImmediate}
        onTouchStart={pause}
        onTouchEnd={resumeAfterDelay}
      >
        {steps.map((step) => (
          <div
            key={step.num}
            onClick={pauseFor30s}
            className="r-card bg-white border border-slate-100 rounded-2xl p-4 space-y-2 shadow-md min-w-[82vw] max-w-[280px] flex-shrink-0 snap-center relative cursor-pointer"
          >
            <span className="absolute top-3 right-4 font-display font-black text-2xl text-emerald-100">{step.num}</span>
            <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 pr-8">{step.title}</h3>
            <p className="text-xs text-slate-600 leading-snug line-clamp-3">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 mt-3">
        {steps.map((step, i) => (
          <button
            key={step.num}
            aria-label={`Go to step ${step.num}`}
            onClick={() => { pauseFor30s(); scrollToIndex(i); }}
            className={`h-2 rounded-full transition-all duration-300 ease-out ${
              activeIndex === i ? 'w-5 bg-emerald-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
