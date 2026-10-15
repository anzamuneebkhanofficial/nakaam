import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F6F2EC] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#151515] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
        <BrandLogo withText={false} size="sm" />
      </header>

      {/* Main Content Area */}
      <main className="max-w-md w-full mx-auto my-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-xs text-[#6B6B6B] space-y-1">
        <p>
          © 2026 Nakaam E-Commerce. Developed by{' '}
          <a
            href="https://muhammadanzamuneebkhan.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#151515] underline decoration-[#D12C2F]/50 hover:text-[#D12C2F] transition-colors"
          >
            Muhammad Anza Muneeb Khan
          </a>
        </p>
        <p className="text-[11px] text-[#9A9A9A]">
          Doorstep Inspection Guaranteed on Cash on Delivery
        </p>
      </footer>
    </div>
  );
}
