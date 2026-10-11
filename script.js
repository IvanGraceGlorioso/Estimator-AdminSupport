/* View switching (hash routes), mobile sidebar, theme toggle, project filters, tools marquee,
   image fallback, and contact form (opens the visitor's email app with the message filled in). */

document.addEventListener('DOMContentLoaded', function () {
  var views = document.querySelectorAll('.view');
  var navLinks = document.querySelectorAll('.side-nav a');
  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('scrim');
  var menuButton = document.getElementById('menuToggle');

  // --- Views ---
  function showView() {
    var name = location.hash.replace('#', '') || 'home';
    if (!document.getElementById('view-' + name)) name = 'home';
    views.forEach(function (v) { v.hidden = v.dataset.view !== name; });
    navLinks.forEach(function (a) { a.classList.toggle('active', a.dataset.view === name); });
    window.scrollTo(0, 0);
    closeMenu();
  }
  window.addEventListener('hashchange', showView);
  showView();

  // --- Mobile sidebar ---
  function closeMenu() {
    sidebar.classList.remove('open');
    scrim.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
  menuButton.addEventListener('click', function () {
    var isOpen = sidebar.classList.toggle('open');
    scrim.classList.toggle('open', isOpen);
    menuButton.setAttribute('aria-expanded', isOpen);
  });
  scrim.addEventListener('click', closeMenu);

  // --- Theme ---
  var root = document.documentElement;
  var themeButton = document.getElementById('themeToggle');
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function syncThemeIcon() {
    themeButton.innerHTML = isDark() ? '<i class="ph ph-sun"></i>' : '<i class="ph ph-moon"></i>';
  }
  themeButton.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncThemeIcon();
  });
  syncThemeIcon();

  // --- Project filters ---
  var chips = document.querySelectorAll('.chip');
  var projects = document.querySelectorAll('.project');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.toggle('active', c === chip);
        c.setAttribute('aria-selected', c === chip);
      });
      var f = chip.dataset.filter;
      projects.forEach(function (p) { p.hidden = p.dataset.cat !== f; });
      document.querySelectorAll('[data-intro]').forEach(function (el) { el.hidden = el.dataset.intro !== f; });    });
  });

  // --- Service tabs ---
  var svcTabs = document.querySelectorAll('.svc-tab');
  svcTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      svcTabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on);
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      // Admin support has its own "How it works" steps
      var admin = tab.id === 'tab-admin';
      document.getElementById('svc-how').hidden = admin;
      document.getElementById('svc-how-admin').hidden = !admin;
    });
  });

  // --- Image viewer (click any image marked data-zoom) ---
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lastFocus = null;
  function closeLightbox() {
    lightbox.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('img[data-zoom]').forEach(function (img) {
    img.tabIndex = 0;
    function open() {
      lastFocus = img;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = img.alt;
      lightbox.hidden = false;
      document.getElementById('lightboxClose').focus();
    }
    img.addEventListener('click', open);
    img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  lightbox.addEventListener('click', function (e) { if (e.target !== lightboxImg) closeLightbox(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

  // --- Tools marquee: duplicate the row so the loop is seamless ---
  var row = document.querySelector('.tools-row');
  if (row) {
    Array.prototype.slice.call(row.children).forEach(function (el) {
      var clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      row.appendChild(clone);
    });
  }
  document.querySelectorAll('.chip-row').forEach(function (chipRow) {
    Array.prototype.slice.call(chipRow.children).forEach(function (el) {
      var clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      chipRow.appendChild(clone);
    });
  });

  // --- Projects card: cycle the preview screenshots ---
  var shots = document.querySelectorAll('.browser-shot');
  var dots = document.querySelectorAll('.browser-dots span');
  var shotIndex = 0;
  if (shots.length > 1) {
    setInterval(function () {
      if (document.querySelector('.tools.paused')) return;
      shots[shotIndex].classList.remove('is-on');
      dots[shotIndex].classList.remove('is-on');
      shotIndex = (shotIndex + 1) % shots.length;
      shots[shotIndex].classList.add('is-on');
      dots[shotIndex].classList.add('is-on');
    }, 3500);
  }

  var marqueeButton = document.getElementById('marqueeToggle');
  if (marqueeButton) {
    marqueeButton.addEventListener('click', function () {
      var paused = marqueeButton.closest('.tools').classList.toggle('paused');
      marqueeButton.setAttribute('aria-pressed', paused);
      marqueeButton.setAttribute('aria-label', paused ? 'Play animations' : 'Pause animations');
      marqueeButton.innerHTML = paused ? '<i class="ph ph-play"></i>' : '<i class="ph ph-pause"></i>';
    });
  }

  // --- Contact form ---
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var f = form.elements;
      var body =
        'Name: ' + f['name'].value + '\n' +
        'Company: ' + f['company'].value + '\n' +
        'Scope: ' + f['project-type'].value + '\n\n' +
        f['message'].value;
      var subject = 'Quote request: ' + f['project-type'].value;
      window.location.href = 'mailto:gloriosoivangrace@gmail.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }
});

// If an image is missing, hide it and show the placeholder box after it.
function handleImageError(img) {
  img.style.display = 'none';
  var placeholder = img.nextElementSibling;
  if (placeholder) placeholder.style.display = 'flex';
}
