(function (window) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  Portfolio.Contact = {
    init() {
      const form = document.querySelector("#contactForm");
      if (!form) return;

      form.querySelectorAll("input, textarea, select").forEach(function (field) {
        field.addEventListener("blur", function () { Portfolio.Contact.validateField(field); });
        field.addEventListener("input", function () { if (field.classList.contains("is-invalid")) Portfolio.Contact.validateField(field); });
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const fields = Array.from(form.querySelectorAll("input[required], textarea[required], select[required]"));
        const valid = fields.map(Portfolio.Contact.validateField).every(Boolean);
        const status = form.querySelector(".form-status");
        if (!valid) {
          status.className = "form-status error";
          status.textContent = "Please review the highlighted fields.";
          const firstInvalid = form.querySelector(".is-invalid, input:invalid");
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        const data = new FormData(form);
        const subject = encodeURIComponent("Portfolio enquiry: " + data.get("projectType"));
        const body = encodeURIComponent([
          "Name: " + data.get("name"),
          "Email: " + data.get("email"),
          "Company: " + (data.get("company") || "Not provided"),
          "Service: " + data.get("projectType"),
          "",
          data.get("message")
        ].join("\n"));

        status.className = "form-status success";
        status.textContent = "Thanks — your email app is opening with the enquiry ready to send.";
        window.location.href = "mailto:" + Portfolio.config.email + "?subject=" + subject + "&body=" + body;
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
