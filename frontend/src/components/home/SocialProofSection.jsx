'use client';

import React from 'react';
import Image from 'next/image';
import { useQueries } from '@tanstack/react-query';
import { Star, ShieldCheck, Heart, Instagram } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

const CURATED_COMMUNITY_LOOKS = [
  {
    name: 'Aiman Zahra',
    handle: '@aiman.zahra',
    city: 'Lahore',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    piece: 'Festive Raw Silk Kurta Set',
    quote: 'Inspected the fabric at my doorstep before paying COD. The handwork embroidery was breathtaking in natural light.',
    likes: 428,
  },
  {
    name: 'Fatima Noor',
    handle: '@fatima.noor.style',
    city: 'Karachi',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    piece: 'Unstitched Digital Lawn Ensemble',
    quote: 'The colours matched the calibrated photos 100%. Usually online photos are over-edited, but Nakaam is honest.',
    likes: 312,
  },
  {
    name: 'Mahnoor Tariq',
    handle: '@mahnoor_tariq',
    city: 'Islamabad',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    piece: 'Artisan Embroidered Khussa',
    quote: 'The leather soles are genuine and so comfortable. The sizing cm chart was spot-on.',
    likes: 275,
  },
  {
    name: 'Zainab Qureshi',
    handle: '@zainab.q',
    city: 'Faisalabad',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    piece: 'Pure Chiffon Dupatta & Kurti',
    quote: 'Loved the rider coordination over WhatsApp. Delivery was seamless.',
    likes: 389,
  },
];

function getReviewItems(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

export function SocialProofSection({ products = [] }) {
  const reviewProducts = products.filter((product) => product?.slug).slice(0, 3);
  const reviewQueries = useQueries({
    queries: reviewProducts.map((product) => ({
      queryKey: ['product-reviews', product.slug, 1],
      queryFn: async () => {
        try {
          const response = await apiClient(`/products/${product.slug}/reviews?page=1&limit=6`);
          return getReviewItems(response);
        } catch {
          return [];
        }
      },
      staleTime: 60 * 1000,
    })),
  });

  const apiReviews = reviewQueries.flatMap((query, index) =>
    (query.data || [])
      .filter((review) => review?.comment)
      .slice(0, 1)
      .map((review) => ({ ...review, productName: reviewProducts[index]?.name }))
  );

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-label="Customer Reviews and Community">
      {/* Centered Editorial Header (Maria.B 'Worn & Loved' Style) */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B82A2E]/10 text-[#B82A2E] text-xs font-semibold uppercase tracking-widest mb-2">
          <Heart className="w-3.5 h-3.5 fill-[#B82A2E]" />
          <span>Patron Community</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-serif font-medium text-[#141413] tracking-tight">
          Worn & Loved <span className="text-[#B82A2E]">♥</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#78736B] mt-2 font-normal leading-relaxed">
          Real patrons wearing authentic Nakaam craft across Lahore, Karachi, Islamabad, and overseas.
        </p>
      </div>

      {/* Community Visual Reel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {CURATED_COMMUNITY_LOOKS.map((item, idx) => (
          <div
            key={idx}
            className="group rounded-2xl overflow-hidden border border-[#EAE5DD] bg-white flex flex-col shadow-[0_4px_16px_rgba(20,20,19,0.04)] hover:shadow-[0_12px_28px_rgba(20,20,19,0.09)] transition-all duration-300"
          >
            {/* Patron Portrait */}
            <div className="relative aspect-[4/5] w-full bg-[#F5F1EB] overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Verified Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 text-[#141413] backdrop-blur-md">
                  <ShieldCheck className="w-3 h-3 text-[#15803D]" />
                  <span>Verified Patron</span>
                </span>
              </div>

              {/* Patron Info Overlay */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold leading-tight">{item.name}</p>
                    <p className="text-[10px] text-white/75">{item.city}, Pakistan</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/90">
                    <Heart className="w-3 h-3 fill-white/80" />
                    <span>{item.likes}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quote Body */}
            <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B82A2E] truncate">
                {item.piece}
              </span>
              <p className="text-xs text-[#4A4742] leading-relaxed line-clamp-3 italic">
                “{item.quote}”
              </p>
              <div className="pt-2 border-t border-[#EAE5DD] flex items-center justify-between text-[11px] text-[#78736B]">
                <span className="font-medium text-[#141413]">{item.handle}</span>
                <span className="text-[10px] text-[#15803D] font-medium">Doorstep Inspected</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real Customer Reviews from DB if present */}
      {apiReviews.length > 0 && (
        <div className="mt-12 pt-10 border-t border-[#EAE5DD]">
          <h3 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#78736B] mb-6">
            Recent Product Ratings & Feedback
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {apiReviews.map((review, i) => {
              const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
              return (
                <div
                  key={review._id || i}
                  className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DD] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-[#E29A1D] mb-2">
                      {Array.from({ length: rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-[#141413] mb-1">{review.productName}</p>
                    <p className="text-xs text-[#4A4742] leading-relaxed line-clamp-2">
                      {review.comment}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#EAE5DD] flex items-center justify-between text-[11px] text-[#78736B]">
                    <span>{review.customerName || 'Verified Patron'}</span>
                    <span className="text-[#15803D] font-medium">Verified Purchase</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

