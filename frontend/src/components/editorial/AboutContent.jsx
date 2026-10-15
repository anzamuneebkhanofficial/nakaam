'use client';

import React from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  ChevronRight,
  Scissors,
  Sparkles,
  MapPin,
  Heart,
  Users,
  Feather,
  Compass,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

const MANIFESTO_PILLARS = [
  {
    icon: Feather,
    title: 'Pure Natural Fibres',
    desc: 'We reject synthetic polyester blends that suffocate in subcontinent summers. Every Nakaam piece begins with 100% unbleached, long-staple cotton lawn, pure Mulberry silk, or handspun khaddar.',
  },
  {
    icon: Scissors,
    title: 'The Master Darzi Guild',
    desc: 'Each garment is cut and tailored by career craftsmen in our Lahore workshop. We honor generous seam allowances, reinforced double-needle hems, and hand-finished button loops.',
  },
  {
    icon: Layers,
    title: 'Centimeter Precision',
    desc: 'Vanity sizing and erratic shrinkage have plagued Pakistani fashion for decades. We pre-shrink our natural textiles before cutting and publish real physical centimeter measurements.',
  },
  {
    icon: Heart,
    title: 'Dignified Artisan Wages',
    desc: 'Our embroidery artisans across Bahawalpur, Multan, and Kasur earn direct living wages well above regional minimums, with healthcare assistance and fair working hours.',
  },
];

const TIMELINE = [
  {
    year: '2021',
    title: 'The Quiet Rebellion in Lahore',
    desc: 'Started in a small studio in Gulberg III with three wooden handlooms and a singular frustration: Why was mass-produced lawn becoming disposable plastic?',
  },
  {
    year: '2023',
    title: 'The Measurement Standard',
    desc: 'Introduced the first pre-shrunk lawn testing protocol and standardized centimeter sizing for South Asian silhouettes, eliminating online fit guesswork.',
  },
  {
    year: '2024',
    title: 'Kasur Khussa Restoration',
    desc: 'Partnered with generational shoemakers in Kasur to preserve vegetal-tanned camel and buffalo leather khussas with hand-tilla embroidery and comfort arches.',
  },
  {
    year: 'Present',
    title: 'Paper & Ink Editorial Commerce',
    desc: 'Expanding our direct-to-doorstep experience across all four provinces, upholding trust-first open-box inspection and honest integer pricing.',
  },
];

export function AboutContent() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* Breadcrumb Path */}
        <nav className="text-xs text-[#6B6B6B] flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#151515]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
          <span className="text-[#151515] font-semibold">About Our Brand & Heritage</span>
        </nav>

        {/* Hero Editorial Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#E6E1DA] text-[#151515] inline-flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#D12C2F]" />
            Lahore Craft & Textile Heritage
          </span>
          <h1 className="font-serif text-3xl sm:text-6xl font-bold tracking-tight text-[#151515] leading-tight">
            An Ode to Honest Tailoring & Unhurried Textiles
          </h1>
          <p className="text-base text-[#6B6B6B] leading-relaxed max-w-2xl mx-auto font-sans">
            Nakaam was born from a quiet resistance against synthetic disposable fashion. We make timeless lawn pret, heritage winter khaddar, and artisanal khussas rooted in centuries of Punjabi weaving traditions.
          </p>
        </div>

        {/* Editorial Quote Card */}
        <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="w-2 h-2 rounded-full bg-[#D12C2F] mx-auto mb-2" />
          <blockquote className="font-serif italic text-xl sm:text-3xl text-[#151515] max-w-2xl mx-auto leading-relaxed">
            &ldquo;In an era where fast fashion creates clothes designed to fade in three washes, we choose the slow precision of unbleached threads and master darzi stitchcraft.&rdquo;
          </blockquote>
          <p className="text-xs uppercase tracking-widest text-[#6B6B6B] font-bold">
            — Nakaam, Lahore
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">Four Pillars of Craft</h2>
            <p className="text-xs text-[#6B6B6B]">
              Every fiber, seam, and buckle is governed by uncompromised principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MANIFESTO_PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E6E1DA] rounded-2xl p-6 sm:p-8 space-y-3 hover:border-[#151515] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F6F2EC] flex items-center justify-center text-[#151515]">
                    <Icon className="w-5 h-5 text-[#D12C2F]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#151515]">{p.title}</h3>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Name & Identity Section */}
        <div className="bg-[#151515] text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#D12C2F] uppercase tracking-wider">The Brand Philosophy</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">Why the name &quot;Nakaam&quot;?</h2>
            <p className="text-xs text-white/80 leading-relaxed">
              In classical Urdu poetry, <em className="text-white font-serif italic">Nakaam</em> (ناکام) denotes the yearning for perfection that remains perpetually unfulfilled. It is an acknowledgment that true handmade art is never mechanically sterile or uniform.
            </p>
            <p className="text-xs text-white/80 leading-relaxed">
              Each natural dye bath yields subtle variations. Handloom yarns breathe with organic character. We embrace this humanity over mass-machined uniformity.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-3">
            <div className="font-serif text-5xl font-bold text-white tracking-wider">
              ناکام
            </div>
            <p className="text-xs text-[#E6E1DA] uppercase tracking-widest font-mono">
              The Red Dot Mark &bull; Paper & Ink
            </p>
            <p className="text-xs text-white/60 pt-2 border-t border-white/10">
              Hand-pressed seal of authenticity on all original packaging.
            </p>
          </div>
        </div>

        {/* Atelier Journey Timeline */}
        <div className="space-y-8">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">Our Journey</h2>
            <p className="text-xs text-[#6B6B6B]">From a small textile studio to a nationwide apparel house.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-2">
                <span className="text-xs font-bold font-mono text-[#D12C2F] block">{item.year}</span>
                <h3 className="font-serif text-base font-bold text-[#151515]">{item.title}</h3>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visit Atelier CTA */}
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-xl font-bold text-[#151515]">Visit Our Lahore Studio</h3>
            <p className="text-xs text-[#6B6B6B]">
              Experience our unstitched rolls, feel the weave textures, and meet our master cutting masters in Gulberg III.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact">
              <Button className="bg-[#151515] text-white hover:bg-black text-xs font-semibold px-5">
                Studio Address & Hours
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
