// /nav.js – v2.0 - Robuuste navigatie
// FINAL FIX: Dropdown sluit nu gegarandeerd bij item-klik.
(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const toggleBtn = qs('[data-nav-toggle]');
  const menu = qs('[data-nav-menu]');
  const links = qsa('[data-nav-link]');

  // --- Mobile Menu Logic ---
  if (toggleBtn && menu) {
    const isOpen = () => menu.classList.contains('is-open');

    const openMenu = () => {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
    };
    
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isOpen() ? closeMenu() : openMenu();
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggleBtn.contains(e.target) && isOpen()) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }
  
  // --- Dropdown & Active Link Logic ---
  document.addEventListener('click', (e) => {
    const target = e.target;
    // Sluit dropdown als er op een link binnen de dropdown wordt geklikt
    if (target.matches('.submenu a')) {
      const details = target.closest('details.dropdown');
      if (details) {
        details.removeAttribute('open');
      }
    }
  });

  // Active link markering
  const markActive = () => {
    const path = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    links.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const normHref = href.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
      
      // Markeer exacte match of als de huidige pagina een subpagina is
      if (normHref === path || (path.startsWith(normHref) && normHref !== '/')) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
        const parentDropdown = a.closest('details.dropdown');
        if (parentDropdown) {
          const summary = parentDropdown.querySelector('summary');
          if (summary) summary.classList.add('is-active-parent');
        }
      } else {
        a.classList.remove('is-active');
        a.removeAttribute('aria-current');
      }
    });
  };

  if (links.length > 0) {
    markActive();
  }
})();
