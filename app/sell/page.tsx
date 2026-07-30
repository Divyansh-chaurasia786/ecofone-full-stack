'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface DeviceItem {
  id: string;
  name: string;
}

export default function SellPage() {
  const [step, setStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  
  // Lists mapped
  const brands = [
    { id: 'b1', name: 'Apple' },
    { id: 'b2', name: 'Samsung' },
    { id: 'b3', name: 'OnePlus' }
  ];

  const models: Record<string, DeviceItem[]> = {
    'b1': [
      { id: 'm1', name: 'iPhone 13' },
      { id: 'm2', name: 'iPhone 14' }
    ],
    'b2': [
      { id: 'm3', name: 'Galaxy S22' }
    ],
    'b3': [
      { id: 'm4', name: 'OnePlus 10 Pro' }
    ]
  };

  const variants: Record<string, DeviceItem[]> = {
    'm1': [
      { id: 'v1', name: '128GB (Midnight)' },
      { id: 'v2', name: '256GB (Blue)' }
    ],
    'm2': [
      { id: 'v4', name: '128GB (Space Gray)' }
    ],
    'm3': [
      { id: 'v3', name: '128GB (Phantom Black)' }
    ],
    'm4': [
      { id: 'v5', name: '256GB (Emerald Green)' }
    ]
  };

  // Defects checklist
  const [defects, setDefects] = useState({
    screenDefect: false,
    bodyDefect: false,
    batteryDefect: false,
    cameraDefect: false,
    networkDefect: false,
  });

  const [pricingQuote, setPricingQuote] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Pickup Scheduling States
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const calculateOffer = async () => {
    setIsCalculating(true);
    setErrorMsg('');
    try {
      // Fetch calculation quote from NestJS API
      const res = await api.getQuote({
        variantId: selectedVariant || 'v1', // fallback
        screenDefect: defects.screenDefect,
        bodyDefect: defects.bodyDefect,
        batteryDefect: defects.batteryDefect,
        cameraDefect: defects.cameraDefect,
        networkDefect: defects.networkDefect,
      });
      setPricingQuote(res);
      setStep(4); // proceed to pricing offer layout
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch device valuation.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBookPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    setErrorMsg('');
    try {
      // First verify and record user OTP credentials locally (simulated link)
      // Call schedule trade-in pickup
      await api.schedulePickup({
        variantId: selectedVariant || 'v1',
        screenDefect: defects.screenDefect,
        bodyDefect: defects.bodyDefect,
        batteryDefect: defects.batteryDefect,
        cameraDefect: defects.cameraDefect,
        networkDefect: defects.networkDefect,
        offeredPrice: pricingQuote.offeredPrice,
        pickupAddress,
        pickupDate,
      });

      // Persist contact details in browser localstorage to login customer profile
      localStorage.setItem('ecofone_phone', clientPhone);

      setScheduleSuccess(true);
      setStep(5); // completion slide
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to schedule pickup transaction.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Title */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Sell Old Phone for <span className="gradient-text-green">Instant Cash</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm">
          Run our 30-second diagnostics wizard to get an algorithmically backed valuation quote.
        </p>
      </div>

      {/* Main Card */}
      <div className="glassmorphism rounded-3xl border border-white/10 p-8">
        {errorMsg && <div className="bg-red-950/20 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs mb-4">{errorMsg}</div>}

        {/* Step 1: Brand & Model Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-white text-lg">1. Choose Brand & Model</h2>
            
            {/* Brands */}
            <div className="grid grid-cols-3 gap-4">
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBrand(b.id); setSelectedModel(''); setSelectedVariant(''); }}
                  className={`p-4 rounded-xl border text-sm font-semibold transition-all ${
                    selectedBrand === b.id 
                      ? 'border-ecoGreen-500 bg-ecoGreen-500/10 text-white' 
                      : 'border-white/10 hover:border-white/20 text-gray-300 bg-white/5'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            {/* Models */}
            {selectedBrand && (
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Select Model</label>
                <div className="grid grid-cols-2 gap-3">
                  {models[selectedBrand]?.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setSelectedVariant(''); }}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        selectedModel === m.id
                          ? 'border-ecoGreen-500 bg-ecoGreen-500/10 text-white'
                          : 'border-white/5 hover:border-white/15 text-gray-400 bg-white/5'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variants */}
            {selectedModel && (
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Select Storage/Color Variant</label>
                <div className="grid grid-cols-2 gap-3">
                  {variants[selectedModel]?.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        selectedVariant === v.id
                          ? 'border-ecoGreen-500 bg-ecoGreen-500/10 text-white'
                          : 'border-white/5 hover:border-white/15 text-gray-400 bg-white/5'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                disabled={!selectedVariant}
                onClick={() => setStep(2)}
                className="bg-ecoGreen-600 hover:bg-ecoGreen-500 disabled:opacity-40 disabled:hover:bg-ecoGreen-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all"
              >
                Proceed to Diagnostics
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Diagnostics Checklist */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-white text-lg">2. Device Diagnostics Checklist</h2>
            <p className="text-xs text-gray-400">Please answer honestly. Issues will be verified by the pickup agent.</p>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Screen Glass / Display issues</span>
                  <span className="text-[10px] text-gray-500">Cracks, heavy scratches, lines or touch faults</span>
                </div>
                <input
                  type="checkbox"
                  checked={defects.screenDefect}
                  onChange={(e) => setDefects({ ...defects, screenDefect: e.target.checked })}
                  className="w-4 h-4 rounded text-ecoGreen-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Body Panels Dent / Scratch issues</span>
                  <span className="text-[10px] text-gray-500">Dents, structural bends or back glass cracked</span>
                </div>
                <input
                  type="checkbox"
                  checked={defects.bodyDefect}
                  onChange={(e) => setDefects({ ...defects, bodyDefect: e.target.checked })}
                  className="w-4 h-4 rounded text-ecoGreen-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Battery Degradation</span>
                  <span className="text-[10px] text-gray-500">Battery health is reported below 80% or degrades quickly</span>
                </div>
                <input
                  type="checkbox"
                  checked={defects.batteryDefect}
                  onChange={(e) => setDefects({ ...defects, batteryDefect: e.target.checked })}
                  className="w-4 h-4 rounded text-ecoGreen-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Camera / Speaker Issues</span>
                  <span className="text-[10px] text-gray-500">Lens cracked, auto-focus failed, or static speakers</span>
                </div>
                <input
                  type="checkbox"
                  checked={defects.cameraDefect}
                  onChange={(e) => setDefects({ ...defects, cameraDefect: e.target.checked })}
                  className="w-4 h-4 rounded text-ecoGreen-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Network / Bluetooth / WiFi issues</span>
                  <span className="text-[10px] text-gray-500">Sim card not showing signal, or wifi fails to connect</span>
                </div>
                <input
                  type="checkbox"
                  checked={defects.networkDefect}
                  onChange={(e) => setDefects({ ...defects, networkDefect: e.target.checked })}
                  className="w-4 h-4 rounded text-ecoGreen-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="border border-white/10 hover:bg-white/5 text-xs text-white font-semibold px-4 py-2 rounded-xl"
              >
                Back
              </button>
              <button
                onClick={calculateOffer}
                disabled={isCalculating}
                className="bg-ecoGreen-600 hover:bg-ecoGreen-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                {isCalculating ? 'Recalculating value metrics...' : 'Calculate Best Cash Price'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: View Valuation & Get Book Details */}
        {step === 4 && pricingQuote && (
          <div className="space-y-6">
            <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[10px] text-gray-400">Your Instant Cash Offer</span>
              <p className="text-4xl font-extrabold text-ecoGreen-400 mt-2">₹{pricingQuote.offeredPrice.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-gray-500 block mt-2">Recalculated based on base value ₹{pricingQuote.basePrice.toLocaleString('en-IN')}</span>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h3 className="font-semibold text-white text-sm">3. Schedule Doorstep Pickup</h3>
              
              <form onSubmit={handleBookPickup} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ecoGreen-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="^[6-9]\d{9}$"
                      title="Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)"
                      placeholder="e.g. 9999988888"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ecoGreen-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Preferred Pickup Date</label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ecoGreen-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Full Pickup Address</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter complete address with pincode..."
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ecoGreen-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="border border-white/10 hover:bg-white/5 text-xs text-white font-semibold px-4 py-2 rounded-xl"
                  >
                    Recalculate checklist
                  </button>
                  <button
                    type="submit"
                    disabled={isScheduling}
                    className="bg-ecoGreen-600 hover:bg-ecoGreen-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    {isScheduling ? 'Booking schedule...' : 'Book Pickup Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {step === 5 && scheduleSuccess && (
          <div className="text-center py-10 space-y-6 bg-white/5 rounded-2xl border border-white/5">
            <svg className="w-12 h-12 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h2 className="font-bold text-white text-xl">Pickup Scheduled Successfully!</h2>
            <p className="text-gray-300 text-xs max-w-md mx-auto leading-relaxed">
              We have scheduled your doorstep pickup for **{pickupDate}**. Our inspection agent will call you 1 hour before arrival. After basic hardware verification, cash will be instantly transferred to your UPI.
            </p>
            <button
              onClick={() => { setStep(1); setSelectedBrand(''); setSelectedModel(''); setSelectedVariant(''); setPricingQuote(null); setScheduleSuccess(false); }}
              className="bg-ecoGreen-600 text-white text-xs font-semibold px-6 py-2 rounded-xl"
            >
              Sell another device
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
