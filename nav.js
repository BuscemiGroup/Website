/* /nav.js – v2.1 - Robuuste navigatie & Dropdown Fix
   - Zorgt ervoor dat de dropdown correct sluit na een klik of bij een klik buiten het menu.
*/
(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // --- Mobile Menu Logic (onveranderd) ---
  const toggleBtn = qs('[data-nav-toggle]');
  const menu = qs('[data-nav-menu]');
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
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }

  // --- OPGELOST: Verbeterde Dropdown Logic ---
  const allDropdowns = qsa('details.dropdown');
  
  // 1. Sluit de dropdown als er op een link erin wordt geklikt.
  allDropdowns.forEach(details => {
    const submenuLinks = qsa('.submenu a', details);
    submenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        details.removeAttribute('open');
      });
    });
  });

  // 2. Sluit de dropdown als er buiten de dropdown (en buiten de mobiele menu knop) wordt geklikt.
  document.addEventListener('click', (e) => {
    // Sluit mobiel menu bij klik buiten
    if (menu && menu.classList.contains('is-open') && !menu.contains(e.target) && !toggleBtn.contains(e.target)) {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    // Sluit desktop dropdowns bij klik buiten
    const openDropdown = qs('details[open]');
    if (openDropdown && !openDropdown.contains(e.target)) {
      openDropdown.removeAttribute('open');
    }
  });


  // --- Active Link Logic (onveranderd) ---
  const links = qsa('[data-nav-link]');
  const markActive = () => {
    const path = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    links.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const normHref = href.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
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
