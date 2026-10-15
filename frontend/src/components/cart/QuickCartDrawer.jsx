'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { useSession } from '@/lib/authClient';
import { formatPKR } from '@/lib/format';
import { toast } from 'sonner';
import { getImageUrl, DEFAULT_PRODUCT_FALLBACK } from '@/lib/image';
import { Button } from '@/components/ui/Button';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 5000;

export function QuickCartDrawer() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const {
    items,
    itemCount,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    cartStatus,
    isAuthenticated,
    refreshCart,
  } = useCart();

  const handleCheckout = () => {
    if (isPending) return;
    closeDrawer();
    if (!session) {
      toast.error('Please sign in to proceed to checkout.');
      router.push('/login?next=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (!isDrawerOpen) return null;

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#151515]/45 backdrop-blur-[2px] transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] shadow-[-8px_0_32px_rgba(21,21,21,0.08)] flex flex-col h-full z-10 border-l border-[#E6E1DA] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E1DA]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#151515]" />
            <h2 className="font-serif text-xl font-bold text-[#151515]">Shopping Bag</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#F6F2EC] text-[#151515] border border-[#E6E1DA]">
              {itemCount}
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC] rounded-full transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-6 py-3.5 bg-[#F6F2EC] border-b border-[#E6E1DA]">
          <div className="flex items-center justify-between text-xs text-[#3A3A3A] mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#D12C2F]" />
              {amountToFreeShipping > 0 ? (
                <>Add <strong className="text-[#151515] font-semibold">{formatPKR(amountToFreeShipping)}</strong> for Free Delivery</>
              ) : (
                <strong className="text-[#151515] font-semibold">Unlocked Free Doorstep Delivery!</strong>
              )}
            </span>
            <span className="font-semibold text-[#151515]">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E6E1DA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D12C2F] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#E6E1DA]">
          {cartStatus === 'error' ? (
            <div role="alert" className="h-full flex flex-col items-center justify-center text-center py-16">
              <h3 className="font-serif text-lg font-bold text-[#151515] mb-2">Shopping bag unavailable</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xs mb-6">We couldn’t confirm your saved items because the database is unavailable.</p>
              <Button variant="primary" onClick={() => void refreshCart()} className="w-full max-w-xs">
                Try Again
              </Button>
            </div>
          ) : !isAuthenticated ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#F6F2EC] flex items-center justify-center text-[#6B6B6B] mb-4">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#151515] mb-1">Sign in to view your bag</h3>
              <p className="text-sm text-[#6B6B6B] max-w-xs mb-6">Shopping bags are private to each account.</p>
              <Button variant="primary" onClick={() => router.push('/login?next=/cart')} className="w-full max-w-xs">
                Sign In
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#F6F2EC] flex items-center justify-center text-[#6B6B6B] mb-4">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#151515] mb-1">
                Your bag is empty
              </h3>
              <p className="text-sm text-[#6B6B6B] max-w-xs mb-6">
                Explore our handcrafted pret, festive unstitched suits, and home textiles.
              </p>
              <Button
                variant="primary"
                onClick={closeDrawer}
                className="w-full max-w-xs"
              >
                <Link href="/shop" className="w-full">
                  Discover Collections
                </Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantSku} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                {/* Thumbnail */}
                <div className="relative w-20 h-24 rounded-lg bg-[#F6F2EC] border border-[#E6E1DA] overflow-hidden flex-shrink-0">
                  <Image
                    src={getImageUrl(item.image) || DEFAULT_PRODUCT_FALLBACK}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#151515] line-clamp-1">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.variantSku)}
                        className="text-[#6B6B6B] hover:text-[#D12C2F] p-1 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-[#6B6B6B]">
                      <span className="px-1.5 py-0.5 rounded bg-[#F6F2EC] border border-[#E6E1DA] font-medium text-[#151515]">
                        Size: {item.size}
                      </span>
                      {item.color && (
                        <span>Color: {item.color}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#E6E1DA] rounded-lg bg-[#FFFFFF]">
                      <button
                        onClick={() => updateQuantity(item.variantSku, item.quantity - 1)}
                        className="p-1.5 text-[#3A3A3A] hover:text-[#151515] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold tabular-nums text-[#151515]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantSku, item.quantity + 1)}
                        className="p-1.5 text-[#3A3A3A] hover:text-[#151515] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-semibold text-sm tabular-nums text-[#151515]">
                      {formatPKR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#E6E1DA] bg-[#FFFFFF] space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm text-[#3A3A3A]">
                <span>Subtotal</span>
                <span className="font-bold text-[#151515] text-base tabular-nums">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#6B6B6B] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                Doorstep Open-Box Inspection guaranteed on delivery.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={closeDrawer}
                className="w-full"
              >
                <Link href="/cart" className="w-full text-center">
                  View Full Bag
                </Link>
              </Button>
              <Button
                variant="primary"
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-1.5"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
