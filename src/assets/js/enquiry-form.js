/**
 * Enquiry form: validation, spam checks and submission to the form service (Formspree by default).
 *
 * Settings come from data-* attributes on the <form>, which the build fills in from src/_data/site.js.
 * Nothing is saved in the browser. A success message appears ONLY when the form service confirms
 * it accepted the enquiry; every other outcome shows an error and keeps the visitor's answers.
 */
(function () {
  "use strict";

  var form = document.getElementById("enquiry-form");
  if (!form || !window.fetch || !window.FormData) return; // Without these, the form posts normally.

  var cfg = {
    endpoint: form.getAttribute("action"),
    configured: form.dataset.configured === "true",
    minFillMs: Number(form.dataset.minFillSeconds || 3) * 1000,
    timeoutMs: Number(form.dataset.timeoutSeconds || 20) * 1000,
    subject: form.dataset.subject || "New care enquiry",
    businessEmail: form.dataset.businessEmail || "",
  };

  var loadedAt = Date.now();
  var submitting = false;
  var attempted = false;

  var panel = form.parentElement;
  var statusBox = document.getElementById("form-status");
  var summary = document.getElementById("error-summary");
  var summaryList = summary.querySelector(".error-summary-list");
  var submitButton = form.querySelector(".submit-button");
  var submitLabel = submitButton.querySelector(".submit-label");
  var dateInput = form.elements.preferred_start_date;
  var message = form.elements.additional_information;
  var counter = document.getElementById("message-count");

  /* ---------------------------------------------------------------- helpers */

  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function value(name) {
    var field = form.elements.namedItem(name);
    return field && typeof field.value === "string" ? field.value.trim() : "";
  }

  function checkedValues(name) {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (input) { return input.value; });
  }

  function normalisePostcode(raw) {
    var compact = raw.replace(/\s+/g, "").toUpperCase();
    return compact.length > 3 ? compact.slice(0, -3) + " " + compact.slice(-3) : compact;
  }

  function formatDate(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    try {
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return iso;
    }
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function emailLink() {
    return el("a", { href: "mailto:" + cfg.businessEmail, text: cfg.businessEmail });
  }

  /* ------------------------------------------------------------- validation */

  var EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
  var POSTCODE_RE = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

  // Each rule: the field wrapper key, the element to focus, and a check that returns an error message or "".
  var rules = [
    {
      key: "full-name",
      focus: "full-name",
      check: function () {
        var v = value("name");
        if (!v) return "Enter your full name";
        if (v.length < 2) return "Full name must be at least 2 characters";
        if (v.length > 100) return "Full name must be 100 characters or fewer";
        return "";
      },
    },
    {
      key: "email",
      focus: "email",
      check: function () {
        var v = value("email");
        if (!v) return "Enter your email address";
        if (v.length > 254 || !EMAIL_RE.test(v)) return "Enter an email address in the correct format, like name@example.com";
        return "";
      },
    },
    {
      key: "postcode",
      focus: "postcode",
      check: function () {
        var v = value("postcode");
        if (!v) return "Enter the postcode where care would take place";
        if (!POSTCODE_RE.test(v.replace(/\s+/g, " "))) return "Enter a full UK postcode, like NE1 1AA";
        return "";
      },
    },
    {
      key: "care-for",
      focus: "care-for-1",
      check: function () {
        return checkedValues("who_requires_care").length ? "" : "Select who requires care";
      },
    },
    {
      key: "care-types",
      focus: "care-types-1",
      check: function () {
        return checkedValues("type_of_care").length ? "" : "Select at least one type of care, or choose ‘Not sure yet’";
      },
    },
    {
      key: "start-date",
      focus: "start-date",
      check: function () {
        if (dateInput.validity && dateInput.validity.badInput) return "Enter a real date, or leave the start date blank";
        var v = value("preferred_start_date");
        if (!v) return "";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(new Date(v).getTime())) return "Enter a real date, or leave the start date blank";
        if (v < todayISO()) return "Preferred start date must be today or in the future";
        return "";
      },
    },
    {
      key: "message",
      focus: "message",
      check: function () {
        var max = Number(message.getAttribute("maxlength")) || 1500;
        return message.value.length > max ? "Additional information must be " + max.toLocaleString("en-GB") + " characters or fewer" : "";
      },
    },
    {
      key: "consent",
      focus: "consent",
      check: function () {
        return form.elements.privacy_consent.checked ? "" : "Tick the box to agree to us using your information to reply to your enquiry";
      },
    },
  ];

  function showFieldError(rule, text) {
    var wrapper = form.querySelector('[data-field="' + rule.key + '"]');
    var slot = document.getElementById(rule.key + "-error");
    var controls = wrapper.querySelectorAll("input, textarea");
    wrapper.classList.toggle("has-error", Boolean(text));
    slot.textContent = "";
    if (text) {
      slot.appendChild(el("span", { class: "visually-hidden", text: "Error: " }));
      slot.appendChild(document.createTextNode(text));
      slot.hidden = false;
    } else {
      slot.hidden = true;
    }
    controls.forEach(function (control) {
      if (control.type === "radio" || control.type === "checkbox") {
        if (control.name !== "privacy_consent") return; // group errors are announced via the fieldset
      }
      if (text) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    });
  }

  function validateRule(rule) {
    var text = rule.check();
    showFieldError(rule, text);
    return text;
  }

  function validateAll() {
    var errors = [];
    rules.forEach(function (rule) {
      var text = validateRule(rule);
      if (text) errors.push({ rule: rule, text: text });
    });
    return errors;
  }

  function showSummary(errors) {
    summaryList.textContent = "";
    errors.forEach(function (error) {
      summaryList.appendChild(el("li", {}, [el("a", { href: "#" + error.rule.focus, "data-focus": error.rule.focus, text: error.text })]));
    });
    summary.hidden = false;
    summary.focus();
  }

  function hideSummary() {
    summary.hidden = true;
    summaryList.textContent = "";
  }

  summary.addEventListener("click", function (event) {
    var link = event.target.closest("a[data-focus]");
    if (!link) return;
    event.preventDefault();
    var target = document.getElementById(link.getAttribute("data-focus"));
    if (!target) return;
    var wrapper = target.closest(".field") || target;
    wrapper.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
  });

  // After a first attempt, re-check fields as people correct them.
  function revalidateFor(target) {
    if (!attempted) return;
    var wrapper = target.closest("[data-field]");
    if (!wrapper) return;
    var key = wrapper.getAttribute("data-field");
    rules.forEach(function (rule) {
      if (rule.key === key) validateRule(rule);
    });
  }

  form.addEventListener("change", function (event) { revalidateFor(event.target); });
  form.addEventListener("focusout", function (event) {
    if (event.target.matches("input[type=text], input[type=email], input[type=date], textarea")) revalidateFor(event.target);
  });

  /* ------------------------------------------------------- small UI touches */

  dateInput.setAttribute("min", todayISO());

  form.elements.postcode.addEventListener("blur", function () {
    var v = this.value.trim();
    if (POSTCODE_RE.test(v.replace(/\s+/g, " "))) this.value = normalisePostcode(v);
  });

  function updateCounter() {
    var max = Number(message.getAttribute("maxlength")) || 1500;
    var left = max - message.value.length;
    counter.textContent = message.value.length
      ? "You have " + left.toLocaleString("en-GB") + " character" + (left === 1 ? "" : "s") + " remaining."
      : "Up to " + max.toLocaleString("en-GB") + " characters.";
  }
  message.addEventListener("input", updateCounter);

  /* --------------------------------------------------------------- statuses */

  function clearStatus() {
    statusBox.hidden = true;
    statusBox.className = "form-status";
    statusBox.removeAttribute("role");
    statusBox.textContent = "";
  }

  function showError(bodyNodes) {
    statusBox.textContent = "";
    statusBox.className = "form-status is-error";
    statusBox.setAttribute("role", "alert");
    statusBox.appendChild(el("h2", { class: "form-status-title", text: "Your enquiry has not been sent" }));
    statusBox.appendChild(el("p", {}, bodyNodes));
    statusBox.hidden = false;
    statusBox.focus();
  }

  function showSuccess(replyTo) {
    statusBox.textContent = "";
    statusBox.className = "form-status is-success";
    statusBox.setAttribute("role", "status");
    statusBox.appendChild(el("h2", { class: "form-status-title", text: "Thank you, your enquiry has been sent" }));
    statusBox.appendChild(el("p", {}, ["We will reply by email to ", el("strong", { text: replyTo }), "."]));
    statusBox.appendChild(el("p", {}, ["If you cannot find our reply, please check your junk or spam folder, or email us at ", emailLink(), "."]));
    statusBox.appendChild(el("p", {}, [el("a", { href: "./", text: "Return to the homepage" })]));
    form.hidden = true;
    statusBox.hidden = false;
    panel.scrollIntoView({ block: "start" });
    statusBox.focus({ preventScroll: true });
  }

  function setBusy(busy) {
    submitting = busy;
    submitButton.classList.toggle("is-busy", busy);
    submitButton.setAttribute("aria-disabled", String(busy));
    form.setAttribute("aria-busy", String(busy));
    submitLabel.textContent = busy ? submitLabel.dataset.busy : submitLabel.dataset.idle;
  }

  /* ------------------------------------------------------------- submission */

  function buildPayload() {
    var data = new FormData();
    var name = value("name");
    var postcode = normalisePostcode(value("postcode"));
    data.append("name", name);
    data.append("email", value("email")); // Formspree uses "email" as the reply-to address.
    data.append("postcode", postcode);
    data.append("who_requires_care", checkedValues("who_requires_care").join(", "));
    data.append("type_of_care", checkedValues("type_of_care").join(", "));
    data.append("preferred_start_date", formatDate(value("preferred_start_date")) || "Not specified");
    data.append("additional_information", message.value.trim() || "None provided");
    data.append("privacy_consent", "Yes");
    data.append("_subject", cfg.subject + ": " + name + " (" + postcode + ")");
    data.append("_gotcha", form.elements._gotcha.value); // honeypot, normally empty
    return data;
  }

  function postWithTimeout(url, body) {
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, cfg.timeoutMs) : null;
    return fetch(url, {
      method: "POST",
      body: body,
      headers: { Accept: "application/json" },
      signal: controller ? controller.signal : undefined,
    }).finally(function () {
      if (timer) clearTimeout(timer);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submitting) return; // prevents double submission (double-click, repeated Enter)

    attempted = true;
    clearStatus();

    var errors = validateAll();
    if (errors.length) {
      showSummary(errors);
      return;
    }
    hideSummary();

    if (!cfg.configured) {
      if (window.console) console.warn("Enquiry form: set the form endpoint in src/_data/site.js (see README).");
      showError(["The enquiry form is not connected yet, so we could not send it. Please email us at ", emailLink(), " instead."]);
      return;
    }

    if (Date.now() - loadedAt < cfg.minFillMs) {
      showError(["Please check your answers, then select ‘Submit enquiry’ again."]);
      return;
    }

    if (navigator.onLine === false) {
      showError(["You appear to be offline. Check your internet connection and try again, or email us at ", emailLink(), "."]);
      return;
    }

    var replyTo = value("email");
    setBusy(true);

    postWithTimeout(cfg.endpoint, buildPayload())
      .then(function (response) {
        return response
          .json()
          .catch(function () { return null; })
          .then(function (body) {
            if (response.ok) {
              form.reset();
              updateCounter();
              showSuccess(replyTo);
              return;
            }
            var details = body && Array.isArray(body.errors)
              ? body.errors.map(function (e) { return e && e.message; }).filter(Boolean).join(" ")
              : "";
            showError([
              (details ? "The form service said: " + details + " " : "The form service could not accept it just now. ") +
                "Please try again in a few minutes, or email us at ",
              emailLink(),
              ".",
            ]);
          });
      })
      .catch(function (error) {
        var timedOut = error && error.name === "AbortError";
        showError([
          timedOut
            ? "The form service took too long to respond. Please try again, or email us at "
            : "There was a problem with the connection. Check you are online and try again, or email us at ",
          emailLink(),
          ".",
        ]);
      })
      .finally(function () {
        setBusy(false);
      });
  });
})();
