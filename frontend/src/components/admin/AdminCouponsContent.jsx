'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import {
  TicketPercent,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminCouponsContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percent',
    value: 10,
    minSubtotal: 3000,
    maxDiscount: '',
    endsAt: '',
    usageLimit: 100,
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'coupons', page],
    queryFn: async () => {
      return await apiClient(`/admin/coupons?page=${page}&limit=20`);
    },
  });

  const coupons = Array.isArray(response) ? response : (response?.data || response?.items || []);
  const meta = response?.meta || { page, totalPages: 1, total: coupons.length };

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiClient('/admin/coupons', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      toast.success('Coupon code issued');
      setShowModal(false);
      setForm({ code: '', type: 'percent', value: 10, minSubtotal: 3000, maxDiscount: '', endsAt: '', usageLimit: 100 });
      queryClient.invalidateQueries(['admin', 'coupons']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to issue coupon');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/admin/coupons/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast.success('Coupon revoked');
      queryClient.invalidateQueries(['admin', 'coupons']);
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      code: form.code.trim().toUpperCase(),
      value: Math.round(Number(form.value)),
      minSubtotal: Math.round(Number(form.minSubtotal) || 0),
      maxDiscount: form.maxDiscount ? Math.round(Number(form.maxDiscount)) : null,
      endsAt: form.endsAt || null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Coupons & Promo Codes
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Create and manage discount codes and special promotions.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowModal(!showModal)}
          className="bg-[#151515] hover:bg-black text-white text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Issue Coupon</span>
        </Button>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <form onSubmit={handleCreate} className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="font-serif text-base font-bold text-[#151515]">Issue New Coupon Voucher</h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. LAHORE15"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              >
                <option value="percent">Percent Off (%)</option>
                <option value="flat">Flat PKR Amount</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Value *</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Min Order Subtotal (PKR)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.minSubtotal}
                onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Expiry Date (Optional)</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Usage Limit (Redemptions)</label>
              <input
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                placeholder="Unlimited if empty"
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} size="sm" className="bg-[#151515] text-white text-xs">
              {createMutation.isPending ? 'Issuing...' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
            <tr>
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Benefit</th>
              <th className="py-3 px-4">Min Spend</th>
              <th className="py-3 px-4">Redemptions</th>
              <th className="py-3 px-4">Expires</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-[#6B6B6B]">
                  Loading coupons...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-[#6B6B6B]">
                  No active coupon vouchers found.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id || c.id} className="hover:bg-[#F6F2EC]/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#151515] flex items-center gap-2">
                    <TicketPercent className="w-3.5 h-3.5 text-[#D12C2F]" />
                    <span>{c.code}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#151515]">
                    {c.type === 'percent' ? `${c.value}% OFF` : `Rs ${c.value} OFF`}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {c.minSubtotal ? formatPKR(c.minSubtotal) : 'None'}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {c.usedCount || 0} / {c.usageLimit || '∞'}
                  </td>
                  <td className="py-3.5 px-4 text-[11px]">
                    {c.endsAt ? new Date(c.endsAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Revoke coupon "${c.code}"?`)) {
                          deleteMutation.mutate(c._id || c.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#D12C2F] hover:bg-[#FCEEEE]"
                      title="Revoke coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Coupons Pagination Footer */}
        <Pagination
          currentPage={meta.page || page}
          totalPages={meta.totalPages || 1}
          totalItems={meta.total || coupons.length}
          pageSize={20}
          onPageChange={(p) => setPage(p)}
          variant="compact"
        />
      </div>
    </div>
  );
}
