# 01 — Workflow, Two-Phase Planning Gatekeeper & Reporting

## 1. Task Classification
Before touching any code in either `api/` or `web/`, classify the request:
- **Small Task:** Minor UI tweak in `web/`, 1-line query/route tweak in `api/`, small CSS adjust.
  - *Action:* Locate target using Anchor String Search, implement directly in that specific folder, and conclude with the Mandatory Task Report.
- **Large Task:** New fullstack features spanning both `api/` and `web/`, database schema mutations, new microservices/routes, multi-file refactors.
  - *Action:* You MUST follow the Two-Phase Implementation Plan Protocol below. **DO NOT write any code yet.**

## 2. Two-Phase Implementation Plan Protocol (Strictly Enforced)

### Phase 1 — Planning & The Hard Stop
1. **Deep Analysis:** Inspect relevant files in `api/` and `web/` using targeted reads.
2. **Draft Implementation Plan:**
   - **Overview:** Exactly what is being built/modified across `api/` and `web/`.
   - **Files to be Modified/Created:** Exact file paths in each subfolder.
   - **Step-by-Step Logic:** Backend API contract -> Data flow -> Frontend UI rendering.
   - **Potential Risks/Impact:** CORS mismatches, breaking API contract between `api` and `web`.
3. **The HARD STOP (Wait for Approval):**
   - Present the plan.
   - **CALL ZERO FILE-WRITING OR EDITING TOOLS IN THIS TURN.**
   - End response with this exact question:
     *"Do you approve this implementation plan? I will not write, modify, or delete any code until you explicitly reply with 'Approved' or 'Proceed'."*
   - Stop and yield execution back to the user.

### Phase 2 — Execution (After Approval Only)
- Start coding ONLY after user explicitly types "Approved", "Proceed", or "Go ahead".
- **Plan Revision Rule:** If the user responds with feedback or requests changes to the plan, revise the implementation plan and **STOP AGAIN** for approval. Do not start coding until the revised plan is approved.
- Follow the approved plan strictly in small verifiable increments (checkpointing).

## 3. Mandatory Task Reporting Protocol
After finishing any task, output a report using this exact structure. Never just say "Done" or "Fixed."

### 📌 Task Overview
Briefly explain what the user asked for.

### 🔍 Root Cause Analysis (The "Why")
Why did this issue happen or why was this feature needed? Explain the gap in `api/` or `web/`.

### 🛠️ The Fix (The "How")
Explain the exact logic changed in the backend route/controller or frontend component.

### 🔄 Before vs. After
- **Before:** What the app or endpoint was doing previously.
- **After:** What the app or endpoint does now.

### 📝 Final Summary
A concise 2-3 sentence summary explaining the final state of the MERN project.
