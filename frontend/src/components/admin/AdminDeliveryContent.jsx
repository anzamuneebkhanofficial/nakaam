'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Navigation,
} from 'lucide-react';

const HUBS = [
  { city: 'Lahore (Main Hub)', status: 'Active & Dispatched', activeParcels: 38, avgTransit: '24 Hours', mode: 'Local Store Riders' },
  { city: 'Karachi & Suburbs', status: 'Air Express Active', activeParcels: 42, avgTransit: '2 - 3 Days', mode: 'TCS Air Freight' },
  { city: 'Islamabad & Rawalpindi', status: 'Transit Scheduled', activeParcels: 21, avgTransit: '1 - 2 Days', mode: 'Call Courier Overnight' },
  { city: 'Faisalabad & Multan', status: 'Regional Routing', activeParcels: 14, avgTransit: '2 - 3 Days', mode: 'Leopards Courier' },
];

export function AdminDeliveryContent() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { status: 'dispatched' }],
    queryFn: async () => {
      const res = await apiClient('/admin/orders?limit=10');
      return Array.isArray(res) ? res : (res?.data || res?.docs || []);
    },
  });

  const orders = Array.isArray(response) ? response : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Shipping & Delivery
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Manage delivery zones, couriers, and shipping fees.
          </p>
        </div>

        <Link href="/admin/orders">
          <Button variant="outline" size="sm" className="bg-white text-xs">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Button>
        </Link>
      </div>

      {/* Regional Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {HUBS.map((hub, idx) => (
          <div key={idx} className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
                {hub.city.split('(')[0]}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="font-serif text-xl font-bold text-[#151515]">
              {hub.activeParcels} <span className="text-xs font-normal text-[#6B6B6B]">in transit</span>
            </div>

            <div className="space-y-1 text-xs text-[#6B6B6B] pt-2 border-t border-[#E6E1DA]">
              <p>Transit: <strong>{hub.avgTransit}</strong></p>
              <p className="text-[11px] text-[#151515] font-semibold">{hub.mode}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Dispatches Stream */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E6E1DA] flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#151515]">Active In-Transit Parcels</h3>
          <span className="text-xs text-[#6B6B6B]">Live dispatch monitor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer & City</th>
                <th className="py-3 px-4">Courier / Rider Partner</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
              {orders.map((ord, idx) => {
                const id = ord._id || ord.id || ord.orderNumber;
                return (
                  <tr key={idx} className="hover:bg-[#F6F2EC]/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                      <Link href={`/admin/orders/${id}`} className="hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#151515]">{ord.shippingAddress?.fullName}</p>
                      <p className="text-[11px] text-[#6B6B6B]">{ord.shippingAddress?.city}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#151515]">
                        {ord.delivery?.courier || 'Lahore Express Rider'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                      {formatPKR(ord.pricing?.total || 0)} ({ord.paymentMethod})
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/admin/orders/${id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Track Parcel
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
