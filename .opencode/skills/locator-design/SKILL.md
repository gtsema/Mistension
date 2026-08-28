---
name: locator-design
description: Design resilient XPath locators and data generation templates for web forms in Medical Information Systems.
compatibility: opencode
metadata:
  audience: qa-engineers
  domain: dom-automation
---

## What I do
- Analyze HTML form markup and formulate robust XPath 1.0 locators.
- Utilize semantic anchors (labels, fieldsets, data-test attributes) instead of brittle absolute paths.
- Match appropriate data generator templates (`%snils`, `%date`, `%d`, `%s`, `%m`).
- Validate XPath syntax using standard browser expressions.

## Workflow
1. Inspect the target form structure.
2. Formulate candidate XPath targeting the `<input>` or `<select>` element.
3. Test uniqueness: ensure the query matches exactly the intended target.
4. Select or craft the matching generator value pattern.
5. Add entry to `mistension_locators.json` with descriptive `desc`.
