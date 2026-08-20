(function (window) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};
  let emailJsPromise;

  function loadEmailJs() {
    if (window.emailjs) return Promise.resolve(window.emailjs);
    if (emailJsPromise) return emailJsPromise;
    emailJsPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      script.async = true;
      script.onload = function () { resolve(window.emailjs); };
      script.onerror = function () { reject(new Error("EmailJS could not be loaded.")); };
      document.head.append(script);
    });
    return emailJsPromise;
  }

  Portfolio.Contact = {
    init(root) {
      const scope = root || document;
      const form = scope.querySelector("#contactForm");
      if (!form) return;

      form.querySelectorAll("input, textarea, select").forEach(function (field) {
        Portfolio.Lifecycle.page.listen(field, "blur", function () { Portfolio.Contact.validateField(field); });
        Portfolio.Lifecycle.page.listen(field, "input", function () { if (field.classList.contains("is-invalid")) Portfolio.Contact.validateField(field); });
        Portfolio.Lifecycle.page.listen(field, "focus", function () {
          const group = field.closest("[class*='col-']");
          if (group) group.classList.add("field-active");
        });
        Portfolio.Lifecycle.page.listen(field, "blur", function () {
          const group = field.closest("[class*='col-']");
          if (group) group.classList.remove("field-active");
        });
      });

      Portfolio.Lifecycle.page.listen(form, "submit", async function (event) {
        event.preventDefault();
        const fields = Array.from(form.querySelectorAll("input[required], textarea[required], select[required]"));
        const valid = fields.map(Portfolio.Contact.validateField).every(Boolean);
        const status = form.querySelector(".form-status");
        if (!valid) {
          status.className = "form-status error";
          status.textContent = "Please review the highlighted fields.";
          const firstInvalid = form.querySelector(".is-invalid, input:invalid");
          if (window.gsap && !Portfolio.utils.prefersReducedMotion()) {
            window.gsap.fromTo(form.querySelectorAll(".is-invalid"), { x: -5 }, { x: 0, duration: .38, ease: "elastic.out(1,.3)", stagger: .04 });
          }
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        const config = Portfolio.config.emailjs || {};
        const configured = config.publicKey && config.serviceId && config.templateId &&
          !/^YOUR_EMAILJS_/.test(config.publicKey) && !/^YOUR_EMAILJS_/.test(config.serviceId) && !/^YOUR_EMAILJS_/.test(config.templateId);
        if (!configured) {
          status.className = "form-status error";
          status.textContent = "Email delivery is not configured yet. Please contact me directly by email.";
          return;
        }
        const submit = form.querySelector("button[type='submit']");
        if (submit) submit.disabled = true;
        status.className = "form-status";
        status.textContent = "Sending your enquiry…";
        try {
          const emailjs = await loadEmailJs();
          emailjs.init({ publicKey: config.publicKey });
          await emailjs.sendForm(config.serviceId, config.templateId, form);
          status.className = "form-status success";
          status.textContent = "Thanks — your enquiry has been sent. I’ll get back to you soon.";
          form.reset();
        } catch (_error) {
          status.className = "form-status error";
          status.textContent = "The enquiry could not be sent. Please email me directly instead.";
        } finally {
          if (submit) submit.disabled = false;
        }
        if (window.gsap && !Portfolio.utils.prefersReducedMotion()) window.gsap.fromTo(status, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: "power2.out" });
      });
    },

    validateField(field) {
      const valid = field.checkValidity();
      field.classList.toggle("is-invalid", !valid);
      field.setAttribute("aria-invalid", String(!valid));
      return valid;
    }
  };
})(window);
