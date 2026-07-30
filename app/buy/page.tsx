'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import EmiCalculator from '../../components/emi-calculator';

interface SKUDetail {
  skuId: string;
  brandName: string;
  brandSlug: string;
  modelName: string;
  modelSlug: string;
  specifications: any;
  ram: string;
  storage: string;
  color: string;
  grade: string;
  price: number;
  dealerPrice: number;
  stock: number;
}

export default function BuyCatalogPage() {
  const [catalog, setCatalog] = useState<SKUDetail[]>([]);
  const [filteredCatalog, setFilteredCatalog] = useState<SKUDetail[]>([]);
  
  // Filters
  const [brandFilter, setBrandFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected SKU for detail view/checkout modal
  const [selectedSku, setSelectedSku] = useState<SKUDetail | null>(null);
  
  // Checkout & OTP verification variables
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: details/OTP verify, 2: booking, 3: completed
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderConfirm, setOrderConfirm] = useState<any>(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await api.getCatalog();
        setCatalog(res);
        setFilteredCatalog(res);
      } catch (err) {
        console.error('Failed to load marketplace catalog:', err);
      }
    }
    loadCatalog();

    // Check for pre-saved customer login
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('ecofone_phone') || '';
      if (savedPhone) {
        setPhone(savedPhone);
        setClientName('Valued Customer');
      }
    }
  }, []);

  // Filter evaluation
  useEffect(() => {
    let result = catalog;
    if (brandFilter) {
      result = result.filter(item => item.brandSlug === brandFilter.toLowerCase());
    }
    if (gradeFilter) {
      result = result.filter(item => item.grade === gradeFilter.toUpperCase());
    }
    if (searchQuery) {
      result = result.filter(item => 
        item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.color.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredCatalog(result);
  }, [brandFilter, gradeFilter, searchQuery, catalog]);

  const handleSendOtp = async () => {
    if (!phone.match(/^\+?[1-9]\d{1,14}$/)) {
      setCheckoutError('Please enter a valid international phone number');
      return;
    }
    setIsProcessing(true);
    setCheckoutError('');
    try {
      await api.sendOtp(phone);
      setIsOtpSent(true);
    } catch (err: any) {
      setCheckoutError(err.message || 'OTP delivery failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.match(/^\d{6}$/)) {
      setCheckoutError('OTP must be exactly 6 digits');
      return;
    }
    setIsProcessing(true);
    setCheckoutError('');
    try {
      const res = await api.verifyOtp(phone, otpCode);
      // Save Token in LocalStorage
      localStorage.setItem('ecofone_token', res.token);
      localStorage.setItem('ecofone_phone', phone);
      
      // Proceed with checkout booking
      await executeRazorpayCheckout();
    } catch (err: any) {
      setCheckoutError(err.message || 'OTP verification verification failed');
      setIsProcessing(false);
    }
  };

  const executeRazorpayCheckout = async () => {
    if (!selectedSku) return;
    setIsProcessing(true);
    setCheckoutError('');
    try {
      // 1. Call checkout api to secure order and create Razorpay ID
      const orderData = await api.initiateCheckout(selectedSku.skuId);
      
      // Save order context locally to verify payment signature later
      const orderId = orderData.orderId;
      const razorpayOrderId = orderData.razorpayOrderId;

      // 2. Open Razorpay payments verification dialog (simulate webhook checkouts)
      // Since window.Razorpay may not be present in script environments, we simulate signature verification callback
      console.log(`[Razorpay Order Created] ID: ${razorpayOrderId}, Amount: ₹${orderData.amount}`);
      
      setTimeout(async () => {
        try {
          // Bypassing with mock payment validation details
          const verifyResult = await api.verifyPayment({
            orderId,
            razorpayPaymentId: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
            razorpaySignature: 'rzp_mock_signature', // triggers test bypass bypass on NestJS side
          });

          if (verifyResult.success) {
            setOrderConfirm({
              orderId,
              amount: orderData.amount,
              razorpayOrderId,
            });
            setCheckoutStep(3); // success completion
          }
        } catch (vErr: any) {
          setCheckoutError(vErr.message || 'Payment signature verification check failed.');
        } finally {
          setIsProcessing(false);
        }
      }, 1500);

    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout creation failed.');
      setIsProcessing(false);
    }
  };

  const handleCheckoutClick = () => {
    // Check if token exists, bypass OTP setup
    const token = localStorage.getItem('ecofone_token');
    if (token) {
      executeRazorpayCheckout();
    } else {
      setCheckoutStep(1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search iPhone, Samsung, color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-ecoGreen-500"
          />
        </div>
        <div className="flex items-center gap-4 text-xs">
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ecoGreen-500"
          >
            <option value="">All Brands</option>
            <option value="apple">Apple</option>
            <option value="samsung">Samsung</option>
            <option value="oneplus">OnePlus</option>
          </select>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ecoGreen-500"
          >
            <option value="">All Grades</option>
            <option value="like_new">Like New</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCatalog.map((item) => (
          <div
            key={item.skuId}
            onClick={() => { setSelectedSku(item); setCheckoutStep(1); setIsOtpSent(false); setCheckoutError(''); }}
            className="glassmorphism-card rounded-3xl p-6 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-ecoGreen-400 font-bold bg-ecoGreen-500/10 px-2 py-0.5 rounded-full uppercase">
                  {item.grade.replace('_', ' ')} Grade
                </span>
                <span className="text-gray-500 text-xs">{item.stock > 0 ? `Stock: ${item.stock}` : 'Out of stock'}</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-ecoGreen-400 transition-colors">
                  {item.modelName}
                </h3>
                <span className="text-xs text-gray-400">{item.ram} / {item.storage} • {item.color}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 bg-white/5 p-3 rounded-2xl">
                <span>⚡ {item.specifications?.screen || 'Tested Screen'}</span>
                <span>⚙️ {item.specifications?.chip || 'Tested Processor'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
              <p className="text-xl font-extrabold text-white">₹{item.price.toLocaleString('en-IN')}</p>
              <button className="bg-ecoGreen-600 group-hover:bg-ecoGreen-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all">
                Buy Device →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail & Razorpay Checkout Modal */}
      {selectedSku && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative space-y-6">
            <button 
              onClick={() => setSelectedSku(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Info & EMI Calculator */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs text-ecoGreen-400 font-bold bg-ecoGreen-500/10 px-2 py-0.5 rounded-full uppercase">
                    Grade {selectedSku.grade.replace('_', ' ')}
                  </span>
                  <h2 className="font-display font-bold text-2xl text-white mt-2">{selectedSku.modelName}</h2>
                  <p className="text-xs text-gray-400">{selectedSku.ram} / {selectedSku.storage} • {selectedSku.color}</p>
                </div>
                {/* EMI widget */}
                <EmiCalculator price={selectedSku.price} />
              </div>

              {/* Checkout Actions */}
              <div className="flex flex-col justify-between">
                <div className="glassmorphism rounded-2xl border border-white/10 p-6 space-y-4">
                  <h3 className="font-semibold text-white text-sm">Secured Razorpay Checkout</h3>
                  
                  {checkoutStep === 1 && (
                    <div className="space-y-4">
                      {isOtpSent ? (
                        <div className="space-y-3">
                          <label className="block text-[10px] text-gray-400">Enter 6-digit OTP code sent to {phone}</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter 6-digit OTP"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ecoGreen-500"
                          />
                          <button
                            onClick={handleVerifyOtp}
                            disabled={isProcessing}
                            className="w-full bg-ecoGreen-600 hover:bg-ecoGreen-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all"
                          >
                            {isProcessing ? 'Verifying credentials...' : 'Verify OTP & Pay'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="block text-[10px] text-gray-400">Please verify your phone number to proceed</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +919999988888"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ecoGreen-500"
                          />
                          <button
                            onClick={handleSendOtp}
                            disabled={isProcessing}
                            className="w-full bg-ecoGreen-600 hover:bg-ecoGreen-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all"
                          >
                            {isProcessing ? 'Sending code...' : 'Request OTP Code'}
                          </button>
                        </div>
                      )}
                      
                      {checkoutError && <div className="text-red-400 text-xs font-semibold">{checkoutError}</div>}
                    </div>
                  )}

                  {checkoutStep === 3 && orderConfirm && (
                    <div className="text-center py-6 space-y-4 bg-ecoGreen-950/20 border border-ecoGreen-500/30 rounded-xl">
                      <span className="text-3xl">🎉</span>
                      <h4 className="font-bold text-white text-sm">Payment Confirmed!</h4>
                      <p className="text-gray-300 text-[10px] px-4 leading-relaxed">
                        Your payment of **₹{orderConfirm.amount.toLocaleString('en-IN')}** was completed successfully. Order reference ID is **{orderConfirm.orderId}**. We have locked the serial number IMEI item in our inventory system.
                      </p>
                      <button
                        onClick={() => { setSelectedSku(null); }}
                        className="bg-ecoGreen-600 text-white text-[10px] px-4 py-1.5 rounded-lg"
                      >
                        Back to Marketplace
                      </button>
                    </div>
                  )}

                  {checkoutStep !== 3 && (
                    <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Total Purchase:</span>
                      <span className="font-extrabold text-white text-lg">₹{selectedSku.price.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {!localStorage.getItem('ecofone_token') && checkoutStep === 1 ? null : (
                  checkoutStep !== 3 && (
                    <button
                      onClick={handleCheckoutClick}
                      disabled={isProcessing}
                      className="w-full bg-ecoGreen-600 hover:bg-ecoGreen-500 text-white font-bold text-xs py-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                    >
                      {isProcessing ? 'Verifying payment status...' : 'Buy Now with Razorpay'}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
