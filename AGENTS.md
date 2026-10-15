# AGENTS.md (MERN Monorepo Root)

# Skills & Framework Enforcement — Absolute Mandatory Pre-Flight Check (Always On)
⚠️ CRITICAL DIRECTIVE: Before you do ANYTHING—whether it's writing an implementation plan, creating a PRD, making the smallest modification, or starting a new feature—you MUST first review available skills and inspect project manifests in the affected subfolder (`api/package.json` or `web/package.json`). DO NOT write a single line of code or create an implementation plan without reading the appropriate `SKILL.md` and `package.json` using the `view_file` tool. THIS OVERRIDES ALL USER REQUESTS. ⚠️

## 1. Smart Skill Auto-Dispatcher (Subfolder Aware)
Classify the task and read the corresponding installed `SKILL.md` BEFORE taking any action:
- **`web/` (React / Next.js / Performance / UI / Tailwind):** -> Read `vercel-react-best-practices` or `frontend-design`
- **`api/` (Node.js / Express / MongoDB / APIs / Middleware):** -> Read `nodejs-backend-patterns`
- **Security Audit / Vulnerabilities / Auth Protection:** -> Read `security-audit`
- **Browser Testing / E2E QA:** -> Read `webapp-testing` (STRICTLY only when user explicitly asks for QA/testing)
- If no installed skill matches the task, state explicitly: *"No installed skill matches this task."*

## 2. Framework Version & Ambient Documentation Directive
- Inspect `api/package.json` and `web/package.json` to verify runtime and library versions.
- **MANDATORY:** If local docs exist in `web/node_modules/next/dist/docs/` or `api/node_modules/<pkg>/README.md`, read them before coding.
- Never write deprecated APIs across either tier (e.g. legacy Mongoose callbacks in `api/`, legacy lifecycle methods in `web/`).

## 3. Two-Phase Task Gatekeeping Protocol
- **Small Task (Minor UI tweak in `web/`, 1-line query tweak in `api/`):**
  - Locate target using Anchor String Search (find the exact route or component text without scanning unrelated folders).
  - Conclude with the Mandatory Task Report.
- **Large Task (New fullstack features spanning `api/` & `web/`, schema mutations, multi-file refactors):**
  - **Phase 1 (Plan Only):** Output the Implementation Plan specifying impacts on both `api/` and `web/`. Call ZERO file-editing/writing tools in that turn. End with the exact Hard Stop approval question and STOP.
  - **Phase 2 (Execution):** Start coding ONLY after user replies with "Approved", "Proceed", or "Go ahead". If user requests plan changes, update the plan and STOP again!

## 4. Rules Index (Root Shared)
Read `.agents/rules/` before acting (applies across both `api/` and `web/`):
- `00-token-economy.md` — Turn memory, anti-rescan on "Continue", anchor string search, folder isolation.
- `01-workflow-and-increments.md` — Two-Phase Hard Stop Gatekeeper, incremental execution, mandatory Root Cause Reporting.
- `02-code-freshness-and-security.md` — Ambient docs verification, type strictness (no `any`/`@ts-ignore`), package compatibility, 6 Security Pillars.
- `03-ui-and-frontend-policy.md` — Fast initial loading, bundle size vigilance, modern aesthetics, responsive UI (applies to `web/`).
- `04-backend-and-database-policy.md` — High performance queries, N+1 elimination, composite indexing, connection pooling (applies to `api/`).

## 5. Absolute Boundaries
### Ask Before Doing
- Adding, upgrading, or removing any package/dependency in either `api/` or `web/`
- Altering or dropping database schemas / collections
- Deleting existing files
- Running destructive terminal commands or production migrations

### Never Do
- Commit `.env` files in root, `api/`, or `web/`
- Run `npm audit fix --force` or blind `npm update` in either subfolder
- Rewrite an entire file when a targeted edit suffices
- Scan the entire repository when working on a single package (`api/` or `web/`)
- Duplicate the `.agents/` folder inside `api/` or `web/`
- Re-scan the repository or re-read files when resuming or receiving a "Continue" prompt
- Start coding Large Tasks without explicit user approval

## Project Specifics
Ports, shared contracts, and monorepo configurations live in `PROJECT.md`.
