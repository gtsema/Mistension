# Specification: Locators Schema & Persistence

## Storage Model
All locators are stored in `chrome.storage.local` under the key `"locators"`.

### Object Structure
```json
{
  "uniqueKey1": {
    "desc": "Human-readable field name",
    "xpath": "//input[@id='target-input']",
    "url": "https://*.medzoom.ru/orders/*, /patients/*",
    "value": "Template or static string"
  }
}
```

## Constraints & Validation Rules
- **Key:** Random 5-character alphanumeric string generated via `RandomStringUtils.randomAlphanumeric(5)`.
- **desc:** Non-empty string, length 1..128 characters.
- **xpath (or selector):** Valid XPath 1.0 or CSS selector.
- **url:** Optional string containing comma-separated URL paths or wildcards (e.g. `/patients*`, `https://*.medzoom.ru/*`). If empty or omitted, applies to all pages.
- **value:** Non-empty string, length 1..128 characters.

## Import & Export Format
Export creates a `mistension_locators.json` containing the entire serialized dictionary.
Import must validate:
- JSON parsing validity.
- Non-empty object.
- Each entry contains required fields `desc`, `xpath`, `value` with lengths <= 128 chars.
