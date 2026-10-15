'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/orderStatus';
import { Button } from '@/components/ui/Button';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  X,
  Phone,
  MessageSquare,
  FileText,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

const EXCHANGE_REASONS = [
  'Size fits too tight (Need 1 size larger)',
  'Size fits too loose (Need 1 size smaller)',
  'Color looks different under room lighting',
  'Fabric feel or texture did not match expectation',
  'Minor stitching imperfection observed',
  'Other Reason',
];

export function OrderDetailContent({ orderId, initialAction = '' }) {
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [exchangeReason, setExchangeReason] = useState(EXCHANGE_REASONS[0]);
  const [exchangeNotes, setExchangeNotes] = useState('');
  const [exchangeSubmitted, setExchangeSubmitted] = useState(false);
  const [exchangeTicketNo, setExchangeTicketNo] = useState(null);

  // Delivery Modal State (Two-Tab Hub: Report Issue OR Confirm Delivery)
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryActionDismissed, setDeliveryActionDismissed] = useState(false);
  const [deliveryTab, setDeliveryTab] = useState(initialAction === 'report' ? 'report' : 'confirm');
  const [deliveryIssueType, setDeliveryIssueType] = useState('delayed');
  const [deliveryIssueMessage, setDeliveryIssueMessage] = useState('');
  const [deliveryIssuePhone, setDeliveryIssuePhone] = useState('');
  const [deliveryIssueContactMethod, setDeliveryIssueContactMethod] = useState('whatsapp');
  const [deliveryIssueSubmitted, setDeliveryIssueSubmitted] = useState(false);
  const [deliveryConfirmationNotes, setDeliveryConfirmationNotes] = useState('');
  const [deliveryConfirmedSubmitted, setDeliveryConfirmedSubmitted] = useState(false);

  // Fetch Order
  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => await apiClient(`/orders/${orderId}`),
    staleTime: 30 * 1000,
  });
  const { data: publicSettings } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: async () => apiClient('/settings/public'),
    staleTime: 5 * 60 * 1000,
  });
  const storeWhatsappNumber =
    publicSettings?.whatsappNumber || process.env.NEXT_PUBLIC_STORE_WHATSAPP || '';
  const canConfirmReceipt = ['dispatched', 'out_for_delivery'].includes(order?.status);

  const closeDeliveryModal = () => {
    setDeliveryModalOpen(false);
    setDeliveryActionDismissed(true);
  };
  const isDeliveryModalOpen = Boolean(order) && (
    deliveryModalOpen || (initialAction === 'report' && !deliveryActionDismissed)
  );

  const deliveryReportMutation = useMutation({
    mutationFn: async () =>
      apiClient(`/delivery/orders/${order.orderNumber || order._id}/reports`, {
        method: 'POST',
        body: {
          issueType: deliveryIssueType,
          message: deliveryIssueMessage,
          contactPhone: deliveryIssuePhone || order.shippingAddress?.phone || '03000000000',
          preferredContactMethod: deliveryIssueContactMethod,
        },
      }),
    onSuccess: () => {
      setDeliveryIssueSubmitted(true);
      closeDeliveryModal();
      toast.success('Delivery issue report submitted. Our team will contact you promptly.');
      refetch();
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to submit delivery report. Please try again.');
    },
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: async () =>
      apiClient(`/orders/${order.orderNumber || order._id}/confirm-delivery`, {
        method: 'POST',
        body: {
          notes: deliveryConfirmationNotes || 'Customer received order successfully',
        },
      }),
    onSuccess: () => {
      setDeliveryConfirmedSubmitted(true);
      closeDeliveryModal();
      toast.success('Alhamdulillah! Delivery confirmed. Your order status is now Delivered.');
      refetch();
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to confirm delivery. Please try again.');
    },
  });

  const handleDeliveryReportSubmit = (e) => {
    e.preventDefault();
    if (!deliveryIssueMessage.trim()) {
      toast.error('Please enter details of the delivery issue.');
      return;
    }

    if (deliveryIssueContactMethod === 'whatsapp') {
      const waText = encodeURIComponent(
        `Assalam-o-Alaikum! I have an issue regarding my order #${order.orderNumber}.\nIssue Type: ${deliveryIssueType}\nNote: ${deliveryIssueMessage}\nContact: ${deliveryIssuePhone || order.shippingAddress?.phone}`
      );
      if (storeWhatsappNumber) {
        window.open(`https://wa.me/${storeWhatsappNumber.replace(/\D/g, '')}?text=${waText}`, '_blank');
      }
    }

    deliveryReportMutation.mutate();
  };

  const handleConfirmDeliverySubmit = (e) => {
    e.preventDefault();

    if (deliveryIssueContactMethod === 'whatsapp') {
      const waText = encodeURIComponent(
        `Assalam-o-Alaikum Nakaam Team! I have safely received my order #${order.orderNumber} in ${order.shippingAddress?.city}.\nCustomer: ${order.shippingAddress?.fullName}\nNote: ${deliveryConfirmationNotes || 'Parcel received and inspected at doorstep.'}`
      );
      if (storeWhatsappNumber) {
        window.open(`https://wa.me/${storeWhatsappNumber.replace(/\D/g, '')}?text=${waText}`, '_blank');
      }
    }

    confirmDeliveryMutation.mutate();
  };


  const exchangeMutation = useMutation({
    mutationFn: async () =>
      apiClient('/complaints', {
        method: 'POST',
        body: {
          category: 'refund',
          orderId: order._id,
          orderNumber: order.orderNumber,
          subject: `Return or exchange inquiry for ${order.orderNumber}`,
          message: [
            `Order: ${order.orderNumber}`,
            `Reason: ${exchangeReason}`,
            `Requested change or notes: ${exchangeNotes.trim() || 'Not provided'}`,
          ].join('\n'),
        },
      }),
    onSuccess: (ticket) => {
      const ticketNo = ticket?.ticketNo || null;
      setExchangeTicketNo(ticketNo);
      setExchangeSubmitted(true);
      setExchangeModalOpen(false);
      toast.success(
        ticketNo
          ? `Inquiry sent to customer support. Reference: ${ticketNo}`
          : 'Return or exchange inquiry sent to customer support.'
      );
    },
    onError: (submitError) => {
      toast.error(submitError?.message || 'Unable to submit this inquiry. Please try again.');
    },
  });

  const handleExchangeSubmit = (e) => {
    e.preventDefault();
    exchangeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#151515] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4 bg-white rounded-2xl border border-[#E6E1DA]">
        {isError ? (
          <>
            <h1 className="text-2xl font-bold font-jakarta text-[#151515]">Unable to Load Order</h1>
            <p role="alert" className="text-xs text-[#6B6B6B]">
              {error?.message || 'Please try again.'}
            </p>
            <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold font-jakarta text-[#151515]">Order Not Found</h1>
            <p className="text-xs text-[#6B6B6B]">We could not locate records for this order ID.</p>
            <Button variant="primary" asChild>
              <Link href="/user/orders">Back to Orders</Link>
            </Button>
          </>
        )}
      </div>
    );
  }

  const statusHistory = (order.statusHistory || []).filter(
    (entry, index, history) => index === 0 || entry.status !== history[index - 1].status
  );

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#151515]">
                {order.orderNumber}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#FCEEEE] text-[#8F1A1E]">
                {order.paymentMethod === 'COD' ? 'COD Order' : 'Bank Transfer'}
              </span>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Booked on {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {canConfirmReceipt && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setDeliveryTab('confirm');
                  setDeliveryModalOpen(true);
                }}
                className="font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Confirm Received
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeliveryIssuePhone(order.shippingAddress?.phone || '');
                setDeliveryTab('report');
                setDeliveryModalOpen(true);
              }}
              className="font-bold border-[#E6E1DA] text-[#8F1A1E] hover:bg-[#FCEEEE]/50"
            >
              <Truck className="w-4 h-4 mr-1.5" />
              Delivery Hub & Issue
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExchangeModalOpen(true)}
              className="font-bold border-[#E6E1DA]"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Request Size Exchange
            </Button>
          </div>
        </div>

        {deliveryConfirmedSubmitted && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>
              Alhamdulillah! You have confirmed delivery of your order. The parcel is recorded as successfully received.
            </span>
          </div>
        )}

        {deliveryIssueSubmitted && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              Your delivery issue report was recorded. Our concierge desk is investigating with the courier partner.
            </span>
          </div>
        )}

        {exchangeSubmitted && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Your return or exchange inquiry was sent to customer support.
              {exchangeTicketNo ? ` Reference: ${exchangeTicketNo}.` : ''}
              {' '}Pickup and eligibility are not confirmed until support reviews it.
            </span>
          </div>
        )}

        <section className="rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] p-4 space-y-3" aria-labelledby="order-progress-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="order-progress-heading" className="font-serif text-base font-bold text-[#151515]">
              Order Progress
            </h3>
            <span className="rounded-full border border-[#E6E1DA] bg-white px-3 py-1 text-xs font-bold text-[#151515]">
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-xs text-[#3A3A3A]">
            Payment: <strong>{getPaymentStatusLabel(order.payment?.status)}</strong>
            {order.paymentMethod === 'COD' && order.payment?.status === 'cod_pending'
              ? ' — cash is due to the courier on delivery.'
              : ''}
          </p>
          {order.delivery?.trackingNumber && (
            <p className="text-xs text-[#3A3A3A]">
              Courier: <strong>{order.delivery.courier || 'Courier'}</strong>
              {' • '}Tracking number: <strong className="font-mono">{order.delivery.trackingNumber}</strong>
            </p>
          )}
          {statusHistory.length > 0 && (
            <ol className="space-y-2 border-l border-[#D6CEC3] pl-4">
              {[...statusHistory].reverse().map((entry, index) => (
                <li key={`${entry.status}-${entry.at || index}`} className="text-xs">
                  <p className="font-semibold text-[#151515]">{getOrderStatusLabel(entry.status)}</p>
                  <p className="text-[#6B6B6B]">
                    {entry.at ? new Date(entry.at).toLocaleString('en-PK') : 'Status recorded'}
                    {entry.note ? ` — ${entry.note}` : ''}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-[#151515]">Order Summary & Items</h3>
          <div className="divide-y divide-[#E6E1DA] border border-[#E6E1DA] rounded-xl overflow-hidden">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-4 flex gap-4 items-center bg-white">
                <div className="relative w-16 h-20 rounded-lg bg-[#F6F2EC] border border-[#E6E1DA] overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs space-y-1">
                  <p className="font-bold text-sm text-[#151515] truncate">{item.name}</p>
                  <p className="text-[#6B6B6B]">Size: {item.size} • Color: {item.color || 'True Colour'}</p>
                  <p className="text-[#6B6B6B]">Qty: {item.quantity} × {formatPKR(item.unitPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#151515] tabular-nums">
                    {formatPKR(item.lineTotal || item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Shipping Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Shipping Destination */}
          <div className="p-4 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[#151515]">Shipping Destination</h4>
            <p className="font-bold text-[#151515]">{order.shippingAddress?.fullName}</p>
            <p className="text-[#3A3A3A] leading-relaxed">{order.shippingAddress?.street}</p>
            <p className="text-[#151515] font-semibold">{order.shippingAddress?.city}</p>
            <p className="text-[#6B6B6B] flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {order.shippingAddress?.phone}
            </p>
          </div>

          {/* Amount Due Breakdown */}
          <div className="p-4 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[#151515]">Payment Breakdown</h4>
            <div className="flex justify-between text-[#3A3A3A]">
              <span>Method</span>
              <span className="font-semibold">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}</span>
            </div>
            <div className="flex justify-between text-[#3A3A3A]">
              <span>Payment Status</span>
              <span className="font-semibold">{getPaymentStatusLabel(order.payment?.status)}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[#3A3A3A]">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums">{formatPKR(order.pricing?.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#3A3A3A]">
                <span>Delivery Fee</span>
                <span className="font-semibold tabular-nums">
                  {order.pricing?.deliveryFee === 0 ? 'FREE' : formatPKR(order.pricing?.deliveryFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E6E1DA] flex justify-between font-bold text-sm text-[#151515]">
                <span>Total Amount</span>
                <span className="tabular-nums font-serif text-base">{formatPKR(order.pricing?.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doorstep Inspection Assurance */}
        <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] flex items-start gap-3 text-xs text-[#3A3A3A]">
          <ShieldCheck className="w-5 h-5 text-[#D12C2F] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Doorstep Open-Box Inspection:</strong> When our courier arrives, inspect this parcel open-box before payment. Exchange claims can be logged within 7 days of delivery.
          </p>
        </div>
      </div>

      {/* Exchange Modal */}
      {exchangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#151515]/45 backdrop-blur-[2px]" onClick={() => setExchangeModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E6E1DA] shadow-xl p-6 sm:p-8 z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
              <h3 className="font-serif text-xl font-bold text-[#151515]">Contact support about an exchange</h3>
              <button onClick={() => setExchangeModalOpen(false)} className="text-[#6B6B6B] hover:text-[#151515] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExchangeSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Reason for Exchange *</label>
                <select
                  value={exchangeReason}
                  onChange={(e) => setExchangeReason(e.target.value)}
                  className="w-full h-11 px-3 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515]"
                >
                  {EXCHANGE_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Requested Size / Specific Tailoring Note</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please swap size M for size L. Or specify sleeve length adjustments."
                  value={exchangeNotes}
                  onChange={(e) => setExchangeNotes(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515] focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-[#6B6B6B]">
                This sends an inquiry to customer support. Pickup and eligibility are confirmed only after review.
              </p>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setExchangeModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 font-bold" disabled={exchangeMutation.isPending}>
                  {exchangeMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-Area Delivery Hub Modal (Area 1: Confirm Received, Area 2: Report Issue) */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#151515]/45 backdrop-blur-[2px]" onClick={closeDeliveryModal} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E6E1DA] shadow-xl p-6 sm:p-8 z-10 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#8F1A1E]" />
                <h3 className="font-serif text-xl font-bold text-[#151515]">
                  Doorstep Delivery Hub
                </h3>
              </div>
              <button onClick={closeDeliveryModal} className="text-[#6B6B6B] hover:text-[#151515] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Two Tabs: 1. Confirm Delivery Received, 2. Report Issue */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA]">
              <button
                type="button"
                disabled={!canConfirmReceipt}
                onClick={() => setDeliveryTab('confirm')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                  deliveryTab === 'confirm'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-[#6B6B6B] hover:text-[#151515]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Parcel Received</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryTab('report')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  deliveryTab === 'report'
                    ? 'bg-white text-[#8F1A1E] shadow-xs'
                    : 'text-[#6B6B6B] hover:text-[#151515]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#8F1A1E]" />
                <span>Report Issue</span>
              </button>
            </div>

            {/* AREA 1: CONFIRM PARCEL RECEIVED */}
            {deliveryTab === 'confirm' && (
              <form onSubmit={handleConfirmDeliverySubmit} className="space-y-4 animate-in fade-in-50 duration-150">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Have you received and inspected your order?</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Confirming updates your order status to <strong>Delivered</strong> immediately across the customer and admin dashboards. If this was a COD order, your cash payment is marked received.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Delivery Experience & Rider Feedback (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Rider arrived on time, parcel packaging was in pristine condition."
                    value={deliveryConfirmationNotes}
                    onChange={(e) => setDeliveryConfirmationNotes(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#151515]">Notify Concierge Desk</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryIssueContactMethod('whatsapp')}
                      className={`h-10 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                        deliveryIssueContactMethod === 'whatsapp'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-[#E6E1DA] bg-white text-[#6B6B6B]'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Sync via WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryIssueContactMethod('portal')}
                      className={`h-10 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                        deliveryIssueContactMethod === 'portal'
                          ? 'border-[#151515] bg-[#151515] text-white font-bold'
                          : 'border-[#E6E1DA] bg-white text-[#6B6B6B]'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Portal Only</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" onClick={closeDeliveryModal} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                    disabled={confirmDeliveryMutation.isPending}
                  >
                    {confirmDeliveryMutation.isPending ? 'Confirming…' : 'Yes, Order Delivered'}
                  </Button>
                </div>
              </form>
            )}

            {/* AREA 2: REPORT DELIVERY ISSUE */}
            {deliveryTab === 'report' && (
              <form onSubmit={handleDeliveryReportSubmit} className="space-y-4 animate-in fade-in-50 duration-150">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Nature of Issue *</label>
                  <select
                    value={deliveryIssueType}
                    onChange={(e) => setDeliveryIssueType(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515]"
                  >
                    <option value="delayed">Rider Delayed / Past Promised ETA</option>
                    <option value="courier_unreachable">Courier Unreachable / False Fake Attempt</option>
                    <option value="wrong_address">Incorrect Delivery Address or Area</option>
                    <option value="damaged">Outer Packaging Damaged Upon Arrival</option>
                    <option value="other">Other Courier Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Contact Phone for Dispatch Desk *</label>
                  <input
                    type="tel"
                    placeholder="0300 1234567"
                    value={deliveryIssuePhone}
                    onChange={(e) => setDeliveryIssuePhone(e.target.value)}
                    required
                    className="w-full h-11 px-3 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Preferred Resolution Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['whatsapp', 'call', 'email'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setDeliveryIssueContactMethod(method)}
                        className={`h-9 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          deliveryIssueContactMethod === method
                            ? 'border-[#151515] bg-[#151515] text-white'
                            : 'border-[#E6E1DA] bg-white text-[#6B6B6B]'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Issue Details & Rider Notes *</label>
                  <textarea
                    rows={3}
                    placeholder="Please describe what happened (e.g. rider called once and marked uncontactable, or parcel delayed by 3 days)."
                    value={deliveryIssueMessage}
                    onChange={(e) => setDeliveryIssueMessage(e.target.value)}
                    required
                    className="w-full p-3 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" onClick={closeDeliveryModal} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 font-bold bg-[#8F1A1E] hover:bg-[#A32024] text-white"
                    disabled={deliveryReportMutation.isPending}
                  >
                    {deliveryReportMutation.isPending ? 'Submitting…' : 'Submit & WhatsApp'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
