'use client';

import React from 'react';

export default function WhatsAppWidget() {
  const whatsappUrl = "https://wa.me/919919965499?text=Hello%20EcoFone%2C%20I%20am%20interested%20in%20the%20Franchise%20business%20opportunity.%20Please%20guide%20me.";

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip Label */}
      <div className="absolute right-16 bottom-3 bg-slate-900 border border-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-lg">
        Chat on WhatsApp
      </div>

      {/* Floating WhatsApp Bubble */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 flex items-center justify-center transition-all hover:scale-110 filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        aria-label="Contact EcoFone via WhatsApp"
      >
        {/* 3-Layered Slow Ping Echo Rings aligned with green inner circle */}
        <span className="absolute w-[42px] h-[42px] rounded-full bg-[#25D366] opacity-60 animate-ping [animation-duration:3s]"></span>
        <span className="absolute w-[42px] h-[42px] rounded-full bg-[#25D366] opacity-60 animate-ping [animation-duration:3s] [animation-delay:1s]"></span>
        <span className="absolute w-[42px] h-[42px] rounded-full bg-[#25D366] opacity-60 animate-ping [animation-duration:3s] [animation-delay:2s]"></span>
        {/* Official 3-Layered SVG Speech Bubble Badge */}
        <svg
          className="w-full h-full relative z-10"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* White Speech Bubble Background */}
          <path fill="#FFFFFF" d="M50 8C26.8 8 8 26.8 8 50c0 7.4 1.9 14.3 5.3 20.4L8 92l22.1-5.8C35.9 89.8 42.8 91.7 50 91.7 73.2 91.7 92 72.9 92 49.7 92 26.8 73.2 8 50 8z" />
          {/* Green Inner Circle */}
          <circle fill="#25D366" cx="50.2" cy="49.5" r="37.5" />
          {/* White Phone Receiver Icon */}
          <path fill="#FFFFFF" d="M66.5 59.5c-.9-.4-5.3-2.6-6.1-2.9-.8-.3-1.4-.4-2 .5-.6.9-2.3 2.9-2.8 3.5-.5.6-1 0.7-1.9.2-.9-.4-3.8-1.4-7.2-4.5-2.7-2.4-4.5-5.3-5-6.2-.5-.9 0-1.4.5-1.9.4-.4 0.9-1 1.4-1.6.5-.5.6-.9 1-1.5.3-.6.1-1.1-.1-1.6-.2-.5-2-4.9-2.8-6.7-.7-1.8-1.5-1.5-2-1.5-.5 0-1.1 0-1.7 0s-1.6.2-2.4 1.1c-.8.9-3.2 3.1-3.2 7.6s3.2 8.8 3.7 9.4c.5.6 6.3 9.7 15.3 13.6 2.1.9 3.8 1.5 5.1 1.9 2.2.7 4.1.6 5.7.3 1.7-.3 5.3-2.2 6.1-4.3.8-2.1.8-3.9.5-4.3-.2-.4-.8-.6-1.7-1z" />
        </svg>
      </a>
    </div>
  );
}
