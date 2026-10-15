'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  X,
  ShoppingBag,
  CreditCard,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminCustomersContent() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [blockedFilter, setBlockedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [targetUser, setTargetUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');

  // Fetch Customers Directory
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, roleFilter, blockedFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (roleFilter) params.set('role', roleFilter);
      if (blockedFilter) params.set('isBlocked', blockedFilter);
      params.set('page', String(page));
      params.set('limit', '20');
      return await apiClient(`/admin/users?${params.toString()}`);
    },
  });

  const users = Array.isArray(response) ? response : (response?.data?.docs || response?.docs || response?.data || []);
  const totalPages = response?.meta?.totalPages || response?.pagination?.totalPages || response?.totalPages || 1;
  const totalUsers = response?.meta?.totalDocs || response?.pagination?.totalDocs || response?.totalDocs || users.length;

  // Toggle Block Mutation
  const blockMutation = useMutation({
    mutationFn: async ({ id, isBlocked, reason }) => {
      return await apiClient(`/admin/users/${id}/block`, {
        method: 'POST',
        body: { isBlocked, reason },
      });
    },
    onSuccess: (data, variables) => {
      toast.success(
        variables.isBlocked ? 'Customer account suspended' : 'Customer account reinstated'
      );
      setTargetUser(null);
      setBlockReason('');
      queryClient.invalidateQueries(['admin', 'users']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update account status');
    },
  });

  const handleBlockConfirm = () => {
    if (!targetUser) return;
    const willBlock = !targetUser.isBlocked;
    blockMutation.mutate({
      id: targetUser._id || targetUser.id,
      isBlocked: willBlock,
      reason: blockReason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Customers
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            View customer accounts, order history, and account status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E6E1DA] text-xs font-semibold text-[#151515] shadow-2xs">
            <span className="text-[#6B6B6B]">Total Customers:</span>{' '}
            <span className="font-mono text-[#D12C2F]">{totalUsers}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6E1DA] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by customer name or email address..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] placeholder-[#6B6B6B] focus:outline-none focus:border-[#151515]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] font-medium focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">Customer</option>
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={blockedFilter}
            onChange={(e) => {
              setBlockedFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] font-medium focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="false">Active Only</option>
            <option value="true">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
              <tr>
                <th className="py-3 px-4">Patron Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">COD Refusal Risk</th>
                <th className="py-3 px-4">Account State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#6B6B6B]">
                    Loading client roster...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#6B6B6B]">
                    No patrons match your search query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isHighRisk = u.riskLevel === 'HIGH';
                  const isMedRisk = u.riskLevel === 'MEDIUM';

                  return (
                    <tr key={u._id || u.id} className="hover:bg-[#F6F2EC]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#151515] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-[#151515]">{u.name || 'Anonymous Patron'}</p>
                            <p className="text-[11px] font-mono text-[#6B6B6B]">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F6F2EC] text-[#151515]">
                          {u.role || 'user'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                        {u.totalOrders ?? 0}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                        ₨ {(u.totalSpendPKR ?? 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        {isHighRisk ? (
                          <span
                            title="3+ failed/refused deliveries. Verify advance payment before COD dispatch."
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FCEEEE] text-[#8F1A1E]"
                          >
                            <AlertTriangle className="w-3 h-3 text-[#D12C2F]" />
                            <span>HIGH RISK ({u.codRefusals} REFUSALS)</span>
                          </span>
                        ) : isMedRisk ? (
                          <span
                            title="1-2 COD delivery failures logged."
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>MEDIUM ({u.codRefusals})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>LOW RISK</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FCEEEE] text-[#8F1A1E]">
                            <Ban className="w-3 h-3" />
                            <span>SUSPENDED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          type="button"
                          variant={u.isBlocked ? 'outline' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setTargetUser(u);
                            setBlockReason('');
                          }}
                          className={`text-xs font-semibold ${
                            u.isBlocked
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                              : 'text-[#8F1A1E] hover:bg-[#FCEEEE]'
                          }`}
                        >
                          {u.isBlocked ? 'Reinstate Patron' : 'Suspend Account'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalUsers}
          pageSize={20}
          onPageChange={(p) => setPage(p)}
          variant="compact"
        />
      </div>

      {/* Block/Unblock Confirmation Modal */}
      {targetUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E6E1DA] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
              <div className="flex items-center gap-2 text-[#D12C2F]">
                {targetUser.isBlocked ? (
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Ban className="w-5 h-5 text-[#D12C2F]" />
                )}
                <h3 className="font-serif text-lg font-bold text-[#151515]">
                  {targetUser.isBlocked ? 'Reinstate Customer Account' : 'Suspend Customer Account'}
                </h3>
              </div>
              <button type="button" onClick={() => setTargetUser(null)}>
                <X className="w-5 h-5 text-[#6B6B6B]" />
              </button>
            </div>

            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              {targetUser.isBlocked ? (
                <>
                  Are you sure you want to lift the suspension for{' '}
                  <strong className="text-[#151515]">{targetUser.name || targetUser.email}</strong>?
                  They will regain full store and checkout access.
                </>
              ) : (
                <>
                  Suspending <strong className="text-[#151515]">{targetUser.name || targetUser.email}</strong>{' '}
                  prevents them from placing further Cash-on-Delivery or Raast orders.
                </>
              )}
            </p>

            {!targetUser.isBlocked && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#151515]">
                  Suspension Reason (Audit Trail)
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Repeated doorstep COD refusal, fraudulent chargebacks"
                  className="w-full p-3 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTargetUser(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleBlockConfirm}
                disabled={blockMutation.isPending}
                size="sm"
                className={`text-xs text-white ${
                  targetUser.isBlocked ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-[#BA1A1A] hover:bg-[#93000A]'
                }`}
              >
                {blockMutation.isPending
                  ? 'Saving...'
                  : targetUser.isBlocked
                  ? 'Confirm Reinstatement'
                  : 'Confirm Suspension'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
