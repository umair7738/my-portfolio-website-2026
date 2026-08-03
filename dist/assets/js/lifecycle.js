(function (window, $) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  function createScope() {
    const cleanups = [];
    const instances = [];
    const contexts = [];
    let root = null;
    let tornDown = false;

    const scope = {
      register(cleanup) {
        if (typeof cleanup !== "function") return cleanup;
        if (tornDown) {
          cleanup();
          return cleanup;
        }
        cleanups.push(cleanup);
        return cleanup;
      },

      listen(target, eventName, handler, options) {
        if (!target || typeof target.addEventListener !== "function") return handler;
        target.addEventListener(eventName, handler, options);
        this.register(function () { target.removeEventListener(eventName, handler, options); });
        return handler;
      },

      jquery(target, events, selector, handler) {
        if (!$ || !target) return handler;
        const node = $(target);
        node.on(events, selector, handler);
        this.register(function () { node.off(events, selector, handler); });
        return handler;
      },

      track(instance, destroyOverride) {
        if (!instance) return instance;
        const destroy = destroyOverride || (typeof instance.destroy === "function" ? function () { instance.destroy(); } : null);
        if (!destroy) return instance;
        if (!tornDown) instances.push({ instance: instance, destroy: destroy });
        return instance;
      },

      context(context) {
        if (context && typeof context.revert === "function" && !tornDown) contexts.push(context);
        return context;
      },

      setRoot(nextRoot) {
        root = nextRoot || null;
        return root;
      },

      teardown() {
        if (tornDown) return;
        tornDown = true;

        // 1. Destroy active third-party instances and custom scroll systems first.
        instances.slice().reverse().forEach(function (record) {
          try { record.destroy(); } catch (_error) { /* One broken plugin must not block cleanup. */ }
        });

        // 2. Revert page-scoped GSAP contexts before triggers are killed.
        contexts.slice().reverse().forEach(function (context) {
          try { context.revert(); } catch (_error) { /* Continue cleanup if a context is already reverted. */ }
        });
        if (window.gsap && root) {
          const nodes = [root].concat(Array.from(root.querySelectorAll("*")));
          nodes.forEach(function (node) { window.gsap.killTweensOf(node); });
        }

        // 3. Kill every page trigger after page instances have stopped updating.
        if (window.ScrollTrigger && typeof window.ScrollTrigger.killAll === "function") {
          window.ScrollTrigger.killAll();
        }

        // 4. Remove listeners, delegated handlers, timers, RAF loops, and ticker callbacks.
        cleanups.slice().reverse().forEach(function (cleanup) {
          try { cleanup(); } catch (_error) { /* Continue removing the remaining handlers. */ }
        });

        // 5. Release all registry references.
        instances.length = 0;
        contexts.length = 0;
        cleanups.length = 0;
        root = null;
        // A failed plugin constructor must not leave the previous route's scroller behind.
        delete window.portfolioLenis;
      }
    };

    return scope;
  }

  Portfolio.Lifecycle = {
    page: createScope(),
    global: createScope(),

    resetPage() {
      this.page = createScope();
      return this.page;
    }
  };
})(window, window.jQuery);
