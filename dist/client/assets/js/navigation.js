(function (window, $) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  Portfolio.Navigation = {
    init() {
      this.setActiveLink();
      this.initTheme();
      this.initHeader();
      this.initScrollActions();
      this.initAnchorLinks();
      this.initCursor();
      this.initMagnetic();
    },

    setActiveLink() {
      const page = document.body.dataset.page || "home";
      document.querySelectorAll('[data-nav="' + page + '"]').forEach(function (link) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      });
    },

    initTheme() {
      const root = document.documentElement;
      const stored = localStorage.getItem("portfolio-theme");
      const initial = stored || "dark";
      root.dataset.theme = initial;

      document.querySelectorAll(".theme-toggle").forEach(function (button) {
        button.setAttribute("aria-pressed", String(initial === "light"));
        button.addEventListener("click", function () {
          const next = root.dataset.theme === "light" ? "dark" : "light";
          root.dataset.theme = next;
          localStorage.setItem("portfolio-theme", next);
          button.setAttribute("aria-pressed", String(next === "light"));
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
        header.classList.toggle("is-hidden", current > previous && current > 180);
        previous = Math.max(0, current);
      };
      window.addEventListener("scroll", update, { passive: true });
      update();
    },

    initScrollActions() {
      const buttons = document.querySelectorAll("[data-back-to-top], [data-back-top-inline]");
      const floating = document.querySelector("[data-back-to-top]");
      const progress = floating ? floating.querySelector("circle.progress") : null;
      const circumference = 125.66;

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          if (window.portfolioLenis) {
            window.portfolioLenis.scrollTo(0, { duration: 1.2 });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
      });

      const update = function () {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = total > 0 ? window.scrollY / total : 0;
        if (floating) floating.classList.toggle("visible", window.scrollY > 500);
        if (progress) progress.style.strokeDashoffset = String(circumference - ratio * circumference);
      };
      window.addEventListener("scroll", update, { passive: true });
      update();
    },

    initAnchorLinks() {
      $(document).on("click", 'a[href^="#"]', function (event) {
        const id = this.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        if (window.portfolioLenis) {
          window.portfolioLenis.scrollTo(target, { offset: -90, duration: 1.1 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    },

    initCursor() {
      if (window.matchMedia("(hover: none), (pointer: coarse)").matches || Portfolio.utils.prefersReducedMotion()) return;

      const dot = document.createElement("div");
      const ring = document.createElement("div");
      dot.className = "cursor-dot";
      ring.className = "cursor-ring";
      document.body.append(dot, ring);

      let x = 0, y = 0, ringX = 0, ringY = 0;
      document.addEventListener("mousemove", function (event) {
        x = event.clientX;
        y = event.clientY;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      });

      const render = function () {
        ringX += (x - ringX) * 0.16;
        ringY += (y - ringY) * 0.16;
        dot.style.transform = "translate3d(" + (x - 3) + "px," + (y - 3) + "px,0)";
        ring.style.transform = "translate3d(" + (ringX - 19) + "px," + (ringY - 19) + "px,0)";
        requestAnimationFrame(render);
      };
      render();

      $(document).on("mouseenter", "a, button, input, textarea, select, .project-card", function () { ring.classList.add("is-active"); });
      $(document).on("mouseleave", "a, button, input, textarea, select, .project-card", function () { ring.classList.remove("is-active"); });
    },

    initMagnetic() {
      if (window.matchMedia("(hover: none), (pointer: coarse)").matches || Portfolio.utils.prefersReducedMotion()) return;
      document.querySelectorAll(".magnetic").forEach(function (element) {
        element.addEventListener("mousemove", function (event) {
          const rect = element.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          if (window.gsap) window.gsap.to(element, { x: x * .16, y: y * .16, duration: .35, ease: "power2.out" });
        });
        element.addEventListener("mouseleave", function () {
          if (window.gsap) window.gsap.to(element, { x: 0, y: 0, duration: .65, ease: "elastic.out(1,.35)" });
        });
      });
    }
  };
})(window, window.jQuery);
