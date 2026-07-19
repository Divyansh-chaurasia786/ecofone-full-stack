'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import WhatsAppWidget from './whatsapp-widget';

export default function LayoutClientWrapper({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname === '/admin';
  const isVerify = pathname?.startsWith('/verify-certificate');
  const hideNavAndFooter = isAdmin || isVerify;
  const hasHero = pathname === '/' || pathname === '/about' || pathname === '/services';

  const mainPaddingClass = hideNavAndFooter 
    ? "flex-grow" 
    : hasHero 
      ? "flex-grow pt-0" 
      : "flex-grow pt-24";

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <main className={mainPaddingClass}>
        {children}
      </main>
      {!hideNavAndFooter && footer}
      {!hideNavAndFooter && <WhatsAppWidget />}
    </>
  );
}
