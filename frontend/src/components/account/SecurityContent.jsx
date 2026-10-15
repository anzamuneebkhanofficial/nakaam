'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Banknote,
  KeyRound,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';

export function SecurityContent() {
  return (
    <div className="space-y-8">
      {/* Password Update Form (Screen 45) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
        <div className="pb-4 border-b border-[#E6E1DA]">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
            Account Security & Password
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Manage your credentials and active storefront sessions.
          </p>
        </div>

        <div className="max-w-md space-y-4">
          <p className="text-sm text-[#3A3A3A]">
            Password changes use the secure reset link sent to your registered email address.
          </p>
          <Button asChild variant="primary" className="font-bold h-11 px-6 text-xs">
            <Link href="/forgot-password">
              <KeyRound className="w-4 h-4 mr-1.5" />
              Continue to password reset
            </Link>
          </Button>
        </div>
            </div>

            {/* Saved Payment Methods Section (Screen 13) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E6E1DA]">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#151515]">
                  Checkout Payment Methods
                </h2>
                <p className="text-xs text-[#6B6B6B] mt-1">
                  Choose a payment method during checkout; available details are shown before order placement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash on Delivery Card */}
                <div className="p-5 rounded-2xl border border-[#151515] bg-[#F6F2EC]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#151515] flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-[#151515]" />
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Available
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">
                    Choose Cash on Delivery during checkout.
                  </p>
                </div>

                {/* Direct Transfer / Raast Card */}
                <div className="p-5 rounded-2xl border border-[#E6E1DA] bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#151515] flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#6B6B6B]" />
                      Direct Bank Transfer / Raast
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCEEEE] text-[#8F1A1E]">
                      5% Discount
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">
                    The checkout page displays the supported transfer details and receipt steps.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Privacy & Deletion */}
            <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-[#151515]">Account Privacy</h3>
                <p className="text-xs text-[#6B6B6B]">
                  Contact our support team with questions about your personal data or account deletion.
                </p>
              </div>

              <Button asChild variant="outline" size="sm" className="text-xs text-[#8F1A1E] hover:bg-[#FCEEEE] border-[#F5C2C4]">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
  );
}
