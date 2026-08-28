document.addEventListener('DOMContentLoaded', () => {
  // Переключение активного класса на вкладках навигации
  document.querySelectorAll('#navTabs .nav-link').forEach(link => {
    link.addEventListener('click', function() {
      document.querySelectorAll('#navTabs .nav-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
});
