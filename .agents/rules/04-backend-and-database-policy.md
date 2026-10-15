# 04 — Backend, High-Performance Database & API Policy (API Scope)

## 1. Industry-Scale Database Performance & Query Optimization
- **N+1 Query Elimination (Strict):**
  - **NEVER** execute database queries inside iteration loops (`for`, `forEach`, `map`).
  - Use batch querying with `$in` / SQL `IN`, eager loading (`include` / `populate`), or join aggregations to fetch relational data in a single round-trip.
- **Indexing & Scan Prevention:**
  - Create composite indexes for queries filtering on multiple fields (e.g. `{ userId: 1, createdAt: -1 }`).
  - Ensure all foreign keys, status filters, and sorting fields are indexed. Never allow full collection scans / table scans on growing tables.
- **Connection Pooling & Lifecycle:**
  - Maintain a shared connection pool (Mongoose singleton, PrismaClient instance, PostgreSQL pool).
  - Configure pool sizes appropriate to server memory. **Never** open a new database connection per HTTP request.
- **Lean Payloads & Projections:**
  - Always project only needed fields (e.g. `select: { id: true, name: true, email: true }`). Never retrieve whole unneeded blobs or nested arrays.
  - Enforce cursor-based or limit-offset pagination by default on all list endpoints.
- **Event Loop & Memory Protection (Node.js):**
  - Keep route handlers non-blocking. Never use synchronous file or crypto methods (`fs.readFileSync`) in server endpoints.
  - Offload heavy compute or stream large data sets instead of buffering megabytes of JSON in memory.
- **Graceful Shutdown Handling:**
  - Listen for process termination signals (`SIGINT`, `SIGTERM`).
  - Gracefully close active database connections and stop HTTP listeners before exiting to prevent connection leakage.

## 2. Database Mutation Safety
- **Schema Protection:** Stop and request explicit user confirmation before running schema migrations, dropping tables/collections, or wiping seed data.
- **Atomic Operations:** Use transactions for multi-document or multi-table state updates where partial failure causes data corruption.

## 3. Layered API Architecture, CORS & Security
- **Layered Separation:** Express Routes -> Controllers -> Services -> Mongoose Models.
- **CORS & Cookie Security:**
  - Configure CORS origin whitelist dynamically from environment variables (match `web` client port/URL).
  - Enforce secure cookie attributes for authentication tokens: `httpOnly: true`, `sameSite: 'lax'`, and `secure: process.env.NODE_ENV === 'production'`.
- **Standard HTTP Statuses:** Return precise HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Server Error`).
- **Consistent Error Structure:** Format error responses predictably (`{ "success": false, "message": "Reason", "errors": [] }`).
