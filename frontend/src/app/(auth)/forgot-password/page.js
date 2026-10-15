'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/apiClient';
import { KeyRound, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email address is required'),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await apiClient('/auth/forget-password', {
        method: 'POST',
        body: {
          email: data.email.toLowerCase(),
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Password reset link sent if account exists');
    } catch (err) {
      toast.error(err.message || 'Could not send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xs">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-full bg-[#FCEEEE] text-[#D12C2F] mx-auto mb-3 flex items-center justify-center">
          {isSubmitted ? <CheckCircle2 className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
        </div>
        <CardTitle className="text-2xl font-bold font-jakarta">
          {isSubmitted ? 'Reset Link Dispatched' : 'Forgot Password?'}
        </CardTitle>
        <CardDescription>
          {isSubmitted ? (
            <>
              We sent password reset instructions to{' '}
              <strong className="text-[#151515] font-semibold">{submittedEmail}</strong>.
            </>
          ) : (
            'Enter your registered email address and we will send you a secure link to reset your credentials.'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isSubmitted ? (
          <div className="space-y-4 text-center">
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              The reset link expires in 1 hour. If you don&apos;t receive an email within a few minutes, check your junk folder or try another address.
            </p>

            <div className="pt-2 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Try Another Email
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </div>
          </div>
        ) : (
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

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#E6E1DA] text-center">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#151515] hover:text-[#D12C2F] underline underline-offset-2"
              >
                Remembered your password? Sign In
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
