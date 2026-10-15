import React from 'react';
import { ShieldCheck, MessageSquare, RefreshCw, Ruler, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const COMPARISONS = [
  {
    feature: 'Doorstep Inspection',
    nakaam: 'Rider waits while you open box and inspect fabric before paying COD.',
    industry: 'Strict "No Open Box" rule enforced by courier services.',
  },
  {
    feature: 'Sale & Discounted Exchanges',
    nakaam: '7-day hassle-free exchange on all items, including clearance & sale.',
    industry: '"No return, no exchange on sale items" printed on every receipt.',
  },
  {
    feature: 'Sizing & Measurements',
    nakaam: 'Guaranteed exact centimetre tables for chest, waist, and length.',
    industry: 'Generic S/M/L tables with unpredictable shrinkage and fit variance.',
  },
  {
    feature: 'WhatsApp Direct Support',
    nakaam: 'Live human coordination for size queries and delivery scheduling.',
    industry: 'Slow email ticketing systems and unhelpful automated chatbots.',
  },
];

export function DifferentiatorsHub() {
  return (
    <section className="py-16 bg-white border-y border-[#E6E1DA]" aria-label="Why Nakaam Is Different">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="red" className="mb-2">
            The Nakaam Standard
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-jakarta text-[#151515]">
            Built to Fix Pakistani Online Shopping
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#6B6B6B]">
            We designed our policies specifically to eliminate the fears, surprises, and courier arguments that have plagued online shopping in Pakistan.
          </p>
        </div>

        {/* Comparison Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {COMPARISONS.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#F6F2EC] border border-[#E6E1DA] flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold font-jakarta text-[#151515] mb-4">
                  {item.feature}
                </h3>

                {/* The Nakaam Way */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#E6E1DA] mb-3">
                  <CheckCircle2 className="w-5 h-5 text-[#137333] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-[#137333] uppercase tracking-wider block">
                      The Nakaam Way
                    </span>
                    <p className="text-xs text-[#151515] font-medium mt-0.5">
                      {item.nakaam}
                    </p>
                  </div>
                </div>

                {/* Other Brands */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#EFEAE2]/60 border border-[#E6E1DA]/60">
                  <XCircle className="w-5 h-5 text-[#8F1A1E] flex-shrink-0 mt-0.5 opacity-70" />
                  <div>
                    <span className="text-[11px] font-bold text-[#8F1A1E] uppercase tracking-wider block opacity-70">
                      Standard Market Practice
                    </span>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      {item.industry}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
