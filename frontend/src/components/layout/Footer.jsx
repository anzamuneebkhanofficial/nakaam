import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '../shared/BrandLogo';
import {
  ShieldCheck,
  Eye,
  Ruler,
  RefreshCw,
  PhoneCall,
  Coins,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Doorstep Inspection',
    description: 'Open the parcel with the courier rider. Check fabric, size and stitches before paying COD.',
  },
  {
    icon: Eye,
    title: 'True-Colour Verified',
    description: 'Captured under calibrated studio daylight. What you see is what lands at your doorstep.',
  },
  {
    icon: Ruler,
    title: 'Real Measurements',
    description: 'Exact centimetre measurements for every size. Never generic S/M/L guesses.',
  },
  {
    icon: RefreshCw,
    title: 'Exchanges on Sale Items',
    description: 'Unlike typical brands, our size-exchange promise covers clearance and seasonal sales.',
  },
  {
    icon: PhoneCall,
    title: 'Direct Lahore Concierge',
    description: 'Real humans on WhatsApp and phone. Fast resolution with zero automated bots.',
  },
  {
    icon: Coins,
    title: 'Integer PKR Pricing',
    description: 'Clear, honest pricing with zero hidden surcharges or misleading markdowns.',
  },
];

function WhatsAppLink() {
  const [whatsAppNumber, setWhatsAppNumber] = useState(process.env.NEXT_PUBLIC_STORE_WHATSAPP || '+923008472910');

  useEffect(() => {
    let mounted = true;
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        // Expecting data.store.whatsapp or data.whatsapp depending on backend shape
        const candidate = data?.store?.whatsapp || data?.whatsapp || data?.settings?.whatsapp;
        if (mounted && candidate) setWhatsAppNumber(candidate);
      })
      .catch(() => {
        // silent fallback
      });
    return () => {
      mounted = false;
    };
  }, []);

  const numeric = (whatsAppNumber || '').toString().replace(/\D/g, '') || '923008472910';
  const href = `https://wa.me/${numeric}?text=Hello%20Nakaam%20Store%20Team`;

  return (
    <a href={href} className="hover:text-[#B82A2E] transition-colors" target="_blank" rel="noopener noreferrer">
      {whatsAppNumber}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#FAF8F5] text-[#141413] border-t border-[#EAE5DD] mt-20">
      {/* 6 Commitments Strip - Refined Integrated Grid */}
      <section className="border-b border-[#EAE5DD] py-14 px-6 sm:px-12 lg:px-16" aria-label="Trust Commitments">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#B82A2E]">
              Why Pakistani Households Choose Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold font-jakarta text-[#141413] mt-1.5 tracking-tight">
              Our Commitments to Every Household
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="flex gap-4 p-5 rounded-xl bg-white border border-[#EAE5DD] shadow-[0_2px_8px_rgba(20,20,19,0.03)] hover:border-[#D5CEBF] transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#FDF2F2] text-[#B82A2E] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#141413] mb-1">{p.title}</h3>
                    <p className="text-xs text-[#78736B] leading-relaxed">{p.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto py-16 px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo />
            <p className="text-xs sm:text-sm text-[#78736B] max-w-sm leading-relaxed mt-3">
              Nakaam is a trust-first fashion & home store for Pakistani households. Crafted with pure unbleached cotton, lustrous silks, and honest craftsmanship.
            </p>
            <div className="pt-2 text-xs text-[#4A4742] space-y-1.5">
              <p>
                <span className="font-semibold text-[#141413]">Flagship Studio:</span> Gulberg III, Lahore, Pakistan
              </p>
              <p>
                <span className="font-semibold text-[#141413]">WhatsApp Care:</span>{' '}
                {/** Use public settings when available; fall back to NEXT_PUBLIC_STORE_WHATSAPP or a safe default */}
                <WhatsAppLink />
              </p>
              <p>
                <span className="font-semibold text-[#141413]">Concierge Hours:</span> Mon – Sat: 10:00 AM – 8:00 PM (PKT)
              </p>
            </div>
          </div>

          {/* Column 1: Collections */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#141413] mb-4">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#78736B]">
              <li>
                <Link href="/shop?audience=women" className="hover:text-[#141413] transition-colors">
                  Womenswear
                </Link>
              </li>
              <li>
                <Link href="/shop?audience=men" className="hover:text-[#141413] transition-colors">
                  Menswear
                </Link>
              </li>
              <li>
                <Link href="/shop?audience=kids" className="hover:text-[#141413] transition-colors">
                  Kids & Teens
                </Link>
              </li>
              <li>
                <Link href="/shop?audience=footwear" className="hover:text-[#141413] transition-colors">
                  Footwear & Khussa
                </Link>
              </li>
              <li>
                <Link href="/shop?audience=home" className="hover:text-[#141413] transition-colors">
                  Home & Bedding
                </Link>
              </li>
              <li>
                <Link href="/sale" className="text-[#B82A2E] font-medium hover:underline">
                  Special Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#151515] mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm text-[#6B6B6B]">
              <li>
                <Link href="/shipping-returns" className="hover:text-[#151515] transition-colors">
                  Doorstep Inspection
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-[#151515] transition-colors">
                  Measuring Matrix
                </Link>
              </li>
              <li>
                <Link href="/fabric-care" className="hover:text-[#151515] transition-colors">
                  Fabric Care & Shrinkage
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-[#151515] transition-colors">
                  Shipping & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#151515] transition-colors">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#151515] transition-colors">
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Payments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#151515] mb-4">
              Payment Acceptance
            </h4>
            <ul className="space-y-2 text-xs text-[#3A3A3A]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#137333]" /> Cash on Delivery (COD)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#137333]" /> Raast P2P Direct
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#137333]" /> JazzCash / Easypaisa
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#137333]" /> Direct Bank Transfer (HBL)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#137333]" /> NayaPay / SadaPay
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA]">
              <p className="text-[11px] text-[#6B6B6B] leading-normal">
                <strong>Lahore Launch Area:</strong> Gulberg, DHA, Cantt, Model Town, Johar Town & Bahria Town.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#E6E1DA] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6B6B]">
          <p>
            © 2026 Nakaam E-Commerce. Designed &amp; Developed by{' '}
            <a
              href="https://muhammadanzamuneebkhan.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#151515] underline decoration-[#D12C2F]/50 hover:text-[#D12C2F] transition-colors"
            >
              Muhammad Anza Muneeb Khan
            </a>
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-[#151515]">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-[#151515]">
              Privacy Policy
            </Link>
            <Link href="/shipping-returns" className="hover:text-[#151515]">
              Doorstep Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
