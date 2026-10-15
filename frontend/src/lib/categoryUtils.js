/**
 * Intelligent Product Configuration Engine — Nakaam E-Commerce (ناکام)
 * Single source of truth for Category Classification, Specification Profiles,
 * Structured Piece Compositions, Size Systems, and Variant Rules.
 */

export const CATEGORY_TYPES = {
  APPAREL: 'apparel',
  FOOTWEAR: 'footwear',
  BEDDING: 'bedding',
  GENERAL: 'general',
};

/**
 * 1. CATEGORY_CONFIG
 * Maps every known category slug / key to its target audience, product type,
 * specification profile, and human-readable label.
 */
export const CATEGORY_CONFIG = {
  // --- WOMEN'S APPAREL (5 Core Categories + Sub-types) ---
  'unstitched': {
    audience: 'women',
    productType: 'unstitched',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Unstitched Fabric & Suits',
    defaultPieces: '3-piece-classic',
  },
  'ready-to-wear': {
    audience: 'women',
    productType: 'ready-to-wear',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Ready to Wear (Pret)',
    defaultPieces: '1-piece-shirt',
  },
  'pret': {
    audience: 'women',
    productType: 'ready-to-wear',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Ready to Wear (Pret)',
    defaultPieces: '1-piece-shirt',
  },
  'formal-festive': {
    audience: 'women',
    productType: 'formal-festive',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Formal & Festive Wear',
    defaultPieces: '3-piece-classic',
  },
  'winter-wear-women': {
    audience: 'women',
    productType: 'winter-wear',
    profile: CATEGORY_TYPES.APPAREL,
    label: "Women's Winter Wear (Shawls, Velvet, Khaddar)",
    defaultPieces: '1-piece-shirt',
  },
  'dupattas-shawls': {
    audience: 'women',
    productType: 'dupattas-shawls',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Dupattas & Shawls',
    defaultPieces: 'single-shawl',
  },
  'bottomwear-women': {
    audience: 'women',
    productType: 'bottomwear',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Trousers, Shalwars & Tights',
    defaultPieces: 'single-bottom',
  },

  // --- MEN'S APPAREL (5 Core Categories + Sub-types) ---
  'shalwar-kameez': {
    audience: 'men',
    productType: 'shalwar-kameez',
    profile: CATEGORY_TYPES.APPAREL,
    label: "Men's Shalwar Kameez Suite",
    defaultPieces: '2-piece-men-suit',
  },
  'kurta-men': {
    audience: 'men',
    productType: 'kurta',
    profile: CATEGORY_TYPES.APPAREL,
    label: "Men's Kurta",
    defaultPieces: '1-piece-kurta',
  },
  'waistcoats-coats': {
    audience: 'men',
    productType: 'waistcoats-coats',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Waistcoats, Prince Coats & Blazers',
    defaultPieces: 'single-waistcoat',
  },
  'trousers-pajamas': {
    audience: 'men',
    productType: 'trousers-pajamas',
    profile: CATEGORY_TYPES.APPAREL,
    label: "Men's Trousers, Shalwars & Pajamas",
    defaultPieces: 'single-bottom-men',
  },
  'winter-wear-men': {
    audience: 'men',
    productType: 'winter-wear',
    profile: CATEGORY_TYPES.APPAREL,
    label: "Men's Winter Wear (Shawls & Jackets)",
    defaultPieces: '1-piece-kurta',
  },

  // --- KIDS APPAREL (10 Core Categories) ---
  'boys-shalwar-kameez': {
    audience: 'kids',
    productType: 'boys-shalwar-kameez',
    profile: CATEGORY_TYPES.APPAREL,
    label: "Boys Shalwar Kameez",
    subAudience: 'boys',
    defaultPieces: '2-piece-boys-suit',
  },
  'boys-kurta-sets': {
    audience: 'kids',
    productType: 'boys-kurta-sets',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Boys Kurta Sets',
    subAudience: 'boys',
    defaultPieces: '1-piece-kurta',
  },
  'boys-t-shirts-polos': {
    audience: 'kids',
    productType: 'boys-t-shirts',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Boys T-Shirts & Polos',
    subAudience: 'boys',
    defaultPieces: 'single-garment-kids',
  },
  'boys-jeans-trousers': {
    audience: 'kids',
    productType: 'boys-trousers',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Boys Jeans & Trousers',
    subAudience: 'boys',
    defaultPieces: 'single-bottom-kids',
  },
  'boys-winter-wear': {
    audience: 'kids',
    productType: 'boys-winter-wear',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Boys Winter Wear (Hoodies/Sweaters)',
    subAudience: 'boys',
    defaultPieces: 'single-garment-kids',
  },
  'girls-frocks': {
    audience: 'kids',
    productType: 'girls-frocks',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Girls Frocks & Dresses',
    subAudience: 'girls',
    defaultPieces: 'single-frock',
  },
  'girls-shalwar-kameez': {
    audience: 'kids',
    productType: 'girls-shalwar-kameez',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Girls Shalwar Kameez',
    subAudience: 'girls',
    defaultPieces: '2-piece-girls-suit',
  },
  'girls-kurtis-tops': {
    audience: 'kids',
    productType: 'girls-kurtis',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Girls Kurtis & Tops',
    subAudience: 'girls',
    defaultPieces: 'single-kurti-girls',
  },
  'girls-leggings-trousers': {
    audience: 'kids',
    productType: 'girls-trousers',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Girls Tights, Leggings & Trousers',
    subAudience: 'girls',
    defaultPieces: 'single-bottom-kids',
  },
  'girls-winter-wear': {
    audience: 'kids',
    productType: 'girls-winter-wear',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Girls Winter Wear',
    subAudience: 'girls',
    defaultPieces: 'single-garment-kids',
  },

  // --- FOOTWEAR (20 Categories) ---
  'khussa': { audience: 'footwear', productType: 'khussa', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Traditional Handmade Khussa' },
  'peshawari-chappal': { audience: 'footwear', productType: 'peshawari-chappal', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Peshawari Chappal (Kheri/Noruzi)' },
  'kolhapuri': { audience: 'footwear', productType: 'kolhapuri', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Kolhapuri Chappals' },
  'heels': { audience: 'footwear', productType: 'heels', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Heels & Pumps' },
  'block-heels': { audience: 'footwear', productType: 'heels', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Block Heels' },
  'stilettos': { audience: 'footwear', productType: 'heels', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Stilettos' },
  'wedges': { audience: 'footwear', productType: 'heels', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Wedges' },
  'flats': { audience: 'footwear', productType: 'flats', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Women Flats & Ballet Shoes' },
  'sandals-slides': { audience: 'footwear', productType: 'sandals-slides', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Sandals & Slides' },
  'slippers': { audience: 'footwear', productType: 'slippers', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Comfort Slippers' },
  'mules': { audience: 'footwear', productType: 'mules', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Mules' },
  'sneakers': { audience: 'footwear', productType: 'sneakers', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Sneakers & Casual Shoes' },
  'loafers': { audience: 'footwear', productType: 'loafers', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Loafers & Moccasins' },
  'formal-shoes': { audience: 'footwear', productType: 'formal-shoes', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Formal Shoes (Oxford / Derby)' },
  'boots': { audience: 'footwear', productType: 'boots', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Winter Boots' },
  'ankle-boots': { audience: 'footwear', productType: 'boots', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Ankle Boots' },
  'school-shoes': { audience: 'footwear', productType: 'school-shoes', profile: CATEGORY_TYPES.FOOTWEAR, label: 'School Uniform Shoes' },
  'kids-footwear': { audience: 'footwear', productType: 'kids-shoes', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Kids Footwear' },
  'mens-chappal': { audience: 'footwear', productType: 'mens-chappal', profile: CATEGORY_TYPES.FOOTWEAR, label: "Men's Everyday Chappal" },
  'sports-running': { audience: 'footwear', productType: 'sneakers', profile: CATEGORY_TYPES.FOOTWEAR, label: 'Sports & Running Shoes' },

  // --- HOME & BEDDING (5 Categories) ---
  'bed-sheets': { audience: 'home', productType: 'bed-sheets', profile: CATEGORY_TYPES.BEDDING, label: 'Bed Sheets (Fitted & Flat)' },
  'bedding-sets': { audience: 'home', productType: 'bedding-sets', profile: CATEGORY_TYPES.BEDDING, label: 'Complete Bedding & Bridal Sets' },
  'quilts-comforters': { audience: 'home', productType: 'quilts-comforters', profile: CATEGORY_TYPES.BEDDING, label: 'Quilts, Duvets & Comforters' },
  'cushions-covers': { audience: 'home', productType: 'cushions-covers', profile: CATEGORY_TYPES.BEDDING, label: 'Cushions & Cushion Covers' },
  'towels-bath': { audience: 'home', productType: 'towels-bath', profile: CATEGORY_TYPES.BEDDING, label: 'Towels & Bath Linens' },
};

/**
 * 2. PIECE_OPTIONS (Audience & Category-Aware Compositions)
 * Defines structured outfit compositions with stable IDs, readable labels,
 * and explicit components arrays.
 */
export const PIECE_OPTIONS = {
  women: [
    {
      id: '3-piece-classic',
      value: '3-Piece',
      label: '3-Piece (Shirt + Dupatta + Trouser)',
      components: ['Shirt', 'Dupatta', 'Trouser'],
    },
    {
      id: '2-piece-trouser',
      value: '2-Piece (Shirt + Trouser)',
      label: '2-Piece (Shirt + Trouser)',
      components: ['Shirt', 'Trouser'],
    },
    {
      id: '2-piece-dupatta',
      value: '2-Piece (Shirt + Dupatta)',
      label: '2-Piece (Shirt + Dupatta)',
      components: ['Shirt', 'Dupatta'],
    },
    {
      id: '1-piece-shirt',
      value: '1-Piece',
      label: '1-Piece (Kurta / Shirt Only)',
      components: ['Shirt'],
    },
    {
      id: 'single-shawl',
      value: 'Shawl / Dupatta',
      label: 'Shawl / Dupatta Only',
      components: ['Dupatta/Shawl'],
    },
    {
      id: 'single-bottom',
      value: 'Separate Bottom',
      label: 'Separate Bottom / Trouser / Shalwar',
      components: ['Trouser/Shalwar'],
    },
    {
      id: 'custom',
      value: 'Custom',
      label: '✏️ Custom Composition…',
      components: [],
    },
  ],
  men: [
    {
      id: '2-piece-men-suit',
      value: '2-Piece',
      label: '2-Piece (Kameez + Shalwar)',
      components: ['Kameez', 'Shalwar'],
    },
    {
      id: '3-piece-waistcoat-suit',
      value: '3-Piece (Kameez + Shalwar + Waistcoat)',
      label: '3-Piece (Kameez + Shalwar + Waistcoat)',
      components: ['Kameez', 'Shalwar', 'Waistcoat'],
    },
    {
      id: '1-piece-kurta',
      value: '1-Piece',
      label: '1-Piece (Kurta Only)',
      components: ['Kurta'],
    },
    {
      id: '2-piece-kurta-pajama',
      value: '2-Piece (Kurta + Pajama)',
      label: '2-Piece (Kurta + Pajama/Trouser)',
      components: ['Kurta', 'Pajama/Trouser'],
    },
    {
      id: 'single-waistcoat',
      value: 'Waistcoat',
      label: 'Waistcoat / Prince Coat Only',
      components: ['Waistcoat'],
    },
    {
      id: 'single-bottom-men',
      value: 'Trouser / Shalwar',
      label: 'Trouser / Shalwar / Pajama Only',
      components: ['Shalwar/Trouser'],
    },
    {
      id: 'custom',
      value: 'Custom',
      label: '✏️ Custom Composition…',
      components: [],
    },
  ],
  kids: [
    {
      id: 'single-frock',
      value: '1-Piece (Frock)',
      label: '1-Piece (Frock / Dress Only)',
      components: ['Frock'],
    },
    {
      id: '2-piece-boys-suit',
      value: '2-Piece (Kameez + Shalwar)',
      label: '2-Piece (Kameez + Shalwar)',
      components: ['Kameez', 'Shalwar'],
    },
    {
      id: '2-piece-girls-suit',
      value: '2-Piece (Shirt + Trouser)',
      label: '2-Piece (Shirt + Trouser)',
      components: ['Shirt', 'Trouser'],
    },
    {
      id: '3-piece-girls-suit',
      value: '3-Piece (Shirt + Dupatta + Trouser)',
      label: '3-Piece (Shirt + Dupatta + Trouser)',
      components: ['Shirt', 'Dupatta', 'Trouser'],
    },
    {
      id: 'single-kurti-girls',
      value: '1-Piece (Kurti)',
      label: '1-Piece (Kurti / Top Only)',
      components: ['Kurti'],
    },
    {
      id: 'single-garment-kids',
      value: '1-Piece (T-Shirt/Top)',
      label: '1-Piece (T-Shirt / Polo / Shirt)',
      components: ['Top'],
    },
    {
      id: 'single-bottom-kids',
      value: 'Separate Bottom',
      label: '1-Piece (Jeans / Trousers / Tights)',
      components: ['Bottom'],
    },
    {
      id: 'infant-romper',
      value: 'Romper / Onesie',
      label: 'Romper / Baby Onesie',
      components: ['Romper'],
    },
    {
      id: 'custom',
      value: 'Custom',
      label: '✏️ Custom Composition…',
      components: [],
    },
  ],
  footwear: [],
  home: [],
  collections: [
    {
      id: '3-piece-festive',
      value: '3-Piece',
      label: '3-Piece (Shirt + Dupatta + Trouser)',
      components: ['Shirt', 'Dupatta', 'Trouser'],
    },
    {
      id: '2-piece-festive',
      value: '2-Piece',
      label: '2-Piece (Shirt + Trouser / Dupatta)',
      components: ['Shirt', 'Trouser'],
    },
    {
      id: '1-piece-festive',
      value: '1-Piece',
      label: '1-Piece (Kurta / Shirt / Item Only)',
      components: ['Shirt'],
    },
    {
      id: 'shawl-festive',
      value: 'Shawl / Wrap',
      label: 'Shawl / Festive Wrap Only',
      components: ['Shawl'],
    },
    {
      id: 'custom',
      value: 'Custom',
      label: '✏️ Custom Composition…',
      components: [],
    },
  ],
  default: [
    { id: '1-piece-default', value: '1-Piece', label: '1-Piece', components: ['Item'] },
    { id: '2-piece-default', value: '2-Piece', label: '2-Piece', components: ['Top', 'Bottom'] },
    { id: '3-piece-default', value: '3-Piece', label: '3-Piece', components: ['Top', 'Bottom', 'Accent'] },
    { id: 'custom', value: 'Custom', label: '✏️ Custom Composition…', components: [] },
  ],
};

/**
 * 3. SPECIFICATION_PROFILES
 * Defines the specifications for each merchandise domain.
 */
export const SPECIFICATION_PROFILES = {
  [CATEGORY_TYPES.APPAREL]: {
    name: 'Apparel Profile',
    fields: [
      { key: 'fabric', label: 'Fabric Type', type: 'text', placeholder: 'e.g. Pure Lawn, Silk, Cambric Cotton, Khaddar' },
      { key: 'suitPieces', label: 'Outfit Composition', type: 'composition' },
      { key: 'fabricComposition', label: 'Fabric Composition / Blend', type: 'text', placeholder: 'e.g. 100% Cotton, 80/20 Cotton Blend' },
      { key: 'shrinkageNote', label: 'Shrinkage & Wash Note', type: 'text', placeholder: 'e.g. Pre-shrunk fabric, expect ~2% shrinkage after first wash' },
      { key: 'care', label: 'Care Guidelines', type: 'textarea', placeholder: 'e.g. Hand wash cold, wash dark colors separately, warm iron' },
    ],
  },
  [CATEGORY_TYPES.FOOTWEAR]: {
    name: 'Footwear Profile',
    fields: [
      { key: 'footwearStyle', label: 'Footwear Type / Style', type: 'text', placeholder: 'e.g. Khussa, Peshawari, Oxford, Sneaker, Block Heel' },
      { key: 'shoeSizeSystem', label: 'Size System', type: 'select', options: ['EU / PK (Standard)', 'UK Size', 'US Size', 'Custom System'] },
      { key: 'upperMaterial', label: 'Upper Material', type: 'text', placeholder: 'e.g. Genuine Leather, Velvet, Microfiber, Canvas' },
      { key: 'soleMaterial', label: 'Sole Material', type: 'text', placeholder: 'e.g. Handcrafted Leather Sole, Tyre Sole, Rubber TPR' },
      { key: 'closureType', label: 'Closure / Fastening', type: 'select', options: ['Slip-on', 'Buckle Strap', 'Lace-up', 'Velcro', 'Zipper', 'Elastic / Stretch', 'Custom'] },
      { key: 'shoeFit', label: 'Fit Profile', type: 'select', options: ['True to Size', 'Runs Narrow (Order 1 size up)', 'Runs Wide', 'Relaxed Fit', 'Custom'] },
      // Conditional Fields:
      { key: 'heelType', label: 'Heel Type (Optional)', type: 'text', placeholder: 'e.g. Flat, Block Heel, Stiletto, Wedge' },
      { key: 'heelHeight', label: 'Heel Height (Optional)', type: 'text', placeholder: 'e.g. Flat (0.5 inch), 2.5 inches, 3 inches' },
      { key: 'embellishment', label: 'Embellishment / Craft (Optional)', type: 'text', placeholder: 'e.g. Hand Tilla Embroidery, Dabka, Mirror Work, Plain' },
      { key: 'care', label: 'Care Guidelines', type: 'textarea', placeholder: 'e.g. Wipe clean with damp cloth, store in cotton dust bag' },
    ],
  },
  [CATEGORY_TYPES.BEDDING]: {
    name: 'Bedding & Home Profile',
    fields: [
      { key: 'bedSize', label: 'Bed Size', type: 'select', options: ['King (Standard)', 'Queen', 'Double', 'Single', 'Custom Dimensions'] },
      { key: 'dimensions', label: 'Actual Dimensions', type: 'dimension', placeholder: 'e.g. 100 x 96' },
      { key: 'sheetType', label: 'Sheet Style', type: 'select', options: ['Flat Sheet', 'Fitted Sheet (Elastic Border)', 'Bedspread / Coverlet', 'Custom'] },
      { key: 'packageContents', label: 'Package Contents', type: 'package_contents' },
      { key: 'fabric', label: 'Fabric / Thread Count', type: 'text', placeholder: 'e.g. 100% Cotton Satin, 300 Thread Count, T-400 Percale' },
      { key: 'fillingMaterial', label: 'Filling / Batting (for Quilts/Comforters)', type: 'text', placeholder: 'e.g. 350 GSM Microfiber Polyester, 100% Pure Duck Down' },
      { key: 'care', label: 'Care Guidelines', type: 'textarea', placeholder: 'e.g. Machine wash cold gentle cycle, tumble dry low, do not bleach' },
    ],
  },
};

/**
 * 4. SIZE_OPTIONS
 * Standard size systems tailored for each category profile with Custom support.
 */
export const SIZE_OPTIONS = {
  [CATEGORY_TYPES.APPAREL]: {
    women: ['XS', 'S', 'M', 'L', 'XL', '2XL', 'Free Size', 'Unstitched', 'Custom'],
    men: ['S', 'M', 'L', 'XL', '2XL', '3XL', 'Custom'],
    kids: ['0-3M', '3-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y', 'Custom'],
    default: ['XS', 'S', 'M', 'L', 'XL', '2XL', 'Free Size', 'Custom'],
  },
  [CATEGORY_TYPES.FOOTWEAR]: {
    'EU / PK': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', 'Custom'],
    'UK': ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Custom'],
    'US': ['4', '5', '6', '7', '8', '9', '10', '11', '12', '13', 'Custom'],
    default: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', 'Custom'],
  },
  [CATEGORY_TYPES.BEDDING]: ['Single', 'Double', 'Queen', 'King', 'Super King', 'Custom'],
  [CATEGORY_TYPES.GENERAL]: ['Standard', 'Small', 'Medium', 'Large', 'One Size', 'Custom'],
};

/**
 * Standard size presets for one-click variant creation (backward compatibility)
 */
export const SIZE_PRESETS = {
  [CATEGORY_TYPES.APPAREL]: ['XS', 'S', 'M', 'L', 'XL', '2XL', 'Free Size', 'Unstitched'],
  [CATEGORY_TYPES.FOOTWEAR]: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  [CATEGORY_TYPES.BEDDING]: ['Single', 'Double', 'Queen', 'King'],
  [CATEGORY_TYPES.GENERAL]: ['Standard', 'Small', 'Medium', 'Large', 'One Size'],
};

/**
 * Common color palette with hex codes
 */
export const POPULAR_COLORS = [
  { name: 'Black', hex: '#151515' },
  { name: 'Ivory / Off-White', hex: '#FAF9F6' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#1A2A44' },
  { name: 'Maroon', hex: '#701C1C' },
  { name: 'Emerald Green', hex: '#1B4D3E' },
  { name: 'Beige / Camel', hex: '#D2B48C' },
  { name: 'Mustard', hex: '#E1AD01' },
  { name: 'Olive Green', hex: '#556B2F' },
  { name: 'Charcoal Grey', hex: '#36454F' },
  { name: 'Tan Brown', hex: '#996515' },
  { name: 'Dark Brown', hex: '#4A2E18' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Blush Pink', hex: '#FFD1DC' },
  { name: 'Ruby Red', hex: '#C41E3A' },
  { name: 'Dusty Purple', hex: '#7D6B7D' },
];

/**
 * Resolves full category configuration from category object, name, or slug.
 * Safe fallback guarantees zero UI crashes for unknown categories.
 */
export function getCategoryConfig(categoryObjOrSlug = '', audience = '') {
  const slug = typeof categoryObjOrSlug === 'object' && categoryObjOrSlug !== null
    ? String(categoryObjOrSlug.slug || categoryObjOrSlug.name || '').toLowerCase().trim()
    : String(categoryObjOrSlug || '').toLowerCase().trim();

  const aud = String(audience || '').toLowerCase().trim();

  // 1. Direct slug match in CATEGORY_CONFIG
  if (CATEGORY_CONFIG[slug]) {
    return CATEGORY_CONFIG[slug];
  }

  // 2. Keyword-based matching
  const text = `${slug} ${aud}`;

  if (
    aud === 'footwear' ||
    text.includes('footwear') ||
    text.includes('shoe') ||
    text.includes('khussa') ||
    text.includes('chappal') ||
    text.includes('sandal') ||
    text.includes('heel') ||
    text.includes('kolhapuri') ||
    text.includes('boot') ||
    text.includes('slipper') ||
    text.includes('sneaker') ||
    text.includes('loafer')
  ) {
    return {
      audience: 'footwear',
      productType: 'footwear-general',
      profile: CATEGORY_TYPES.FOOTWEAR,
      label: 'Footwear',
    };
  }

  if (
    aud === 'home' ||
    text.includes('bed') ||
    text.includes('bedding') ||
    text.includes('bedsheet') ||
    text.includes('duvet') ||
    text.includes('pillow') ||
    text.includes('quilt') ||
    text.includes('cushion') ||
    text.includes('towel')
  ) {
    return {
      audience: 'home',
      productType: 'bedding-general',
      profile: CATEGORY_TYPES.BEDDING,
      label: 'Home & Bedding',
    };
  }

  if (aud === 'women' || aud === 'men' || aud === 'kids') {
    return {
      audience: aud,
      productType: 'apparel-general',
      profile: CATEGORY_TYPES.APPAREL,
      label: `${aud.charAt(0).toUpperCase() + aud.slice(1)} Apparel`,
    };
  }

  if (aud === 'collections') {
    return {
      audience: 'collections',
      productType: 'festive-collections',
      profile: CATEGORY_TYPES.APPAREL,
      label: 'Festive & Seasonal Collections',
    };
  }

  // 3. Fallback with console development note (safe, no throw)
  if (process.env.NODE_ENV !== 'production' && slug) {
    console.warn(`[categoryUtils] Unmapped category slug "${slug}". Using safe Apparel fallback.`);
  }

  return {
    audience: aud || 'women',
    productType: 'general',
    profile: CATEGORY_TYPES.APPAREL,
    label: 'Apparel & Garments',
  };
}

/**
 * Determines the category type (apparel, footwear, bedding, general)
 * Preserves backwards compatibility for existing components.
 */
export function getCategoryType(categoryObjOrName = '', audience = '') {
  const cfg = getCategoryConfig(categoryObjOrName, audience);
  return cfg.profile || CATEGORY_TYPES.APPAREL;
}

/**
 * Formats a clean human-readable outfit composition summary.
 */
export function formatComposition(suitPieces = '', customPieces = '', components = []) {
  if (suitPieces === 'Custom' && customPieces) {
    return customPieces;
  }
  if (Array.isArray(components) && components.length > 0) {
    return `${suitPieces || 'Custom'} (${components.join(' + ')})`;
  }
  return suitPieces || '1-Piece';
}
