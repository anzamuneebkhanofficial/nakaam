'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatPKR } from '@/lib/format';
import { apiClient } from '@/lib/apiClient';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Upload,
  ArrowRight,
  Package,
  Calendar,
  Phone,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const BANK_DETAILS = {
  bankName: 'Meezan Bank Limited',
  accountTitle: 'Nakaam Store',
  accountNumber: '02010108923412',
  iban: 'PK45MEZN0002010108923412',
  raastId: '03001234567',
};

export function OrderSuccessContent({ orderId }) {
  const [copiedField, setCopiedField] = useState(null);
  const [txnRef, setTxnRef] = useState('');
  const [proofSubmitted, setProofSubmitted] = useState(false);

  // Fetch Order
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      try {
        return await apiClient(`/orders/${orderId}`);
      } catch {
        return null;
      }
    },
    staleTime: 30 * 1000,
  });
  const { data: publicSettings } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: async () => apiClient('/settings/public'),
    staleTime: 5 * 60 * 1000,
  });

  // Submit Payment Proof Mutation
  const proofMutation = useMutation({
    mutationFn: async ({ via, ref }) => {
      return await apiClient(`/orders/${orderId}/payment-proof`, {
        method: 'POST',
        body: JSON.stringify({ via, txnRef: ref }),
      });
    },
    onSuccess: () => {
      setProofSubmitted(true);
      toast.success('Payment receipt submitted! Our accounts team will verify shortly.');
    },
  });

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F2EC]">
        <AnnouncementBar />
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[#151515] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F2EC]">
        <AnnouncementBar />
        <Header />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold font-jakarta text-[#151515]">Order Not Found</h1>
          <p className="text-xs text-[#6B6B6B]">We could not retrieve details for order #{orderId}.</p>
          <Button variant="primary" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isCOD = order.paymentMethod === 'COD';
  const orderNumber = order.orderNumber || orderId;
  const grandTotal = order.pricing?.total || order.payment?.amountDue || 0;

  const whatsappMessage = encodeURIComponent(
    `Hello Nakaam Team! I would like to confirm my order #${orderNumber} for ${formatPKR(
      grandTotal
    )}. Please dispatch soon.`
  );
  const whatsappNumber =
    publicSettings?.whatsappNumber || process.env.NEXT_PUBLIC_STORE_WHATSAPP || '';
  const whatsappDigits = String(whatsappNumber).replace(/\D/g, '');
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${whatsappMessage}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-[#151515]">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {isCOD ? (
          /* ======================================================== */
          /* SCREEN 32: Order Success (COD) & Doorstep Tracker        */
          /* ======================================================== */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Success Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E6E1DA] shadow-xs text-center space-y-4">
              <div className="w-18 h-18 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Order Successfully Placed
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#151515] pt-2">
                  Thank You, {order.shippingAddress?.fullName}
                </h1>
                <p className="text-sm text-[#6B6B6B] max-w-md mx-auto">
                  Your order is booked with Cash on Delivery. Prepare the exact cash amount for our rider.
                </p>
              </div>

              {/* Order Number & Amount Block */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F6F2EC] border border-[#E6E1DA] flex items-center justify-between mt-4">
                <div className="text-left">
                  <p className="text-[11px] text-[#6B6B6B] uppercase tracking-wider font-semibold">
                    Order Reference
                  </p>
                  <p className="font-mono text-base font-bold text-[#151515]">{orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#6B6B6B] uppercase tracking-wider font-semibold">
                    Cash Due on Doorstep
                  </p>
                  <p className="font-serif text-xl font-bold text-[#D12C2F] tabular-nums">
                    {formatPKR(grandTotal)}
                  </p>
                </div>
              </div>

              {/* WhatsApp Fast Confirmation CTA */}
              <div className="pt-2">
                {whatsappUrl ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full max-w-md h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white border-none font-bold"
                    onClick={() => window.open(whatsappUrl, '_blank')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Confirm Instant Dispatch on WhatsApp
                  </Button>
                ) : (
                  <p className="text-xs text-[#6B6B6B]">
                    WhatsApp contact is unavailable. Please submit your request in the app.
                  </p>
                )}
              </div>
            </div>

            {/* Doorstep Open-Box Inspection Policy Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-[#D12C2F] flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs text-[#3A3A3A] leading-relaxed">
                <h3 className="font-bold text-sm text-[#151515] uppercase tracking-wider">
                  Doorstep Open-Box Inspection Protocol
                </h3>
                <p>
                  Our courier rider is instructed to hand over the parcel for your inspection before accepting cash.
                  Verify the fabric cut, color authenticity under natural light, and master tailoring. If anything fails your standard, decline the parcel on the spot with zero charge.
                </p>
              </div>
            </div>

            {/* Live Progress Milestones Timeline */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
              <h2 className="font-serif text-lg font-bold text-[#151515] pb-3 border-b border-[#E6E1DA] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#151515]" />
                Order Status
              </h2>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E6E1DA]">
                {/* Step 1 */}
                <div className="relative flex items-start gap-4">
                  <span className="absolute -left-6 sm:-left-8 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#151515]">Order Placed</h4>
                    <p className="text-xs text-[#6B6B6B]">Order received and confirmed</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-start gap-4">
                  <span className="absolute -left-6 sm:-left-8 w-5 h-5 rounded-full bg-[#151515] text-white flex items-center justify-center ring-4 ring-white">
                    <Clock className="w-3 h-3" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#151515]">Quality Check & Packaging</h4>
                    <p className="text-xs text-[#6B6B6B]">Verifying items and preparing package</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-start gap-4 opacity-50">
                  <span className="absolute -left-6 sm:-left-8 w-5 h-5 rounded-full bg-[#E6E1DA] text-[#6B6B6B] flex items-center justify-center ring-4 ring-white">
                    <Truck className="w-3 h-3" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#151515]">Dispatched via Courier</h4>
                    <p className="text-xs text-[#6B6B6B]">
                      {order.delivery?.courier || 'TCS'} tracking will be SMSed to {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex items-start gap-4 opacity-50">
                  <span className="absolute -left-6 sm:-left-8 w-5 h-5 rounded-full bg-[#E6E1DA] text-[#6B6B6B] flex items-center justify-center ring-4 ring-white">
                    <ShieldCheck className="w-3 h-3" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#151515]">Doorstep Open-Box Handover</h4>
                    <p className="text-xs text-[#6B6B6B]">Inspect in person and pay cash</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* SCREEN 17: Order Success (Manual Payment / Raast Transfer) */
          /* ======================================================== */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Warning Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E6E1DA] shadow-xs text-center space-y-4">
              <div className="w-18 h-18 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Clock className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Awaiting Payment Transfer
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#151515] pt-2">
                  Order Booked: #{orderNumber}
                </h1>
                <p className="text-sm text-[#6B6B6B] max-w-md mx-auto">
                  Please transfer <strong className="text-[#151515]">{formatPKR(grandTotal)}</strong> to the store bank account below within 24 hours to secure your reserved items.
                </p>
              </div>

              {/* Exact Amount Block */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F6F2EC] border border-[#E6E1DA] flex items-center justify-between mt-4">
                <div className="text-left">
                  <p className="text-[11px] text-[#6B6B6B] uppercase tracking-wider font-semibold">
                    Amount to Transfer
                  </p>
                  <p className="font-serif text-2xl font-bold text-[#151515] tabular-nums">
                    {formatPKR(grandTotal)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#6B6B6B] uppercase tracking-wider font-semibold">
                    Payment Window
                  </p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    24 Hours Left
                  </span>
                </div>
              </div>
            </div>

            {/* Bank & Raast Details Copy Cards */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <h2 className="font-serif text-lg font-bold text-[#151515]">
                  Bank Account Details
                </h2>
                <span className="text-xs text-[#8F1A1E] font-semibold">
                  Tap to copy any field
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 bg-[#F6F2EC] rounded-xl border border-[#E6E1DA] space-y-1">
                  <p className="text-[#6B6B6B]">Bank Name</p>
                  <p className="font-bold text-sm text-[#151515]">{BANK_DETAILS.bankName}</p>
                </div>

                <div className="p-4 bg-[#F6F2EC] rounded-xl border border-[#E6E1DA] space-y-1">
                  <p className="text-[#6B6B6B]">Account Title</p>
                  <p className="font-bold text-sm text-[#151515]">{BANK_DETAILS.accountTitle}</p>
                </div>

                <div className="p-4 bg-[#F6F2EC] rounded-xl border border-[#E6E1DA] flex items-center justify-between">
                  <div>
                    <p className="text-[#6B6B6B]">Account Number</p>
                    <p className="font-bold font-mono text-sm text-[#151515]">{BANK_DETAILS.accountNumber}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(BANK_DETAILS.accountNumber, 'Account Number')}
                    className="p-2 text-[#6B6B6B] hover:text-[#151515] hover:bg-white rounded-lg transition-colors"
                  >
                    {copiedField === 'Account Number' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-4 bg-[#F6F2EC] rounded-xl border border-[#E6E1DA] flex items-center justify-between">
                  <div>
                    <p className="text-[#6B6B6B]">Raast Instant ID</p>
                    <p className="font-bold font-mono text-sm text-[#151515]">{BANK_DETAILS.raastId}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(BANK_DETAILS.raastId, 'Raast ID')}
                    className="p-2 text-[#6B6B6B] hover:text-[#151515] hover:bg-white rounded-lg transition-colors"
                  >
                    {copiedField === 'Raast ID' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F6F2EC] rounded-xl border border-[#E6E1DA] flex items-center justify-between text-xs">
                <div>
                  <p className="text-[#6B6B6B]">IBAN</p>
                  <p className="font-bold font-mono text-xs text-[#151515]">{BANK_DETAILS.iban}</p>
                </div>
                <button
                  onClick={() => handleCopy(BANK_DETAILS.iban, 'IBAN')}
                  className="p-2 text-[#6B6B6B] hover:text-[#151515] hover:bg-white rounded-lg transition-colors"
                >
                  {copiedField === 'IBAN' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Proof Submission Form */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
              <h3 className="font-serif text-lg font-bold text-[#151515] pb-3 border-b border-[#E6E1DA]">
                Submit Payment Confirmation
              </h3>

              {proofSubmitted ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-900">Proof Submitted Successfully</h4>
                  <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                    Our financial verification desk is reviewing your payment. You will receive an SMS confirmation once verified.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#151515]">
                      Transaction Reference ID (From your banking app / SMS)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. 261019283741 or MEZN9912"
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                      className="h-11 text-sm font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="primary"
                      className="h-12 text-xs font-bold"
                      isLoading={proofMutation.isPending}
                      onClick={() => {
                        if (!txnRef.trim()) {
                          toast.error('Please enter the transaction reference ID');
                          return;
                        }
                        proofMutation.mutate({ via: 'upload', ref: txnRef });
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Reference in App
                    </Button>

                    {whatsappUrl ? (
                      <Button
                        variant="secondary"
                        className="h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white border-none text-xs font-bold"
                        onClick={() => {
                          proofMutation.mutate({ via: 'whatsapp', ref: txnRef || 'WhatsApp direct' });
                          window.open(whatsappUrl, '_blank');
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Receipt via WhatsApp
                      </Button>
                    ) : (
                      <p className="text-xs text-[#6B6B6B]">
                        WhatsApp contact is unavailable. Submit your receipt reference in the app.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back to Home CTA */}
        <div className="pt-8 text-center">
          <Button variant="outline" size="lg">
            <Link href="/shop" className="flex items-center gap-2">
              Continue Exploring Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
