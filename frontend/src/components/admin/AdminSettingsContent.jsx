'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import {
  Settings,
  Store,
  Phone,
  Mail,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Save,
  MessageCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminSettingsContent() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    storeName: 'Nakaam',
    whatsappNumber: '923001234567',
    supportEmail: 'care@nakaam.com',
    supportPhone: '+92 42 111 625 226',
    freeShippingThreshold: 5000,
    codMaxAmount: 50000,
    codEnabled: true,
    returnWindowDays: 7,
    announcementText: 'Doorstep inspection before payment across Lahore • Free shipping over PKR 5,000',
    announcementLink: '/shipping-returns',
    announcementActive: true,
    maintenanceMode: false,
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      return await apiClient('/admin/settings');
    },
  });

  useEffect(() => {
    const s = response?.data || response;
    if (s && s.storeName) {
      setForm({
        storeName: s.storeName || 'Nakaam',
        whatsappNumber: s.whatsappNumber || '923001234567',
        supportEmail: s.supportEmail || 'care@nakaam.com',
        supportPhone: s.supportPhones?.[0]?.number || '+92 42 111 625 226',
        freeShippingThreshold: s.freeShippingThreshold ?? 5000,
        codMaxAmount: s.codMaxAmount ?? 50000,
        codEnabled: s.codEnabled ?? true,
        returnWindowDays: s.returnWindowDays ?? 7,
        announcementText: s.announcementBar?.text || 'Doorstep inspection before payment across Lahore',
        announcementLink: s.announcementBar?.link || '/shipping-returns',
        announcementActive: s.announcementBar?.isActive ?? true,
        maintenanceMode: !!s.maintenanceMode,
      });
    }
  }, [response]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiClient('/admin/settings', {
        method: 'PATCH',
        body: payload,
      });
    },
    onSuccess: () => {
      toast.success('Store settings saved successfully');
      queryClient.invalidateQueries(['admin', 'settings']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update store settings');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      storeName: form.storeName,
      whatsappNumber: form.whatsappNumber,
      supportEmail: form.supportEmail,
      supportPhones: [{ label: 'Customer Support', number: form.supportPhone }],
      freeShippingThreshold: Number(form.freeShippingThreshold) || 5000,
      codMaxAmount: Number(form.codMaxAmount) || 50000,
      codEnabled: form.codEnabled,
      returnWindowDays: Number(form.returnWindowDays) || 7,
      announcementBar: {
        text: form.announcementText,
        link: form.announcementLink,
        isActive: form.announcementActive,
      },
      maintenanceMode: form.maintenanceMode,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Store Settings
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Manage store contact information, free shipping rules, and announcement messages.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={updateMutation.isPending || isLoading}
          className="bg-[#151515] text-white text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand & Contacts */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1DA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1DA]">
            <Store className="w-4 h-4 text-[#D12C2F]" />
            <h2 className="font-serif text-base font-bold text-[#151515]">
              Store Contact Details
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
              Store Name
            </label>
            <input
              type="text"
              required
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
              WhatsApp Support Number (Digits with 92 country code)
            </label>
            <input
              type="text"
              required
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
              Support Email
            </label>
            <input
              type="email"
              required
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
              Support Phone Number
            </label>
            <input
              type="text"
              value={form.supportPhone}
              onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
            />
          </div>
        </div>

        {/* Financial & Courier Rules */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1DA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1DA]">
            <Truck className="w-4 h-4 text-[#D12C2F]" />
            <h2 className="font-serif text-base font-bold text-[#151515]">
              Financial &amp; Delivery Policies
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
              Free Shipping Threshold (PKR)
            </label>
            <input
              type="number"
              required
              min={0}
              step={100}
              value={form.freeShippingThreshold}
              onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] font-mono focus:outline-none focus:border-[#151515]"
            />
            <p className="text-[10px] text-[#6B6B6B]">
              Orders at or above this integer PKR amount receive complimentary delivery across Pakistan.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
              Cash-on-Delivery Maximum Limit (PKR)
            </label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              value={form.codMaxAmount}
              onChange={(e) => setForm({ ...form, codMaxAmount: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] font-mono focus:outline-none focus:border-[#151515]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
              Return &amp; Exchange Window (Days)
            </label>
            <input
              type="number"
              required
              min={1}
              max={30}
              value={form.returnWindowDays}
              onChange={(e) => setForm({ ...form, returnWindowDays: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] font-mono focus:outline-none focus:border-[#151515]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#151515]">Enable Cash-on-Delivery (COD)</p>
              <p className="text-[10px] text-[#6B6B6B]">Allow patrons to settle balances upon arrival</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, codEnabled: !form.codEnabled })}
              className="p-1 text-2xl transition-colors"
            >
              {form.codEnabled ? (
                <ToggleRight className="w-8 h-8 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-[#6B6B6B]" />
              )}
            </button>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1DA] shadow-xs space-y-4 md:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#D12C2F]" />
              <h2 className="font-serif text-base font-bold text-[#151515]">
                Storefront Top Announcement Bar
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#6B6B6B]">Active Bar:</span>
              <button
                type="button"
                onClick={() => setForm({ ...form, announcementActive: !form.announcementActive })}
                className="transition-colors"
              >
                {form.announcementActive ? (
                  <ToggleRight className="w-7 h-7 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-[#6B6B6B]" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
                Announcement Copy
              </label>
              <input
                type="text"
                value={form.announcementText}
                onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
                Hyperlink Target
              </label>
              <input
                type="text"
                value={form.announcementLink}
                onChange={(e) => setForm({ ...form, announcementLink: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
