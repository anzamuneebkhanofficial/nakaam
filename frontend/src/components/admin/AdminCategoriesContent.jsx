'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ImageUploader } from '@/features/media/ImageUploader';
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
  Layers,
  FolderTree,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminCategoriesContent() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const pageSize = 15;

  // Derived: are any filters active?
  const hasFilters = search.trim() !== '' || sectionFilter !== '';

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleSectionChange = useCallback((val) => {
    setSectionFilter(val);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSectionFilter('');
    setPage(1);
  }, []);

  const [newCat, setNewCat] = useState({
    name: '',
    slug: '',
    audience: 'women',
    image: '',
    sortOrder: 0,
  });

  // Build query params: when filters active, fetch all matching (no pagination)
  // so the count reflects the filtered set, then slice client-side for pagination.
  const buildQueryUrl = () => {
    const params = new URLSearchParams();
    if (hasFilters) {
      // When filtering: fetch up to 500 matching records from backend (server filters)
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (search.trim()) params.set('q', search.trim());
      if (sectionFilter) params.set('audience', sectionFilter);
    } else {
      params.set('page', String(page));
      params.set('limit', String(pageSize));
    }
    return `/admin/categories?${params.toString()}`;
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'categories', page, search.trim(), sectionFilter],
    queryFn: async () => {
      return await apiClient(buildQueryUrl());
    },
  });

  const categories = Array.isArray(response)
    ? response
    : response?.docs || response?.data || [];

  const totalDocs =
    response?.totalDocs !== undefined
      ? response.totalDocs
      : response?.meta?.totalDocs !== undefined
      ? response.meta.totalDocs
      : categories.length;

  const totalPages =
    response?.totalPages !== undefined
      ? response.totalPages
      : response?.meta?.totalPages !== undefined
      ? response.meta.totalPages
      : Math.ceil(totalDocs / pageSize) || 1;

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiClient('/admin/categories', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      toast.success('Category created successfully.');
      setShowAddModal(false);
      setNewCat({ name: '', slug: '', audience: 'women', image: '', sortOrder: 0 });
      queryClient.invalidateQueries(['admin', 'categories']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create category.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      return await apiClient(`/admin/categories/${id}`, {
        method: 'PATCH',
        body: updates,
      });
    },
    onSuccess: () => {
      toast.success('Category updated successfully.');
      setEditingCategory(null);
      queryClient.invalidateQueries(['admin', 'categories']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update category.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient(`/admin/categories/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast.success('Category deleted successfully.');
      setDeletingCategory(null);
      queryClient.invalidateQueries(['admin', 'categories']);
    },
    onError: (err) => {
      toast.error(err.message || 'Cannot delete category with associated products.');
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(newCat);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    updateMutation.mutate({
      id: editingCategory._id || editingCategory.id,
      updates: editingCategory,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#151515]">
            Categories
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Manage store categories and product sections.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowAddModal(!showAddModal)}
          className="bg-[#151515] hover:bg-black text-white text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Search + Section Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B6B6B] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs text-[#151515] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-1 focus:ring-[#151515] transition-shadow"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#6B6B6B] hover:text-[#151515]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Section filter dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B6B6B] pointer-events-none" />
          <select
            value={sectionFilter}
            onChange={(e) => handleSectionChange(e.target.value)}
            className="pl-8 pr-8 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs text-[#151515] focus:outline-none focus:ring-1 focus:ring-[#151515] appearance-none cursor-pointer min-w-[180px] transition-shadow"
          >
            <option value="">All Sections</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kids">Kids</option>
            <option value="footwear">Footwear</option>
            <option value="home">Bedding &amp; Home</option>
            <option value="collections">Collections</option>
          </select>
        </div>

        {/* Active filter badge + Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F2EC] border border-[#E6E1DA] text-xs text-[#151515] hover:bg-[#EDE8E1] transition-colors"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>

      {/* Add Category Drawer / Form */}
      {showAddModal && (
        <form onSubmit={handleCreate} className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-[#151515]">Add New Category</h2>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="p-1 rounded text-[#6B6B6B] hover:text-[#151515]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bed Sheets, Lawn, Kurtis"
                value={newCat.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  setNewCat({ ...newCat, name, slug });
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Slug URL *</label>
              <input
                type="text"
                required
                value={newCat.slug}
                onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Store Section *</label>
              <select
                value={newCat.audience}
                onChange={(e) => setNewCat({ ...newCat, audience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
                <option value="footwear">Footwear</option>
                <option value="home">Bedding & Home</option>
                <option value="collections">Collections (Winter, Summer, Eid)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Sort Order</label>
              <input
                type="number"
                value={newCat.sortOrder}
                onChange={(e) => setNewCat({ ...newCat, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
              />
            </div>
          </div>

          {/* Category Image Upload */}
          <div className="space-y-2 border-t border-[#E6E1DA] pt-4">
            <label className="text-xs font-semibold text-[#151515]">Category Feature Image</label>
            <ImageUploader
              images={newCat.image ? [{ url: newCat.image, alt: newCat.name }] : []}
              onChange={(imgs) => setNewCat({ ...newCat, image: imgs[0]?.url || '' })}
              kind="category"
              entityId={newCat.slug || 'draft'}
              maxFiles={1}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6E1DA]">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} size="sm" className="bg-[#151515] text-white text-xs">
              {createMutation.isPending ? 'Saving...' : 'Create Category'}
            </Button>
          </div>
        </form>
      )}

      {/* Category List Table */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-xs">
          <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
            <tr>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Section</th>
              <th className="py-3 px-4">Active Products</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E1DA] text-[#6B6B6B]">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-[#6B6B6B]">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-[#6B6B6B]">
                  No categories defined.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id || cat.id} className="hover:bg-[#F6F2EC]/40">
                  <td className="py-3.5 px-4 font-semibold text-[#151515] flex items-center gap-2">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-6 h-6 rounded-md object-cover border border-[#E6E1DA]" />
                    ) : (
                      <Tag className="w-3.5 h-3.5 text-[#D12C2F]" />
                    )}
                    <span>{cat.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#6B6B6B]">/{cat.slug}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F6F2EC] text-[#151515]">
                      {cat.audience}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#151515]">
                    {cat.productCount || 0} products
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Action */}
                      <button
                        type="button"
                        onClick={() => setViewingCategory(cat)}
                        className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC] transition-colors"
                        title="View category details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Action */}
                      <button
                        type="button"
                        onClick={() => setEditingCategory({ ...cat })}
                        className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC] transition-colors"
                        title="Edit category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(cat)}
                        className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#D12C2F] hover:bg-[#FCEEEE] transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Categories Pagination Footer */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalDocs}
          pageSize={pageSize}
          onPageChange={(p) => setPage(p)}
          variant="compact"
        />
      </div>

      {/* View Category Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151515]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-[#E6E1DA] rounded-2xl shadow-xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#D12C2F]" />
                <h3 className="font-serif text-lg font-bold text-[#151515]">
                  Category Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingCategory(null)}
                className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {viewingCategory.image && (
              <div className="aspect-[16/9] rounded-xl overflow-hidden border border-[#E6E1DA] bg-[#F6F2EC]">
                <img
                  src={viewingCategory.image}
                  alt={viewingCategory.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E6E1DA]/60">
                <span className="text-[#6B6B6B]">Category Name</span>
                <span className="font-bold text-[#151515]">{viewingCategory.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E1DA]/60">
                <span className="text-[#6B6B6B]">URL Slug</span>
                <span className="font-mono text-[#151515]">/{viewingCategory.slug}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E1DA]/60">
                <span className="text-[#6B6B6B]">Store Section</span>
                <span className="font-bold uppercase text-[#151515]">{viewingCategory.audience}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E1DA]/60">
                <span className="text-[#6B6B6B]">Sort Order</span>
                <span className="font-mono text-[#151515]">{viewingCategory.sortOrder || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E6E1DA]/60">
                <span className="text-[#6B6B6B]">Active Products</span>
                <span className="font-bold font-mono text-[#151515]">
                  {viewingCategory.productCount || 0} products
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B6B6B]">Identifier</span>
                <span className="font-mono text-[10px] text-[#6B6B6B]">
                  {viewingCategory._id || viewingCategory.id}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewingCategory(null)}
                className="text-xs font-semibold px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151515]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleUpdate}
            className="w-full max-w-lg bg-white border border-[#E6E1DA] rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#151515]">
                Edit Category
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#151515] hover:bg-[#F6F2EC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Slug URL *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Store Section *</label>
                <select
                  value={editingCategory.audience || 'women'}
                  onChange={(e) => setEditingCategory({ ...editingCategory, audience: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                >
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="kids">Kids</option>
                  <option value="footwear">Footwear</option>
                  <option value="home">Bedding & Home</option>
                  <option value="collections">Collections (Winter, Summer, Eid)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Sort Order</label>
                <input
                  type="number"
                  value={editingCategory.sortOrder !== undefined ? editingCategory.sortOrder : 0}
                  onChange={(e) => setEditingCategory({ ...editingCategory, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                />
              </div>
            </div>

            {/* Category Image */}
            <div className="space-y-2 border-t border-[#E6E1DA] pt-3">
              <label className="text-xs font-semibold text-[#151515]">Category Feature Image</label>
              <ImageUploader
                images={editingCategory.image ? [{ url: editingCategory.image, alt: editingCategory.name }] : []}
                onChange={(imgs) => setEditingCategory({ ...editingCategory, image: imgs[0]?.url || '' })}
                kind="category"
                entityId={editingCategory._id || editingCategory.id}
                maxFiles={1}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6E1DA]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingCategory(null)}
                className="text-xs font-semibold px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                size="sm"
                className="bg-[#151515] text-white text-xs font-bold px-4"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => {
          if (deletingCategory) {
            deleteMutation.mutate(deletingCategory._id || deletingCategory.id);
          }
        }}
        isLoading={deleteMutation.isPending}
        title="Delete Category?"
        message={
          deletingCategory
            ? `Are you sure you want to delete "${deletingCategory.name}"? If it contains active products, deletion will be refused.`
            : ''
        }
        confirmText="Yes, Delete"
      />
    </div>
  );
}
