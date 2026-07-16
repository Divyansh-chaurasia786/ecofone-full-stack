'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import ScrollReveal from '../../components/scroll-reveal';
import { submitToGoogleForm } from '../../lib/google-forms';

export default function FranchisePage() {
  // Smooth scroll to form on load via query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('scroll') === 'apply') {
        const element = document.getElementById('apply-form');
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 800); // 800ms delay to let entrance transitions finish before smooth scrolling
        }
      }
    }
  }, []);

  // Application form wizard states
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    locationPreference: '',
    investmentCapacity: 2000000,
    experienceDesc: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ROI Calculator states
  const [roiParams, setRoiParams] = useState({
    investmentSize: 2000000,
    businessModel: 'FICO' as 'FIFO' | 'FICO',
  });
  const [roiResults, setRoiResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showRoiModal, setShowRoiModal] = useState(false);

  const handleInvestmentChange = (val: number) => {
    setRoiParams((prev) => ({
      ...prev,
      investmentSize: val,
    }));
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.applyFranchise(formData);
      await submitToGoogleForm('Franchise', formData);
      setSubmitSuccess(true);
      if (typeof window !== 'undefined') {
        const bc = new BroadcastChannel('ecofone_crm');
        bc.postMessage('new_query_submitted');
        bc.close();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalculateRoi = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setTimeout(() => {
      const model = roiParams.businessModel;
      const capital = roiParams.investmentSize;
      
      // Core calculation logic provided by user
      const monthlyNetProfit = model === 'FIFO'
        ? Math.round((capital * 0.15) / 12)  // FIFO: 15% Annualized
        : Math.round(capital * 0.03);        // FICO: 3% Monthly Fixed
        
      const paybackPeriodText = model === 'FIFO'
        ? "24 - 30"
        : "24 - 30";  // Target capital recovery window
        
      const projections = [];
      let currentProfit = monthlyNetProfit * 12;
      let cumulativeCashFlow = -capital;
      
      for (let year = 1; year <= 3; year++) {
        if (year > 1) {
          currentProfit = currentProfit * 1.12;
        }
        cumulativeCashFlow += currentProfit;
        
        projections.push({
          year,
          netProfit: Math.round(currentProfit),
          cumulativeCashFlow: Math.round(cumulativeCashFlow),
        });
      }
      
      setRoiResults({
        monthlyMetrics: {
          netProfit: monthlyNetProfit,
        },
        paybackPeriodText,
        projections,
      });
      setShowRoiModal(true);
      setIsCalculating(false);
    }, 500);
  };

  const roadmapSteps = [
    { num: "01", title: "Initial Inquiry", desc: "Submit your franchise application through our site. Our team will reach out within 24 hours to discuss the opportunity." },
    { num: "02", title: "Documentation & Verification", desc: "Complete the application form and provide necessary documents. We'll conduct a preliminary location assessment." },
    { num: "03", title: "Site Selection & Approval", desc: "Our team will help evaluate foot traffic, demographics, and local competition to select the optimal store location." },
    { num: "04", title: "Agreement & Investment", desc: "Sign the franchise agreement and complete the initial investment. Receive your comprehensive franchise kit." },
    { num: "05", title: "Store Setup & Training", desc: "We assist with store design, interior setup, branding, and complete our intensive operations/sales training program." },
    { num: "06", title: "Grand Opening & Beyond", desc: "Launch your store with our marketing support and start your journey towards highly profitable business ownership." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 bg-[#FAF9F6]">
      
      {/* 1. Header Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider bg-[#0a2d1a] border border-emerald-800/30 px-3.5 py-1.5 rounded-full inline-block">
          Partner Program
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.15]">
          Join India's Fastest-Growing <span className="gradient-text-green text-emerald-600">Refurbished Smartphone Brand</span>
        </h1>
        <p className="text-slate-555 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          Partner with EcoFone and become part of the sustainable technology revolution. High margins, low competition, and premium product demand make this the perfect business opportunity.
        </p>
      </div>

      {/* 2. Highlights Metrics bar */}
      <ScrollReveal className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl text-center shadow-md hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Turnover</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">₹20 - 25 Lakhs / Month</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl text-center shadow-md hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Net Profit</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">₹1.4 - 2 Lakhs / Month</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl text-center shadow-md hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ROI Payback Cycle</span>
          <p className="text-xl sm:text-2xl font-black text-ecoOrange-600 mt-1">24 - 30 Months</p>
        </div>
      </ScrollReveal>

      {/* 3. Visual Banner */}
      <ScrollReveal className="relative rounded-3xl overflow-hidden shadow-2xl h-64 md:h-80 border border-slate-100">
        <img 
          src="/franchise_hero.jpg" 
          alt="EcoFone Franchise Storefront" 
          className="w-full h-full object-cover animate-soft-pulse"
        />
        
        {/* Official Brand Logo Overlay Badge */}
        <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20 flex items-center gap-3 animate-fade-in">
          <img src="/logo.png" alt="EcoFone Logo" className="h-10 w-auto object-contain bg-transparent" />
          <div className="pr-2">
            <h3 className="font-display font-black text-slate-900 text-xs sm:text-sm tracking-tight leading-none">EcoFone</h3>
            <span className="text-[9px] font-extrabold text-emerald-705 uppercase tracking-widest leading-none block mt-1">Franchise Outlet</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex items-end p-8">
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Sustainable Retail Network</span>
            <p className="text-white text-lg sm:text-2xl font-extrabold font-display">Triple Revenue: Buy | Sell | Repair</p>
          </div>
        </div>
      </ScrollReveal>

      {/* 4. Franchise Business Models (FIFO vs FICO Comparison) */}
      <ScrollReveal className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider bg-[#0a2d1a] border border-emerald-800/30 px-3.5 py-1.5 rounded-full inline-block w-max mx-auto">
            Operational Options
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">Franchise Business Models</h2>
          <p className="text-slate-550 text-xs sm:text-sm max-w-lg mx-auto">Choose between hands-on operation and passive investment formats.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 space-y-4 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover:border-emerald-500/30">
            <div className="flex justify-between items-center">
              <svg className="w-8 h-8 text-ecoOrange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM9 5h6v2H9V5z" />
              </svg>
              <span className="text-[10px] bg-ecoOrange-500/10 border border-ecoOrange-500/20 px-2.5 py-1 rounded-full text-ecoOrange-600 font-extrabold">FICO - 3% ROI / Margin</span>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">FICO (Franchise Investor, Company Operated)</h3>
            <p className="text-slate-555 text-xs leading-relaxed">
              Best suited for investors seeking minimal operational involvement. EcoFone handles operations, inventory management, and marketing.
            </p>
            <ul className="space-y-2 text-xs text-slate-655 pl-4 list-disc">
              <li>Store owned by investor but operated by EcoFone.</li>
              <li>Daily operations, staffing, and audits handled by brand.</li>
              <li>Transparent, predictable revenue-sharing model.</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-8 space-y-4 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 hover:border-emerald-500/30">
            <div className="flex justify-between items-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-600 font-extrabold">FIFO - 15% ROI</span>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">FIFO (Franchise Investor, Franchise Operated)</h3>
            <p className="text-slate-555 text-xs leading-relaxed">
              Ideal for hands-on entrepreneurs who want full control over daily operations with brand systems, tech desks, and central procurement support.
            </p>
            <ul className="space-y-2 text-xs text-slate-655 pl-4 list-disc">
              <li>You own & operate the storefront directly.</li>
              <li>Higher daily operational control & localized campaigns.</li>
              <li>Full operational, service, and diagnostics training.</li>
            </ul>
          </div>
        </div>
      </ScrollReveal>

      {/* 5. Cost Breakdown & ROI Calculator */}
      <ScrollReveal className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cost Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 space-y-6 shadow-xl">
          <h3 className="font-display font-bold text-xl text-slate-900">Setup Project Costing</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Final costing depends on store size, city tier, and location survey. Transparent investment breakdown:
          </p>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Franchise Fee</h4>
                <p className="text-[10px] text-slate-400">One-time partnership fee covering brand rights, training & guidance</p>
              </div>
              <span className="font-black text-slate-900 text-sm">₹2,00,000</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Store Interiors & Branding</h4>
                <p className="text-[10px] text-slate-400">Premium design, furniture layout, signage, and OOH branding assets</p>
              </div>
              <span className="font-black text-slate-900 text-sm">₹3,00,000</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Electronics & Tools Setup</h4>
                <p className="text-[10px] text-slate-400">CCTV, POS billing systems, printers, diagnostic testing software, and tools</p>
              </div>
              <span className="font-black text-slate-900 text-sm">₹2,00,000</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-805 text-xs">Initial Inventory Stock</h4>
                <p className="text-[10px] text-slate-400">Curated, high-demand certified refurbished smartphones & diagnostic accessories portfolio</p>
              </div>
              <span className="font-black text-slate-900 text-sm">₹15,00,000</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-850 text-xs">Min. Recommended Store Size</h4>
                <p className="text-[10px] text-slate-400">Ideal compact and scalable format for high footfall spaces</p>
              </div>
              <span className="font-black text-slate-900 text-sm">100 - 150 sq.ft.</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-black text-slate-900 text-sm">Total Project Investment:</span>
              <span className="font-black text-emerald-705 text-base">₹20 - 25 Lakhs</span>
            </div>
          </div>
        </div>

        {/* Right Column: ROI Calculator */}
        <div id="calculator" className="lg:sticky lg:top-24 lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl text-slate-900">ROI Calculator</h3>
            <p className="text-xs text-slate-500">Calculate operational profit margins and capital payback timelines</p>
          </div>

          <form onSubmit={handleCalculateRoi} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Business Model</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block flex-shrink-0"></span>
                  FICO (Company Operated - 3%)
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Total Investment (INR): ₹{roiParams.investmentSize.toLocaleString('en-IN')}</label>
                <input
                  type="range"
                  min="500000"
                  max="5000000"
                  step="100000"
                  value={roiParams.investmentSize}
                  onChange={(e) => handleInvestmentChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCalculating}
              className="w-full bg-ecoOrange-600 hover:bg-ecoOrange-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
            >
              {isCalculating ? 'Computing math...' : 'Generate ROI Cash Projections'}
            </button>
          </form>
        </div>
      </ScrollReveal>

      {/* 6. Form & Inventory Sourcing Mix Grid */}
      <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        {/* Left Column: Apply Wizard */}
        <div id="apply-form" className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-8 space-y-6 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-slate-900">Franchise Application Form</h2>
            
            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-4">
                <svg className="w-10 h-10 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold text-emerald-800 text-lg">Application Submitted!</h3>
                <p className="text-slate-655 text-xs leading-relaxed">
                  Thank you for applying to the EcoFone franchise program. Our sales relationship team has been notified. We will reach out to you via Email and WhatsApp within 24-48 business hours.
                </p>
                <button 
                  onClick={() => {
                    setFormData({
                      applicantName: '',
                      email: '',
                      phone: '',
                      locationPreference: '',
                      investmentCapacity: 2000000,
                      experienceDesc: '',
                    });
                    setSubmitSuccess(false);
                    setStep(1);
                  }} 
                  className="bg-emerald-600 hover:bg-emerald-550 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Apply for another location
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                {/* Step indicator */}
                <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-xs font-bold text-slate-400 mb-4 pb-2 border-b border-slate-200 text-center">
                  <span className={`pb-2 ${step >= 1 ? 'text-emerald-600 border-b-2 border-emerald-500 font-extrabold' : ''}`}>1. Contact</span>
                  <span className={`pb-2 ${step >= 2 ? 'text-emerald-600 border-b-2 border-emerald-500 font-extrabold' : ''}`}>2. Location</span>
                  <span className={`pb-2 ${step >= 3 ? 'text-emerald-600 border-b-2 border-emerald-500 font-extrabold' : ''}`}>3. Financials</span>
                </div>

                {step === 1 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter applicant name"
                        value={formData.applicantName}
                        onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number (WhatsApp preferred)</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        pattern="^[6-9]\d{9}$"
                        title="Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)"
                        placeholder="e.g. 9999988888"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Target Location Preference (City/State)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pune, Maharashtra"
                        value={formData.locationPreference}
                        onChange={(e) => setFormData({ ...formData, locationPreference: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Investment Budget (INR): ₹{formData.investmentCapacity.toLocaleString('en-IN')}</label>
                      <input
                        type="range"
                        min="1500000"
                        max="3500000"
                        step="100000"
                        value={formData.investmentCapacity}
                        onChange={(e) => setFormData({ ...formData, investmentCapacity: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                        <span>₹15 Lakhs</span>
                        <span>₹35 Lakhs</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Prior Business/Retail Experience</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe your background and setup timeline..."
                        value={formData.experienceDesc}
                        onChange={(e) => setFormData({ ...formData, experienceDesc: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {errorMsg && <div className="text-rose-600 text-xs font-semibold">{errorMsg}</div>}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all"
                    >
                      Back
                    </button>
                  )}
                  <div className="flex-1" />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-ecoOrange-600 hover:bg-ecoOrange-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    {isSubmitting ? 'Submitting...' : step < 3 ? 'Next' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Inventory Sourcing Mix */}
        <div className="bg-[#061C0F] text-white rounded-3xl p-8 space-y-6 shadow-xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="font-display font-bold text-2xl">Inventory Sourcing Mix</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Centralized procurement control maintains stock reliability. Balanced inventory mixture optimized for maximum retail margins:
            </p>
            <div className="space-y-5 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Premium Smartphones</span>
                  <span>65%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Mid-Range Devices</span>
                  <span>30%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Accessories & Spares</span>
                  <span>5%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-emerald-900/40 text-[10px] text-slate-400 font-medium">
            * Stock allocation rates are dynamically updated based on quarterly customer request ratios.
          </div>
        </div>
      </ScrollReveal>

      {/* 7. Roadmap Timeline (How to get started) */}
      <ScrollReveal className="space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[10px] text-ecoOrange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider block w-max mx-auto">
            Roadmap
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">How to Get Started</h2>
          <p className="text-slate-550 text-xs sm:text-sm max-w-lg mx-auto">Your step-by-step journey to becoming an EcoFone partner.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roadmapSteps.map((step) => (
            <div key={step.num} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow relative">
              <span className="absolute top-4 right-6 font-display font-black text-2xl text-emerald-100">{step.num}</span>
              <h3 className="font-display font-bold text-sm text-slate-900">{step.title}</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* 8. Contact Details & Inquiry Cards */}
      <ScrollReveal className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-md space-y-6">
        <h2 className="font-display font-bold text-2xl text-slate-900 text-center">Ready to Start Your Store?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-center">
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
            <svg className="w-6 h-6 text-ecoOrange-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Call Sales Desk</span>
            <a href="tel:+919919965499" className="font-black text-slate-900 text-sm hover:text-emerald-705 block">+91 99199 65499</a>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
            <svg className="w-6 h-6 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Inquiry</span>
            <a href="mailto:business@ecofone.co.in" className="font-black text-slate-900 text-sm hover:text-emerald-705 block">business@ecofone.co.in</a>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-2">
            <svg className="w-6 h-6 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Headquarters</span>
            <p className="font-bold text-slate-900 text-xs leading-snug">505, JB Metro Heights, Kanpur Road, Lucknow – 226012</p>
          </div>
        </div>
      </ScrollReveal>

      {/* ROI Projections Modal */}
      {showRoiModal && roiResults && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setShowRoiModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
                Financial Report
              </span>
              <h3 className="font-display font-black text-slate-900 text-xl">ROI Projection Estimate</h3>
              <p className="text-[11px] text-slate-400">Generated based on selected capital and model config.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl text-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase block leading-none">Monthly Net Profit</span>
                <p className="text-lg font-black text-emerald-700 mt-1.5 leading-none">₹{roiResults.monthlyMetrics.netProfit.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase block leading-none">ROI Payback Cycle</span>
                <p className="text-lg font-black text-slate-900 mt-1.5 leading-none">{roiResults.paybackPeriodText} Months</p>
              </div>
            </div>

            {/* 3-Year Projections */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider block text-center">3-Year Projected Net Profits</h4>
              <div className="space-y-2">
                {roiResults.projections.map((p: any) => (
                  <div key={p.year} className="flex justify-between items-center text-xs bg-slate-50/50 border border-slate-100 px-4 py-3.5 rounded-xl">
                    <span className="font-bold text-slate-800 font-display">Year {p.year}</span>
                    <div className="text-right">
                      <span className="text-slate-400 text-[9px] block">Cash Flow: ₹{p.cumulativeCashFlow.toLocaleString('en-IN')}</span>
                      <span className="text-emerald-700 font-extrabold text-xs">Profit: ₹{p.netProfit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => setShowRoiModal(false)}
              className="w-full bg-[#0a2d1a] hover:bg-emerald-950 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
