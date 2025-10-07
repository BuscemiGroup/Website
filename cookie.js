/* /cookie.js — v2.1 - Google Analytics Consent Mode
   - Toont banner bij eerste bezoek
   - Slaat keuze op in localStorage
   - Activeert Google Analytics tracking alleen na expliciete toestemming
*/

(function () {
  "use strict";

  // ====== CONFIG ======
  var STORAGE_KEY = "bg_consent_v2"; // Nieuwe versie om oude keuzes te resetten
  var GA_ID = 'G-D3JNSNPKPG'; // Uw Google Analytics ID
  var RESPECT_DNT = true;
  // =====================

  var doc = document;
  var w = window;

  function $(sel, root) { return (root || doc).querySelector(sel); }

  // Functie om Google Analytics te activeren
  function fireAnalytics() {
    if (typeof gtag === 'function') {
      gtag('config', GA_ID, { 'send_page_view': true });
      console.log('Google Analytics tracking geactiveerd na toestemming.');
    }
  }

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
    catch (e) { return null; }
  }

  function setConsent(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      analytics: !!obj.analytics,
      date: new Date().toISOString(),
      v: 2
    }));
  }

  function resetConsent() {
    localStorage.removeItem(STORAGE_KEY);
    if (w.location.hash === '#reset-consent') w.location.hash = '';
    w.location.reload();
  }

  function hasDNT() {
    var dnt = w.doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack;
    return ("" + dnt === "1" || "" + dnt === "yes");
  }

  // ====== UI ======
  var ui = {
    root: null,
    modal: null,
    build: function () {
      if (this.root) return;
      var wrap = doc.createElement("div");
      wrap.id = "bg-consent";
      wrap.innerHTML = [
        '<div class="bgc-banner" role="dialog" aria-live="polite" aria-label="Cookie melding">',
          '<div class="bgc-text">',
            '<strong>Cookies & Analytics</strong>',
            '<p>We gebruiken functionele opslag en optionele analytics om de site anoniem te verbeteren.</p>',
          '</div>',
          '<div class="bgc-actions">',
            '<button class="btn bgc-btn-ghost" data-consent="reject" type="button">Weiger</button>',
            '<button class="btn alt bgc-btn-alt" data-consent="custom" type="button">Instellingen</button>',
            '<button class="btn bgc-btn" data-consent="accept" type="button">Accepteer alles</button>',
          '</div>',
        '</div>',
        '<div class="bgc-modal" role="dialog" aria-modal="true" aria-labelledby="bgc-modal-title" hidden>',
          '<div class="bgc-card">',
            '<h3 id="bgc-modal-title">Voorkeuren</h3>',
            '<div class="bgc-row">',
              '<div><strong>Noodzakelijk</strong><br><span class="muted">Altijd actief voor basisfunctionaliteit.</span></div>',
              '<div><input type="checkbox" checked disabled></div>',
            '</div>',
            '<div class="bgc-row">',
              '<div><strong>Analytics</strong><br><span class="muted">Helpt ons anoniem de website te verbeteren.</span></div>',
              '<div><label class="bgc-switch"><input id="bgc-analytics" type="checkbox"><span class="bgc-slider"></span></label></div>',
            '</div>',
            '<div class="bgc-actions-right">',
              '<button class="btn bgc-btn-ghost" data-consent="modal-cancel" type="button">Annuleer</button>',
              '<button class="btn bgc-btn" data-consent="modal-save" type="button">Opslaan</button>',
            '</div>',
          '</div>',
        '</div>'
      ].join("");
      var css = doc.createElement("style");
      css.textContent = [
        ':root{--bgc-bg:var(--bg,#fff);--bgc-text:var(--text,#141414);--bgc-line:var(--line,#ececef);',
        '--bgc-green:var(--green,#0e4d38);--bgc-green2:var(--green-2,#0b3e2e);--bgc-shadow:var(--shadow,0 6px 24px rgba(0,0,0,.08));',
        '--bgc-radius:14px}',
        '#bg-consent{position:fixed;left:0;right:0;bottom:0;z-index:2000;display:flex;justify-content:center;padding:12px}',
        '.bgc-banner{max-width:1040px;width:100%;display:flex;gap:12px;align-items:center;background:var(--bgc-bg);color:var(--bgc-text);border:1px solid var(--bgc-line);border-radius:var(--bgc-radius);padding:12px 14px;box-shadow:var(--bgc-shadow)}',
        '.bgc-text p{margin:.25rem 0 0;opacity:.9}',
        '.bgc-actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}',
        '.bgc-btn{background:var(--bgc-green);color:#fff} .bgc-btn:hover{background:var(--bgc-green2)}',
        '.bgc-btn-ghost{background:transparent;border:1px solid var(--bgc-line);color:var(--bgc-text)}',
        '.bgc-btn-ghost:hover{background:#f5f6f7}',
        '.bgc-btn-alt{border-color:var(--bgc-green);color:var(--bgc-green)} .bgc-btn-alt:hover{background:var(--bgc-green);color:#fff}',
        '.bgc-modal{position:fixed;inset:0;background:rgba(0,0,0,.35);display:none;place-items:center}',
        '.bgc-card{background:var(--bgc-bg);color:var(--bgc-text);border:1px solid var(--bgc-line);border-radius:var(--bgc-radius);max-width:560px;width:92%;padding:16px;box-shadow:var(--bgc-shadow)}',
        '.bgc-row{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--bgc-line);padding:12px 0}',
        '.bgc-actions-right{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}',
        '.muted{color:var(--muted,#5e6168)}',
        '.bgc-switch{position:relative;display:inline-block;width:44px;height:24px}',
        '.bgc-switch input{opacity:0;width:0;height:0}',
        '.bgc-slider{position:absolute;cursor:pointer;inset:0;background:#dfe3e8;transition:.2s;border-radius:20px}',
        '.bgc-slider:before{content:"";position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;transition:.2s;border-radius:50%}',
        'input:checked + .bgc-slider{background:var(--bgc-green)} input:checked + .bgc-slider:before{transform:translateX(20px)}',
        '@media (max-width:700px){#bg-consent{padding:12px} .bgc-banner{flex-direction:column;align-items:flex-start}}'
      ].join('');
      doc.head.appendChild(css);
      doc.body.appendChild(wrap);
      this.root = wrap;
      this.modal = $('.bgc-modal', wrap);
      wrap.addEventListener('click', function (e) {
        var t = e.target;
        if (!t.closest('[data-consent]')) return;
        var action = t.closest('[data-consent]').getAttribute('data-consent');
        if (action === 'reject') { ui.hide(); applyConsent({ analytics: false }); }
        if (action === 'accept') { ui.hide(); applyConsent({ analytics: true }); }
        if (action === 'custom') { ui.openModal(); }
        if (action === 'modal-cancel') { ui.closeModal(); }
        if (action === 'modal-save') {
          var allowed = !!$('#bgc-analytics').checked;
          ui.closeModal();
          ui.hide();
          applyConsent({ analytics: allowed });
        }
      });
      this.modal.addEventListener('click', function (e) { if (e.target === ui.modal) ui.closeModal(); });
    },
    show: function () { this.build(); this.root.style.display = 'flex'; },
    hide: function () { if (this.root) this.root.style.display = 'none'; },
    openModal: function () {
      this.build();
      var saved = getConsent();
      var dnt = RESPECT_DNT && hasDNT();
      var chk = $('#bgc-analytics');
      if (chk) chk.checked = saved ? !!saved.analytics : !dnt;
      this.modal.hidden = false;
      this.modal.style.display = 'grid';
    },
    closeModal: function () { if (this.modal) { this.modal.hidden = true; this.modal.style.display = 'none'; } }
  };

  function applyConsent(c) {
    setConsent(c);
    if (c.analytics) {
      fireAnalytics();
    }
  }

  w.cookieConsent = {
    open: function () { ui.openModal(); },
    reset: function () { resetConsent(); }
  };

  function init() {
    doc.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.matches && t.matches('#manage-consent')) {
        e.preventDefault(); w.cookieConsent.open();
      }
    });

    if (w.location.hash === '#reset-consent') {
      resetConsent();
      return;
    }

    var saved = getConsent();
    if (saved) {
      applyConsent(saved);
      return;
    }

    if (RESPECT_DNT && hasDNT()) {
      applyConsent({ analytics: false });
      return;
    }
    
    ui.show();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
