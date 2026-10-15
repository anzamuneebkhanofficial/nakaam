'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { setRoleCookie } from '@/lib/authClient';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [isVerifying, setIsVerifying] = useState(Boolean(token));
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // If token is present, attempt verification automatically
  useEffect(() => {
    if (!token) return;

    async function verifyToken() {
      setIsVerifying(true);
      try {
        await apiClient(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setRoleCookie('user');
        setIsVerified(true);
        toast.success('Email verified successfully! Taking you to your account...');
        // Smooth transition to user dashboard
        setTimeout(() => {
          router.push('/user');
        }, 1500);
      } catch (err) {
        toast.error(err.message || 'Verification link expired or invalid');
      } finally {
        setIsVerifying(false);
      }
    }

    verifyToken();
  }, [router, token]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address required to resend verification');
      return;
    }
    setIsResending(true);
    try {
      await apiClient('/auth/send-verification-email', {
        method: 'POST',
        body: { email },
      });
      toast.success('Verification link resent to your email');
      setCountdown(60); // 60s cooldown
    } catch (err) {
      toast.error(err.message || 'Could not resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="shadow-xs text-center">
      <CardHeader className="pb-4">
        <div className="w-12 h-12 rounded-full bg-[#FCEEEE] text-[#D12C2F] mx-auto mb-3 flex items-center justify-center">
          {isVerified ? <CheckCircle2 className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
        </div>
        <CardTitle className="text-2xl font-bold font-jakarta">
          {isVerified ? 'Email Verified' : 'Check Your Inbox'}
        </CardTitle>
        <CardDescription>
          {isVerified ? (
            'Your Nakaam account is active. You can now log in and complete orders.'
          ) : (
            <>
              We sent a verification link to{' '}
              <strong className="text-[#151515] font-semibold">{email || 'your email address'}</strong>.
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isVerifying ? (
          <p className="text-sm text-[#6B6B6B] animate-pulse">Verifying your token...</p>
        ) : isVerified ? (
          <Button variant="primary" className="w-full" asChild>
            <Link href="/user">Go to User Dashboard</Link>
          </Button>
        ) : (
          <>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Click the link in the message to activate your doorstep delivery privilege. If you don&apos;t see it, check your spam or promotional folder.
            </p>

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                isLoading={isResending}
              >
                {countdown > 0 ? (
                  `Resend Link (${countdown}s)`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" /> Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t border-[#E6E1DA]">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#151515] hover:text-[#D12C2F] underline underline-offset-2"
              >
                Return to Sign In
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Card className="p-8 text-center text-sm text-[#6B6B6B]">Loading verification...</Card>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
