// Reedly landing — interactive behaviours.
// Copy lives server-side in src/lib/i18n.ts; nothing here renders text except
// the pricing amount and its currency symbol, so there is no client dictionary
// to keep in sync.

// ── Analytics helpers (PostHog-ready, safe fallback) ──
const TRACKING_SESSION_KEY = "reedly-landing-session-id";

function getPageName() {
  var path = window.location.pathname;
  var clean = path.replace(/^\/(en|fr)\/?/, "").replace(/\/$/, "") || "home";
  if (clean === "home") return "landing_home";
  return "landing_" + clean.replace(/[^a-z0-9]/g, "_");
}

function getOrCreateSessionId() {
  try {
    const existing = sessionStorage.getItem(TRACKING_SESSION_KEY);
    if (existing) return existing;
    const created =
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem(TRACKING_SESSION_KEY, created);
    return created;
  } catch {
    return "session_unavailable";
  }
}

function getDeviceType() {
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

function getReferrerHost() {
  try {
    if (!document.referrer) return "";
    return new URL(document.referrer).host;
  } catch {
    return "";
  }
}

function getUtmProps() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_term: params.get("utm_term") || "",
    utm_content: params.get("utm_content") || "",
  };
}

function getOrCreateVisitorId() {
  try {
    var KEY = "reedly-visitor-id";
    var id = localStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "visitor_unavailable";
  }
}

function getVisitNumber() {
  try {
    var KEY = "reedly-visit-count";
    var SESSION_KEY = "reedly-visit-counted";
    var count = parseInt(localStorage.getItem(KEY) || "0", 10);
    if (!sessionStorage.getItem(SESSION_KEY)) {
      count++;
      localStorage.setItem(KEY, String(count));
      sessionStorage.setItem(SESSION_KEY, "1");
    }
    return count;
  } catch {
    return 1;
  }
}

function getEntryPage() {
  try {
    var KEY = "reedly-entry-page";
    var entry = sessionStorage.getItem(KEY);
    if (!entry) {
      entry = getPageName();
      sessionStorage.setItem(KEY, entry);
    }
    return entry;
  } catch {
    return getPageName();
  }
}

var _pagesViewedThisSession = (function () {
  try {
    var KEY = "reedly-pages-viewed";
    var count = parseInt(sessionStorage.getItem(KEY) || "0", 10) + 1;
    sessionStorage.setItem(KEY, String(count));
    return count;
  } catch {
    return 1;
  }
})();

function getDaysSinceFirstVisit() {
  try {
    var KEY = "reedly-first-visit";
    var now = Date.now();
    var first = localStorage.getItem(KEY);
    if (!first) {
      localStorage.setItem(KEY, String(now));
      return 0;
    }
    return Math.floor((now - parseInt(first, 10)) / 86400000);
  } catch {
    return 0;
  }
}

function trackEvent(eventName, props = {}) {
  const payload = {
    page_name: getPageName(),
    page_lang: document.documentElement.lang || "fr",
    device_type: getDeviceType(),
    referrer_host: getReferrerHost(),
    session_id: getOrCreateSessionId(),
    visitor_id: getOrCreateVisitorId(),
    visit_number: getVisitNumber(),
    pages_viewed_this_session: _pagesViewedThisSession,
    entry_page: getEntryPage(),
    days_since_first_visit: getDaysSinceFirstVisit(),
    ...getUtmProps(),
    ...props,
  };

  try {
    const posthog = window.posthog;
    if (posthog && typeof posthog.capture === "function") {
      posthog.capture(eventName, payload);
    }
  } catch (err) {
    console.error("[tracking] capture error:", err);
  }
}

window.reedlyTrackEvent = trackEvent;

trackEvent("landing_page_viewed");

// ── CTA click tracking ──
document.querySelectorAll("[data-track-id]").forEach((el) => {
  el.addEventListener("click", () => {
    trackEvent("landing_cta_clicked", {
      cta_id: el.dataset.trackId,
      cta_type: el.dataset.trackType || "",
      cta_section: el.dataset.trackSection || "",
      cta_label: (el.textContent || "").trim().slice(0, 80),
    });
  });
});

// ── Section visibility tracking ──
(function () {
  var seen = {};
  var sections = document.querySelectorAll("section[id]");
  if (!sections.length || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        if (!entry.isIntersecting || seen[id]) return;
        seen[id] = true;
        trackEvent("landing_section_viewed", { section_id: id });
      });
    },
    { threshold: 0.4 },
  );
  sections.forEach(function (s) {
    io.observe(s);
  });
})();

// ── Scroll reveal, with the icons popping in one after another ──
(function () {
  // Tells the inline gate in Layout.astro that this file ran, so it leaves the
  // `js` class on <html>. Set before the early return: a page with no .reveal
  // block still needs the gate to stand down.
  window.__reedlyReveal = 1;

  var els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showIcons(el, instant) {
    el.querySelectorAll("[data-icon-anim]").forEach(function (icon, i) {
      icon.style.transition = instant
        ? "none"
        : "opacity .5s ease " + i * 45 + "ms, transform .5s cubic-bezier(.34,1.56,.64,1) " + i * 45 + "ms";
      icon.style.opacity = "1";
      icon.style.transform = "scale(1) rotate(0deg)";
    });
  }

  if (!("IntersectionObserver" in window) || reduced) {
    els.forEach(function (el) {
      el.classList.add("is-visible");
      el.querySelectorAll("[data-icon-anim]").forEach(function (icon) {
        icon.style.opacity = "1";
        icon.style.transform = "none";
      });
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Already scrolled past the top of the block — a fast flick outran the
        // observer, so drop it in rather than fading a block being read.
        var instant = entry.boundingClientRect.top < 0;
        if (instant) entry.target.classList.add("reveal--instant");
        entry.target.classList.add("is-visible");
        showIcons(entry.target, instant);
        io.unobserve(entry.target);
      });
    },
    // The canvas fires at 22% of the block, 24% off the bottom. That was tuned
    // on wide blocks: stacked on mobile the same blocks are 1800px tall, so 22%
    // of them is most of a screen and the section sits blank until you have
    // scrolled well into it. Trigger on the leading edge instead, which is
    // height-independent: the block starts fading the moment it comes up.
    { threshold: 0, rootMargin: "0px 0px -10% 0px" },
  );
  els.forEach(function (el) {
    io.observe(el);
  });
})();

// ── KPI count-up, started when the tiles themselves are on screen ──
(function () {
  var nodes = document.querySelectorAll("[data-count]");
  if (!nodes.length) return;
  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  var started = false;
  function run() {
    if (started) return;
    started = true;
    nodes.forEach(function (el) {
      var target = Number(el.dataset.count) || 0;
      var t0 = performance.now();
      el.textContent = "0";
      var tick = function (t) {
        var k = Math.min(1, (t - t0) / 1500);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // Watch the tile grid rather than the (very tall) Hub section, so the numbers
  // start counting when they are actually in view.
  var grid = nodes[0].closest(".hub__tiles") || nodes[0].parentElement;
  var io = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting) {
        run();
        io.disconnect();
      }
    },
    { threshold: 0.55 },
  );
  io.observe(grid);
})();

// ── Max composer: types the question, then replays it ──
(function () {
  var node = document.querySelector("[data-composer]");
  if (!node) return;
  var full = node.textContent.trim();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function type() {
    var i = 0;
    var step = function () {
      node.textContent = full.slice(0, i);
      if (i++ < full.length) setTimeout(step, 34);
      else setTimeout(type, 14000);
    };
    step();
  }
  type();
})();

// ── Nav: compact pill on scroll, light ink over dark sections ──
(function () {
  var nav = document.getElementById("nav");
  if (!nav) return;
  var raf = null;

  function apply() {
    raf = null;
    var y = window.scrollY || 0;
    nav.classList.toggle("is-compact", y > 90);
    document.documentElement.classList.toggle("is-scrolled", y > 90);

    // Read what sits behind the bar so the nav ink stays legible over it.
    var band = nav.getBoundingClientRect().bottom;
    var onDark = false;
    document.querySelectorAll("[data-nav-dark]").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < band - 6 && r.bottom > 0) onDark = true;
    });
    nav.classList.toggle("is-onDark", onDark);
  }

  window.addEventListener(
    "scroll",
    function () {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    },
    { passive: true },
  );
  apply();
})();

// ── Language dropdown ──
// The panel is a sibling of <nav>, so it is placed against the trigger with
// measured fixed coordinates, and it follows the trigger while the nav pill
// animates between its full-width and compact states.
(function () {
  var nav = document.getElementById("nav");
  var trigger = document.getElementById("nav-lang-trigger");
  var panel = document.getElementById("nav-lang-panel");
  if (!nav || !trigger || !panel) return;

  function place() {
    var r = trigger.getBoundingClientRect();
    panel.style.left = r.left + "px";
    panel.style.top = r.bottom + 16 + "px";
    panel.classList.toggle("is-compact", nav.classList.contains("is-compact"));
    panel.classList.toggle("is-onDark", nav.classList.contains("is-onDark"));
  }

  // The pill's own width/padding transition keeps moving the trigger after the
  // class flips, so follow it frame by frame instead of snapping once.
  function follow(ms) {
    var start = performance.now();
    var step = function () {
      if (!panel.classList.contains("is-open")) return;
      place();
      if (performance.now() - start < ms) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function close() {
    panel.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    if (panel.classList.contains("is-open")) return close();
    place();
    panel.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  });

  panel.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  document.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
  window.addEventListener(
    "scroll",
    function () {
      if (panel.classList.contains("is-open")) follow(500);
    },
    { passive: true },
  );
  window.addEventListener("resize", function () {
    if (panel.classList.contains("is-open")) place();
  });
})();

// ── FAQ accordion ──
document.querySelectorAll(".faq__item").forEach(function (item) {
  var btn = item.querySelector(".faq__q");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var wasOpen = item.classList.contains("is-open");
    item.parentElement.querySelectorAll(".faq__item").forEach(function (other) {
      other.classList.remove("is-open");
      var b = other.querySelector(".faq__q");
      if (b) b.setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      trackEvent("landing_faq_opened", {
        question: (item.querySelector(".faq__q-text").textContent || "").trim(),
      });
    }
  });
});

// ── Pricing toggles: billing period and currency ──
// Two independent segmented controls feeding one render, so switching either
// keeps the other's choice. The server paints the initial state.
(function () {
  var billing = document.getElementById("billing-toggle");
  var currency = document.getElementById("currency-toggle");
  if (!billing && !currency) return;

  function activeValue(toggle, attr, fallback) {
    var btn = toggle && toggle.querySelector("button.is-active");
    return btn ? btn.dataset[attr] : fallback;
  }

  function render() {
    var annual = activeValue(billing, "billing", "monthly") === "annual";
    var code = activeValue(currency, "currency", "eur");

    document.querySelectorAll(".js-price").forEach(function (el) {
      var base = parseFloat(el.dataset[code === "usd" ? "priceUsd" : "priceEur"] || "0");
      if (!base) return;
      el.textContent = String(Math.round(annual ? base * 0.86 : base));
    });

    // Symbol and its side differ per currency ($49 vs 49 €), so each is its own
    // element and only the matching one is shown.
    document.querySelectorAll(".js-currency").forEach(function (el) {
      el.hidden = el.dataset.currency !== code;
    });
  }

  function wire(toggle, attr, event, key) {
    if (!toggle) return;
    toggle.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-" + attr + "]");
      if (!btn || btn.classList.contains("is-active")) return;

      toggle.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      render();

      var payload = {};
      payload[key] = btn.dataset[attr];
      trackEvent(event, payload);
    });
  }

  wire(billing, "billing", "landing_pricing_billing_changed", "billing");
  wire(currency, "currency", "landing_pricing_currency_changed", "currency");
})();

// ── Testimonial carousel ──
(function () {
  var root = document.getElementById("testimonials");
  var track = document.getElementById("tm-track");
  if (!root || !track) return;

  var count = parseInt(root.dataset.slides || "0", 10);
  if (count < 2) return;

  var dots = Array.prototype.slice.call(
    document.querySelectorAll("#tm-dots button"),
  );
  var pos = 1; // the track renders [last, ...real, first]; 1 is real slide 0
  var busy = false;

  function paint() {
    track.style.transform = "translateX(-" + pos * 100 + "%)";
    var active = ((pos - 1) % count + count) % count;
    dots.forEach(function (d, i) {
      d.classList.toggle("is-active", i === active);
    });
  }

  function go(next) {
    if (busy) return;
    busy = true;
    pos = next;
    track.classList.remove("is-jumping");
    paint();
  }

  // Landing on a clone snaps (without transition) to the matching real slide,
  // so the motion always continues in the same direction and never bounces.
  track.addEventListener("transitionend", function () {
    if (pos === count + 1) pos = 1;
    else if (pos === 0) pos = count;
    else {
      busy = false;
      return;
    }
    track.classList.add("is-jumping");
    paint();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        track.classList.remove("is-jumping");
        busy = false;
      });
    });
  });

  var prev = document.getElementById("tm-prev");
  var next = document.getElementById("tm-next");
  if (prev) prev.addEventListener("click", function () { go(pos - 1); });
  if (next) next.addEventListener("click", function () { go(pos + 1); });
  dots.forEach(function (d, i) {
    d.addEventListener("click", function () { go(i + 1); });
  });

  // Swipe
  var startX = null;
  track.addEventListener("pointerdown", function (e) { startX = e.clientX; });
  track.addEventListener("pointerup", function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    startX = null;
    if (dx > 40) go(pos - 1);
    else if (dx < -40) go(pos + 1);
  });

  paint();
})();
