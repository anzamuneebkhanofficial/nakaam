'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Trash2,
  Calendar,
  Percent,
  CheckCircle2,
  Eye,
  Flame,
  Pencil,
  Clock,
  Layers,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const DEPARTMENTS = [
  { id: 'all', label: 'All Departments (Entire Store)' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'kids', label: 'Kids' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'home', label: 'Bedding & Home' },
  { id: 'collections', label: 'Curated Collections' },
];

export function AdminSalesContent() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const initialFormState = {
    name: '',
    discountType: 'percent',
    value: 15,
    startsAt: new Date().toISOString().split('T')[0],
    endsAt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    scope: 'all', // 'all' | 'audiences' | 'categories'
    targetDepartment: 'all', // 'all', 'women', 'men', etc.
    targetCategoryIds: [],
    isEnabled: true,
  };

  const [form, setForm] = useState(initialFormState);

  // Fetch sales
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['admin', 'sales'],
    queryFn: async () => {
      const res = await apiClient('/admin/sales');
      return res.data || res || [];
    },
  });

  // Fetch store categories for targeting dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories', 'targeting'],
    queryFn: async () => {
      const res = await apiClient('/categories');
      return res.data || res || [];
    },
  });

  // Filtered categories based on selected department
  const availableCategories = React.useMemo(() => {
    if (form.targetDepartment === 'all') return categories;
    return categories.filter((c) => c.audience === form.targetDepartment);
  }, [categories, form.targetDepartment]);

  // Preview Mutation
  const previewMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiClient('/admin/sales/preview', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: (data) => {
      setPreviewData(data.data || data);
      toast.success('Live discounted price preview calculated');
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiClient('/admin/sales', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      toast.success('Flash sale campaign launched');
      closeModal();
      queryClient.invalidateQueries(['admin', 'sales']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create campaign');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return await apiClient(`/admin/sales/${id}`, {
        method: 'PUT',
        body: payload,
      });
    },
    onSuccess: () => {
      toast.success('Campaign updated successfully');
      closeModal();
      queryClient.invalidateQueries(['admin', 'sales']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update campaign');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/admin/sales/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast.success('Campaign terminated');
      queryClient.invalidateQueries(['admin', 'sales']);
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingSaleId(null);
    setPreviewData(null);
    setForm(initialFormState);
  };

  const openCreateModal = () => {
    setEditingSaleId(null);
    setPreviewData(null);
    setForm(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (sale) => {
    setEditingSaleId(sale._id || sale.id);
    setPreviewData(null);
    const department = sale.targetAudiences?.[0] || 'all';
    setForm({
      name: sale.name || '',
      discountType: sale.discountType || 'percent',
      value: sale.value || 15,
      startsAt: sale.startsAt ? new Date(sale.startsAt).toISOString().split('T')[0] : '',
      endsAt: sale.endsAt ? new Date(sale.endsAt).toISOString().split('T')[0] : '',
      scope: sale.scope || 'all',
      targetDepartment: department,
      targetCategoryIds: (sale.targetCategoryIds || []).map((c) => (c._id ? c._id.toString() : c.toString())),
      isEnabled: sale.isEnabled !== false,
    });
    setShowModal(true);
  };

  const handlePreview = () => {
    const payload = buildPayload();
    previewMutation.mutate(payload);
  };

  const buildPayload = () => {
    let resolvedScope = 'all';
    let targetAudiences = [];
    let targetCategoryIds = [];

    if (form.targetDepartment !== 'all') {
      if (form.targetCategoryIds.length > 0) {
        resolvedScope = 'categories';
        targetCategoryIds = form.targetCategoryIds;
      } else {
        resolvedScope = 'audiences';
        targetAudiences = [form.targetDepartment];
      }
    }

    return {
      name: form.name,
      discountType: form.discountType,
      value: Number(form.value),
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      scope: resolvedScope,
      targetAudiences,
      targetCategoryIds,
      isEnabled: form.isEnabled,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = buildPayload();
    if (editingSaleId) {
      updateMutation.mutate({ id: editingSaleId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Discounts & Sales
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Configure automated promotional campaigns, department discounts, and flash sales.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateModal}
          className="bg-[#151515] hover:bg-black text-white text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Launch Campaign</span>
        </Button>
      </div>

      {/* Campaign Configuration Modal / Drawer */}
      {showModal && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-3">
            <div>
              <h2 className="font-serif text-base font-bold text-[#151515]">
                {editingSaleId ? 'Edit Promotional Campaign' : 'Launch New Promotional Campaign'}
              </h2>
              <p className="text-[11px] text-[#6B6B6B]">
                Define specific department scope, categories, and duration.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F6F2EC] text-[#151515]">
              {form.discountType === 'percent' ? `${form.value}% OFF` : `Rs ${form.value} OFF`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#151515]">Campaign Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Eid Festive Season Special Markdown"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Discount Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              >
                <option value="percent">Percentage Off (%)</option>
                <option value="flat">Flat PKR Amount</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Discount Value *</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] font-mono"
              />
            </div>
          </div>

          {/* Department & Category Scope Targeting Controls */}
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6E1DA] space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#151515]" />
              <span className="text-xs font-bold text-[#151515]">Campaign Targeting & Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Target Department *</label>
                <select
                  value={form.targetDepartment}
                  onChange={(e) => {
                    const dept = e.target.value;
                    setForm({
                      ...form,
                      targetDepartment: dept,
                      targetCategoryIds: [], // reset subcategories when department changes
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs text-[#151515]"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#6B6B6B]">
                  {form.targetDepartment === 'all'
                    ? 'Applies to all products across every department.'
                    : `Applies strictly to products in the ${form.targetDepartment} department.`}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">
                  Category Filter {form.targetDepartment !== 'all' ? `(${form.targetDepartment})` : ''}
                </label>
                <select
                  value={form.targetCategoryIds[0] || 'all_in_dept'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({
                      ...form,
                      targetCategoryIds: val === 'all_in_dept' ? [] : [val],
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs text-[#151515]"
                >
                  <option value="all_in_dept">
                    {form.targetDepartment === 'all' ? 'All Categories (Entire Store)' : `All Categories in ${form.targetDepartment}`}
                  </option>
                  {availableCategories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#6B6B6B]">
                  {form.targetCategoryIds.length === 0
                    ? 'All products in the selected department will be discounted.'
                    : 'Only products assigned to this specific category will be discounted.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Start Date *</label>
              <input
                type="date"
                required
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">End Date * (Automatic Expiry)</label>
              <input
                type="date"
                required
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="text-xs font-semibold bg-white"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Preview Prices Before Saving
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={closeModal} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#151515] text-white text-xs font-bold"
              >
                {editingSaleId ? 'Update Campaign' : 'Save & Launch Campaign'}
              </Button>
            </div>
          </div>

          {/* Preview Box */}
          {previewData && (
            <div className="mt-4 p-4 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] space-y-2">
              <h3 className="text-xs font-bold text-[#151515]">Sample Calculated Prices Under This Sale</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {previewData.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-[#E6E1DA] flex justify-between">
                    <div>
                      <p className="font-semibold text-[#151515]">{item.name}</p>
                      <p className="text-[11px] text-[#6B6B6B] line-through">{formatPKR(item.originalPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[#D12C2F]">{formatPKR(item.newPrice)}</p>
                      <p className="text-[10px] text-emerald-700 font-bold">Save {formatPKR(item.savings)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Campaigns Table */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Target Scope</th>
                <th className="py-3 px-4">Duration & Expiry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#6B6B6B]">
                    Loading promotional campaigns...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#6B6B6B]">
                    No active flash sales scheduled. Click &quot;Launch Campaign&quot; above to create one.
                  </td>
                </tr>
              ) : (
                sales.map((s) => {
                  const now = new Date();
                  const startDate = new Date(s.startsAt);
                  const endDate = new Date(s.endsAt);
                  const isExpired = now > endDate;
                  const isUpcoming = now < startDate;
                  const isActive = !isExpired && !isUpcoming && s.isEnabled !== false;

                  const daysRemaining = Math.max(0, Math.ceil((endDate - now) / 86400000));

                  const scopeDisplay = () => {
                    if (s.scope === 'audiences' && s.targetAudiences?.length > 0) {
                      return `Dept: ${s.targetAudiences.join(', ')}`;
                    }
                    if (s.scope === 'categories' && s.targetCategoryIds?.length > 0) {
                      return 'Specific Categories';
                    }
                    return 'Storewide (All)';
                  };

                  return (
                    <tr key={s._id || s.id} className="hover:bg-[#F6F2EC]/40">
                      <td className="py-3.5 px-4 font-semibold text-[#151515] flex items-center gap-2">
                        <Flame className={`w-3.5 h-3.5 ${isActive ? 'text-[#D12C2F]' : 'text-[#A09D98]'}`} />
                        <span>{s.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                        {s.discountType === 'percent' ? `${s.value}% OFF` : `Rs ${s.value} OFF`}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#151515]">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#F6F2EC] text-[11px]">
                          {scopeDisplay()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <div>
                          {startDate.toLocaleDateString()} &rarr; {endDate.toLocaleDateString()}
                        </div>
                        {isActive && (
                          <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{daysRemaining} day{daysRemaining === 1 ? '' : 's'} left</span>
                          </div>
                        )}
                        {isExpired && (
                          <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                            Expired (Sale inactive)
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : isExpired ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-500 border border-neutral-200">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                            Upcoming
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515] hover:bg-[#E6E1DA]"
                            title="Edit campaign"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Terminate campaign "${s.name}"?`)) {
                                deleteMutation.mutate(s._id || s.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#D12C2F] hover:bg-[#FCEEEE]"
                            title="End campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
