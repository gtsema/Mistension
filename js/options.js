document.addEventListener('DOMContentLoaded', () => {
  // Переключение активного класса на вкладках навигации
  document.querySelectorAll('#navTabs .nav-link').forEach(link => {
    link.addEventListener('click', function() {
      document.querySelectorAll('#navTabs .nav-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Кнопка переключения темы оформления
  const themeToggle = document.getElementById('themeToggle');

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const isDark = theme === 'dark';
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    themeToggle.setAttribute('title', isDark ? 'Светлая тема' : 'Тёмная тема');
    themeToggle.setAttribute('aria-label', isDark ? 'Светлая тема' : 'Тёмная тема');
    themeToggle.setAttribute('aria-pressed', String(isDark));
  }

  if (themeToggle && window.MistensionTheme) {
    MistensionTheme.get().then(updateThemeIcon);
    themeToggle.addEventListener('click', () => {
      MistensionTheme.toggle();
    });
    document.addEventListener('theme:changed', (e) => updateThemeIcon(e.detail));
  }
});
