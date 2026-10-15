'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getProductImageUrl } from '@/lib/image';

const FALLBACK_EDITORIAL_IMAGES = [
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
];

export function CuratedStoryEdit({ products = [] }) {
  // Deduplicate products by _id and slug
  const seenIds = new Set();
  const uniqueProducts = (Array.isArray(products) ? products : []).filter((p) => {
    const id = String(p?._id || p?.slug || '');
    if (!id || seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  const productOne = uniqueProducts[0] || null;
  const productTwo = uniqueProducts[1] || null;

  const imgOne = productOne ? getProductImageUrl(productOne, 0) : FALLBACK_EDITORIAL_IMAGES[0];
  const imgTwo = productTwo ? getProductImageUrl(productTwo, 0) : FALLBACK_EDITORIAL_IMAGES[1];

  return (
    <section className="py-20 sm:py-28 bg-[#141413] text-white overflow-hidden border-y border-[#262422]" aria-label="Seasonal Curated Edit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: High-Fashion Narrative (Maria.B "Stitched For You" Aesthetic) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-[0.2em] uppercase text-[#D5CEBF] backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#B82A2E]" />
              <span>Signature Atelier 2026</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium leading-[1.08] text-white tracking-tight">
              Stitched For You. <br />
              <span className="font-light italic text-[#D5CEBF]">Or Ready to Drape.</span>
            </h2>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              From hand-embellished raw silk formal suits to breathable high-count summer lawn, every ensemble is photographed under calibrated daylight and measured to the centimetre.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B82A2E] mt-2 shrink-0" />
                <p className="text-xs sm:text-sm text-white/90">
                  <strong className="font-semibold text-white">Open-Box Doorstep Inspection:</strong> Inspect fabric weave and stitching before cash settlement.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B82A2E] mt-2 shrink-0" />
                <p className="text-xs sm:text-sm text-white/90">
                  <strong className="font-semibold text-white">Zero Deceptive Filters:</strong> Calibrated under 5500K neutral daylight so colours arrive exactly as seen.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B82A2E] mt-2 shrink-0" />
                <p className="text-xs sm:text-sm text-white/90">
                  <strong className="font-semibold text-white">Lahore Master Artisans:</strong> Finished with pure organza borders, handcrafted laces, and fine pipings.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/shop?category=unstitched"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-[#111111] hover:bg-[#FAF8F5] text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:shadow-[0_8px_25px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] group"
              >
                <span>Explore The Collection</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/shop?audience=women"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold uppercase tracking-widest backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Luxury Pret</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Staggered High-Fashion Editorial Imagery */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
              {/* Card 1 */}
              <Link
                href={productOne?.slug ? `/p/${productOne.slug}` : '/shop'}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 bg-neutral-900 shadow-2xl block hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-500"
              >
                <Image
                  src={imgOne}
                  alt={productOne?.name || 'Nakaam Curated Atelier'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/90 text-[#141413] backdrop-blur-md">
                    Signature Drop
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-white z-10">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#D5CEBF] block mb-1">
                    {productOne?.category?.name || productOne?.audience || 'Festive Edit'}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-semibold !text-white group-hover:!text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-1">
                    {productOne?.name || 'Hand-Embellished Silk Ensembles'}
                  </h3>
                  <p className="text-xs !text-white/90 mt-1 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>View Artisan Details</span>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </p>
                </div>
              </Link>

              {/* Card 2 (Staggered offset like high-fashion editorial lookbook) */}
              <Link
                href={productTwo?.slug ? `/p/${productTwo.slug}` : '/shop'}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 bg-neutral-900 shadow-2xl block sm:translate-y-8 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-500"
              >
                <Image
                  src={imgTwo}
                  alt={productTwo?.name || 'Nakaam Curated Atelier'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/90 text-[#141413] backdrop-blur-md">
                    Heirloom Lawn
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-white z-10">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#D5CEBF] block mb-1">
                    {productTwo?.category?.name || productTwo?.audience || 'Unstitched Luxury'}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-semibold !text-white group-hover:!text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-1">
                    {productTwo?.name || 'Pure Jacquard & Embroidered Chiffon'}
                  </h3>
                  <p className="text-xs !text-white/90 mt-1 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>View Artisan Details</span>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

