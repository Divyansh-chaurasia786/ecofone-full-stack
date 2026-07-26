// ============================================================================
// SERVICE CAROUSEL COMPONENT (MOBILE AUTO-PLAY SLIDER)
// ----------------------------------------------------------------------------
// - Handles auto-sliding for Buy, Sell, and Repair service cards on mobile screens.
// - Supports 30-second pause on card click / dot interaction.
// - Features touch-swipe snap scrolling and smooth indicator dot synchronization.
// ============================================================================

interface ServiceCarouselProps {
  /** Controlled state for expanded details card (optional) */
  expandedCard?: string | null;
  /** State setter for expanded details card (optional) */
  setExpandedCard?: (card: string | null) => void;
}

// Configuration Constants
const TOTAL = 3;             // Total number of service cards (Buy, Sell, Repair)
const INTERVAL_MS = 3800;    // Auto-scroll step interval (3.8 seconds)
const RESUME_DELAY_MS = 2500;// Delay before auto-play resumes after touch swipe
const CLICK_PAUSE_MS = 30000;// Extended pause duration on card click (30 seconds)

export default function ServiceCarousel({ expandedCard: propExpanded, setExpandedCard: propSetExpanded }: ServiceCarouselProps = {}) {
  // Local fallback state if expandedCard prop is not passed by parent page
  const [localExpandedCard, setLocalExpandedCard] = useState<string | null>(null);
  const expandedCard = propExpanded !== undefined ? propExpanded : localExpandedCard;
  const setExpandedCard = propSetExpanded || setLocalExpandedCard;

  // Carousel State & Element Refs
  const [activeIndex, setActiveIndex] = useState(0);                   // Active card index (0: Buy, 1: Sell, 2: Repair)
  const carouselRef = useRef<HTMLDivElement>(null);                    // Reference to scrollable carousel container
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);// Main auto-scroll interval timer ref
  const isPausedRef = useRef(false);                                   // Pause flag (avoids stale state in setInterval closure)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Ref for delay timers (pauseFor30s / resumeAfterDelay)

  /* ─── Scroll to a specific card index ─── */
  const scrollToIndex = useCallback((idx: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('.s-card');
    const card = cards[idx];
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    setActiveIndex(idx);
  }, []);

  /* ─── Auto-play timer ─── */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setActiveIndex(prev => {
        const next = (prev + 1) % TOTAL;
        const el = carouselRef.current;
        if (el) {
          const cards = el.querySelectorAll<HTMLElement>('.s-card');
          const card = cards[next];
          if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
        }
        return next;
      });
    }, INTERVAL_MS);
  }, []);

  /* ─── Pause / Resume helpers ─── */
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
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, RESUME_DELAY_MS);
  }, []);

  const resumeImmediate = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    isPausedRef.current = false;
  }, []);

  /* ─── Mount: start timer + sync dots on scroll ─── */
  useEffect(() => {
    startTimer();
    const el = carouselRef.current;
    if (!el) return () => { if (timerRef.current) clearInterval(timerRef.current); };

    const onScroll = () => {
      const cards = el.querySelectorAll<HTMLElement>('.s-card');
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
      {/* ── Carousel Track ── */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 py-2 scrollbar-none"
        onMouseEnter={pause}
        onMouseLeave={resumeImmediate}
        onTouchStart={pause}
        onTouchEnd={resumeAfterDelay}
      >
        {/* ── Card 1: Buy ── */}
        <div onClick={pauseFor30s} className="s-card glassmorphism-card rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between min-w-[82vw] max-w-[280px] flex-shrink-0 snap-center shadow-lg min-h-[210px] cursor-pointer">
          <div className="space-y-2.5">
            <div className="w-12 h-12 bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-100 transition-transform duration-300">
              <img src="/service-buy.png" alt="Buy Icon" className="w-7 h-7 object-contain" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Buy Used Smartphones</h3>
            <p className="text-xs text-slate-500 leading-snug">
              Purchase pre-owned mobile phones at competitive rates. Instantly check parameters to evaluate and acquire stock.
            </p>
          </div>
          <div>
            <button
              onClick={(e) => { e.stopPropagation(); pauseFor30s(); setExpandedCard(expandedCard === 'buy' ? null : 'buy'); }}
              className="text-emerald-700 hover:text-emerald-800 font-bold text-xs text-left mt-3 flex items-center gap-1 focus:outline-none"
            >
              {expandedCard === 'buy' ? 'Show Less ↑' : 'Know More →'}
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${expandedCard === 'buy' ? 'max-h-[400px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">Service Details:</span>
                <ul className="space-y-1.5 text-xs text-slate-500 pl-4 list-disc leading-relaxed">
                  <li><strong className="text-slate-900">On-the-spot Inspection:</strong> Our shop technician checks the display, touch response, buttons, camera, and battery health in minutes.</li>
                  <li><strong className="text-slate-900">Transparent Valuation:</strong> Payout prices are calculated based on the brand, model age, and actual working condition.</li>
                  <li><strong className="text-slate-900">Safe Factory Reset:</strong> Full device data format performed in front of the customer to verify your personal files are cleared.</li>
                  <li><strong className="text-slate-900">Instant UPI/Cash Settlement:</strong> Get paid directly via instant bank transfer or cash as soon as the deal is closed.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 2: Sell ── */}
        <div onClick={pauseFor30s} className="s-card glassmorphism-card rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between min-w-[82vw] max-w-[280px] flex-shrink-0 snap-center shadow-lg min-h-[210px] cursor-pointer">
          <div className="space-y-2.5">
            <div className="w-12 h-12 bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-100 transition-transform duration-300">
              <img src="/service-sell.png" alt="Sell Icon" className="w-7 h-7 object-contain" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Sell Certified Refurbished</h3>
            <p className="text-xs text-slate-500 leading-snug">
              Sell premium, warranty-backed devices. Build quick customer trust with certification seals and replacement assurances.
            </p>
          </div>
          <div>
            <button
              onClick={(e) => { e.stopPropagation(); pauseFor30s(); setExpandedCard(expandedCard === 'sell' ? null : 'sell'); }}
              className="text-ecoOrange-600 hover:text-ecoOrange-700 font-bold text-xs text-left mt-3 flex items-center gap-1 focus:outline-none"
            >
              {expandedCard === 'sell' ? 'Show Less ↑' : 'Know More →'}
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${expandedCard === 'sell' ? 'max-h-[400px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] text-ecoOrange-600 font-extrabold uppercase tracking-wider block">Service Details:</span>
                <ul className="space-y-1.5 text-xs text-slate-500 pl-4 list-disc leading-relaxed">
                  <li><strong className="text-slate-900">Technician Component Check:</strong> Every phone is tested for network reception, speaker volume, mic clarity, and screen touch.</li>
                  <li><strong className="text-slate-900">6-Month Store Warranty:</strong> Standard store warranty coverage for any unexpected technical hardware faults.</li>
                  <li><strong className="text-slate-900">3-Day Exchange Window:</strong> Easy exchanges or upgrades if you notice any functional issues within 3 days.</li>
                  <li><strong className="text-slate-900">Top Brands Stock:</strong> Shop clean, certified iPhones, Samsung, and OnePlus models at up to 40% off retail prices.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 3: Repair ── */}
        <div onClick={pauseFor30s} className="s-card glassmorphism-card rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between min-w-[82vw] max-w-[280px] flex-shrink-0 snap-center shadow-lg min-h-[210px] cursor-pointer">
          <div className="space-y-2.5">
            <div className="w-12 h-12 bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Repair &amp; Accessories</h3>
            <p className="text-xs text-slate-500 leading-snug">
              Earn daily recurring income from walk-in repair diagnostics, battery replacements, and life-style accessories sales.
            </p>
          </div>
          <div>
            <button
              onClick={(e) => { e.stopPropagation(); pauseFor30s(); setExpandedCard(expandedCard === 'repair' ? null : 'repair'); }}
              className="text-emerald-700 hover:text-emerald-800 font-bold text-xs text-left mt-3 flex items-center gap-1 focus:outline-none"
            >
              {expandedCard === 'repair' ? 'Show Less ↑' : 'Know More →'}
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${expandedCard === 'repair' ? 'max-h-[400px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">Service Details:</span>
                <ul className="space-y-1.5 text-xs text-slate-500 pl-4 list-disc leading-relaxed">
                  <li><strong className="text-slate-900">Common Hardware Repairs:</strong> Quick screen glass replacement, fresh battery swaps, and charging port repairs.</li>
                  <li><strong className="text-slate-900">Tested Spare Parts:</strong> We use reliable, quality-tested screen displays, batteries, and camera modules.</li>
                  <li><strong className="text-slate-900">90-Day Spares Warranty:</strong> 3-month store warranty coverage on replaced components for peace of mind.</li>
                  <li><strong className="text-slate-900">Popular Accessories:</strong> Tempered glass screen guards, fast charging adapters, and durable back covers.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dot Indicators ── */}
      <div className="flex justify-center items-center gap-2 mt-3 pb-1">
        {(['buy', 'sell', 'repair'] as const).map((label, i) => (
          <button
            key={label}
            aria-label={`Go to ${label} card`}
            onClick={() => { pauseFor30s(); scrollToIndex(i); }}
            className={`h-2 rounded-full transition-all duration-300 ease-out ${
              activeIndex === i
                ? 'w-5 bg-emerald-600'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
