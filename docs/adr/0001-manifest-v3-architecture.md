# ADR 0001 — Manifest V3 Architecture

## Status
Accepted

## Context
Chrome Web Store and modern Chromium browsers require Manifest V3 for browser extensions. Background pages are replaced by event-driven Service Workers, and remote script injection is restricted.

## Decision
Build Mistension strictly on Manifest V3:
- Use `background.service_worker` (`js/background.js`) with `"type": "module"`.
- Use content scripts and dynamic module imports (`chrome.runtime.getURL`).
- Bundle all third-party libraries locally (Bootstrap 5 in `lib/bootstrap/`).

## Consequences
### Positive
- Complies with modern Chrome security requirements.
- Modular ES6 code structure.
### Negative
- Service Workers are ephemeral and cannot hold state in memory; all state must reside in `chrome.storage.local`.
