(function (window) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  Portfolio.Loader = {
    play() {
      const loader = document.querySelector(".page-loader");
      if (!loader) {
        document.body.classList.remove("loading");
        return Promise.resolve();
      }

      if (Portfolio.utils.prefersReducedMotion() || !window.gsap) {
        loader.remove();
        document.body.classList.remove("loading");
        return Promise.resolve();
      }

      const isHome = document.body.dataset.page === "home";
      const duration = isHome ? 1.65 : .85;
      const count = { value: 0 };
      const percent = loader.querySelector("[data-loader-percent]");
      const status = loader.querySelector("[data-loader-status]");
      let currentStatus = "";

      const updateProgress = function () {
        const value = Math.round(count.value);
        percent.textContent = String(value).padStart(3, "0");
        const nextStatus = value < 34 ? "Loading interface" : value < 68 ? "Composing motion" : value < 94 ? "Polishing details" : "Experience ready";
        if (nextStatus !== currentStatus) {
          currentStatus = nextStatus;
          status.textContent = nextStatus;
          window.gsap.fromTo(status, { y: 7, opacity: .2 }, { y: 0, opacity: 1, duration: .28, ease: "power2.out" });
        }
      };

      return new Promise(function (resolve) {
        const timeline = window.gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: function () {
            loader.remove();
            document.body.classList.remove("loading");
            resolve();
          }
        });

        window.gsap.set(".loader-letter", { yPercent: 115, rotate: 5 });
        window.gsap.set(".loader-topline, .loader-console, .loader-meta", { opacity: 0, y: 12 });

        timeline
          .to(".loader-topline", { opacity: 1, y: 0, duration: .45 })
          .to(".loader-letter", { yPercent: 0, rotate: 0, duration: .9, stagger: .065, ease: "power4.out" }, "-=.22")
          .to(".loader-console, .loader-meta", { opacity: 1, y: 0, duration: .5, stagger: .08 }, "-=.58")
          .to(count, { value: 100, duration: duration, ease: "power2.inOut", onUpdate: updateProgress }, "-=.38")
          .to(".loader-progress span", { scaleX: 1, duration: duration, ease: "power2.inOut" }, "<")
          .to(".loader-scan", { xPercent: 180, duration: duration * .85, ease: "power1.inOut" }, "<")
          .to(".loader-stage", { y: -28, opacity: 0, duration: .42, ease: "power2.in" }, "+=.08")
          .to(".loader-panel-top", { yPercent: -101, duration: .78, ease: "power4.inOut" }, "-=.05")
          .to(".loader-panel-bottom", { yPercent: 101, duration: .78, ease: "power4.inOut" }, "<")
          .to(loader, { autoAlpha: 0, duration: .12 });
      });
    }
  };
})(window);
