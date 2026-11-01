/**
 * Shared behaviour for every page: mobile menu and footer year.
 * Loaded in <head> (not deferred) so the "js" class is set before the page paints;
 * that class lets CSS collapse the mobile menu only when this script can open it again.
 */
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function () {
  // Keep the copyright year current even if the site is not rebuilt in a new year.
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  var desktop = window.matchMedia("(min-width: 60em)");

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(!isOpen());
  });

  // Close after choosing a link (most links jump to a section on the same page).
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (isOpen() && !event.target.closest(".site-header")) setOpen(false);
  });

  desktop.addEventListener("change", function () {
    setOpen(false);
  });
});
