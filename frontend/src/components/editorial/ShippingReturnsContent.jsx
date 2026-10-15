'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  PackageCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';

const CHARTER_PROMISES = [
  {
    num: '01',
    title: 'Open-Box Doorstep Inspection',
    tagline: 'Inspect before you pay in Lahore rider zones',
    desc: 'Unseal the courier package at your front door, touch the fabric, and verify the stitching before handing over cash to the courier rider.',
  },
  {
    num: '02',
    title: 'Free 7-Day Size Exchange',
    tagline: 'Covers all items, including seasonal sale lines',
    desc: 'Unlike conventional brands that exclude marked-down stock, our size exchange promise unconditionally protects full price and sale items alike.',
  },
  {
    num: '03',
    title: 'Pre-Shrunk Precision Tailoring',
    tagline: 'Exact centimeter measurements guaranteed',
    desc: 'All lawn and cotton fabrics undergo controlled pre-shrinkage washing before cut and stitch, preventing post-wash surprises.',
  },
  {
    num: '04',
    title: 'Rapid 24-Hour Dispatch',
    tagline: 'Monitored logistics across Pakistan',
    desc: 'In-stock pret orders are packaged and handed to verified express courier partners (TCS, Leopards, Call Courier) within 1 business day.',
  },
  {
    num: '05',
    title: 'Transparent Integer Pricing',
    tagline: 'Zero hidden taxes, zero checkout surcharges',
    desc: 'What you see on the product card is the exact total in integer PKR. No surprise handling fees, gateway surcharges, or fractional paisas.',
  },
  {
    num: '06',
    title: 'Direct WhatsApp Concierge',
    tagline: 'Live human assistance in Urdu and English',
    desc: 'Get order milestones, live tracking links, and instant swap approvals directly on WhatsApp without endless ticket queues.',
  },
];

const INSPECTION_STEPS = [
  {
    step: '1',
    title: 'Rider Arrives at Your Door',
    desc: 'Your dedicated rider rings your bell with your tamper-evident Nakaam branded parcel box.',
  },
  {
    step: '2',
    title: 'Request Open-Box Unsealing',
    desc: 'Ask the rider to wait 3 minutes while you gently open the outer seal to inspect your garments.',
  },
  {
    step: '3',
    title: 'Check Fabric, Tag & Sizing',
    desc: 'Verify that color matching, embroidery details, and size labels match your order summary.',
  },
  {
    step: '4',
    title: 'Settle Payment or Instant Return',
    desc: 'Pay cash / scan the rider Raast QR code. If the item was not what you expected, hand it back on the spot with zero hassle.',
  },
];

const CITIES_SHIPPING = [
  { city: 'Lahore (Main Hub)', time: 'Same-day or Next-day (24 hrs)', fee: 'Rs 250 (Free over Rs 5,000)', openBox: 'Available via Express Rider' },
  { city: 'Karachi & Suburbs', time: '2 - 3 Business Days via Air Express', fee: 'Rs 250 (Free over Rs 5,000)', openBox: 'Doorstep exchange via TCS' },
  { city: 'Islamabad & Rawalpindi', time: '1 - 2 Business Days', fee: 'Rs 250 (Free over Rs 5,000)', openBox: 'Doorstep exchange via TCS' },
  { city: 'Faisalabad, Multan, Sialkot', time: '2 - 3 Business Days', fee: 'Rs 250 (Free over Rs 5,000)', openBox: 'Courier pickup on swap' },
  { city: 'Peshawar, Quetta & Regional', time: '3 - 4 Business Days', fee: 'Rs 250 (Free over Rs 5,000)', openBox: 'Courier pickup on swap' },
];

export function ShippingReturnsContent() {
  const [activeTab, setActiveTab] = useState('charter'); // 'charter' | 'inspection' | 'exchange' | 'shipping'

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* Breadcrumb Path */}
        <nav className="text-xs text-[#6B6B6B] flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#151515]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="text-[#151515] font-semibold">Shipping, Inspection & Doorstep Returns</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FCEEEE] text-[#8F1A1E] inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Nakaam 6-Promises Consumer Charter
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#151515]">
            Shipping & Doorstep Trust
          </h1>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            We understand the hesitations of buying couture online in Pakistan. That is why Nakaam guarantees open-box doorstep inspection, transparent flat-rate delivery, and 7-day hassle-free size exchanges.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 border-b border-[#E6E1DA]">
          <button
            type="button"
            onClick={() => setActiveTab('charter')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'charter'
                ? 'bg-[#151515] text-white shadow-sm'
                : 'bg-white text-[#6B6B6B] border border-[#E6E1DA] hover:text-[#151515]'
            }`}
          >
            6-Promises Charter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inspection')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'inspection'
                ? 'bg-[#151515] text-white shadow-sm'
                : 'bg-white text-[#6B6B6B] border border-[#E6E1DA] hover:text-[#151515]'
            }`}
          >
            Open-Box Inspection (Lahore)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exchange')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'exchange'
                ? 'bg-[#151515] text-white shadow-sm'
                : 'bg-white text-[#6B6B6B] border border-[#E6E1DA] hover:text-[#151515]'
            }`}
          >
            7-Day Exchange Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'shipping'
                ? 'bg-[#151515] text-white shadow-sm'
                : 'bg-white text-[#6B6B6B] border border-[#E6E1DA] hover:text-[#151515]'
            }`}
          >
            Delivery Rates & Timelines
          </button>
        </div>

        {/* Tab 1: 6 Promises Charter */}
        {activeTab === 'charter' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CHARTER_PROMISES.map((p) => (
                <div
                  key={p.num}
                  className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-3 relative hover:shadow-md transition-shadow"
                >
                  <span className="font-serif text-3xl font-bold text-[#E6E1DA] absolute top-5 right-5 select-none">
                    {p.num}
                  </span>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#D12C2F] uppercase tracking-wider block">
                      {p.tagline}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#151515]">{p.title}</h3>
                  </div>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#151515] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-serif text-xl font-bold">Have an order in transit right now?</h4>
                <p className="text-xs text-white/70">
                  Track your parcel real-time with your order number (`NK-YYMM-XXXXXX`) or registered phone.
                </p>
              </div>
              <Link href="/account/orders">
                <Button className="bg-[#D12C2F] text-white hover:bg-[#B52528] text-xs font-bold px-5">
                  Track My Shipment
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Open-Box Inspection Workflow */}
        {activeTab === 'inspection' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#D12C2F] uppercase tracking-wider">Screen 7 Feature</span>
                <h2 className="text-2xl font-serif font-bold text-[#151515]">
                  How Doorstep Open-Box Inspection Works
                </h2>
                <p className="text-xs text-[#6B6B6B]">
                  Currently available on all express motorcycle deliveries within Lahore city limits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {INSPECTION_STEPS.map((s) => (
                  <div key={s.step} className="bg-[#F6F2EC] border border-[#E6E1DA] rounded-xl p-5 space-y-2 relative">
                    <div className="w-7 h-7 rounded-full bg-[#151515] text-white flex items-center justify-center font-bold text-xs">
                      {s.step}
                    </div>
                    <h3 className="font-semibold text-sm text-[#151515]">{s.title}</h3>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspection Terms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-3">
                <h3 className="font-serif text-base font-bold text-[#151515] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What You Can Do During Inspection
                </h3>
                <ul className="text-xs text-[#6B6B6B] space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Unpack garment from protective sleeve to inspect fabric hand-feel and weave.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Check embroidered motifs, buttons, and stitching seams against photos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Confirm size labels and garment measurements match your invoice.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Reject parcel without paying any COD balance if items arrive defective or incorrect.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-3">
                <h3 className="font-serif text-base font-bold text-[#151515] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#D12C2F]" />
                  Inspection Limitations
                </h3>
                <ul className="text-xs text-[#6B6B6B] space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#D12C2F] font-bold text-sm leading-none">•</span>
                    <span>Do NOT try on clothing while rider waits (rider waiting time is strictly 3-5 minutes).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D12C2F] font-bold text-sm leading-none">•</span>
                    <span>Do NOT cut or tear attached brand security loop tags.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D12C2F] font-bold text-sm leading-none">•</span>
                    <span>Partial acceptances are not allowed (accept full order or request doorstep swap).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D12C2F] font-bold text-sm leading-none">•</span>
                    <span>If sizing needs adjustment after trying on in your mirror, use our 7-day swap portal.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 7-Day Exchange Rules */}
        {activeTab === 'exchange' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#D12C2F] uppercase tracking-wider">Nakaam Distinction D7</span>
                <h2 className="text-2xl font-serif font-bold text-[#151515]">
                  7-Day Size Exchange Policy
                </h2>
                <p className="text-xs text-[#6B6B6B]">
                  We believe you should love the way your garment fits. If a kurta is slightly loose or snug, we swap it at your doorstep.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#151515]">1. Request in 7 Days</h3>
                  <p className="text-xs text-[#6B6B6B]">
                    Go to `Account &gt; Orders`, click on your order, and press &quot;Request Size Exchange&quot;. Select your target replacement size.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#151515]">2. Keep Security Tag</h3>
                  <p className="text-xs text-[#6B6B6B]">
                    Garment must be unworn, unwashed, and have the red Nakaam security hangtag attached. No perfume or deodorant marks.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] space-y-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#151515]">3. Doorstep Swap</h3>
                  <p className="text-xs text-[#6B6B6B]">
                    Our rider brings your fresh size and simultaneously collects the previous item in a single visit in covered metropolitan areas.
                  </p>
                </div>
              </div>

              {/* Special Sale Clause */}
              <div className="bg-[#FCEEEE] border border-[#F6D0D0] rounded-xl p-4 text-xs text-[#8F1A1E] space-y-1">
                <p className="font-bold">Are discounted or clearance items exchangeable?</p>
                <p className="leading-relaxed">
                  <strong>YES!</strong> Unlike mainstream retail chains that mark sale items as &quot;No Return, No Exchange&quot;, Nakaam covers all sale and promotional purchases under our standard 7-day size exchange promise.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Delivery Rates & Timelines */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif font-bold text-[#151515]">Nationwide Delivery Schedule</h2>
                <p className="text-xs text-[#6B6B6B]">
                  Standard flat-rate shipping of Rs 250 across all territories. Complimentary free delivery on orders exceeding Rs 5,000.
                </p>
              </div>

              <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
                    <tr>
                      <th className="py-3 px-4">City / Region</th>
                      <th className="py-3 px-4">Estimated Transit</th>
                      <th className="py-3 px-4">Shipping Fee</th>
                      <th className="py-3 px-4">Doorstep Inspection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
                    {CITIES_SHIPPING.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F6F2EC]/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#151515]">{row.city}</td>
                        <td className="py-3.5 px-4">{row.time}</td>
                        <td className="py-3.5 px-4 font-medium text-[#151515]">{row.fee}</td>
                        <td className="py-3.5 px-4 text-[#8F1A1E] font-medium">{row.openBox}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Contact Concierge Strip */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg font-bold text-[#151515]">Still have questions about your delivery?</h3>
            <p className="text-xs text-[#6B6B6B]">
              Our dispatch team responds promptly on WhatsApp daily from 10:00 AM to 8:00 PM PKT.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/faq">
              <Button variant="outline" className="text-xs font-semibold">Read FAQ</Button>
            </Link>
            <Link href="/contact">
              <Button className="bg-[#151515] text-white hover:bg-black text-xs font-semibold">Contact Support</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
