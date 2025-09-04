document.addEventListener('DOMContentLoaded', function () {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  if (!burger || !nav) return;
  burger.addEventListener('click', function () {
    const isOpen = nav.style.display === 'block';
    nav.style.display = isOpen ? '' : 'block';
    burger.setAttribute('aria-expanded', String(!isOpen));
  });
});
