# Nakaam (ناکام)

Direct-to-consumer e-commerce platform for handcrafted Pakistani luxury apparel, ready-to-wear pret, unstitched lawn, footwear, and home textiles with integrated open-box doorstep inspection cash-on-delivery (COD).

## Overview

Nakaam is a full-stack e-commerce monorepo engineered specifically for the Pakistani retail market. It addresses regional online shopping friction through:

- **Open-Box Doorstep Inspection**: Allows customers to physically inspect fabric weave, stitching, and sizing prior to handing payment to the courier rider.
- **Smart Synonym Search**: Normalizes and maps regional clothing terms (such as *shalwar kameez*, *kurti*, *chadar*, *khussa*) to canonical catalog entities in English.
- **Bespoke Measurement Profiles**: Stores custom tailoring measurements for users and multiple family members directly in account profiles.
- **Dual Payment Workflows**: Cash on Delivery (COD) across Pakistan alongside Raast instant transfers and manual bank receipts with administrative verification.

## Architecture

```
                      ┌─────────────────────────────────────────┐
                      │    Next.js 16.4 (App Router) Storefront  │
                      │    React 19 · Tailwind CSS 4 · Zustand  │
                      └────────────────────┬────────────────────┘
                                           │
                                    REST API (JSON)
                                           │
                      ┌────────────────────▼────────────────────┐
                      │        Express 5.2.1 Backend API        │
                      │   Layered Monolith · Better Auth 1.7.7  │
                      │     LRU In-Process Cache · Yup Validation│
                      └──────────────┬──────────────────┬───────┘
                                     │                  │
                   Direct Signed XHR │                  │ Mongoose 9.11
                                     ▼                  ▼
                         ┌─────────────────┐   ┌────────────────┐
                         │ Cloudinary CDN  │   │  MongoDB 7.0+  │
                         └─────────────────┘   └────────────────┘
```

The platform is organized as an independently deployable two-tier monorepo:

- **`frontend/`**: Server-rendered and client-hydrated Next.js 16 application using React 19, Tailwind CSS 4, TanStack Query v5, and Better-Auth client.
- **`backend/`**: Express 5 REST API utilizing a modular architecture (`routes -> controllers -> services -> models`), Mongoose 9, tag-invalidated in-process LRU cache, and role-based access control.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16.4.0, React 19.3.0, Tailwind CSS 4, TanStack Query 5, Zustand 5, Swiper, Sonner |
| **Backend** | Node.js 24 (LTS), Express 5.2.1, Better Auth 1.7.7, Mongoose 9.11.1, LRU Cache 11.5, Nodemailer 10 |
| **Database** | MongoDB 7.0+ (Atlas or local replica set for transactions) |
| **Storage** | Cloudinary (direct signed client uploads with backend orphan sweep) |
| **Tooling** | pnpm 12.4.1, Docker Compose |

## Prerequisites

- **Node.js**: `24.x` (LTS recommended)
- **Package Manager**: `pnpm` (`corepack enable` or `npm install -g pnpm@12.4.1`)
- **Database**: Local or remote MongoDB instance (version 7.0 or higher)
- **Docker** *(optional)*: Docker Engine and Docker Compose v2 for containerized workflows

## Quick Start

### Option 1: Docker Compose (All-in-One)

Start MongoDB, the Express backend, and the Next.js storefront with a single command:

```bash
docker compose up --build
```

- Storefront: `http://localhost:3000`
- API Server: `http://localhost:5000`
- MongoDB: `localhost:27017`

### Option 2: Local Development

#### 1. Clone and Navigate

```bash
git clone <repository-url>
cd Nakam
```

#### 2. Backend Setup

```bash
cd backend
pnpm install
cp .env.example .env
```

Configure `backend/.env` with your MongoDB connection string and secrets:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/nakaam_db
BETTER_AUTH_SECRET=
FIELD_ENCRYPTION_KEY
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
```

Start the backend daemon:

```bash
pnpm dev
```

The API initializes on `http://localhost:5000`. On boot, default settings, categories, and administrative credentials automatically seed if absent.

#### 3. Frontend Setup

Open a separate terminal:

```bash
cd frontend
pnpm install
cp .env.example .env.local
```

Configure `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SITE_NAME=Nakaam
NEXT_PUBLIC_STORE_WHATSAPP=
```

Start the frontend development server:

```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## Repository Structure

```
.
├── backend/                  # Express 5 REST API & database layer
│   ├── src/
│   │   ├── config/           # Database, auth, cookies, and environment schema
│   │   ├── core/             # API error handlers, envelopes, and LRU cache engine
│   │   ├── middlewares/      # Auth, rate limiting, and request validation
│   │   ├── modules/          # Domain services (auth, products, orders, search, etc.)
│   │   ├── server.js         # HTTP server entry point
│   │   └── app.js            # Express application bootstrap
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # Next.js 16 App Router storefront & admin
│   ├── src/
│   │   ├── app/              # App router routes ((auth), (account), admin, shop, p)
│   │   ├── components/       # Storefront, PDP, checkout, and admin UI components
│   │   └── lib/              # API client, cart store, and auth client bindings
│   ├── Dockerfile
│   └── package.json
├── docs/                     # Architectural specs and implementation documentation
└── docker-compose.yml        # Multi-container orchestration (MongoDB, API, Web)
```

## Available Scripts

### Backend (`/backend`)

| Command | Action |
|---|---|
| `pnpm dev` | Starts server with native Node `--watch` reload |
| `pnpm start` | Runs production server (`node src/server.js`) |

### Frontend (`/frontend`)

| Command | Action |
|---|---|
| `pnpm dev` | Starts Next.js development server at port 3000 |
| `pnpm build` | Compiles optimized production bundle using Turbopack |
| `pnpm start` | Serves production Next.js build |
| `pnpm lint` | Runs ESLint analysis across frontend source files |

## Core Modules & API Overview

The backend exposes REST endpoints under `/api`:

- **`/api/auth/*`**: Customer and administrator authentication powered by Better-Auth (sessions, credentials, password recovery).
- **`/api/products`**: Catalog browsing, filtering by audience/fabric/price, and detail lookup.
- **`/api/search`**: Text search with synonym expansion across South Asian garment names.
- **`/api/cart`**: Server-persisted shopping bag with price validation.
- **`/api/orders`**: Checkout processing, COD dispatch, Raast bank transfer confirmation, and doorstep inspection status tracking.
- **`/api/complaints`**: Customer dispute threads and resolution workflow.
- **`/api/admin/*`**: Administrative management of catalog, orders, stock adjustments, coupons, delivery charges, and banners.

## Security Practices

- **Field-Level Encryption**: Sensitive user data (e.g. CNIC numbers) is encrypted at rest using AES-256-GCM.
- **Admin Isolation**: Admin routes require authenticated sessions matching verified administrative roles and environment configurations.
- **Parameter Tamper Protection**: Prices, discounts, and inventory balances are always calculated and verified on the server.
- **Strict Content Security**: HTTP security headers, CORS origin whitelisting, and strict rate-limiting are enforced on all routes.

## License

Proprietary. All rights reserved. Unauthorized copying, modification, distribution, or commercial use of this codebase is strictly prohibited.
