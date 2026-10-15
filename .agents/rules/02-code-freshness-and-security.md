# 02 — Code Freshness, Ambient Docs & Zero-Deprecation Standards

## 1. Zero-Deprecation Framework Directives (React/Vite, Next.js, Express, DB)
Never write outdated or deprecated code remembered from older pre-2024 training data. Inspect `package.json` first and follow the detected stack:

### A. Next.js (Fullstack & Frontend):
- If Next.js 16.2+, **MANDATORY:** Read local markdown guides in `node_modules/next/dist/docs/` before generating routing, proxy, or server actions.
- Never write legacy `pages` router lifecycles when using App Router. Heed Next.js deprecation notices strictly.

### B. React + Vite (`vite` in package.json):
- Use current Vite standards (Vite 5/6, ESM modules, `vite.config.ts`, `import.meta.env`).
- Use modern React (React 18/19): Functional components, modern hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useTransition`), custom hooks.
- **NEVER** write deprecated Webpack configurations, legacy class lifecycles (`componentDidMount`), old string refs, or obsolete React Router v5 patterns.

### C. Node.js, Express & Database Backend:
- Use modern Express conventions (Express 5 native async route error handling, `express.json()` middleware). Never use obsolete standalone `body-parser` packages.
- Use modern Mongoose 8+ / Prisma: Always use `async/await` and promises. **NEVER** write callback-based queries (`Model.find({}, function(err, docs) {})`).
- Use non-blocking async I/O. Never use synchronous file methods (`fs.readFileSync`) in API route handlers.

### D. Modern Semantics & Type Strictness:
- Use modern ECMAScript/TypeScript syntax (async/await, optional chaining, nullish coalescing, typed interfaces).
- **No Type Safety Bypasses:** Never suppress TypeScript compiler errors using `as any`, `unknown as any`, or `// @ts-ignore`. Always declare explicit, accurate interfaces and types.

## 2. Package Compatibility & Anti-Conflict Discipline (Strict)
- **Pre-Install Architecture Check:** Before adding any dependency, verify that its version is 100% compatible with the project's existing framework and runtime (e.g. Node 20+, React 18/19, Next.js 15/16). Check peer dependency warnings.
- **Zero Unnecessary Packages:** If a requirement can be fulfilled using native standard APIs (e.g. `crypto`, `fetch`, `node:fs/promises`, modern JS array/math methods) or an already-installed library, **do NOT install a new package**.
- **Anti-Blind Update Rule:** Never execute `npm audit fix --force` or unrestricted `npm update`. Blind upgrades frequently introduce breaking API changes that destabilize working builds.
- **Lockfile Integrity:** Always preserve the lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`). Never mix package managers (npm vs pnpm vs yarn).

## 3. The 6 Core Security Pillars
1. **File Upload Safety:** Validate MIME and magic bytes; enforce size caps; store uploads outside web root; never executable.
2. **Error Handling & Information Leakage:** Never expose stack traces or raw database errors to clients. Return generic client messages; log full traces server-side only.
3. **Dependency Vulnerability Audits:** Audit dependencies (`npm audit`); never introduce packages with critical CVEs.
4. **Secrets Management & Environment Contract:** Zero hardcoded secrets; use `.env` exclusively; document all variables in `.env.example` with dummy placeholders.
5. **Input Validation (Strict Schema Enforcement):** Validate every client input and API payload with strict schemas (Zod/Joi). Reject invalid inputs immediately.
6. **Rate Limiting:** Exponential backoff on auth routes (`/login`, `/signup`); moderate limits on public endpoints; configurable thresholds.

## 4. Security Audit Blueprint (`/brain/security/`)
For security audits, generate findings into `/brain/security/`:
- `threat-model.md`: Assets, trust boundaries, actors, entry points, threats, risk ratings.
- `secrets.md`: Audit of secret locations, types, and risks (no actual secret values).
- `attack-surface.md`: Public entry points, data flows, auth controls, integrations.
- `security-checklist.md`: 6-point verification (Uploads, Errors, Dependencies, Secrets, Validation, Rate limits).
