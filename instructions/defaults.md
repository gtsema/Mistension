# Instructions: Defaults & Coding Conventions

## JavaScript & Modules
- Use modern ES6+ syntax (`const`/`let`, arrow functions, async/await, template literals, destructuring).
- Modules are imported using standard browser ES module syntax: `import { ClassName } from './module.js';`.
- Dynamic imports in content scripts must resolve through `chrome.runtime.getURL(...)`.
- Avoid adding third-party heavy npm dependencies without explicit justification.

## DOM Manipulation & Event Dispatching
- When filling form inputs, ensure both `input` and `change` events are triggered with `{ bubbles: true }`.
- Account for single-page applications (SPA) where DOM nodes are dynamically mounted or replaced.
- For dropdowns (`[role=listbox]`, `[role=option]`), ensure reasonable delays (`setTimeout` / requestAnimationFrame) before attempting to select options to allow rendering.

## Storage Management
- Use `chrome.storage.local` as the primary persistent database.
- Key `locators` stores an object of `{ [id: string]: { desc: string, xpath: string, value: string } }`.
- When converting between `Map` and plain Object, use `Object.fromEntries(map)` and `new Map(Object.entries(obj))`.

## UI & Styling
- Options UI pages use Bootstrap 5.
- CSS customizations should reside in dedicated stylesheets under `css/`.
- Custom cursor is defined via CSS variable `--custom-cursor` on `document.documentElement`.
