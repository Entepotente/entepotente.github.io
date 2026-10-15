(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  var dark = saved ? saved === 'dark'
    : !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) root.setAttribute('data-theme', 'dark');

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeBtn');
    if (!btn) return;
    function label() {
      var isDark = root.getAttribute('data-theme') === 'dark';
      btn.textContent = isDark ? 'Claro' : 'Oscuro';
      btn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
    label();
    btn.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('theme', isDark ? 'light' : 'dark'); } catch (e) {}
      label();
    });
  });
})();
