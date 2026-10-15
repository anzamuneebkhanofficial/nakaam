'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useSession } from '@/lib/authClient';

export function useWishlist(productId) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = useSession();
  const userId = session?.user?.id;

  const wishlistQuery = useQuery({
    queryKey: ['wishlist', userId, 'items'],
    queryFn: () => apiClient('/wishlist?limit=100'),
    enabled: Boolean(userId) && !isSessionPending,
    staleTime: 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, isWishlisted }) =>
      isWishlisted
        ? apiClient(`/wishlist/${id}`, { method: 'DELETE' })
        : apiClient('/wishlist', { method: 'POST', body: { productId: id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist', userId] }),
  });

  const items = Array.isArray(wishlistQuery.data) ? wishlistQuery.data : [];
  const isWishlisted = Boolean(
    productId && items.some((item) => String(item.product?._id) === String(productId))
  );

  const toggleWishlist = useCallback(async (targetProductId = productId) => {
    if (isSessionPending) return false;
    if (!userId) {
      toast.error('Please sign in to save pieces to your wishlist.');
      router.push(`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`);
      return false;
    }
    if (wishlistQuery.isLoading || wishlistQuery.isError || !Array.isArray(wishlistQuery.data)) {
      toast.error('Your wishlist is unavailable right now. Please try again when the database reconnects.');
      return false;
    }
    if (!targetProductId || mutation.isPending) return false;

    const currentlySaved = wishlistQuery.data.some(
      (item) => String(item.product?._id) === String(targetProductId)
    );

    try {
      await mutation.mutateAsync({ id: targetProductId, isWishlisted: currentlySaved });
      toast.success(currentlySaved ? 'Removed from your wishlist.' : 'Saved to your wishlist.');
      return true;
    } catch (error) {
      toast.error(error?.message || 'Unable to update your wishlist.');
      return false;
    }
  }, [
    isSessionPending,
    userId,
    router,
    wishlistQuery.isLoading,
    wishlistQuery.isError,
    wishlistQuery.data,
    mutation,
    productId,
  ]);

  return {
    isAuthenticated: Boolean(userId && !isSessionPending),
    isWishlisted,
    isLoading: isSessionPending || wishlistQuery.isLoading,
    isError: wishlistQuery.isError,
    isMutating: mutation.isPending,
    wishlistCount: wishlistQuery.data?.meta?.total,
    isCountReady: Boolean(userId && !isSessionPending && wishlistQuery.isSuccess),
    toggleWishlist,
    refetch: wishlistQuery.refetch,
  };
}
