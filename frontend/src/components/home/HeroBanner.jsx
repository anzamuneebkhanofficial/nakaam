'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getProductImageUrl } from '@/lib/image';
import { formatPKR } from '@/lib/format';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';

// Curated high-fashion editorial fallbacks for luxury ambiance when products are loading or building inventory
const EDITORIAL_FALLBACKS = [
  {
    title: 'Gilded Heritage & Festive Pret',
    subtitle: 'Signature hand-embellished raw silk, pure chiffon dupattas, and intricate tilla embroidery.',
    tag: 'Festive Luxury 2026',
    category: 'Luxury Pret',
    price: 18500,
    ctaText: 'Explore Collection',
    href: '/shop?audience=women',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85',
  },
  {
    title: 'Unstitched Festive Lawn Edit',
    subtitle: 'Calibrated natural daylight tones, breathable high-twist weaves, and verified garment specs.',
    tag: 'Spring/Summer Lawn',
    category: 'Unstitched',
    price: 9800,
    ctaText: 'Shop The Edit',
    href: '/shop?category=unstitched',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85',
  },
  {
    title: 'Artisan Khussa & Handcrafted Accessories',
    subtitle: 'Pure vegetable-tanned leather soles with heirloom zardozi embroidery crafted by Lahore artisans.',
    tag: 'Artisan Footwear',
    category: 'Footwear',
    price: 4950,
    ctaText: 'Discover Footwear',
    href: '/shop?category=footwear',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=2000&q=85',
  },
];

export function HeroBanner({ products = [], featuredProduct, isLoading = false }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Pool dynamic products with valid images
  const productList = (Array.isArray(products) && products.length > 0)
    ? products
    : (featuredProduct ? [featuredProduct] : []);

  const validProducts = productList.filter((p) => {
    const url = getProductImageUrl(p, 0, null);
    return Boolean(url);
  });

  // Use dynamic products if available; otherwise use curated editorial slides
  const slides = validProducts.length > 0
    ? validProducts.map((p) => ({
        id: p._id || p.slug,
        title: p.name,
        subtitle: p.subtitle || p.description?.slice(0, 110) || 'Handcrafted authentic silhouette tailored for real Pakistani measurements.',
        tag: p.isNewArrival ? 'New Season Arrival' : 'Studio Exclusive',
        category: p.category?.name || p.audience || 'Luxury Pret',
        price: p.pricing?.finalPrice ?? p.price,
        compareAt: p.pricing?.compareAtPrice ?? p.compareAtPrice,
        ctaText: 'Shop This Piece',
        href: p.slug ? `/p/${p.slug}` : '/shop',
        image: getProductImageUrl(p, 0, null),
        isDynamic: true,
      }))
    : EDITORIAL_FALLBACKS;

  return (
    <section className="relative w-full overflow-hidden bg-[#121110] text-white" aria-label="Hero Showcase">
      <div className="relative w-full h-[580px] sm:h-[640px] lg:h-[720px]">
        {isLoading && validProducts.length === 0 ? (
          /* High-End Editorial Shimmer Skeleton */
          <div className="w-full h-full relative overflow-hidden bg-[#1E1D1B]">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-white/40 tracking-[0.25em] uppercase">
                NAKAAM
              </span>
              <span className="text-xs font-semibold text-white/50 tracking-widest uppercase mt-3">
                Curating Atelier Showcase...
              </span>
            </div>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, EffectFade, Pagination, Navigation]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{
              delay: 7000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={slides.length > 1}
            pagination={{
              clickable: true,
              el: '.hero-custom-pagination',
              bulletClass: 'hero-pagination-bullet',
              bulletActiveClass: 'hero-pagination-bullet-active',
            }}
            navigation={{
              prevEl: '.hero-nav-prev',
              nextEl: '.hero-nav-next',
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="w-full h-full"
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={slide.id || idx} className="w-full h-full relative">
                {/* Background Photography with Depth Vignette */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={slide.image}
                    alt={slide.title || 'Nakaam Luxury Edit'}
                    fill
                    priority={idx === 0}
                    sizes="100vw"
                    className="object-cover object-center scale-100 transition-transform duration-[8000ms] ease-out motion-safe:scale-105"
                  />
                  {/* Subtle Double-Pass Gradient Overlay for Flawless Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20 sm:pb-24 lg:pb-28">
                  <div className="max-w-2xl space-y-4 sm:space-y-5">
                    {/* Editorial Tag & Reassurance Pill */}
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-[#B82A2E] animate-pulse" />
                      <span className="uppercase tracking-widest text-[11px] font-semibold">
                        {slide.tag}
                      </span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/80 text-[11px] hidden sm:inline">
                        Doorstep Review Before COD
                      </span>
                    </div>

                    {/* High-Fashion Display Headline */}
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium text-white leading-[1.08] tracking-tight drop-shadow-sm">
                      {slide.title}
                    </h1>

                    {/* Subtitle / Microcopy */}
                    <p className="text-sm sm:text-base text-white/80 max-w-xl font-normal leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>

                    {/* Pricing & Call To Action */}
                    <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6">
                      <Link
                        href={slide.href}
                        className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-[#111111] hover:bg-[#FAF8F5] text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:shadow-[0_8px_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] group"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>

                      <Link
                        href="/shop"
                        className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-semibold uppercase tracking-widest backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        View All Collections
                      </Link>

                      {slide.price && (
                        <div className="flex items-baseline gap-2 pl-2">
                          <span className="text-xs uppercase tracking-wider text-white/60 font-medium">From</span>
                          <span className="text-lg sm:text-xl font-semibold text-white price-tabular">
                            {formatPKR(slide.price)}
                          </span>
                          {slide.compareAt && slide.compareAt > slide.price && (
                            <span className="text-xs text-white/50 line-through price-tabular">
                              {formatPKR(slide.compareAt)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Custom Navigation Arrows (Side Minimalist Controls) */}
        <button
          type="button"
          className="hero-nav-prev absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-0"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          className="hero-nav-next absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-0"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Custom Slide Progress Indicator (Khaadi & Maria.B Style) */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-custom-pagination flex items-center gap-2" />

          {/* Slide counter */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono tracking-widest text-white/70 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <span>{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="text-white/30">/</span>
            <span>{String(slides.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

