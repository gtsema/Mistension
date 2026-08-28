# Instructions: Safety, Security & Permissions

## Chrome Extension Permissions
- Follow the Principle of Least Privilege: only request necessary permissions in `manifest.json`.
- Current permissions:
  - `storage`: For storing user locators and settings.
  - `commands`: For hotkey bindings (`Ctrl+Shift+F`).
  - `activeTab` / `scripting`: For interacting with the target tab DOM.
- Host permissions must strictly define target environments. When expanding to new domains or staging servers, document host permission implications.

## Data Preservation & State Safety
- **Never call `chrome.storage.local.clear()` during routine updates or extension installs** without user consent.
- Always perform non-destructive updates (read existing locators -> merge new ones -> save back).
- Provide export capabilities before any batch migration or schema change.

## DOM Injection Safety
- Avoid `innerHTML` with unsanitized user strings to prevent XSS. Use `textContent`, `innerText`, or create elements via `document.createElement`.
- Confetti elements must have `pointer-events: none` and must be cleaned up (`remove()`) immediately after animation finishes to prevent DOM leaks.
- XPath queries executed in content scripts must be wrapped in `try/catch` or validated to avoid unhandled page exceptions.
