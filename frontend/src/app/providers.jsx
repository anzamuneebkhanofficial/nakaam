'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NextTopLoader from 'nextjs-toploader';
import { Toaster, toast } from 'sonner';

import { CartProvider } from '@/lib/cartContext';
import { QuickCartDrawer } from '@/components/cart/QuickCartDrawer';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute default
            gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            onError: (error) => {
              const msg = error?.message || 'An unexpected error occurred';
              toast.error(msg);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <NextTopLoader
          color="#D12C2F"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2.5}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D12C2F,0 0 5px #D12C2F"
        />
        <Toaster
          richColors
          position="top-right"
          duration={4000}
          closeButton
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E6E1DA',
              color: '#151515',
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            },
          }}
        />
        {children}
        <QuickCartDrawer />
      </CartProvider>
    </QueryClientProvider>
  );
}
