# ADR 0003 — Storage and State Management

## Status
Accepted

## Context
The extension needs to persist user locators and settings locally without requiring an external backend or authentication.

## Decision
Use `chrome.storage.local` with a unified JSON object map structure.
The `Utils` class provides asynchronous helpers (`getLocators()`, `importLocators()`, `exportLocators()`).

## Consequences
### Positive
- Client-side privacy and fast local access.
- Easy serialization to JSON for import/export.
### Negative
- Asynchronous API requires promise handling across content scripts and options UI.
