(function () {
  const GA_ID = 'G-D3JNSNPKPG'; // 
  const CONSENT_EVENT = 'cookie-consent-changed';
  const CONSENT_STORAGE_KEY = 'cookie_consent';

  let gaLoaded = false;

  // ---- Helpers -------------------------------------------------------------

  function readConsentFromStorage() {
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return null;

      // Sta meerdere formaten toe:
      // 1) "all" of "accepted"
      if (raw === 'all' || raw === 'accepted') return { analytics: true };

      // 2) JSON zoals {"analytics":true,"functional":true,...}
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          analytics: !!parsed.analytics || !!parsed.statistics || parsed === 'all',
        };
      }
      // 3) "analytics=true" of iets gelijkaardigs
      if (typeof raw === 'string' && raw.includes('analytics=true')) {
        return { analytics: true };
      }
    } catch (e) {
      // ignore parse errors
    }
    return null;
  }

  function hasAnalyticsConsent() {
    // 1) runtime object dat je banner kan zetten: window.cookieConsent = { analytics: true/false }
    if (window.cookieConsent && typeof window.cookieConsent.analytics === 'boolean') {
      return window.cookieConsent.analytics === true;
    }
    // 2) fallback: localStorage
    const stored = readConsentFromStorage();
    if (stored && stored.analytics === true) return true;

    return false;
  }

  function deleteCookie(name) {
    try {
      // verwijder cookie op huidig pad en rootpad
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/`;
    } catch (e) {
      // ignore
    }
  }

  function clearGaCookies() {
    // Probeer de meest voorkomende GA4 cookies te verwijderen (alleen op je eigen domein mogelijk)
    // Let op: Google kan de naamgeving wijzigen; we doen best effort cleanup.
    [
      '_ga',
      '_ga_XXXXXXXXXX', // property-specifiek, we vegen globaal alles met _ga_* hieronder
    ].forEach(deleteCookie);

    // _ga_* wildcard verwijderen (best effort): we kunnen de exacte naam niet kennen zonder ze uit document.cookie te parsen.
    document.cookie.split(';').forEach((c) => {
      const name = c.trim().split('=')[0];
      if (name && (name === '_ga' || name.startsWith('_ga_'))) {
        deleteCookie(name);
      }
    });
  }

  // ---- GA / Consent Mode ---------------------------------------------------

  // Consent Mode standaard op denied (nog vóór een eventuele load)
  function primeConsentMode() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    // Standaard: alles denied tot expliciete toestemming
    gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      // region-kaders kun je hier toevoegen indien nodig
    });
  }

  function grantAnalyticsConsent() {
    if (!window.gtag) return;
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }

  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;

    // laad gtag.js
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);

    // init config
    window.gtag('js', new Date());
    // In GA4 worden IP-adressen niet opgeslagen; extra anon-config is niet meer vereist.
    window.gtag('config', GA_ID, {
      // zet hier optioneel extra parameters (bv. 'transport_url' of 'debug_mode': true)
      page_title: document.title,
      page_path: location.pathname + location.search + location.hash,
    });
  }

  function initIfConsented() {
    primeConsentMode();

    if (hasAnalyticsConsent()) {
      grantAnalyticsConsent();
      loadGA();
    } else {
      // Weigering: probeer bestaande GA-cookies te verwijderen, zodat we “schoon” blijven
      clearGaCookies();
    }
  }

  // ---- Event hooks ---------------------------------------------------------

  // Luister naar je cookiebanner-event en schakel dynamisch
  window.addEventListener(CONSENT_EVENT, (e) => {
    const detail = (e && e.detail) || {};
    const approved = !!detail.analytics;

    if (approved) {
      // update consent -> granted en laad GA
      grantAnalyticsConsent();
      loadGA();
    } else {
      // gebruiker trok toestemming in of weigerde
      // zet terug op denied en ruim cookies op
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
      clearGaCookies();
      gaLoaded = false;
    }
  });

  // ---- Bootstrapping -------------------------------------------------------

  // Start wanneer DOM klaar is, zodat localStorage en eventuele window.cookieConsent gezet kunnen zijn
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIfConsented);
  } else {
    initIfConsented();
  }

  // Optioneel: Exporteer een simpele API die je banner direct kan gebruiken
  window.AnalyticsConsent = {
    enable() {
      // jouw banner kan dit aanroepen bij "Accepteer"
      // zet evt. ook localStorage zodat de keuze bewaard blijft
      try {
        const stored = readConsentFromStorage() || {};
        stored.analytics = true;
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
      } catch (e) {}
      const evt = new CustomEvent(CONSENT_EVENT, { detail: { analytics: true }});
      window.dispatchEvent(evt);
    },
    disable() {
      try {
        const stored = readConsentFromStorage() || {};
        stored.analytics = false;
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
      } catch (e) {}
      const evt = new CustomEvent(CONSENT_EVENT, { detail: { analytics: false }});
      window.dispatchEvent(evt);
    }
  };
})();
