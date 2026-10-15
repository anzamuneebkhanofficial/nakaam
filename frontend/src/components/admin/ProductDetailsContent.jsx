'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Package,
  Layers,
  Sparkles,
  Tag,
  CheckCircle2,
  Clock,
  Shirt,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductImageGallery } from './ProductImageGallery';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { getCategoryType, CATEGORY_TYPES } from '@/lib/categoryUtils';

export function ProductDetailsContent({ productId }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch Product Details
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'product', productId],
    queryFn: async () => {
      return await apiClient(`/admin/products/${productId}`);
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(attempt * 800, 2400),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiClient(`/admin/products/${productId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast.success('Product deleted successfully.');
      queryClient.invalidateQueries(['admin', 'products']);
      router.push('/admin/products');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete product.');
      setShowDeleteModal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#151515] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#6B6B6B]">Loading product dossier...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#D12C2F]/10 text-[#D12C2F] flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-lg font-bold text-[#151515]">Product Not Found</h2>
        <p className="text-xs text-[#6B6B6B]">
          {error?.message || 'The product you are trying to view does not exist or the connection momentarily dropped.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl px-4 py-2 text-xs bg-[#151515] text-white hover:bg-black"
          >
            Retry Loading
          </Button>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs font-medium text-[#151515] hover:bg-[#F6F2EC]"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = product.category?.name || 'Uncategorized';
  const categoryType = getCategoryType(product.category, product.audience);
  const specs = product.specifications instanceof Map
    ? Object.fromEntries(product.specifications)
    : (product.specifications || {});

  const totalStock = product.hasVariants === false && product.stock !== undefined
    ? Number(product.stock)
    : Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    : Number(product.stock) || 0;

  const isPublished = product.status === 'published' || product.status === 'active';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Bar: Breadcrumb + Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-[#E6E1DA] bg-white hover:bg-[#F6F2EC] text-[#151515] transition-colors"
            title="Back to Product Catalog"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
              <Link href="/admin/products" className="hover:text-[#151515]">
                Products
              </Link>
              <span>/</span>
              <span className="font-mono text-[#151515] truncate max-w-[200px]">
                {product.sku || product._id}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#151515] mt-0.5">
              {product.name}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href={`/admin/products/${productId}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs font-semibold text-[#151515] hover:bg-[#F6F2EC] transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery (5 cols) + Information Specs (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery Slider */}
        <div className="lg:col-span-5 bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-xs sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-sm font-bold text-[#151515] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8E8B85]" /> Product Imagery
            </h2>
            <span className="text-[11px] font-mono text-[#8E8B85]">
              {product.images?.length || 0} Assets
            </span>
          </div>

          <ProductImageGallery
            images={product.images || []}
            productName={product.name}
          />
        </div>

        {/* Right Column: Full Specifications */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status & Overview Banner */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F6F2EC]">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                    isPublished
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {isPublished ? 'PUBLISHED' : 'DRAFT'}
                </span>

                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F6F2EC] text-[#151515] uppercase tracking-wide">
                  {product.audience || 'Unassigned'}
                </span>

                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F6F2EC] text-[#6B6B6B]">
                  {categoryName}
                </span>
              </div>

              <div className="text-[11px] font-mono text-[#8E8B85]">
                SKU: {product.sku}
              </div>
            </div>

            {/* Subtitle */}
            {product.subtitle && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8E8B85] tracking-wider">
                  Subtitle / Collection Line
                </span>
                <p className="text-sm font-medium text-[#151515] mt-0.5">
                  {product.subtitle}
                </p>
              </div>
            )}

            {/* Price & Inventory Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#F6F2EC]/60 border border-[#E6E1DA]/60">
                <span className="text-[11px] text-[#8E8B85] uppercase tracking-wide">
                  Retail Price
                </span>
                <div className="text-lg font-serif font-bold text-[#151515] mt-1">
                  {formatPKR(product.price)}
                </div>
                {product.compareAtPrice && (
                  <div className="text-[11px] text-[#8E8B85] line-through">
                    {formatPKR(product.compareAtPrice)}
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#F6F2EC]/60 border border-[#E6E1DA]/60">
                <span className="text-[11px] text-[#8E8B85] uppercase tracking-wide">
                  Total Inventory
                </span>
                <div
                  className={`text-lg font-serif font-bold mt-1 ${
                    totalStock === 0 ? 'text-[#D12C2F]' : 'text-[#151515]'
                  }`}
                >
                  {totalStock} units
                </div>
                <div className="text-[11px] text-[#8E8B85]">
                  Across {product.variants?.length || 0} variant(s)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F6F2EC]/60 border border-[#E6E1DA]/60 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[#8E8B85] uppercase tracking-wide">
                  Public Path
                </span>
                <div className="text-xs font-mono text-[#151515] truncate mt-1">
                  /p/{product.slug}
                </div>
                <a
                  href={`/p/${product.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#D12C2F] hover:underline mt-1 font-medium"
                >
                  Storefront preview <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-[#8E8B85] tracking-wider">
                  Product Description
                </span>
                <p className="text-xs text-[#333] leading-relaxed mt-1 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Variants and Stock Breakdown */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#151515] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#8E8B85]" /> Inventory Variants
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E1DA] text-[#8E8B85] font-medium">
                    <th className="py-2.5 px-3">Variant SKU</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Color</th>
                    <th className="py-2.5 px-3 text-right">Available Stock</th>
                    <th className="py-2.5 px-3 text-right">Reserved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F2EC]">
                  {product.variants?.map((v, idx) => (
                    <tr key={idx} className="hover:bg-[#F6F2EC]/40">
                      <td className="py-2.5 px-3 font-mono font-medium text-[#151515]">
                        {v.sku}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#151515]">{v.size}</td>
                      <td className="py-2.5 px-3 text-[#6B6B6B]">{v.color || 'Standard'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-semibold ${
                            v.stock === 0 ? 'text-[#D12C2F]' : 'text-[#151515]'
                          }`}
                        >
                          {v.stock} units
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#8E8B85]">
                        {v.reservedStock || 0}
                      </td>
                    </tr>
                  ))}
                  {(!product.variants || product.variants.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-[#8E8B85]">
                        No variants specified
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category-Specific Specifications */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#151515] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shirt className="w-4 h-4 text-[#8E8B85]" />
                {categoryType === CATEGORY_TYPES.FOOTWEAR
                  ? 'Footwear Specifications'
                  : categoryType === CATEGORY_TYPES.BEDDING
                  ? 'Bedding & Home Specifications'
                  : 'Garment & Fabric Details'}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F6F2EC] text-[#6B6B6B]">
                {categoryType}
              </span>
            </h2>

            {/* A. Footwear Details */}
            {categoryType === CATEGORY_TYPES.FOOTWEAR && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8E8B85] block">Footwear Style</span>
                  <span className="font-medium text-[#151515]">{specs.customFootwearStyle || specs.footwearStyle || 'Khussa / Sandal'}</span>
                </div>
                <div>
                  <span className="text-[#8E8B85] block">Sizing System</span>
                  <span className="font-medium text-[#151515]">{specs.shoeSizeSystem || 'EU / PK (Standard)'}</span>
                </div>
                <div>
                  <span className="text-[#8E8B85] block">Upper Material</span>
                  <span className="font-medium text-[#151515]">{specs.customUpperMaterial || specs.upperMaterial || 'Genuine Leather / Velvet'}</span>
                </div>
                <div>
                  <span className="text-[#8E8B85] block">Sole Material</span>
                  <span className="font-medium text-[#151515]">{specs.customSoleMaterial || specs.soleMaterial || 'Leather / Rubber Grip'}</span>
                </div>
                {specs.closureType && (
                  <div>
                    <span className="text-[#8E8B85] block">Closure & Fastening</span>
                    <span className="font-medium text-[#151515]">{specs.customClosureType || specs.closureType}</span>
                  </div>
                )}
                {specs.shoeFit && (
                  <div>
                    <span className="text-[#8E8B85] block">Fit Profile</span>
                    <span className="font-medium text-[#151515]">{specs.shoeFit}</span>
                  </div>
                )}
                {specs.heelHeight && (
                  <div>
                    <span className="text-[#8E8B85] block">Heel Profile</span>
                    <span className="font-medium text-[#151515]">{specs.heelHeight} {specs.heelType ? `(${specs.heelType})` : ''}</span>
                  </div>
                )}
                {specs.embellishment && (
                  <div>
                    <span className="text-[#8E8B85] block">Embellishment / Craft</span>
                    <span className="font-medium text-[#151515]">{specs.embellishment}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#8E8B85] block">Origin</span>
                  <span className="font-medium text-[#151515]">{product.origin || 'Pakistan'}</span>
                </div>
                {specs.care && (
                  <div className="sm:col-span-2">
                    <span className="text-[#8E8B85] block">Care Guidelines</span>
                    <span className="font-medium text-[#151515]">{specs.care}</span>
                  </div>
                )}
              </div>
            )}

            {/* B. Bedding Details */}
            {categoryType === CATEGORY_TYPES.BEDDING && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8E8B85] block">Bed Size</span>
                  <span className="font-medium text-[#151515]">{specs.customBedSize || specs.bedSize || 'King Size'}</span>
                </div>
                <div>
                  <span className="text-[#8E8B85] block">Sheet Style</span>
                  <span className="font-medium text-[#151515]">{specs.sheetType || 'Flat Sheet'}</span>
                </div>
                <div>
                  <span className="text-[#8E8B85] block">Dimensions</span>
                  <span className="font-medium text-[#151515]">
                    {typeof specs.dimensions === 'object' && specs.dimensions !== null && specs.dimensions.length && specs.dimensions.width
                      ? `${specs.dimensions.length} × ${specs.dimensions.width} ${specs.dimensions.unit || 'in'}`
                      : (specs.dimensions || 'Standard')}
                  </span>
                </div>
                <div>
                  <span className="text-[#8E8B85] block">Fabric / Thread Count</span>
                  <span className="font-medium text-[#151515]">{specs.fabric || product.fabric || '100% Cotton'}</span>
                </div>
                {specs.fillingMaterial && (
                  <div>
                    <span className="text-[#8E8B85] block">Filling / Batting</span>
                    <span className="font-medium text-[#151515]">{specs.fillingMaterial}</span>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="text-[#8E8B85] block mb-1">Package Contents</span>
                  {Array.isArray(specs.packageContents) && specs.packageContents.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {specs.packageContents.map((pkg, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F6F2EC] text-[#151515] font-medium border border-[#E6E1DA]">
                          {pkg.qty} × {pkg.item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-medium text-[#151515]">{specs.setIncludes || '1 Bed Sheet + 2 Pillow Covers'}</span>
                  )}
                </div>
                {specs.care && (
                  <div className="sm:col-span-2">
                    <span className="text-[#8E8B85] block">Care Guidelines</span>
                    <span className="font-medium text-[#151515]">{specs.care}</span>
                  </div>
                )}
              </div>
            )}

            {/* C. Apparel Details */}
            {categoryType !== CATEGORY_TYPES.FOOTWEAR && categoryType !== CATEGORY_TYPES.BEDDING && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8E8B85] block">Fabric Type</span>
                  <span className="font-medium text-[#151515]">
                    {specs.fabric || product.fabric || 'Pure Lawn'}
                  </span>
                </div>

                <div>
                  <span className="text-[#8E8B85] block">Outfit Composition</span>
                  <span className="font-medium text-[#151515]">
                    {specs.customPieces || specs.suitPieces || '3-Piece Suit'}
                  </span>
                </div>

                {Array.isArray(specs.components) && specs.components.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-[#8E8B85] block mb-1">Included Garment Components</span>
                    <div className="flex flex-wrap gap-1.5">
                      {specs.components.map((comp, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F6F2EC] text-[#151515] font-medium border border-[#E6E1DA]">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[#8E8B85] block">Fabric Composition</span>
                  <span className="font-medium text-[#151515]">
                    {specs.fabricComposition || product.fabricComposition || '100% Cotton'}
                  </span>
                </div>

                {specs.shrinkageNote && (
                  <div>
                    <span className="text-[#8E8B85] block">Shrinkage Note</span>
                    <span className="font-medium text-[#151515]">{specs.shrinkageNote}</span>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <span className="text-[#8E8B85] block">Care Guidelines</span>
                  <span className="font-medium text-[#151515]">
                    {specs.care || (Array.isArray(product.care) && product.care.length > 0 ? product.care.join(', ') : 'Dry clean recommended')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}" (${product.sku})? This action will permanently remove the product and cannot be undone.`}
        confirmText="Yes, Delete Product"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
