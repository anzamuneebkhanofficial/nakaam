'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { getOrderStatusLabel, getPaymentStatusLabel, ORDER_STATUS_OPTIONS } from '@/lib/orderStatus';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  Phone,
  MessageSquare,
  Truck,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Printer,
  ExternalLink,
  ShieldAlert,
  Clock,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminOrderDetailContent({ orderId }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [darziModalOpen, setDarziModalOpen] = useState(false);
  const [courierName, setCourierName] = useState('Lahore Express Rider');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusDraft, setStatusDraft] = useState(null);

  // 1. Fetch Order Details
  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: async () => {
      const res = await apiClient(`/admin/orders/${orderId}`);
      return res.data || res;
    },
  });

  // 2. Fetch Darzi Slip
  const { data: darziSlip } = useQuery({
    queryKey: ['admin', 'order', orderId, 'darzi-slip'],
    queryFn: async () => {
      const res = await apiClient(`/admin/orders/${orderId}/darzi-slip`);
      return res.data || res;
    },
    enabled: darziModalOpen,
  });

  // 3. Fetch WhatsApp Link
  const { data: whatsappData } = useQuery({
    queryKey: ['admin', 'order', orderId, 'whatsapp'],
    queryFn: async () => {
      const res = await apiClient(`/admin/orders/${orderId}/whatsapp-link`);
      return res.data || res;
    },
    enabled: !!order,
  });

  // Status Transition Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ status, note }) => {
      if (status === 'confirmed' && order?.paymentMethod === 'COD') {
        return await apiClient(`/admin/orders/${orderId}/confirm`, {
          method: 'POST',
          body: { via: 'admin' },
        });
      }

      return await apiClient(`/admin/orders/${orderId}/status`, {
        method: 'POST',
        body: { status, note },
      });
    },
    onSuccess: (data, variables) => {
      const savedStatus = data.status || variables.status;
      queryClient.setQueryData(['admin', 'order', orderId], data);
      setStatusDraft(null);
      toast.success(`Order status updated to ${getOrderStatusLabel(savedStatus)}`);
      queryClient.invalidateQueries(['admin', 'order', orderId]);
      queryClient.invalidateQueries(['admin', 'orders']);
    },
    onError: (err) => {
      toast.error(err.message || 'Status transition failed');
    },
  });

  // Payment Verification Mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async () => {
      return await apiClient(`/admin/orders/${orderId}/payment/verify`, {
        method: 'POST',
        body: { note: 'Verified by admin' },
      });
    },
    onSuccess: () => {
      toast.success('Payment receipt verified & order confirmed');
      queryClient.invalidateQueries(['admin', 'order', orderId]);
      queryClient.invalidateQueries(['admin', 'orders']);
    },
  });

  // Payment Rejection Mutation
  const rejectPaymentMutation = useMutation({
    mutationFn: async (reason) => {
      return await apiClient(`/admin/orders/${orderId}/payment/reject`, {
        method: 'POST',
        body: { reason },
      });
    },
    onSuccess: () => {
      toast.error('Payment proof rejected');
      queryClient.invalidateQueries(['admin', 'order', orderId]);
      queryClient.invalidateQueries(['admin', 'orders']);
    },
  });

  // Courier Dispatch Mutation
  const dispatchMutation = useMutation({
    mutationFn: async () => {
      return await apiClient(`/admin/orders/${orderId}/delivery`, {
        method: 'PATCH',
        body: { courier: courierName, trackingNumber, etaDays: 2 },
      });
    },
    onSuccess: () => {
      toast.success('Dispatch recorded and tracking assigned');
      queryClient.invalidateQueries(['admin', 'order', orderId]);
      queryClient.invalidateQueries(['admin', 'orders']);
    },
  });

  if (isLoading) {
    return <div className="text-xs text-[#6B6B6B] py-12 text-center">Loading order details...</div>;
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <p role="alert" className="text-sm text-[#8F1A1E]">
          {isError ? error?.message || 'Could not load this order.' : 'Order not found.'}
        </p>
        {isError && (
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const isProofSubmitted = order.payment?.status === 'proof_submitted';
  const isVerified = order.payment?.status === 'verified';
  const isCod = order.paymentMethod === 'COD';
  const selectedStatus = statusDraft?.orderId === orderId ? statusDraft.status : order.status;
  const hasUnsavedStatus = selectedStatus !== order.status;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="bg-white text-xs">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Orders
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#151515]">
                {order.orderNumber}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                order.status === 'delivered'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-[#151515] text-white'
              }`}>
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()} &bull; {order.shippingAddress?.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {whatsappData?.url && (
            <a href={whatsappData.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="bg-white text-xs text-emerald-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp Customer
              </Button>
            </a>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDarziModalOpen(true)}
            className="bg-white text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Tailoring Slip
          </Button>

          <div className="flex items-center gap-2">
            <select
              aria-label="Order fulfillment status"
              value={selectedStatus}
              onChange={(event) => setStatusDraft({ orderId, status: event.target.value })}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#151515] text-white"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              disabled={!hasUnsavedStatus || statusMutation.isPending}
              onClick={() => statusMutation.mutate({
                status: selectedStatus,
                note: 'Status updated by admin',
              })}
              className="text-xs font-semibold"
            >
              {statusMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Order Details (8 cols) + Verification/Dispatch (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Items, Address, Customer Note */}
        <div className="lg:col-span-8 space-y-6">
          {/* Items Card */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="font-serif text-base font-bold text-[#151515]">Order Items</h2>
            <div className="divide-y divide-[#E6E1DA]">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-lg bg-[#F6F2EC] border border-[#E6E1DA] overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-xs text-[#6B6B6B]">ناکام</div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-[#151515]">{item.name}</p>
                      <p className="text-[11px] text-[#6B6B6B] font-mono">
                        Size: <strong>{item.size}</strong> &bull; SKU: {item.variantSku}
                      </p>
                      <p className="text-[11px] text-[#6B6B6B]">Qty: {item.quantity}</p>
                    </div>
                  </div>

                  {order.statusHistory?.length > 0 && (
                    <section className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
                      <h2 className="font-serif text-base font-bold text-[#151515]">Order Status History</h2>
                      <ol className="space-y-3 border-l border-[#D6CEC3] pl-4">
                        {[...order.statusHistory].reverse().map((entry, index) => (
                          <li key={`${entry.status}-${entry.at || index}`} className="text-xs">
                            <p className="font-semibold text-[#151515]">{getOrderStatusLabel(entry.status)}</p>
                            <p className="text-[#6B6B6B]">
                              {entry.at ? new Date(entry.at).toLocaleString('en-PK') : 'Status recorded'}
                              {entry.note ? ` — ${entry.note}` : ''}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}
                  <div className="text-right font-mono font-bold text-xs text-[#151515]">
                    {formatPKR(item.lineTotal || item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-[#E6E1DA] space-y-1.5 text-xs text-[#6B6B6B]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-[#151515]">{formatPKR(order.pricing?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Nationwide Delivery Fee</span>
                <span className="font-mono text-[#151515]">
                  {order.pricing?.deliveryFee === 0 ? 'Free' : formatPKR(order.pricing?.deliveryFee || 250)}
                </span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-[#D12C2F]">
                  <span>Voucher Discount</span>
                  <span className="font-mono">- {formatPKR(order.pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#151515] pt-2 border-t border-[#E6E1DA]">
                <span>Total Amount</span>
                <span className="font-mono">{formatPKR(order.pricing?.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Delivery Address Card */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="font-serif text-base font-bold text-[#151515]">Recipient & Delivery Doorstep</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B6B6B]">Full Name & Contact</span>
                <p className="font-semibold text-[#151515]">{order.shippingAddress?.fullName}</p>
                <p className="font-mono text-[#151515]">{order.shippingAddress?.phone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#6B6B6B]">Destination Address</span>
                <p className="text-[#151515]">{order.shippingAddress?.street}</p>
                <p className="font-semibold text-[#151515]">{order.shippingAddress?.city}, Pakistan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Payment Proof & Courier Dispatch */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment & Proof Verification Card */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-[#151515]">Payment Verification</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isVerified ? 'bg-emerald-50 text-emerald-800' : 'bg-[#FCEEEE] text-[#8F1A1E]'
              }`}>
                {getPaymentStatusLabel(order.payment?.status)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <p>
                <strong>Method:</strong> {order.paymentMethod === 'MANUAL' ? 'Raast / Direct Bank' : 'Cash on Delivery'}
              </p>
              <p>
                <strong>Amount Due:</strong> {formatPKR(order.pricing?.total || 0)}
              </p>
              {isCod && order.payment?.status === 'cod_pending' && (
                <p className="text-[#6B6B6B]">
                  Cash is due to the courier on delivery. Confirming the COD order does not mark payment as collected.
                </p>
              )}
            </div>

            {/* Raast Uploaded Proof Preview */}
            {order.payment?.proof?.imageUrl ? (
              <div className="space-y-2 pt-2 border-t border-[#E6E1DA]">
                <span className="text-[10px] font-bold uppercase text-[#6B6B6B] block">
                  Uploaded Transaction Receipt
                </span>
                <a href={order.payment.proof.imageUrl} target="_blank" rel="noopener noreferrer">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#E6E1DA] bg-[#F6F2EC]">
                    <img
                      src={order.payment.proof.imageUrl}
                      alt="Payment Receipt"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </a>
                {order.payment.proof.txnRef && (
                  <p className="text-xs font-mono font-bold text-[#151515]">
                    Ref: {order.payment.proof.txnRef}
                  </p>
                )}
              </div>
            ) : isProofSubmitted ? (
              <div className="p-3 rounded-xl bg-[#F6F2EC] text-xs text-[#6B6B6B]">
                Receipt marked as sent via WhatsApp.
              </div>
            ) : null}

            {/* Action Buttons for Verification */}
            {!isVerified && !isCod && (
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => verifyPaymentMutation.mutate()}
                  disabled={verifyPaymentMutation.isPending}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  Approve Proof
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const reason = prompt('Reason for rejection:');
                    if (reason) rejectPaymentMutation.mutate(reason);
                  }}
                  className="text-xs text-[#8F1A1E] border-rose-200"
                >
                  Reject
                </Button>
              </div>
            )}
          </div>

          {/* Courier & Rider Dispatch Card */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="font-serif text-base font-bold text-[#151515]">Courier Dispatch</h2>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#151515]">Courier / Rider Partner</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515]"
                >
                  <option value="Lahore Express Rider">Lahore Express Rider (Local Hub)</option>
                  <option value="TCS Logistics">TCS Air Express (National)</option>
                  <option value="Leopards Courier">Leopards Courier</option>
                  <option value="Call Courier">Call Courier</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#151515]">Consignment / Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. 774892104"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs font-mono"
                />
              </div>

              <Button
                type="button"
                onClick={() => dispatchMutation.mutate()}
                disabled={dispatchMutation.isPending}
                className="w-full bg-[#151515] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Mark Dispatched</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Darzi Workshop Cutting Slip Modal */}
      {darziModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D12C2F]" />
                <h3 className="font-serif text-lg font-bold text-[#151515]">
                  Workshop Tailoring Slip
                </h3>
              </div>
              <button type="button" onClick={() => setDarziModalOpen(false)}>
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#151515] bg-[#F6F2EC] p-4 rounded-xl border border-[#E6E1DA]">
              <p><strong>ORDER NO:</strong> {order.orderNumber}</p>
              <p><strong>CUSTOMER:</strong> {order.shippingAddress?.fullName}</p>
              <p><strong>DESTINATION:</strong> {order.shippingAddress?.city}</p>
              <div className="pt-2 border-t border-[#E6E1DA] space-y-1">
                <strong>CUTTING & FINISHING ITEMS:</strong>
                {order.items?.map((it, idx) => (
                  <p key={idx}>
                    &bull; {it.name} — Size: {it.size} | Qty: {it.quantity} | {it.variantSku}
                  </p>
                ))}
              </div>
              <p className="pt-2 border-t border-[#E6E1DA]">
                <strong>TOTAL DUE:</strong> {formatPKR(order.pricing?.total)} ({order.paymentMethod})
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
                Print Slip
              </Button>
              <Button type="button" size="sm" onClick={() => setDarziModalOpen(false)} className="bg-[#151515] text-white text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
