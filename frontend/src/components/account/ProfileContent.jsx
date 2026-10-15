'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  User,
  Ruler,
  ChevronRight,
  ShieldCheck,
  Save,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export function ProfileContent() {
  const queryClient = useQueryClient();

  const [gender, setGender] = useState('female');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bustChest, setBustChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [height, setHeight] = useState('');
  const [footLengthCm, setFootLengthCm] = useState('');

  // Fetch Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        return await apiClient('/me/profile');
      } catch {
        return {
          gender: '',
          dateOfBirth: '',
          measurements: {},
        };
      }
    },
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (profile.gender) setGender(profile.gender);
      if (profile.dateOfBirth) setDateOfBirth(profile.dateOfBirth.split('T')[0]);
      if (profile.measurements) {
        setBustChest(profile.measurements.bustChest || '');
        setWaist(profile.measurements.waist || '');
        setHips(profile.measurements.hips || '');
        setShoulder(profile.measurements.shoulder || '');
        setHeight(profile.measurements.height || '');
        setFootLengthCm(profile.measurements.footLengthCm || '');
      }
    }
  }, [profile]);

  // Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiClient('/me/profile', {
        method: 'PUT',
        body: JSON.stringify({
          gender,
          dateOfBirth: dateOfBirth || null,
          measurements: {
            bustChest: bustChest ? Number(bustChest) : null,
            waist: waist ? Number(waist) : null,
            hips: hips ? Number(hips) : null,
            shoulder: shoulder ? Number(shoulder) : null,
            height: height ? Number(height) : null,
            footLengthCm: footLengthCm ? Number(footLengthCm) : null,
          },
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile measurements saved! Used for instant size helper recommendations.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
        <div className="pb-4 border-b border-[#E6E1DA]">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
            Profile & Tailoring Matrix
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
            Save your body measurements once. When browsing lawn suits, pret, and khussa footwear, Nakaam will automatically calculate your recommended size.
          </p>
        </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#151515]">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#151515]">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full h-11 px-3 text-sm rounded-xl border border-[#E6E1DA] bg-white text-[#151515] focus:outline-none focus:ring-1 focus:ring-[#151515]"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#151515]">Date of Birth</label>
                      <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="h-11 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Sizing Sheet */}
                <div className="space-y-4 pt-4 border-t border-[#E6E1DA]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#151515] flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-[#D12C2F]" />
                        Body Measurement Matrix (cm)
                      </h3>
                      <p className="text-xs text-[#6B6B6B]">All measurements are in centimeters for tailoring accuracy.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#151515]">Bust / Chest (cm)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 92"
                        value={bustChest}
                        onChange={(e) => setBustChest(e.target.value)}
                        className="h-11 text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#151515]">Waist (cm)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 76"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        className="h-11 text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#151515]">Hips (cm)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 100"
                        value={hips}
                        onChange={(e) => setHips(e.target.value)}
                        className="h-11 text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#151515]">Shoulder Width (cm)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 38"
                        value={shoulder}
                        onChange={(e) => setShoulder(e.target.value)}
                        className="h-11 text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#151515]">Height (cm)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 165"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-11 text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#151515]">Foot Length (cm)</label>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 24.5"
                        value={footLengthCm}
                        onChange={(e) => setFootLengthCm(e.target.value)}
                        className="h-11 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Helper notice */}
                <div className="p-4 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] flex items-start gap-3 text-xs text-[#3A3A3A]">
                  <Info className="w-4 h-4 text-[#151515] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Measurements are stored securely and never shared with couriers. They are strictly referenced by the PDP size helper to ensure standard Pakistani lawn garments fit comfortably.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 font-bold"
                  isLoading={saveMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Tailoring Matrix
                </Button>
              </form>
            </div>
          </div>
  );
}
