# Stage 00 — Foundation (Current Baseline)

## Goal
Establish a working Google Chrome Extension (Manifest V3) for automated test data entry into medical information system forms.

## Scope
- Manifest V3 architecture with Service Worker (`background.js`) and content scripts (`content_autofill.js`).
- Hotkey toggle (`Ctrl+Shift+F`) with custom cursor and confetti animation.
- XPath locator matching on DOM click.
- Basic template generator (`%snils`, `%date`, `%d`, `%s`, `%m`).
- Options UI with locator list (CRUD), JSON import, and export.

## Acceptance Criteria
- Extension installs as unpacked in Chrome.
- Shortcut toggles magic wand cursor.
- Click on matching field fills data and fires input event.
- Default locators auto-import on install.
