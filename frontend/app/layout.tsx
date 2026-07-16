import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import React from "react";
import LayoutClientWrapper from "../components/layout-client-wrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "EcoFone | Luxury Re-Commerce Hub — Luxury Within Reach",
  description: "EcoFone is India's leading certified refurbished phone store. Sell your old phone for instant cash or buy verified smartphones with a 6-month warranty and easy EMIs.",
  keywords: "refurbished phones, sell old phone, buy used iphone, mobile marketplace, ecofone India",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "EcoFone - Premium Refurbished SmartPhones",
    description: "Sell your used mobile phone instantly or shop premium, tested devices with free doorstep delivery and full warranty.",
    url: "https://www.ecofone.co.in",
    siteName: "EcoFone India",
    images: [
      {
        url: "https://www.ecofone.co.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EcoFone Marketplace",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.ecofone.co.in/#organization",
                  "name": "EcoFone India",
                  "url": "https://www.ecofone.co.in",
                  "logo": "https://www.ecofone.co.in/logo.png",
                  "sameAs": [
                    "https://www.facebook.com/people/EcoFone/61583296272681/?mibextid=wwXIfr&rdid=3ro69EiPXA4Rlxf9&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F187RLSW1y4%2F%3Fmibextid%3DwwXIfr"
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91-9999988888",
                    "contactType": "customer support",
                    "areaServed": "IN",
                    "availableLanguage": ["en", "hi"]
                  }
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.ecofone.co.in/#website",
                  "url": "https://www.ecofone.co.in",
                  "name": "EcoFone | India's Premium Re-Commerce Hub",
                  "publisher": {
                    "@id": "https://www.ecofone.co.in/#organization"
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.ecofone.co.in/buy?search={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://www.ecofone.co.in/#localbusiness",
                  "name": "EcoFone Store HQ",
                  "image": "https://www.ecofone.co.in/logo.png",
                  "telephone": "+91-9999988888",
                  "url": "https://www.ecofone.co.in",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Andheri West",
                    "addressLocality": "Mumbai",
                    "addressRegion": "MH",
                    "postalCode": "400053",
                    "addressCountry": "IN"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 19.1136,
                    "longitude": 72.8697
                  },
                  "priceRange": "₹₹",
                  "openingHoursSpecification": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday"
                    ],
                    "opens": "10:00",
                    "closes": "20:00"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="bg-dots min-h-screen flex flex-col font-sans relative">
        <LayoutClientWrapper
          footer={
            <footer className="bg-[#061C0F] border-t border-white/10 py-12 text-sm text-slate-300 relative z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Column 1: Logo & Description */}
                <div className="space-y-4 md:col-span-4">
                  <Link href="/" className="font-display font-bold text-2xl text-white flex flex-col gap-2 items-start">
                    <img src="/logo.png" alt="EcoFone Logo" className="h-16 md:h-20 w-auto object-contain bg-transparent p-0 -ml-1" />
                    <span className="sr-only">EcoFone</span>
                  </Link>
                  <p className="text-xs leading-relaxed text-slate-400">
                    EcoFone is India’s premium franchise network and trade-in platform for high-quality refurbished smartphones. Extending the lifecycle of electronics for a greener tomorrow.
                  </p>
                  {/* Working Social Media Links */}
                  <div className="flex items-center gap-4 pt-2">
                    <a href="https://www.facebook.com/people/EcoFone/61583296272681/?mibextid=wwXIfr&rdid=3ro69EiPXA4Rlxf9&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F187RLSW1y4%2F%3Fmibextid%3DwwXIfr" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="Facebook">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="https://www.instagram.com/ecofone_official?igsh=MWtxamhoMmthZGY5aQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="Instagram">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                    <a href="https://www.linkedin.com/company/ecovista-private-limited/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="LinkedIn">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="https://x.com/ecofonel82115?s=11" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="X (Twitter)">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Column 2: Quick Links */}
                <div className="md:col-span-2 md:pl-4">
                  <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Quick Links</h4>
                  <ul className="space-y-2.5 text-xs">
                    <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                    <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                    <li><Link href="/services" className="hover:text-white transition-colors">Our Services</Link></li>
                    <li><Link href="/franchise" className="hover:text-white transition-colors">Franchise Program</Link></li>
                    <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                  </ul>
                </div>

                {/* Column 3: Contact & Support */}
                <div className="md:col-span-3">
                  <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Contact & Support</h4>
                  <ul className="space-y-2.5 text-xs text-slate-400">
                    <li>Email: <a href="mailto:support@ecofone.co.in" className="hover:text-white transition-colors">support@ecofone.co.in</a></li>
                    <li>Phone: <a href="tel:+919919965499" className="hover:text-white transition-colors">+91 99199 65499</a></li>
                    <li>Lucknow HQ: 505, JB Metro Heights, Kanpur Road, Lucknow – 226012</li>
                  </ul>
                </div>

                {/* Column 4: Map */}
                <div className="md:col-span-3">
                  <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Our Location</h4>
                  <div className="h-32 w-full rounded-2xl overflow-hidden border border-white/10 shadow-md bg-white/5">
                    <iframe
                      src="https://maps.google.com/maps?q=JB%20Metro%20Heights%20505%205th%20floor%20transport%20Nagar%20%2C%20Lucknow%2C%20Uttar%20Pradesh%20226012%20&#038;t=m&#038;z=13&#038;output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="opacity-75 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-white/5 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} EcoFone Franchise Network Private Limited. All rights reserved.</p>
              </div>
            </footer>
          }
        >
          {children}
        </LayoutClientWrapper>
      </body>
    </html>
  );
}
