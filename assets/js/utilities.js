(function (window, $) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  Portfolio.config = {
    email: "umairshaikh7738@gmail.com",
    phone: "+917738635355",
    whatsapp: "917738635355",
    linkedin: "https://www.linkedin.com/in/umair-shaikh-9b2054254",
    previousPortfolio: "https://umair7738portfolio.free.nf",
    github: "https://github.com/umair7738",
    codepen: "https://codepen.io/umair7738",
    emailjs: {
      publicKey: "jhbX9HU7sR6VIPo21",
      serviceId: "service_wvh291n",
      templateId: "template_1kcltr2"
    }
  };

  Portfolio.utils = {
    escapeHtml(value) {
      return String(value || "").replace(/[&<>'"]/g, function (char) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char];
      });
    },

    slugify(value) {
      return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    },

    prefersReducedMotion() {
      const preference = document.documentElement.dataset.motion;
      if (preference === "full") return false;
      if (preference === "reduced") return true;
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },

    refreshIcons(root) {
      if (window.lucide) {
        window.lucide.createIcons({ root: root || document, attrs: { "stroke-width": 1.7 } });
      }
    },

    splitCharacters(selector, root) {
      (root || document).querySelectorAll(selector).forEach(function (element) {
        if (element.dataset.splitReady) return;
        const label = element.textContent.trim();
        element.setAttribute("aria-label", label);
        element.innerHTML = Array.from(label).map(function (char) {
          const output = char === " " ? "&nbsp;" : Portfolio.utils.escapeHtml(char);
          return '<span class="char" aria-hidden="true">' + output + "</span>";
        }).join("");
        element.dataset.splitReady = "true";
      });
    },

    splitWords(selector, root) {
      (root || document).querySelectorAll(selector).forEach(function (element) {
        if (element.dataset.splitReady) return;
        const label = element.textContent.trim();
        element.setAttribute("aria-label", label);
        element.innerHTML = label.split(/\s+/).map(function (word) {
          return '<span class="word" aria-hidden="true"><span class="word-inner">' + Portfolio.utils.escapeHtml(word) + "</span></span>";
        }).join(" ");
        element.dataset.splitReady = "true";
      });
    },

    getQuery(name) {
      return new URLSearchParams(window.location.search).get(name);
    }
  };

  Portfolio.loadComponents = function (root) {
    const scope = root || document;
    const elements = Array.from(scope.querySelectorAll("[data-component]"));
    return Promise.all(elements.map(function (element) {
      const component = element.dataset.component;
      return new Promise(function (resolve) {
        $(element).load("components/" + component + ".html", function (_response, status) {
          if (status === "error") {
            element.innerHTML = "";
          }
          resolve();
        });
      });
    }));
  };

  Portfolio.hydrateGlobalContent = function (root) {
    const scope = root || document;
    scope.querySelectorAll("[data-current-year]").forEach(function (node) {
      node.textContent = new Date().getFullYear();
    });

    const service = Portfolio.utils.getQuery("service");
    const projectType = scope.querySelector("#projectType") || document.querySelector("#projectType");
    if (service && projectType) {
      const readable = service.replace(/-/g, " ");
      Array.from(projectType.options).some(function (option) {
        if (option.textContent.toLowerCase().includes(readable.toLowerCase())) {
          option.selected = true;
          return true;
        }
        return false;
      });
    }

    scope.querySelectorAll("[data-profile]").forEach(function (node) {
      const url = Portfolio.config[node.dataset.profile];
      if (!url) {
        node.hidden = true;
      } else {
        node.href = url;
      }
    });
  };
})(window, window.jQuery);
