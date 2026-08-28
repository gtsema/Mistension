# Stage 03 — Modern UI & Storage Hardening

## Goal
Eliminate technical debt in the options UI, modernize storage management, and ensure compatibility with modern frontend frameworks (React/Vue).

## Scope
- Refactor options page from `<iframe>` to single-page Bootstrap Tabs.
- Replace destructive `chrome.storage.local.clear()` on install with smart merge.
- Improve import validation to be key-order agnostic and support `<input type="file">` fallback.
- Support React/Vue native input setters in content script to ensure reactive state synchronization.

## Acceptance Criteria
- Updating or reloading extension does not wipe custom user locators.
- Options page is responsive and navigates cleanly without iframe rendering issues.
- Input values properly update state on React/Vue-based forms.
