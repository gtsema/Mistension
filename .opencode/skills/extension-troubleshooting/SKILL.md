---
name: extension-troubleshooting
description: Diagnose and resolve Manifest V3 lifecycle issues, content script communication errors, and DOM event propagation problems.
compatibility: opencode
metadata:
  audience: developers
  domain: browser-extensions
---

## What I do
- Debug Service Worker termination and message passing (`chrome.tabs.sendMessage`, `chrome.runtime.onMessage`).
- Resolve `web_accessible_resources` and CSP blocking issues in content scripts.
- Troubleshoot reactive form state desynchronization (React/Vue not picking up injected input values).
- Inspect `chrome.storage.local` data serialization and corruption.

## Common Checks
1. Check DevTools console for CSP or cross-origin errors.
2. Ensure active tab ID is valid when dispatching commands from background.
3. Verify that native setter `HTMLInputElement.prototype` was invoked if `element.value = ...` does not update application state.
4. Check storage promises for unhandled rejections.
