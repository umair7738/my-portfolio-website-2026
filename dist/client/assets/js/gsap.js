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
      this.parallax();
      this.counters();
      this.skillBars();
      this.timeline();
      this.horizontalScroll();
      this.floatingShapes();
      this.footerReveal();
      window.ScrollTrigger.refresh();
    },

    initLenis() {
      if (!window.Lenis) return;
      const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.2 });
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
      timeline
        .from(hero.querySelectorAll(".availability-badge, .hero-kicker, .page-hero .eyebrow"), { y: 18, opacity: 0, duration: .7 })
        .from(hero.querySelectorAll(".hero-title .line > span, .page-title"), { yPercent: 115, opacity: 0, duration: 1.15, stagger: .1 }, "-=.35")
        .from(hero.querySelectorAll(".hero-bottom, .page-hero .lead-copy, .page-hero-note"), { y: 28, opacity: 0, duration: .85, stagger: .1 }, "-=.65")
        .from(hero.querySelectorAll(".developer-badge, .scroll-cue"), { scale: .8, opacity: 0, duration: .8 }, "-=.7");
    },

    sectionReveals() {
      window.gsap.utils.toArray(".reveal-up").forEach(function (element) {
        window.gsap.from(element, { scrollTrigger: { trigger: element, start: "top 88%", once: true }, y: 42, opacity: 0, duration: .9, ease: "power3.out" });
      });
      window.gsap.utils.toArray(".reveal-left").forEach(function (element) {
        window.gsap.from(element, { scrollTrigger: { trigger: element, start: "top 88%", once: true }, x: -55, opacity: 0, duration: 1, ease: "power3.out" });
      });
      window.gsap.utils.toArray(".reveal-right").forEach(function (element) {
        window.gsap.from(element, { scrollTrigger: { trigger: element, start: "top 88%", once: true }, x: 55, opacity: 0, duration: 1, ease: "power3.out" });
      });
      window.gsap.utils.toArray(".reveal-scale").forEach(function (element) {
        window.gsap.from(element, { scrollTrigger: { trigger: element, start: "top 88%", once: true }, scale: .93, opacity: 0, duration: 1, ease: "power3.out" });
      });
      window.gsap.utils.toArray(".image-reveal").forEach(function (element) {
        window.gsap.to(element, { scrollTrigger: { trigger: element, start: "top 82%", once: true }, "--reveal": 1, duration: 1 });
        const cover = element.querySelector("img");
        window.gsap.from(cover, { scrollTrigger: { trigger: element, start: "top 82%", once: true }, scale: 1.12, duration: 1.3, ease: "power3.out" });
        window.gsap.to(element, { scrollTrigger: { trigger: element, start: "top 82%", once: true }, onStart: function () { element.classList.add("is-revealed"); } });
      });
    },

    parallax() {
      window.gsap.utils.toArray(".parallax-media").forEach(function (element) {
        window.gsap.fromTo(element, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      const orb = document.querySelector(".home-hero .ambient-orb");
      if (orb) window.gsap.to(orb, { xPercent: -12, yPercent: 18, scrollTrigger: { trigger: ".home-hero", start: "top top", end: "bottom top", scrub: true } });
    },

    counters() {
      document.querySelectorAll("[data-counter]").forEach(function (element) {
        const target = Number(element.dataset.counter || 0);
        const suffix = element.dataset.suffix || "";
        const state = { value: 0 };
        window.gsap.to(state, { value: target, duration: 1.7, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 88%", once: true }, onUpdate: function () { element.textContent = Math.round(state.value) + suffix; } });
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
      window.gsap.to(progress, { height: "100%", ease: "none", scrollTrigger: { trigger: timeline, start: "top 65%", end: "bottom 70%", scrub: true } });
    },

    horizontalScroll() {
      const section = document.querySelector(".horizontal-section");
      const track = document.querySelector(".horizontal-track");
      if (!section || !track || window.innerWidth < 992) return;
      const distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 80); };
      window.gsap.to(track, { x: function () { return -distance(); }, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: function () { return "+=" + distance(); }, scrub: .6, pin: true, invalidateOnRefresh: true, anticipatePin: 1 } });
    },

    floatingShapes() {
      document.querySelectorAll(".floating-shape").forEach(function (shape, index) {
        window.gsap.to(shape, { x: index % 2 ? -18 : 22, y: index % 2 ? 26 : -22, rotation: index % 2 ? -8 : 9, duration: 3 + index * .4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
    },

    footerReveal() {
      const footer = document.querySelector("[data-footer]");
      if (!footer) return;
      window.gsap.from(".footer-title", { scrollTrigger: { trigger: footer, start: "top 80%", once: true }, y: 75, opacity: 0, duration: 1.15, ease: "power4.out" });
    }
  };
})(window);
