'use client';

import React from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChevronRight, ShieldCheck, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        <nav className="text-xs text-[#6B6B6B] flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#151515]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="text-[#151515] font-semibold">Privacy Policy</span>
        </nav>

        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6E1DA] text-[#151515] inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#D12C2F]" />
            Data Protection Charter
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#151515]">
            Privacy Policy & Data Security
          </h1>
          <p className="text-xs text-[#6B6B6B]">Last updated: October 2026 &bull; Lahore, Pakistan</p>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-10 space-y-8 text-xs text-[#6B6B6B] leading-relaxed shadow-sm">
          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-[#151515]">1. Our Data Protection Philosophy</h2>
            <p>
              At Nakaam, we believe your personal information should be treated with the same discretion and respect as our bespoke tailoring. We never sell, rent, or trade your personal data, phone numbers, or shopping habits to third-party ad networks or brokers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-[#151515]">2. What We Collect and Why</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact & Delivery Details:</strong> Name, delivery address, phone/WhatsApp number, and optional email for order fulfillment, dispatch updates, and rider doorstep contact.</li>
              <li><strong>Family Size Book & Measurements:</strong> Centimeter measurements (bust/chest, waist, hips, shoulder, height) you choose to save in your profile to provide automated size recommendations.</li>
              <li><strong>Payment Proofs:</strong> Transaction reference IDs and receipt screenshots uploaded for Raast bank transfer verifications, purged from active processing after order fulfillment.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-[#151515]">3. Bank & Card Details Security</h2>
            <p>
              We do not store your banking credentials, CVV codes, or bank passwords. All direct bank transfers and Raast transfers occur in your own secure banking application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-[#151515]">4. Right to Deletion & Anonymization</h2>
            <p>
              In accordance with our digital rights policy, you may request permanent deletion of your account at any time via <Link href="/account/security" className="text-[#D12C2F] underline font-semibold">Account Security</Link>. Deleting your account irreversibly scrubs your personal identifying details and anonymizes your historical invoices for tax compliance.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
