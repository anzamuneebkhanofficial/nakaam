'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  MessageSquare,
  Clock,
  Send,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function NewComplaintContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Check existing tickets: If an active unresolved ticket exists, prevent duplicate submission
  const { data: tickets = [] } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      try {
        const res = await apiClient('/complaints');
        return Array.isArray(res) ? res : (res?.data || res?.items || []);
      } catch {
        return [];
      }
    },
  });

  const activeUnresolvedTicket = tickets.find(
    (t) => t.status === 'open' || t.status === 'pending' || t.status === 'in_progress'
  );

  useEffect(() => {
    if (activeUnresolvedTicket) {
      toast.error(
        'You already have an inquiry in progress. Please wait until your current inquiry is resolved.'
      );
      router.push('/user/complaints');
    }
  }, [activeUnresolvedTicket, router]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return await apiClient('/complaints', {
        method: 'POST',
        body: JSON.stringify({
          category: 'General Customer Support',
          subject: subject.trim(),
          message: message.trim(),
          whatsappNumber: whatsappNumber.trim() || null,
        }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success(
        data?.ticketNo
          ? `Inquiry submitted! Ticket #${data.ticketNo}`
          : 'Inquiry submitted successfully.'
      );
      router.push('/user/complaints');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to submit inquiry');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter a subject and your question/problem details');
      return;
    }
    submitMutation.mutate();
  };

  if (activeUnresolvedTicket) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-[#E6E1DA] text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="font-serif text-xl font-bold text-[#151515]">Inquiry In Progress</h2>
        <p className="text-xs text-[#6B6B6B] max-w-md mx-auto">
          You already have an active inquiry (#{activeUnresolvedTicket.ticketNo}). Our support team is currently working on it. You can submit another inquiry once your current ticket is resolved.
        </p>
        <Button variant="primary" size="sm" asChild>
          <Link href="/user/complaints">View Active Inquiry</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
        <div className="pb-4 border-b border-[#E6E1DA]">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
            Customer Support & Inquiries
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
            Need help with your order, fabric questions, or shopping experience? Submit your query below and our team will get back to you promptly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Display */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#151515]">Support Category</label>
            <div className="w-full h-11 px-3.5 flex items-center rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs font-semibold text-[#151515]">
              General Customer Support
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#151515]">Subject *</label>
            <Input
              type="text"
              placeholder="e.g. Question regarding my recent order delivery or fabric care"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="h-11 text-xs"
            />
          </div>

          {/* WhatsApp Number (Explicitly requested for easy WhatsApp contact) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#151515] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Contact Number (Optional)</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Direct WhatsApp assistance
              </span>
            </div>
            <Input
              type="tel"
              placeholder="e.g. 03001234567 or +92 300 1234567"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="h-11 text-xs font-mono"
            />
            <p className="text-[10px] text-[#6B6B6B]">
              Please enter your active WhatsApp number so our support team can reach out to you directly if needed.
            </p>
          </div>

          {/* Problem / Inquiry Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#151515]">Question / Problem Description *</label>
            <textarea
              rows={5}
              placeholder="Describe your issue or inquiry in detail so we can assist you quickly..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full p-3.5 text-xs rounded-xl border border-[#E6E1DA] bg-white text-[#151515] focus:outline-none focus:ring-1 focus:ring-[#151515] leading-relaxed"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] flex items-start gap-3 text-xs text-[#3A3A3A]">
            <Clock className="w-4 h-4 text-[#8F1A1E] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Our support team reviews inquiries promptly during business hours. Once reviewed, your ticket status and resolution message will appear directly on your dashboard.
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/user/complaints')}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitMutation.isPending}
              className="flex-1 font-bold h-12 text-xs"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Inquiry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
