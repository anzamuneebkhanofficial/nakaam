# Final Implementation Plan with Updated Resources — Nakaam E-Commerce Platform

> **Status:** Final plan · Awaiting approval to start P0
> **Specs:** `PROJECT.md` (v1.3 PRD) · `DESIGN.md` (Paper & Ink Editorial Design System)
> **Governing rules:** `AGENTS.md` · `GEMINI.md`
> **Workspace root:** `c:/Users/anzamuneebkhan/Desktop/repos/Nakam`
> **Updated:** October 2026

---

## 1. Locked Decisions

| Area | Decision |
|---|---|
| Screens | 45 (11 desktop + 34 mobile). New screens are added on demand with existing DESIGN.md tokens. |
| API | ~65 endpoints (auth, account, catalog, cart, orders, reviews, complaints, admin) |
| Database | MongoDB 9.0, Mongoose only (no Prisma), 19 collection groups |
| Language | 100% plain JavaScript (`.js` / `.jsx`), no TypeScript anywhere (including `proxy.js`, `loading.jsx`) |
| Interface | 100% English. "ناکام" is kept only as a logo asset. No Urdu or Roman-Urdu text is shown anywhere in the UI or filters. |
| Search | Smart search that understands both Pakistani and international names for the same product (e.g. "suit" or "shalwar kameez", "bed sheet" or "chadar"). Synonyms live only in the backend; customers never see them. See §4.12. |
| Dependencies | Latest stable only, no beta / RC / alpha |
| Backend cache | `lru-cache` in-process, no Redis, tag-based invalidation |
| Frontend cache | Next.js Cache Components + TanStack Query v5, synced by tag names |
| Pagination | **Numbered pages** (skip/limit), not cursor |
| Real-time | **Fast polling + lru-cache** (no WebSockets / SSE / Firebase / Pusher) |
| Admin auth | ENV-based credentials, bcrypt hash, startup validation |
| Package manager | pnpm, one lockfile per workspace (`backend/pnpm-lock.yaml`, `frontend/pnpm-lock.yaml`) |

---

## 2. Version Matrix (October 2026)

> Versions come from your research. Before the first install run `pnpm view <pkg> version` for each and pin what comes back.

### 2.1 Backend

| Package | Version | Note |
|---|---|---|
| Node.js | 24.10.0 (Active LTS) | Supported to April 2028 |
| Express | 5.2.1 | Minimum 5.2.1; 5.2.0 had a query-parser bug |
| Mongoose | 9.9.5 | Uses MongoDB driver v7 |
| MongoDB | 9.0 (Atlas, replica set for transactions) | |
| Better Auth | 1.7.1 | |
| Nodemailer | 10.0.13 | |
| Yup | 1.7.1 | |
| Cloudinary SDK | 2.11.0 | |
| lru-cache | 11.5.3 | |
| mongoose-paginate-v2 | 1.8.5 | Numbered pagination |
| bcrypt | 6.0.0 | Admin password hash |

### 2.2 Frontend

| Package | Version | Note |
|---|---|---|
| Next.js | 16.4.0 | `cacheComponents: true` |
| React | 19.3.0 | |
| Tailwind CSS | 4.3.3 | Native container queries |
| TanStack Query | 5.104.1 | Do not use v6 (prerelease) |
| Zustand | 5.0.15 | UI state only |
| React Hook Form | 7.88.0 | Do not use v8 (beta) |
| @hookform/resolvers | 5.9.1 | With Yup |
| Sonner | 2.0.8 | Toasts |
| nextjs-toploader | 3.8.16 | Top progress bar |
| shadcn/ui Pagination | latest | Radix-based, accessible |

---

## 3. Architecture

### 3.1 Backend: layered modular monolith

```
routes.js -> controller.js -> service.js -> model.js
```

- Cross-module calls only through exported services (`modules/<name>/index.js`). Models and controllers stay private.
- `users` module has no HTTP routes. `auth` owns `/api/auth/*`, `/api/me/*`, `/api/admin/users/*`.
- Mongoose only. Better Auth shares the native connection pool.
- Media uploads are signed direct-to-Cloudinary (zero server memory, bypasses the Vercel 4.5MB body limit).
- No module imports `lru-cache` directly. Everything goes through `core/cache/index.js`.

### 3.2 Frontend: feature-driven App Router

- Route groups: `(marketing)`, `(auth)`, `(account)`, `checkout`, `(admin)`.
- Server state: TanStack Query. UI state: Zustand. Forms: React Hook Form + Yup. Toasts: Sonner.
- Route protection: `proxy.js` (Next.js 16 renamed `middleware` to `proxy`, Node runtime). It only does optimistic redirects. Server Components verify the session before fetching data.

---

## 4. Backend Blueprint

### 4.1 Folder structure (`backend/`)

```
backend/
├── api/index.js                  # Serverless entry (Vercel)
└── src/
    ├── server.js                 # Listener (Render / local)
    ├── app.js                    # Express 5 app + middleware pipeline
    ├── boot.js                   # Idempotent DB connect + seed
    ├── config/
    │   ├── env.js                # Yup-validated ENV, fail fast
    │   ├── db.js                 # Mongoose connection + pooling
    │   ├── auth.js               # Better Auth (Mongo adapter, bcrypt hash/verify)
    │   ├── cors.js               # Strict, env-aware
    │   ├── cookies.js            # Secure cookie policy
    │   └── cloudinary.js         # Signing + delete helpers
    ├── core/
    │   ├── apiError.js
    │   ├── respond.js            # Success envelope
    │   ├── pagination.js         # Numbered pagination helper
    │   └── cache/
    │       ├── index.js          # get / set / delete / invalidateTag / getOrLoad (single-flight)
    │       ├── config.js         # CACHE_CONFIG + TTL (single source of truth)
    │       ├── tagManager.js     # tag -> Set<key>
    │       ├── mutationHandler.js# DB write -> invalidate -> return invalidatedTags
    │       └── cacheRegistry.js  # Stats: hit/miss/evictions/size (logged every 60s)
    ├── middlewares/
    │   ├── requestId.js  requireAuth.js  requireRole.js  validate.js
    │   ├── rateLimiters.js  originGuard.js  errorHandler.js  notFound.js
    ├── utils/
    │   ├── logger.js  crypto.js  money.js  slug.js  whatsappLink.js
    ├── jobs/
    │   ├── seedAdmin.js          # Idempotent, from ENV
    │   ├── seedDefaults.js       # Settings, categories, delivery, payment seeds
    │   └── cleanup.js            # Expired manual orders + Cloudinary orphan sweep
    └── modules/
        auth/ users/(service-only) profiles/ addresses/ categories/ products/
        inventory/ search/ cart/ wishlist/ orders/ payments/ delivery/ coupons/
        sales/ reviews/ complaints/ notifications/ settings/ banners/ uploads/
        analytics/ audit/ email/
```

`asyncHandler.js` is removed (Express 5 forwards async errors automatically). The old single-file `core/cache.js` is replaced by the `core/cache/` folder.

### 4.2 Express 5 rules

- Async handlers throw straight to `errorHandler`. No wrapper.
- `req.query` is a getter. In `validate.js` use `Object.defineProperty` or a new validated object. Never reassign.
- Removed: `res.send(status)`, `res.sendfile()`, `req.param()`, `app.del()`. Use `res.status(n).send()`, `res.sendFile()`, `req.params.x`.
- Wildcards use `/*splat`.

### 4.3 Mongoose 9 rules

- `pre` hooks are async functions with no `next()`.
- `findOne(null)` throws. Always null-check.
- Update pipelines are disabled by default; enable only where needed.
- Use `{ returnDocument: 'after' }` instead of `{ new: true }`.
- Drop `useNewUrlParser` / `useUnifiedTopology`.

### 4.4 Collections

`user`, `session`, `account`, `verification` (Better Auth) · `profiles` (measurements, family, encrypted CNIC) · `addresses` (max 10, default flag, serviceability) · `categories` · `products` · `carts` · `wishlistItems` · `stockAlerts` · `mediaAssets` · `orders` (`NK-YYMM-000123`) · `paymentAccounts` · `deliveryOptions` · `storeSettings` (singleton) · `coupons` + `couponRedemptions` · `sales` · `reviews` · `complaints` + `complaintMessages` · `notifications` · `banners` · `auditLogs` · `counters`

### 4.5 Indexes (ESR: Equality, Sort, Range)

| Collection | Index | Purpose |
|---|---|---|
| products | `{ slug: 1 }` (unique) | Product page |
| products | `{ categoryId: 1, price: 1, _id: 1 }` | Category listing + pagination |
| orders | `{ userId: 1, createdAt: -1 }` | Order history |
| orders | `{ status: 1, createdAt: -1 }` | Admin queue |
| carts | `{ userId: 1 }` | Cart lookup |
| reviews | `{ productId: 1, createdAt: -1 }` | Product reviews |
| notifications | `{ userId: 1, readAt: 1, createdAt: -1 }` | Polling query |

Only add indexes that serve a real query. Every index costs writes.

### 4.6 Pagination (numbered)

- `mongoose-paginate-v2`, `.lean()` on all read endpoints, `countDocuments()` (never `count()`).
- Always index the sort field. Default limit from `PAGINATION_DEFAULT_LIMIT`.
- Response shape: `{ items, total, page, totalPages, hasNext, hasPrev }`.
- One shared frontend `<Pagination>` (shadcn/ui) reused in shop, orders, users, products, complaints. Use `placeholderData: keepPreviousData` so the layout does not flip between pages.

### 4.7 Backend cache (lru-cache)

**Pattern:** cache-aside. Read: hit returns, miss loads from DB and stores with tags. Write: update DB, then immediately invalidate affected tags, and return `invalidatedTags` in the response.

**Rules**
- Always set both `max` and `ttl` (never TTL alone).
- Single-flight: concurrent misses on one key share one DB call.
- TTL jitter ±10%. `allowStale: false`. `dispose` callback logs evictions.
- Tag naming: general (`products`, `categories`, `settings`, `orders`) plus specific (`product:SKU-123`, `category:electronics`, `notifications:<userId>`). Always set both.
- Never clear the whole cache. Invalidate affected tags only.

**TTLs (`core/cache/config.js`)**

| Data | TTL |
|---|---|
| Stock | 15 s |
| Price | 45 s |
| Product details | 3 min |
| Category tree | 12 min |
| Store settings | 45 min |
| Search suggestions | 3 min |
| Banners / promotions | 20 min |
| Notifications (per user) | 5 s |

```js
// core/cache/config.js
export const CACHE_CONFIG = { max: 50000, ttl: 1000 * 60 * 5, updateAgeOnGet: true, allowStale: false };
export const TTL = {
  STOCK: 15_000, PRICE: 45_000, PRODUCT: 180_000, CATEGORY: 720_000,
  SETTINGS: 2_700_000, SEARCH: 180_000, BANNER: 1_200_000, NOTIFICATIONS: 5_000,
};

// core/cache/mutationHandler.js
import { invalidateTag } from './index.js';
export async function handleMutation({ tags, action }) {
  const result = await action();
  tags.forEach(invalidateTag);
  return { result, invalidatedTags: tags };
}
```

Every mutating service uses `handleMutation`.

**Serverless caveat:** on Vercel each function instance has its own lru-cache, so invalidation only clears the instance that handled the write. Keep stock / price / notification TTLs short (they are above) and treat TTL as the real safety net there. On Render (single long-lived process) invalidation is fully global.

### 4.8 Real-time: fast polling

| Scenario | Interval |
|---|---|
| Admin new-order blinker | 3–5 s |
| Customer notifications | 5 s |
| Product updates | 15–30 s |
| Background tab | 30–60 s |

- Notification create: store in DB and invalidate `notifications:<userId>`.
- Polling endpoint: serve from lru-cache on hit (no Mongo query).
- Frontend: `refetchInterval`, `staleTime: 5000`, longer interval when `document.hidden`, and `refetchIntervalInBackground: false`.

### 4.9 Admin authentication

```bash
# backend/.env  (comment every variable: why it exists, what changing it affects)
ADMIN_EMAIL=admin@nakaam.com
ADMIN_PASSWORD_HASH=$2b$10$...   # bcrypt hash, never plain text
ADMIN_ROLE=admin
```

- `.env*` is in `.gitignore` before the first commit. `.env.example` is committed with keys only.
- `config/env.js` validates every variable with Yup at startup and fails fast.
- `requireRole` checks role and also that the session email equals `ADMIN_EMAIL`.
- Login redirect: admin goes to `/admin`, user goes to `/`. The backend returns `role` in the login response.
- Better Auth is configured with bcrypt `hash` / `verify` for `emailAndPassword` so `seedAdmin.js` can insert the ENV hash directly. Confirm this config option in P2 before relying on it.

### 4.10 Cloudinary media pipeline

**Layout:** root `nakaam/` then `products/<category>/<sub>/<sku>/`, `categories/`, `banners/{hero,category,promotional}/`, `temp/uploads/`. Max 3–4 levels. Never name a folder `v<digits>`. Embed the SKU in `public_id`. Use tags plus folders.

**Flow (signed direct upload)**
1. Admin browser calls `POST /api/uploads/sign` (admin-only).
2. Server signs `{ timestamp, folder, upload_preset }`. The folder is built from an **allowlisted** entity type + validated category path, never taken raw from the request body.
3. Browser uploads to Cloudinary via **XHR** (`upload.progress` for per-image and overall %).
4. Browser keeps the returned `public_id` and shows a preview grid.
5. On "Save Product" the DB stores the final `public_id` list. Only after DB success are removed images deleted from Cloudinary.

**Atomicity**
- Any upload fails: delete the ones that succeeded and show "Upload failed. Please retry."
- DB save fails: delete all newly uploaded images.
- Cloudinary delete fails after DB success: log and let the cleanup job retry. Never fail the request.
- Product delete: delete from DB, then delete all `mediaAssets` for it from Cloudinary.

**Endpoints:** `POST /api/uploads/sign`, `POST /api/uploads/delete` (module `uploads/`).

**`mediaAssets` ledger:** `publicId`, `secureUrl`, `entityType` (product / category / banner), `entityId`, `folder`, `createdAt`. It enables orphan detection, cascade delete and an audit trail.

**Orphan cleanup (`jobs/cleanup.js`, daily):** diff Cloudinary assets under `nakaam/` against DB `publicId`s, delete the extras, log the count. Trigger with Render cron, or Vercel Cron if the backend runs on Vercel.

**Limits (free plan):** 10 MB per image, 25 MP, 20 images per product, formats JPEG / PNG / WebP / AVIF / HEIC. Backend validates MIME + size + dimensions.

**Delivery:** every URL gets `f_auto,q_auto`. Widths: mobile 400, tablet 800, desktop 1200, retina 2400. Named transformations: `t_product_card` (400), `t_product_full` (1200), `t_product_retina` (2400). Never put `f_auto` inside a named transformation that is later called with `f_auto`.

### 4.12 Search synonyms (mandatory feature)

**Goal:** a Pakistani customer and an international customer both find the right product, whatever word they type.

- Lives in `modules/search/` as a synonym map (`synonyms.js`), grouped by canonical product term. Example groups:
  - `shalwar kameez`: suit, salwar kameez, shalwar suit
  - `bedsheet`: bed sheet, bedcover, bed cover, chadar
  - `kurta`: kurti, tunic
- Query flow: normalize (lowercase, trim, strip punctuation) then expand to the whole synonym group then run the Mongo text query on the expanded terms.
- The same map expands category and product-type filters. Filter labels on screen stay English only.
- Suggestions (`/api/search/suggest`) only show the canonical English term, never the synonym that was typed.
- Admin can add new synonym groups later (stored in `storeSettings`); the first version ships with a seeded list in `seedDefaults.js`.
- Cache: expanded search results use the `SEARCH` TTL and the `search` tag.
- Acceptance: typing "suit" and "shalwar kameez" return the same products; "chadar" and "bed sheet" return the same products; no synonym text appears in the UI.

### 4.11 Environment variables

```bash
# ---- backend/.env (every line gets a comment in the real file) ----
NODE_ENV=
PORT=
MONGODB_URI=                         # Atlas URI, replica set required for transactions
BETTER_AUTH_SECRET=
CORS_ALLOWED_ORIGINS=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=                 # bcrypt hash
ADMIN_ROLE=admin
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS=
FIELD_ENCRYPTION_KEY=                # AES-256-GCM key for CNIC etc.

PAGINATION_DEFAULT_LIMIT=20
CACHE_MAX_ENTRIES=50000
CACHE_TTL_STOCK=15                   # seconds
CACHE_TTL_PRODUCT=180
CACHE_TTL_CATEGORY=720

CLOUDINARY_CLOUD_NAME= CLOUDINARY_API_KEY= CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=nakaam_signed
CLOUDINARY_ROOT_FOLDER=nakaam
CLOUDINARY_MAX_FILE_SIZE_MB=10
CLOUDINARY_MAX_IMAGES_PER_PRODUCT=20
CLOUDINARY_ALLOWED_FORMATS=jpg,jpeg,png,webp,avif,heic
CLOUDINARY_MAX_WIDTH=4000
CLOUDINARY_MAX_HEIGHT=4000
CLOUDINARY_ORPHAN_CLEANUP_CRON=0 3 * * *

# ---- frontend/.env.local ----
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SITE_NAME=Nakaam
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=nakaam_signed
```

Secrets never use the `NEXT_PUBLIC_` prefix (it is bundled into the browser).

---

## 5. Frontend Blueprint

### 5.1 Routes (`frontend/app/`)

```
(marketing)/  page.jsx · shop · c/[...slug] · p/[slug] · search · sale · cart
              size-guide · fabric-care · shipping-returns · about · contact · faq
(auth)/       login · register · verify-email · forgot-password · reset-password
(account)/    account · account/{profile,addresses,family,security,orders,orders/[id],
              wishlist,notifications,complaints,complaints/new}
checkout/     page.jsx · success/[id]
(admin)/admin/ page.jsx · orders · orders/[id] · users · products · categories
              sales · coupons · payments · delivery · complaints
```

Each route has a `loading.jsx`. Root has `proxy.js`.

### 5.2 Caching: two separate layers

**Next.js Cache Components (server)**
- `next.config.js`: `cacheComponents: true`.
- `'use cache'` only on data-fetching functions, never layouts. Every one pairs `cacheLife(...)` with `cacheTag(...)`.
- Tags come from one registry: `frontend/lib/cache/tags.js`. No hardcoded strings.
- Never cache user-specific or authenticated data (cart, account, orders, admin) with `'use cache'`.

**TanStack Query v5 (client)**
- `staleTime` matches backend TTL per data type. `gcTime` 5 min. Optimistic updates: `onMutate`, rollback in `onError`, `invalidateQueries` in `onSettled`.
- Never wrap TanStack data in `'use cache'`.

### 5.3 Backend and frontend sync

1. Mutation updates DB.
2. Backend invalidates lru-cache by tag.
3. Response includes `invalidatedTags`.
4. Client calls `queryClient.invalidateQueries({ queryKey: [tag] })` per tag.
5. Client calls one **Server Action** (`invalidateTags(tags)`) that runs `updateTag(tag)` for the Next.js server cache.

`updateTag` is a server-only API, so it cannot be called directly inside a client `onSuccess`. Wrap it in a Server Action in `frontend/lib/cache/actions.js`. Tag names are identical on both sides. TTLs are the safety net; event-driven invalidation is primary.

```jsx
const mutation = useMutation({
  mutationFn: patchProduct, // returns { result, invalidatedTags }
  onSuccess: async ({ invalidatedTags }) => {
    invalidatedTags.forEach((t) => queryClient.invalidateQueries({ queryKey: [t] }));
    await invalidateTags(invalidatedTags); // Server Action -> updateTag
  },
});
```

### 5.4 UI standards

| Area | Rule |
|---|---|
| Skeletons | `loading.jsx` per route plus `<Suspense>` for sections. Same layout classes and explicit heights / `aspect-ratio` as the real content (zero CLS). No fetching in `loading.jsx`. Hand-built Tailwind skeletons, no extra library. |
| Toasts | Sonner, `<Toaster richColors />`. Max 1 per action, 3 visible, 3 per 10 s. Dedupe same message within 2 s. Duration 4 s or more, 6 s or more with Undo. |
| Top loader | `nextjs-toploader`, brand color, 2.5 px, spinner off. |
| Sticky | Header: `sticky top-0 z-50 backdrop-blur`. Admin sidebar: `sticky top-0 h-screen overflow-y-auto`. If the header is `h-16`, sidebar uses `top-16 h-[calc(100vh-4rem)]`. |
| User menu | Avatar with initials fallback. Dropdown: Profile / My Account, Dashboard (admin only), Logout. |
| Protected routes | `proxy.js` matcher excludes `api`, `_next/static`, `_next/image`, `favicon.ico`. Redirect `/admin`, `/account` to `/login` without a session cookie, and `/login`, `/register` to `/account` with one. |

### 5.5 Responsive strategy

| Device | Width | Notes |
|---|---|---|
| Mobile | 320–640 | Touch targets at least 44×44 px |
| Tablet | 768–1024 | |
| Laptop | 1024–1440 | |
| Desktop | 1440–1920 | |
| Large LCD / projector | 1920+ | Content capped at 1400–1600 px, `mx-auto`, extra whitespace, `clamp()` fonts, `srcset` images |

Use container queries for component-level behavior. Admin on mobile: off-canvas sidebar, bottom nav, stacked cards. Tablet: collapsible sidebar, 2-column grid.

### 5.6 Admin dashboard

- 8–12 widgets only: KPI cards (revenue, orders, items sold, customers with 7-day trend), 30-day revenue line chart, orders-by-status donut, recent orders table, low-stock alerts, quick actions, new-order blinker (polling).
- Separate shell from the customer account: sidebar, breadcrumbs plus back button, nested routes, no storefront header/footer.

---

## 6. Screen Checklist (45)

| # | Screen | Device | Route | API | Phase |
|---|---|---|---|---|---|
| 1 | Register (`74300acc`) | M | `/register` | `/api/auth/sign-up/email` | P2 |
| 2 | Admin Categories (`5bda0c0d`) | D | `/admin/categories` | `/api/admin/categories` | P8 |
| 3 | Admin Coupons (`9257e6c6`) | D | `/admin/coupons` | `/api/admin/coupons` | P8 |
| 4 | Email Verification (`33446d82`) | M | `/verify-email` | `/api/auth/verify-email` | P2 |
| 5 | Notifications (`53d52033`) | M | `/account/notifications` | `/api/me/notifications` | P5 |
| 6 | Saved Addresses (`5542b371`) | M | `/account/addresses` | `/api/me/addresses` | P5 |
| 7 | Doorstep Inspection Policy (`62188b30`) | M | `/shipping-returns` | `/api/settings/public` | P6 |
| 8 | Search & Suggestions (`b57fca48`) | M | `/search` | `/api/search/suggest` | P3 |
| 9 | Admin Customer Directory (`99e71f72`) | D | `/admin/users` | `/api/admin/users` | P10 |
| 10 | Family Size Book (`f928a68b`) | M | `/account/family` | `/api/me/family` | P5 |
| 11 | Admin Darzi Queue (`0530d2ed`) | D | `/admin/orders` (Darzi tab) | `/api/admin/orders` | P9 |
| 12 | Admin Disputes Queue (`dd79f366`) | D | `/admin/complaints` | `/api/admin/complaints` | P10 |
| 13 | Payment Methods (`54b127ac`) | M | `/account/security` (section) | `/api/payments/accounts` | P5 |
| 14 | Account Dashboard (`5b8a6fe4`) | M | `/account` | `/api/me`, `/api/me/summary` | P5 |
| 15 | Fabric Care (`cc8e5ff4`) | M | `/fabric-care` | `/api/settings/public` | P6 |
| 16 | Forgot Password (`65ec73b9`) | M | `/forgot-password` | `/api/auth/forget-password` | P2 |
| 17 | Order Success, Manual Payment (`73b788aa`) | M | `/checkout/success/[id]` | `/api/orders/:id/payment-proof` | P4 |
| 18 | Admin Products (`f9f06aeb`) | D | `/admin/products` | `/api/admin/products` | P8 |
| 19 | Admin Sales (`f3749e9e`) | D | `/admin/sales` | `/api/admin/sales` | P8 |
| 20 | Contact & Studio (`44b65b3a`) | M | `/contact` | `/api/settings/public` | P6 |
| 21 | Orders & Exchanges (`673b6cfc`) | M | `/account/orders` | `/api/orders` | P5 |
| 22 | Admin Order Detail & Slip (`42f2a25c`) | D | `/admin/orders/[id]` | `/api/admin/orders/:id` | P9 |
| 23 | Reset Password (`ddff00ab`) | M | `/reset-password` | `/api/auth/reset-password` | P2 |
| 24 | Storefront Home, Mobile (`4a5c73fd`) | M | `/` | `/api/products`, `/api/categories` | P1 |
| 25 | Order Detail & Exchange (`b3d4f48e`) | M | `/account/orders/[id]` | `/api/orders/:id/return-request` | P5 |
| 26 | Login (`f2e83dec`) | M | `/login` | `/api/auth/sign-in/email` | P2 |
| 27 | About (`ca0a29dc`) | M | `/about` | static | P6 |
| 28 | Profile (`58179bd4`) | M | `/account/profile` | `/api/me/profile` | P5 |
| 29 | Product Detail (`5f0add2b`) | M | `/p/[slug]` | `/api/products/:slug` | P3 |
| 30 | FAQ (`3b06deff`) | M | `/faq` | static | P6 |
| 31 | Cart (`0949ddf6`) | M | `/cart` | `/api/cart`, `/api/cart/items` | P4 |
| 32 | Order Success COD & Tracker (`55e4c6ea`) | M | `/checkout/success/[id]` | `/api/orders/:id/tracking` | P4 |
| 33 | Admin Orders Table (`3fe8cbbf`) | D | `/admin/orders` | `/api/admin/orders` | P9 |
| 34 | Admin Dashboard (`db01d205`) | D | `/admin` | `/api/admin/stats` | P7 |
| 35 | Admin Raast & COD Ledger (`165913c7`) | D | `/admin/payments` | `/api/admin/orders` | P9 |
| 36 | Atelier Consultation (`30a10ff5`) | M | `/account/complaints/new` | `/api/complaints` | P5 |
| 37 | Shop Catalog (`2144a36ce`) | M | `/shop` | `/api/products` | P3 |
| 38 | Storefront Home, Desktop (`b517d43f`) | D | `/` | `/api/products`, `/api/banners` | P1 |
| 39 | Complaints & Care Hub (`22b876cf`) | M | `/account/complaints` | `/api/complaints` | P5 |
| 40 | Shipping & Returns (`17aecf4c`) | M | `/shipping-returns` | static | P6 |
| 41 | Wishlist & Eid Vault (`c924926c`) | M | `/account/wishlist` | `/api/wishlist` | P5 |
| 42 | Size Guide (`0f959ba6`) | M | `/size-guide` | static | P6 |
| 43 | Admin Logistics (`1b908ca5`) | D | `/admin/delivery` | `/api/delivery/options` | P9 |
| 44 | Checkout (`55c9d8e0`) | M | `/checkout` | `/api/orders` | P4 |
| 45 | Account Security & 2FA (`243c9e83`) | M | `/account/security` | `/api/auth/change-password` | P5 |

Desktop screens are built with responsive primitives from the start; P12 refines the 360 / 390 / 768 px views.

---

## 7. Build Sequence

| Phase | Scope | Acceptance |
|---|---|---|
| **P0 Foundation** | Express 5.2.1 ESM, `config/env.js` (fail-fast), Mongoose 9 connection, `core/` (errors, respond, pagination), **`core/cache/` complete**, logger. Frontend tokens, providers (Query, Sonner, toploader), `cacheComponents: true`, `proxy.js` skeleton, `lib/cache/tags.js` + `actions.js` | Server boots, ENV validation fails on a missing var, cache unit-tested (TTL, tags, single-flight) |
| **P1 Landing & seed** | Category + product schemas, seeds, public endpoints, home (screens 24, 38), shared Pagination and skeleton components | Home renders from seeded data, zero CLS |
| **P2 Auth** | Better Auth (bcrypt hash/verify), `seedAdmin`, email verification, role-based redirect, `proxy.js` | Admin lands on `/admin`, user on `/`, no flicker |
| **P3 Catalogue & PDP** | Shop with numbered pagination + filters, search with synonym expansion (§4.12) + suggestions, PDP (fit meter, size helper) | Page-to-page keeps layout stable, indexes verified with `explain` |
| **P4 Cart, checkout, orders** | Cart sync + guest merge, checkout quote, order transactions, COD + manual proof | Concurrent orders never oversell stock |
| **P5 Account** | Dashboard, profile, addresses, family book, tracker, complaints, wishlist, **notifications polling (5 s)** | Notification appears within about 5 s |
| **P6 Static pages** | Size guide, fabric care, shipping/returns, about, contact, FAQ | |
| **P7 Admin shell** | Sticky sidebar, breadcrumbs, nested routes, KPI endpoint, 8–12 widgets, user menu | |
| **P8 Admin catalog & sales** | Cloudinary signed uploads + preview + atomic rollback, products, CSV import, categories, sales, coupons | Failed upload leaves zero orphans |
| **P9 Admin operations** | Orders, payment proof verification, Darzi slips, Raast ledger, logistics, **order blinker polling (3–5 s)** | |
| **P10 Admin support & users** | Users directory with risk flags, complaints queue, review moderation | |
| **P11 Emails & states** | 20 Nodemailer templates, empty / loading / error states | |
| **P12 Mobile pass** | 360 / 390 / 768 px for all 45 screens, off-canvas admin | |
| **P13 Hardening** | Security review, concurrency tests, orphan-cleanup job, production build | |

---

## 8. Setup Required From You

1. MongoDB Atlas 9.0 URI (replica set enabled).
2. Cloudinary credentials, and a **signed** upload preset named `nakaam_signed`.
3. SMTP credentials (host, port, user, password).
4. Admin: `ADMIN_EMAIL` and a bcrypt `ADMIN_PASSWORD_HASH` (generate locally, never commit).
5. Node.js 24.10.0 and pnpm installed.

---

## 9. Removed / Changed vs Old Plan

| Old | Now |
|---|---|
| Node 22, Express 4 | Node 24.10.0, Express 5.2.1 |
| `core/asyncHandler.js` | Removed |
| `core/cache.js` custom LRU | `core/cache/` folder on lru-cache 11.5.3 with tags and single-flight |
| `validate.js` reassigns `req.query` | `Object.defineProperty` |
| `pre('save', next)` | async hook, no `next()` |
| `{ new: true }` | `{ returnDocument: 'after' }` |
| `app.get('*')`, `req.param()`, `res.send(404)` | `/*splat`, `req.params`, `res.status(404).send()` |
| Plain `ADMIN_PASSWORD` | `ADMIN_PASSWORD_HASH` (bcrypt) |
| Unspecified pagination | Numbered, `mongoose-paginate-v2` |
| No frontend cache plan | Cache Components + TanStack Query, synced by tags |
| `/api/cloudinary/*` | `/api/uploads/sign`, `/api/uploads/delete` |
| `proxy.ts`, `loading.tsx` (in research) | `proxy.js`, `loading.jsx` (no-TypeScript rule) |
| Admin dashboard `/admin/dashboard` (in research) | `/admin` |
| Screen 12 on `/admin/delivery` | `/admin/complaints` (delivery stays screen 43) |

---

## 10. Assumptions (my calls where your notes conflicted)

1. **Pagination:** one note recommended cursor, a later one confirmed numbered. Numbered wins.
2. **lru-cache:** two notes said 11.3.5 and 11.5.3. I used 11.5.3. Pin whatever `pnpm view lru-cache version` returns.
3. **Node:** one note said stay on 22.23.3, others said 24. I used 24.10.0 (Active LTS).
4. **`updateTag`:** it is server-only, so the client invalidates through a Server Action rather than calling it in `onSuccess`. Verify against the Next.js 16.4 docs in P0.
5. **Skeletons:** hand-built Tailwind instead of `react-streaming-skeletons`, to avoid an extra dependency.
6. **Screen 13** (Payment Methods) lives as a section inside `/account/security` because no separate route was defined.
7. **Better Auth bcrypt hash/verify** is assumed supported via config. Confirm in P2.
8. **Cron for orphan cleanup** needs Render cron or Vercel Cron, depending on where the backend ends up.