'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  CreditCard,
  Ruler,
  MessageCircle,
} from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'sizing',
    categoryLabel: 'Sizing & Measurements',
    icon: Ruler,
    questions: [
      {
        q: 'How do Nakaam sizes compare to mainstream Pakistani brands (Khaadi, Sapphire)?',
        a: 'Mainstream commercial brands frequently use vanity sizing or vary seam measurements between production batches. Nakaam publishes exact physical garment measurements in centimeters and inches for every design. Our Fit Meter also informs you whether a particular cut runs true-to-size, relaxed, or structured.',
      },
      {
        q: 'What if I order a size and it is too tight or loose upon arrival?',
        a: 'We offer an unconditional 7-day doorstep size exchange. Our rider will deliver your replacement size and collect the current piece in a single visit in covered metropolitan areas (Lahore, Karachi, Islamabad).',
      },
      {
        q: 'Will the garment shrink after the first wash?',
        a: 'All Nakaam pure lawn, cotton, and linen fabrics undergo controlled pre-shrinkage washing before being tailored. When washed in cold water (<30°C) per our care guidelines, shrinkage is virtually negligible (less than 1.5%).',
      },
      {
        q: 'How do I choose the right khussa shoe size?',
        a: 'Handmade leather khussas do not have left or right feet initially; they mould to the unique contours of your feet within 2 to 3 wears. If you have broad feet or fall between half-sizes, we recommend sizing up by one size.',
      },
    ],
  },
  {
    category: 'inspection',
    categoryLabel: 'Doorstep Inspection & COD',
    icon: ShieldCheck,
    questions: [
      {
        q: 'Can I really open the parcel before paying the rider in Lahore?',
        a: 'Yes! In Lahore rider delivery zones, we practice open-box inspection. You may unseal the outer courier box, inspect the fabric weave, embroidery finish, and invoice while the rider waits for 3 to 5 minutes before handing over cash.',
      },
      {
        q: 'What happens if I do not like the item during doorstep inspection?',
        a: 'You can immediately reject the package on the spot. You owe zero rupees and no cancellation fees apply. Hand the package back to the courier.',
      },
      {
        q: 'Can I try on the outfit while the courier rider waits outside?',
        a: 'No. To ensure rider safety and punctuality on their daily route, riders cannot wait for full fitting sessions. You can visually inspect the item; if you find after trying it on in your room that the fit needs adjustment, request a doorstep swap via your account.',
      },
      {
        q: 'Is there a limit on Cash on Delivery orders?',
        a: 'For first-time customers, COD is available up to Rs 25,000. Orders above this threshold require partial prepayment via Raast bank transfer to confirm commitment.',
      },
    ],
  },
  {
    category: 'shipping',
    categoryLabel: 'Shipping & Delivery',
    icon: Truck,
    questions: [
      {
        q: 'What are the delivery charges across Pakistan?',
        a: 'We charge a flat nationwide delivery fee of Rs 250 on all orders below Rs 5,000. All orders valued at Rs 5,000 or more enjoy complimentary free delivery.',
      },
      {
        q: 'How long will it take for my order to arrive?',
        a: 'Lahore orders are fulfilled within 24 to 48 hours. Shipments to Karachi, Islamabad, Rawalpindi, and Faisalabad typically arrive within 2 to 3 business days via express courier air networks.',
      },
      {
        q: 'How do I track my shipment?',
        a: 'As soon as your parcel is packed and scanned by our courier partner, you will receive an SMS and WhatsApp message with your direct courier tracking link and consignment number. You can also view live status on our website under Account > Orders.',
      },
    ],
  },
  {
    category: 'payments',
    categoryLabel: 'Payments & Raast',
    icon: CreditCard,
    questions: [
      {
        q: 'How does Raast direct bank transfer work on Nakaam?',
        a: 'At checkout, select "Raast / Direct Bank Transfer". You will receive our Raast ID and bank account details. After transferring the exact integer PKR amount from your banking app, upload your receipt screenshot on the confirmation screen or WhatsApp it to us. Our finance team verifies it within 2 hours.',
      },
      {
        q: 'Are there any hidden payment surcharges or processing fees?',
        a: 'Never. Nakaam operates on strict integer PKR pricing. The price you see on the product card is the exact amount debited or handed to the rider.',
      },
    ],
  },
  {
    category: 'returns',
    categoryLabel: 'Exchanges & Refunds',
    icon: RotateCcw,
    questions: [
      {
        q: 'Are items bought on sale or discount eligible for exchange?',
        a: 'YES! While most major brands have a strict "No Return, No Exchange on Sale Items" policy, Nakaam guarantees that all sale and promotional pieces remain fully eligible for our 7-day size exchange.',
      },
      {
        q: 'What condition must the garment be in to qualify for exchange?',
        a: 'Garments must be unwashed, unworn, and have the original security loop hangtag intact. Garments with perfume scents, deodorant marks, or altered hems cannot be accepted.',
      },
      {
        q: 'Who pays the shipping charges for size exchanges?',
        a: 'Your first size exchange per order is 100% free; Nakaam absorbs the reverse logistics cost as part of our customer trust charter.',
      },
    ],
  },
];

export function FaqContent() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = useMemo(() => {
    return FAQ_DATA.map((cat) => {
      if (activeCategory !== 'all' && cat.category !== activeCategory) {
        return null;
      }
      const matchingQuestions = cat.questions.filter((item) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query);
      });

      if (matchingQuestions.length === 0) return null;
      return { ...cat, questions: matchingQuestions };
    }).filter(Boolean);
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* Breadcrumb Path */}
        <nav className="text-xs text-[#6B6B6B] flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#151515]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="text-[#151515] font-semibold">Frequently Asked Questions</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6E1DA] text-[#151515] inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#D12C2F]" />
            Client Knowledge Base
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#151515]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Everything you need to know about our honest sizing, open-box doorstep inspection, nationwide transit, and payment methods.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. doorstep inspection, exchange, shrink, Raast)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:border-[#151515] shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-[#151515] text-white shadow-sm'
                : 'bg-white text-[#6B6B6B] border border-[#E6E1DA] hover:text-[#151515]'
            }`}
          >
            All Questions
          </button>
          {FAQ_DATA.map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.category
                  ? 'bg-[#151515] text-white shadow-sm'
                  : 'bg-white text-[#6B6B6B] border border-[#E6E1DA] hover:text-[#151515]'
              }`}
            >
              {cat.categoryLabel}
            </button>
          ))}
        </div>

        {/* FAQ Accordions by Category */}
        <div className="space-y-8">
          {filteredCategories.length === 0 ? (
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-12 text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-[#6B6B6B] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#151515]">No answers found</h3>
              <p className="text-xs text-[#6B6B6B]">
                We could not find any FAQ matching &quot;{searchQuery}&quot;. Please feel free to reach out to our team.
              </p>
              <Link href="/contact">
                <Button className="mt-2 bg-[#151515] text-white text-xs">Contact Support</Button>
              </Link>
            </div>
          ) : (
            filteredCategories.map((catGroup) => {
              const Icon = catGroup.icon;
              return (
                <div key={catGroup.category} className="space-y-3">
                  <div className="flex items-center gap-2 pb-1">
                    <Icon className="w-4 h-4 text-[#D12C2F]" />
                    <h2 className="font-serif text-lg font-bold text-[#151515]">
                      {catGroup.categoryLabel}
                    </h2>
                  </div>

                  <div className="space-y-2.5">
                    {catGroup.questions.map((item, idx) => {
                      const id = `${catGroup.category}-${idx}`;
                      const isOpen = !!openItems[id];
                      return (
                        <div
                          key={id}
                          className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden transition-all shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() => toggleItem(id)}
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F6F2EC]/40 transition-colors"
                          >
                            <span className="font-semibold text-xs sm:text-sm text-[#151515]">
                              {item.q}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-[#6B6B6B] flex-shrink-0 transition-transform ${
                                isOpen ? 'rotate-180 text-[#151515]' : ''
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 pt-1 text-xs text-[#6B6B6B] leading-relaxed border-t border-[#E6E1DA]/50 bg-[#F6F2EC]/20">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="bg-[#151515] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-xl font-bold">Have a question not listed here?</h3>
            <p className="text-xs text-white/70">
              Our master darzis and support team in Lahore are on standby to help you.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact">
              <Button className="bg-[#D12C2F] text-white hover:bg-[#B52528] text-xs font-bold px-5">
                Speak to Concierge
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
