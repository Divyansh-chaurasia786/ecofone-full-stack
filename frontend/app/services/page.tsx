import React from 'react';
import ScrollReveal from '../../components/scroll-reveal';

export default function ServicesPage() {
  const rolloutSteps = [
    {
      title: "Stock & Inventory Allocation",
      desc: "Get priority access to high-demand refurbished phone batches directly from central warehouses.",
      img: "/icon-allocation.png"
    },
    {
      title: "Structured Setup Timelines",
      desc: "Our onboarding specialists launch physical franchise outlets in 30 to 45 business days.",
      img: "/icon-deadline.png"
    },
    {
      title: "Fiscal ROI Onboarding Audits",
      desc: "Get transparent audits, localized cash flow evaluations, and regular sales projections.",
      img: "/icon-fiscal.png"
    },
    {
      title: "Recurring Marketing Support",
      desc: "EcoFone runs localized target campaigns on Google/Facebook to drive walk-ins directly to your store.",
      img: "/icon-recurring.png"
    }
  ];

  return (
    <div className="bg-[#FAF9F6] text-slate-800 min-h-screen">
      
      {/* 1. Full-Width Hero Section (Like Homepage) */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden bg-emerald-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="/services_hero.jpg" 
            alt="Services Hero Background" 
            className="w-full h-full object-cover object-center opacity-100"
          />
          {/* Green to black color gradient cover (5% strength) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#061C0F]/5 via-transparent to-[#FAF9F6]"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center space-y-4 mt-20">
          <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider bg-[#0a2d1a]/85 border border-emerald-800/20 px-3.5 py-1.5 rounded-full inline-block" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            EcoFone Services
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight" style={{ textShadow: '0 0 15px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.7)' }}>
            Triple Revenue <span className="text-emerald-300">Store Model</span>
          </h1>
          <p className="text-white/95 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto" style={{ textShadow: '0 0 10px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.7)' }}>
            EcoFone franchise outlets combine smartphone buyback, certified retail, and express screen/battery diagnostics. This triple-channel approach captures local re-commerce demand.
          </p>
        </div>
      </section>

      {/* Main Content Workspace Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* 2. Services Grid (Three In-Store Income Streams) */}
        <ScrollReveal className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-ecoOrange-600 font-bold uppercase tracking-wider bg-orange-50 border border-orange-100 px-3 py-1 rounded-full w-max mx-auto block">
              Income Streams
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">Three In-Store Income Streams</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">Explore the mechanics of our core retail service modules</p>
          </div>

          {/* Premium Trust Seals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto my-8">
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
              <p className="text-[11px] text-slate-555 leading-relaxed pl-1">
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
              <p className="text-[11px] text-slate-555 leading-relaxed pl-1">
                Shop with absolute peace of mind. If you are not completely satisfied with your refurbished smartphone, bring it back within 3 days for an instant exchange or upgrade.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-4">
            {/* Column 1: Buy */}
            <div className="space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/10 text-emerald-600 transition-transform duration-300 hover:scale-110">
                <img src="/service-buy.png" alt="Buy Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Buy Used Devices</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Purchase pre-owned mobile models directly from walk-in consumers. Our diagnostics evaluate screen issues, body scratches, and battery health to calculate instant buyback rates.
              </p>
            </div>

            {/* Column 2: Sell */}
            <div className="space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-ecoOrange-500/10 rounded-2xl flex items-center justify-center border border-ecoOrange-500/10 text-ecoOrange-600 transition-transform duration-300 hover:scale-110">
                <img src="/service-sell.png" alt="Sell Icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Sell Certified Devices</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Sell fully functional, certified refurbished smartphones. Every mobile leaves the outlet backed by our standard 6-month warranty and 3-day replacement guarantee.
              </p>
            </div>

            {/* Column 3: Repair & Accessories */}
            <div className="space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/10 text-emerald-600 transition-transform duration-300 hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Repair & Accessories</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Provide instant battery swaps, hardware repairs, and screen replacements. Boost ticket sizes by selling accessories like premium glass protectors and charging units.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* 3. Setup Support Lifecycles */}
        <ScrollReveal className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-ecoOrange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider w-max mx-auto block">
              Franchise Support
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">Store Setup & Launch Lifecycle</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              EcoFone stands by your side with systematic operational, financial, and logistical support protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
            {rolloutSteps.map((step, idx) => (
              <div key={idx} className="space-y-4 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/10 transition-transform duration-300 hover:scale-110">
                  <img src={step.img} alt={step.title} className="w-10 h-10 object-contain" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* 4. FICO Model Advantage (Cardless full-width banner) */}
        <ScrollReveal className="text-center space-y-4 max-w-3xl mx-auto pt-6 border-t border-slate-200">
          <h3 className="font-display font-bold text-xl text-slate-900">FICO (Franchise Investor, Company Operated) Advantage</h3>
          <p className="text-xs sm:text-sm text-slate-550 max-w-2xl mx-auto leading-relaxed">
            Do not worry about day-to-day operations. Our FICO model option lets the parent company handle staff management, localized stock replenishments, and marketing setups while you receive steady net margins.
          </p>
        </ScrollReveal>

      </div>
    </div>
  );
}
