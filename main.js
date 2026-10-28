(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- sticky nav + scroll progress ---------- */
  const nav = document.getElementById("nav");
  const progress = document.querySelector(".scroll-progress span");
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (nav) nav.classList.toggle("is-stuck", y > 8);

      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(y / max, 1) : 0;
        progress.style.width = (pct * 100).toFixed(2) + "%";
      }
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- theme toggle ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const applyTheme = (theme, persist) => {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#0a0f1e" : "#f7f2e9");
    }
    if (persist) {
      try { localStorage.setItem("wn-theme", theme); } catch {}
    }
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      applyTheme(next, true);
    });
  }
  applyTheme(document.documentElement.getAttribute("data-theme") || "dark", false);

  /* ---------- mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const closeMenu = () => {
    if (!toggle || !links) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    links.classList.remove("is-open");
  };

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      links.classList.toggle("is-open", !open);
    });

    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (e) => {
      if (!links.classList.contains("is-open")) return;
      if (!links.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
  }

  /* ---------- active nav link ---------- */
  const sections = [...document.querySelectorAll("main section[id]")].filter(
    (s) => s.id !== "top"
  );
  const navLinks = [...document.querySelectorAll('.nav__links a[href^="#"]')];

  const setActiveLink = () => {
    const marker = window.innerHeight * 0.4;
    let current = "";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) current = section.id;
    });
    navLinks.forEach((a) =>
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + current)
    );
  };
  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- reveal on scroll ---------- */
  const revealEls = [...document.querySelectorAll(".reveal")];

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    // stagger siblings inside repeated groups
    document
      .querySelectorAll(".work-grid, .stack-grid, .timeline")
      .forEach((group) => {
        [...group.children].forEach((child, i) => {
          if (child.classList.contains("reveal")) {
            child.style.transitionDelay = Math.min(i * 70, 350) + "ms";
          }
        });
      });

    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- copy email ---------- */
  const copyBtn = document.getElementById("copyEmail");
  const toast = document.getElementById("toast");
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  };

  const legacyCopy = (text) => {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    field.remove();
    return ok;
  };

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email || "";
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
          showToast("Email copied — " + email);
        } else if (legacyCopy(email)) {
          showToast("Email copied — " + email);
        } else {
          showToast("Copy failed — " + email);
        }
      } catch {
        showToast(legacyCopy(email) ? "Email copied — " + email : "Copy failed — " + email);
      }
    });
  }

  /* ---------- case study modal ---------- */
  const CASES = {
    sokoni: {
      chip: "Case study · Marketplace",
      title: "Sokoni",
      meta: "Marketplace · 2025 · Design + build (solo)",
      body: [
        "Smallholder farmers were losing produce to middlemen because they had no direct line to buyers. Sokoni puts a mobile-first marketplace in their pocket — browse offers, agree a price, pay by M-Pesa.",
        "Most of the network in rural areas is unreliable, so the whole catalogue is offline-first: listings and receipts sync whenever a connection appears, and nothing is ever lost mid-transaction.",
      ],
      points: [
        "Offline-first catalogue and receipt sync",
        "M-Pesa checkout in under three taps",
        "12k+ farmers onboarded in the first season",
      ],
      tags: ["Next.js", "PostgreSQL", "M-Pesa API", "PWA"],
      subject: "Sokoni",
      repo: "",
    },
    tempo: {
      chip: "Case study · SaaS",
      title: "Tempo",
      meta: "SaaS · 2024 · Frontend lead",
      body: [
        "A 200-person distributed agency was drowning in double-bookings — every team kept its own calendar and nobody could see the whole picture. Tempo reads every calendar at once and shows the true availability of anyone in the company.",
        "I led the frontend: the scheduling grid renders thousands of events smoothly, and the conflict-detection engine runs entirely in the client so availability checks feel instant.",
      ],
      points: [
        "Read-only OAuth across four calendar providers",
        "Conflict-detection engine built into the client",
        "78% fewer double-bookings within three months",
      ],
      tags: ["React", "Node.js", "Google Calendar API", "WebSockets"],
      subject: "Tempo",
      repo: "",
    },
    kesho: {
      chip: "Case study · Fintech",
      title: "Kesho",
      meta: "Fintech · 2024 · Senior frontend engineer",
      body: [
        "Kesho is a goal-based savings product: pick a goal — school fees, a stall, a plot of land — and round-ups from everyday transactions quietly grow the fund, with plain-language nudges instead of guilt.",
        "My focus was making money feel understandable: every screen explains where the figure came from, and the onboarding went from a 14-field form to a three-step conversation.",
      ],
      points: [
        "Round-up savings with plain-language nudges",
        "3.4× activated users in two quarters",
        "Design system reused across three products",
      ],
      tags: ["TypeScript", "Go", "Redis", "Design systems"],
      subject: "Kesho",
      repo: "",
    },
  };

  const caseModal = document.getElementById("caseModal");

  const openCase = (slug) => {
    const data = CASES[slug];
    if (!data || !caseModal || typeof caseModal.showModal !== "function") return;
    document.getElementById("caseChip").textContent = data.chip;
    document.getElementById("caseTitle").textContent = data.title;
    document.getElementById("caseMeta").textContent = data.meta;
    document.getElementById("caseBody").innerHTML = data.body
      .map((p) => "<p>" + p + "</p>")
      .join("");
    document.getElementById("casePoints").innerHTML = data.points
      .map((p) => "<li>" + p + "</li>")
      .join("");
    document.getElementById("caseTags").innerHTML = data.tags
      .map((t) => "<li>" + t + "</li>")
      .join("");
    const ask = document.getElementById("caseAsk");
    ask.href =
      "mailto:njeruwilly87@gmail.com?subject=" +
      encodeURIComponent("Case study: " + data.subject);
    const repo = document.getElementById("caseRepo");
    repo.hidden = !data.repo;
    if (data.repo) repo.href = data.repo;
    caseModal.showModal();
  };

  document.querySelectorAll("[data-case]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openCase(link.dataset.case);
    });
  });

  if (caseModal) {
    document
      .getElementById("caseClose")
      .addEventListener("click", () => caseModal.close());
    caseModal.addEventListener("click", (e) => {
      if (e.target === caseModal) caseModal.close();
    });
  }

  /* ---------- WhatsApp contact form ---------- */
  const waForm = document.getElementById("waForm");

  if (waForm) {
    waForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("wfName").value.trim();
      const topic = document.getElementById("wfTopic").value;
      const msg = document.getElementById("wfMsg").value.trim();
      const text = "Hi Wilson! I'm " + name + ". I'm interested in " + topic + ". " + msg;
      window.open(
        "https://wa.me/254748377420?text=" + encodeURIComponent(text),
        "_blank",
        "noopener"
      );
      showToast("Opening WhatsApp — press send there");
    });
  }

  /* ---------- placeholder links ---------- */
  document.querySelectorAll('a[href="#"]:not([data-case])').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Coming soon");
    });
  });
})();
