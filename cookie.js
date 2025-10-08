/**
 * /js/analytics.js  (v2)
 * - Consent Mode default = denied
 * - Laadt GA4 of GTM pas NA toestemming
 * - Werkt samen met /cookie.js (event 'cookie-consent-changed')
 */

(function () {
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // 1) CONFIG — vul EEN van de twee in
  const GA_ID  = 'G-D3JNSNPKPG';   // bv. G-12345ABCD6 (laat leeg als je GTM gebruikt)
  const GTM_ID = '';               // bv. GTM-ABCDEF (laat leeg als je GA4 direct gebruikt)
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  const CONSENT_EVENT = 'cookie-consent-changed';
  const CONSENT_STORAGE_KEY = 'cookie_consent';
  let libLoaded = false;

  // ----------------- helpers -----------------
  function readConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return null;
      if (raw === 'accepted' || raw === 'all') return { analytics: true };
      const obj = JSON.parse(raw);
      return { analytics: !!obj.analytics };
    } catch (_) { return null; }
  }

  function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }
  function clearGaCookies() {
    document.cookie.split(';').forEach((c) => {
      const n = c.trim().split('=')[0];
      if (n && (n === '_ga' || n.startsWith('_ga_'))) deleteCookie(n);
    });
  }

  // ----------------- consent mode priming -----------------
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // Default = denied
  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  // ----------------- loaders -----------------
  function loadGA4() {
    if (libLoaded || !GA_ID) return;
    libLoaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    s.onerror = () => console.warn('[analytics] Kon gtag.js niet laden (CSP/adblock?)');
    document.head.appendChild(s);

    gtag('js', new Date());
    gtag('config', GA_ID, {
      page_title: document.title,
      page_path: location.pathname + location.search + location.hash,
    });
  }

  function loadGTM() {
    if (libLoaded || !GTM_ID) return;
    libLoaded = true;

    // GTM bootstrap
    const dlName = 'dataLayer';
    window[dlName] = window[dlName] || [];
    window[dlName].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
    s.onerror = () => console.warn('[analytics] Kon GTM niet laden (CSP/adblock?)');
    document.head.appendChild(s);
  }

  function grantAndLoad() {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    if (GA_ID) loadGA4();
    else if (GTM_ID) loadGTM();
    else console.warn('[analytics] Geen GA4- of GTM-ID ingesteld.');
  }

  // ----------------- runtime init -----------------
  function init() {
    // Als er al consent is bewaard bij eerdere sessie, respecteer die direct
    const existing = readConsent();
    if (existing && existing.analytics === true) {
      grantAndLoad();
    } else {
      clearGaCookies();
    }
  }

  // Reageer op je cookiebanner
  window.addEventListener(CONSENT_EVENT, (e) => {
    const ok = !!(e && e.detail && e.detail.analytics);
    if (ok) grantAndLoad();
    else {
      gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      clearGaCookies();
      libLoaded = false;
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
