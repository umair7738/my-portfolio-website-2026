(function (window) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};
  const STORAGE_KEY = "portfolio-locale";
  const PROVIDER_KEY = "portfolio-locale-provider";
  const googleCodes = {
    "hi-IN": "hi", "ar-AE": "ar", "es-ES": "es", "fr-FR": "fr", "de-DE": "de", "pt-BR": "pt",
    "it-IT": "it", "nl-NL": "nl", "pl-PL": "pl", "tr-TR": "tr", "ru-RU": "ru", "zh-CN": "zh-CN",
    "ja-JP": "ja", "ko-KR": "ko", "id-ID": "id", "vi-VN": "vi", "th-TH": "th", "bn-BD": "bn", "ur-PK": "ur"
  };
  const SKIP_SELECTOR = "script, style, template, noscript, svg, [data-i18n-ignore], [contenteditable], [data-language-list]";
  const locales = [
    { code: "en-IN", flag: "🇮🇳", country: "India", language: "English", native: "English", dir: "ltr" },
    { code: "hi-IN", flag: "🇮🇳", country: "India", language: "Hindi", native: "हिन्दी", dir: "ltr" },
    { code: "ar-AE", flag: "🇦🇪", country: "United Arab Emirates", language: "Arabic", native: "العربية", dir: "rtl" },
    { code: "es-ES", flag: "🇪🇸", country: "Spain", language: "Spanish", native: "Español", dir: "ltr" },
    { code: "fr-FR", flag: "🇫🇷", country: "France", language: "French", native: "Français", dir: "ltr" },
    { code: "de-DE", flag: "🇩🇪", country: "Germany", language: "German", native: "Deutsch", dir: "ltr" },
    { code: "pt-BR", flag: "🇧🇷", country: "Brazil", language: "Portuguese", native: "Português", dir: "ltr" },
    { code: "it-IT", flag: "🇮🇹", country: "Italy", language: "Italian", native: "Italiano", dir: "ltr" },
    { code: "nl-NL", flag: "🇳🇱", country: "Netherlands", language: "Dutch", native: "Nederlands", dir: "ltr" },
    { code: "pl-PL", flag: "🇵🇱", country: "Poland", language: "Polish", native: "Polski", dir: "ltr" },
    { code: "tr-TR", flag: "🇹🇷", country: "Turkey", language: "Turkish", native: "Türkçe", dir: "ltr" },
    { code: "ru-RU", flag: "🇷🇺", country: "Russia", language: "Russian", native: "Русский", dir: "ltr" },
    { code: "zh-CN", flag: "🇨🇳", country: "China", language: "Chinese", native: "简体中文", dir: "ltr" },
    { code: "ja-JP", flag: "🇯🇵", country: "Japan", language: "Japanese", native: "日本語", dir: "ltr" },
    { code: "ko-KR", flag: "🇰🇷", country: "South Korea", language: "Korean", native: "한국어", dir: "ltr" },
    { code: "id-ID", flag: "🇮🇩", country: "Indonesia", language: "Indonesian", native: "Bahasa Indonesia", dir: "ltr" },
    { code: "vi-VN", flag: "🇻🇳", country: "Vietnam", language: "Vietnamese", native: "Tiếng Việt", dir: "ltr" },
    { code: "th-TH", flag: "🇹🇭", country: "Thailand", language: "Thai", native: "ไทย", dir: "ltr" },
    { code: "bn-BD", flag: "🇧🇩", country: "Bangladesh", language: "Bengali", native: "বাংলা", dir: "ltr" },
    { code: "ur-PK", flag: "🇵🇰", country: "Pakistan", language: "Urdu", native: "اردو", dir: "rtl" }
  ];
  const originalText = new WeakMap();
  const sourceText = new WeakMap();
  const bundles = new Map();
  let manifestPromise;
  let referencePromise;
  let requestId = 0;
  let activeCode = "en-IN";
  let activeBundle = null;
  let pending = null;
  let googleProviderActive = false;
  const googleFallbackEnabled = true;
  let googleScriptPromise;

  function localeFor(code) { return locales.find(function (item) { return item.code === code; }); }
  function googleCodeFor(code) { return googleCodes[code] || ""; }
  function setGoogleCookie(code) {
    const target = googleCodeFor(code);
    if (!target) document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    else document.cookie = "googtrans=/en/" + target + "; path=/";
  }
  function googleSelect() { return document.querySelector(".goog-te-combo"); }
  function loadGoogleTranslate() {
    if (window.google && window.google.translate && window.google.translate.TranslateElement) return Promise.resolve();
    if (googleScriptPromise) return googleScriptPromise;
    googleScriptPromise = new Promise(function (resolve, reject) {
      window.PortfolioGoogleTranslateInit = function () {
        try {
          new window.google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: Object.keys(googleCodes).map(googleCodeFor).join(","), autoDisplay: false }, "google_translate_element");
          resolve();
        } catch (error) { reject(error); }
      };
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=PortfolioGoogleTranslateInit";
      script.async = true;
      script.onerror = function () { reject(new Error("Google Translate could not be loaded.")); };
      document.head.appendChild(script);
    });
    return googleScriptPromise;
  }
  async function chooseGoogleLanguage(code) {
    await loadGoogleTranslate();
    let select = googleSelect();
    if (!select) {
      await new Promise(function (resolve) { window.setTimeout(resolve, 120); });
      select = googleSelect();
    }
    if (!select) throw new Error("Google Translate is unavailable right now.");
    setGoogleCookie(code);
    select.value = googleCodeFor(code);
    select.dispatchEvent(new Event("change"));
  }
  function flagImage(code) {
    const flag = document.createElement("span");
    flag.className = "language-flag-art";
    flag.style.backgroundImage = "url('assets/flags/" + code.split("-")[1].toLowerCase() + ".svg')";
    return flag;
  }
  function isSkipped(element) { return !!(element && element.closest(SKIP_SELECTOR)); }
  function withOriginalSpacing(source, translated) {
    const match = source.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return match[1] + translated + match[3];
  }
  function loadJson(url) {
    return window.fetch(url, { credentials: "same-origin" }).then(function (response) {
      if (!response.ok) throw new Error("Translation file unavailable: " + url);
      return response.json();
    });
  }
  function manifest() {
    if (!manifestPromise) manifestPromise = loadJson("assets/i18n/manifest.json").then(function (data) {
      if (!data || !Array.isArray(data.ready) || !data.ready.includes("en-IN")) throw new Error("Invalid translation manifest.");
      return new Set(data.ready);
    }).catch(function () { return new Set(["en-IN"]); });
    return manifestPromise;
  }
  function reference() {
    if (!referencePromise) referencePromise = loadJson("assets/i18n/en.json").then(function (data) {
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid English translation catalog.");
      return data;
    });
    return referencePromise;
  }
  function validateBundle(code, data, english) {
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid " + code + " translation.");
    const expected = Object.keys(english);
    if (Object.keys(data).length !== expected.length) throw new Error("Incomplete " + code + " translation.");
    expected.forEach(function (phrase) {
      if (typeof data[phrase] !== "string" || !data[phrase].trim()) throw new Error("Missing " + code + " translation: " + phrase);
    });
    return data;
  }
  function bundleFor(code) {
    if (code === "en-IN") return reference();
    if (bundles.has(code)) return Promise.resolve(bundles.get(code));
    return Promise.all([reference(), loadJson("assets/i18n/" + code + ".json")]).then(function (results) {
      const data = validateBundle(code, results[1], results[0]);
      bundles.set(code, data);
      return data;
    });
  }
  function translatedValue(translationKey, bundle) {
    const value = bundle[translationKey];
    if (typeof value !== "string" || !value.trim()) throw new Error("Missing visible translation: " + translationKey);
    return value;
  }
  function parseKeyMap(value) {
    return String(value || "").split(";").filter(Boolean).map(function (pair) {
      const split = pair.indexOf(":");
      return [pair.slice(0, split), pair.slice(split + 1)];
    });
  }
  function keyedTextNodes(element) {
    const nodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const owner = node.parentElement && node.parentElement.closest("[data-i18n-text]");
      if (owner === element && /\p{L}/u.test(node.nodeValue)) nodes.push(node);
    }
    return nodes;
  }
  function collect(root, bundle) {
    const operations = [];
    const scope = root || document;
    const elements = scope.querySelectorAll ? scope.querySelectorAll("[data-i18n-text], [data-i18n-attrs]") : [];
    elements.forEach(function (element) {
      if (isSkipped(element)) return;
      if (element.hasAttribute("data-split") && element.hasAttribute("data-i18n-text")) {
        const entries = parseKeyMap(element.dataset.i18nText);
        if (entries.length !== 1 || entries[0][0] !== "0") throw new Error("Animated text needs one translation key.");
        operations.push({ splitElement: element, value: translatedValue(entries[0][1], bundle) });
      } else {
      const textNodes = keyedTextNodes(element);
      if (!sourceText.has(element)) sourceText.set(element, textNodes.map(function (node) { return originalText.get(node) || node.nodeValue; }));
      const sourceValues = sourceText.get(element) || [];
      parseKeyMap(element.dataset.i18nText).forEach(function (entry) {
        const node = textNodes[Number(entry[0])];
        if (!node) throw new Error("Translation source node missing: " + entry[1]);
        const source = sourceValues[Number(entry[0])] || originalText.get(node) || node.nodeValue;
        if (!originalText.has(node)) originalText.set(node, source);
        operations.push({ node: node, value: withOriginalSpacing(source, translatedValue(entry[1], bundle)) });
      });
      }
      parseKeyMap(element.dataset.i18nAttrs).forEach(function (entry) {
        if (!element.hasAttribute(entry[0])) throw new Error("Translation source attribute missing: " + entry[1]);
        operations.push({ element: element, name: entry[0], value: translatedValue(entry[1], bundle) });
      });
    });
    return operations;
  }
  function commit(operations, code, bundle) {
    operations.forEach(function (operation) {
      if (operation.node) operation.node.nodeValue = operation.value;
      else if (operation.splitElement) { operation.splitElement.textContent = operation.value; delete operation.splitElement.dataset.splitReady; }
      else operation.element.setAttribute(operation.name, operation.value);
    });
    activeCode = code;
    activeBundle = bundle;
    googleProviderActive = false;
    const locale = localeFor(code);
    document.documentElement.lang = code;
    document.documentElement.dir = locale.dir;
    document.documentElement.dataset.locale = code;
  }
  function applyCurrent(root) {
    if (activeCode === "en-IN" || !activeBundle) return;
    const operations = collect(root, activeBundle);
    operations.forEach(function (operation) {
      if (operation.node) operation.node.nodeValue = operation.value;
      else if (operation.splitElement) { operation.splitElement.textContent = operation.value; delete operation.splitElement.dataset.splitReady; }
      else operation.element.setAttribute(operation.name, operation.value);
    });
  }

  Portfolio.I18n = {
    locales: locales,
    get code() { return activeCode; },
    get pending() { return pending; },
    get googleFallbackEnabled() { return googleFallbackEnabled; },
    async readyLocales() { return manifest(); },
    t(translationKey, fallback) { return activeBundle ? translatedValue(translationKey, activeBundle) : fallback; },
    format(translationKey, fallback, values) {
      const source = this.t(translationKey, fallback);
      return source.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, function (match, name) {
        return Object.prototype.hasOwnProperty.call(values || {}, name) ? String(values[name]) : match;
      });
    },
    async init() {
      document.documentElement.lang = "en-IN";
      document.documentElement.dir = "ltr";
      document.documentElement.dataset.locale = "en-IN";
      let saved = "en-IN";
      let savedProvider = "local";
      try {
        saved = window.localStorage.getItem(STORAGE_KEY) || "en-IN";
        savedProvider = window.localStorage.getItem(PROVIDER_KEY) || "local";
      } catch (_error) {}
      if (saved !== "en-IN" && localeFor(saved)) {
        const ready = await manifest();
        if (ready.has(saved)) {
          try { await this.setLocale(saved, { save: false }); }
          catch (_error) {
            try { window.localStorage.removeItem(STORAGE_KEY); } catch (_storageError) {}
            this.showError("Saved language could not be loaded. English is shown.");
          }
        } else if (savedProvider === "google" && googleCodeFor(saved)) {
          try { await this.setGoogleLocale(saved, { save: false }); }
          catch (_error) {
            try { window.localStorage.removeItem(STORAGE_KEY); window.localStorage.removeItem(PROVIDER_KEY); } catch (_storageError) {}
            this.showError("Saved Google translation could not be loaded. English is shown.");
          }
        } else {
          try { window.localStorage.removeItem(STORAGE_KEY); } catch (_error) {}
        }
      } else if (saved !== "en-IN") {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch (_error) {}
      }
      this.initPicker();
    },
    async setGoogleLocale(code, options) {
      const id = ++requestId;
      const locale = localeFor(code);
      if (!locale || !googleCodeFor(code)) throw new Error("Google Translate does not support this language.");
      const run = (async function () {
        await chooseGoogleLanguage(code);
        if (id !== requestId) return false;
        googleProviderActive = true;
        activeCode = code;
        activeBundle = null;
        document.documentElement.lang = code;
        document.documentElement.dir = locale.dir;
        document.documentElement.dataset.locale = code;
        if (!options || options.save !== false) {
          try { window.localStorage.setItem(STORAGE_KEY, code); window.localStorage.setItem(PROVIDER_KEY, "google"); } catch (_error) {}
        }
        window.dispatchEvent(new CustomEvent("portfolio:localechange", { detail: { code: code, provider: "google" } }));
        return true;
      })();
      pending = run;
      try { return await run; }
      finally { if (pending === run) pending = null; }
    },
    async setLocale(code, options) {
      const id = ++requestId;
      const run = (async function () {
        const locale = localeFor(code);
        if (!locale) throw new Error("Unknown language.");
        const ready = await manifest();
        if (!ready.has(code)) {
          if (googleFallbackEnabled && googleCodeFor(code)) return await Portfolio.I18n.setGoogleLocale(code, options);
          throw new Error(locale.language + " translation is not complete yet.");
        }
        const bundle = code === "en-IN" ? await reference() : await bundleFor(code);
        if (id !== requestId) return false;
        const operations = collect(document.body, bundle);
        if (id !== requestId) return false;
        const previousCode = activeCode;
        const previousBundle = activeBundle || await reference();
        const remount = Portfolio.Router && Portfolio.Router.started && Portfolio.Page && Portfolio.Page.remountAfterLocale;
        document.documentElement.classList.add("locale-switching");
        try {
          if (remount) Portfolio.Lifecycle.page.teardown();
          commit(operations, code, bundle);
          if (remount) Portfolio.Page.remountAfterLocale();
          if (!options || options.save !== false) {
            try { window.localStorage.setItem(STORAGE_KEY, code); window.localStorage.setItem(PROVIDER_KEY, "local"); } catch (_error) {}
          }
          if (code === "en-IN") {
            setGoogleCookie(code);
            const select = googleSelect();
            if (select) { select.value = ""; select.dispatchEvent(new Event("change")); }
          }
          window.dispatchEvent(new CustomEvent("portfolio:localechange", { detail: { code: code } }));
        } catch (error) {
          commit(collect(document.body, previousBundle), previousCode, previousBundle);
          if (remount) Portfolio.Page.remountAfterLocale();
          throw error;
        } finally { document.documentElement.classList.remove("locale-switching"); }
        return true;
      })();
      pending = run;
      try { return await run; }
      finally { if (pending === run) pending = null; }
    },
    async applyToPage(root) {
      if (pending) { try { await pending; } catch (_error) {} }
      if (googleProviderActive) {
        try { await chooseGoogleLanguage(activeCode); } catch (_error) {}
        return;
      }
      try { applyCurrent(root); }
      catch (_error) { await this.setLocale("en-IN"); }
    },
    showError(message) {
      const status = document.querySelector("[data-language-status]");
      if (status) status.textContent = message;
    },
    async initPicker() {
      const picker = document.querySelector("[data-language-picker]");
      if (!picker) return;
      const trigger = picker.querySelector("[data-language-trigger]");
      const panel = picker.querySelector("[data-language-panel]");
      const search = picker.querySelector("[data-language-search]");
      const list = picker.querySelector("[data-language-list]");
      const ready = await manifest();
      trigger.disabled = false;
      const self = this;
      let filtered = [];
      let activeIndex = 0;
      function setPageScrollPaused(paused) {
        if (!window.portfolioLenis) return;
        if (paused && typeof window.portfolioLenis.stop === "function") window.portfolioLenis.stop();
        if (!paused && typeof window.portfolioLenis.start === "function") window.portfolioLenis.start();
      }
      function close() {
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("language-panel-open");
        document.body.classList.remove("language-panel-open");
        picker.closest(".site-header")?.classList.remove("is-language-open");
        setPageScrollPaused(false);
      }
      function render(query) {
        const term = query.trim().toLocaleLowerCase();
        filtered = locales.filter(function (item) {
          return (item.country + " " + item.language + " " + item.native + " " + item.code).toLocaleLowerCase().includes(term);
        });
        list.replaceChildren();
        filtered.forEach(function (item) {
          const option = document.createElement("button");
          option.type = "button";
          option.className = "language-option";
          option.setAttribute("role", "option");
          option.setAttribute("aria-selected", String(item.code === activeCode));
          option.disabled = !ready.has(item.code) && !googleFallbackEnabled;
          option.dataset.languageCode = item.code;
          const flag = document.createElement("span"); flag.className = "language-flag"; flag.append(flagImage(item.code));
          const label = document.createElement("span"); label.className = "language-option-label";
          const country = document.createElement("strong"); country.textContent = item.country;
          const language = document.createElement("small"); language.textContent = item.native + " · " + item.language;
          label.append(country, language);
          option.append(flag, label);
          list.append(option);
        });
        activeIndex = Math.max(0, filtered.findIndex(function (item) { return ready.has(item.code) || googleFallbackEnabled; }));
      }
      function syncTrigger() {
        const locale = localeFor(activeCode);
        picker.querySelector("[data-language-flag]").replaceChildren(flagImage(locale.code));
        picker.querySelector("[data-language-country]").textContent = locale.country;
        render(search.value);
      }
      function focusOption(index) {
        const enabled = Array.from(list.querySelectorAll(".language-option:not(:disabled)"));
        if (!enabled.length) return;
        activeIndex = (index + enabled.length) % enabled.length;
        enabled[activeIndex].focus();
      }
      trigger.addEventListener("click", function () {
        const opening = panel.hidden;
        panel.hidden = !opening;
        trigger.setAttribute("aria-expanded", String(opening));
        document.documentElement.classList.toggle("language-panel-open", opening);
        document.body.classList.toggle("language-panel-open", opening);
        picker.closest(".site-header")?.classList.toggle("is-language-open", opening);
        setPageScrollPaused(opening);
        if (opening) { search.value = ""; render(""); search.focus(); }
      });
      search.addEventListener("input", function () { render(search.value); });
      picker.addEventListener("keydown", function (event) {
        if (event.key === "Escape") { close(); trigger.focus(); return; }
        if (panel.hidden) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const enabled = Array.from(list.querySelectorAll(".language-option:not(:disabled)"));
          const current = enabled.indexOf(document.activeElement);
          focusOption(current + (event.key === "ArrowDown" ? 1 : -1));
        }
      });
      function containScroll(event) {
        if (panel.hidden) return;
        const target = event.target instanceof Element ? event.target : null;
        const insideList = !!(target && target.closest("[data-language-list]"));
        event.stopPropagation();
        if (!insideList) event.preventDefault();
      }
      document.addEventListener("wheel", containScroll, { capture: true, passive: false });
      document.addEventListener("touchmove", containScroll, { capture: true, passive: false });
      list.addEventListener("click", async function (event) {
        const option = event.target.closest("[data-language-code]");
        if (!option || option.disabled) return;
        self.showError("");
        trigger.disabled = true;
        try {
          if (await self.setLocale(option.dataset.languageCode)) close();
        } catch (error) { self.showError(error.message); }
        finally { trigger.disabled = false; syncTrigger(); }
      });
      document.addEventListener("pointerdown", function (event) { if (!picker.contains(event.target)) close(); });
      window.addEventListener("portfolio:localechange", syncTrigger);
      syncTrigger();
    }
  };
})(window);
