# Runbook: Release & Distribution

## Purpose
Process for packaging and verifying Mistension versions.

## Pre-release Checklist
1. Verify `manifest.json` version number matches release intent (e.g. `1.1`).
2. Run JSON syntax checks on `manifest.json` and `mistension_locators.json`.
3. Check that all new scripts and resources are listed under `web_accessible_resources` in `manifest.json` if required.
4. Verify hotkey functionality and options UI CRUD operations in clean Chrome profile.
5. Update `about.md` and `docs/reports/` with the latest stage report.

## Packaging
Create a zip archive containing the project root (excluding `.git/`, `.opencode/`, temporary test files):
- Ensure `manifest.json`, `js/`, `html/`, `css/`, `img/`, `lib/`, and `mistension_locators.json` are included.
- Distribute zip to the QA team for installation in Developer mode.
