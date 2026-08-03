(function (window, $) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  function boot() {
    Portfolio.loadComponents()
      .then(function () {
        Portfolio.hydrateGlobalContent();
        Portfolio.Navigation.initGlobal();
        Portfolio.Router.init();
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
