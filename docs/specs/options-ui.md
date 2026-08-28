# Specification: Options UI & Management Dashboard

## Architecture
- **Entry point:** `html/options.html`, configured in `manifest.json` under `options_ui.page` with `open_in_tab: true`.
- **Styling:** Bootstrap 5 (`lib/bootstrap/css/bootstrap.min.css`) and custom styles in `css/autofill.css`.
- **Sub-pages:**
  - `html/autofill.html`: Locator list, CRUD operations, import/export buttons.
  - `html/about.html`: Extension info & logo.

## UI Components & Interactions
- **Accordion List (`#myAccordion`):**
  - Displays list of configured locators.
  - Each item contains 3 input fields: `name` (desc), `xpath`, `value`.
  - Actions per item: `Сохранить` (Save), `Отменить` (Cancel/Revert), `Удалить` (Delete).
- **Global Actions:**
  - `Импорт` (Import): Opens file picker via `showOpenFilePicker` to load JSON.
  - `Экспорт` (Export): Downloads `mistension_locators.json` with current data.
  - `Добавить` (Add): Appends a new blank accordion item.
