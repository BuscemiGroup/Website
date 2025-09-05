/* /cookie.js  —  eenvoudige consent manager (noodzakelijk vs. analytics)
   - Toont banner bij eerste bezoek
   - Slaat keuze op in localStorage
   - Laadt Plausible alleen als analytics toegestaan zijn
   - Exporteert window.cookieConsent.open() en .reset()

   Vereisten:
   1) Verwijder Plausible-script uit <head>. Zet je domain hieronder in PLAUSIBLE_DOMAIN.
   2) Optioneel: zet COOKIELESS_PLAUSIBLE=true als je 100% cookieloze Plausible gebruikt en GEEN consent wil vragen voor analytics.
*/

(function () {
  "use strict";

  // ====== CONFIG ======
  var STORAGE_KEY = "bg_consent_v1";
  var PLAUSIBLE_DOMAIN = "buscemigroup.be";       // <-- pas dit aan
  var COOKIELESS_PLAUSIBLE = false;               // true = laad Plausible zonder banner/consent (cookieloze setup)
  var RESPECT_DNT = true;                         // Do Not Track respecteren? (zet analytics standaard uit als DNT aan staat)
  var BANNER_THEME = "dark";                      // 'dark' of 'light' (alleen voor css-classes)
  // =====================

  var doc = document;
  var w = window;

  function loadScript(src, attrs) {
    return new Promise(function (resolve, reject) {
      var s = doc.createElement("script");
      s.src = src;
      if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
      s.onload = resolve;
      s.onerror = reject;
      doc.head.appendChild(s);
    });
  }

  function getStoredConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function storeConsent(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      analytics: !!data.analytics,
      date: new Date().toISOString(),
      v: 1
    }));
  }

  function hasDNT() {
    var dnt = w.doNotTrack || navigator.doNotTrack || navigator.msDoNotTrack;
    return ("" + dnt === "1" || "" + dnt === "yes");
  }

  function loadPlausibleIfAllowed(consent) {
    // Niet laden als al aanwezig
    if (doc.querySelector('script[src*="plausible.io/js/script"]')) return;

    if (COOKIELESS_PLAUSIBLE) {
      loadScript("https://plausible.io/js/script.js", { defer: "", "data-domain": PLAUSIBLE_DOMAIN });
      return;
    }

    if (consent && consent.analytics === true) {
      loadScript("https://plausible.io/js/script.js", { defer: "", "data-domain": PLAUSIBLE_DOMAIN });
    }
  }

  // ====== UI (banner + modal) ======
  var ui = {
    el: null,
    modal: null,
    build: function () {
      if (this.el) return;
      var wrap = doc.createElement("div");
      wrap.id = "bg-consent";
      wrap.className = "consent-wrap " + (BANNER_THEME === "light" ? "consent--light" : "consent--dark");
      wrap.innerHTML = [
        '<div class="consent-banner">',
          '<div class="consent-text">',
            '<strong>Cookies</strong>',
            '<p>We gebruiken noodzakelijke cookies voor basisfuncties en optionele analytics om onze site te verbeteren. Je kan je voorkeuren kiezen.</p>',
          '</div>',
          '<div class="consent-actions">',
            '<button class="btn btn-small btn-ghost" data-consent="reject">Weiger</button>',
            '<button class="btn btn-small btn-alt" data-consent="custom">Instellingen</button>',
            '<button class="btn btn-small btn-primary" data-consent="accept">Accepteer alles</button>',
          '</div>',
        '</div>',
        '<div class="consent-modal" hidden>',
          '<div class="consent-card">',
            '<h3>Cookievoorkeuren</h3>',
            '<div class="consent-row">',
              '<div>',
                '<strong>Noodzakelijk</strong><br>',
                '<span class="muted">Altijd actief voor veiligheid en basisfunctionaliteit.</span>',
              '</div>',
              '<div><input type="checkbox" checked disabled></div>',
            '</div>',
            '<div class="consent-row">',
              '<div>',
                '<strong>Analytics</strong><br>',
                '<span class="muted">Helpt ons verbeteren. We meten anoniem waar mogelijk.</span>',
              '</div>',
              '<div><label class="switch"><input id="consent-analytics" type="checkbox"><span class="slider"></span></label></div>',
            '</div>',
            '<div class="consent-modal-actions">',
              '<button class="btn btn-small btn-ghost" data-consent="modal-cancel">Annuleer</button>',
              '<button class="btn btn-small btn-primary" data-consent="modal-save">Opslaan</button>',
            '</div>',
          '</div>',
        '</div>'
      ].join("");

      // minimale styles (leunen verder op je site)
      var css = doc.createElement("style");
      css.textContent =
        ".consent-wrap{position:fixed;inset:auto 0 0 0;z-index:9999;display:flex;justify-content:center;padding:12px}"+
        ".consent--dark{background:rgba(0,0,0,.4);backdrop-filter:saturate(120%) blur(8px)}"+
        ".consent--light{background:rgba(255,255,255,.9);backdrop-filter:saturate(120%) blur(8px)}"+
        ".consent-banner{max-width:1040px;width:100%;display:flex;gap:12px;align-items:center;background:var(--panel, #14151a);color:var(--text, #f1f5f9);border:1px solid #273244;border-radius:14px;padding:12px 14px}"+
        ".consent-text p{margin:.25rem 0 0;opacity:.9}"+
        ".consent-actions{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}"+
        ".btn-small{padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#2d3748;color:#fff}"+
        ".btn-ghost{background:transparent} .btn-alt{background:rgba(59,130,246,.12)} .btn-primary{background:#3b82f6}"+
        ".consent-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center}"+
        ".consent-card{background:var(--panel, #14151a);color:var(--text,#f1f5f9);border:1px solid #273244;border-radius:14px;max-width:560px;width:92%;padding:16px}"+
        ".consent-row{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #273244;padding:12px 0}"+
        ".consent-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}"+
        ".muted{opacity:.8}"+
        ".switch{position:relative;display:inline-block;width:44px;height:24px}"+
        ".switch input{opacity:0;width:0;height:0}"+
        ".slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#334155;transition:.2s;border-radius:20px}"+
        ".slider:before{position:absolute;content:'';height:18px;width:18px;left:3px;bottom:3px;background:white;transition:.2s;border-radius:50%}"+
        "input:checked + .slider{background:#3b82f6} input:checked + .slider:before{transform:translateX(20px)}";

      doc.head.appendChild(css);
      doc.body.appendChild(wrap);

      this.el = wrap;
      this.modal = wrap.querySelector(".consent-modal");

      // Events
      wrap.addEventListener("click", function (e) {
        var t = e.target;
        if (!t || !t.getAttribute) return;
        var action = t.getAttribute("data-consent");
        if (!action) return;

        if (action === "reject") {
          ui.hide();
          applyConsent({ analytics: false });
        } else if (action === "accept") {
          ui.hide();
          applyConsent({ analytics: true });
        } else if (action === "custom") {
          ui.openModal();
        } else if (action === "modal-save") {
          var analyticsChecked = !!doc.getElementById("consent-analytics").checked;
          ui.closeModal();
          ui.hide();
          applyConsent({ analytics: analyticsChecked });
        } else if (action === "modal-cancel") {
          ui.closeModal();
        }
      });

      // Klik buiten modal sluit ‘m
      this.modal.addEventListener("click", function(e){
        if (e.target === ui.modal) ui.closeModal();
      });
    },
    show: function () {
      this.build();
      this.el.style.display = "flex";
    },
    hide: function () {
      if (this.el) this.el.style.display = "none";
    },
    openModal: function () {
      this.build();
      var analytics = (getStoredConsent() || {}).analytics === true;
      var dnt = RESPECT_DNT && hasDNT();
      var el = doc.getElementById("consent-analytics");
      if (el) el.checked = dnt ? false : analytics;
      this.modal.hidden = false;
      this.modal.style.display = "grid";
    },
    closeModal: function () {
      if (this.modal) { this.modal.hidden = true; this.modal.style.display = "none"; }
    }
  };

  function applyConsent(consent) {
    storeConsent(consent);
    loadPlausibleIfAllowed(consent);
  }

  // ====== Public API ======
  w.cookieConsent = {
    open: function () { ui.openModal(); },
    reset: function () { localStorage.removeItem(STORAGE_KEY); ui.show(); }
  };

  // ====== Init ======
  function init() {
    // Hook voor #manage-consent (op legal.html bijvoorbeeld)
    doc.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.matches && t.matches("#manage-consent")) {
        e.preventDefault();
        w.cookieConsent.open();
      }
    });

    var existing = getStoredConsent();

    if (COOKIELESS_PLAUSIBLE) {
      // Laad direct; geen banner nodig
      loadPlausibleIfAllowed({ analytics: true });
      return;
    }

    // Respecteer DNT als ingesteld
    if (!existing && RESPECT_DNT && hasDNT()) {
      // Auto-weiger analytics, zonder banner (optioneel: toon toch banner; kies hide of show)
      storeConsent({ analytics: false });
      // Geen Plausible
      return;
    }

    if (existing) {
      // Keuze bekend
      loadPlausibleIfAllowed(existing);
      return;
    }

    // Geen keuze -> toon banner
    ui.show();
  }

  // DOM ready
  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
