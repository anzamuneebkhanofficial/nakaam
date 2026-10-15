'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/authClient';
import { useWishlist } from '@/lib/useWishlist';
import { toast } from 'sonner';
import { formatPKR } from '@/lib/format';
import { getImageUrl, getProductImageUrl } from '@/lib/image';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

export function ProductCard({ product, onWishlistToggle, isWishlisted: wishlistedProp, priority = false }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const wishlist = useWishlist(product?._id);
  const isWishlisted = wishlistedProp ?? wishlist.isWishlisted;
  const [swiperInstance, setSwiperInstance] = useState(null);

  if (!product) return null;

  const {
    slug,
    name,
    category,
    audience,
    images = [],
    pricing,
    price,
    compareAtPrice,
    fabric,
    subtitle,
  } = product;

  const finalPrice = pricing?.finalPrice ?? price ?? 0;
  const originalPrice = pricing?.compareAtPrice ?? compareAtPrice;
  const discountPercent = pricing?.discountPercent ?? 0;
  const isSale = discountPercent > 0;

  // Filter valid image URLs
  const validImages = Array.isArray(images)
    ? images
        .map((img) => getImageUrl(img))
        .filter(Boolean)
    : [];

  const defaultImageUrl = validImages[0] || getProductImageUrl(product, 0);

  // Standardized e-commerce 3:4 portrait aspect ratio (exact Khaadi / Maria.B standard)
  const aspectClass = 'aspect-[3/4]';
  const objectFitClass = 'object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105';
  const hasMultipleImages = validImages.length > 1;

  const categoryLabel = category?.name || audience || 'Atelier';
  const subLabel = fabric || subtitle || '';

  return (
    <article className="group relative flex flex-col h-full bg-white rounded-xl border border-[#EAE5DD]/90 hover:border-[#141413] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(20,20,19,0.08)] overflow-hidden">
      {/* Media Showcase (Strict 3:4 Portrait Ratio) */}
      <div className={`relative w-full ${aspectClass} bg-[#F5F1EB] overflow-hidden`}>
        {hasMultipleImages ? (
          <div className="w-full h-full relative">
            <Swiper
              modules={[Navigation, Pagination]}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation={false}
              onSwiper={setSwiperInstance}
              className="w-full h-full product-card-swiper"
            >
              {validImages.map((url, idx) => (
                <SwiperSlide key={`${slug}-img-${idx}`} className="w-full h-full relative">
                  <Link href={`/p/${slug}`} className="block w-full h-full relative" aria-label={`View ${name}`}>
                    <Image
                      src={url}
                      alt={name || 'Nakaam Piece'}
                      fill
                      priority={priority && idx === 0}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className={objectFitClass}
                    />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Subtle Prev/Next Navigation Controls on Hover */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                swiperInstance?.slidePrev();
              }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/90 text-[#141413] items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex cursor-pointer hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                swiperInstance?.slideNext();
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/90 text-[#141413] items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex cursor-pointer hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link href={`/p/${slug}`} className="block w-full h-full relative" aria-label={`View ${name}`}>
            <Image
              src={defaultImageUrl}
              alt={name || 'Nakaam Piece'}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={objectFitClass}
            />
          </Link>
        )}

        {/* Minimalist Badges (Khaadi & Maria.B Style) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {isSale && (
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-[#B82A2E] text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && !isSale && (
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider bg-[#141413] text-white shadow-xs">
              New
            </span>
          )}
        </div>

        {/* Floating Minimalist Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isPending) return;
            if (!session) {
              toast.error('Please sign in to save pieces to your wishlist vault.');
              router.push(`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : `/p/${slug}`)}`);
              return;
            }
            if (onWishlistToggle) {
              onWishlistToggle(product._id);
              return;
            }
            void wishlist.toggleWishlist(product._id);
          }}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#141413] transition-all duration-200 hover:scale-110 hover:bg-white shadow-[0_2px_8px_rgba(20,20,19,0.08)] cursor-pointer"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          disabled={wishlist.isLoading || wishlist.isMutating}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? 'fill-[#B82A2E] text-[#B82A2E]' : 'text-[#141413] hover:text-[#B82A2E]'
            }`}
          />
        </button>
      </div>

      {/* Card Content - Clean, Highly Legible, Title + Thick Bold Price */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div className="space-y-1">
          {/* Eyebrow Label (Category | Fabric) */}
          <p className="text-[10.5px] uppercase tracking-wider text-[#78736B] truncate">
            {subLabel ? `${categoryLabel} | ${subLabel}` : categoryLabel}
          </p>

          {/* Product Title (2-Line Clamp) */}
          <h3 className="h-9 text-xs sm:text-[13px] font-medium leading-snug tracking-tight text-[#141413] group-hover:text-[#B82A2E] transition-colors line-clamp-2">
            <Link href={`/p/${slug}`}>
              {name}
            </Link>
          </h3>
        </div>

        {/* Thick, Highlighted Bold Price Block */}
        <div className="mt-2.5 pt-2 border-t border-[#EAE5DD]/70 flex items-baseline gap-2">
          <span className="text-sm sm:text-base font-bold price-tabular text-[#141413]">
            {formatPKR(finalPrice)}
          </span>
          {originalPrice && originalPrice > finalPrice && (
            <span className="text-xs line-through text-[#8E8B85] price-tabular">
              {formatPKR(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

