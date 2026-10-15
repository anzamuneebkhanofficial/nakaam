'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  Ruler,
  ChevronRight,
  Info,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const WOMEN_KURTA_CM = [
  { size: 'XS', bust: 86, waist: 71, hip: 94, shoulder: 36, sleeve: 53, length: 99 },
  { size: 'S', bust: 91, waist: 76, hip: 99, shoulder: 37, sleeve: 55, length: 102 },
  { size: 'M', bust: 97, waist: 81, hip: 104, shoulder: 38, sleeve: 56, length: 104 },
  { size: 'L', bust: 104, waist: 89, hip: 112, shoulder: 40, sleeve: 57, length: 107 },
  { size: 'XL', bust: 112, waist: 97, hip: 119, shoulder: 42, sleeve: 58, length: 109 },
];

const WOMEN_TROUSER_CM = [
  { size: 'XS', waist: '66 - 76', hip: 96, outseam: 94, inseam: 68, bottom: 15 },
  { size: 'S', waist: '71 - 81', hip: 102, outseam: 96, inseam: 70, bottom: 16 },
  { size: 'M', waist: '76 - 86', hip: 107, outseam: 99, inseam: 71, bottom: 17 },
  { size: 'L', waist: '84 - 96', hip: 114, outseam: 102, inseam: 72, bottom: 18 },
  { size: 'XL', waist: '91 - 104', hip: 122, outseam: 104, inseam: 74, bottom: 19 },
];

const MEN_KURTA_CM = [
  { size: 'S', chest: 96, neck: 38, shoulder: 44, sleeve: 61, length: 102, shalwarLength: 102 },
  { size: 'M', chest: 104, neck: 40, shoulder: 47, sleeve: 63, length: 107, shalwarLength: 104 },
  { size: 'L', chest: 112, neck: 42, shoulder: 50, sleeve: 65, length: 112, shalwarLength: 107 },
  { size: 'XL', chest: 120, neck: 44, shoulder: 52, sleeve: 66, length: 114, shalwarLength: 109 },
];

const KHUSSA_SIZES = [
  { pk: '5 PK', eu: '36 EU', us: '5.5 US', lengthCm: 23.0, lengthIn: 9.0 },
  { pk: '6 PK', eu: '37 EU', us: '6.5 US', lengthCm: 23.8, lengthIn: 9.4 },
  { pk: '7 PK', eu: '38 EU', us: '7.5 US', lengthCm: 24.5, lengthIn: 9.6 },
  { pk: '8 PK', eu: '39 EU', us: '8.5 US', lengthCm: 25.3, lengthIn: 10.0 },
  { pk: '9 PK', eu: '40 EU', us: '9.5 US', lengthCm: 26.0, lengthIn: 10.2 },
  { pk: '10 PK', eu: '41 EU', us: '10.5 US', lengthCm: 26.8, lengthIn: 10.5 },
];

export function SizeGuideContent() {
  const [unit, setUnit] = useState('cm'); // 'cm' or 'in'
  const [activeTab, setActiveTab] = useState('women-kurta');

  const convert = (val) => {
    if (typeof val === 'string') {
      if (val.includes('-')) {
        const parts = val.split('-').map((s) => parseFloat(s.trim()));
        if (unit === 'in') {
          return `${(parts[0] / 2.54).toFixed(1)} - ${(parts[1] / 2.54).toFixed(1)}`;
        }
        return val;
      }
      return val;
    }
    if (unit === 'in') {
      return (val / 2.54).toFixed(1);
    }
    return val;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        {/* Breadcrumb Path */}
        <nav className="text-xs text-[#6B6B6B] flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#151515]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="text-[#151515] font-semibold">Size Guide & Measuring Matrix</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FCEEEE] text-[#8F1A1E] inline-flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5" />
            Standard Pakistani Sizing Architecture
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#151515]">
            Size Guide & Measuring Matrix
          </h1>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Crafted for classical lawn cuts, pret tailoring, and authentic leather khussa footwear. Use our interactive matrix to select your standard size with confidence.
          </p>
        </div>

        {/* Unit Switcher & Category Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'women-kurta', label: 'Women’s Kurta & Pret' },
              { id: 'women-trouser', label: 'Trousers & Shalwars' },
              { id: 'men-kurta', label: 'Men’s Kurta & Suit' },
              { id: 'khussa', label: 'Footwear & Khussa' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#151515] text-white shadow-xs'
                    : 'bg-white border border-[#E6E1DA] text-[#3A3A3A] hover:bg-[#F6F2EC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white border border-[#E6E1DA] rounded-xl self-end sm:self-auto">
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                unit === 'cm' ? 'bg-[#151515] text-white' : 'text-[#6B6B6B] hover:text-[#151515]'
              }`}
            >
              Centimeters (cm)
            </button>
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                unit === 'in' ? 'bg-[#151515] text-white' : 'text-[#6B6B6B] hover:text-[#151515]'
              }`}
            >
              Inches (in)
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-3xl border border-[#E6E1DA] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
            <h2 className="font-serif text-xl font-bold text-[#151515]">
              {activeTab === 'women-kurta' && 'Women’s Kurta & Shirt Measurements'}
              {activeTab === 'women-trouser' && 'Trousers, Shalwars & Cigarette Pants'}
              {activeTab === 'men-kurta' && 'Men’s Kurta & Shalwar Kameez'}
              {activeTab === 'khussa' && 'Traditional Handcrafted Khussa & Footwear'}
            </h2>
            <span className="text-xs text-[#6B6B6B] font-semibold">Unit: {unit.toUpperCase()}</span>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'women-kurta' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1DA] text-[#6B6B6B] uppercase font-bold tracking-wider">
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Bust / Chest</th>
                    <th className="py-3 px-3">Waist</th>
                    <th className="py-3 px-3">Hips</th>
                    <th className="py-3 px-3">Shoulder</th>
                    <th className="py-3 px-3">Sleeve</th>
                    <th className="py-3 px-3">Shirt Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1DA] font-medium text-[#151515]">
                  {WOMEN_KURTA_CM.map((row) => (
                    <tr key={row.size} className="hover:bg-[#F6F2EC]/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#8F1A1E] font-mono">{row.size}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.bust)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.waist)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.hip)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.shoulder)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.sleeve)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.length)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'women-trouser' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1DA] text-[#6B6B6B] uppercase font-bold tracking-wider">
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Waist (Elastic Relaxed - Stretched)</th>
                    <th className="py-3 px-3">Hips</th>
                    <th className="py-3 px-3">Outseam Length</th>
                    <th className="py-3 px-3">Inseam</th>
                    <th className="py-3 px-3">Hem Opening (Paunche)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1DA] font-medium text-[#151515]">
                  {WOMEN_TROUSER_CM.map((row) => (
                    <tr key={row.size} className="hover:bg-[#F6F2EC]/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#8F1A1E] font-mono">{row.size}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.waist)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.hip)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.outseam)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.inseam)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.bottom)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'men-kurta' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1DA] text-[#6B6B6B] uppercase font-bold tracking-wider">
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-3">Chest</th>
                    <th className="py-3 px-3">Collar / Neck</th>
                    <th className="py-3 px-3">Shoulder</th>
                    <th className="py-3 px-3">Sleeve Length</th>
                    <th className="py-3 px-3">Kurta Length</th>
                    <th className="py-3 px-3">Shalwar Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1DA] font-medium text-[#151515]">
                  {MEN_KURTA_CM.map((row) => (
                    <tr key={row.size} className="hover:bg-[#F6F2EC]/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#8F1A1E] font-mono">{row.size}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.chest)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.neck)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.shoulder)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.sleeve)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.length)}</td>
                      <td className="py-3.5 px-3 font-mono">{convert(row.shalwarLength)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'khussa' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1DA] text-[#6B6B6B] uppercase font-bold tracking-wider">
                    <th className="py-3 px-3">Pakistani Size</th>
                    <th className="py-3 px-3">European Size</th>
                    <th className="py-3 px-3">US Size</th>
                    <th className="py-3 px-3">Foot Length ({unit.toUpperCase()})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1DA] font-medium text-[#151515]">
                  {KHUSSA_SIZES.map((row) => (
                    <tr key={row.pk} className="hover:bg-[#F6F2EC]/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#8F1A1E] font-mono">{row.pk}</td>
                      <td className="py-3.5 px-3 font-mono">{row.eu}</td>
                      <td className="py-3.5 px-3 font-mono">{row.us}</td>
                      <td className="py-3.5 px-3 font-mono">
                        {unit === 'cm' ? `${row.lengthCm} cm` : `${row.lengthIn} in`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* How to Measure Step-by-Step */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#151515] pb-3 border-b border-[#E6E1DA]">
            How to Measure Accurately at Home
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs leading-relaxed text-[#3A3A3A]">
            <div className="p-4 rounded-2xl bg-[#F6F2EC] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#151515] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-sm text-[#151515]">Bust / Chest</h4>
              <p>
                Wrap the measuring tape comfortably around the fullest part of your chest under your arms. Keep tape level across shoulder blades.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F6F2EC] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#151515] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-sm text-[#151515]">Natural Waist</h4>
              <p>
                Measure around your natural waistline, typically about 2 inches above the navel. Do not pull the measuring tape too tight.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F6F2EC] space-y-2">
              <span className="w-6 h-6 rounded-full bg-[#151515] text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-sm text-[#151515]">Fullest Hips</h4>
              <p>
                Stand with feet together and measure around the widest point of your hips and seat to ensure trousers drape comfortably.
              </p>
            </div>
          </div>
        </div>

        {/* Family Size Book Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E6E1DA] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#151515] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8F1A1E]" />
              Save Measurements in Your Family Size Book
            </h3>
            <p className="text-xs text-[#6B6B6B]">
              Never ask for measurements again. Store profiles for your mother, sisters, and spouse in your private account.
            </p>
          </div>

          <Button variant="primary" size="sm">
            <Link href="/account/family" className="flex items-center gap-1.5 font-bold">
              Open Family Size Book
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
