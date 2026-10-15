/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  X,
  Image as ImageIcon,
} from 'lucide-react';

export function ProductImageGallery({ images = [], productName = 'Product' }) {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const total = images.length;

  if (!images || total === 0) {
    return (
      <div className="w-full aspect-[4/5] max-h-[460px] rounded-2xl bg-[#EFEAE2] border border-[#E6E1DA] flex flex-col items-center justify-center text-[#8E8B85] p-6 text-center">
        <ImageIcon className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
        <p className="text-xs font-semibold text-[#151515]">No Images Available</p>
        <p className="text-[11px] mt-1">This product currently has no gallery images uploaded.</p>
      </div>
    );
  }

  const toggleAutoplay = () => {
    if (!swiperInstance) return;
    if (isAutoPlaying) {
      swiperInstance.autoplay.stop();
      setIsAutoPlaying(false);
    } else {
      swiperInstance.autoplay.start();
      setIsAutoPlaying(true);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Main Display Stage with Swiper */}
      <div className="relative w-full aspect-[4/5] max-h-[500px] bg-[#EFEAE2] rounded-2xl overflow-hidden border border-[#E6E1DA] group select-none">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={total > 1}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          onSwiper={(swiper) => setSwiperInstance(swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          className="w-full h-full"
        >
          {images.map((img, idx) => {
            const url = typeof img === 'string' ? img : img.url;
            const alt = (typeof img === 'object' && img.alt) || `${productName} photo ${idx + 1}`;
            return (
              <SwiperSlide key={idx} className="w-full h-full flex items-center justify-center bg-[#EFEAE2]">
                <img
                  src={url}
                  alt={alt}
                  className="w-full h-full object-contain md:object-cover"
                />
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Floating Top Controls: Counter & Fullscreen & Autoplay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-full bg-[#151515]/75 backdrop-blur-md text-[11px] font-mono font-medium text-white shadow-sm pointer-events-auto">
            {activeIndex + 1} / {total}
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {total > 1 && (
              <button
                type="button"
                onClick={toggleAutoplay}
                className="p-1.5 rounded-full bg-[#151515]/75 hover:bg-[#151515] backdrop-blur-md text-white transition-colors cursor-pointer"
                title={isAutoPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-full bg-[#151515]/75 hover:bg-[#151515] backdrop-blur-md text-white transition-colors cursor-pointer"
              title="View Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Prev / Next Nav Arrows */}
        {total > 1 && (
          <>
            <button
              ref={prevRef}
              type="button"
              aria-label="Previous Image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-[#151515] shadow-md backdrop-blur-sm transition-all duration-150 hover:scale-105 active:scale-95 opacity-90 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              ref={nextRef}
              type="button"
              aria-label="Next Image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-[#151515] shadow-md backdrop-blur-sm transition-all duration-150 hover:scale-105 active:scale-95 opacity-90 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* Swiper Thumbnails Bar */}
      {total > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {images.map((img, idx) => {
            const url = typeof img === 'string' ? img : img.url;
            const isSelected = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => swiperInstance?.slideToLoop(idx)}
                className={`relative shrink-0 w-14 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-[#151515] ring-1 ring-[#151515] scale-105 shadow-sm'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Overlay Modal */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#151515]/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={typeof images[activeIndex] === 'string' ? images[activeIndex] : images[activeIndex]?.url}
            alt={`${productName} fullscreen`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
