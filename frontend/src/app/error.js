'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log unexpected runtime client error
    console.error('App runtime error caught by root boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F2EC] text-[#151515] px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6 bg-white border border-[#E6E1DA] rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#FCEEEE] text-[#D12C2F] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8F1A1E]">
            System Notice
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#151515]">
            Something went wrong
          </h1>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            We encountered an unexpected display issue while presenting this page. Please try refreshing or return home.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <Button
            type="button"
            onClick={() => reset()}
            className="flex-1 bg-[#151515] hover:bg-black text-white text-xs font-bold py-2.5 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2">
              <Home className="w-3.5 h-3.5" />
              Home
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#E6E1DA] text-[11px] text-[#6B6B6B]">
          If this persists, please <Link href="/contact" className="text-[#151515] font-semibold underline">contact customer support</Link>.
        </div>
      </div>
    </div>
  );
}
