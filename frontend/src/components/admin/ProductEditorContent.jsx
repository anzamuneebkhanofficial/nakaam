/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  Save,
  Plus,
  Copy,
  Trash2,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Package,
  Eye,
  Check,
  AlertCircle,
  Search,
  X,
  Ruler,
  Scissors,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from '@/features/media/ImageUploader';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import {
  getCategoryType,
  getCategoryConfig,
  CATEGORY_TYPES,
  CATEGORY_CONFIG,
  SIZE_PRESETS,
  SIZE_OPTIONS,
  POPULAR_COLORS,
  PIECE_OPTIONS,
  SPECIFICATION_PROFILES,
  formatComposition,
} from '@/lib/categoryUtils';

/**
 * Auto-generate a product SKU.
 * Format: NK-{AUD}-{SLUG_ABBR}-{RAND4}
 * e.g.  NK-WMN-LAWN-3K9X
 */
function generateSKU(name = '', audience = '') {
  const audMap = { women: 'WMN', men: 'MEN', kids: 'KID', footwear: 'FTW', home: 'HOM', collections: 'COL' };
  const audPrefix = audMap[audience?.toLowerCase()] || 'GEN';
  const nameSlug = name.trim().toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.slice(0, 4).toUpperCase())
    .join('-');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NK-${audPrefix}-${nameSlug || 'ITEM'}-${rand}`;
}

/**
 * Resilient category search helpers:
 * 1. Unifies Unicode forms (NFKD)
 * 2. Normalizes all apostrophes/quotes (‘ ’ ‚ ‛ ' ` ´) to standard ASCII apostrophe (')
 * 3. Strips diacritics/accents
 * 4. Tokenizes multi-word queries so words in any order and with/without punctuation match
 */
function normalizeSearchText(text = '') {
  if (!text) return '';
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u201A\u201B\u0027\u0060\u00B4]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u0022]/g, '"')
    .toLowerCase()
    .trim();
}

function tokenizeSearch(text = '') {
  if (!text) return [];
  const cleaned = normalizeSearchText(text)
    .replace(/['"]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.split(' ').filter(Boolean);
}

function categoryMatchesSearch(category, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;

  const normQuery = normalizeSearchText(rawQuery);
  const normName = normalizeSearchText(category.name || '');
  const normSlug = normalizeSearchText(category.slug || '');

  // 1. Direct normalized match (e.g. "men's formal shoes" in "men's formal shoes")
  if (normName.includes(normQuery) || normSlug.includes(normQuery)) {
    return true;
  }

  // 2. Tokenized multi-word search (e.g. "mens formal shoes" matches "Men’s Formal Shoes")
  const queryTokens = tokenizeSearch(rawQuery);
  if (queryTokens.length === 0) return true;

  const nameTokensStr = tokenizeSearch(category.name || '').join(' ');
  const slugTokensStr = tokenizeSearch(category.slug || '').join(' ');

  return queryTokens.every(
    (token) => nameTokensStr.includes(token) || slugTokensStr.includes(token)
  );
}

export function ProductEditorContent({ productId, resetKey }) {
  const isNew = !productId || productId === 'new';

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'product', productId],
    queryFn: async () => {
      return await apiClient(`/admin/products/${productId}`);
    },
    enabled: !isNew,
    retry: 3,
    retryDelay: (attempt) => Math.min(attempt * 800, 2400),
  });

  if (!isNew && isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#151515] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#6B6B6B]">Loading product details...</p>
      </div>
    );
  }

  if (!isNew && (isError || !product)) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#151515]">Product Not Found</h2>
        <p className="text-xs text-[#6B6B6B]">
          Unable to load product specifications. The server connection may have momentarily dropped.
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

  // For new products: resetKey (the ?t= timestamp from the URL) drives the React key.
  // Each unique resetKey causes React to fully unmount + remount ProductEditorForm,
  // re-running its useState initializer and guaranteeing a completely blank form.
  const formKey = isNew
    ? `new-product-${resetKey || 'init'}`
    : (product?._id || productId);

  return (
    <ProductEditorForm
      key={formKey}
      product={product || {}}
      productId={productId}
      isNew={isNew}
    />
  );
}

function ProductEditorForm({ product = {}, productId, isNew = false }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories', 'all'],
    queryFn: async () => {
      try {
        const res = await apiClient('/admin/categories?all=true');
        return Array.isArray(res) ? res : res?.data || res?.docs || [];
      } catch {
        return [];
      }
    },
  });

  // Initial State Setup
  const [form, setForm] = useState(() => {
    if (isNew) {
      return {
        name: '',
        slug: '',
        sku: '',
        audience: 'women',
        price: 1000,
        compareAtPrice: '',
        sale: {
          isEnabled: false,
          salePrice: '',
          campaignName: '',
          startsAt: '',
          endsAt: '',
        },
        description: '',
        status: 'draft',
        isBestSeller: false,
        isFeatured: false,
        images: [],
        hasVariants: true,
        stock: 10,
        variants: [
          { sku: '', size: 'M', color: 'Ivory', stock: 10 },
        ],
        specifications: {
          fabric: 'Pure Lawn',
          suitPieces: '3-Piece',
          customPieces: '',
          components: ['Shirt', 'Dupatta', 'Trouser'],
          care: '',
          upperMaterial: '',
          customUpperMaterial: '',
          soleMaterial: '',
          customSoleMaterial: '',
          footwearStyle: '',
          customFootwearStyle: '',
          shoeSizeSystem: 'EU / PK (Standard)',
          closureType: '',
          customClosureType: '',
          shoeFit: '',
          heelType: '',
          heelHeight: '',
          embellishment: '',
          bedSize: '',
          customBedSize: '',
          sheetType: '',
          customSheetType: '',
          dimensions: { length: '', width: '', unit: 'inches' },
          packageContents: [
            { item: 'Bed Sheet', qty: 1 },
            { item: 'Pillowcase', qty: 2 },
          ],
          setIncludes: '1 Bed Sheet + 2 Pillowcases',
        },
      };
    }

    const rawVariants = Array.isArray(product.variants) ? product.variants : [];
    const hasInitialVariants =
      product.hasVariants !== undefined
        ? product.hasVariants
        : rawVariants.length > 1 || (rawVariants.length === 1 && rawVariants[0].size !== 'Standard');

    const totalVariantStock = rawVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const initialStock = product.stock !== undefined ? product.stock : totalVariantStock;

    // Extract specifications or fallback to legacy fields
    const specs = product.specifications instanceof Map
      ? Object.fromEntries(product.specifications)
      : (product.specifications || {});

    return {
      name: product.name || '',
      slug: product.slug || '',
      sku: product.sku || '',
      audience: product.audience || 'women',
      category: product.category?._id || product.category || '',
      price: product.price || 1000,
      compareAtPrice: product.compareAtPrice || '',
      sale: {
        isEnabled: Boolean(product.sale?.isEnabled),
        salePrice: product.sale?.salePrice || '',
        campaignName: product.sale?.campaignName || '',
        startsAt: product.sale?.startsAt ? product.sale.startsAt.split('T')[0] : '',
        endsAt: product.sale?.endsAt ? product.sale.endsAt.split('T')[0] : '',
      },
      description: product.description || '',
      status: product.status === 'active' ? 'published' : (product.status || 'draft'),
      isBestSeller: Boolean(product.isBestSeller),
      isFeatured: Boolean(product.isFeatured),
      images: Array.isArray(product.images) ? product.images : [],

      // Inventory & Variant Model
      hasVariants: hasInitialVariants,
      stock: initialStock,
      variants: rawVariants.length > 0 ? rawVariants : [
        { sku: `${product.sku || 'NK'}-M`, size: 'M', color: 'Ivory', stock: initialStock || 10 }
      ],

      // Adaptive Category Specifications
      specifications: {
        fabric: specs.fabric || product.fabric || '',
        suitPieces: specs.suitPieces || '3-Piece',
        customPieces: specs.customPieces || '',
        components: Array.isArray(specs.components)
          ? specs.components
          : (specs.suitPieces === '3-Piece' ? ['Shirt', 'Dupatta', 'Trouser'] : ['Garment']),
        care: specs.care || (Array.isArray(product.care) ? product.care.join(', ') : ''),
        upperMaterial: specs.upperMaterial || '',
        customUpperMaterial: specs.customUpperMaterial || '',
        soleMaterial: specs.soleMaterial || '',
        customSoleMaterial: specs.customSoleMaterial || '',
        footwearStyle: specs.footwearStyle || '',
        customFootwearStyle: specs.customFootwearStyle || '',
        shoeSizeSystem: specs.shoeSizeSystem || 'EU / PK (Standard)',
        closureType: specs.closureType || '',
        customClosureType: specs.customClosureType || '',
        shoeFit: specs.shoeFit || '',
        heelType: specs.heelType || '',
        heelHeight: specs.heelHeight || '',
        embellishment: specs.embellishment || '',
        bedSize: specs.bedSize || '',
        customBedSize: specs.customBedSize || '',
        sheetType: specs.sheetType || '',
        customSheetType: specs.customSheetType || '',
        dimensions: typeof specs.dimensions === 'object' && specs.dimensions !== null
          ? specs.dimensions
          : { length: '', width: '', unit: 'inches' },
        packageContents: Array.isArray(specs.packageContents) && specs.packageContents.length > 0
          ? specs.packageContents
          : [
              { item: 'Bed Sheet', qty: 1 },
              { item: 'Pillowcase', qty: 2 },
            ],
        setIncludes: specs.setIncludes || '1 Bed Sheet + 2 Pillowcases',
        ...specs,
      },
    };
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Ivory');
  const [newPieceInput, setNewPieceInput] = useState('');
  const [newPkgItemName, setNewPkgItemName] = useState('');
  const [newPkgItemQty, setNewPkgItemQty] = useState(1);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [showCustomSizeField, setShowCustomSizeField] = useState(false);

  // Searchable category combobox state
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const catBoxRef = useRef(null);

  // Close combobox on outside click
  useEffect(() => {
    if (!catOpen) return;
    const handler = (e) => {
      if (catBoxRef.current && !catBoxRef.current.contains(e.target)) {
        setCatOpen(false);
        setCatSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [catOpen]);

  // Determine current merchandise category type & specification configuration
  const selectedCategoryObj = useMemo(() => {
    return categories.find((c) => c._id === form.category);
  }, [categories, form.category]);

  const categoryConfig = useMemo(() => {
    return getCategoryConfig(selectedCategoryObj, form.audience);
  }, [selectedCategoryObj, form.audience]);

  const categoryType = categoryConfig.profile;

  // Domain & audience-aware available sizes for variant generation
  const availableSizes = useMemo(() => {
    if (categoryType === CATEGORY_TYPES.FOOTWEAR) {
      const sys = form.specifications.shoeSizeSystem || 'EU / PK';
      if (sys.includes('UK')) return SIZE_OPTIONS[CATEGORY_TYPES.FOOTWEAR]['UK'];
      if (sys.includes('US')) return SIZE_OPTIONS[CATEGORY_TYPES.FOOTWEAR]['US'];
      return SIZE_OPTIONS[CATEGORY_TYPES.FOOTWEAR]['EU / PK'];
    }
    if (categoryType === CATEGORY_TYPES.BEDDING) {
      return SIZE_OPTIONS[CATEGORY_TYPES.BEDDING];
    }
    // Apparel
    const audSizes = SIZE_OPTIONS[CATEGORY_TYPES.APPAREL]?.[form.audience] || SIZE_OPTIONS[CATEGORY_TYPES.APPAREL]?.default;
    return audSizes || SIZE_PRESETS[CATEGORY_TYPES.APPAREL];
  }, [categoryType, form.audience, form.specifications.shoeSizeSystem]);

  // Auto-generate slug and SKU from title
  const handleNameChange = (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const updates = { ...prev, name: val };
      // Always regenerate slug from name
      updates.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';
      // Regenerate SKU only if it is a draft/auto-generated one (prevent overwriting user edits)
      if (!prev.sku || prev.sku.startsWith('NK-DFT') || prev.sku === 'NK') {
        const nextSku = generateSKU(val, prev.audience);
        updates.sku = nextSku;
        // Automatically sync variant SKUs to match the new product SKU
        if (Array.isArray(prev.variants)) {
          updates.variants = prev.variants.map((v, i) => ({
            ...v,
            sku: `${nextSku}-${v.size || i + 1}`.toUpperCase(),
          }));
        }
      }
      return updates;
    });
  };

  // Filtered categories for combobox — filter by selected audience FIRST,
  // then by resilient search text (supporting smart quotes, apostrophes, and token matching).
  const filteredCategories = useMemo(() => {
    // Step 1: keep only categories that match the currently selected audience
    const byAudience = form.audience
      ? categories.filter((c) =>
          (c.audience || '').toLowerCase() === form.audience.toLowerCase()
        )
      : [];

    // Step 2: further narrow by search query
    if (!catSearch.trim()) return byAudience;
    return byAudience.filter((c) => categoryMatchesSearch(c, catSearch));
  }, [categories, catSearch, form.audience]);

  const updateSpec = (key, value) => {
    setForm((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  // Add component chip to apparel outfit
  const handleAddComponent = (pieceName) => {
    const trimmed = pieceName?.trim();
    if (!trimmed) return;
    const current = Array.isArray(form.specifications.components) ? form.specifications.components : [];
    if (!current.includes(trimmed)) {
      updateSpec('components', [...current, trimmed]);
    }
    setNewPieceInput('');
  };

  const handleRemoveComponent = (pieceName) => {
    const current = Array.isArray(form.specifications.components) ? form.specifications.components : [];
    updateSpec('components', current.filter((p) => p !== pieceName));
  };

  // Package contents helpers for Bedding
  const handleAddPackageItem = () => {
    if (!newPkgItemName.trim()) return;
    const current = Array.isArray(form.specifications.packageContents) ? form.specifications.packageContents : [];
    const updated = [...current, { item: newPkgItemName.trim(), qty: Math.max(1, Number(newPkgItemQty) || 1) }];
    updateSpec('packageContents', updated);
    updateSpec('setIncludes', updated.map((p) => `${p.qty} × ${p.item}`).join(' + '));
    setNewPkgItemName('');
    setNewPkgItemQty(1);
  };

  const handleRemovePackageItem = (index) => {
    const current = Array.isArray(form.specifications.packageContents) ? form.specifications.packageContents : [];
    const updated = current.filter((_, i) => i !== index);
    updateSpec('packageContents', updated);
    updateSpec('setIncludes', updated.map((p) => `${p.qty} × ${p.item}`).join(' + '));
  };

  const handleUpdatePackageItemQty = (index, delta) => {
    const current = Array.isArray(form.specifications.packageContents) ? form.specifications.packageContents : [];
    const updated = current.map((item, i) => {
      if (i === index) {
        return { ...item, qty: Math.max(1, (Number(item.qty) || 1) + delta) };
      }
      return item;
    });
    updateSpec('packageContents', updated);
    updateSpec('setIncludes', updated.map((p) => `${p.qty} × ${p.item}`).join(' + '));
  };

  // Custom size addition helper
  const handleAddCustomSize = (sizeValue) => {
    const trimmed = sizeValue?.trim();
    if (!trimmed) return;
    handleToggleSizePill(trimmed);
    setCustomSizeInput('');
    setShowCustomSizeField(false);
  };

  // Toggle size from preset pills
  const handleToggleSizePill = (size) => {
    setForm((prev) => {
      const exists = prev.variants.some((v) => v.size === size);
      if (exists) {
        // Remove if more than 1 variant, otherwise prompt or keep
        if (prev.variants.length > 1) {
          return {
            ...prev,
            variants: prev.variants.filter((v) => v.size !== size),
          };
        }
        toast.info('At least one size option is maintained. Toggle "This product has multiple sizes" above for single item inventory.');
        return prev;
      }

      // Add new variant for this size with auto-generated variant SKU
      const baseSku = prev.sku || generateSKU(prev.name, prev.audience);
      const newSku = `${baseSku}-${size}`.toUpperCase();
      const newVariant = {
        sku: newSku,
        size,
        color: selectedColor,
        stock: 10,
        priceOverride: null,
      };

      return {
        ...prev,
        sku: prev.sku || baseSku,
        variants: [...prev.variants, newVariant],
      };
    });
  };

  const handleUpdateVariant = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.variants];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, variants: next };
    });
  };

  const handleAddVariant = () => {
    setForm((prev) => {
      const baseSku = prev.sku || generateSKU(prev.name, prev.audience);
      const newIndex = prev.variants.length + 1;
      const newSku = `${baseSku}-VAR${newIndex}`.toUpperCase();
      const newVariant = {
        sku: newSku,
        size: 'Custom',
        color: selectedColor || 'Standard',
        stock: 10,
        priceOverride: null,
      };
      toast.success('New variant field added');
      return {
        ...prev,
        sku: prev.sku || baseSku,
        variants: [...prev.variants, newVariant],
      };
    });
  };

  const handleDuplicateVariant = (index) => {
    setForm((prev) => {
      const source = prev.variants[index];
      if (!source) return prev;
      const baseSku = prev.sku || generateSKU(prev.name, prev.audience);
      const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      const newSku = `${baseSku}-${source.size || 'VAR'}-${randomSuffix}`.toUpperCase();
      const duplicate = {
        ...source,
        sku: newSku,
        color: `${source.color || 'Ivory'} (Copy)`,
        stock: source.stock || 0,
      };
      const nextVariants = [...prev.variants];
      nextVariants.splice(index + 1, 0, duplicate);
      toast.success(`Duplicated variant (${source.size})`);
      return {
        ...prev,
        sku: prev.sku || baseSku,
        variants: nextVariants,
      };
    });
  };

  const handleRemoveVariant = (index) => {
    setForm((prev) => {
      if (prev.variants.length <= 1) {
        toast.info('To remove all variants, uncheck "This product has multiple sizes or colors" above.');
        return prev;
      }
      return {
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      };
    });
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isNew) {
        return await apiClient('/admin/products', {
          method: 'POST',
          body: payload,
        });
      }
      return await apiClient(`/admin/products/${productId}`, {
        method: 'PATCH',
        body: payload,
      });
    },
    onSuccess: () => {
      const msg = form.status === 'published'
        ? (isNew ? 'Product created and published successfully.' : 'Product published successfully.')
        : (isNew ? 'Product created as draft.' : 'Product changes saved successfully.');
      toast.success(msg);
      if (!isNew && productId) {
        queryClient.invalidateQueries(['admin', 'product', productId]);
      }
      queryClient.invalidateQueries(['admin', 'products']);
      // When creating a new product, remove any stale 'new' query entry so that
      // if the user navigates back to /admin/products/new, TanStack Query does not
      // replay the just-submitted form state into the useState initializer.
      if (isNew) {
        queryClient.removeQueries({ queryKey: ['admin', 'product', 'new'] });
      }
      // Use replace (not push) so /admin/products/new is NOT kept in browser history.
      // This prevents the back-button from returning to a stale cached form page.
      router.replace('/admin/products');
    },
    onError: (err) => {
      toast.error(err.message || (isNew ? 'Failed to create product.' : 'Failed to update product.'));
    },
  });

  const handleSave = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }
    const targetCategory = form.category || (isNew && categories.length > 0 ? categories[0]._id : '');
    if (!targetCategory) {
      toast.error('Please select a category');
      return;
    }

    const payloadName = form.name.trim();
    const payloadSku = form.sku.trim() || generateSKU(payloadName, form.audience);
    const payloadSlug = form.slug.trim() || payloadName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';

    const payload = {
      name: payloadName,
      slug: payloadSlug,
      sku: payloadSku,
      audience: form.audience,
      category: targetCategory,
      price: Math.round(Number(form.price)) || 1000,
      compareAtPrice: form.compareAtPrice ? Math.round(Number(form.compareAtPrice)) : null,
      sale: form.sale?.isEnabled
        ? {
            isEnabled: true,
            salePrice: form.sale.salePrice ? Math.round(Number(form.sale.salePrice)) : null,
            campaignName: form.sale.campaignName?.trim() || null,
            startsAt: form.sale.startsAt ? new Date(form.sale.startsAt) : null,
            endsAt: form.sale.endsAt ? new Date(form.sale.endsAt) : null,
          }
        : {
            isEnabled: false,
            salePrice: null,
            campaignName: null,
            startsAt: null,
            endsAt: null,
          },
      description: form.description.trim(),
      status: form.status,
      isBestSeller: Boolean(form.isBestSeller),
      isFeatured: Boolean(form.isFeatured),
      images: form.images,
      hasVariants: form.hasVariants,
      stock: form.hasVariants
        ? form.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
        : Math.max(0, Number(form.stock) || 0),
      variants: form.hasVariants
        ? form.variants.map((v, i) => ({
            ...v,
            sku: v.sku?.trim() || `${payloadSku}-${v.size || i + 1}`,
          }))
        : [],
      specifications: form.specifications,
      // Legacy compatibility fields
      fabric: form.specifications?.fabric || '',
    };

    saveMutation.mutate(payload);
  };

  const totalCalculatedStock = form.hasVariants
    ? form.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    : Number(form.stock) || 0;

  return (
    <form
      onSubmit={handleSave}
      onKeyDown={(e) => {
        // Prevent accidental form submission when pressing Enter in single-line inputs
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}
      className="space-y-8 max-w-7xl mx-auto pb-16"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E1DA]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="p-2 rounded-xl border border-[#E6E1DA] bg-white hover:bg-[#F6F2EC] text-[#151515] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
              <Link href="/admin/products" className="hover:text-[#151515]">
                Products
              </Link>
              <span>/</span>
              <span>{isNew ? 'New Product' : 'Edit Product'}</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#151515] mt-0.5">
              {form.name || (isNew ? 'New Product' : 'Untitled Product')}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-[#E6E1DA] text-[#151515] focus:outline-none focus:border-[#151515]"
          >
            <option value="draft">Save as Draft</option>
            <option value="published">Publish to Store</option>
          </select>

          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs font-semibold text-[#151515] hover:bg-[#F6F2EC] transition-colors"
          >
            Cancel
          </button>

          <Button
            type="submit"
            isLoading={saveMutation.isPending}
            className="rounded-xl px-5 py-2 text-xs font-semibold flex items-center gap-1.5 bg-[#151515] text-white hover:bg-black"
          >
            <Save className="w-3.5 h-3.5" />
            {isNew ? (form.status === 'published' ? 'Publish to Store' : 'Save as Draft') : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Form Specifications (8 cols) + Media & Storefront Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Primary Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Basic Information Card */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="font-serif text-base font-bold text-[#151515]">
              Basic Information
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#151515]">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={handleNameChange}
                placeholder="e.g. Pure Cotton Embroidered Lawn Suit"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Target Audience *</label>
                <CustomSelect
                  value={form.audience}
                  onChange={(newAudience) => {
                    const pieceOpts = PIECE_OPTIONS[newAudience] || PIECE_OPTIONS.default;
                    const defaultPiece = pieceOpts[0]?.value || '1-Piece';
                    const defaultComponents = pieceOpts[0]?.components || ['Garment'];
                    setForm((prev) => ({
                      ...prev,
                      audience: newAudience,
                      category: '', // force re-selection of a matching category
                      specifications: {
                        ...prev.specifications,
                        suitPieces: defaultPiece,
                        customPieces: '',
                        components: defaultComponents,
                      },
                    }));
                  }}
                  options={[
                    { value: 'women', label: 'Women' },
                    { value: 'men', label: 'Men' },
                    { value: 'kids', label: 'Kids' },
                    { value: 'footwear', label: 'Footwear (Shoes / Sandals)' },
                    { value: 'home', label: 'Home & Bedding' },
                    { value: 'collections', label: 'Collections' },
                  ]}
                />
              </div>

              {/* Searchable Category Combobox */}
              <div className="space-y-1" ref={catBoxRef}>
                <label className="text-xs font-semibold text-[#151515]">Category *</label>
                <div className={`relative ${catOpen ? 'z-30' : 'z-10'}`}>
                  {/* Trigger button */}
                  <button
                    type="button"
                    onClick={() => { setCatOpen((o) => !o); setCatSearch(''); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-[#F6F2EC] text-xs text-left transition-colors ${
                      catOpen ? 'border-[#151515] ring-1 ring-[#151515]' : 'border-[#E6E1DA] hover:border-[#151515]'
                    }`}
                  >
                    <span className={form.category ? 'text-[#151515] font-medium' : 'text-[#9B9692]'}>
                      {form.category
                        ? (() => {
                            const cat = categories.find((c) => c._id === form.category);
                            return cat ? `${cat.name} (${cat.audience})` : 'Select Category';
                          })()
                        : 'Select Category'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#6B6B6B] transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown panel — Always opens on bottom side */}
                  {catOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-[#E6E1DA] rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 duration-150">
                      {/* Search box inside dropdown */}
                      <div className="p-2 border-b border-[#F0EDE8]">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9B9692] pointer-events-none" />
                          <input
                            autoFocus
                            type="text"
                            value={catSearch}
                            onChange={(e) => setCatSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (filteredCategories.length > 0) {
                                  const c = filteredCategories[0];
                                  const catConfig = getCategoryConfig(c, c.audience || form.audience);
                                  setForm((prev) => {
                                    const nextSpecs = { ...prev.specifications };
                                    if (catConfig.defaultPieces) {
                                      const pieceOpts = PIECE_OPTIONS[prev.audience] || PIECE_OPTIONS.default;
                                      const matchedOpt = pieceOpts.find((o) => o.id === catConfig.defaultPieces || o.value === catConfig.defaultPieces);
                                      if (matchedOpt) {
                                        nextSpecs.suitPieces = matchedOpt.value;
                                        nextSpecs.components = matchedOpt.components;
                                      }
                                    }
                                    return {
                                      ...prev,
                                      category: c._id,
                                      specifications: nextSpecs,
                                    };
                                  });
                                  setCatOpen(false);
                                  setCatSearch('');
                                }
                              }
                            }}
                            placeholder="Search categories..."
                            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] focus:outline-none focus:ring-1 focus:ring-[#151515]"
                          />
                          {catSearch && (
                            <button type="button" onClick={() => setCatSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                              <X className="w-3 h-3 text-[#9B9692]" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Options list with smooth scroll */}
                      <ul
                        className="max-h-56 overflow-y-auto py-1 scroll-smooth"
                        style={{ scrollbarWidth: 'thin' }}
                      >
                        {!form.audience ? (
                          <li className="px-4 py-6 text-xs text-[#9B9692] text-center">
                            ⬆️ Please select a <strong>Target Audience</strong> first
                          </li>
                        ) : filteredCategories.length === 0 ? (
                          <li className="px-4 py-3 text-xs text-[#9B9692] text-center">
                            No <strong className="text-[#151515]">{form.audience}</strong> categories found.
                            <br />
                            <span className="text-[10px]">Create one in the Categories section first.</span>
                          </li>
                        ) : (
                          filteredCategories.map((c) => (
                            <li key={c._id}>
                              <button
                                type="button"
                                onClick={() => {
                                  const catConfig = getCategoryConfig(c, c.audience || form.audience);
                                  setForm((prev) => {
                                    const nextSpecs = { ...prev.specifications };
                                    if (catConfig.defaultPieces) {
                                      const pieceOpts = PIECE_OPTIONS[prev.audience] || PIECE_OPTIONS.default;
                                      const matchedOpt = pieceOpts.find((o) => o.id === catConfig.defaultPieces || o.value === catConfig.defaultPieces);
                                      if (matchedOpt) {
                                        nextSpecs.suitPieces = matchedOpt.value;
                                        nextSpecs.components = matchedOpt.components;
                                      }
                                    }
                                    return {
                                      ...prev,
                                      category: c._id,
                                      specifications: nextSpecs,
                                    };
                                  });
                                  setCatOpen(false);
                                  setCatSearch('');
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2 text-xs text-left transition-colors ${
                                  form.category === c._id
                                    ? 'bg-[#151515] text-white'
                                    : 'text-[#151515] hover:bg-[#F6F2EC]'
                                }`}
                              >
                                <span className="font-medium">{c.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                  form.category === c._id ? 'bg-white/20 text-white' : 'bg-[#F6F2EC] text-[#6B6B6B]'
                                }`}>
                                  {c.audience}
                                </span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Selling Price (Rs.) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] focus:outline-none focus:border-[#151515] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#151515]">Original Price (Rs., Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  placeholder="Optional crossed-out retail price"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] focus:outline-none focus:border-[#151515] font-mono"
                />
              </div>
            </div>

            {/* Dedicated Sale Configuration */}
            <div className="p-4 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#151515] block">Enable Sale</span>
                  <span className="text-[11px] text-[#6B6B6B]">
                    Qualify product for dedicated Sales page with an active promotional price.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(form.sale?.isEnabled)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sale: { ...form.sale, isEnabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-[#B82A2E] focus:ring-[#B82A2E] cursor-pointer"
                />
              </div>

              {form.sale?.isEnabled && (
                <div className="space-y-3 pt-3 border-t border-[#E6E1DA]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#B82A2E]">
                          Sale Price (Rs.) *
                        </label>
                        {Number(form.sale?.salePrice) > 0 && Number(form.price) > Number(form.sale?.salePrice) && (
                          <span className="text-[10px] font-bold text-[#B82A2E] bg-[#FDF2F2] px-2 py-0.5 rounded-full">
                            Save {Math.round(((Number(form.price) - Number(form.sale.salePrice)) / Number(form.price)) * 100)}%
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={Number(form.price) ? Number(form.price) - 1 : undefined}
                        value={form.sale?.salePrice || ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            sale: { ...form.sale, salePrice: e.target.value },
                          })
                        }
                        placeholder="Promotional selling price (must be < regular price)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#B82A2E]/40 bg-white text-xs text-[#151515] focus:outline-none focus:border-[#B82A2E] font-mono"
                      />
                      {Number(form.sale?.salePrice) >= Number(form.price) && (
                        <p className="text-[11px] text-[#B82A2E]">
                          Sale price must be lower than the regular selling price ({form.price} PKR).
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#151515]">
                        Campaign Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.sale?.campaignName || ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            sale: { ...form.sale, campaignName: e.target.value },
                          })
                        }
                        placeholder="e.g. Eid Festive Sale, Friday Special"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-white text-xs text-[#151515] focus:outline-none focus:border-[#151515]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#151515]">Start Date (Optional)</label>
                      <input
                        type="date"
                        value={form.sale?.startsAt || ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            sale: { ...form.sale, startsAt: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs text-[#151515]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#151515]">End Date (Optional)</label>
                      <input
                        type="date"
                        value={form.sale?.endsAt || ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            sale: { ...form.sale, endsAt: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs text-[#151515]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#151515]">Product Description</label>
                <span className="text-[11px] text-[#8E8B85]">
                  {form.description ? `${form.description.length} characters` : 'Multi-paragraph supported'}
                </span>
              </div>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write detailed product story, fabric weave, embroidery motifs, design aesthetics, and what the package includes across multiple paragraphs..."
                className="w-full px-3.5 py-3 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] leading-relaxed focus:outline-none focus:border-[#151515] resize-y min-h-[140px]"
              />
            </div>

            {/* Auto-Identifier Info (Read-Only — system managed) */}
            <div className="pt-2 border-t border-[#F6F2EC]">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#151515] font-medium"
              >
                <span>{showAdvanced ? 'Hide' : 'Show'} System Identifiers (URL Slug & SKU)</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 bg-[#F6F2EC]/40 rounded-xl border border-[#E6E1DA]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-[#6B6B6B]">URL Slug</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#E6E1DA] text-[#6B6B6B] font-bold uppercase">Auto</span>
                    </div>
                    <div className="w-full px-3 py-1.5 rounded-lg border border-[#E6E1DA] bg-white/60 text-xs font-mono text-[#6B6B6B] truncate select-all">
                      {form.slug || '—'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-[#6B6B6B]">Product SKU</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#E6E1DA] text-[#6B6B6B] font-bold uppercase">Auto</span>
                    </div>
                    <div className="w-full px-3 py-1.5 rounded-lg border border-[#E6E1DA] bg-white/60 text-xs font-mono text-[#151515] font-bold select-all">
                      {form.sku || '—'}
                    </div>
                  </div>
                  <p className="sm:col-span-2 text-[10px] text-[#9B9692]">
                    Both identifiers are automatically generated and managed by the system based on product title and category.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Category-Specific Specifications Card (Adaptive & Intelligent Engine) */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F6F2EC]">
              <div>
                <h2 className="font-serif text-base font-bold text-[#151515]">
                  {categoryType === CATEGORY_TYPES.FOOTWEAR
                    ? 'Footwear Specifications'
                    : categoryType === CATEGORY_TYPES.BEDDING
                    ? 'Bedding & Home Specifications'
                    : 'Garment & Fabric Details'}
                </h2>
                <p className="text-xs text-[#6B6B6B]">
                  {categoryConfig.label || 'Intelligent Specification Profile'} &bull; Audience: <span className="font-semibold capitalize text-[#151515]">{form.audience}</span>
                </p>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#151515] text-white uppercase tracking-wider">
                {categoryType}
              </span>
            </div>

            {/* A. If Footwear (Shoes / Sandals) */}
            {categoryType === CATEGORY_TYPES.FOOTWEAR && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Footwear Style / Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Footwear Style / Type</label>
                    <CustomSelect
                      value={form.specifications.footwearStyle || ''}
                      placeholder="Select Footwear Style (Optional)..."
                      onChange={(val) => {
                        updateSpec('footwearStyle', val);
                        if (val !== 'Custom') updateSpec('customFootwearStyle', '');
                      }}
                      options={[
                        { value: '', label: '— None / Not Specified —' },
                        'Traditional Khussa',
                        'Peshawari Chappal (Noruzi/Kheri)',
                        'Kolhapuri Chappal',
                        'Block Heels',
                        'Stilettos / Pumps',
                        'Wedges',
                        'Flat Sandals',
                        'Slides & Slippers',
                        'Sneakers & Casual Shoes',
                        'Loafers & Moccasins',
                        'Formal Shoes (Oxford/Derby)',
                        'Winter Boots',
                        'School Shoes',
                        { value: 'Custom', label: '✏️ Custom Footwear Type…' },
                      ]}
                    />
                    {form.specifications.footwearStyle === 'Custom' && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Enter custom footwear type (e.g. Handmade Turban Jooti)"
                        value={form.specifications.customFootwearStyle || ''}
                        onChange={(e) => updateSpec('customFootwearStyle', e.target.value)}
                        className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-[#151515] bg-white text-xs text-[#151515]"
                      />
                    )}
                  </div>

                  {/* Size System */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Sizing System</label>
                    <CustomSelect
                      value={form.specifications.shoeSizeSystem || 'EU / PK (Standard)'}
                      onChange={(val) => updateSpec('shoeSizeSystem', val)}
                      options={[
                        { value: 'EU / PK (Standard)', label: 'EU / PK Standard (36 - 46)' },
                        { value: 'UK Size', label: 'UK Size (3 - 12)' },
                        { value: 'US Size', label: 'US Size (4 - 13)' },
                      ]}
                    />
                  </div>

                  {/* Upper Material */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Upper Material</label>
                    <CustomSelect
                      value={['Genuine Cow Leather', 'Velvet / Raw Silk', 'Microfiber / PU Leather', 'Canvas', 'Suede', 'Patent Leather', ''].includes(form.specifications.upperMaterial || '') ? (form.specifications.upperMaterial || '') : (form.specifications.upperMaterial ? 'Custom' : '')}
                      placeholder="Select Upper Material (Optional)..."
                      onChange={(val) => {
                        if (val !== 'Custom') {
                          updateSpec('upperMaterial', val);
                          updateSpec('customUpperMaterial', '');
                        } else {
                          updateSpec('upperMaterial', 'Custom');
                        }
                      }}
                      options={[
                        { value: '', label: '— None / Not Specified —' },
                        'Genuine Cow Leather',
                        'Velvet / Raw Silk',
                        'Microfiber / PU Leather',
                        'Canvas',
                        'Suede',
                        'Patent Leather',
                        { value: 'Custom', label: '✏️ Custom Upper…' },
                      ]}
                    />
                    {(form.specifications.upperMaterial === 'Custom' || form.specifications.customUpperMaterial) && (
                      <input
                        type="text"
                        placeholder="e.g. Hand-spun Jute Fabric"
                        value={form.specifications.customUpperMaterial || ''}
                        onChange={(e) => {
                          updateSpec('customUpperMaterial', e.target.value);
                          updateSpec('upperMaterial', e.target.value);
                        }}
                        className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-[#151515] bg-white text-xs text-[#151515]"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Sole Material */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Sole Material</label>
                    <CustomSelect
                      value={['Handcrafted Leather Sole', 'Tyre Rubber Sole', 'TPR Molded Rubber', 'Sheet Sole', 'Memory Foam Cushioned', ''].includes(form.specifications.soleMaterial || '') ? (form.specifications.soleMaterial || '') : (form.specifications.soleMaterial ? 'Custom' : '')}
                      placeholder="Select Sole Material (Optional)..."
                      onChange={(val) => {
                        if (val !== 'Custom') {
                          updateSpec('soleMaterial', val);
                          updateSpec('customSoleMaterial', '');
                        } else {
                          updateSpec('soleMaterial', 'Custom');
                        }
                      }}
                      options={[
                        { value: '', label: '— None / Not Specified —' },
                        'Handcrafted Leather Sole',
                        'Tyre Rubber Sole',
                        'TPR Molded Rubber',
                        'Sheet Sole',
                        'Memory Foam Cushioned',
                        { value: 'Custom', label: '✏️ Custom Sole…' },
                      ]}
                    />
                    {(form.specifications.soleMaterial === 'Custom' || form.specifications.customSoleMaterial) && (
                      <input
                        type="text"
                        placeholder="e.g. Wood Platform with Rubber Tap"
                        value={form.specifications.customSoleMaterial || ''}
                        onChange={(e) => {
                          updateSpec('customSoleMaterial', e.target.value);
                          updateSpec('soleMaterial', e.target.value);
                        }}
                        className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-[#151515] bg-white text-xs text-[#151515]"
                      />
                    )}
                  </div>

                  {/* Closure / Fastening */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Closure & Fastening</label>
                    <CustomSelect
                      value={['Slip-on', 'Buckle Strap', 'Lace-up', 'Velcro', 'Zipper', 'Elastic / Stretch', ''].includes(form.specifications.closureType || '') ? (form.specifications.closureType || '') : (form.specifications.closureType ? 'Custom' : '')}
                      placeholder="Select Fastening (Optional)..."
                      onChange={(val) => {
                        if (val !== 'Custom') {
                          updateSpec('closureType', val);
                          updateSpec('customClosureType', '');
                        } else {
                          updateSpec('closureType', 'Custom');
                        }
                      }}
                      options={[
                        { value: '', label: '— None / Not Specified —' },
                        { value: 'Slip-on', label: 'Slip-on (Traditional)' },
                        { value: 'Buckle Strap', label: 'Buckle Strap' },
                        { value: 'Lace-up', label: 'Lace-up' },
                        { value: 'Velcro', label: 'Velcro' },
                        { value: 'Zipper', label: 'Zipper' },
                        { value: 'Elastic / Stretch', label: 'Elastic / Stretch' },
                        { value: 'Custom', label: '✏️ Custom Fastening…' },
                      ]}
                    />
                    {(form.specifications.closureType === 'Custom' || form.specifications.customClosureType) && (
                      <input
                        type="text"
                        placeholder="e.g. Traditional Ankle Tie"
                        value={form.specifications.customClosureType || ''}
                        onChange={(e) => {
                          updateSpec('customClosureType', e.target.value);
                          updateSpec('closureType', e.target.value);
                        }}
                        className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-[#151515] bg-white text-xs text-[#151515]"
                      />
                    )}
                  </div>

                  {/* Shoe Fit Profile */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Fit Profile</label>
                    <CustomSelect
                      value={form.specifications.shoeFit || ''}
                      placeholder="Select Fit Profile (Optional)..."
                      onChange={(val) => updateSpec('shoeFit', val)}
                      options={[
                        { value: '', label: '— None / Not Specified —' },
                        'True to Size',
                        'Runs Narrow (Order 1 size up)',
                        'Runs Wide',
                        'Relaxed Fit',
                      ]}
                    />
                  </div>
                </div>

                {/* Conditional Fields: Heels, Embellishment & Boots */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F6F2EC]">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Heel Height & Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat, 2.5 inch Block Heel, Stiletto"
                      value={form.specifications.heelHeight || ''}
                      onChange={(e) => updateSpec('heelHeight', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Embellishment / Craftwork</label>
                    <input
                      type="text"
                      placeholder="e.g. Hand Tilla Embroidery, Dabka, Mirror Work"
                      value={form.specifications.embellishment || ''}
                      onChange={(e) => updateSpec('embellishment', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Boot Height / Weather Lining</label>
                    <input
                      type="text"
                      placeholder="e.g. Ankle Height, Faux Fur Lined"
                      value={form.specifications.bootHeight || ''}
                      onChange={(e) => updateSpec('bootHeight', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Footwear Care Guidelines</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Store in breathable cotton dust bag. Wipe with dry soft cloth. Keep away from water and direct sun."
                    value={form.specifications.care || ''}
                    onChange={(e) => updateSpec('care', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] resize-y min-h-[60px]"
                  />
                </div>
              </div>
            )}

            {/* B. If Bedding (Bedsheets / Home) */}
            {categoryType === CATEGORY_TYPES.BEDDING && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bed Size */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Bed Size</label>
                    <CustomSelect
                      value={['King (Standard)', 'Queen', 'Double', 'Single', 'Super King', ''].includes(form.specifications.bedSize || '') ? (form.specifications.bedSize || '') : (form.specifications.bedSize ? 'Custom' : '')}
                      placeholder="Select Bed Size (Optional)..."
                      onChange={(val) => {
                        const BED_SIZE_PRESETS = {
                          'King (Standard)': { length: '95', width: '100', unit: 'inches' },
                          'Queen': { length: '90', width: '100', unit: 'inches' },
                          'Double': { length: '85', width: '95', unit: 'inches' },
                          'Single': { length: '60', width: '90', unit: 'inches' },
                          'Super King': { length: '108', width: '108', unit: 'inches' },
                        };

                        if (val !== 'Custom') {
                          updateSpec('bedSize', val);
                          updateSpec('customBedSize', '');
                          if (BED_SIZE_PRESETS[val]) {
                            updateSpec('dimensions', BED_SIZE_PRESETS[val]);
                          }
                        } else {
                          updateSpec('bedSize', 'Custom');
                        }
                      }}
                      options={[
                        { value: '', label: '— None / Not Specified —' },
                        { value: 'King (Standard)', label: 'King Size (Standard 95 × 100 in)' },
                        { value: 'Queen', label: 'Queen Size (90 × 100 in)' },
                        { value: 'Double', label: 'Double Bed (85 × 95 in)' },
                        { value: 'Single', label: 'Single Bed (60 × 90 in)' },
                        { value: 'Super King', label: 'Super King (108 × 108 in)' },
                        { value: 'Custom', label: '✏️ Custom Bed Size…' },
                      ]}
                    />
                    {(form.specifications.bedSize === 'Custom' || form.specifications.customBedSize) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="e.g. Custom Bridal Bed (110 × 110 in)"
                        value={form.specifications.customBedSize || ''}
                        onChange={(e) => {
                          updateSpec('customBedSize', e.target.value);
                          updateSpec('bedSize', e.target.value);
                        }}
                        className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-[#151515] bg-white text-xs text-[#151515]"
                      />
                    )}
                  </div>

                  {/* Sheet Style */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Sheet Style</label>
                    <CustomSelect
                      value={['Flat Sheet', 'Fitted Sheet', 'Bedspread / Coverlet', 'Duvet Cover', ''].includes(form.specifications.sheetType || '') ? (form.specifications.sheetType || '') : (form.specifications.sheetType ? 'Custom' : '')}
                      placeholder="Select Sheet Style (Optional)..."
                      onChange={(val) => {
                        if (val !== 'Custom') {
                          updateSpec('sheetType', val);
                          updateSpec('customSheetType', '');
                        } else {
                          updateSpec('sheetType', 'Custom');
                        }
                      }}
                      options={[
                        { value: '', label: '— None / Not Specified —' },
                        { value: 'Flat Sheet', label: 'Flat Sheet (Standard)' },
                        { value: 'Fitted Sheet', label: 'Fitted Sheet (Elastic Border)' },
                        { value: 'Bedspread / Coverlet', label: 'Bedspread / Coverlet' },
                        { value: 'Duvet Cover', label: 'Duvet Cover' },
                        { value: 'Custom', label: '✏️ Custom Sheet Style…' },
                      ]}
                    />
                    {(form.specifications.sheetType === 'Custom' || form.specifications.customSheetType) && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="e.g. Ruffled Edge Fitted Sheet"
                        value={form.specifications.customSheetType || ''}
                        onChange={(e) => {
                          updateSpec('customSheetType', e.target.value);
                          updateSpec('sheetType', e.target.value);
                        }}
                        className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-[#151515] bg-white text-xs text-[#151515]"
                      />
                    )}
                  </div>
                </div>

                {/* Actual Dimensions with Unit */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#151515]">Actual Dimensions (Length × Width)</label>
                    <span className="text-[11px] text-[#8E8B85]">Auto-syncs with Bed Size or customize manually</span>
                  </div>
                  <div className="flex items-center gap-2 max-w-md">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Length"
                        value={form.specifications.dimensions?.length || ''}
                        onChange={(e) => updateSpec('dimensions', { ...form.specifications.dimensions, length: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] text-center font-medium"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8E8B85] uppercase">L</span>
                    </div>
                    <span className="text-xs font-bold text-[#6B6B6B]">×</span>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Width"
                        value={form.specifications.dimensions?.width || ''}
                        onChange={(e) => updateSpec('dimensions', { ...form.specifications.dimensions, width: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] text-center font-medium"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8E8B85] uppercase">W</span>
                    </div>
                    <select
                      value={form.specifications.dimensions?.unit || 'inches'}
                      onChange={(e) => updateSpec('dimensions', { ...form.specifications.dimensions, unit: e.target.value })}
                      className="px-3 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] font-semibold cursor-pointer shrink-0"
                    >
                      <option value="inches">in (Inches)</option>
                      <option value="cm">cm (Centimeters)</option>
                      <option value="meters">m (Meters)</option>
                    </select>
                  </div>
                </div>

                {/* Structured Package Contents Manager */}
                <div className="p-4 rounded-xl bg-[#F6F2EC]/60 border border-[#E6E1DA] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#151515] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#151515]" />
                      Package Contents (Itemized Structured Breakdown)
                    </label>
                    <span className="text-[11px] text-[#6B6B6B]">
                      {form.specifications.setIncludes || 'No items added'}
                    </span>
                  </div>

                  {/* Existing items list */}
                  <div className="space-y-2">
                    {(form.specifications.packageContents || []).map((pkgItem, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between gap-3 px-3 py-2 bg-white rounded-lg border border-[#E6E1DA]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 flex items-center justify-center rounded-md bg-[#F6F2EC] text-xs font-bold text-[#151515]">
                            {pkgItem.qty}
                          </span>
                          <span className="text-xs font-medium text-[#151515]">{pkgItem.item}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdatePackageItemQty(pIdx, -1)}
                            className="w-6 h-6 rounded border border-[#E6E1DA] flex items-center justify-center hover:bg-[#F6F2EC] text-xs font-bold"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdatePackageItemQty(pIdx, 1)}
                            className="w-6 h-6 rounded border border-[#E6E1DA] flex items-center justify-center hover:bg-[#F6F2EC] text-xs font-bold"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePackageItem(pIdx)}
                            className="p-1 rounded text-[#9B9692] hover:text-[#701C1C]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add package item inline */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      min="1"
                      value={newPkgItemQty}
                      onChange={(e) => setNewPkgItemQty(Math.max(1, Number(e.target.value)))}
                      className="w-14 px-2 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs text-center font-bold"
                      placeholder="Qty"
                    />
                    <input
                      type="text"
                      value={newPkgItemName}
                      onChange={(e) => setNewPkgItemName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPackageItem();
                        }
                      }}
                      placeholder="Add item (e.g. Cushion Cover, Pillowcase, Bolster)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs text-[#151515]"
                    />
                    <button
                      type="button"
                      onClick={handleAddPackageItem}
                      className="px-3 py-1.5 rounded-lg bg-[#151515] text-white text-xs font-semibold hover:bg-black flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Fabric / Thread Count</label>
                    <input
                      type="text"
                      placeholder="e.g. 100% Cotton Satin, 300 Thread Count, T-400 Percale"
                      value={form.specifications.fabric || ''}
                      onChange={(e) => updateSpec('fabric', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Filling / Batting Material</label>
                    <input
                      type="text"
                      placeholder="e.g. 350 GSM Virgin Microfiber, Duck Down"
                      value={form.specifications.fillingMaterial || ''}
                      onChange={(e) => updateSpec('fillingMaterial', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Care Guidelines</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Machine wash cold with similar colors. Gentle tumble dry low. Warm iron if necessary. Do not bleach."
                    value={form.specifications.care || ''}
                    onChange={(e) => updateSpec('care', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] resize-y min-h-[60px]"
                  />
                </div>
              </div>
            )}

            {/* C. If Apparel (Clothes / Suits / Lawn / Pret) */}
            {categoryType !== CATEGORY_TYPES.FOOTWEAR && categoryType !== CATEGORY_TYPES.BEDDING && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fabric Type with Quick Presets */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#151515]">Fabric Type *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Lawn, Cambric Cotton, Silk, Khaddar, Wash & Wear"
                      value={form.specifications.fabric || ''}
                      onChange={(e) => updateSpec('fabric', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {['Pure Lawn', 'Cambric Cotton', 'Silk', 'Chiffon', 'Khaddar', 'Wash & Wear', 'Velvet', 'Linen'].map((fab) => (
                        <button
                          key={fab}
                          type="button"
                          onClick={() => updateSpec('fabric', fab)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                            form.specifications.fabric === fab
                              ? 'bg-[#151515] text-white border-[#151515]'
                              : 'bg-white border-[#E6E1DA] text-[#6B6B6B] hover:text-[#151515]'
                          }`}
                        >
                          {fab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outfit Composition Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#151515]">Outfit Composition *</label>
                    {(() => {
                      const pieceOpts = PIECE_OPTIONS[form.audience] ?? PIECE_OPTIONS.default;
                      const currentVal = form.specifications.suitPieces || pieceOpts[0]?.value || '';
                      const isCustom = currentVal === 'Custom' || !pieceOpts.some((o) => o.value === currentVal);
                      return (
                        <div className="space-y-2">
                          <CustomSelect
                            value={isCustom ? 'Custom' : currentVal}
                            onChange={(selectedVal) => {
                              const matched = pieceOpts.find((o) => o.value === selectedVal);
                              updateSpec('suitPieces', selectedVal);
                              if (matched && matched.components?.length > 0) {
                                updateSpec('components', matched.components);
                              }
                              if (selectedVal !== 'Custom') {
                                updateSpec('customPieces', '');
                              }
                            }}
                            options={[
                              ...pieceOpts
                                .filter((o) => o.value !== 'Custom')
                                .map((o) => ({ value: o.value, label: o.label })),
                              { value: 'Custom', label: '✏️ Custom Composition…' },
                            ]}
                          />

                          {/* Custom free-text field — shown when 'Custom' is selected */}
                          {isCustom && (
                            <input
                              type="text"
                              autoFocus
                              placeholder="e.g. 4-Piece (Shirt + Dupatta + Trouser + Inner Slip)"
                              value={form.specifications.customPieces || ''}
                              onChange={(e) => updateSpec('customPieces', e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-[#151515] bg-white text-xs text-[#151515] focus:outline-none focus:ring-1 focus:ring-[#151515]"
                            />
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Structured Piece Components Builder */}
                <div className="p-3.5 rounded-xl bg-[#F6F2EC]/60 border border-[#E6E1DA] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#151515] flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-[#151515]" />
                      Included Garment Components
                    </label>
                    <span className="text-[11px] text-[#6B6B6B]">
                      {Array.isArray(form.specifications.components) && form.specifications.components.length > 0
                        ? `${form.specifications.components.length} item${form.specifications.components.length > 1 ? 's' : ''} included`
                        : 'Single piece garment'}
                    </span>
                  </div>

                  {/* Components Tag Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(Array.isArray(form.specifications.components) ? form.specifications.components : []).map((comp, cIdx) => (
                      <span
                        key={cIdx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E6E1DA] text-xs font-medium text-[#151515] shadow-2xs"
                      >
                        <span>{comp}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(comp)}
                          className="text-[#9B9692] hover:text-[#701C1C] rounded-full p-0.5"
                          title={`Remove ${comp}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Inline Add Component Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newPieceInput}
                      onChange={(e) => setNewPieceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddComponent(newPieceInput);
                        }
                      }}
                      placeholder="Add custom piece (e.g. Waistcoat, Dupatta, Inner Slip, Turban, Trouser)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs text-[#151515]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComponent(newPieceInput)}
                      className="px-3 py-1.5 rounded-lg bg-[#151515] text-white text-xs font-semibold hover:bg-black flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      Add Piece
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Fabric Composition / Blend (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 100% Combed Cotton, 80/20 Cotton-Polyester"
                      value={form.specifications.fabricComposition || ''}
                      onChange={(e) => updateSpec('fabricComposition', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#151515]">Shrinkage & Wash Note (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Pre-shrunk; expect ~2% shrinkage after first wash"
                      value={form.specifications.shrinkageNote || ''}
                      onChange={(e) => updateSpec('shrinkageNote', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#151515]">Care Guidelines</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Dry clean recommended. Wash in cold water below 30°C. Do not soak embroidered fabrics. Iron at moderate temperature."
                    value={form.specifications.care || ''}
                    onChange={(e) => updateSpec('care', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC] text-xs text-[#151515] resize-y min-h-[60px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Options & Inventory (Variants) Card - NO BROWSER PROMPTS */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F6F2EC]">
              <div>
                <h2 className="font-serif text-base font-bold text-[#151515]">
                  Options & Inventory
                </h2>
                <p className="text-xs text-[#6B6B6B]">
                  Manage sizes, colors, and stock on hand.
                </p>
              </div>

              {/* Single Item vs Multiple Variants Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.hasVariants}
                  onChange={(e) => setForm({ ...form, hasVariants: e.target.checked })}
                  className="rounded text-[#151515] focus:ring-[#151515] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#151515]">
                  This product has multiple sizes or colors
                </span>
              </label>
            </div>

            {/* MODE A: Single Item / No Variants */}
            {!form.hasVariants ? (
              <div className="p-4 rounded-xl bg-[#F6F2EC]/60 border border-[#E6E1DA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-[#151515] block">
                    Single Inventory Stock
                  </span>
                  <p className="text-[11px] text-[#6B6B6B]">
                    This product comes in only one standard version. Enter total units available.
                  </p>
                </div>
                <div className="w-full sm:w-48">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Math.max(0, Number(e.target.value)) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs font-mono font-bold text-[#151515] text-right"
                    />
                    <span className="text-xs text-[#6B6B6B] shrink-0">units</span>
                  </div>
                </div>
              </div>
            ) : (
              /* MODE B: Multiple Variants with One-Click Preset Badges */
              <div className="space-y-4">
                {/* Preset Size Pills & Add Custom Variant */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#151515] block">
                        Select Available Sizes for this {categoryType}:
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCustomSizeField(!showCustomSizeField)}
                        className="text-[11px] font-semibold text-[#151515] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Custom Size</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {availableSizes.filter((s) => s !== 'Custom').map((size) => {
                        const isSelected = form.variants.some((v) => v.size === size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleToggleSizePill(size)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-[#151515] text-white shadow-xs'
                                : 'bg-[#F6F2EC] text-[#6B6B6B] hover:text-[#151515] hover:bg-[#E6E1DA]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                            {size}
                          </button>
                        );
                      })}

                      {/* Display any custom sizes already attached to variants */}
                      {form.variants
                        .map((v) => v.size)
                        .filter((sz) => sz && !availableSizes.includes(sz))
                        .filter((sz, idx, arr) => arr.indexOf(sz) === idx)
                        .map((customSz) => (
                          <span
                            key={customSz}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#151515] text-white shadow-xs"
                          >
                            <Check className="w-3 h-3 inline" />
                            {customSz}
                          </span>
                        ))}
                    </div>

                    {/* Inline Custom Size Input */}
                    {showCustomSizeField && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#F6F2EC]">
                        <input
                          type="text"
                          autoFocus
                          placeholder="e.g. 48 Chest, 38/32, 108×108 in"
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSize(customSizeInput);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#151515] bg-white text-xs text-[#151515] w-60"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomSize(customSizeInput)}
                          className="px-3 py-1.5 rounded-lg bg-[#151515] text-white text-xs font-semibold hover:bg-black"
                        >
                          Add Size
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomSizeField(false);
                            setCustomSizeInput('');
                          }}
                          className="px-2 py-1.5 text-xs text-[#6B6B6B] hover:text-[#151515]"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="self-start sm:self-end inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#151515] bg-[#151515] hover:bg-black text-white text-xs font-medium transition-colors shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                {/* Variants Table with Inline Inputs */}
                <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F6F2EC] border-b border-[#E6E1DA] font-bold text-[#151515]">
                      <tr>
                        <th className="py-2.5 px-3 w-28">Size</th>
                        <th className="py-2.5 px-3 w-36">Color</th>
                        <th className="py-2.5 px-3">
                          <span className="flex items-center gap-1.5">
                            Variant SKU
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E6E1DA] text-[#6B6B6B] font-bold uppercase">Auto</span>
                          </span>
                        </th>
                        <th className="py-2.5 px-3 text-right w-32">Available Stock</th>
                        <th className="py-2.5 px-3 text-center w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E1DA]">
                      {form.variants.map((v, idx) => {
                        const computedVariantSku = v.sku || `${form.sku || 'NK'}-${v.size || idx + 1}`;
                        return (
                          <tr key={idx} className="hover:bg-[#F6F2EC]/40">
                            <td className="py-2.5 px-3 font-semibold text-[#151515]">
                              <input
                                type="text"
                                value={v.size}
                                placeholder="Size (e.g. M)"
                                onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                                className="w-20 px-2 py-1 bg-white border border-[#E6E1DA] rounded text-xs font-bold"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={v.color}
                                placeholder="e.g. Mint / Black"
                                onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                                className="w-28 px-2 py-1 bg-white border border-[#E6E1DA] rounded text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                title={computedVariantSku}
                                className="inline-block px-2.5 py-1 rounded bg-[#F6F2EC] border border-[#E6E1DA] text-[11px] font-mono text-[#555] font-medium max-w-[220px] truncate select-all"
                              >
                                {computedVariantSku}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => handleUpdateVariant(idx, 'stock', Math.max(0, Number(e.target.value)))}
                                className="w-20 px-2 py-1 bg-white border border-[#E6E1DA] rounded text-xs text-right font-mono font-bold"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateVariant(idx)}
                                  title="Duplicate this size / color variant"
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#151515] hover:bg-[#E6E1DA] transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {form.variants.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(idx)}
                                    title="Delete this variant"
                                    className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(idx)}
                                    title="Clear stock or remove single variant"
                                    className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#8E8B85] hover:text-[#151515] hover:bg-[#F6F2EC] transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-[#6B6B6B]">
                  <span>Total Variant Stock: <strong className="text-[#151515]">{totalCalculatedStock} units</strong></span>
                  <div className="flex items-center gap-3 text-[11px] text-[#8E8B85]">
                    <span>Click size badges to toggle presets</span>
                    <span>&bull;</span>
                    <span>Use <strong className="text-[#151515]">Copy</strong> to duplicate size with another color</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Media Upload & Storefront Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Images Card */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-[#151515]">Product Photos</h2>
              <span className="text-xs text-[#8E8B85]">{form.images?.length || 0} / 20</span>
            </div>

            <ImageUploader
              images={form.images}
              value={form.images}
              onChange={(newImages) => setForm({ ...form, images: newImages })}
              maxFiles={20}
              folder="nakaam/products"
            />
          </div>

          {/* Storefront Merchandising & Badges */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 space-y-4 shadow-xs">
            <div>
              <h2 className="font-serif text-base font-bold text-[#151515]">Merchandising & Badges</h2>
              <p className="text-xs text-[#6B6B6B]">Control homepage and catalog promotion flags.</p>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC]/40 hover:bg-[#F6F2EC] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(form.isBestSeller)}
                  onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                  className="rounded text-[#151515] focus:ring-[#151515] w-4 h-4 mt-0.5 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-[#151515] block">Mark as Best-Seller</span>
                  <span className="text-[#6B6B6B] text-[11px] leading-tight block mt-0.5">
                    Displays the "Best Seller" badge on storefront product cards and detail pages.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E6E1DA] bg-[#F6F2EC]/40 hover:bg-[#F6F2EC] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(form.isFeatured)}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded text-[#151515] focus:ring-[#151515] w-4 h-4 mt-0.5 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-[#151515] block">Featured Product</span>
                  <span className="text-[#6B6B6B] text-[11px] leading-tight block mt-0.5">
                    Eligible for top hero highlight and curated story editorial.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Clean Storefront Product Card Preview (Live interactive preview) */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8E8B85]">
              <span className="font-semibold text-[#151515] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Storefront Preview
              </span>
              <span className="capitalize">{categoryType}</span>
            </div>

            {/* Product Card Rendering */}
            <div className="rounded-xl overflow-hidden border border-[#E6E1DA] bg-[#F6F2EC]">
              <div className="relative aspect-[3/4] w-full bg-[#EFEAE2] flex items-center justify-center overflow-hidden">
                {form.images?.[0]?.url ? (
                  <img
                    src={form.images[0].url}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-sm text-[#8E8B85]">ناکام Store</span>
                )}
                <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#151515] text-white">
                    {form.audience?.toUpperCase() || 'WOMEN'}
                  </span>
                  {form.isBestSeller && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#151515] text-[#FAF8F5] shadow-xs">
                      Best Seller
                    </span>
                  )}
                  {form.sale?.isEnabled && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#B82A2E] text-white shadow-xs">
                      Sale
                    </span>
                  )}
                </div>
                {form.fabricType && (
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/90 text-[#151515] shadow-xs backdrop-blur-xs">
                    {form.fabricType}
                  </span>
                )}
              </div>

              <div className="p-3.5 bg-white space-y-1.5">
                <p className="font-serif text-xs font-bold text-[#151515] truncate">
                  {form.name || 'Untitled Product'}
                </p>

                {form.pieces && (
                  <p className="text-[10px] text-[#8E8B85] truncate">
                    {form.pieces}
                  </p>
                )}

                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-bold text-[#151515]">
                    {formatPKR(Number(form.price) || 0)}
                  </span>
                  {Boolean(form.compareAtPrice) && Number(form.compareAtPrice) > 0 && (
                    <span className="font-mono text-[10px] text-[#8E8B85] line-through">
                      {formatPKR(Number(form.compareAtPrice))}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-[#6B6B6B]">
                  <span>
                    {form.hasVariants && form.variants?.length > 0
                      ? `${form.variants.length} size options`
                      : 'Single Edition'}
                  </span>
                  <span className={totalCalculatedStock === 0 ? 'text-[#D12C2F] font-bold' : 'text-emerald-700 font-semibold'}>
                    {totalCalculatedStock === 0 ? 'Out of Stock' : `${totalCalculatedStock} in stock`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discard / Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          setShowCancelModal(false);
          router.push('/admin/products');
        }}
        title="Discard Changes?"
        message={isNew 
          ? "Are you sure you want to cancel? This product will NOT be saved to drafts or store." 
          : "Are you sure you want to cancel? Any unsaved edits will be discarded."}
        confirmText="Yes, Discard"
        cancelText="Keep Editing"
      />
    </form>
  );
}
