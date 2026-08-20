(function (window, $) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  Portfolio.Navigation = {
    init() {
      this.initGlobal();
      this.initPage(document);
    },

    initGlobal() {
      if (this.globalReady) return;
      this.globalReady = true;
      this.initMotionPreference();
      this.initTheme();
      this.initHeader();
      this.initScrollActions();
      this.initAnchorLinks();
      this.initNavIndicator();
      this.initCursor();
      this.setActiveLink(document.body.dataset.page || "home");
    },

    initPage(root) {
      this.initMagnetic(root || document);
      this.initMicroInteractions(root || document);
    },

    initMotionPreference() {
      const root = document.documentElement;
      // Keep portfolio motion consistent across desktop, tablet, and mobile.
      // A saved explicit choice can still opt out without tying motion to width.
      root.dataset.motion = localStorage.getItem("portfolio-motion") === "reduced" ? "reduced" : "full";
    },

    setActiveLink() {
      const page = arguments[0] || document.body.dataset.page || "home";
      document.querySelectorAll("[data-nav].active").forEach(function (link) {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      });
      document.querySelectorAll('[data-nav="' + page + '"]').forEach(function (link) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      });
      this.positionNavIndicator(true);
    },

    initTheme() {
      const root = document.documentElement;
      const stored = localStorage.getItem("portfolio-theme");
      const initial = stored || "dark";
      root.dataset.theme = initial;

      document.querySelectorAll(".theme-toggle").forEach(function (button) {
        button.setAttribute("aria-pressed", String(initial === "light"));
        Portfolio.Lifecycle.global.listen(button, "click", function () {
          const next = root.dataset.theme === "light" ? "dark" : "light";
          root.dataset.theme = next;
          localStorage.setItem("portfolio-theme", next);
          button.setAttribute("aria-pressed", String(next === "light"));
          if (window.gsap && !Portfolio.utils.prefersReducedMotion()) {
            window.gsap.fromTo(button, { rotate: -24, scale: .82 }, { rotate: 0, scale: 1, duration: .55, ease: "back.out(2)" });
          }
        });
      });
    },

    initHeader() {
      const header = document.querySelector("[data-site-header]");
      if (!header) return;
      let previous = window.scrollY;
      const update = function () {
        const current = window.scrollY;
        header.classList.toggle("is-scrolled", current > 18);
        if (header.classList.contains("is-menu-open")) {
          header.classList.remove("is-hidden");
          previous = Math.max(0, current);
          return;
        }
        header.classList.toggle("is-hidden", current > previous && current > 180);
        previous = Math.max(0, current);
      };
      Portfolio.Lifecycle.global.listen(window, "scroll", update, { passive: true });
      const mobileMenu = document.querySelector("#mobileMenu");
      const menuToggle = document.querySelector(".menu-toggle");
      if (mobileMenu) {
        Portfolio.Lifecycle.global.listen(mobileMenu, "show.bs.offcanvas", function () {
          header.classList.remove("is-hidden");
          header.classList.add("is-menu-open");
          if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute("aria-label", "Close navigation");
          }
          if (window.gsap && !Portfolio.utils.prefersReducedMotion()) {
            const items = mobileMenu.querySelectorAll(".eyebrow, .mobile-nav a, .mobile-menu-contact");
            window.gsap.killTweensOf(items);
            window.gsap.fromTo(items,
              { x: 18, autoAlpha: 0 },
              { x: 0, autoAlpha: 1, duration: .3, stagger: .032, delay: .1, ease: "power2.out", overwrite: true }
            );
          }
        });
        Portfolio.Lifecycle.global.listen(mobileMenu, "hide.bs.offcanvas", function () {
          if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation");
          }
        });
        Portfolio.Lifecycle.global.listen(mobileMenu, "hidden.bs.offcanvas", function () {
          header.classList.remove("is-menu-open");
          previous = window.scrollY;
          update();
        });
        mobileMenu.querySelectorAll(".mobile-nav a").forEach(function (link) {
          Portfolio.Lifecycle.global.listen(link, "click", function () {
            const instance = window.bootstrap && window.bootstrap.Offcanvas.getInstance(mobileMenu);
            if (instance) instance.hide();
          });
        });
      }
      update();
    },

    initScrollActions() {
      const buttons = document.querySelectorAll("[data-back-to-top], [data-back-top-inline]");
      const floating = document.querySelector("[data-back-to-top]");

      buttons.forEach(function (button) {
        Portfolio.Lifecycle.global.listen(button, "click", function () {
          const start = window.scrollY;
          const duration = Math.min(3.2, Math.max(1.4, start / 2100));
          if (floating) floating.classList.add("is-returning");
          if (window.gsap) {
            const state = { value: start };
            const lenis = window.portfolioLenis;
            if (lenis) lenis.stop();
            window.gsap.to(state, {
              value: 0,
              duration: duration,
              ease: "power3.inOut",
              onUpdate: function () {
                if (lenis) lenis.scrollTo(state.value, { immediate: true, force: true });
                else window.scrollTo(0, state.value);
              },
              onComplete: function () {
                if (lenis) lenis.start();
                if (floating) floating.classList.remove("is-returning");
              }
            });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
            window.setTimeout(function () { if (floating) floating.classList.remove("is-returning"); }, duration * 1000);
          }
        });
      });

      const update = function () {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = total > 0 ? window.scrollY / total : 0;
        if (floating) floating.classList.toggle("visible", window.scrollY > 500);
        if (floating) {
          floating.style.setProperty("--water-y", (100 - ratio * 100).toFixed(2) + "%");
          floating.setAttribute("aria-label", "Back to top — " + Math.round(ratio * 100) + "% page progress");
        }
      };
      Portfolio.Lifecycle.global.listen(window, "scroll", update, { passive: true });
      update();
    },

    initAnchorLinks() {
      Portfolio.Lifecycle.global.jquery(document, "click.portfolioAnchors", 'a[href^="#"]', function (event) {
        const id = this.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        if (window.portfolioLenis) window.portfolioLenis.scrollTo(target, { offset: -90, duration: 1.1 });
        else target.scrollIntoView({ behavior: "smooth" });
      });
    },

    initNavIndicator() {
      const nav = document.querySelector(".desktop-nav");
      if (!nav || Portfolio.utils.prefersReducedMotion()) return;
      const links = Array.from(nav.querySelectorAll("a"));
      const pill = document.createElement("span");
      pill.className = "nav-motion-pill";
      nav.prepend(pill);
      nav.classList.add("has-motion-pill");

      const moveTo = function (link, immediate) {
        if (!link) return;
        const values = { x: link.offsetLeft, y: link.offsetTop, width: link.offsetWidth, height: link.offsetHeight };
        if (window.gsap) window.gsap.to(pill, Object.assign(values, { duration: immediate ? 0 : .42, ease: "power3.out", overwrite: true }));
        else Object.assign(pill.style, { left: values.x + "px", top: values.y + "px", width: values.width + "px", height: values.height + "px" });
      };

      moveTo(nav.querySelector("a.active") || links[0], true);
      links.forEach(function (link) { Portfolio.Lifecycle.global.listen(link, "mouseenter", function () { moveTo(link); }); });
      Portfolio.Lifecycle.global.listen(nav, "mouseleave", function () { moveTo(nav.querySelector("a.active") || links[0]); });
      Portfolio.Lifecycle.global.listen(window, "resize", function () { moveTo(nav.querySelector("a.active") || links[0], true); }, { passive: true });
    },

    positionNavIndicator(immediate) {
      const nav = document.querySelector(".desktop-nav");
      const pill = nav && nav.querySelector(".nav-motion-pill");
      const active = nav && (nav.querySelector("a.active") || nav.querySelector("a"));
      if (!pill || !active) return;
      const values = { x: active.offsetLeft, y: active.offsetTop, width: active.offsetWidth, height: active.offsetHeight };
      if (window.gsap) window.gsap.to(pill, Object.assign(values, { duration: immediate ? 0 : .42, ease: "power3.out", overwrite: true }));
      else Object.assign(pill.style, { left: values.x + "px", top: values.y + "px", width: values.width + "px", height: values.height + "px" });
    },

    initCursor() {
      if (window.matchMedia("(hover: none), (pointer: coarse)").matches || Portfolio.utils.prefersReducedMotion()) return;

      const dot = document.createElement("div");
      const ring = document.createElement("div");
      const label = document.createElement("span");
      dot.className = "cursor-dot";
      ring.className = "cursor-ring";
      label.className = "cursor-label";
      ring.append(label);
      document.body.append(dot, ring);
      document.body.classList.add("motion-enabled");

      let x = -100, y = -100, ringX = -100, ringY = -100;
      Portfolio.Lifecycle.global.listen(document, "mousemove", function (event) {
        x = event.clientX;
        y = event.clientY;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      });

      let frameId = 0;
      const render = function () {
        ringX += (x - ringX) * .17;
        ringY += (y - ringY) * .17;
        const half = ring.offsetWidth / 2;
        dot.style.transform = "translate3d(" + (x - 3) + "px," + (y - 3) + "px,0)";
        ring.style.transform = "translate3d(" + (ringX - half) + "px," + (ringY - half) + "px,0)";
        frameId = window.requestAnimationFrame(render);
      };
      Portfolio.Lifecycle.global.register(function () { window.cancelAnimationFrame(frameId); });
      render();

      Portfolio.Lifecycle.global.jquery(document, "mouseenter.portfolioCursor", "a, button, input, textarea, select, .project-card", function () {
        const element = this;
        const cursorLabel = element.matches(".project-card, .project-visual") || element.closest(".project-card") ? "VIEW" : element.matches("input, textarea, select") ? "TYPE" : "OPEN";
        ring.classList.add("is-active");
        if (element.matches(".project-card, .project-visual") || element.closest(".project-card")) {
          label.textContent = cursorLabel;
          ring.classList.add("has-label");
        }
      });
      Portfolio.Lifecycle.global.jquery(document, "mouseleave.portfolioCursor", "a, button, input, textarea, select, .project-card", function () {
        ring.classList.remove("is-active", "has-label");
        label.textContent = "";
      });
      Portfolio.Lifecycle.global.listen(document, "mouseleave", function () { dot.style.opacity = "0"; ring.style.opacity = "0"; });
      Portfolio.Lifecycle.global.register(function () { dot.remove(); ring.remove(); document.body.classList.remove("motion-enabled"); });
    },

    initMagnetic(root) {
      const scope = root || document;
      if (window.matchMedia("(hover: none), (pointer: coarse)").matches || Portfolio.utils.prefersReducedMotion()) return;
      scope.querySelectorAll(".magnetic").forEach(function (element) {
        Portfolio.Lifecycle.page.listen(element, "mousemove", function (event) {
          const rect = element.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          if (window.gsap) window.gsap.to(element, { x: x * .16, y: y * .16, duration: .35, ease: "power2.out", overwrite: true });
        });
        Portfolio.Lifecycle.page.listen(element, "mouseleave", function () {
          if (window.gsap) window.gsap.to(element, { x: 0, y: 0, duration: .65, ease: "elastic.out(1,.35)", overwrite: true });
        });
      });
    },

    initMicroInteractions(root) {
      const scope = root || document;
      const reduced = Portfolio.utils.prefersReducedMotion();

      scope.querySelectorAll(".btn, .icon-btn, .filter-btn").forEach(function (element) {
        Portfolio.Lifecycle.page.listen(element, "pointerdown", function (event) {
          if (reduced || !window.gsap) return;
          const rect = element.getBoundingClientRect();
          const ripple = document.createElement("span");
          ripple.className = "interaction-ripple";
          ripple.style.left = event.clientX - rect.left + "px";
          ripple.style.top = event.clientY - rect.top + "px";
          element.append(ripple);
          const scale = Math.max(rect.width, rect.height) / 12;
          window.gsap.to(ripple, { scale: scale, opacity: 0, duration: .65, ease: "power2.out", onComplete: function () { ripple.remove(); } });
        });
      });

      if (!window.matchMedia("(hover: none), (pointer: coarse)").matches && !reduced) {
        scope.querySelectorAll(".feature-card, .project-card, .service-card, .skill-group, .proof-card, .horizontal-panel, .case-study-teaser").forEach(function (card) {
          card.classList.add("motion-card");
          Portfolio.Lifecycle.page.listen(card, "pointermove", function (event) {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            card.style.setProperty("--pointer-x", px * 100 + "%");
            card.style.setProperty("--pointer-y", py * 100 + "%");
            if (window.gsap) {
              window.gsap.to(card, { rotateX: (py - .5) * -3.5, rotateY: (px - .5) * 4.5, transformPerspective: 900, duration: .45, ease: "power2.out", overwrite: "auto" });
              const image = card.querySelector(".project-visual img, .case-study-teaser img");
              if (image) window.gsap.to(image, { x: (px - .5) * 9, y: (py - .5) * 9, scale: 1.035, duration: .55, ease: "power2.out", overwrite: true });
            }
          });
          Portfolio.Lifecycle.page.listen(card, "pointerleave", function () {
            if (!window.gsap) return;
            window.gsap.to(card, { rotateX: 0, rotateY: 0, duration: .75, ease: "elastic.out(1,.45)", overwrite: "auto" });
            const image = card.querySelector(".project-visual img, .case-study-teaser img");
            if (image) window.gsap.to(image, { x: 0, y: 0, scale: 1, duration: .7, ease: "power3.out", overwrite: true });
          });
        });
      }

      scope.querySelectorAll(".premium-accordion").forEach(function (accordion) {
        Portfolio.Lifecycle.page.listen(accordion, "shown.bs.collapse", function (event) {
          if (!window.gsap || reduced) return;
          window.gsap.fromTo(event.target.querySelector(".accordion-body"), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .42, ease: "power2.out" });
        });
      });
    }
  };
})(window, window.jQuery);
