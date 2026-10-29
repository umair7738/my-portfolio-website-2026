(function (window) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};
  const knownPages = new Set(["/", "/index", "/index.html", "/about", "/about.html", "/projects", "/projects.html", "/case-studies", "/case-studies.html", "/services", "/services.html", "/wordpress-developer-mumbai.html", "/laravel-crm-development.html", "/skills", "/skills.html", "/experience", "/experience.html", "/contact", "/contact.html", "/privacy", "/privacy.html"]);

  function pathIsKnown(url) {
    return knownPages.has(new URL(url, window.location.href).pathname);
  }

  function shouldPrevent(element) {
    if (!element || !element.href) return true;
    if (element.target === "_blank" || element.hasAttribute("download")) return true;
    let url;
    try { url = new URL(element.href, window.location.href); } catch (_error) { return true; }
    if (url.origin !== window.location.origin) return true;
    if (["mailto:", "tel:", "javascript:"].includes(url.protocol)) return true;
    if (url.pathname === window.location.pathname && url.hash) return true;
    return !pathIsKnown(url.href);
  }

  function updateScrollPosition() {
    if (window.portfolioLenis && typeof window.portfolioLenis.scrollTo === "function") {
      window.portfolioLenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }

    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        window.setTimeout(function () {
          if (window.portfolioLenis && typeof window.portfolioLenis.scrollTo === "function") window.portfolioLenis.scrollTo(target, { offset: -90, duration: 1.1 });
          else target.scrollIntoView({ behavior: "smooth" });
        }, 0);
      }
    }
  }

  // Reveal triggers calculate their initial state during page mount. Resetting
  // after mount means a page entered from a deep scroll position can leave its
  // reveal elements at opacity: 0 until a later scroll event. Do this first;
  // the regular helper below still handles Lenis and hash targets afterwards.
  function resetScrollBeforeMount() {
    window.scrollTo(0, 0);
  }

  // Barba keeps the outgoing container in the document until the transition
  // completes. Refreshing during mount records offsets against both pages and
  // leaves new reveal elements hidden on a subsequent visit.
  function refreshPageLayout(container) {
    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = window.requestAnimationFrame(function () {
      secondFrame = window.requestAnimationFrame(function () {
        Portfolio.utils.refreshIcons(container || document.querySelector("[data-barba='container']"));
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
          window.ScrollTrigger.update();
        }
      });
    });
    Portfolio.Lifecycle.page.register(function () {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    });
  }

  Portfolio.Analytics = Portfolio.Analytics || {};
  Portfolio.Analytics.trackPageView = function () {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: window.location.pathname,
      page_title: document.title
    });
  };
  Portfolio.Analytics.trackEvent = function (eventName, parameters) {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", eventName, Object.assign({
      page_path: window.location.pathname
    }, parameters || {}));
  };
  Portfolio.Analytics.enable = function () {
    if (typeof window.gtag !== "function") {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", "G-6J1PG2GSNQ", { send_page_view: false, anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
      if (!document.querySelector("script[data-portfolio-analytics]")) {
        const script = document.createElement("script");
        script.async = true;
        script.dataset.portfolioAnalytics = "true";
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-6J1PG2GSNQ";
        document.head.append(script);
      }
    }
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    this.trackPageView();
  };
  Portfolio.Analytics.initConsent = function () {
    const banner = document.querySelector("[data-analytics-consent]");
    if (!banner) return;
    let consent = null;
    try { consent = window.localStorage.getItem("portfolio-analytics-consent"); } catch (_error) {}
    if (!consent) banner.hidden = false;
    const accept = banner.querySelector("[data-analytics-consent-action='accept']");
    const decline = banner.querySelector("[data-analytics-consent-action='decline']");
    if (accept) Portfolio.Lifecycle.global.listen(accept, "click", function () {
      try { window.localStorage.setItem("portfolio-analytics-consent", "granted"); } catch (_error) {}
      banner.hidden = true;
      Portfolio.Analytics.enable();
    });
    if (decline) Portfolio.Lifecycle.global.listen(decline, "click", function () {
      try { window.localStorage.setItem("portfolio-analytics-consent", "denied"); } catch (_error) {}
      banner.hidden = true;
    });
  };
  Portfolio.Analytics.initGlobal = function () {
    if (this.started) return;
    this.started = true;
    this.initConsent();

    document.addEventListener("click", function (event) {
      const target = event.target instanceof Element ? event.target.closest("[data-analytics-event]") : null;
      if (target) Portfolio.Analytics.trackEvent(target.dataset.analyticsEvent);
    });
  };

  Portfolio.Page = {
    remountAfterLocale() {
      const root = document.querySelector("[data-barba='container']");
      if (!root) return;
      Portfolio.Lifecycle.page.teardown();
      Portfolio.Lifecycle.resetPage();
      Portfolio.Lifecycle.page.setRoot(root);
      if (Portfolio.Projects) {
        Portfolio.Projects.refreshSearchIndex(root);
        Portfolio.Projects.initFilters(root);
      }
      if (Portfolio.Navigation) Portfolio.Navigation.initPage(root);
      if (Portfolio.Contact) Portfolio.Contact.init(root);
      if (Portfolio.Animations) Portfolio.Animations.init(root);
      Portfolio.utils.refreshIcons(root);
      if (window.ScrollTrigger) window.requestAnimationFrame(function () { window.ScrollTrigger.refresh(); });
    },
    syncHead(nextHtml, namespace) {
      if (!nextHtml) return;
      const nextDocument = new DOMParser().parseFromString(nextHtml, "text/html");
      const nextTitle = nextDocument.querySelector("title");
      if (nextTitle) document.title = nextTitle.textContent;

      const copyHeadValue = function (selector, attribute) {
        const incoming = nextDocument.head.querySelector(selector);
        if (!incoming) return;
        let current = document.head.querySelector(selector);
        if (!current) {
          current = incoming.cloneNode(true);
          document.head.append(current);
        }
        current.setAttribute(attribute, incoming.getAttribute(attribute) || "");
      };
      copyHeadValue("meta[name='description']", "content");
      copyHeadValue("meta[name='robots']", "content");
      copyHeadValue("link[rel='canonical']", "href");
      Array.from(nextDocument.head.querySelectorAll("meta[property^='og:']")).forEach(function (incoming) {
        copyHeadValue("meta[property='" + incoming.getAttribute("property") + "']", "content");
      });
      Array.from(nextDocument.head.querySelectorAll("meta[name^='twitter:']")).forEach(function (incoming) {
        copyHeadValue("meta[name='" + incoming.getAttribute("name") + "']", "content");
      });
      document.head.querySelectorAll("script[type='application/ld+json']").forEach(function (node) { node.remove(); });
      nextDocument.head.querySelectorAll("script[type='application/ld+json']").forEach(function (node) {
        document.head.append(node.cloneNode(true));
      });

      const nextPage = namespace || (nextDocument.body && nextDocument.body.dataset.page) || "home";
      document.body.dataset.page = nextPage;
      if (Portfolio.Navigation && typeof Portfolio.Navigation.setActiveLink === "function") Portfolio.Navigation.setActiveLink(nextPage);
    },

    async mount(container, options) {
      const config = options || {};
      const root = container || document;
      Portfolio.Lifecycle.page.setRoot(root);
      if (!config.initial) await Portfolio.loadComponents(root);
      Portfolio.hydrateGlobalContent(root);
      if (Portfolio.Projects) Portfolio.Projects.init(root);
      if (Portfolio.I18n) await Portfolio.I18n.applyToPage(root);
      if (Portfolio.Navigation && typeof Portfolio.Navigation.initPage === "function") Portfolio.Navigation.initPage(root);
      if (Portfolio.Contact) Portfolio.Contact.init(root);

      // CUSTOM PAGE INITIALIZER:
      // Add page-specific plugins here. Track every instance so beforeLeave can destroy it:
      // const swiper = new Swiper(root.querySelector(".slider"), options);
      // Portfolio.Lifecycle.page.track(swiper);
      // CUSTOM CLEANUP:
      // Portfolio.Lifecycle.page.register(() => observer.disconnect());

      if (config.initial && Portfolio.Loader) await Portfolio.Loader.play();
      if (Portfolio.Animations) Portfolio.Animations.init(root);
      Portfolio.utils.refreshIcons(root);
      window.dispatchEvent(new CustomEvent("portfolio:ready", { detail: { container: root } }));
    }
  };

  Portfolio.Router = {
    init() {
      if (this.started) return;
      this.started = true;
      Portfolio.Analytics.initGlobal();

      const container = document.querySelector("[data-barba='container']") || document.querySelector("main");
      if (!window.barba) {
        resetScrollBeforeMount();
        Portfolio.Page.mount(container, { initial: true });
        return;
      }

      const gsap = window.gsap;
      window.barba.init({
        prevent: function (data) { return shouldPrevent(data.el); },
        transitions: [{
          name: "portfolio-page",
          sync: false,

          once: function (data) {
            if (!data.next.container) return Promise.reject(new Error("Barba initial container is missing."));
            resetScrollBeforeMount();
            return Portfolio.Page.mount(data.next.container, { initial: true });
          },

          beforeLeave: function () {
            Portfolio.Lifecycle.page.teardown();
            Portfolio.Lifecycle.resetPage();
          },

          leave: function (data) {
            if (!gsap) return Promise.resolve();
            return gsap.to(data.current.container, { autoAlpha: 0, y: -18, duration: .34, ease: "power2.in", clearProps: "transform" });
          },

          beforeEnter: function (data) {
            if (!data.next.container || !data.next.html) {
              window.location.assign(data.next.url && data.next.url.href ? data.next.url.href : window.location.href);
              return;
            }
            Portfolio.Page.syncHead(data.next.html, data.next.namespace);
          },

          enter: async function (data) {
            if (!data.next.container) {
              window.location.assign(data.next.url && data.next.url.href ? data.next.url.href : window.location.href);
              return;
            }
            resetScrollBeforeMount();
            await Portfolio.Page.mount(data.next.container, { initial: false });
            if (!gsap) return;
            return gsap.fromTo(data.next.container, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .56, ease: "power3.out", clearProps: "opacity,visibility,transform" });
          },

          afterEnter: function () {
            updateScrollPosition();
            refreshPageLayout(document.querySelector("[data-barba='container']"));
            Portfolio.Analytics.trackPageView();
          },

          afterOnce: function () {
            refreshPageLayout(document.querySelector("[data-barba='container']"));
            Portfolio.Analytics.trackPageView();
          }
        }]
      });

      if (window.barba.hooks && typeof window.barba.hooks.requestError === "function") {
        window.barba.hooks.requestError(function (_trigger, _action, url) {
          window.location.assign(url);
        });
      }
    }
  };
})(window);
