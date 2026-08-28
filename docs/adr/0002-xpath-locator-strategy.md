# ADR 0002 — XPath Locator Strategy

## Status
Accepted

## Context
Medical Information Systems often render complex nested DOM structures with dynamic IDs or custom web components. CSS selectors alone are sometimes insufficient to match inputs based on neighboring label text or parent fieldset headings.

## Decision
Use XPath 1.0 expressions as the primary locator strategy for targeting input elements.
Locators are evaluated via `document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)`.

## Consequences
### Positive
- Allows advanced queries like `//fieldset[descendant::h3[text() = ' Адрес ']]//input[following-sibling::label[text()=' Дом ']]`.
- Familiar syntax for QA automation engineers (Selenium/Playwright background).
### Negative
- Evaluating multiple XPaths on click incurs CPU cost if the locator collection becomes large.
- XPaths can be brittle if UI layout structure changes.
