document.addEventListener('DOMContentLoaded', function () {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  const dropdown = document.querySelector('.nav-links .dropdown');
  if (dropdown) {
    const toggle = dropdown.querySelector('a');
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    dropdown.addEventListener('focusin', () => {
      toggle.setAttribute('aria-expanded', 'true');
    });
    dropdown.addEventListener('focusout', (e) => {
      if (!dropdown.contains(e.relatedTarget)) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  if (!burger || !nav) return;
  burger.addEventListener('click', function () {
    const isOpen = nav.style.display === 'block';
    nav.style.display = isOpen ? '' : 'block';
    burger.setAttribute('aria-expanded', String(!isOpen));
  });
});
