/* Mistension — ранняя синхронная установка темы до отрисовки (anti-FOUC).
   Внешний файл (не inline), чтобы не нарушать CSP MV3 `script-src 'self'`.
   Читает быстрый синхронный кэш из localStorage; каноничное значение
   из chrome.storage.local позже применяет js/theme.js. */
(function () {
  try {
    var t = localStorage.getItem('ms-theme');
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
