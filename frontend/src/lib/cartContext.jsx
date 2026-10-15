'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useSession } from '@/lib/authClient';

const CartContext = createContext(null);
const EMPTY_CART = { items: [], subtotal: 0, totalQuantity: 0 };

function getCartData(response) {
  if (!response || !Array.isArray(response.items)) {
    throw new Error('The server returned invalid shopping bag data.');
  }

  return {
    items: response.items,
    subtotal: Number.isFinite(response.subtotal) ? response.subtotal : 0,
    totalQuantity: Number.isFinite(response.totalQuantity) ? response.totalQuantity : 0,
  };
}

export function CartProvider({ children }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id || null;
  const activeUserId = useRef(userId);

  const [cart, setCart] = useState(EMPTY_CART);
  const [cartUserId, setCartUserId] = useState(null);
  const [cartStatus, setCartStatus] = useState('loading');
  const [cartError, setCartError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (isPending || !userId) return false;

    try {
      const result = getCartData(await apiClient('/cart'));
      if (activeUserId.current !== userId) return false;

      setCart(result);
      setCartUserId(userId);
      setCartStatus('ready');
      setCartError(null);
      return true;
    } catch (error) {
      if (activeUserId.current === userId) {
        setCart(EMPTY_CART);
        setCartUserId(userId);
        setCartError(error);
        setCartStatus('error');
        console.error('Unable to load the authenticated shopping bag:', error);
      }
      return false;
    }
  }, [isPending, userId]);

  useEffect(() => {
    activeUserId.current = userId;
    if (!isPending && userId) void Promise.resolve().then(refreshCart);
  }, [isPending, refreshCart, userId]);

  const updateCart = useCallback(
    async (endpoint, options, successMessage) => {
      if (isPending || !userId || cartStatus !== 'ready' || cartUserId !== userId) {
        if (!userId && !isPending) {
          toast.error('Please sign in to use your shopping bag.');
        } else if (cartStatus === 'error') {
          toast.error('Your shopping bag is unavailable until the database reconnects.');
        }
        return false;
      }

      setCartStatus('loading');
      setCartError(null);
      try {
        const result = getCartData(await apiClient(endpoint, options));
        if (activeUserId.current !== userId) return false;

        setCart(result);
        setCartUserId(userId);
        setCartStatus('ready');
        if (successMessage) toast.success(successMessage);
        return true;
      } catch (error) {
        if (activeUserId.current === userId) {
          setCart(EMPTY_CART);
          setCartError(error);
          setCartStatus('error');
          console.error('Unable to update the authenticated shopping bag:', error);
          toast.error(error?.message || 'Unable to update your shopping bag.');
        }
        return false;
      }
    },
    [cartStatus, cartUserId, isPending, userId]
  );

  const addItem = useCallback(
    async ({ productId, variantSku, size, color, quantity = 1 }) => {
      const saved = await updateCart(
        '/cart/items',
        {
          method: 'POST',
          body: { productId, variantSku, size, color, quantity },
        },
        'Item added to your bag.'
      );

      if (saved) setIsDrawerOpen(true);
      return saved;
    },
    [updateCart]
  );

  const updateQuantity = useCallback(
    (variantSku, quantity) =>
      updateCart(`/cart/items/${encodeURIComponent(variantSku)}`, {
        method: 'PATCH',
        body: { quantity },
      }),
    [updateCart]
  );

  const removeItem = useCallback(
    (variantSku) =>
      updateCart(`/cart/items/${encodeURIComponent(variantSku)}`, {
        method: 'DELETE',
      }),
    [updateCart]
  );

  const clearCart = useCallback(
    () => updateCart('/cart', { method: 'DELETE' }, 'Shopping bag cleared.'),
    [updateCart]
  );

  const resetCart = useCallback(() => {
    if (!userId || isPending) return;
    setCart(EMPTY_CART);
    setCartUserId(userId);
    setCartStatus('ready');
    setCartError(null);
    setIsDrawerOpen(false);
  }, [isPending, userId]);

  const effectiveCartStatus = isPending
    ? 'loading'
    : !userId
      ? 'ready'
      : cartUserId === userId
        ? cartStatus
        : 'loading';
  const canShowCart = Boolean(userId && effectiveCartStatus === 'ready' && cartUserId === userId);
  const items = useMemo(() => (canShowCart ? cart.items : []), [canShowCart, cart.items]);
  const itemCount = canShowCart ? cart.totalQuantity : 0;
  const subtotal = canShowCart ? cart.subtotal : 0;

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      cartStatus: effectiveCartStatus,
      cartError,
      isAuthenticated: Boolean(userId && !isPending),
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      refreshCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      resetCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      isPending,
      effectiveCartStatus,
      cartError,
      userId,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      refreshCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      resetCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
