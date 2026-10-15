'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/apiClient';
import { LockKeyhole } from 'lucide-react';

const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your new password'),
});

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Missing password reset token');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient('/auth/reset-password', {
        method: 'POST',
        body: {
          newPassword: data.password,
          token,
        },
      });

      toast.success('Password updated successfully! Please sign in with your new credentials.');
      router.replace('/login');
    } catch (err) {
      toast.error(err.message || 'Invalid or expired reset token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xs">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-full bg-[#FCEEEE] text-[#D12C2F] mx-auto mb-3 flex items-center justify-center">
          <LockKeyhole className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold font-jakarta">Set New Password</CardTitle>
        <CardDescription>
          Choose a secure password of at least 8 characters for your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!token ? (
          <div className="text-center space-y-4">
            <p className="text-xs text-[#BA1A1A] font-medium">
              No reset token detected in this link. Please request a new link from the forgot password page.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/forgot-password">Request Reset Link</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#151515] uppercase tracking-wider mb-1">
                New Password
              </label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#151515] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Re-enter new password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Update Password
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#E6E1DA] text-center">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#151515] hover:text-[#D12C2F] underline underline-offset-2"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Card className="p-8 text-center text-sm text-[#6B6B6B]">Loading...</Card>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
