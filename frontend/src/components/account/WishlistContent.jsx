'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useCart } from '@/lib/cartContext';
import { formatPKR } from '@/lib/format';
import { getProductImageUrl, DEFAULT_PRODUCT_FALLBACK } from '@/lib/image';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/authClient';

export function WishlistContent() {
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const { data: session, isPending: isSessionPending } = useSession();
  const userId = session?.user?.id;
  const [page, setPage] = useState(1);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['wishlist', userId, page],
    queryFn: () => apiClient(`/wishlist?page=${page}&limit=24`),
    enabled: Boolean(userId) && !isSessionPending,
    staleTime: 60 * 1000,
  });

  const wishlistItems = Array.isArray(response) ? response : (response?.data || response?.items || []);
  const meta = response?.meta || { page, totalPages: 1, total: wishlistItems.length };

  const removeMutation = useMutation({
    mutationFn: async (productId) => {
      return await apiClient(`/wishlist/${productId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
      toast('Item removed from Wishlist');
    },
  });

  const handleMoveToBag = async (product) => {
    const activeVariant =
      product.variants?.find((v) => ((v.stock || 0) - (v.reservedStock || 0)) > 0) ||
      product.variants?.[0];
    const resolvedSku = activeVariant?.sku || `${product.slug}-${activeVariant?.size || 'Standard'}`;
    const resolvedSize = activeVariant?.size || 'Standard';

    const added = await addItem({
      productId: product._id,
      variantSku: resolvedSku,
      name: product.name,
      image: product.images?.[0]?.url,
      size: resolvedSize,
      unitPrice: product.pricing?.finalPrice || product.price,
      originalPrice: product.compareAtPrice,
      quantity: 1,
    });
    if (added) removeMutation.mutate(product._id);
  };

  if (isSessionPending) {
    return <p className="py-12 text-center text-sm text-[#6B6B6B]">Checking your session...</p>;
  }

  if (!session) {
    return (
      <div className="rounded-2xl border border-[#E6E1DA] bg-white p-8 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#151515]">Sign in to view your wishlist</h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">Saved items are private to your account.</p>
        <Link href="/login?next=/account/wishlist" className="mt-5 inline-flex rounded-lg bg-[#151515] px-5 py-3 text-sm font-semibold text-white">
          Sign In
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="rounded-2xl border border-[#E6E1DA] bg-white p-8 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#151515]">Wishlist temporarily unavailable</h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">We couldn’t confirm your saved items. Please try again when the database reconnects.</p>
        <button type="button" onClick={() => void refetch()} className="mt-5 rounded-lg bg-[#151515] px-5 py-3 text-sm font-semibold text-white">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
              Wishlist & Eid Prêt Vault
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Saved handcrafted pret and festive apparel reserved for upcoming occasions.
            </p>
          </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F6F2EC] border border-[#E6E1DA]">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved
                </span>
              </div>

              {wishlistItems.length === 0 ? (
                <EmptyState
                  icon="wishlist"
                  badge="Patron Vault"
                  title="Your wishlist vault is empty"
                  description="Explore our handcrafted pret and festive apparel, and bookmark pieces for upcoming occasions."
                  actionLabel="Discover Collection"
                  actionHref="/shop"
                  className="my-4"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => {
                    const p = item.product;
                    if (!p) return null;
                    const finalPrice = p.pricing?.finalPrice || p.price;
                    return (
                      <div
                        key={item._id}
                        className="group rounded-2xl border border-[#E6E1DA] bg-white overflow-hidden shadow-xs hover:border-[#151515] transition-all flex flex-col justify-between"
                      >
                        {/* Media */}
                        <div className="relative aspect-[3/4] bg-[#F6F2EC] overflow-hidden">
                          <Image
                            src={getProductImageUrl(p, 0, DEFAULT_PRODUCT_FALLBACK)}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 300px"
                            className="object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                          <button
                            onClick={() => removeMutation.mutate(p._id)}
                            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-[#6B6B6B] hover:text-[#D12C2F] shadow-xs cursor-pointer transition-colors"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h3 className="font-serif text-sm font-bold text-[#151515] line-clamp-2">
                              <Link href={`/p/${p.slug}`} className="hover:underline">
                                {p.name}
                              </Link>
                            </h3>
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-sm text-[#151515] tabular-nums">
                                {formatPKR(finalPrice)}
                              </span>
                              {p.compareAtPrice && (
                                <span className="text-xs text-[#6B6B6B] line-through tabular-nums">
                                  {formatPKR(p.compareAtPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full h-10 text-xs font-bold"
                            onClick={() => handleMoveToBag(p)}
                          >
                            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                            Move to Bag
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Server-Side Pagination */}
              <Pagination
                currentPage={meta.page || page}
                totalPages={meta.totalPages || 1}
                totalItems={meta.total || wishlistItems.length}
                pageSize={24}
                onPageChange={(p) => setPage(p)}
                variant="full"
              />
            </div>
          </div>
  );
}
