// nav.js — toegankelijk nav-menu + jaar + SW-registratie

document.addEventListener('DOMContentLoaded', () => {
  // 1) Copyright-jaar updaten
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // 2) Nav toggle (ARIA + toegankelijkheid)
  const toggle = document.querySelector('[data-nav-toggle]') || document.getElementById('navToggle');
  const menu   = document.querySelector('[data-nav-menu]')   || document.getElementById('navMenu');

  if (toggle && menu) {
    // Zorg dat menu initieel verstopt is als hidden attribuut op het element staat
    const setOpen = (isOpen) => {
      toggle.setAttribute('aria-expanded', String(isOpen));
      menu.hidden = !isOpen;
    };

    // Init
    if (!toggle.hasAttribute('aria-controls') && menu.id) {
      toggle.setAttribute('aria-controls', menu.id);
    }
    if (!toggle.hasAttribute('aria-expanded')) {
      toggle.setAttribute('aria-expanded', 'false');
    }
    if (!('hidden' in menu)) {
      menu.hidden = true; // fallback als hidden attribuut ontbreekt
    }

    let open = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(open);

    toggle.addEventListener('click', () => {
      open = !open;
      setOpen(open);
      if (open) {
        // focus eerste link in menu indien aanwezig
        const firstLink = menu.querySelector('a, button');
        if (firstLink) firstLink.focus();
      } else {
        toggle.focus();
      }
    });

    // Sluit met Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) {
        open = false;
        setOpen(false);
        toggle.focus();
      }
    });

    // Klik buiten menu sluit het
    document.addEventListener('click', (e) => {
      if (!open) return;
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        open = false;
        setOpen(false);
      }
    });
  }

  // 3) Service Worker registreren
  if ('serviceWorker' in navigator) {
    // Wacht tot de pagina geladen is zodat SW rustig kan registreren
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW optioneel; geen hard error nodig
      });
    });
  }
});
