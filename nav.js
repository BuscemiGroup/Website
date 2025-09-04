/** Accessible hamburger toggle for mobile nav */
(function(){
  const btn = document.querySelector('.burger');
  const nav = document.getElementById('primary-nav');
  if(!btn || !nav) return;
  btn.setAttribute('aria-controls', 'primary-nav');
  btn.setAttribute('aria-expanded', 'false');
  nav.setAttribute('aria-label', 'Hoofdnavigatie');
  nav.hidden = true;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    nav.hidden = open;
    if(!open){
      // focus first link when opening for keyboard users
      const firstLink = nav.querySelector('a,button,input,select,textarea');
      if(firstLink) firstLink.focus({preventScroll:true});
    } else {
      btn.focus({preventScroll:true});
    }
  });
})();
