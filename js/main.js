/* ===========================================================
   La Roca — interactions (vanilla JS)
   =========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav background on scroll ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobile-menu");
  function closeMenu() {
    mobileMenu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menú");
    document.body.style.overflow = "";
  }
  function openMenu() {
    mobileMenu.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Cerrar menú");
    document.body.style.overflow = "hidden";
  }
  burger.addEventListener("click", function () {
    if (mobileMenu.hidden) openMenu();
    else closeMenu();
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---- Hero handwriting underline ---- */
  var heroTitle = document.querySelector(".hero__title");
  if (heroTitle && !reduceMotion) {
    window.requestAnimationFrame(function () {
      heroTitle.classList.add("animate-underline");
    });
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Marquee: duplicate items for seamless loop ---- */
  if (!reduceMotion) {
    ["marquee1", "marquee2"].forEach(function (id) {
      var track = document.getElementById(id);
      if (!track) return;
      var items = Array.prototype.slice.call(track.children);
      items.forEach(function (item) {
        var clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });
    });
  }

  /* ---- Lightbox for gallery ---- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxClose = document.getElementById("lightbox-close");
  var lastFocused = null;

  function openLightbox(src, alt) {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll("#gallery-grid .gallery__item").forEach(function (fig) {
    var img = fig.querySelector("img");
    if (!img) return;
    fig.setAttribute("role", "button");
    fig.setAttribute("tabindex", "0");
    fig.setAttribute("aria-label", "Ampliar: " + (img.alt || "foto"));
    function trigger() { openLightbox(img.src, img.alt); }
    fig.addEventListener("click", trigger);
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger(); }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---- Reservation modal (form -> WhatsApp) ---- */
  var resv = document.getElementById("resv");
  var resvForm = document.getElementById("resv-form");
  var resvFecha = document.getElementById("resv-fecha");
  var resvLastFocused = null;

  function openResv() {
    if (!resv) return;
    resvLastFocused = document.activeElement;
    // set date min = today, default to today if empty
    if (resvFecha) {
      var today = new Date();
      var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);
      resvFecha.min = iso;
      if (!resvFecha.value) resvFecha.value = iso;
    }
    resv.hidden = false;
    document.body.style.overflow = "hidden";
    if (resvFecha) resvFecha.focus();
    else resv.querySelector("input, select, button").focus();
  }
  function closeResv() {
    if (!resv) return;
    resv.hidden = true;
    document.body.style.overflow = "";
    if (resvLastFocused) resvLastFocused.focus();
  }

  if (resv) {
    // Intercept any .js-reserva trigger (keeps WhatsApp href as no-JS fallback)
    document.querySelectorAll(".js-reserva").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        if (!mobileMenu.hidden) closeMenu();
        openResv();
      });
    });
    resv.querySelectorAll("[data-resv-close]").forEach(function (el) {
      el.addEventListener("click", closeResv);
    });
    resvForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var personas = document.getElementById("resv-personas").value;
      var nombre = (document.getElementById("resv-nombre").value || "").trim();
      var comentario = (document.getElementById("resv-comentario").value || "").trim();
      var msg;
      if (personas === "mas") {
        msg = "Hola La Roca, quisiera cotizar un evento:\n" +
          "- Fecha: " + resvFecha.value + "\n" +
          "- Hora: " + document.getElementById("resv-hora").value + "\n" +
          "- Personas: más de 12\n" +
          "- Nombre: " + nombre;
      } else {
        msg = "Hola La Roca, quisiera reservar una mesa:\n" +
          "- Fecha: " + resvFecha.value + "\n" +
          "- Hora: " + document.getElementById("resv-hora").value + "\n" +
          "- Personas: " + personas + "\n" +
          "- Nombre: " + nombre;
      }
      if (comentario) msg += "\n- Comentario: " + comentario;
      window.open("https://wa.me/56942724548?text=" + encodeURIComponent(msg), "_blank");
      closeResv();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (resv && !resv.hidden) closeResv();
      else if (!lightbox.hidden) closeLightbox();
      else if (!mobileMenu.hidden) closeMenu();
    }
  });
})();
