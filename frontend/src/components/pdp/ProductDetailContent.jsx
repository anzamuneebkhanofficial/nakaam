'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/Button';
import { formatPKR } from '@/lib/format';
import { apiClient } from '@/lib/apiClient';
import { getImageUrl } from '@/lib/image';
import { useCart } from '@/lib/cartContext';
import { useSession } from '@/lib/authClient';
import { useWishlist } from '@/lib/useWishlist';
import {
  Ruler,
  Check,
  Heart,
  ShoppingBag,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Leaf,
  Layers,
  Star,
  Package,
  Sparkles,
  Info,
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';

export function ProductDetailContent({ slug }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { data: session, isPending } = useSession();

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Size Helper State (D2)
  const [sizeHelperOpen, setSizeHelperOpen] = useState(false);
  const [userBust, setUserBust] = useState('');
  const [userWaist, setUserWaist] = useState('');
  const [recommendedSize, setRecommendedSize] = useState(null);

  // Fetch Product Data
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      return await apiClient(`/products/${slug}`);
    },
    staleTime: 60 * 1000,
  });
  const wishlist = useWishlist(product?._id);

  // Query: Verified Customer Reviews
  const queryClient = useQueryClient();
  const [reviewPage, setReviewPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const {
    data: reviewsResponse,
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['product-reviews', slug, reviewPage],
    queryFn: async () => await apiClient(`/products/${slug}/reviews?page=${reviewPage}&limit=6`),
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
  });

  const reviews = Array.isArray(reviewsResponse) ? reviewsResponse : (reviewsResponse?.data || reviewsResponse?.items || []);
  const reviewsMeta = reviewsResponse?.meta || reviewsResponse?.pagination || { page: 1, totalPages: 1, totalDocs: reviews.length };

  const submitReviewMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiClient(`/products/${slug}/reviews`, {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      toast.success('Your review has been published successfully.');
      setShowReviewModal(false);
      setNewComment('');
      setNewRating(5);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      refetchReviews();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit review');
    },
  });

  const availableSizes = useMemo(() => {
    const variants = product?.variants ?? [];
    if (variants.length === 0) return ['Standard'];
    const uniqueSizes = [];
    for (const variant of variants) {
      if (variant.size && !uniqueSizes.includes(variant.size)) {
        uniqueSizes.push(variant.size);
      }
    }
    return uniqueSizes.length > 0 ? uniqueSizes : ['Standard'];
  }, [product?.variants]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F2EC]">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 aspect-[3/4] bg-[#EFEAE2] rounded-2xl" />
            <div className="lg:col-span-5 space-y-6">
              <div className="h-6 w-32 bg-[#E6E1DA] rounded-sm" />
              <div className="h-10 w-4/5 bg-[#E6E1DA] rounded-md" />
              <div className="h-8 w-40 bg-[#E6E1DA] rounded-md" />
              <div className="h-32 w-full bg-[#FFFFFF] rounded-xl border border-[#E6E1DA]" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F2EC]">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold font-jakarta text-[#151515]">Piece Not Found</h1>
          <p className="text-xs text-[#6B6B6B]">
            The garment or textile piece you requested might be unavailable or archived.
          </p>
          <Button variant="primary" asChild>
            <Link href="/shop">Browse Collections</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const {
    name,
    subtitle,
    description,
    audience,
    category,
    images = [],
    pricing,
    price,
    compareAtPrice,
    fabric,
    fabricComposition,
    care = [],
    shrinkageNote,
    variants = [],
    sizeChart,
    model,
    fit,
    stock = 0,
    hasVariants = false,
    specifications = {},
    related = [],
  } = product;

  // Determine overall product stock availability
  const hasVariantsList = Array.isArray(variants) && variants.length > 0;
  const productIsInStock = hasVariantsList
    ? variants.some((v) => ((v.stock || 0) - (v.reservedStock || 0)) > 0)
    : Number(stock) > 0;

  const collectionLabel = product.occasion?.[0] || category?.name || audience || 'Nakaam collection';
  const activeImage = images[activeImageIndex] || images[0] || null;

  const selectedVariant = hasVariantsList
    ? (variants.find((variant) => variant.size === selectedSize) ||
       variants.find((variant) => ((variant.stock || 0) - (variant.reservedStock || 0)) > 0) ||
       variants[0])
    : null;
  const effectiveSelectedSize = selectedVariant?.size || selectedSize;

  const activePricing = selectedVariant?.pricing || pricing;
  const finalPrice = activePricing?.finalPrice ?? selectedVariant?.priceOverride ?? price ?? 0;
  const originalPrice = activePricing?.compareAtPrice ?? (activePricing?.savings > 0 ? (activePricing.basePrice || price) : compareAtPrice);
  const discountPercent = activePricing?.discountPercent ?? 0;
  const savings = activePricing?.savings ?? (originalPrice && originalPrice > finalPrice ? originalPrice - finalPrice : 0);
  const saleEndsAt = activePricing?.endsAt || pricing?.endsAt || null;
  const saleLabel = activePricing?.saleLabel || pricing?.saleLabel || null;
  const ratingAverage = Number(product.ratings?.average ?? 0);
  const ratingCount = Number(product.ratings?.count ?? 0);
  const soldCount = Number(product.soldCount ?? 0);

  const currentVariantStock = selectedVariant
    ? ((selectedVariant.stock || 0) - (selectedVariant.reservedStock || 0))
    : Number(stock);
  const isSelectedInStock = currentVariantStock > 0;

  // Rule-based Size Recommendation (D2)
  const calculateRecommendedSize = () => {
    if (!userBust && !userWaist) {
      toast.error('Please enter at least your bust/chest measurement');
      return;
    }
    const bustNum = parseFloat(userBust);
    if (sizeChart?.rows && bustNum) {
      const match = sizeChart.rows.find((row) => row.bustChest && row.bustChest >= bustNum);
      if (match && availableSizes.includes(match.size)) {
        setRecommendedSize(match.size);
        setSelectedSize(match.size);
        toast.success(`Recommended size based on measurements: ${match.size}`);
        return;
      }
    }
    const fallbackSize = availableSizes[0] || 'M';
    setRecommendedSize(fallbackSize);
    setSelectedSize(fallbackSize);
  };

  const handleAddToBag = async () => {
    if (isPending) return;
    if (!isSelectedInStock) {
      toast.error('This item is currently out of stock.');
      return;
    }
    if (!session) {
      toast.error('Please sign in to add items to your shopping bag.');
      router.push(`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : `/p/${slug}`)}`);
      return;
    }

    const matchingVariant = variants.find((v) => v.size === effectiveSelectedSize) || variants[0];
    const resolvedSku = matchingVariant?.sku || `${slug}-${effectiveSelectedSize}`;
    const resolvedSize = matchingVariant?.size || effectiveSelectedSize;
    const resolvedColor = selectedColor || matchingVariant?.color || product.colors?.[0]?.name;

    setIsAddingToCart(true);
    try {
      await addItem({
        productId: product._id || slug,
        variantSku: resolvedSku,
        name,
        image: activeImage?.url || images?.[0]?.url || '',
        size: resolvedSize,
        color: resolvedColor,
        unitPrice: finalPrice,
        originalPrice,
        quantity,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyWithCOD = async () => {
    if (isPending) return;
    if (!isSelectedInStock) {
      toast.error('This item is currently out of stock.');
      return;
    }
    if (!session) {
      toast.error('Please sign in to complete your purchase.');
      router.push('/login?next=/checkout');
      return;
    }

    const matchingVariant = variants.find((v) => v.size === effectiveSelectedSize) || variants[0];
    const resolvedSku = matchingVariant?.sku || `${slug}-${effectiveSelectedSize}`;
    const resolvedSize = matchingVariant?.size || effectiveSelectedSize;
    const resolvedColor = selectedColor || matchingVariant?.color || product.colors?.[0]?.name;

    const added = await addItem({
      productId: product._id || slug,
      variantSku: resolvedSku,
      name,
      image: activeImage?.url || images?.[0]?.url || '',
      size: resolvedSize,
      color: resolvedColor,
      unitPrice: finalPrice,
      originalPrice,
      quantity,
    });
    if (added) router.push('/checkout');
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: images.map((img) => img.url),
    description: `${name} - Crafted by Nakaam. Fabric: ${fabric || 'Pure cotton lawn'}.`,
    sku: variants[0]?.sku || slug,
    brand: {
      '@type': 'Brand',
      name: 'Nakaam',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: finalPrice,
      availability: variants.some((v) => v.stock > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://nakaam.pk/p/${slug}`,
    },
  };

  return (
    <div className="pdp-page-shell min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnnouncementBar />
      <Header />

      {/* Editorial Breadcrumbs (Khaadi & Maria.B Style) */}
      <nav className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-xs text-[#78736B] flex items-center gap-2 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#141413] transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/shop?audience=${product.audience || 'women'}`} className="hover:text-[#141413] transition-colors capitalize">
          {product.audience || 'Collections'}
        </Link>
        {product.category?.name && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#141413] transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#141413] font-medium truncate max-w-[200px] sm:max-w-none">{name}</span>
      </nav>

      <main className="pdp-main flex-1 w-full mx-auto">
        <div className="pdp-product-grid">
          <section className="pdp-gallery" aria-label="Product images">
            <div className="pdp-hero-media relative w-full overflow-hidden rounded-2xl border border-[#EAE5DD] bg-white">
              {images.length > 0 ? (
                <Swiper
                  onSwiper={setMainSwiper}
                  onSlideChange={(s) => setActiveImageIndex(s.activeIndex)}
                  className="w-full h-full"
                >
                  {images.map((img, idx) => {
                    const imgUrl = getImageUrl(img);
                    if (!imgUrl) return null;
                    return (
                      <SwiperSlide key={`pdp-main-slide-${idx}`} className="w-full h-full relative">
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={imgUrl}
                            alt={img?.alt || name}
                            fill
                            priority={idx === 0}
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            className={
                              product.audience === 'footwear' || product.audience === 'home'
                                ? 'object-contain p-4'
                                : 'object-cover object-center'
                            }
                          />
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#8C827A] p-8 text-center bg-[#EFEAE2]">
                  <span className="font-serif text-2xl font-bold tracking-widest uppercase opacity-40">NAKAAM</span>
                  <span className="text-xs uppercase tracking-wider mt-2 opacity-60">Authentic Collection Piece</span>
                </div>
              )}

              {/* Prev / Next Slide Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => mainSwiper?.slidePrev()}
                    className="pdp-gallery-arrow absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => mainSwiper?.slideNext()}
                    className="pdp-gallery-arrow absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
                    aria-label="Next image"
                  >
                    <ChevronLeft className="w-4 h-4 rotate-180" aria-hidden="true" />
                  </button>
                </>
              )}

              {/* Sale Tag */}
              {discountPercent > 0 && (
                <div className="pdp-sale-badge absolute top-4 right-4 z-10 pointer-events-none">
                  Save {discountPercent}%
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="pdp-thumbnails-wrap">
                <div className="pdp-thumbnails" aria-label="Choose a product image">
                  {images.map((img, idx) => {
                    const thumbUrl = getImageUrl(img);
                    if (!thumbUrl) return null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveImageIndex(idx);
                          mainSwiper?.slideTo(idx);
                        }}
                        aria-label={`Show product image ${idx + 1}`}
                        aria-current={activeImageIndex === idx ? 'true' : undefined}
                        className={`pdp-thumbnail relative shrink-0 overflow-hidden ${
                          activeImageIndex === idx ? 'is-active' : ''
                        }`}
                      >
                        <Image
                          src={thumbUrl}
                          alt={img?.alt || `${name}, view ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 62px, 82px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="pdp-gallery-dots" aria-label={`Image ${activeImageIndex + 1} of ${images.length}`}>
                  {images.map((img, idx) => (
                    <button
                      key={`gallery-dot-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx);
                        mainSwiper?.slideTo(idx);
                      }}
                      className={`pdp-gallery-dot ${activeImageIndex === idx ? 'is-active' : ''}`}
                      aria-label={`Go to image ${idx + 1}`}
                      aria-current={activeImageIndex === idx ? 'true' : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="pdp-details" aria-label="Product details">
            <div className="pdp-product-heading border-b border-[#EAE5DD] pb-5">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78736B]">
                  {collectionLabel}
                </span>
                {productIsInStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    In stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                    <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    Out of stock
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-[#141413] tracking-tight leading-snug">
                {name}
              </h1>

              {/* SKU & Artisan Spec Info */}
              <div className="flex items-center gap-2.5 mt-2 text-xs text-[#78736B]">
                <span className="font-mono">SKU: {variants[0]?.sku || slug}</span>
                <span>•</span>
                <span>Calibrated Daylight Verified</span>
              </div>

              {subtitle && (
                <p className="text-xs font-medium text-[#78736B] mt-1.5 tracking-wide">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="pdp-price-row pt-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold price-tabular text-[#141413]">
                  {formatPKR(finalPrice)}
                </span>
                {originalPrice && originalPrice > finalPrice && (
                  <span className="text-base sm:text-lg line-through text-[#8E8B85] price-tabular">
                    {formatPKR(originalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#B82A2E] text-white">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {ratingCount > 0 && (
                <a
                  className="pdp-rating"
                  href="#product-reviews"
                  aria-label={`${ratingAverage.toFixed(1)} out of 5 stars, ${ratingCount} reviews`}
                >
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                  <strong>{ratingAverage.toFixed(1)}</strong>
                  <span>({ratingCount} reviews)</span>
                </a>
              )}
            </div>

            {/* Campaign Limited-Time Sale Banner */}
            {discountPercent > 0 && (
              <div className="mt-2.5 mb-1 px-3 py-2 rounded-xl bg-[#FFF5F5] border border-[#FED7D7] flex items-center justify-between text-xs text-[#9B1C1C]">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#E53E3E] animate-pulse" />
                  <span className="font-bold">{saleLabel || 'Special Limited Sale'}</span>
                </div>
                {saleEndsAt && (
                  <div className="text-[11px] font-medium text-[#C53030]">
                    Ends {new Date(saleEndsAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            )}

            <p className="pdp-price-note">
              Prices are final in PKR. No unexpected charges at your doorstep.
            </p>

            {(product.isBestSeller || soldCount > 0) && (
              <p className="pdp-demand">
                <span className="pdp-demand-mark" aria-hidden="true" />
                {product.isBestSeller ? 'A Nakaam favourite' : 'Popular choice'}
                {soldCount > 0 && <span> · {soldCount.toLocaleString()} sold</span>}
              </p>
            )}

            {/* Product Sizing & Smart Recommendation (Shown only when sizing data is supported) */}
            {availableSizes.length > 0 && availableSizes[0] !== 'Standard' && (
              <div className="pdp-size-section">
                <div className="pdp-size-heading">
                  <span className="pdp-size-label">
                    Select Size
                  </span>
                  {sizeChart?.rows && sizeChart.rows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSizeHelperOpen((open) => !open)}
                      className="pdp-size-helper"
                      aria-expanded={sizeHelperOpen}
                    >
                      <Ruler className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Size recommendation</span>
                    </button>
                  )}
                </div>

                <div className="pdp-size-options" role="group" aria-label="Available sizes">
                  {availableSizes.map((s) => {
                    const isSelected = effectiveSelectedSize === s;
                    const isRecommended = recommendedSize === s;
                    const matchingVariant = variants.find((v) => v.size === s);
                    const stockRemaining = matchingVariant
                      ? (matchingVariant.stock || 0) - (matchingVariant.reservedStock || 0)
                      : 0;
                    const isOutOfStock = variants.length > 0 && matchingVariant && stockRemaining <= 0;

                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(s)}
                        aria-pressed={isSelected}
                        className={`pdp-size-option relative flex items-center justify-center ${
                          isOutOfStock
                            ? 'is-out-of-stock'
                            : isSelected
                            ? 'is-selected'
                            : ''
                        }`}
                      >
                        <span>{s}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                        {isRecommended && !isOutOfStock && (
                          <span className="pdp-recommended-size absolute">
                            Recommended
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Clean Size Recommendation Tool based on actual product size chart */}
                {sizeHelperOpen && sizeChart?.rows && sizeChart.rows.length > 0 && (
                  <div className="pdp-size-helper-panel space-y-3">
                    <p className="text-xs font-semibold text-[#141413]">
                      Enter your measurements ({sizeChart.unit || 'cm'}) for a tailored size recommendation:
                    </p>
                    {audience === 'footwear' ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          aria-label="Foot length in centimetres"
                          placeholder="Foot length (cm)..."
                          value={userBust}
                          onChange={(e) => setUserBust(e.target.value)}
                          className="pdp-measurement-input w-full h-9 px-3 rounded-lg border bg-white text-xs text-[#141413]"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          name="bust"
                          aria-label="Chest or bust measurement"
                          placeholder="Chest / Bust..."
                          value={userBust}
                          onChange={(e) => setUserBust(e.target.value)}
                          className="pdp-measurement-input h-9 px-3 rounded-lg border bg-white text-xs text-[#141413]"
                        />
                        <input
                          type="number"
                          name="waist"
                          aria-label="Waist measurement"
                          placeholder="Waist..."
                          value={userWaist}
                          onChange={(e) => setUserWaist(e.target.value)}
                          className="pdp-measurement-input h-9 px-3 rounded-lg border bg-white text-xs text-[#141413]"
                        />
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-xs h-9 rounded-lg"
                      onClick={() => {
                        const bustNum = parseFloat(userBust);
                        const waistNum = parseFloat(userWaist);
                        if (!bustNum && !waistNum) {
                          toast.error('Please enter your measurement to get a recommendation.');
                          return;
                        }
                        // Match closest size in sizeChart
                        const match = sizeChart.rows.find((row) => {
                          if (audience === 'footwear' && row.footLengthCm) {
                            return row.footLengthCm >= bustNum;
                          }
                          if (bustNum && row.bustChest) {
                            return row.bustChest >= bustNum;
                          }
                          if (waistNum && row.waist) {
                            return row.waist >= waistNum;
                          }
                          return false;
                        });

                        if (match && availableSizes.includes(match.size)) {
                          setRecommendedSize(match.size);
                          setSelectedSize(match.size);
                          toast.success(`Recommended size: ${match.size}`);
                        } else {
                          toast.error('Your measurements do not match an available size.');
                        }
                      }}
                    >
                      Find Recommended Size
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons: Add to Bag & Buy with COD */}
            <div className="space-y-2.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="pdp-add-button w-full h-12 rounded-full text-white font-medium text-sm"
                isLoading={isAddingToCart}
                disabled={!isSelectedInStock}
                onClick={handleAddToBag}
              >
                <ShoppingBag className="w-4 h-4 mr-2" aria-hidden="true" />
                {!isSelectedInStock
                  ? (hasVariantsList ? 'Selected Size Out of Stock' : 'Currently Out of Stock')
                  : `Add to Bag • ${formatPKR(finalPrice * quantity)}`}
              </Button>

              <div className="pdp-secondary-actions flex gap-2">
                <Button
                  variant="secondary"
                  size="default"
                  className="pdp-cod-button flex-1 h-11 rounded-full border text-xs font-semibold"
                  disabled={!isSelectedInStock}
                  onClick={handleBuyWithCOD}
                >
                  Buy Now with COD
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    void wishlist.toggleWishlist(product?._id);
                  }}
                  disabled={wishlist.isLoading || wishlist.isMutating}
                  className={`pdp-wishlist-button p-0 ${wishlist.isWishlisted ? 'is-wishlisted' : ''}`}
                  aria-label="Wishlist toggle"
                >
                  <Heart
                    className={`w-5 h-5 ${wishlist.isWishlisted ? 'fill-current' : ''}`}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>

            {/* Product Specifications & Dynamic Details Grid */}
            {(() => {
              const specMap = specifications instanceof Map
                ? Object.fromEntries(specifications)
                : (specifications || {});

              const isBedding = audience === 'home' || category?.slug?.includes('bed') || category?.slug?.includes('home') || Boolean(specMap.bedSize || specMap.sheetType || specMap.dimensions);
              const isFootwear = audience === 'footwear' || category?.slug?.includes('shoe') || category?.slug?.includes('footwear') || Boolean(specMap.upperMaterial || specMap.soleMaterial);

              // Gather specifications entries
              const specEntries = [];

              if (isBedding) {
                if (specMap.bedSize) specEntries.push({ label: 'Bed Size', value: specMap.bedSize });
                if (specMap.sheetType) specEntries.push({ label: 'Sheet Style', value: specMap.sheetType });
                if (specMap.threadCount) specEntries.push({ label: 'Thread Count', value: `${specMap.threadCount} TC` });
                if (specMap.dimensions?.length && specMap.dimensions?.width) {
                  specEntries.push({
                    label: 'Dimensions',
                    value: `${specMap.dimensions.length} × ${specMap.dimensions.width} ${specMap.dimensions.unit || 'in'}`,
                  });
                }
                if (specMap.setIncludes) specEntries.push({ label: 'Set Includes', value: specMap.setIncludes });
              } else if (isFootwear) {
                if (specMap.upperMaterial) specEntries.push({ label: 'Upper Material', value: specMap.upperMaterial });
                if (specMap.soleMaterial) specEntries.push({ label: 'Sole Material', value: specMap.soleMaterial });
                if (specMap.closureType) specEntries.push({ label: 'Fastening / Closure', value: specMap.closureType });
                if (specMap.heelHeight) specEntries.push({ label: 'Heel Height', value: specMap.heelHeight });
                if (specMap.embellishment) specEntries.push({ label: 'Embellishment', value: specMap.embellishment });
                if (specMap.bootHeight) specEntries.push({ label: 'Boot Height', value: specMap.bootHeight });
                if (specMap.shoeFit) specEntries.push({ label: 'Fit Profile', value: specMap.shoeFit });
              } else {
                // Apparel (Women, Men, Kids, Collections)
                const resolvedFabric = specMap.fabric || fabric;
                if (resolvedFabric) specEntries.push({ label: 'Fabric Type', value: resolvedFabric });
                const resolvedComposition = specMap.fabricComposition || fabricComposition;
                if (resolvedComposition) specEntries.push({ label: 'Composition', value: resolvedComposition });
                if (specMap.suitPieces) specEntries.push({ label: 'Outfit Type', value: specMap.suitPieces });
                if (specMap.weave) specEntries.push({ label: 'Weave / Texture', value: specMap.weave });
                if (specMap.workType) specEntries.push({ label: 'Craftwork', value: specMap.workType });
                if (specMap.drape) specEntries.push({ label: 'Drape & Handfeel', value: specMap.drape });
                const resolvedShrinkage = specMap.shrinkageNote || shrinkageNote;
                if (resolvedShrinkage) specEntries.push({ label: 'Shrinkage & Wash', value: resolvedShrinkage });
              }

              // Resolved care guidelines
              const resolvedCare = specMap.care
                ? (Array.isArray(specMap.care) ? specMap.care : [specMap.care])
                : (care.length > 0 ? care : null);

              // Package contents or included components
              const packageItems = Array.isArray(specMap.packageContents) && specMap.packageContents.length > 0
                ? specMap.packageContents
                : null;
              const garmentComponents = Array.isArray(specMap.components) && specMap.components.length > 0
                ? specMap.components
                : null;

              const hasAnyData = specEntries.length > 0 || resolvedCare || packageItems || garmentComponents;

              if (!hasAnyData) return null;

              return (
                <div className="space-y-4 pt-2">
                  {/* Itemized package contents / included garment components */}
                  {packageItems && (
                    <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-white/70 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#151515]">
                        <Package className="w-4 h-4" />
                        <span>Package Contents ({packageItems.length} items)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {packageItems.map((pkg, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#4A4742] bg-[#F6F2EC]/60 px-2.5 py-1.5 rounded-lg border border-[#E6E1DA]/50">
                            <span className="w-4 h-4 rounded-full bg-[#151515] text-[#FAF8F5] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {pkg.qty}
                            </span>
                            <span className="font-medium truncate">{pkg.item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {garmentComponents && (
                    <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-white/70 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#151515]">
                        <Package className="w-4 h-4" />
                        <span>Included Pieces</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {garmentComponents.map((comp, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F6F2EC] text-[#151515] border border-[#E6E1DA]">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specifications & Attributes Table */}
                  {specEntries.length > 0 && (
                    <div className="rounded-xl border border-[#E6E1DA] bg-white/70 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-[#E6E1DA] bg-[#F6F2EC]/40 flex items-center gap-2 text-xs font-bold text-[#151515] tracking-tight">
                        <Sparkles className="w-3.5 h-3.5 text-[#151515]" />
                        <span>Product Specifications</span>
                      </div>
                      <dl className="divide-y divide-[#E6E1DA]/60 text-xs">
                        {specEntries.map(({ label, value }) => (
                          <div key={label} className="grid grid-cols-3 px-4 py-2 hover:bg-[#F6F2EC]/30 transition-colors">
                            <dt className="font-semibold text-[#6B6B6B]">{label}</dt>
                            <dd className="col-span-2 text-[#151515] font-medium">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {/* Care Guidelines (if specified) */}
                  {resolvedCare && resolvedCare.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-white/70 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#151515]">
                        <Leaf className="w-3.5 h-3.5 text-[#151515]" />
                        <span>Care Guidelines</span>
                      </div>
                      <div className="text-xs text-[#4A4742] leading-relaxed">
                        {Array.isArray(resolvedCare) ? (
                          <ul className="list-disc list-inside space-y-0.5">
                            {resolvedCare.map((c, idx) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{resolvedCare}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        </div>

        {/* Verified Reviews & Patron Feedback Section */}
        <section id="product-reviews" className="pdp-reviews mt-16 pt-12 border-t border-[#E6E1DA]" aria-label="Customer Reviews">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
                  Customer Reviews
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#151515] text-white font-bold">
                  {reviewsError ? '—' : reviewsMeta.totalDocs || 0}
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-1">
                Published customer feedback for this product.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => {
                if (isPending) return;
                if (!session) {
                  toast.error('Please sign in to write a review.');
                  router.push(`/login?next=/p/${slug}`);
                  return;
                }
                setShowReviewModal(true);
              }}
              className="rounded-xl flex items-center gap-2"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Write a Review
            </Button>
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-6 rounded-2xl border border-[#E6E1DA] bg-white animate-pulse space-y-3">
                  <div className="h-4 bg-[#F6F2EC] rounded w-1/4" />
                  <div className="h-12 bg-[#F6F2EC] rounded w-full" />
                </div>
              ))}
            </div>
          ) : reviewsError ? (
            <div className="p-8 rounded-2xl bg-white border border-[#E6E1DA] text-center space-y-3">
              <p role="alert" className="text-sm text-[#8F1A1E]">
                Customer reviews could not be loaded.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetchReviews()}>
                Try Again
              </Button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#E6E1DA] text-center space-y-3">
              <Star className="w-8 h-8 text-[#9B9692] mx-auto stroke-[1.5]" />
              <p className="font-serif text-base font-bold text-[#151515]">No customer reviews yet</p>
              <p className="text-xs text-[#6B6B6B] max-w-md mx-auto">
                Be the first to review the silhouette, fabric handfeel, and sizing accuracy.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-6 rounded-2xl border border-[#E6E1DA] bg-white space-y-3 hover:border-[#151515] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < rev.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-[#E6E1DA]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#8E8B85]">
                        {new Date(rev.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-[#3A3A3A] leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F6F2EC] text-[11px]">
                      <span className="font-semibold text-[#151515] flex items-center gap-1.5">
                        {rev.customerName}
                        {rev.isVerifiedBuyer && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold uppercase">
                            Verified Buyer
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {reviewsMeta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-xs text-[#6B6B6B]">
                    Page {reviewsMeta.page} of {reviewsMeta.totalPages} ({reviewsMeta.totalDocs || reviews.length} reviews)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={reviewsMeta.page <= 1}
                      onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#E6E1DA] bg-white disabled:opacity-40 hover:bg-[#F6F2EC] transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={reviewsMeta.page >= reviewsMeta.totalPages}
                      onClick={() => setReviewPage((p) => Math.min(reviewsMeta.totalPages, p + 1))}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#E6E1DA] bg-white disabled:opacity-40 hover:bg-[#F6F2EC] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Review Submission Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white border border-[#E6E1DA] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <h3 className="font-serif text-lg font-bold text-[#151515]">Write a Review</h3>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="text-xs text-[#6B6B6B] hover:text-[#151515]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#151515] mb-1">Overall Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setNewRating(s)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            s <= newRating ? 'text-amber-500 fill-amber-500' : 'text-[#E6E1DA]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#151515] mb-1">Your Review &amp; Experience</label>
                  <textarea
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe fabric feel, color accuracy, sizing, and your overall experience..."
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1DA]">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs font-semibold text-[#151515]"
                >
                  Cancel
                </button>
                <Button
                  size="sm"
                  isLoading={submitReviewMutation.isPending}
                  disabled={!newComment.trim()}
                  onClick={() => {
                    submitReviewMutation.mutate({
                      rating: newRating,
                      comment: newComment.trim(),
                      customerName: session?.user?.name || 'Customer',
                    });
                  }}
                  className="rounded-xl px-5 text-xs font-semibold"
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Related Pieces (Signature Khaadi "YOU MAY ALSO LIKE" Section) */}
        {related.length > 0 && (
          <section className="mt-20 pt-16 border-t border-[#EAE5DD]" aria-label="Related Pieces">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B82A2E]">
                Curated Pairings
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#141413] mt-1.5 tracking-tight">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p._id || p.slug} product={p} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
