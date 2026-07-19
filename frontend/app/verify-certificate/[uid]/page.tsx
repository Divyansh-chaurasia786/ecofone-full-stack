'use client';

import React, { use, useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

interface CertificateData {
  id: string;
  uid: string;
  recipientName: string;
  type: string;
  role: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  description: string;
  authorizedSignatory: string;
  registeredOffice: string;
  website: string;
  email: string;
  cin: string;
}

export default function VerifyCertificatePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVerification() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest(`certificate/verify/${uid}`, { method: 'GET' });
        setCertificate(data);
      } catch (err: any) {
        setError(err.message || 'Verification failed. Certificate not found.');
      } finally {
        setLoading(false);
      }
    }

    if (uid) {
      fetchVerification();
    }
  }, [uid]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-12 px-4 relative overflow-hidden font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-950/20 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-950/20 blur-3xl" />

      {/* Main Container */}
      <div className="max-w-3xl w-full mx-auto my-auto z-10">
        {/* Header Logo section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              ECOVISTA
            </span>
            <div className="w-[2px] h-6 bg-slate-700" />
            <span className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
              Verification Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Ecovista Global Private Limited Authenticity Check</p>
        </div>

        {loading ? (
          // Loading Skeleton
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 bg-slate-800 rounded-full mb-6" />
            <div className="w-48 h-8 bg-slate-800 rounded mb-4" />
            <div className="w-32 h-5 bg-slate-800 rounded mb-8" />
            <div className="w-full space-y-3 mb-6">
              <div className="h-4 bg-slate-800 rounded w-1/3 mx-auto" />
              <div className="h-4 bg-slate-800 rounded w-2/3 mx-auto" />
            </div>
            <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
              <div className="h-12 bg-slate-800 rounded" />
              <div className="h-12 bg-slate-800 rounded" />
            </div>
          </div>
        ) : error ? (
          // Error State (Verification Failed)
          <div className="bg-slate-900/60 backdrop-blur-xl border border-red-900/40 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-950/50 border border-red-500/30 rounded-full flex items-center justify-center mb-6 text-red-500 text-3xl">
              ✕
            </div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Certificate UID</h1>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              This certificate code <span className="font-mono text-red-300 font-semibold">{uid}</span> could not be verified on our official records.
            </p>
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4 text-xs text-red-300 max-w-lg mb-6">
              <strong>Security Alert:</strong> If this certificate was presented as proof of internship or employment at Ecovista Global, it might be counterfeit. Please contact our support team immediately to confirm.
            </div>
            <a
              href="/"
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition-colors border border-slate-700"
            >
              Return to Homepage
            </a>
          </div>
        ) : (
          // Success State (Verified Certificate)
          <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-950/40 rounded-2xl p-8 shadow-2xl relative">
            {/* Stamp highlight */}
            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider uppercase">
              ✓ VERIFIED
            </div>

            {/* Content header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-emerald-950/50 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4 text-emerald-400 text-3xl">
                ✓
              </div>
              <h1 className="text-2xl font-extrabold text-emerald-400">Authentic Certificate</h1>
              <p className="text-slate-400 text-xs mt-1">Verified on official Ecovista Database</p>
              <div className="font-mono text-xs bg-slate-800 px-3 py-1 rounded mt-3 text-slate-300 border border-slate-700">
                UID: {certificate?.uid}
              </div>
            </div>

            {/* Recipient Details */}
            <div className="border-t border-b border-slate-800/80 py-6 my-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Recipient Name</span>
                  <span className="text-base font-bold text-slate-200">{certificate?.recipientName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Certificate Type</span>
                  <span className="text-base font-bold text-emerald-400 capitalize">{certificate?.type.toLowerCase()} Certificate</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Role / Designation</span>
                  <span className="text-base font-bold text-slate-200">{certificate?.role}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Duration</span>
                  <span className="text-base font-semibold text-slate-300">
                    {formatDate(certificate?.startDate || '')} - {formatDate(certificate?.endDate || '')}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Date of Issue</span>
                  <span className="text-sm font-semibold text-slate-300">{formatDate(certificate?.issueDate || '')}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Authorized Signatory</span>
                  <span className="text-sm font-semibold text-slate-300">{certificate?.authorizedSignatory}</span>
                </div>
              </div>

              {/* Performance description */}
              <div className="pt-4 border-t border-slate-800/50">
                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Scope of Work & Assessment</span>
                <p className="text-xs text-slate-400 leading-relaxed italic bg-slate-950/40 p-4 rounded-lg border border-slate-900">
                  "{certificate?.description}"
                </p>
              </div>
            </div>

            {/* Corporate Info */}
            <div className="text-center space-y-1">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider">ISSUING CORPORATION DETAILS</p>
              <p className="text-xs text-slate-400">{certificate?.registeredOffice}</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-2">
                <span>CIN: {certificate?.cin}</span>
                <span>•</span>
                <a href={`mailto:${certificate?.email}`} className="hover:text-emerald-400 transition-colors">
                  {certificate?.email}
                </a>
                <span>•</span>
                <a href={`https://${certificate?.website}`} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  {certificate?.website}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-slate-600 mt-8 z-10">
        © {new Date().getFullYear()} Ecovista Global Private Limited. All rights reserved. Secure Verification Protocol.
      </div>
    </div>
  );
}
