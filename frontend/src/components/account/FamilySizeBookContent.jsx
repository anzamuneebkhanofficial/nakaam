'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Users,
  Plus,
  Trash2,
  Ruler,
  ChevronRight,
  X,
  Heart,
  Sparkles,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

const RELATIONS = ['Mother', 'Father', 'Daughter', 'Son', 'Sister', 'Brother', 'Spouse', 'Other'];

export function FamilySizeBookContent() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  // New Member Form State
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [gender, setGender] = useState('female');
  const [bustChest, setBustChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [shoeSize, setShoeSize] = useState('');

  // Fetch Family Members from Profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        return await apiClient('/me/profile');
      } catch {
        return { familyMembers: [] };
      }
    },
    staleTime: 60 * 1000,
  });

  const familyMembers = profile?.familyMembers || [];

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      return await apiClient('/me/family', {
        method: 'POST',
        body: JSON.stringify({
          name,
          relation,
          gender,
          measurements: {
            bustChest: bustChest ? Number(bustChest) : null,
            waist: waist ? Number(waist) : null,
            hips: hips ? Number(hips) : null,
          },
          shoeSize: shoeSize || null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setModalOpen(false);
      resetForm();
      toast.success('Family member added to your Size Book!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to add family member');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/me/family/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast('Member removed from size book');
    },
  });

  const resetForm = () => {
    setName('');
    setRelation('Mother');
    setGender('female');
    setBustChest('');
    setWaist('');
    setHips('');
    setShoeSize('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter the family member name');
      return;
    }
    addMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
              Family Size Book
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
              Store tailoring measurements for your household. When purchasing Eid gifts or unstitched suits, assign line items to family members directly.
            </p>
          </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="font-bold h-10"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Family Member
                </Button>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {familyMembers.map((member) => (
                  <div
                    key={member._id}
                    className="p-5 rounded-2xl border border-[#E6E1DA] bg-white hover:bg-[#F6F2EC]/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FCEEEE] text-[#8F1A1E]">
                            {member.relation}
                          </span>
                          <h3 className="font-serif text-lg font-bold text-[#151515] mt-1">
                            {member.name}
                          </h3>
                        </div>

                        <button
                          onClick={() => deleteMutation.mutate(member._id)}
                          className="text-[#6B6B6B] hover:text-[#D12C2F] p-1 transition-colors cursor-pointer"
                          aria-label={`Remove ${member.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Measurements Matrix */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-center text-xs">
                        <div>
                          <p className="text-[#6B6B6B] text-[10px]">Bust/Chest</p>
                          <p className="font-bold font-mono text-[#151515]">
                            {member.measurements?.bustChest ? `${member.measurements.bustChest} cm` : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#6B6B6B] text-[10px]">Waist</p>
                          <p className="font-bold font-mono text-[#151515]">
                            {member.measurements?.waist ? `${member.measurements.waist} cm` : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#6B6B6B] text-[10px]">Hips</p>
                          <p className="font-bold font-mono text-[#151515]">
                            {member.measurements?.hips ? `${member.measurements.hips} cm` : '—'}
                          </p>
                        </div>
                      </div>

                      {member.shoeSize && (
                        <p className="text-xs text-[#6B6B6B]">
                          Footwear / Khussa Size: <strong className="text-[#151515]">{member.shoeSize}</strong>
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E6E1DA] text-[11px] text-[#6B6B6B] flex items-center justify-between">
                      <span>Gender: {member.gender || 'Female'}</span>
                      <span className="text-[#8F1A1E] font-medium">Ready for Eid Gifting</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

        {/* Add Member Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#151515]/45 backdrop-blur-[2px]" onClick={() => setModalOpen(false)} />
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E6E1DA] shadow-xl p-6 sm:p-8 z-10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <h3 className="font-serif text-xl font-bold text-[#151515]">Add to Size Book</h3>
                <button onClick={() => setModalOpen(false)} className="text-[#6B6B6B] hover:text-[#151515] p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Name / Title *</label>
                  <Input
                    type="text"
                    placeholder="e.g. Ammi Jaan / Sara"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Relationship</label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515]"
                    >
                      {RELATIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515]"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Bust (cm)</label>
                    <Input
                      type="number"
                      placeholder="96"
                      value={bustChest}
                      onChange={(e) => setBustChest(e.target.value)}
                      className="h-10 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Waist (cm)</label>
                    <Input
                      type="number"
                      placeholder="80"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      className="h-10 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Hips (cm)</label>
                    <Input
                      type="number"
                      placeholder="104"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      className="h-10 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Khussa / Shoe Size (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. 38 EU / 7 PK"
                    value={shoeSize}
                    onChange={(e) => setShoeSize(e.target.value)}
                    className="h-10 text-xs"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={addMutation.isPending} className="flex-1 font-bold">
                    Save to Book
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
