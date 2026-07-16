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
  const hasHero = pathname === '/' || pathname === '/about' || pathname === '/services';
  const mainPaddingClass = isAdmin 
    ? "flex-grow" 
    : hasHero 
      ? "flex-grow pt-0" 
      : "flex-grow pt-24";

  return (
    <>
      <Navbar />
      <main className={mainPaddingClass}>
        {children}
      </main>
      {!isAdmin && footer}
      {!isAdmin && <WhatsAppWidget />}
    </>
  );
}
