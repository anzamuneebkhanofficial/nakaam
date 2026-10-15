'use client';

import React from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChevronRight, FileText, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        <nav className="text-xs text-[#6B6B6B] flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#151515]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="text-[#151515] font-semibold">Terms of Service</span>
        </nav>

        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6E1DA] text-[#151515] inline-flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#D12C2F]" />
            Commerce Agreement
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#151515]">
            Terms of Service & Store Policies
          </h1>
          <p className="text-xs text-[#6B6B6B]">Effective: October 2026 &bull; Lahore, Pakistan</p>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-10 space-y-8 text-xs text-[#6B6B6B] leading-relaxed shadow-sm">
          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-[#151515]">1. Overview & Agreement</h2>
            <p>
              By accessing or purchasing from Nakaam (&quot;we&quot;, &quot;us&quot;) via our website or physical store, you agree to comply with these terms, our Commitments Charter, and our Doorstep Inspection and Return policies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-[#151515]">2. Integer PKR Pricing & Accuracy</h2>
            <p>
              All prices are listed in whole integer Pakistani Rupees (PKR) and include applicable production taxes. We reserve the right to correct rare clerical pricing errors before order dispatch, with prompt customer notification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-[#151515]">3. Doorstep Inspection Protocol (Lahore)</h2>
            <p>
              Doorstep open-box inspection allows up to 5 minutes of visual and tactile verification of garments in the presence of the courier rider. Trying on garments or damaging security loop hangtags voids on-the-spot rejection rights, but remains eligible for standard 7-day size exchange.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-[#151515]">4. 7-Day Size Exchanges on Sale Items</h2>
            <p>
              Our size exchange promise covers both regular priced and sale items. Exchanges must be lodged within 7 calendar days of delivery with the garment unwashed, unworn, and accompanied by original packaging.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-[#151515]">5. Governing Law</h2>
            <p>
              These terms are governed by and construed under the laws of the Islamic Republic of Pakistan and the jurisdiction of the courts of Lahore, Punjab.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
