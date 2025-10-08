/**
 * /cookie.js
 * Simpele GDPR-consent (functioneel + analytics).
 * - Toont banner tot er keuze is gemaakt.
 * - Bewaart keuze in localStorage onder "cookie_consent".
 * - Dispatcht 'cookie-consent-changed' zodat /js/analytics.js reageert.
 */

(function () {
  const STORAGE_KEY = 'cookie_consent';
  const EVENT_NAME = 'cookie-consent-changed';

  // UI maken
  function createBanner() {
    const bar = document.createElement('div');
    bar.id = 'cookie-banner';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', 'Cookie melding');
    bar.style.position = 'fixed';
    bar.style.insetInline = '0';
    bar.style.bottom = '0';
    bar.style.zIndex = '99999';
    bar.style.padding = '16px';
    bar.style.background = 'rgba(0,0,0,0.9)';
    bar.style.color = '#fff';
    bar.style.display = 'flex';
    bar.style.flexWrap = 'wrap';
    bar.style.gap = '12px';
    bar.style.alignItems = 'center';
    bar.style.justifyContent = 'space-between';

    const text = document.createElement('div');
    text.style.flex = '1 1 320px';
    text.innerHTML = `
      We gebruiken <strong>functionele</strong> cookies en – enkel na jouw toestemming – <strong>analytische</strong> cookies (Google Analytics) om onze site te verbeteren.
      <a href="/legal.html#cookies" style="color:#9fe3c0; text-decoration:underline">Meer info</a>.
    `;

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '8px';
    btns.style.flexWrap = 'wrap';

    const reject = document.createElement('button');
    reject.type = 'button';
    reject.textContent = 'Weiger alles';
    Object.assign(reject.style, baseBtnStyle(), { background: '#444' });

    const settings = document.createElement('button');
    settings.type = 'button';
    settings.textContent = 'Instellingen';
    Object.assign(settings.style, baseBtnStyle(), { background: '#2b2b2b' });

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.textContent = 'Accepteer analytics';
    Object.assign(accept.style, baseBtnStyle(), { background: '#11a367' });

    btns.append(reject, settings, accept);
    bar.append(text, btns);

    // Instellingen-popover (alleen functioneel/analytics)
    const modal = createSettingsModal({
      onSave: (opts) => {
        setConsent({ analytics: !!opts.analytics });
        removeBanner();
      },
    });
    document.body.appendChild(modal);

    reject.addEventListener('click', () => {
      setConsent({ analytics: false });
      removeBanner();
    });

    accept.addEventListener('click', () => {
      setConsent({ analytics: true });
      removeBanner();
    });

    settings.addEventListener('click', () => openSettings(modal));

    document.body.appendChild(bar);
    // Focus voor toegankelijkheid
    setTimeout(() => reject.focus(), 50);
  }

  function baseBtnStyle() {
    return {
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 14px',
      cursor: 'pointer',
      fontSize: '14px'
    };
  }

  function createSettingsModal({ onSave }) {
    const wrap = document.createElement('div');
    wrap.id = 'cookie-settings';
    wrap.style.position = 'fixed';
    wrap.style.inset = '0';
    wrap.style.background = 'rgba(0,0,0,0.6)';
    wrap.style.zIndex = '100000';
    wrap.style.display = 'none';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Cookie instellingen');

    const panel = document.createElement('div');
    panel.style.background = '#fff';
    panel.style.color = '#111';
    panel.style.maxWidth = '520px';
    panel.style.margin = '8vh auto';
    panel.style.padding = '20px';
    panel.style.borderRadius = '12px';
    panel.style.boxShadow = '0 8px 40px rgba(0,0,0,.25)';

    panel.innerHTML = `
      <h2 style="margin:0 0 12px 0; font-size:20px;">Cookie-instellingen</h2>
      <p style="margin:0 0 12px 0;">Kies welke cookies je toelaat. Functionele cookies zijn noodzakelijk en altijd actief.</p>
      <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-top:1px solid #eee;">
        <div>
          <strong>Functioneel</strong><br>
          Nodig voor basiswerking (altijd actief).
        </div>
        <input type="checkbox" checked disabled aria-label="Functionele cookies verplicht">
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-top:1px solid #eee; border-bottom:1px solid #eee;">
        <div>
          <strong>Analytisch</strong><br>
          Google Analytics om de site te verbeteren.
        </div>
        <input id="toggle-analytics" type="checkbox" aria-label="Analytische cookies toestaan">
      </div>
      <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:14px;">
        <button type="button" id="cs-cancel" style="padding:10px 12px; border-radius:8px; border:1px solid #ddd; background:#f6f6f6; cursor:pointer;">Annuleren</button>
        <button type="button" id="cs-save" style="padding:10px 12px; border-radius:8px; border:none; background:#111; color:#fff; cursor:pointer;">Opslaan</button>
      </div>
    `;

    const btnCancel = panel.querySelector('#cs-cancel');
    const btnSave = panel.querySelector('#cs-save');
    const toggleAnalytics = panel.querySelector('#toggle-analytics');

    btnCancel.addEventListener('click', () => closeSettings(wrap));
    btnSave.addEventListener('click', () => {
      onSave({ analytics: toggleAnalytics.checked });
      closeSettings(wrap);
    });

    // laad huidige keuze (indien bekend)
    const current = readConsent();
    if (current) toggleAnalytics.checked = !!current.analytics;

    wrap.appendChild(panel);
    return wrap;
  }

  function openSettings(modal) {
    // sync huidige keuze naar toggle
    const current = readConsent();
    const toggle = modal.querySelector('#toggle-analytics');
    if (toggle && current) toggle.checked = !!current.analytics;

    modal.style.display = 'block';
    modal.querySelector('#cs-save').focus();
  }

  function closeSettings(modal) {
    modal.style.display = 'none';
  }

  function removeBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.remove();
  }

  function readConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      if (raw === 'accepted' || raw === 'all') return { analytics: true };
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed) return { analytics: !!parsed.analytics };
    } catch (_) {}
    return null;
  }

  function writeConsent(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (_) {}
  }

  function dispatchChange(analytics) {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { analytics: !!analytics } }));
  }

  function setConsent({ analytics }) {
    writeConsent({ analytics: !!analytics, functional: true });
    // Exporteer ook globale state zodat analytics.js het meteen ziet
    window.cookieConsent = { analytics: !!analytics, functional: true };
    dispatchChange(analytics);
  }

  function init() {
    // link op legal page om consent te beheren
    const m = document.getElementById('manage-consent');
    if (m) {
      m.addEventListener('click', function (e) {
        e.preventDefault();
        const modal = document.getElementById('cookie-settings');
        if (modal) openSettings(modal);
      });
    }

    const existing = readConsent();
    if (existing) {
      // Stel globale state en dispatch zodat analytics.js direct kan handelen bij reload
      window.cookieConsent = { analytics: !!existing.analytics, functional: true };
      dispatchChange(!!existing.analytics);
      return; // geen banner tonen
    }

    // Nog geen keuze → toon banner
    createBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
