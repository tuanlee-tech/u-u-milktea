/* Ú Ụ Milk Tea — interactions
   Motion runs only when the visitor has not asked for reduced motion. */

(function () {
  'use strict';

  /* ---------------------------------------------------------- UI state -- */

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('navPanel');

  function setPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    toggle.innerHTML = open
      ? '<svg class="ic" aria-hidden="true"><use href="#i-x"></use></svg>'
      : '<svg class="ic" aria-hidden="true"><use href="#i-list"></use></svg>';
  }

  if (toggle && panel) {
    setPanel(false);
    toggle.addEventListener('click', function () {
      setPanel(panel.hidden);
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setPanel(false);
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) setPanel(false);
    });
  }

  /* --------------------------------------------------------------- tabs -- */

  var tablist = document.querySelector('.tabs');
  var tabs = tablist ? Array.prototype.slice.call(tablist.querySelectorAll('.tab')) : [];

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
    if (window.gsap && tabPanelMotion) tabPanelMotion(document.getElementById(tab.getAttribute('aria-controls')));
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
  });

  if (tablist) {
    tablist.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  }

  /* ------------------------------------------------- original menu image -- */

  /* The trigger is a <div role="button">, so keyboard support is manual. */
  var boardBtn = document.getElementById('boardToggle');
  var boardFig = document.getElementById('boardFigure');
  if (boardBtn && boardFig) {
    var boardLabel = boardBtn.querySelector('.board-cta__label');
    var boardToggleState = function () {
      var open = boardFig.hidden;
      boardFig.hidden = !open;
      boardBtn.setAttribute('aria-expanded', String(open));
      if (boardLabel) boardLabel.textContent = open ? 'Ẩn menu ảnh' : 'Xem menu ảnh';
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    boardBtn.addEventListener('click', boardToggleState);
    boardBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        boardToggleState();
      }
    });
  }

  /* ---------------------------------------------------------- fancybox -- */

  if (window.Fancybox) {
    Fancybox.bind('[data-fancybox]', {
      Images: { Zoom: { enabled: true } },
      Carousel: { Dots: false }
    });
  }

  /* ------------------------------------------------------- menu motion -- */

  var tabPanelMotion = null;

  /* ------------------------------------------------------------- GSAP --- */

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {

    /* --- hero entrance: brand first, then the message, then the photo --- */
    var hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
    hero
      .from('.hero__eyebrow', { y: 16, autoAlpha: 0, duration: 0.5 })
      .from('.hero__title .line > span', { yPercent: 112, duration: 0.85, stagger: 0.09, ease: 'power4.out' }, '-=0.25')
      .from('.hero__sub', { y: 18, autoAlpha: 0, duration: 0.6 }, '-=0.45')
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, '-=0.4')
      .from('.hero__photo', { scale: 0.93, autoAlpha: 0, duration: 1, ease: 'power2.out' }, '-=0.85')
      .from('.hero__badge', { scale: 0.4, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.7)' }, '-=0.55');

    /* --- the badge breathes: keeps the mascot alive without stealing focus --- */
    gsap.to('.hero__badge', {
      y: -10, rotation: 3, duration: 2.6,
      yoyo: true, repeat: -1, ease: 'sine.inOut'
    });

    /* --- one marquee per page: the shop's four facts, looped --- */
    gsap.to('#marqueeTrack', { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });

    /* --- scroll reveals: photos and offers arrive as the reader reaches them --- */
    var reveals = gsap.utils.toArray('[data-reveal]');
    gsap.set(reveals, { autoAlpha: 0, y: 28 });
    ScrollTrigger.batch(reveals, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09, overwrite: true, ease: 'power3.out' });
      }
    });

    /* --- section headline lift: signals a new chapter of the page --- */
    gsap.utils.toArray('.sec-head, .order').forEach(function (el) {
      gsap.from(el, {
        y: 26, autoAlpha: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* --- menu panel swap: rows land in reading order after a tab change --- */
    tabPanelMotion = function (panelEl) {
      if (!panelEl) return;
      var rows = panelEl.querySelectorAll('.price-row, .top-card, .top-group__title, .price-head');
      gsap.fromTo(rows,
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.035, ease: 'power2.out', overwrite: true }
      );
    };

    /* --- reveal the first menu panel once the section is reached --- */
    ScrollTrigger.create({
      trigger: '#menu',
      start: 'top 75%',
      once: true,
      onEnter: function () { tabPanelMotion(document.querySelector('.panel:not([hidden])')); }
    });

    return function () { tabPanelMotion = null; };
  });

  /* --------------------------------------------------- nav state / links -- */

  function markScrolled() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  markScrolled();
  window.addEventListener('scroll', markScrolled, { passive: true });

  if (window.ScrollTrigger) {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: function (self) { link.classList.toggle('is-active', self.isActive); }
      });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }
})();
