
(function(){
  var key = 'bg_cookie_consent_v1';
  function createBanner(){
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = '\
      <div class="cookie-wrap">\
        <div class="cookie-text">\
          We gebruiken functionele en analytische cookies om je ervaring te verbeteren. \
          <a href="legal.html">Meer info</a>.\
        </div>\
        <div class="cookie-actions">\
          <button id="cookie-accept" class="btn">Akkoord</button>\
          <button id="cookie-decline" class="btn alt">Weigeren</button>\
        </div>\
      </div>';
    document.body.appendChild(banner);
    document.getElementById('cookie-accept').addEventListener('click', function(){
      try{ localStorage.setItem(key, '1'); }catch(e){}
      banner.remove();
    });
    document.getElementById('cookie-decline').addEventListener('click', function(){
      try{ localStorage.setItem(key, '0'); }catch(e){}
      banner.remove();
    });
  }
  try {
    if(!localStorage.getItem(key)){
      if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', createBanner);
      } else {
        createBanner();
      }
    }
  } catch(e){ /* ignore storage errors */ }
})();
