'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  X,
  Phone,
  Home,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

const MAJOR_CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Sialkot', 'Peshawar', 'Quetta'];

export function AddressesContent() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  // New Address Form State
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Fetch Addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      try {
        return await apiClient('/me/addresses');
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return await apiClient('/me/addresses', {
        method: 'POST',
        body: JSON.stringify({
          label,
          fullName,
          phone,
          city,
          area,
          street,
          houseNo,
          landmark,
          isDefault,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setModalOpen(false);
      resetForm();
      toast.success('Address saved successfully');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to add address');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/me/addresses/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast('Address removed');
    },
  });

  // Set Default Mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/me/addresses/${id}/default`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default delivery address updated');
    },
  });

  const resetForm = () => {
    setLabel('Home');
    setFullName('');
    setPhone('');
    setCity('Lahore');
    setArea('');
    setStreet('');
    setHouseNo('');
    setLandmark('');
    setIsDefault(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !phone || !street) {
      toast.error('Name, phone, and street are required');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
              Saved Delivery Addresses
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Manage up to 10 verified delivery addresses for rapid one-click checkout.
            </p>
          </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  disabled={addresses.length >= 10}
                  className="font-bold h-10"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add New Address
                </Button>
              </div>

              {/* Address Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      addr.isDefault
                        ? 'border-[#151515] bg-[#F6F2EC]/50 ring-1 ring-[#151515]'
                        : 'border-[#E6E1DA] bg-white hover:bg-[#F6F2EC]/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-white border border-[#E6E1DA] text-[#151515] flex items-center gap-1.5">
                          {addr.label === 'Work' ? <Briefcase className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                          {addr.label}
                        </span>

                        {addr.isDefault && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Default Address
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-sm text-[#151515]">{addr.fullName}</p>
                        <p className="text-[#3A3A3A] leading-relaxed">
                          {addr.houseNo ? `House ${addr.houseNo}, ` : ''}
                          {addr.street}
                          {addr.area ? `, ${addr.area}` : ''}
                        </p>
                        <p className="font-semibold text-[#151515]">{addr.city}</p>
                        {addr.landmark && (
                          <p className="text-[#6B6B6B] italic">Near: {addr.landmark}</p>
                        )}
                        <p className="text-[#6B6B6B] flex items-center gap-1 pt-1">
                          <Phone className="w-3.5 h-3.5" />
                          {addr.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E6E1DA] text-xs">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => setDefaultMutation.mutate(addr._id)}
                          className="text-[#151515] hover:text-[#D12C2F] font-semibold underline cursor-pointer"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[#6B6B6B] italic">Active Default</span>
                      )}

                      <button
                        onClick={() => deleteMutation.mutate(addr._id)}
                        className="text-[#6B6B6B] hover:text-[#D12C2F] p-1 transition-colors cursor-pointer"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

        {/* Add Address Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#151515]/45 backdrop-blur-[2px]" onClick={() => setModalOpen(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E6E1DA] shadow-xl p-6 sm:p-8 z-10 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <h3 className="font-serif text-xl font-bold text-[#151515]">Add Delivery Address</h3>
                <button onClick={() => setModalOpen(false)} className="text-[#6B6B6B] hover:text-[#151515] p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Work', 'Other'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLabel(l)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        label === l ? 'bg-[#151515] text-white border-[#151515]' : 'bg-white border-[#E6E1DA] text-[#151515]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Full Name *</label>
                    <Input
                      type="text"
                      placeholder="Receiver name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Mobile Phone *</label>
                    <Input
                      type="tel"
                      placeholder="+92 300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">City *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515]"
                    >
                      {MAJOR_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Area / Colony</label>
                    <Input
                      type="text"
                      placeholder="e.g. DHA Phase 5"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Street Address *</label>
                  <Input
                    type="text"
                    placeholder="House/flat #, Street name"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Nearby Landmark (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. Opposite Park / Near Masjid"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-[#151515]"
                  />
                  <span>Set as default shipping address</span>
                </label>

                <div className="pt-3 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={createMutation.isPending} className="flex-1 font-bold">
                    Save Address
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
