'use client';

import React, { useState } from 'react';
import { Mail, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubmitted(true);
    toast.success('Welcome to the Nakaam Family! Check your inbox for your 10% welcome voucher.');
  };

  return (
    <section className="py-16 bg-[#F6F2EC] border-t border-[#E6E1DA]" aria-label="VIP Access">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8F1A1E]">
          Early Access & Secret Drops
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-[#151515] mt-1">
          Join the Nakaam Family Club
        </h2>
        <p className="mt-2 text-sm text-[#6B6B6B] max-w-lg mx-auto">
          Get WhatsApp restock alerts for limited unstitched suits, early access to seasonal clearances, and an instant 10% off voucher on your first order.
        </p>

        {isSubmitted ? (
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#E6F4EA] border border-[#137333]/20 text-[#137333] text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>You are subscribed! Welcome voucher dispatched to {email}.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <div className="relative w-full">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E6E1DA] text-sm text-[#151515] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#151515] transition-colors"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto rounded-full px-6 whitespace-nowrap"
            >
              <span>Join Club</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#6B6B6B]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#137333]" />
            No spam, guaranteed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#137333]" />
            Unsubscribe any time
          </span>
        </div>
      </div>
    </section>
  );
}
