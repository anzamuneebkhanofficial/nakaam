'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { useSession } from '@/lib/authClient';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { getImageUrl, DEFAULT_PRODUCT_FALLBACK } from '@/lib/image';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

const FREE_SHIPPING_THRESHOLD = 5000;

export function CartContent() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    cartStatus,
    refreshCart,
  } = useCart();
  const { data: session, isPending } = useSession();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 250;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - couponDiscount);

  if (isPending || cartStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 grid place-items-center px-4">
          <p className="text-sm text-[#78736B]">Confirming your shopping bag...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 grid place-items-center px-4">
          <div className="rounded-xl border border-[#EAE5DD] bg-white p-8 text-center max-w-md shadow-xs">
            <h1 className="font-serif text-2xl font-bold text-[#141413]">Sign in to view your shopping bag</h1>
            <p className="mt-2 text-sm text-[#78736B]">Your bag is private to your account.</p>
            <button type="button" onClick={() => router.push('/login?next=/cart')} className="mt-5 rounded-lg bg-[#141413] px-5 py-3 text-sm font-semibold text-white hover:bg-black transition-colors cursor-pointer">
              Sign In
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartStatus === 'error') {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 grid place-items-center px-4">
          <div role="alert" className="rounded-xl border border-[#EAE5DD] bg-white p-8 text-center max-w-md shadow-xs">
            <h1 className="font-serif text-2xl font-bold text-[#141413]">Shopping bag temporarily unavailable</h1>
            <p className="mt-2 text-sm text-[#78736B]">We couldn’t confirm your saved items. Please retry when the database reconnects.</p>
            <button type="button" onClick={() => void refreshCart()} className="mt-5 rounded-lg bg-[#141413] px-5 py-3 text-sm font-semibold text-white hover:bg-black transition-colors cursor-pointer">
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const result = await apiClient('/coupons/validate', {
        method: 'POST',
        body: {
          code: couponInput.trim().toUpperCase(),
          subtotal,
        },
      });

      if (!result?.valid || !Number.isFinite(result.discount)) {
        throw new Error('The server returned an invalid coupon response.');
      }

      setAppliedCoupon({
        code: result.code,
        discount: result.discount,
        label: 'Coupon savings',
      });
      toast.success(`Coupon applied! You saved ${formatPKR(result.discount)}`);
    } catch (error) {
      setAppliedCoupon(null);
      toast.error(error?.message || 'Unable to validate this coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast('Coupon removed');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141413]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Path */}
        <nav className="text-xs text-[#78736B] mb-6 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#141413] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A6A095]" />
          <span className="text-[#141413] font-semibold">Shopping Bag</span>
        </nav>

        {/* Page Title & Item Count */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[#EAE5DD] mb-8">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#141413]">
              Shopping Bag
            </h1>
            <span className="px-3 py-1 rounded-full bg-white border border-[#EAE5DD] text-xs font-bold text-[#141413]">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                void clearCart();
              }}
              className="text-xs text-[#78736B] hover:text-[#B82A2E] transition-colors underline cursor-pointer"
            >
              Clear entire bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="cart"
            badge="Shopping Bag"
            title="Your shopping bag is empty"
            description="Looks like you haven't added any items yet. Explore our latest collection to start shopping."
            actionLabel="Start Shopping"
            actionHref="/shop"
            className="my-8"
          />
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Items List & Delivery Progress (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Free Delivery Bar */}
              <div className="p-4 rounded-xl bg-white border border-[#EAE5DD] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#4A4742] mb-2 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#B82A2E]" />
                    {amountToFreeShipping > 0 ? (
                      <>Add <strong className="text-[#141413] font-semibold">{formatPKR(amountToFreeShipping)}</strong> more to enjoy Free Doorstep Delivery</>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        You have unlocked Free Doorstep Delivery!
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-[#141413]">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F0ECE4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B82A2E] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card Container */}
              <div className="bg-white rounded-xl border border-[#EAE5DD] divide-y divide-[#EAE5DD] shadow-xs overflow-hidden">
                {items.map((item) => (
                  <div key={item.variantSku} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-lg bg-[#F0ECE4] border border-[#EAE5DD] overflow-hidden flex-shrink-0">
                      <Image
                        src={getImageUrl(item.image) || DEFAULT_PRODUCT_FALLBACK}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-serif text-lg font-bold text-[#141413] truncate">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.variantSku)}
                          className="text-[#78736B] hover:text-[#B82A2E] p-1 transition-colors cursor-pointer"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#78736B]">
                        <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE5DD] font-medium text-[#141413]">
                          Size: {item.size}
                        </span>
                        {item.color && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE5DD]">
                            Color: {item.color}
                          </span>
                        )}
                        <span className="text-[11px] text-[#A6A095]">SKU: {item.variantSku}</span>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#EAE5DD] rounded-lg bg-white shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.variantSku, item.quantity - 1)}
                            className="p-2 text-[#4A4742] hover:text-[#141413] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-bold tabular-nums text-[#141413]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantSku, item.quantity + 1)}
                            className="p-2 text-[#4A4742] hover:text-[#141413] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right">
                          <p className="text-xs text-[#78736B]">
                            {formatPKR(item.unitPrice)} each
                          </p>
                          <p className="font-bold text-base text-[#141413] tabular-nums">
                            {formatPKR(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Doorstep Inspection Guarantee Banner */}
              <div className="p-5 rounded-xl bg-white border border-[#EAE5DD] flex items-start gap-3.5 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-[#B82A2E] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#141413]">
                    Open-Box Doorstep Inspection Guarantee
                  </h4>
                  <p className="text-xs text-[#78736B] leading-relaxed">
                    Check fabric weave, stitching, and sizing in person before handing cash to the courier rider. If unsatisfied, return immediately on the spot with zero hassle.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout (4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-6">
              <div className="bg-white rounded-xl border border-[#EAE5DD] p-6 shadow-xs space-y-6">
                <h2 className="font-serif text-xl font-bold text-[#141413] pb-3 border-b border-[#EAE5DD]">
                  Order Summary
                </h2>

                {/* Subtotal, Shipping, Discount Rows */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#4A4742]">
                    <span>Bag Subtotal</span>
                    <span className="font-medium text-[#141413] tabular-nums">
                      {formatPKR(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#4A4742]">
                    <span className="flex items-center gap-1.5">
                      Doorstep Delivery
                      {shippingFee === 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-[#141413] tabular-nums">
                      {shippingFee === 0 ? 'PKR 0' : formatPKR(shippingFee)}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#B82A2E] font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {appliedCoupon.label}
                      </span>
                      <span className="tabular-nums">- {formatPKR(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#EAE5DD] flex justify-between items-baseline">
                    <div>
                      <span className="font-serif text-lg font-bold text-[#141413]">Grand Total</span>
                      <p className="text-[11px] text-[#78736B]">Inclusive of all taxes</p>
                    </div>
                    <span className="font-serif text-2xl font-bold text-[#141413] tabular-nums">
                      {formatPKR(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2">
                  {appliedCoupon ? (
                    <div className="p-3 rounded-lg bg-[#FAF0F0] border border-[#F5C2C4] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#B82A2E]" />
                        <span className="font-bold text-[#B82A2E]">{appliedCoupon.code}</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-[#B82A2E] hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Voucher or promo code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="text-xs uppercase h-11 border-[#EAE5DD]"
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        isLoading={isApplyingCoupon}
                        className="h-11 px-4 text-xs font-bold"
                      >
                        Apply
                      </Button>
                    </form>
                  )}
                </div>

                {/* Checkout CTA Button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full h-13 text-sm font-bold shadow-xs cursor-pointer"
                  disabled={isPending}
                  onClick={() => {
                    if (isPending) return;
                    if (!session) {
                      toast.error('Please sign in to proceed to checkout.');
                      router.push('/login?next=/checkout');
                      return;
                    }
                    router.push('/checkout');
                  }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Proceed to Checkout • {formatPKR(grandTotal)}
                </Button>

                {/* Payment & Security Trust Seals */}
                <div className="pt-2 text-center space-y-2">
                  <p className="text-[11px] text-[#78736B] flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Cash on Delivery (COD) & Raast Instant Transfer accepted
                  </p>
                  <p className="text-[11px] text-[#78736B]">
                    Need custom tailoring assistance? WhatsApp us directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
