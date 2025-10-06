// /nav.js – toegankelijke navigatie met active state & mobiel menu
// FIX: Dropdown sluit nu bij item-klik.
(() => {
  const qs = (sel, root = document) => root.querySelector(sel)
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel))

  const toggleBtn = qs('[data-nav-toggle]')
  const menu = qs('[data-nav-menu]')
  const links = qsa('[data-nav-link]')
  const dropdowns = qsa('details.dropdown')

  if (!menu) return;

  // --- Mobile Menu Logic ---
  if (toggleBtn) {
    const focusablesSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const isOpen = () => menu.classList.contains('is-open')

    const openMenu = () => {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.addEventListener('keydown', onKeydown);
      document.addEventListener('click', onDocClick);
    }

    const closeMenu = () => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('click', onDocClick);
    }
    
    const toggleMenu = () => (isOpen() ? closeMenu() : openMenu())

    const onDocClick = (e) => { if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) closeMenu(); }

    const onKeydown = (e) => {
      if (e.key === 'Escape') { closeMenu(); toggleBtn.focus(); }
    }

    toggleBtn.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); });
  }

  // --- Dropdown Logic ---
  // FIX: Sluit dropdown wanneer een item wordt geklikt.
  dropdowns.forEach(dropdown => {
    const linksInDropdown = qsa('a', dropdown);
    linksInDropdown.forEach(link => {
      link.addEventListener('click', () => {
        dropdown.removeAttribute('open');
      });
    });
  });

  // --- Active Link Logic ---
  const markActive = () => {
    const path = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/'
    links.forEach((a) => {
      const href = a.getAttribute('href') || ''
      const normHref = href.replace(/index\.html$/, '').replace(/\/$/, '') || '/'
      if (normHref === path || (path.startsWith(normHref) && normHref !== '/')) {
        a.classList.add('is-active')
        a.setAttribute('aria-current', 'page')
        const parentDropdown = a.closest('details.dropdown');
        if (parentDropdown) {
          parentDropdown.querySelector('summary').classList.add('is-active-parent');
        }
      } else {
        a.classList.remove('is-active')
        a.removeAttribute('aria-current')
      }
    })
  }
  markActive();

})()
