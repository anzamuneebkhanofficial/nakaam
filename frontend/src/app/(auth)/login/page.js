'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { signIn, setRoleCookie } from '@/lib/authClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck } from 'lucide-react';

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean().default(true),
});

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await signIn.email({
        email: data.email.toLowerCase(),
        password: data.password,
        dontRememberMe: !data.rememberMe,
      });

      if (res.error) {
        if (res.error.message?.includes('verify') || res.error.status === 403) {
          toast.error('Email verification required');
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          return;
        }
        toast.error(res.error.message || 'Invalid email or password');
        return;
      }

      toast.success('Signed in successfully');

      // Persist role cookie for instant edge middleware evaluation
      const user = res.data?.user;
      const role = user?.role || 'user';
      setRoleCookie(role);

      if (role === 'admin') {
        router.replace(nextUrl !== '/' ? nextUrl : '/admin');
      } else {
        router.replace(nextUrl !== '/' ? nextUrl : '/user');
      }
    } catch (err) {
      toast.error(err.message || 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xs">
      <CardHeader className="text-center pb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-[#D12C2F] mx-auto mb-2" />
        <CardTitle className="text-2xl font-bold font-jakarta">Sign In to Nakaam</CardTitle>
        <CardDescription>
          Access your orders, saved measurements, and doorstep deliveries.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#151515] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@domain.com"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#151515] uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#6B6B6B] hover:text-[#151515] underline underline-offset-2"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              className="h-4 w-4 rounded-sm border-[#E6E1DA] text-[#151515] focus:ring-[#151515]"
              {...register('rememberMe')}
            />
            <label htmlFor="rememberMe" className="text-xs text-[#6B6B6B]">
              Remember this device for 14 days
            </label>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E6E1DA] text-center">
          <p className="text-xs text-[#6B6B6B]">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="font-semibold text-[#151515] hover:text-[#D12C2F] underline underline-offset-2"
            >
              Create an Account
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#D12C2F] shrink-0" />
          <p className="text-[11px] text-[#3A3A3A] leading-tight">
            <strong>Security First:</strong> Encrypted sessions with strict cookie protection.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Card className="p-8 text-center text-sm text-[#6B6B6B]">Loading sign in...</Card>}>
      <LoginForm />
    </Suspense>
  );
}
