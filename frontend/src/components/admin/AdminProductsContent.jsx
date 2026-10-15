'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import {
  Search,
  Plus,
  Upload,
  Copy,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

const AUDIENCE_OPTIONS = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'kids', label: 'Kids' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'home', label: 'Home & Bedding' },
  { value: 'collections', label: 'Collections' },
];

export function AdminProductsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [deletingProduct, setDeletingProduct] = useState(null);

  // Fetch available categories for the dropdown filter
  const { data: rawCategories = [] } = useQuery({
    queryKey: ['admin', 'categories', 'all'],
    queryFn: async () => {
      try {
        const res = await apiClient('/admin/categories?all=true');
        return Array.isArray(res) ? res : res?.docs || res?.data || [];
      } catch {
        return [];
      }
    },
  });

  // Filter categories by selected audience/level (if chosen)
  const filteredRawCategories = React.useMemo(() => {
    if (!audienceFilter) return rawCategories;
    return rawCategories.filter(
      (cat) => (cat.audience || '').toLowerCase() === audienceFilter.toLowerCase()
    );
  }, [rawCategories, audienceFilter]);

  const categoryOptions = React.useMemo(() => {
    return filteredRawCategories.map((cat) => ({
      value: cat._id,
      label: cat.name,
      subtitle: cat.audience ? `Level: ${cat.audience.toUpperCase()}` : undefined,
    }));
  }, [filteredRawCategories]);

  // Fetch Products with filters and pagination
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'products', { search, audienceFilter, categoryFilter, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (audienceFilter) params.set('audience', audienceFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      params.set('page', page);
      params.set('limit', pageSize);
      return await apiClient(`/admin/products?${params.toString()}`);
    },
  });

  const products = Array.isArray(response)
    ? response
    : response?.docs || response?.data || [];

  const totalDocs =
    response?.totalDocs !== undefined
      ? response.totalDocs
      : response?.meta?.totalDocs !== undefined
      ? response.meta.totalDocs
      : products.length;

  const totalPages =
    response?.totalPages !== undefined
      ? response.totalPages
      : response?.meta?.totalPages !== undefined
      ? response.meta.totalPages
      : Math.ceil(totalDocs / pageSize) || 1;

  // Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/admin/products/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
      queryClient.invalidateQueries(['admin', 'products']);
    },
    onError: (err) => {
      toast.error(err.message || 'Cannot delete product with existing customer orders');
      setDeletingProduct(null);
    },
  });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleAudienceChange = (val) => {
    setAudienceFilter(val);
    setCategoryFilter('');
    setPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const getTotalStock = (variants = []) => {
    return Array.isArray(variants)
      ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      : 0;
  };

  const startRecord = totalDocs === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalDocs);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Products
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Add, edit, and manage store products, pricing, and stock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products/import">
            <Button
              variant="outline"
              className="text-xs font-semibold flex items-center gap-2 bg-white border-[#E6E1DA] hover:bg-[#F6F2EC]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </Button>
          </Link>

          <Button
              type="button"
              onClick={() => router.push(`/admin/products/new?t=${Date.now()}`)}
              className="bg-[#151515] hover:bg-black text-white text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Product</span>
            </Button>
        </div>
      </div>

      {/* Filter and Search Bar: 2 Searchable Dropdowns + Search Input */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Field (Matches Name, SKU, Slug, or Category Name) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8B85]" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by product name, SKU, or category (e.g. Unstitched Lawn)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F6F2EC] text-xs text-[#151515] border border-[#E6E1DA] placeholder:text-[#8E8B85] focus:outline-none focus:border-[#151515]"
            />
          </div>

          {/* Filter 1: Category Level Dropdown */}
          <div className="md:col-span-3">
            <SearchableSelect
              options={AUDIENCE_OPTIONS}
              value={audienceFilter}
              onChange={handleAudienceChange}
              placeholder="All Category Levels"
              searchPlaceholder="Filter category level..."
            />
          </div>

          {/* Filter 2: Category Dropdown */}
          <div className="md:col-span-3">
            <SearchableSelect
              options={categoryOptions}
              value={categoryFilter}
              onChange={handleCategoryChange}
              placeholder="All Categories"
              searchPlaceholder="Filter by category name..."
            />
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {(search || audienceFilter || categoryFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#F6F2EC] text-xs">
            <div className="flex items-center gap-2 text-[#6B6B6B]">
              <span className="font-semibold text-[#151515]">Active Filters:</span>
              {search && (
                <span className="px-2 py-0.5 rounded-md bg-[#F6F2EC] text-[#151515]">
                  Search: &ldquo;{search}&rdquo;
                </span>
              )}
              {audienceFilter && (
                <span className="px-2 py-0.5 rounded-md bg-[#F6F2EC] text-[#151515] uppercase font-mono text-[10px]">
                  Level: {audienceFilter}
                </span>
              )}
              {categoryFilter && (
                <span className="px-2 py-0.5 rounded-md bg-[#F6F2EC] text-[#151515]">
                  Category:{' '}
                  {rawCategories.find((c) => c._id === categoryFilter)?.name || 'Selected'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setAudienceFilter('');
                setCategoryFilter('');
                setPage(1);
              }}
              className="text-xs text-[#D12C2F] hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Products Table: 7 columns without inline image thumbnails */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Price (PKR)</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#6B6B6B]">
                    <div className="inline-block w-5 h-5 border-2 border-[#151515] border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#6B6B6B]">
                    No products found matching your search or filters.
                  </td>
                </tr>
              ) : (
                products.map((item) => {
                  const id = item._id || item.id;
                  const totalStock = getTotalStock(item.variants);
                  const isLow = totalStock > 0 && totalStock <= 5;
                  const isOut = totalStock === 0;

                  const categoryLabel =
                    item.category?.name ||
                    (typeof item.category === 'string' &&
                      rawCategories.find((c) => c._id === item.category)?.name) ||
                    'General';

                  const isPublished =
                    item.status === 'published' || item.status === 'active';

                  return (
                    <tr
                      key={id}
                      className="hover:bg-[#F6F2EC]/40 transition-colors group"
                    >
                      {/* 1. Product Name & Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#151515] truncate max-w-xs group-hover:text-black">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#8E8B85] truncate max-w-xs mt-0.5">
                            {item.subtitle || `/${item.slug}`}
                          </p>
                        </div>
                      </td>

                      {/* 2. Audience */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F6F2EC] text-[#151515]">
                          {item.audience || 'Unassigned'}
                        </span>
                      </td>

                      {/* 3. Price */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                        {formatPKR(item.price)}
                        {item.compareAtPrice && (
                          <span className="block text-[10px] text-[#8E8B85] line-through font-normal">
                            {formatPKR(item.compareAtPrice)}
                          </span>
                        )}
                      </td>

                      {/* 4. Total Stock */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                            isOut
                              ? 'bg-rose-50 text-rose-700'
                              : isLow
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {totalStock} units
                        </span>
                      </td>

                      {/* 5. Status (Draft or Published) */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>

                      {/* 6. Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-[#151515] bg-[#F6F2EC]/80">
                          {categoryLabel}
                        </span>
                      </td>

                      {/* 7. Actions: View, Edit, Duplicate, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* A. View Product (navigates to /admin/products/[id]) */}
                          <Link href={`/admin/products/${id}`}>
                            <button
                              type="button"
                              className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC] transition-colors"
                              title="View product details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>

                          {/* B. Edit Product (navigates to /admin/products/[id]/edit) */}
                          <Link href={`/admin/products/${id}/edit`}>
                            <button
                              type="button"
                              className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC] transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>

                          {/* C. Delete Product (confirmation modal) */}
                          <button
                            type="button"
                            onClick={() =>
                              setDeletingProduct({ id, name: item.name })
                            }
                            className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#D12C2F] hover:bg-rose-50 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Robust Pagination Footer */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalDocs}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          variant="compact"
        />
      </div>



      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct) {
            deleteMutation.mutate(deletingProduct.id);
          }
        }}
        isLoading={deleteMutation.isPending}
        isDestructive={true}
        title="Delete Product?"
        message={
          deletingProduct
            ? `Are you sure you want to delete "${deletingProduct.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
