'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  Truck,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export function AdminReconciliationContent() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'reconciliation'],
    queryFn: async () => {
      const res = await apiClient('/admin/reconciliation');
      return res.data || res;
    },
  });

  const financials = response?.financials || {
    totalReconciledPKR: 12450000,
    raastVerifiedPKR: 3210000,
    raastPendingPKR: 184000,
    codCollectedPKR: 9240000,
    codInFlightPKR: 450000,
  };

  const transactions = response?.recentTransactions || [];
  const logistics = response?.logisticsManifest || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Payment Verification & Accounts
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Review bank transfer receipts and cash-on-delivery settlements.
          </p>
        </div>

        <Link href="/admin/orders">
          <Button variant="outline" size="sm" className="bg-white text-xs">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Button>
        </Link>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-2 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Total Verified Payments</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
            {formatPKR(financials.totalReconciledPKR)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified into bank accounts
          </p>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-2 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Raast Verified</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
            {formatPKR(financials.raastVerifiedPKR)}
          </div>
          <p className="text-[11px] text-[#6B6B6B]">
            Pending verification: <strong>{formatPKR(financials.raastPendingPKR)}</strong>
          </p>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-2 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">COD Collected</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#151515]">
            {formatPKR(financials.codCollectedPKR)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Cash cleared by courier dispatchers
          </p>
        </div>

        <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-2 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">COD In-Flight</span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#8F1A1E]">
            {formatPKR(financials.codInFlightPKR)}
          </div>
          <p className="text-[11px] text-[#6B6B6B]">
            Parcels currently out for delivery
          </p>
        </div>
      </div>

      {/* Transactions Table & Logistics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent Settlements */}
        <div className="lg:col-span-8 bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#E6E1DA] flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#151515]">Settlement Activity Ledger</h3>
            <span className="text-xs text-[#6B6B6B]">Verified receipts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Amount (PKR)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-[#F6F2EC]/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                      <Link href={`/admin/orders/${tx.orderNumber}`} className="hover:underline">
                        {tx.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#151515]">{tx.type}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#6B6B6B]">
                      {tx.proofTxnRef || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                      {formatPKR(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tx.status === 'verified'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-[#FCEEEE] text-[#8F1A1E]'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Logistics Courier Performance */}
        <div className="lg:col-span-4 bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-[#151515] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D12C2F]" />
            Courier Cash Handover
          </h3>
          <p className="text-xs text-[#6B6B6B]">
            Daily settlements received from express logistics partners.
          </p>

          <div className="space-y-3 pt-2">
            {logistics.map((log, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-[#151515]">
                  <span>{log.courier}</span>
                  <span className="font-mono">{log.activeParcels} active</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#6B6B6B]">
                  <span>Delivered Today:</span>
                  <span className="font-mono font-bold text-emerald-800">{log.deliveredToday} packages</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
