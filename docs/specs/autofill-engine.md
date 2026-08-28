# Specification: Autofill & Generator Engine

## Overview
The autofill engine consists of:
1. **Interactive Click Trigger:** In content script (`js/content_autofill.js`).
2. **Data Generator:** In `js/randomStringUtils.js`.

## Click & Autofill Pipeline
1. User enables mode via shortcut (`Ctrl+Shift+F`), toggling `customCursorEnabled`.
2. On click event within the document:
   - Check if `customCursorEnabled` is `true`.
   - Read from in-memory `cachedLocators` (kept in sync via `chrome.storage.onChanged`).
   - Identify target interactive element (`e.target.closest('input, textarea, select') || e.target`).
   - Iterate through cached locators using `for...of`.
   - For each locator, execute `document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)` wrapped in `try/catch`.
   - If `singleNodeValue` matches `targetElement` or contains `e.target`:
     - Generate value using `RandomStringUtils.randomByTemplate(locator.value)`.
     - Truncate value to max 128 characters.
     - Assign via native property setter (`HTMLInputElement.prototype.value`) for React/Vue compatibility.
     - Dispatch `input` and `change` events with `{ bubbles: true }`.
     - Trigger `showConfetti(e.clientX, e.clientY)`.
     - Break search immediately.
     - If a dropdown `[role=listbox]` is present, attempt auto-selection if a single matching `[role=option]` exists.

## Generator Syntax
- `%snils`: Generates Russian SNILS with valid 2-digit checksum.
- `%date`: Generates birth dates in `DD.MM.YYYY` format with a 3-step cycle:
  1. *1st click:* Minor / Child age (0–18 years).
  2. *2nd click:* Exactly 18 years old (boundary adult age).
  3. *3rd click:* Adult / Senior age (18–100 years).
  4. *Next clicks:* Cycles back (1 -> 2 -> 3 -> 1...).
- `%d[N]`: `N` digits (`0-9`).
- `%s[N]`: `N` Latin letters (`A-Za-z`).
- `%m[N]`: `N` mixed alphanumeric characters (`0-9A-Za-z`).
- Any non-template substring is preserved verbatim.
