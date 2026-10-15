import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Compass, ShoppingBag, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F2EC] text-[#151515] px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6 bg-white border border-[#E6E1DA] rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#FCEEEE] text-[#D12C2F] flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8F1A1E]">
            Error 404 &bull; Page Not Found
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#151515]">
            Page Not Found
          </h1>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            The page or product you are looking for has been moved, renamed, or is currently unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link href="/" className="w-full">
            <Button className="w-full bg-[#151515] hover:bg-black text-white text-xs font-bold py-2.5 flex items-center justify-center gap-2">
              <Home className="w-3.5 h-3.5" />
              Return to Storefront
            </Button>
          </Link>
          <Link href="/shop" className="w-full">
            <Button variant="outline" className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              Explore All Products
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#E6E1DA] text-[11px] text-[#6B6B6B]">
          Need help? <Link href="/contact" className="text-[#151515] font-semibold underline">Contact Customer Support</Link>
        </div>
      </div>
    </div>
  );
}
