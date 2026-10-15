# 00 — Token Economy, Anti-Rescanning & Conversational Memory (Master Rule)

## Core Directive
Operate with extreme context efficiency. Quota and context window are scarce budgets. Never read files or scan directories speculatively.

## The 5 Anti-Waste Rules

1. **Conversational Turn Memory (Anti-Rescan on "Continue"):**
   - When the user prompts with "Continue", "Go ahead", or a follow-up instruction: **NEVER** re-scan the project directory, re-list folders, or re-read files that were already opened earlier in this conversation session.
   - Retain and trust the context already loaded in your conversation history. Proceed immediately to the next targeted diff.

2. **Anchor String Exact Targeting & Subfolder Isolation:**
   - When a bug or feature is in `api/`, do NOT scan or read files in `web/`.
   - When a bug or feature is in `web/`, do NOT scan or read files in `api/`.
   - Use `grep_search` with the exact literal string (e.g. endpoint path, component text, error message) strictly inside the affected subfolder.

3. **Never Re-Scan the Codebase:**
   - Do NOT run directory-wide searches or open multiple unrelated files when addressing a specific bug or feature.
   - Use targeted symbol searches strictly for the named unit.

4. **Never Rewrite Entire Files (Targeted Diffs Only):**
   - Use targeted line replacements (`replace_file_content`).
   - If modifying a 200-line file to change 4 lines, touch only those 4 lines. Full-file rewrites waste output quota and create accidental regressions.

5. **Reuse Before Create & Ask Instead of Guessing:**
   - Check if an existing component, utility, or validator already exists before writing duplicate code.
   - If a request is ambiguous, ask ONE short clarifying question upfront instead of guessing wrong and burning quota on a rollback.
