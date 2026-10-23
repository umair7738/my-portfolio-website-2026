(function (window) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  Portfolio.Animations = {
    init(root) {
      const scope = root || document;
      const lightweightMobileMotion = window.matchMedia("(max-width: 767.98px), (hover: none), (pointer: coarse)").matches;
      if (!window.gsap || !window.ScrollTrigger || Portfolio.utils.prefersReducedMotion()) {
        scope.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-scale").forEach(function (element) { element.style.opacity = 1; });
        scope.querySelectorAll("[data-counter]").forEach(function (element) { element.textContent = (element.dataset.counter || "0") + (element.dataset.suffix || ""); });
        scope.querySelectorAll(".skill-item").forEach(function (element) { element.classList.add("is-visible"); });
        scope.querySelectorAll(".timeline").forEach(function (element) { element.style.setProperty("--timeline-progress", "1"); });
        scope.querySelectorAll(".process-steps").forEach(function (element) {
          element.style.setProperty("--process-progress", "1");
          element.querySelectorAll(".process-step").forEach(function (step) { step.classList.add("is-process-active"); });
        });
        document.documentElement.classList.add("motion-ready");
        return;
      }

      window.gsap.registerPlugin(window.ScrollTrigger);
      if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
        // Chrome's collapsing mobile toolbar changes only the viewport height.
        // Treating that as a layout resize makes every scrubbed trigger jump.
        window.ScrollTrigger.config({ ignoreMobileResize: true });
      }
      const context = window.gsap.context(() => {
        this.initLenis();
        this.responsiveRefresh(scope);
        this.prepareText(scope);
        this.horizontalScroll(scope);
        this.heroReveal(scope);
        this.sectionReveals(scope);
        this.sectionChoreography(scope);
        if (!lightweightMobileMotion) this.parallax(scope);
        this.counters(scope);
        this.skillBars(scope);
        this.timeline(scope);
        if (!lightweightMobileMotion) this.floatingShapes(scope);
        this.heroPointer(scope);
      }, scope);
      Portfolio.Lifecycle.page.context(context);
      document.documentElement.classList.add("motion-ready");
    },

    responsiveRefresh(root) {
      let timer = 0;
      let frame = 0;
      const touchViewport = window.matchMedia("(hover: none), (pointer: coarse)");
      let viewportWidth = document.documentElement.clientWidth;
      const refresh = function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          window.cancelAnimationFrame(frame);
          frame = window.requestAnimationFrame(function () {
            if (window.ScrollTrigger) window.ScrollTrigger.refresh();
          });
        }, 120);
      };
      const refreshForResize = function () {
        const nextWidth = document.documentElement.clientWidth;
        const widthChanged = Math.abs(nextWidth - viewportWidth) > 1;
        if (touchViewport.matches && !widthChanged) return;
        viewportWidth = nextWidth;
        refresh();
      };
      const refreshForOrientation = function () {
        viewportWidth = document.documentElement.clientWidth;
        refresh();
      };
      Portfolio.Lifecycle.page.listen(window, "resize", refreshForResize, { passive: true });
      Portfolio.Lifecycle.page.listen(window, "orientationchange", refreshForOrientation, { passive: true });
      Portfolio.Lifecycle.page.register(function () {
        window.clearTimeout(timer);
        window.cancelAnimationFrame(frame);
      });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          if ((root || document).isConnected !== false) refresh();
        });
      }
    },

    initLenis() {
      // Native touch scrolling is more reliable when browser chrome expands,
      // orientation changes, or the off-canvas navigation is opened.
      if (!window.Lenis || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
      const lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .88, touchMultiplier: 1.15 });
      window.portfolioLenis = lenis;
      lenis.on("scroll", window.ScrollTrigger.update);
      const tick = function (time) { lenis.raf(time * 1000); };
      window.gsap.ticker.add(tick);
      window.gsap.ticker.lagSmoothing(0);
      Portfolio.Lifecycle.page.track({ destroy: function () {
        if (typeof lenis.off === "function") lenis.off("scroll", window.ScrollTrigger.update);
        window.gsap.ticker.remove(tick);
        if (typeof lenis.destroy === "function") lenis.destroy();
        if (window.portfolioLenis === lenis) delete window.portfolioLenis;
      } });
    },

    prepareText(root) {
      Portfolio.utils.splitCharacters("[data-split='chars']", root);
      Portfolio.utils.splitWords("[data-split='words']", root);
    },

    heroReveal(root) {
      const hero = root.querySelector(".home-hero, .page-hero");
      if (!hero) return;
      const timeline = window.gsap.timeline({ defaults: { ease: "power4.out" } });
      const select = function (selector) { return Array.from(hero.querySelectorAll(selector)); };
      const lines = select(".hero-title .line > span");
      const pageTitle = hero.querySelector(".page-title");
      const ambient = select(".ambient-grid, .ambient-orb");
      const intro = select(".availability-badge, .hero-kicker, .eyebrow");
      const details = lines.length ? select(".hero-bottom") : select(".lead-copy, .page-hero-note");
      const meta = select(".hero-meta > div");
      const extras = select(".developer-badge, .scroll-cue");

      if (lines.length) window.gsap.set(lines, { yPercent: 118, rotate: 2 });
      if (pageTitle) window.gsap.set(pageTitle, { y: 60, autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });

      if (ambient.length) timeline.from(ambient, { scale: 1.12, opacity: 0, duration: 1.3, stagger: .08 });
      if (intro.length) timeline.from(intro, { y: 22, opacity: 0, duration: .72, stagger: .06 }, ambient.length ? "-=.95" : 0);
      if (lines.length) timeline.to(lines, { yPercent: 0, rotate: 0, duration: 1.08, stagger: .095 }, ambient.length || intro.length ? "-=.62" : 0);

      if (pageTitle) timeline.to(pageTitle, { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: 1.05 }, "-=.65");

      if (details.length) timeline.from(details, { y: 30, opacity: 0, duration: .82, stagger: .1 }, "-=.58");
      if (meta.length) timeline.from(meta, { y: 18, opacity: 0, duration: .55, stagger: .08 }, "-=.62");
      if (extras.length) timeline.from(extras, { scale: .72, opacity: 0, duration: .82, stagger: .1 }, "-=.65");
      timeline.set(hero.querySelectorAll(".hero-title .line > span, .page-title, .hero-bottom, .lead-copy, .page-hero-note"), { clearProps: "transform,opacity,visibility,clipPath" });
    },

    sectionReveals(root) {
      const titleElements = Array.from(root.querySelectorAll(".section-title")).filter(function (element) {
        return !element.closest(".horizontal-heading");
      });
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
        const elements = Array.from(root.querySelectorAll(group.selector)).filter(function (element) {
          return !element.matches(".section-title, .process-step");
        });
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

      const automatic = Array.from(root.querySelectorAll(".timeline-item, .value-item, .contact-method, .case-section, .case-study-teaser, .premium-accordion .accordion-item, .tool-cloud span")).filter(function (element) {
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

      Array.from(root.querySelectorAll(".image-reveal")).forEach(function (element) {
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

    sectionChoreography(root) {
      root.querySelectorAll(".section-border").forEach(function (section) {
        if (section.querySelector(":scope > .section-motion-line")) return;
        const line = document.createElement("span");
        line.className = "section-motion-line";
        line.innerHTML = "<span></span>";
        line.setAttribute("aria-hidden", "true");
        section.prepend(line);
        window.gsap.to(line.firstElementChild, { scaleX: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 92%", end: "top 30%", scrub: .6 } });
      });

      const process = root.querySelector(".process-steps");
      if (process && !process.querySelector(".process-motion-line")) {
        process.style.setProperty("--process-progress", "0");
        const progress = document.createElement("span");
        progress.className = "process-motion-line";
        progress.setAttribute("aria-hidden", "true");
        process.prepend(progress);
        const percentage = document.createElement("span");
        percentage.className = "process-percent";
        percentage.setAttribute("aria-hidden", "true");
        percentage.textContent = "00%";
        process.append(percentage);
        const steps = Array.from(process.querySelectorAll(".process-step"));
        const revealedSteps = new WeakSet();
        steps.forEach(function (step) {
          window.gsap.set(step, { autoAlpha: 0 });
          window.gsap.set(Array.from(step.children), { x: 14 });
        });
        let geometry = { mobile: false, start: 0, end: 0, length: 0, checkpoints: [] };
        const measureGeometry = function () {
          const mobile = window.matchMedia("(max-width: 767.98px)").matches;
          if (!mobile || !steps.length) {
            geometry = {
              mobile: false,
              start: 0,
              end: 0,
              length: 0,
              checkpoints: steps.map(function (_step, index) { return steps.length === 1 ? 0 : index / (steps.length - 1); })
            };
            process.style.removeProperty("--process-line-top");
            process.style.removeProperty("--process-line-length");
            process.style.removeProperty("--process-marker-y");
            return geometry;
          }

          const dotCenters = steps.map(function (step) {
            const dot = window.getComputedStyle(step, "::before");
            return step.offsetTop + parseFloat(dot.top || "0") + (parseFloat(dot.height || "0") / 2);
          });
          const start = dotCenters[0];
          const end = dotCenters[dotCenters.length - 1];
          const length = Math.max(1, end - start);
          geometry = {
            mobile: true,
            start: start,
            end: end,
            length: length,
            checkpoints: dotCenters.map(function (center) { return (center - start) / length; })
          };
          process.style.setProperty("--process-line-top", start.toFixed(2) + "px");
          process.style.setProperty("--process-line-length", length.toFixed(2) + "px");
          return geometry;
        };
        const revealStep = function (step, index) {
          if (revealedSteps.has(step)) return;
          revealedSteps.add(step);
          window.gsap.timeline()
            .to(step, { autoAlpha: 1, duration: .42, ease: "power2.out" })
            .to(Array.from(step.children), { x: 0, duration: .62, stagger: .055, ease: "power3.out" }, index ? "-=.32" : "-=.34");
        };
        const updateProcess = function (value, reveal) {
          const normalized = Math.max(0, Math.min(1, value));
          process.style.setProperty("--process-progress", normalized.toFixed(4));
          percentage.textContent = String(Math.round(normalized * 100)).padStart(2, "0") + "%";
          if (geometry.mobile) {
            process.style.setProperty("--process-marker-y", (geometry.start + (geometry.length * normalized)).toFixed(2) + "px");
          }
          steps.forEach(function (step, index) {
            const checkpoint = geometry.checkpoints[index] == null ? 0 : geometry.checkpoints[index];
            const active = normalized + .025 >= checkpoint;
            step.classList.toggle("is-process-active", active);
            if (active && reveal) revealStep(step, index);
          });
        };

        measureGeometry();
        updateProcess(0, false);
        const processState = { value: 0 };
        window.gsap.to(processState, {
          value: 1,
          ease: "none",
          onUpdate: function () {
            updateProcess(processState.value, processState.value > 0);
          },
          scrollTrigger: {
            trigger: process,
            start: function () {
              const current = measureGeometry();
              return current.mobile ? "top+=" + current.start + " 78%" : "top 78%";
            },
            end: function () {
              const current = measureGeometry();
              return current.mobile ? "top+=" + current.end + " 48%" : "bottom 48%";
            },
            scrub: window.matchMedia("(max-width: 767.98px)").matches ? .28 : .5,
            invalidateOnRefresh: true,
            onRefreshInit: measureGeometry
          }
        });
      }

      const trust = root.querySelector(".trust-strip");
      if (trust) window.gsap.from(trust, { clipPath: "inset(0 50% 0 50%)", duration: 1.15, ease: "power3.inOut", scrollTrigger: { trigger: trust, start: "top 94%", once: true } });

      const codeWindow = root.querySelector(".code-window");
      if (codeWindow) window.gsap.fromTo(codeWindow, { rotate: -8, y: 45 }, { rotate: -2, y: -12, ease: "none", scrollTrigger: { trigger: codeWindow.closest(".feature-card"), start: "top bottom", end: "bottom top", scrub: 1 } });

      const performanceRing = root.querySelector(".performance-ring");
      if (performanceRing) window.gsap.from(performanceRing, { rotate: -130, scale: .65, opacity: 0, duration: 1.25, ease: "back.out(1.4)", scrollTrigger: { trigger: performanceRing, start: "top 88%", once: true } });

      Array.from(root.querySelectorAll(".project-card")).forEach(function (card) {
        const visual = card.querySelector(".project-visual");
        if (!visual) return;
        window.gsap.fromTo(visual, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.05, ease: "power4.inOut", scrollTrigger: { trigger: card, start: "top 90%", once: true } });
      });
    },

    parallax(root) {
      Array.from(root.querySelectorAll(".parallax-media")).forEach(function (element) {
        window.gsap.fromTo(element, { yPercent: -8, scale: 1.04 }, { yPercent: 8, scale: 1, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
      const orb = root.querySelector(".home-hero .ambient-orb");
      if (orb) window.gsap.to(orb, { xPercent: -18, yPercent: 24, scale: .86, ease: "none", scrollTrigger: { trigger: ".home-hero", start: "top top", end: "bottom top", scrub: true } });
      const heroContent = root.querySelector(".home-hero .hero-content");
      if (heroContent) window.gsap.to(heroContent, { yPercent: 10, opacity: .25, ease: "none", scrollTrigger: { trigger: ".home-hero", start: "55% top", end: "bottom top", scrub: true } });
    },

    counters(root) {
      root.querySelectorAll("[data-counter]").forEach(function (element) {
        window.gsap.fromTo(element,
          { y: 18, opacity: .35 },
          { y: 0, opacity: 1, duration: .7, ease: "power3.out", scrollTrigger: { trigger: element.closest(".stats-grid") || element, start: "top 88%", once: true } }
        );
      });
    },

    skillBars(root) {
      root.querySelectorAll(".skill-item").forEach(function (element) {
        window.ScrollTrigger.create({ trigger: element, start: "top 90%", once: true, onEnter: function () { element.classList.add("is-visible"); } });
      });
    },

    timeline(root) {
      root.querySelectorAll(".timeline").forEach(function (timeline) {
        const progress = timeline.querySelector(".timeline-progress");
        if (!progress) return;
        const percentage = document.createElement("span");
        percentage.className = "timeline-percent";
        percentage.setAttribute("aria-hidden", "true");
        percentage.textContent = "00%";
        timeline.append(percentage);
        const items = Array.from(timeline.querySelectorAll(".timeline-item"));

        window.ScrollTrigger.create({
          trigger: timeline,
          start: "top 70%",
          end: "bottom 68%",
          scrub: .7,
          onUpdate: function (self) {
            const value = self.progress;
            timeline.style.setProperty("--timeline-progress", value.toFixed(4));
            percentage.textContent = String(Math.round(value * 100)).padStart(2, "0") + "%";
            items.forEach(function (item, index) {
              const checkpoint = items.length === 1 ? 0 : index / (items.length - 1);
              item.classList.toggle("is-timeline-active", value + .06 >= checkpoint);
            });
          }
        });

        timeline.querySelectorAll(".timeline-content").forEach(function (content) {
          window.gsap.from(content, { x: 34, opacity: 0, duration: .8, ease: "power3.out", scrollTrigger: { trigger: content, start: "top 86%", once: true } });
        });
      });
    },

    horizontalScroll(root) {
      const section = root.querySelector(".horizontal-section");
      const heading = root.querySelector(".horizontal-heading");
      const track = root.querySelector(".horizontal-track");
      if (!section || !track) return;
      const media = window.gsap.matchMedia();
      if (heading) {
        const eyebrow = heading.querySelector(".eyebrow");
        const title = heading.querySelector(".section-title");
        const copy = heading.querySelector(".section-copy");
        const headingTimeline = window.gsap.timeline({ paused: true });
        if (eyebrow) window.gsap.set(eyebrow, { y: 18, autoAlpha: 0 });
        if (title) window.gsap.set(title, { y: 48, autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });
        if (copy) window.gsap.set(copy, { y: 28, autoAlpha: 0 });
        if (eyebrow) headingTimeline.to(eyebrow, { y: 0, autoAlpha: 1, duration: .58, ease: "power3.out" });
        if (title) headingTimeline.to(title, { y: 0, autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: .92, ease: "power4.out" }, eyebrow ? "-=.36" : 0);
        if (copy) headingTimeline.to(copy, { y: 0, autoAlpha: 1, duration: .68, ease: "power3.out" }, title ? "-=.52" : 0);
        window.ScrollTrigger.create({
          trigger: heading,
          start: "top 88%",
          once: true,
          onEnter: function () { headingTimeline.play(); }
        });
      }
      media.add("(min-width: 992px)", function () {
        const distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth + (heading ? heading.offsetWidth : 0) + 80); };
        window.gsap.from(Array.from(track.querySelectorAll(".horizontal-panel")), { y: 55, opacity: .25, duration: 1, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 82%", once: true } });
        window.gsap.to(track, { x: function () { return -distance(); }, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: function () { return "+=" + distance(); }, scrub: .75, pin: true, invalidateOnRefresh: true, anticipatePin: 1 } });
      });
      media.add("(max-width: 991px)", function () {
        const panels = Array.from(track.querySelectorAll(".horizontal-panel"));
        window.gsap.set(panels, { y: 36, autoAlpha: 0 });
        window.ScrollTrigger.batch(panels, {
          start: "top 92%",
          once: true,
          onEnter: function (batch) {
            window.gsap.to(batch, { y: 0, autoAlpha: 1, duration: .62, stagger: .055, ease: "power3.out", overwrite: true });
          }
        });
      });
      Portfolio.Lifecycle.page.track({ destroy: function () { media.revert(); } });
    },

    floatingShapes(root) {
      root.querySelectorAll(".floating-shape").forEach(function (shape, index) {
        window.gsap.to(shape, { x: index % 2 ? -18 : 22, y: index % 2 ? 26 : -22, rotation: index % 2 ? -8 : 9, duration: 3 + index * .4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
    },

    heroPointer(root) {
      const scope = root || document;
      const hero = scope.querySelector(".home-hero");
      if (!hero || window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
      const grid = hero.querySelector(".ambient-grid");
      const orb = hero.querySelector(".ambient-orb");
      const badge = hero.querySelector(".developer-badge");
      Portfolio.Lifecycle.page.listen(hero, "pointermove", function (event) {
        const x = event.clientX / window.innerWidth - .5;
        const y = event.clientY / window.innerHeight - .5;
        if (grid) window.gsap.to(grid, { x: x * 15, y: y * 15, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        if (orb) window.gsap.to(orb, { x: x * -35, y: y * -25, duration: 1.5, ease: "power2.out", overwrite: "auto" });
        if (badge) window.gsap.to(badge, { x: x * -18, y: y * -18, duration: 1, ease: "power2.out", overwrite: "auto" });
      });
    },

  };
})(window);
