# AGENTS.md

## Purpose
This repository is developed with AI-assisted workflows in OpenCode.
**Mistension** is a Google Chrome extension (Manifest V3) designed for QA engineers testing Medical Information Systems (MIS). It automates test data generation and form autofilling using configurable XPath locators and pattern-based templates.

Agents working in this repo must prioritize:
- **Correctness & Reliability:** Generated test data (SNILS, dates, IDs, Cyrillic strings) must be valid and accurately inserted into web forms.
- **Manifest V3 Compliance:** Adhere strictly to Chrome Extensions MV3 lifecycle (Service Workers, Content Scripts, Storage API, Permissions).
- **Safety & Non-destructiveness:** Never wipe user locators or state without explicit intent; preserve backward compatibility for exported locator files.
- **Explicit Architecture & Separation of Concerns:** Keep generation logic (`randomStringUtils.js`), storage/import/export (`utils.js`), DOM interaction (`content_autofill.js`), and options UI (`autofill.js`) clearly separated.
- **Stage-Based Delivery:** Work in small, reviewable increments with concrete verification.

---

## Working Model

### Default Execution Model
For any non-trivial task:
1. **Plan First:** Inspect relevant files, produce a concise implementation plan with clear scope and verification steps.
2. **Stage Discipline:** Limit modifications strictly to the current stage/feature. Do not perform broad uncontrolled rewrites.
3. **Minimum Viable Increment:** Write cohesive, well-scoped code following existing project patterns.
4. **Verification:** Test changes (verify syntax, mock/test generation algorithms, validate JSON schema compatibility, and test in Chrome extension context).
5. **Change Report:** Produce a concise summary of changes, verified items, known debt, and manual QA checklist.

---

## Project Structure & Architecture

```
Mistension/
├─ AGENTS.md                  # Project contract for OpenCode
├─ opencode.json              # OpenCode control plane & permissions
├─ manifest.json              # Chrome Extension MV3 Manifest
├─ mistension_locators.json   # Default locator preset
├─ README.md                  # User & contributor documentation
├─ about.md                   # Project overview, SWOT analysis & roadmap
├─ instructions/              # Persistent project instructions (defaults, safety)
├─ docs/                      # Durable specs, stage definitions, reports, ADRs, runbooks
│  ├─ specs/                  # Technical specifications
│  ├─ stages/                 # Capability-based development stages
│  ├─ reports/                # Stage execution reports
│  ├─ adr/                    # Architecture Decision Records
│  └─ runbooks/               # Operational guides
├─ .opencode/                 # Subagents, playbooks (skills), and templates
│  ├─ agents/                 # Role profiles (extension-developer, qa-automation)
│  ├─ skills/                 # Task playbooks (locator-design, troubleshooting)
│  └─ templates/              # Standard report/spec/ADR templates
├─ js/                        # JavaScript modules
│  ├─ background.js           # MV3 Service Worker (hotkeys, lifecycle)
│  ├─ content_autofill.js     # Content Script (interactive autofill, confetti)
│  ├─ autofill.js             # Options UI logic (accordion CRUD)
│  ├─ utils.js                # Storage, import/export helpers
│  └─ randomStringUtils.js    # Data generator (SNILS, dates, templates)
├─ html/                      # UI pages (options, autofill tab, about tab)
├─ css/                       # Content & UI styling
├─ img/                       # Icons, cursors, images
└─ lib/bootstrap/             # Bootstrap 5 assets
```

---

## Code Quality & Engineering Rules

### JavaScript & DOM Guidelines
- Use standard ES6+ modules (`import`/`export`).
- When dispatching DOM input events, ensure full compatibility with reactive frameworks (React/Vue/Angular):
  - Set values via native property setters if needed (`HTMLInputElement.prototype`).
  - Dispatch both `input` and `change` events with `{ bubbles: true }`.
- Keep functions small, pure, and focused.
- Handle async operations with `async/await` and proper `.catch()` error handling.

### Chrome Extension MV3 Guidelines
- Treat the Service Worker (`background.js`) as ephemeral (it may be terminated by Chrome at any time).
- Do not store state in memory inside `background.js`; use `chrome.storage.local`.
- When updating `chrome.storage.local` on extension install/update, do not wipe existing user locators (`clear()`); always merge or preserve existing data.
- Ensure all resources referenced by Content Scripts are declared in `web_accessible_resources` if loaded dynamically.

### Storage & Locator JSON Schema
A locator item must have the following structure:
```json
{
  "desc": "Short description of the field",
  "xpath": "//input[@id='target-id']",
  "value": "%snils | %date | %d4 | static text"
}
```
Validation must be key-order agnostic and validate value lengths and XPath validity gracefully.

---

## Verification & Testing Rules

Since this is a client-side Chrome Extension:
1. **Algorithm Verification:** For changes in `randomStringUtils.js` or `utils.js`, verify logic against edge cases (SNILS checksum, leap years, boundary lengths, empty inputs).
2. **Schema & JSON Verification:** Ensure `mistension_locators.json` remains valid JSON and satisfies schema rules.
3. **DOM & Event Safety:** Ensure event dispatchers and XPath evaluators do not throw runtime exceptions on unexpected DOM structures.
4. **Manual QA Checklist:** Always provide clear manual test steps:
   - How to reload the unpacked extension in `chrome://extensions`.
   - Which hotkey to press (`Ctrl+Shift+F`).
   - Which test inputs to click and expected generated values.

---

## Expected Response Format for Tasks

At the end of an implementation stage or feature:
1. **Summary of changes:** Concrete list of what was added/modified.
2. **Files affected:** Paths relative to project root.
3. **Verification performed:** Tests, validations, and checks run.
4. **Known limitations / Tech debt:** Explicitly state any shortcuts or deferred work.
5. **Manual QA steps:** Step-by-step instructions for testing in browser.
6. **Recommended next step:** Next logical stage or improvement.
