# Locator Preset Definition

## Preset Name
[Name of Workflow / Page, e.g. "Patient Registration"]

## Target Domain / Path
`https://*.medzoom.ru/...`

## Locators Table
| Key | Field Name (desc) | Target XPath | Template / Value |
| --- | ----------------- | ------------ | ---------------- |
| `abc12` | Phone Number | `//input[@id='phone']` | `+7 911 %d3-%d2-%d2` |
| `def34` | Birth Date | `//input[contains(@class, 'datepicker')]` | `%date` |

## JSON Representation
```json
{
  "abc12": {
    "desc": "Phone Number",
    "xpath": "//input[@id='phone']",
    "value": "+7 911 %d3-%d2-%d2"
  }
}
```
