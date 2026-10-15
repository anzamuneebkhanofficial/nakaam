import React from 'react';
import { PackageCheck, Truck, RotateCcw, MessageSquare } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: PackageCheck,
    title: 'DOORSTEP INSPECTION',
    subtitle: 'Open & verify parcel before paying COD across Pakistan.',
  },
  {
    icon: Truck,
    title: 'TRACK YOUR ORDER',
    subtitle: 'Direct WhatsApp tracking & rider coordination.',
  },
  {
    icon: RotateCcw,
    title: '7-DAY EASY EXCHANGE',
    subtitle: 'Hassle-free size replacement on all seasonal releases.',
  },
  {
    icon: MessageSquare,
    title: 'ATELIER SUPPORT',
    subtitle: 'Direct human concierge for styling and garment care.',
  },
];

export function TrustValueBar() {
  return (
    <section className="bg-white border-y border-[#EAE5DD]" aria-label="Customer Guarantees">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {TRUST_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EAE5DD] group-hover:border-[#B82A2E] flex items-center justify-center text-[#B82A2E] shrink-0 transition-colors shadow-xs">
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold tracking-wider uppercase text-[#141413]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#78736B] mt-0.5 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

