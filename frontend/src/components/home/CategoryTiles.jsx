'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import { CategoryTilesSkeleton } from '@/components/shared/CategoryTilesSkeleton';

// Curated high-fashion imagery for luxury Pakistani departments when category has no custom uploaded thumbnail
const DEPARTMENT_DEFAULTS = {
  women: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
  men: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
  unstitched: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
  pret: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
  formals: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=1200&q=80',
  footwear: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
  home: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
};

function getDepartmentImage(cat) {
  if (cat.image && typeof cat.image === 'string' && cat.image.trim()) {
    return cat.image;
  }
  const key = (cat.slug || cat.name || cat.audience || '').toLowerCase();
  for (const [k, url] of Object.entries(DEPARTMENT_DEFAULTS)) {
    if (key.includes(k)) return url;
  }
  return DEPARTMENT_DEFAULTS.default;
}

export function CategoryTiles({ categories = [], isLoading = false }) {
  const activeCategories = Array.isArray(categories)
    ? categories.filter((c) => c.isActive !== false)
    : [];

  // Fallback preset if database has 0 categories yet
  const displayTiles = activeCategories.length > 0 ? activeCategories : [
    { name: 'Luxury Pret', slug: 'luxury-pret', audience: 'women', description: 'Ready-to-wear tailored silhouettes' },
    { name: 'Unstitched Festive', slug: 'unstitched', audience: 'women', description: 'Pure silk, organza, and embroidered lawn' },
    { name: 'Menswear & Kurtas', slug: 'menswear', audience: 'men', description: 'Tailored cotton, linen, and waistcoats' },
    { name: 'Artisan Footwear', slug: 'footwear', audience: 'footwear', description: 'Handcrafted Lahore khussa & leather' },
    { name: 'Home & Bedding', slug: 'home-textiles', audience: 'home', description: 'High-thread-count cotton & decor' },
  ];

  // Divide into Primary 2 Showcase Cards (Maria.B style) and Secondary Tier Cards
  const primaryTiles = displayTiles.slice(0, 2);
  const secondaryTiles = displayTiles.slice(2, 5);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-label="Curated Categories">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4 border-b border-[#EAE5DD] pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B82A2E]">
            Curated Departments
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-[#141413] mt-1.5 tracking-tight">
            Explore Collections
          </h2>
        </div>
        <Link
          href="/categories"
          className="text-xs font-semibold uppercase tracking-widest text-[#141413] hover:text-[#B82A2E] inline-flex items-center gap-2 transition-colors group"
        >
          <span>View All Departments</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {isLoading && activeCategories.length === 0 ? (
        <CategoryTilesSkeleton />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Top Tier: 2 Large Prominent Statement Cards (Maria.B Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {primaryTiles.map((cat, idx) => {
              const catHref = cat.slug ? `/shop?category=${cat.slug}` : `/shop?audience=${cat.audience || 'all'}`;
              const imgUrl = getDepartmentImage(cat);

              return (
                <Link
                  key={cat._id || cat.slug || idx}
                  href={catHref}
                  className="group relative h-[360px] sm:h-[440px] rounded-2xl overflow-hidden border border-[#EAE5DD] bg-[#141413] shadow-[0_4px_20px_rgba(20,20,19,0.05)] transition-all duration-500 hover:shadow-[0_12px_36px_rgba(20,20,19,0.12)] block"
                >
                  <Image
                    src={imgUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />

                  {/* Gradient Vignette for Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity" />

                  {/* Department Information Badge */}
                  <div className="absolute top-5 left-5 z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/90 text-[#141413] backdrop-blur-md shadow-xs">
                      {cat.audience ? `${cat.audience} Collection` : 'Atelier Edit'}
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-medium uppercase tracking-wider drop-shadow-sm">
                      {cat.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 font-normal mt-1 line-clamp-1 max-w-md">
                      {cat.description || 'Authentic fabrics, true-to-size specs, and doorstep review.'}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <span>Shop Department</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Lower Tier: 3 Curated Column Cards */}
          {secondaryTiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {secondaryTiles.map((cat, idx) => {
                const catHref = cat.slug ? `/shop?category=${cat.slug}` : `/shop?audience=${cat.audience || 'all'}`;
                const imgUrl = getDepartmentImage(cat);

                return (
                  <Link
                    key={cat._id || cat.slug || idx}
                    href={catHref}
                    className="group relative h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border border-[#EAE5DD] bg-[#141413] shadow-[0_4px_16px_rgba(20,20,19,0.04)] transition-all duration-500 hover:shadow-[0_12px_28px_rgba(20,20,19,0.1)] block"
                  >
                    <Image
                      src={imgUrl}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    {/* Text Container */}
                    <div className="absolute bottom-5 left-5 right-5 text-white z-10">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70 block mb-1">
                        {cat.audience || 'Department'}
                      </span>
                      <h4 className="text-lg sm:text-xl font-serif font-medium uppercase tracking-wider">
                        {cat.name}
                      </h4>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/90 group-hover:translate-x-1 transition-transform">
                        <span>Explore</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

