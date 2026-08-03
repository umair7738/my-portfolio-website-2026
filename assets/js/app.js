(function (window, $) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  function boot() {
    Portfolio.loadComponents()
      .then(function () {
        Portfolio.hydrateGlobalContent();
        Portfolio.Projects.init();
        Portfolio.utils.refreshIcons();
        Portfolio.Navigation.init();
        Portfolio.Contact.init();
        return Portfolio.Loader.play();
      })
      .then(function () {
        Portfolio.Animations.init();
        Portfolio.utils.refreshIcons();
        window.dispatchEvent(new CustomEvent("portfolio:ready"));
      })
      .catch(function () {
        document.body.classList.remove("loading");
        document.documentElement.classList.add("motion-ready");
        const loader = document.querySelector(".page-loader");
        if (loader) loader.remove();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})(window, window.jQuery);
