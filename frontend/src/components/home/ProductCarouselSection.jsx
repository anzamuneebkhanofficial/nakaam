'use client';

import React, { useRef, useState, useId } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCarouselSkeleton } from '@/components/shared/ProductCarouselSkeleton';

export function ProductCarouselSection({
  tag,
  title,
  description,
  viewAllHref,
  products = [],
  isLoading = false,
  emptyMessage = 'No products currently available in this collection.',
  autoplay = false,
  bannerImage,
  bannerAlt,
}) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const uniqueId = useId().replace(/:/g, '');
  const prevBtnClass = `carousel-prev-${uniqueId}`;
  const nextBtnClass = `carousel-next-${uniqueId}`;
  const paginationClass = `carousel-pagination-${uniqueId}`;

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-label={title}>
      {/* Centered Editorial Section Header (Signature Khaadi & Maria.B Style) */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        {tag && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B82A2E] block mb-1.5">
            {tag}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-[#141413] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-[#78736B] mt-2 font-normal leading-relaxed max-w-xl mx-auto">
            {description}
          </p>
        )}
      </div>

      {/* Swiper Product Carousel */}
      {isLoading ? (
        <ProductCarouselSkeleton count={5} />
      ) : products.length > 0 ? (
        <div className="relative group/carousel">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              prevEl: `.${prevBtnClass}`,
              nextEl: `.${nextBtnClass}`,
            }}
            pagination={{
              clickable: true,
              el: `.${paginationClass}`,
              bulletClass: 'product-carousel-bullet',
              bulletActiveClass: 'product-carousel-bullet-active',
            }}
            onSwiper={setSwiperInstance}
            autoplay={
              autoplay
                ? {
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            spaceBetween={14}
            slidesPerView={1.25}
            breakpoints={{
              480: {
                slidesPerView: 2.1,
                spaceBetween: 14,
              },
              768: {
                slidesPerView: 3.2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 4.2,
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 5.2,
                spaceBetween: 20,
              },
            }}
            className="pb-4 !overflow-visible sm:!overflow-hidden"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product._id || product.slug || index} className="h-auto">
                <ProductCard product={product} priority={index < 2} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Minimalist Floating Side Navigation Arrows */}
          <button
            type="button"
            className={`${prevBtnClass} absolute -left-3 sm:-left-5 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-[#141413] border border-[#EAE5DD] shadow-[0_4px_16px_rgba(20,20,19,0.1)] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-105 hover:bg-[#FAF8F5] cursor-pointer disabled:opacity-0 disabled:pointer-events-none`}
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`${nextBtnClass} absolute -right-3 sm:-right-5 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-[#141413] border border-[#EAE5DD] shadow-[0_4px_16px_rgba(20,20,19,0.1)] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-105 hover:bg-[#FAF8F5] cursor-pointer disabled:opacity-0 disabled:pointer-events-none`}
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Centered Bullet Pagination Dots (Signature Khaadi Carousel Dots) */}
          <div className="mt-8 flex flex-col items-center justify-center gap-5">
            <div className={`${paginationClass} flex items-center justify-center`} />

            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="text-xs font-semibold uppercase tracking-widest text-[#141413] hover:text-[#B82A2E] inline-flex items-center gap-2 transition-colors border-b border-[#141413] hover:border-[#B82A2E] pb-0.5 group"
              >
                <span>View Full Collection</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center rounded-2xl bg-white border border-dashed border-[#EAE5DD] p-8 max-w-xl mx-auto">
          <p className="text-sm font-semibold text-[#141413]">{emptyMessage}</p>
          <p className="text-xs text-[#78736B] mt-1">
            Check back soon as new seasonal releases are added daily.
          </p>
        </div>
      )}
    </section>
  );
}

