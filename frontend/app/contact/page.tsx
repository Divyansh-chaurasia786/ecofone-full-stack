'use client';

import React, { useState } from 'react';
import { api } from '../../lib/api';
import ScrollReveal from '../../components/scroll-reveal';
import { submitToGoogleForm } from '../../lib/google-forms';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    locationPreference: 'Lucknow HQ Inquiry',
    investmentCapacity: 1000000,
    experienceDesc: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.applyFranchise(formData);
      await submitToGoogleForm('Contact', formData);
      setSubmitSuccess(true);
      if (typeof window !== 'undefined') {
        const bc = new BroadcastChannel('ecofone_crm');
        bc.postMessage('new_query_submitted');
        bc.close();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch contact query.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-[#FAF9F6]">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3 animate-slide-up">
        <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider bg-[#0a2d1a] border border-emerald-800/30 px-3.5 py-1.5 rounded-full inline-block">
          Get in Touch
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
          Contact <span className="gradient-text-green">EcoFone HQ</span>
        </h1>
        <p className="text-slate-550 text-xs sm:text-sm">
          Have franchise queries or support requests? Drop us a line or visit our head office.
        </p>
      </div>

      <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Form */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-6 shadow-xl">
          <h3 className="font-bold text-slate-900 text-base">Send us a Message</h3>
          
          {submitSuccess ? (
            <div className="text-center py-8 space-y-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-fade-in">
              <svg className="w-10 h-10 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h4 className="font-bold text-emerald-800 text-base">Query Dispatched!</h4>
              <p className="text-slate-650 text-xs px-6 leading-relaxed">
                Thank you for contacting EcoFone support. Your query has been logged in our CRM workflow. One of our relations executives will call or email you within 24 business hours.
              </p>
              <button
                onClick={() => {
                  setFormData({
                    applicantName: '',
                    email: '',
                    phone: '',
                    locationPreference: 'Lucknow HQ Inquiry',
                    investmentCapacity: 1000000,
                    experienceDesc: '',
                  });
                  setSubmitSuccess(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-555 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1">Phone Number</label>
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
              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1">Your Query / Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry..."
                  value={formData.experienceDesc}
                  onChange={(e) => setFormData({ ...formData, experienceDesc: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {errorMsg && <div className="text-red-650 text-xs font-semibold">{errorMsg}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ecoOrange-600 hover:bg-ecoOrange-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(234,88,12,0.15)]"
              >
                {isSubmitting ? 'Syncing to CRM lead desk...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Address and Map Iframe */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">Corporate Office</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>505, JB Metro Heights, 5th Floor, Transport Nagar Metro Station, Kanpur Road, Lucknow – 226012</span>
              </p>
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 text-ecoOrange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 99199 65499</span>
              </p>
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@ecofone.co.in</span>
              </p>
            </div>
          </div>

          {/* Map centering Lucknow office */}
          <div className="h-[300px] rounded-3xl overflow-hidden border border-slate-100 shadow-xl relative bg-[#FAF9F6]">
            <iframe
              src="https://maps.google.com/maps?q=JB%20Metro%20Heights%20505%205th%20floor%20transport%20Nagar%20%2C%20Lucknow%2C%20Uttar%20Pradesh%20226012%20&#038;t=m&#038;z=13&#038;output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="opacity-95"
            />
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
