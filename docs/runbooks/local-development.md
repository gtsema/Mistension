# Runbook: Local Development & Debugging

## Purpose
Guide for setting up, loading, and debugging Mistension locally.

## Loading Extension in Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle **Developer mode** in the top-right corner.
3. Click **Load unpacked** (Загрузить распакованное расширение).
4. Select the `Mistension` root directory.
5. Check `chrome://extensions/shortcuts` to verify the hotkey (default: `Ctrl+Shift+F`).

## Debugging Workflows
- **Service Worker (`background.js`):**
  - Go to `chrome://extensions`, locate Mistension, and click the `service worker` link to open DevTools.
- **Content Scripts (`content_autofill.js`):**
  - Open the target page (e.g. `medzoom.ru`).
  - Open DevTools (`F12`), go to the **Console** or **Sources** tab -> `Content scripts` -> `Mistension`.
- **Options UI (`html/options.html`):**
  - Right-click extension icon -> Options (or click `Extension options` in `chrome://extensions`).
  - Press `F12` to open DevTools for the options page.

## Reloading After Changes
- If modifying `background.js` or `manifest.json`: click the reload icon on the extension card in `chrome://extensions`.
- If modifying `content_autofill.js` or `randomStringUtils.js`: refresh the target web page.
- If modifying `html/` or `css/`: refresh the options tab.
