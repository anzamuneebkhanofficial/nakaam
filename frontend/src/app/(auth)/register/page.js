'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { signUp, setRoleCookie } from '@/lib/authClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck } from 'lucide-react';

const registerSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  phone: yup
    .string()
    .trim()
    .matches(
      /^((\+92)|(0092)|(92))?3[0-9]{9}$/,
      'Please enter a valid Pakistani mobile number (e.g. 03001234567)'
    )
    .required('Mobile number is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms of service'),
});

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      acceptTerms: true,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await signUp.email({
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone,
      });

      if (res.error) {
        toast.error(res.error.message || 'Registration failed');
        return;
      }

      if (res.data?.user) {
        const user = res.data.user;
        const role = user.role || 'user';

        setRoleCookie(role);

        // If email verification is required and user is not verified, send to /verify-email
        if (!user.emailVerified && role !== 'admin') {
          toast.success('Account created! Please check your email to verify your account.');
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          return;
        }

        toast.success('Account created successfully!');
        if (role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/user');
        }
        return;
      }

      toast.success('Account created! Please verify your email.');
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xs">
      <CardHeader className="text-center pb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-[#D12C2F] mx-auto mb-2" />
        <CardTitle className="text-2xl font-bold font-jakarta">Create Your Account</CardTitle>
        <CardDescription>
          Unlock doorstep inspection, family sizing, and honest COD checkout.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#151515] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <Input
              placeholder="e.g. Muneeb Khan"
              autoComplete="name"
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

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
            <label className="block text-xs font-semibold text-[#151515] uppercase tracking-wider mb-1">
              Mobile Number (WhatsApp)
            </label>
            <Input
              type="tel"
              placeholder="0300 1234567"
              autoComplete="tel"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#151515] uppercase tracking-wider mb-1">
              Password
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
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="acceptTerms"
              className="mt-1 h-4 w-4 rounded-sm border-[#E6E1DA] text-[#151515] focus:ring-[#151515]"
              {...register('acceptTerms')}
            />
            <label htmlFor="acceptTerms" className="text-xs text-[#6B6B6B] leading-relaxed">
              I agree to the{' '}
              <Link href="/shipping-returns" className="text-[#151515] underline">
                Doorstep Inspection Policy
              </Link>{' '}
              and terms of service.
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-[#BA1A1A] font-medium">{errors.acceptTerms.message}</p>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E6E1DA] text-center">
          <p className="text-xs text-[#6B6B6B]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#151515] hover:text-[#D12C2F] underline underline-offset-2">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#D12C2F] shrink-0" />
          <p className="text-[11px] text-[#3A3A3A] leading-tight">
            <strong>Doorstep Guarantee:</strong> Your information is encrypted and protected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
