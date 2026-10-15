<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md (Frontend Web Scope: React / Vite & Next.js)

> **Context:** This directory contains the client frontend (which may be built with **React + Vite** or **Next.js**). Check `web/package.json` to identify the framework. It inherits all root `.agents/rules/` from the parent directory.

## Subfolder Rules & Layout
- **Framework Detection & Zero-Deprecation:**
  - **If React + Vite:** Follow modern Vite (Vite 5/6, `vite.config.ts`, `import.meta.env`) and React 18/19 functional components with hooks. Never use legacy Webpack configs or class lifecycles.
  - **If Next.js:** Read local documentation in `web/node_modules/next/dist/docs/` before coding. Follow current App Router conventions.
- **Architecture:** `src/components/` (shared widgets), `src/pages/` or `src/app/` (routes), `src/services/` (API client), `src/hooks/` (custom hooks).
- **Frontend Performance:** Keep bundles lean with dynamic imports (`React.lazy`); avoid duplicate API calls with caching/deduping; optimize assets to prevent CLS.
- **Styling:** Use Tailwind utility classes. Follow brand colors and dark/light mode standards from `PROJECT.md`.
- **API Service Layer:** Never hardcode fetch URLs in UI components. Route all API calls through `src/services/api.js`.
- **Security & Packages:** Never bundle private secrets in client environment variables; verify React peer dependencies before installing packages.
- **Boundaries:** Do not edit files outside `web/` when working on frontend tasks.
