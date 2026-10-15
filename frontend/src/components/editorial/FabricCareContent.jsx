'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  Droplets,
  Wind,
  Sun,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Layers,
  Flame,
  CheckCircle2,
  RefreshCw,
  Scissors,
} from 'lucide-react';

const FABRICS = [
  {
    id: 'lawn',
    name: 'Fine Handloom Lawn & Cotton',
    badge: 'Pre-Shrunk 100% Cotton',
    icon: Wind,
    description: 'High-thread-count, lightweight cotton woven for breathable subcontinent summers. Naturally treated and pre-shrunk before stitching.',
    shrinkage: 'Minimal (under 1.5% after first cold soak)',
    wash: 'Gentle hand wash or machine delicate cycle in cold water (<30°C). Use mild liquid detergent without optical brighteners.',
    dry: 'Line dry in open shade away from direct midday sunlight to preserve natural botanical and reactive dyes.',
    iron: 'Medium to high steam press while fabric is slightly damp. Press printed surfaces on the reverse side.',
    warnings: 'Do not use chlorine bleach. Do not wring or twist forcefully; press gently between dry towels.',
    bestFor: 'Everyday wear, summer pret, daily kurtas',
  },
  {
    id: 'silk',
    name: 'Raw Silk & Pure Chiffon',
    badge: 'Delicate Natural Fibres',
    icon: Sparkles,
    description: 'Luxurious Mulberry silk and airy organza/chiffon featuring hand-zari work, resham threadwork, and delicate block prints.',
    shrinkage: 'Zero shrinkage (dry cleaned only)',
    wash: 'Strictly professional dry cleaning recommended. For spot-cleaning plain raw silk, dab gently with cold water without rubbing.',
    dry: 'Never tumble dry. Air dry flat on a padded towel in a ventilated room away from sunlight and heaters.',
    iron: 'Very low heat silk setting with a clean press cloth. Never steam directly onto metallic tilla or dabka wirework.',
    warnings: 'Avoid direct contact with alcohol-based perfumes, deodorants, or hairsprays which can discolour silk threads.',
    bestFor: 'Formal eveningwear, festive bridals, occasion dupattas',
  },
  {
    id: 'khaddar',
    name: 'Handspun Khaddar & Karandi',
    badge: 'Winter Weaves',
    icon: Layers,
    description: 'Heavier-weight artisanal winter textiles woven with rich texture and superior thermal insulation for North Pakistan winters.',
    shrinkage: 'Approx. 2% on first immersion if hot water is used; negligible with cold water soak.',
    wash: 'Cold hand wash or gentle wool cycle. Separate dark indigos and deep rusts during the first three washes.',
    dry: 'Lay flat to dry horizontally. Heavy wet khaddar hung vertically on thin wires will stretch and lose structured silhouette.',
    iron: 'Hot steam iron on reverse side. Iron while damp for a crisp, tailored finish.',
    warnings: 'Never soak garments with metal button embellishments for more than 15 minutes.',
    bestFor: 'Winter kurtas, waistcoats, shawls, and structured co-ord sets',
  },
  {
    id: 'velvet',
    name: 'Micro-Velvet & Embroidered Jacquard',
    badge: 'Heritage Occasion Weave',
    icon: Flame,
    description: 'Plush, dense pile velvet and intricate jacquard woven fabrics accented with gold cut-dana and antique marori embroidery.',
    shrinkage: '0% — structural pile fabric',
    wash: 'Professional dry clean only at an experienced couture dry cleaner. Never submerge in water.',
    dry: 'Professional dry clean only. If wet from rain, blot gently with a dry lint-free cloth and hang on a broad padded hanger.',
    iron: 'NEVER iron directly on the velvet face. Steam gently from the reverse side or hang in a steamy bathroom to release wrinkles.',
    warnings: 'Never fold heavy velvet garments tightly for extended periods; store rolled or on broad shoulder hangers.',
    bestFor: 'Winter wedding formals, statement jackets, embroidered shawls',
  },
];

const STAIN_PROTOCOLS = [
  {
    stain: 'Haldi / Turmeric / Saalan (Curry)',
    action: 'Act immediately! Blot (never rub) with a paper towel. Rinse cold from behind the fabric. Apply a paste of baking soda and gentle dish soap, let sit for 15 mins, rinse cold, and place in morning sunlight for 1 hour to let UV naturally break down curcumin.',
  },
  {
    stain: 'Chai / Tea / Coffee',
    action: 'Dab with cold water mixed with a few drops of white vinegar. Blot from outside the ring toward the center. Rinse thoroughly with cold water before regular gentle wash.',
  },
  {
    stain: 'Attar / Perfume Oils',
    action: 'Sprinkle cornstarch or talcum powder directly over the oil spot to absorb excess oil for 30 minutes. Brush off gently, then dab with lukewarm water and a drop of clear dishwashing liquid.',
  },
  {
    stain: 'Mud & Dust from Monsoons',
    action: 'Let the mud dry completely first! Brushing wet mud pushes it deeper into fine cotton fibers. Once bone-dry, gently brush off loose dirt with a soft brush, then wash with cold water.',
  },
];

export function FabricCareContent() {
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[0].id);
  const activeFabric = FABRICS.find((f) => f.id === selectedFabric) || FABRICS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* Breadcrumb Path */}
        <nav className="text-xs text-[#6B6B6B] flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#151515]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="text-[#151515] font-semibold">Fabric Care & Shrinkage Protocols</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6E1DA] text-[#151515] inline-flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-[#D12C2F]" />
            Fabric Maintenance Guide
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#151515]">
            Fabric Care & Longevity
          </h1>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Nakaam garments are crafted with pure natural fibers and hand-finished details. Follow our washing and pressing guidelines to ensure your pieces retain their structure for seasons.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F6F2EC] flex items-center justify-center text-[#151515]">
              <Droplets className="w-5 h-5 text-[#D12C2F]" />
            </div>
            <h3 className="font-semibold text-base text-[#151515]">Always Cold Water</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Warm or hot water breaks down natural vegetable dyes and damages raw unbleached cotton weaves. Stick strictly to cold wash temperatures (&le; 30°C).
            </p>
          </div>

          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F6F2EC] flex items-center justify-center text-[#151515]">
              <Sun className="w-5 h-5 text-[#D12C2F]" />
            </div>
            <h3 className="font-semibold text-base text-[#151515]">Dry in Diffused Shade</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Direct midday sun bleaches deep jewel tones (indigo, emerald, crimson). Always dry your clothes turned inside-out under covered balconies or shade.
            </p>
          </div>

          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F6F2EC] flex items-center justify-center text-[#151515]">
              <Scissors className="w-5 h-5 text-[#D12C2F]" />
            </div>
            <h3 className="font-semibold text-base text-[#151515]">Embroidery Protection</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Never iron directly over zari, tilla, or sequins. Always press garments inside-out or use a clean cotton pressing cloth to prevent scorching.
            </p>
          </div>
        </div>

        {/* Interactive Fabric Selector */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#151515]">Fabric-Specific Protocols</h2>
              <p className="text-xs text-[#6B6B6B]">Select a textile weave to view tailored laundering and pressing instructions</p>
            </div>
          </div>

          {/* Fabric Tab Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FABRICS.map((fabric) => {
              const Icon = fabric.icon;
              const isSelected = selectedFabric === fabric.id;
              return (
                <button
                  key={fabric.id}
                  type="button"
                  onClick={() => setSelectedFabric(fabric.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-[#151515] text-white border-[#151515] shadow-md'
                      : 'bg-white text-[#6B6B6B] border-[#E6E1DA] hover:border-[#151515] hover:text-[#151515]'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-[#D12C2F]' : 'text-[#6B6B6B]'}`} />
                  <span className="text-xs font-semibold">{fabric.name.split('&')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Fabric Card */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E6E1DA]">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FCEEEE] text-[#8F1A1E]">
                  {activeFabric.badge}
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#151515] mt-1.5">
                  {activeFabric.name}
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-1">{activeFabric.description}</p>
              </div>
              <div className="text-right sm:self-start">
                <span className="text-xs font-semibold text-[#6B6B6B] block">Best Suited For</span>
                <span className="text-xs font-bold text-[#151515]">{activeFabric.bestFor}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-[#D12C2F]" />
                    Washing & Immersion
                  </span>
                  <p className="text-sm text-[#151515] leading-relaxed bg-[#F6F2EC] p-3 rounded-xl border border-[#E6E1DA]">
                    {activeFabric.wash}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-[#D12C2F]" />
                    Drying Instructions
                  </span>
                  <p className="text-sm text-[#151515] leading-relaxed bg-[#F6F2EC] p-3 rounded-xl border border-[#E6E1DA]">
                    {activeFabric.dry}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D12C2F]" />
                    Ironing & Pressing
                  </span>
                  <p className="text-sm text-[#151515] leading-relaxed bg-[#F6F2EC] p-3 rounded-xl border border-[#E6E1DA]">
                    {activeFabric.iron}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8F1A1E] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#D12C2F]" />
                    Shrinkage & Precautions
                  </span>
                  <div className="bg-[#FCEEEE] p-3 rounded-xl border border-[#F6D0D0] text-xs text-[#8F1A1E] space-y-1">
                    <p className="font-semibold">Shrinkage Index: {activeFabric.shrinkage}</p>
                    <p>{activeFabric.warnings}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Stain Rescue Guide */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif text-[#151515] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D12C2F]" />
              Emergency Stain Rescue Guide
            </h2>
            <p className="text-xs text-[#6B6B6B]">
              Quick-response steps for common Pakistani food, festive attar, and seasonal stains.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STAIN_PROTOCOLS.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] space-y-2">
                <span className="text-xs font-bold text-[#D12C2F] block">{item.stain}</span>
                <p className="text-xs text-[#151515] leading-relaxed">{item.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Garment Storage & Longevity Advice */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold font-serif text-[#151515]">Seasonal Wardrobe Storage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#6B6B6B]">
            <div className="p-4 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] space-y-1.5">
              <span className="font-bold text-[#151515] block">Use Muslin Cloth Bags</span>
              <p>Store pure silks and embroidered kurtas inside breathable cotton muslin bags. Plastic covers trap moisture and yellow delicate threads over time.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] space-y-1.5">
              <span className="font-bold text-[#151515] block">Natural Cedar Repellents</span>
              <p>Use natural cedar wood rings or dried neem leaves instead of synthetic naphthalene balls to keep silverfish and moths away without pungent odours.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] space-y-1.5">
              <span className="font-bold text-[#151515] block">Padded Hangers Only</span>
              <p>Heavy jacquard and embellished pieces should be rested on wide, padded wooden hangers to avoid distorting shoulder pads and sleeve seams.</p>
            </div>
          </div>
        </div>

        {/* Support Help CTA */}
        <div className="bg-[#151515] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-xl font-bold">Unsure about a specific bespoke piece?</h3>
            <p className="text-xs text-white/70">
              Our tailoring team in Lahore can advise on delicate dry cleaning, pressing, and alterations.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact">
              <Button variant="outline" className="text-xs font-semibold bg-white text-[#151515] hover:bg-[#F6F2EC]">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
