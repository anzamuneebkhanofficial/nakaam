# AGENTS.md (Backend API Scope)

> **Context:** This directory contains the Express.js and MongoDB backend service. It inherits all root `.agents/rules/` from the parent directory.

## Subfolder Rules & Layout
- **Architecture:** `src/routes/` -> `src/controllers/` -> `src/services/` -> `src/models/`.
- **Framework Ambient Docs:** Check `package.json` for Express & Mongoose versions; inspect local docs before coding. Never write legacy callback patterns.
- **Database Performance:** Never run queries inside loops (eliminate N+1 queries with `$in` or batching); maintain connection pooling; add composite indexes on multi-field queries.
- **Validation:** Enforce validation on every route using Zod or Joi middleware before reaching controllers. Reject invalid input immediately.
- **Async Errors:** Use centralized error middleware (`src/middlewares/errorHandler.js`); never leak raw database errors or stack traces to clients.
- **Security & Packages:** Apply rate limiting to auth routes; validate file uploads (magic bytes + size); check compatibility before installing any backend package.
- **Response Format:** `{ "success": boolean, "data": any, "message": string }`.
- **Boundaries:** Do not edit files outside `api/` when working on backend tasks.
