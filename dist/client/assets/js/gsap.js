(function (window) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  Portfolio.Animations = {
    init() {
      if (!window.gsap || !window.ScrollTrigger || Portfolio.utils.prefersReducedMotion()) {
        document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-scale").forEach(function (element) { element.style.opacity = 1; });
        return;
      }

      window.gsap.registerPlugin(window.ScrollTrigger);
      this.initLenis();
      this.prepareText();
      this.heroReveal();
      this.sectionReveals();
      this.sectionChoreography();
      this.parallax();
      this.counters();
      this.skillBars();
      this.timeline();
      this.horizontalScroll();
      this.floatingShapes();
      this.heroPointer();
      this.footerReveal();
      window.ScrollTrigger.refresh();
    },

    initLenis() {
      if (!window.Lenis) return;
      const lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .88, touchMultiplier: 1.15 });
      window.portfolioLenis = lenis;
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    },

    prepareText() {
      Portfolio.utils.splitCharacters("[data-split='chars']");
      Portfolio.utils.splitWords("[data-split='words']");
    },

    heroReveal() {
      const hero = document.querySelector(".home-hero, .page-hero");
      if (!hero) return;
      const timeline = window.gsap.timeline({ defaults: { ease: "power4.out" } });
      const lines = hero.querySelectorAll(".hero-title .line > span");
      const pageTitle = hero.querySelector(".page-title");

      window.gsap.set(lines, { yPercent: 118, rotate: 2 });
      if (pageTitle) window.gsap.set(pageTitle, { y: 60, autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });

      timeline
        .from(hero.querySelectorAll(".ambient-grid, .ambient-orb"), { scale: 1.12, opacity: 0, duration: 1.3, stagger: .08 })
        .from(hero.querySelectorAll(".availability-badge, .hero-kicker, .page-hero .eyebrow"), { y: 22, opacity: 0, duration: .72, stagger: .06 }, "-=.95")
        .to(lines, { yPercent: 0, rotate: 0, duration: 1.08, stagger: .095 }, "-=.62");

      if (pageTitle) timeline.to(pageTitle, { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: 1.05 }, "-=.65");

      timeline
        .from(hero.querySelectorAll(".hero-bottom, .page-hero .lead-copy, .page-hero-note"), { y: 30, opacity: 0, duration: .82, stagger: .1 }, "-=.58")
        .from(hero.querySelectorAll(".hero-meta > div"), { y: 18, opacity: 0, duration: .55, stagger: .08 }, "-=.62")
        .from(hero.querySelectorAll(".developer-badge, .scroll-cue"), { scale: .72, opacity: 0, duration: .82, stagger: .1 }, "-=.65");
    },

    sectionReveals() {
      const titleElements = window.gsap.utils.toArray(".section-title");
      titleElements.forEach(function (element) {
        window.gsap.fromTo(element,
          { y: 44, autoAlpha: 0, clipPath: "inset(0 0 100% 0)" },
          { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: 1.05, ease: "power4.out", scrollTrigger: { trigger: element, start: "top 87%", once: true } }
        );
      });

      const revealGroups = [
        { selector: ".reveal-up", from: { y: 58, autoAlpha: 0 } },
        { selector: ".reveal-left", from: { x: -64, autoAlpha: 0 } },
        { selector: ".reveal-right", from: { x: 64, autoAlpha: 0 } },
        { selector: ".reveal-scale", from: { scale: .9, autoAlpha: 0 } }
      ];

      revealGroups.forEach(function (group) {
        const elements = window.gsap.utils.toArray(group.selector).filter(function (element) { return !element.matches(".section-title"); });
        if (!elements.length) return;
        window.gsap.set(elements, group.from);
        window.ScrollTrigger.batch(elements, {
          start: "top 91%",
          once: true,
          onEnter: function (batch) {
            window.gsap.to(batch, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: .92, stagger: .095, ease: "power3.out", overwrite: true });
          }
        });
      });

      const automatic = window.gsap.utils.toArray(".timeline-item, .value-item, .contact-method, .case-section, .case-study-teaser, .premium-accordion .accordion-item, .tool-cloud span").filter(function (element) {
        return !element.matches(".reveal-up, .reveal-left, .reveal-right, .reveal-scale");
      });
      if (automatic.length) {
        window.gsap.set(automatic, { y: 42, autoAlpha: 0 });
        window.ScrollTrigger.batch(automatic, {
          start: "top 92%",
          once: true,
          onEnter: function (batch) { window.gsap.to(batch, { y: 0, autoAlpha: 1, duration: .78, stagger: .07, ease: "power3.out", overwrite: true }); }
        });
      }

      window.gsap.utils.toArray(".image-reveal").forEach(function (element) {
        const image = element.querySelector("img");
        window.ScrollTrigger.create({
          trigger: element,
          start: "top 84%",
          once: true,
          onEnter: function () {
            element.classList.add("is-revealed");
            if (image) window.gsap.fromTo(image, { scale: 1.14 }, { scale: 1, duration: 1.35, ease: "power3.out" });
          }
        });
      });
    },

    sectionChoreography() {
      document.querySelectorAll(".section-border").forEach(function (section) {
        if (section.querySelector(":scope > .section-motion-line")) return;
        const line = document.createElement("span");
        line.className = "section-motion-line";
        line.innerHTML = "<span></span>";
        line.setAttribute("aria-hidden", "true");
        section.prepend(line);
        window.gsap.to(line.firstElementChild, { scaleX: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 92%", end: "top 30%", scrub: .6 } });
      });

      const process = document.querySelector(".process-steps");
      if (process && !process.querySelector(".process-motion-line")) {
        const progress = document.createElement("span");
        progress.className = "process-motion-line";
        progress.setAttribute("aria-hidden", "true");
        process.prepend(progress);
        window.gsap.to(progress, { scaleX: 1, ease: "none", scrollTrigger: { trigger: process, start: "top 78%", end: "bottom 62%", scrub: .7 } });
      }

      const trust = document.querySelector(".trust-strip");
      if (trust) window.gsap.from(trust, { clipPath: "inset(0 50% 0 50%)", duration: 1.15, ease: "power3.inOut", scrollTrigger: { trigger: trust, start: "top 94%", once: true } });

      const codeWindow = document.querySelector(".code-window");
      if (codeWindow) window.gsap.fromTo(codeWindow, { rotate: -8, y: 45 }, { rotate: -2, y: -12, ease: "none", scrollTrigger: { trigger: codeWindow.closest(".feature-card"), start: "top bottom", end: "bottom top", scrub: 1 } });

      const performanceRing = document.querySelector(".performance-ring");
      if (performanceRing) window.gsap.from(performanceRing, { rotate: -130, scale: .65, opacity: 0, duration: 1.25, ease: "back.out(1.4)", scrollTrigger: { trigger: performanceRing, start: "top 88%", once: true } });

      window.gsap.utils.toArray(".project-card").forEach(function (card) {
        const visual = card.querySelector(".project-visual");
        if (!visual) return;
        window.gsap.fromTo(visual, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.05, ease: "power4.inOut", scrollTrigger: { trigger: card, start: "top 90%", once: true } });
      });
    },

    parallax() {
      window.gsap.utils.toArray(".parallax-media").forEach(function (element) {
        window.gsap.fromTo(element, { yPercent: -8, scale: 1.04 }, { yPercent: 8, scale: 1, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      const orb = document.querySelector(".home-hero .ambient-orb");
      if (orb) window.gsap.to(orb, { xPercent: -18, yPercent: 24, scale: .86, ease: "none", scrollTrigger: { trigger: ".home-hero", start: "top top", end: "bottom top", scrub: true } });
      const heroContent = document.querySelector(".home-hero .hero-content");
      if (heroContent) window.gsap.to(heroContent, { yPercent: 10, opacity: .25, ease: "none", scrollTrigger: { trigger: ".home-hero", start: "55% top", end: "bottom top", scrub: true } });
    },

    counters() {
      document.querySelectorAll("[data-counter]").forEach(function (element) {
        const target = Number(element.dataset.counter || 0);
        const suffix = element.dataset.suffix || "";
        const state = { value: 0 };
        window.gsap.to(state, { value: target, duration: 1.75, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 89%", once: true }, onUpdate: function () { element.textContent = Math.round(state.value) + suffix; } });
      });
    },

    skillBars() {
      document.querySelectorAll(".skill-item").forEach(function (element) {
        window.ScrollTrigger.create({ trigger: element, start: "top 90%", once: true, onEnter: function () { element.classList.add("is-visible"); } });
      });
    },

    timeline() {
      const timeline = document.querySelector(".timeline");
      const progress = document.querySelector(".timeline-progress");
      if (!timeline || !progress) return;
      window.gsap.to(progress, { height: "100%", ease: "none", scrollTrigger: { trigger: timeline, start: "top 68%", end: "bottom 72%", scrub: true } });
      document.querySelectorAll(".timeline-content").forEach(function (content) {
        window.gsap.from(content, { x: 34, opacity: 0, duration: .8, ease: "power3.out", scrollTrigger: { trigger: content, start: "top 86%", once: true } });
      });
    },

    horizontalScroll() {
      const section = document.querySelector(".horizontal-section");
      const heading = document.querySelector(".horizontal-heading");
      const track = document.querySelector(".horizontal-track");
      if (!section || !track || window.innerWidth < 992) return;
      const distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth + (heading ? heading.offsetWidth : 0) + 80); };
      window.gsap.from(track.querySelectorAll(".horizontal-panel"), { y: 55, opacity: .25, duration: 1, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 82%", once: true } });
      window.gsap.to(track, { x: function () { return -distance(); }, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: function () { return "+=" + distance(); }, scrub: .75, pin: true, invalidateOnRefresh: true, anticipatePin: 1 } });
    },

    floatingShapes() {
      document.querySelectorAll(".floating-shape").forEach(function (shape, index) {
        window.gsap.to(shape, { x: index % 2 ? -18 : 22, y: index % 2 ? 26 : -22, rotation: index % 2 ? -8 : 9, duration: 3 + index * .4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
    },

    heroPointer() {
      const hero = document.querySelector(".home-hero");
      if (!hero || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
      const grid = hero.querySelector(".ambient-grid");
      const orb = hero.querySelector(".ambient-orb");
      const badge = hero.querySelector(".developer-badge");
      hero.addEventListener("pointermove", function (event) {
        const x = event.clientX / window.innerWidth - .5;
        const y = event.clientY / window.innerHeight - .5;
        if (grid) window.gsap.to(grid, { x: x * 15, y: y * 15, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        if (orb) window.gsap.to(orb, { x: x * -35, y: y * -25, duration: 1.5, ease: "power2.out", overwrite: "auto" });
        if (badge) window.gsap.to(badge, { x: x * -18, y: y * -18, duration: 1, ease: "power2.out", overwrite: "auto" });
      });
    },

    footerReveal() {
      const footer = document.querySelector("[data-footer]");
      if (!footer) return;
      window.gsap.from(".footer-title", { y: 90, opacity: 0, clipPath: "inset(0 0 100% 0)", duration: 1.15, ease: "power4.out", scrollTrigger: { trigger: footer, start: "top 82%", once: true } });
      window.gsap.from(".footer-grid > div", { y: 34, opacity: 0, duration: .75, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: ".footer-grid", start: "top 88%", once: true } });
      window.gsap.to(".footer-glow", { xPercent: 35, ease: "none", scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: true } });
    }
  };
})(window);
