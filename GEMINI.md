# GEMINI.md (Antigravity Behavior Guardrails)

## Agent Interaction Rules
- **Confirmation on Destructive Actions:** Stop and ask explicit confirmation before dropping tables/collections, deleting files, or running destructive shell commands.
- **Two-Phase Planning Gatekeeper (Hard Stop):**
  - **Phase 1 (Planning Phase):** For any Large Task (new features across `api/` and `web/`, schema changes, multi-file refactors), output ONLY the implementation plan. Call ZERO file creation/edit tools in this turn.
  - End the planning response strictly with: *"Do you approve this implementation plan? I will not write, modify, or delete any code until you explicitly reply with 'Approved' or 'Proceed'."*
  - **Phase 2 (Execution Phase):** Start modifying files ONLY after the user explicitly replies "Approved", "Proceed", or "Go ahead". If the user asks for changes, revise the plan and STOP again without editing code.
- **Conversational Memory & Anti-Rescan:**
  - When the user says "Continue", "Go ahead", or provides follow-up feedback: NEVER re-scan the workspace or re-read files that were already loaded in this conversation. Use existing context directly.
- **Anchor String Exact Targeting:**
  - When fixing a specific issue, search strictly for the literal text or identifier using `grep_search`. If working in `api/`, search only in `api/`; if in `web/`, search only in `web/`.
- **Mandatory Task Reporting:** After completing any task, provide the structured report: 📌 Overview, 🔍 Root Cause, 🛠️ Fix, 🔄 Before vs. After, 📝 Final Summary. Never just say "Done".
- **Package Discipline:** Always run package commands in the proper directory (`api/` or `web/`).
