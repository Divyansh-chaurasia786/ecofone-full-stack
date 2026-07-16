'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '../lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  // Secret admin logo click easter-egg state
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  // Premium Admin password modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminModalError, setAdminModalError] = useState('');

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hasHero = pathname === '/' || pathname === '/about' || pathname === '/services';
      const threshold = hasHero ? 250 : 0;
      setIsScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const hasHero = pathname === '/' || pathname === '/about' || pathname === '/services';
  const showGlass = isScrolled || !hasHero;

  const handleAdminAuthSubmit = async () => {
    const currentPassword = (typeof window !== 'undefined' && localStorage.getItem('ecofone_admin_password')) || 'admin123';
    
    // 1. Check Master Admin password
    if (adminPasswordInput === currentPassword) {
      setIsAdminModalOpen(false);
      setAdminPasswordInput('');
      setAdminModalError('');

      const adminPayload = {
        id: 'admin1',
        email: 'business@ecofone.co.in',
        phone: '+91 99199 65499',
        role: 'ADMIN',
      };
      const mockAdminToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(adminPayload))}.mocksignature12345`;
      
      sessionStorage.setItem('ecofone_token', mockAdminToken);
      sessionStorage.setItem('ecofone_phone', '+91 99199 65499');
      sessionStorage.setItem('ecofone_admin_role', 'master');

      router.push('/admin');
      return;
    }

    // 2. Otherwise try Sub-Admin login via backend
    try {
      const result = await api.subAdminLogin(adminPasswordInput);
      const { token } = result;

      setIsAdminModalOpen(false);
      setAdminPasswordInput('');
      setAdminModalError('');

      sessionStorage.setItem('ecofone_token', token);
      sessionStorage.setItem('ecofone_phone', '+91 99199 65499');
      sessionStorage.setItem('ecofone_admin_role', 'sub-admin');

      router.push('/admin');
    } catch {
      setAdminModalError('Invalid credentials. Access Denied.');
    }
  };

  const handleLogoClick = async (e: React.MouseEvent) => {
    const now = Date.now();
    let currentClicks = logoClicks;
    
    if (now - lastClickTime > 2000) {
      currentClicks = 1;
    } else {
      currentClicks += 1;
    }

    setLogoClicks(currentClicks);
    setLastClickTime(now);

    if (currentClicks >= 3) {
      e.preventDefault();
      setLogoClicks(0);
      setIsAdminModalOpen(true);
      setAdminPasswordInput('');
      setAdminModalError('');
    }
  };

  const links = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Our Services', href: '/services' },
    { name: 'Franchise', href: '/franchise' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return isActive
      ? 'bg-white/15 text-white border border-white/25 shadow-[0_2px_10px_rgba(255,255,255,0.05)]'
      : 'text-white/85 hover:bg-white/10 hover:text-white border border-transparent';
  };

  if (pathname === '/admin') return null;

  return (
    <>
      <div className={`fixed left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
        showGlass ? 'top-4' : 'top-6'
      }`}>
      {/* Navbar Container */}
      <div className="max-w-5xl mx-auto relative">
        <nav className={`rounded-full px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-300 ${
          showGlass
            ? 'bg-black/20 bg-gradient-to-b from-white/[0.12] to-transparent backdrop-blur-[30px] backdrop-saturate-[160%] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.15)]'
            : 'bg-transparent border-transparent shadow-none'
        }`}>
          {/* Logo on Left */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center py-1 -ml-1.5 sm:-ml-3">
            <img src="/logo.png" alt="EcoFone Logo" className="h-11 md:h-12 w-auto object-contain bg-transparent p-0" />
          </Link>

          {/* Desktop Navigation Links (Distributed) */}
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hidden md:inline-block px-3.5 py-1.5 rounded-full transition-all duration-300 text-xs lg:text-[13px] font-extrabold ${getLinkClass(link.href)}`}
            >
              {link.name}
            </Link>
          ))}

          {/* Desktop Apply Button (Desktop Only) */}
          <Link
            href="/franchise?scroll=apply"
            className="hidden sm:inline-block border border-ecoOrange-600 text-ecoOrange-600 text-[11px] sm:text-xs font-extrabold px-5 py-2.5 rounded-full transition-all hover:bg-ecoOrange-600 hover:text-white hover:scale-105 whitespace-nowrap -mr-1.5 sm:-mr-3"
          >
            Apply for Franchise
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full transition-all focus:outline-none text-white hover:text-white hover:bg-white/10 -mr-1.5"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? (
              // Close Icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger Icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
      </nav>

        {/* Mobile Dropdown Panel */}
        {isOpen && (
          <div className="absolute top-[76px] left-0 right-0 bg-slate-950/95 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 animate-slide-up md:hidden z-40">
            <div className="flex flex-col gap-1.5">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-2xl text-sm font-extrabold transition-all ${
                      isActive
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'hover:bg-white/5 text-white/80 border border-transparent'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile-Only CTA */}
            <div className="border-t border-white/10 pt-4">
              <Link
                href="/franchise?scroll=apply"
                className="block w-full text-center border border-ecoOrange-600 text-ecoOrange-600 hover:bg-ecoOrange-600 hover:text-white text-xs font-black py-3.5 rounded-2xl transition-all"
              >
                Apply for Franchise
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {isAdminModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-[#061C0F] border border-emerald-500/25 rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform scale-100 transition-all duration-300 relative overflow-hidden animate-scale-in">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-ecoOrange-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center space-y-2 relative z-10">
            <div className="w-12 h-12 bg-emerald-950 border border-emerald-800/40 rounded-2xl flex items-center justify-center mx-auto mb-2 transition-transform duration-300 hover:scale-110">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-display font-extrabold text-white text-lg">Administrator Panel</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Enter your administrative security credentials to request a data backup export of current leads.
            </p>
          </div>

          <div className="space-y-3 relative z-10">
            <div>
              <input
                type="password"
                placeholder="Enter administrator password"
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  setAdminModalError('');
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    await handleAdminAuthSubmit();
                  }
                }}
                className="w-full bg-[#0a2d1a] border border-emerald-900 focus:border-emerald-500/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all text-center tracking-widest font-black"
                autoFocus
              />
            </div>
            {adminModalError && (
              <div className="text-red-400 text-[10px] font-bold text-center animate-pulse">
                ⚠ {adminModalError}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2 relative z-10">
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(false)}
              className="w-1/2 border border-emerald-900/50 hover:bg-white/5 text-slate-300 hover:text-white font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdminAuthSubmit}
              className="w-1/2 bg-ecoOrange-600 hover:bg-ecoOrange-500 text-white font-black py-2.5 rounded-xl text-xs transition-all shadow-[0_4px_12px_rgba(234,88,12,0.15)]"
            >
              Authenticate
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
