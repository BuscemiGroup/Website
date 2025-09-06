// /js/analytics.js
(function () {
  function send(name, props) {
    if (window.plausible && typeof window.plausible === "function") {
      window.plausible(name, { props: props || {} });
    }
  }

  // Track CTA-clicks (knoppen/links met data-analytics attribuut)
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t) return;
    var el = t.closest("[data-analytics]");
    if (!el) return;
    var eventName = el.getAttribute("data-analytics") || "CTA Click";
    var label = el.getAttribute("data-analytics-label") || el.textContent.trim();
    send(eventName, { label: label, href: el.getAttribute("href") || "" });
  });

  // Track Netlify form submits
  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (f && f.matches('form[name="contact"]')) {
      send("Contact Form Submit", { location: window.location.pathname });
    }
  });
})();
