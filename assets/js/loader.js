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

      const firstVisit = !sessionStorage.getItem("portfolio-loaded");
      const duration = firstVisit ? 1.15 : .4;
      const count = { value: 0 };
      const percent = loader.querySelector("[data-loader-percent]");

      return new Promise(function (resolve) {
        const timeline = window.gsap.timeline({
          onComplete: function () {
            sessionStorage.setItem("portfolio-loaded", "true");
            loader.remove();
            document.body.classList.remove("loading");
            resolve();
          }
        });
        timeline
          .to(count, { value: 100, duration: duration, ease: "power2.inOut", onUpdate: function () { percent.textContent = Math.round(count.value) + "%"; } })
          .to(".loader-progress span", { width: "100%", duration: duration, ease: "power2.inOut" }, 0)
          .to(".loader-orbit", { rotation: 75, scale: 1.07, duration: duration, ease: "power2.inOut" }, 0)
          .to(".loader-copy", { y: -16, opacity: 0, duration: .32, ease: "power2.in" })
          .to(loader, { yPercent: -100, duration: .72, ease: "power4.inOut" }, "-=.1");
      });
    }
  };
})(window);
