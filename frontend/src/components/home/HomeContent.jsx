'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { apiClient } from '@/lib/apiClient';

// Newly structured editorial components
import { HeroBanner } from './HeroBanner';
import { CategoryTiles } from './CategoryTiles';
import { ProductCarouselSection } from './ProductCarouselSection';
import { CuratedStoryEdit } from './CuratedStoryEdit';
import { SocialProofSection } from './SocialProofSection';
import { TrustValueBar } from './TrustValueBar';

export function HomeContent() {
  // Query 1: Featured Products explicitly selected by administrator (isFeatured=true, max 8)
  const { data: featuredData = [], isLoading: featuredLoading } = useQuery({
    queryKey: ['products', 'featured-home'],
    queryFn: async () => {
      try {
        const res = await apiClient('/products?isFeatured=true&limit=8');
        return Array.isArray(res) ? res : res?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Query 2: Latest Products automatically based on creation date (newest first, limit 8)
  const { data: latestProductsData = [], isLoading: latestLoading } = useQuery({
    queryKey: ['products', 'latest-home'],
    queryFn: async () => {
      try {
        const res = await apiClient('/products?sort=newest&limit=8');
        return Array.isArray(res) ? res : res?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Query 3: Categories for visual department cards
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await apiClient('/categories');
        return Array.isArray(res) ? res : res?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  const featuredProducts = Array.isArray(featuredData) ? featuredData : [];
  const latestProducts = Array.isArray(latestProductsData) ? latestProductsData : [];

  // Compose a dedicated hero pool of up to 5 distinct products with valid photos
  const heroProducts = (() => {
    const seen = new Set();
    const pool = [];
    for (const p of [...featuredProducts, ...latestProducts]) {
      const id = String(p?._id || p?.slug || '');
      if (id && !seen.has(id)) {
        seen.add(id);
        pool.push(p);
      }
      if (pool.length >= 5) break;
    }
    return pool;
  })();

  // Select next 2 distinct eligible products for CuratedStoryEdit that do not duplicate the top hero piece
  const heroPrimaryId = String(heroProducts[0]?._id || heroProducts[0]?._slug || '');
  const storyProducts = latestProducts.filter(
    (p) => String(p?._id || p?.slug || '') !== heroPrimaryId
  ).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      {/* 1. Global Announcement */}
      <AnnouncementBar />

      {/* 2. Sticky Header */}
      <Header />

      <main className="flex-1">
        {/* 3. Hero Section - Full bleed cinematic campaign slider */}
        <HeroBanner
          products={heroProducts}
          isLoading={featuredLoading && latestLoading}
        />

        {/* 4. Curated Department Tiles (Maria.B Style 2-tier Grid) */}
        <CategoryTiles categories={categories} isLoading={categoriesLoading} />

        {/* 5. "Top Picks for You" Section (Khaadi Signature Centered Carousel) */}
        <div className="border-t border-[#EAE5DD] bg-white">
          <ProductCarouselSection
            tag="Trending Now"
            title="Top Picks for You"
            description="We've handpicked the styles we know you'll love. Explore what's trending across luxury pret and unstitched lawn."
            viewAllHref="/shop?sort=newest"
            products={latestProducts}
            isLoading={latestLoading}
            emptyMessage="No latest products posted yet."
          />
        </div>

        {/* 6. Curated Story / "Stitched For You" Editorial Break */}
        <CuratedStoryEdit products={storyProducts.length >= 2 ? storyProducts : latestProducts.slice(0, 2)} />

        {/* 7. "Bestsellers" Section (Khaadi Signature Centered Carousel) */}
        <div className="border-b border-[#EAE5DD] bg-white">
          <ProductCarouselSection
            tag="Patron Favorites"
            title="Bestsellers"
            description="Discover this season's favorites and refresh your wardrobe with looks you'll wear on repeat."
            viewAllHref="/shop?isFeatured=true"
            products={featuredProducts.length > 0 ? featuredProducts : latestProducts}
            isLoading={featuredLoading}
            emptyMessage="No featured products currently highlighted."
          />
        </div>

        {/* 8. Social Proof & Customer Reviews ("Worn & Loved") */}
        <SocialProofSection products={featuredProducts.length > 0 ? featuredProducts : latestProducts} />

        {/* 9. Minimalist Reassurance / Trust Bar (Khaadi Style) */}
        <TrustValueBar />
      </main>

      {/* 10. Global Footer */}
      <Footer />
    </div>
  );
}
