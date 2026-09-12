/* Mistension — управление темой оформления.
   Источник истины: chrome.storage.local (ключ "theme").
   localStorage используется как быстрый синхронный кэш, чтобы
   избежать вспышки светлой темы (FOUC) при загрузке страницы.
   Скрипт подключается на options.html, autofill.html, about.html. */
(function () {
  const THEME_KEY = 'theme';
  const CACHE_KEY = 'ms-theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    const value = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', value);
    try {
      localStorage.setItem(CACHE_KEY, value);
    } catch (e) {
      /* localStorage может быть недоступен — не критично */
    }
    document.dispatchEvent(new CustomEvent('theme:changed', { detail: value }));
  }

  function getStoredTheme() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([THEME_KEY], (res) => {
          resolve(res && res[THEME_KEY] ? res[THEME_KEY] : 'light');
        });
      } catch (e) {
        resolve('light');
      }
    });
  }

  function setStoredTheme(theme) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [THEME_KEY]: theme }, () => {
          applyTheme(theme);
          resolve(theme);
        });
      } catch (e) {
        applyTheme(theme);
        resolve(theme);
      }
    });
  }

  // Применяем каноничное значение из chrome.storage при загрузке
  getStoredTheme().then((theme) => {
    const cached = (() => { try { return localStorage.getItem(CACHE_KEY); } catch (e) { return null; } })();
    // Если кэш расходится с хранилищем — доверяем хранилищу
    applyTheme(theme);
    if (cached !== theme) {
      /* ничего дополнительно делать не нужно, applyTheme обновил кэш */
    }
  });

  // Синхронизация между родительской страницей и iframe
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[THEME_KEY]) {
        applyTheme(changes[THEME_KEY].newValue);
      }
    });
  }

  // Публичный API
  window.MistensionTheme = {
    get: getStoredTheme,
    set: setStoredTheme,
    toggle() {
      return getStoredTheme().then((t) => setStoredTheme(t === 'dark' ? 'light' : 'dark'));
    }
  };
})();
