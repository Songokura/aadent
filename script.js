(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var VER = ((d.currentScript && d.currentScript.src || '').match(/[?&]v=([\w.-]+)/) || [])[1] || '';
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var lenis = null;
  if (hasGsap) root.classList.add('js');

  /* ---------- языки ---------- */
  var DICTS = { kk: ['assets/lang/kk.js', 'SITE_KK'], en: ['assets/lang/en.js', 'SITE_EN'] };
  var HTML_LANG = { ru: 'ru', kk: 'kk', en: 'en' };
  var ruSaved = false, ruTitle = d.title;
  var curLang = 'ru';

  function saveRu() {
    if (ruSaved) return;
    ruSaved = true;
    $$('[data-i18n]').forEach(function (el) { el._ru = el.innerHTML; });
    $$('[data-i18n-aria]').forEach(function (el) { el._ruAria = el.getAttribute('aria-label'); });
    $$('[data-i18n-alt]').forEach(function (el) { el._ruAlt = el.getAttribute('alt'); });
  }
  function applyLang(lang, dict) {
    saveRu();
    killSplits();
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      el.innerHTML = (dict && dict[k] != null) ? dict[k] : el._ru;
    });
    $$('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', (dict && dict[k] != null) ? dict[k] : el._ruAria);
    });
    $$('[data-i18n-alt]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-alt');
      el.setAttribute('alt', (dict && dict[k] != null) ? dict[k] : el._ruAlt);
    });
    d.title = (dict && dict['meta.title']) || ruTitle;
    root.lang = HTML_LANG[lang] || 'ru';
    curLang = lang;
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    buildMq();
    if (hasGsap) window.ScrollTrigger.refresh();
    $$('.track').forEach(function (t) { t.dispatchEvent(new Event('scroll')); });
  }
  function setLang(lang, store) {
    if (!DICTS[lang]) lang = 'ru';
    if (store) { try { localStorage.setItem('aa-lang', lang); } catch (e) {} }
    if (lang === 'ru') { if (ruSaved) applyLang('ru', null); return; }
    var conf = DICTS[lang];
    if (window[conf[1]]) { applyLang(lang, window[conf[1]]); return; }
    var s = d.createElement('script');
    s.src = conf[0] + (VER ? '?v=' + VER : '');
    s.onload = function () { applyLang(lang, window[conf[1]] || null); };
    d.head.appendChild(s);
  }
  $$('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
  });
  (function () {
    var q = (location.search.match(/[?&]lang=(ru|kk|en)\b/) || [])[1], st = null;
    try { st = localStorage.getItem('aa-lang'); } catch (e) {}
    var l = q || st || 'ru';
    if (l !== 'ru') setLang(l, false);
  })();

  /* ---------- бегущая строка ---------- */
  var mqTween = null;
  function buildMq() {
    var track = $('.mq__track'); if (!track) return;
    var set = $('.mq__set', track);
    $$('.mq__clone', track).forEach(function (c) { c.remove(); });
    if (mqTween) { mqTween.kill(); mqTween = null; }
    var w = set.getBoundingClientRect().width; if (!w) return;
    var n = Math.ceil(window.innerWidth / w) + 1, i;
    for (i = 0; i < n; i++) {
      var c = set.cloneNode(true); c.classList.add('mq__clone'); c.setAttribute('aria-hidden', 'true');
      $$('[data-i18n]', c).forEach(function (el) { el.removeAttribute('data-i18n'); });
      track.appendChild(c);
    }
    if (!hasGsap || reduce) return;
    window.gsap.set(track, { x: 0 });
    mqTween = window.gsap.to(track, { x: -w, duration: w / 70, ease: 'none', repeat: -1 });
  }
  var mqW = window.innerWidth;
  window.addEventListener('resize', function () { if (window.innerWidth !== mqW) { mqW = window.innerWidth; buildMq(); } });

  /* ---------- медицинские фото: заглушка до клика ---------- */
  (function () {
    var works = $('.works'); if (!works) return;
    $$('.veil', works).forEach(function (v) {
      v.addEventListener('click', function () {
        works.classList.add('is-open');
        var t = $('#cases'); if (t) t.focus({ preventScroll: true });
      });
    });
  })();

  /* ---------- сертификаты врачей ---------- */
  (function () {
    var lb = $('#lb'); if (!lb || !lb.showModal) return;
    var img = $('.lb__img', lb), cap = $('.lb__cap', lb), nav = $('.lb__nav', lb), num = $('.lb__n', lb);
    var prev = $('.lb__prev', lb), next = $('.lb__next', lb), list = [], i = 0, name = '', opener = null;
    function show() {
      img.src = list[i]; img.alt = name; cap.textContent = name;
      nav.hidden = list.length < 2; num.textContent = (i + 1) + ' / ' + list.length;
      prev.disabled = i === 0; next.disabled = i === list.length - 1;
      $('.lb__fig', lb).scrollTop = 0;
    }
    $$('.doc__cert').forEach(function (b) {
      b.addEventListener('click', function () {
        list = b.getAttribute('data-docs').split('|'); i = 0; opener = b;
        var h = b.closest('.doc').querySelector('.h3'); name = h ? h.textContent.trim() : '';
        show(); lb.showModal(); if (lenis) lenis.stop(); root.classList.add('lb-open');
      });
    });
    prev.addEventListener('click', function () { if (i > 0) { i--; show(); } });
    next.addEventListener('click', function () { if (i < list.length - 1) { i++; show(); } });
    $('.lb__x', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { if (lenis) lenis.start(); root.classList.remove('lb-open'); if (opener) opener.focus(); });
  })();

  /* ---------- шапка и меню ---------- */
  var hdr = $('#hdr'), burger = $('.burger'), mmenu = $('#mmenu');
  function onScrollHdr() { hdr.classList.toggle('is-stuck', window.scrollY > 12); }
  window.addEventListener('scroll', onScrollHdr, { passive: true }); onScrollHdr();
  function menu(open) {
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    mmenu.setAttribute('aria-hidden', String(!open));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { menu(!d.body.classList.contains('menu-open')); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'), t = id.length > 1 && $(id);
      if (!t) return;
      e.preventDefault();
      menu(false);
      var off = -(hdr.offsetHeight + 8);
      if (id === '#top') off = 0;
      if (lenis) lenis.scrollTo(t, { offset: off, duration: 1.2 });
      else window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY + off, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- ленты со стрелками ---------- */
  $$('.arrows').forEach(function (box) {
    var track = $('#' + box.getAttribute('data-for'));
    if (!track) return;
    var prev = $('.arrow--prev', box), next = $('.arrow--next', box);
    function step() {
      var c = track.children[track.children.length - 1];
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return Math.min(c.getBoundingClientRect().width + gap, track.clientWidth * .9);
    }
    function upd() {
      var max = track.scrollWidth - track.clientWidth;
      var none = max < 4;
      prev.hidden = next.hidden = none;
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > max - 4;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    window.addEventListener('load', upd);
    upd();
  });

  /* ---------- форма ---------- */
  var form = $('#lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name, phone = form.elements.phone, topic = form.elements.topic;
      var okN = name.value.trim().length > 1;
      var okP = phone.value.replace(/\D/g, '').length >= 10;
      name.parentNode.classList.toggle('is-err', !okN);
      phone.parentNode.classList.toggle('is-err', !okP);
      if (!okN) { name.focus(); return; }
      if (!okP) { phone.focus(); return; }
      var ruTopic = topic.options[topic.selectedIndex]._ru || topic.value;
      var txt = 'Здравствуйте! Заявка с сайта A&A Dent.\nИмя: ' + name.value.trim() + '\nТелефон: ' + phone.value.trim() + '\nЧто беспокоит: ' + ruTopic.replace(/&nbsp;/g, ' ');
      window.open('https://wa.me/77776941666?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      var ok = $('.form__ok', form);
      ok.hidden = false;
      if (hasGsap && !reduce) window.gsap.from(ok, { y: 12, opacity: 0, duration: .4, ease: 'power2.out' });
    });
    $$('input', form).forEach(function (i) { i.addEventListener('input', function () { i.parentNode.classList.remove('is-err'); }); });
  }

  /* ---------- движение ---------- */
  var splits = [];
  function killSplits() {
    splits.forEach(function (s) { try { s.tween && s.tween.kill(); s.split.revert(); } catch (e) {} });
    splits = [];
  }
  if (!hasGsap) return;

  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  try { gsap.registerEase && 0; } catch (e) {}
  if (window.CustomEase) { EASE = window.CustomEase.create('aa', '.2,.7,.2,1'); } else { EASE = 'power3.out'; }
  var T2 = .4, T3 = 1, STG = .08;
  gsap.defaults({ ease: EASE, duration: T3 });
  /* Экраны 120-165 Гц: анимации в 60 кадров/с. Без потолка встроенная видеокарта
     перерисовывает герой 165 раз в секунду и тормозит весь компьютер (замер: 72% -> 31%). */
  gsap.ticker.fps(60);

  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: .11, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function splitLines(el, opts) {
    if (!SplitText || reduce) return null;
    var split;
    try { split = new SplitText(el, { type: 'lines', linesClass: 'split-in' }); } catch (e) { return null; }
    var lines = split.lines || [];
    lines.forEach(function (l) {
      var w = d.createElement('div'); w.className = 'split-line';
      l.parentNode.insertBefore(w, l); w.appendChild(l);
    });
    var rec = { split: split };
    rec.tween = gsap.from(lines, Object.assign({
      yPercent: 115, duration: 1.1, stagger: .09, ease: EASE,
      onComplete: function () {
        lines.forEach(function (l) { var w = l.parentNode; if (w && w.className === 'split-line') { w.parentNode.insertBefore(l, w); w.remove(); } });
        split.revert(); splits = splits.filter(function (s) { return s !== rec; });
      }
    }, opts || {}));
    splits.push(rec);
    return rec;
  }

  /* --- сцена героя --- */
  var scene = $('#scene');
  var sceneApi = (function () {
    if (!scene) return null;
    var path = $('#t-path'), out = $('#t-out'), heal = $('#t-heal'), healGlow = $('#t-heal-glow');
    var thread = $('#t-thread'), dot = $('#t-dotg'), parts = $('#t-parts');
    var cavity = $('#t-cavity'), halo = $('#t-halo'), dull = $('#t-dull'), edge = $('#t-edge'), crack = $('#t-crack');
    var gloss = $('#t-gloss-r'), shine = $('#t-shine'), shine2 = $('#t-shine2');
    var spark = $('#t-spark path'), spark2 = $('#t-spark2 path'), ringfx = $('#t-ringfx');
    var pulse = $('.scene__pulse'), floatG = $('.scene__float');
    var OX = 97, OY = 59;
    var L = path.getTotalLength();
    function nearest(x, y) {
      var best = 0, bd = 1e9, i, p, q;
      for (i = 0; i <= 600; i++) { p = path.getPointAtLength(L * i / 600); q = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (q < bd) { bd = q; best = L * i / 600; } }
      return best;
    }
    var g0 = nearest(337, 192), g1 = nearest(264, 70), GAP = g1 - g0;
    var p0 = path.getPointAtLength(g0);
    thread.setAttribute('d', 'M660 96C610 130 566 176 520 204C490 222 462 240 ' + (p0.x + OX).toFixed(1) + ' ' + (p0.y + OY).toFixed(1));
    var TL = thread.getTotalLength();
    var shL = shine.getTotalLength(), sh2L = shine2.getTotalLength();
    var pool = [], i;
    for (i = 0; i < 18; i++) {
      var c = d.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', i % 3 ? 2 : 3); c.setAttribute('fill', i % 2 ? '#3a7fae' : '#9cc6e2'); c.setAttribute('opacity', 0);
      parts.appendChild(c); pool.push(c);
    }
    var pi = 0;
    function burst(n) {
      var x = gsap.getProperty(dot, 'x'), y = gsap.getProperty(dot, 'y'), k;
      for (k = 0; k < n; k++) {
        var el = pool[pi++ % pool.length], a = Math.random() * Math.PI * 2, r = 22 + Math.random() * 44;
        gsap.fromTo(el, { x: x, y: y, opacity: .9, scale: 1 }, { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r - 10, opacity: 0, scale: .2, duration: .7 + Math.random() * .5, ease: 'power2.out', overwrite: true });
      }
    }
    var st = { p: 0, x: 0 };
    function dotOnThread() { var p = thread.getPointAtLength(TL * st.p); gsap.set(dot, { x: p.x, y: p.y }); }
    function drawHeal() {
      var len = GAP * st.x;
      var da = '0 ' + g0.toFixed(2) + ' ' + len.toFixed(2) + ' ' + (L * 2).toFixed(2);
      heal.setAttribute('stroke-dasharray', da); healGlow.setAttribute('stroke-dasharray', da);
      var p = path.getPointAtLength(g0 + len); gsap.set(dot, { x: p.x + OX, y: p.y + OY });
    }
    var idle = [], tl = null, done = false, doneAt = 0;
    function reset() {
      idle.forEach(function (t) { t.kill(); }); idle = [];
      scene.classList.remove('is-done'); done = false;
      st.p = 0; st.x = 0;
      out.setAttribute('stroke-dasharray', g0.toFixed(2) + ' ' + GAP.toFixed(2) + ' ' + (L - g1).toFixed(2) + ' 0');
      heal.setAttribute('stroke-dasharray', '0 ' + (L * 3).toFixed(2));
      healGlow.setAttribute('stroke-dasharray', '0 ' + (L * 3).toFixed(2));
      gsap.set([heal, healGlow], { opacity: 0 });
      gsap.set([cavity, edge], { scale: 1, svgOrigin: '314 128' });
      gsap.set(halo, { opacity: 1 }); gsap.set(dull, { opacity: .34 });
      gsap.set([edge, crack], { opacity: 1 });
      gsap.set(gloss, { x: 0 });
      gsap.set(shine, { strokeDasharray: shL, strokeDashoffset: shL, opacity: 0 });
      gsap.set(shine2, { strokeDasharray: sh2L, strokeDashoffset: sh2L, opacity: 0 });
      gsap.set([spark, spark2], { scale: 0, rotation: -90, svgOrigin: '0 0' });
      gsap.set(ringfx, { opacity: 0, scale: 1, svgOrigin: '318 106' });
      gsap.set(thread, { strokeDasharray: TL, strokeDashoffset: TL, opacity: .75 });
      gsap.set(dot, { opacity: 0, scale: 1 });
      gsap.set(pulse, { opacity: 0, scale: 1 });
      gsap.set(floatG, { y: 0 });
      dotOnThread();
    }
    var calm = false;
    function finish() {
      done = true; doneAt = Date.now(); scene.classList.add('is-done');
      if (reduce || calm) return;
      idle.push(gsap.to(floatG, { y: -9, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      idle.push(gsap.to(spark, { scale: .78, rotation: 45, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      idle.push(gsap.to(spark2, { scale: .5, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: .4 }));
    }
    function pass(t, from, to, cav, at) {
      t.to(st, { x: to, duration: .62, ease: 'power2.inOut', onUpdate: drawHeal }, at)
       .to([cavity, edge], { scale: cav, duration: .7, ease: 'power2.inOut' }, at + .05)
       .to(dot, { scale: 1.7, duration: .16, ease: 'power2.out', yoyo: true, repeat: 1, onStart: function () { burst(5); } }, at + .6);
    }
    function play() {
      if (tl) tl.kill();
      reset();
      tl = gsap.timeline({ onComplete: finish });
      tl.to(dot, { opacity: 1, duration: .3 }, .1)
        .to(thread, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, .1)
        .to(st, { p: 1, duration: 1, ease: 'power2.inOut', onUpdate: dotOnThread }, .1)
        .set([heal, healGlow], { opacity: 1 }, 1.1)
        .to(dot, { scale: 1.7, duration: .16, ease: 'power2.out', yoyo: true, repeat: 1, onStart: function () { burst(4); } }, 1.1);
      pass(tl, 0, .34, .72, 1.45);
      pass(tl, .34, .68, .4, 2.3);
      pass(tl, .68, 1, 0, 3.15);
      tl.to(crack, { opacity: 0, duration: .6 }, 1.6)
        .to(halo, { opacity: .55, duration: .7 }, 1.5)
        .to(halo, { opacity: .2, duration: .7 }, 2.35)
        .to(edge, { opacity: 0, duration: .6 }, 2.9)
        .to(halo, { opacity: 0, duration: .7 }, 3.2)
        .to(dull, { opacity: 0, duration: 1.1, ease: 'power2.out' }, 3.3)
        .to(healGlow, { opacity: 0, duration: .9 }, 3.9)
        .to(gloss, { x: 620, duration: 1.2, ease: 'power2.inOut' }, 3.75)
        .set([shine, shine2], { opacity: 1 }, 4.1)
        .to(shine, { strokeDashoffset: 0, duration: .9 }, 4.1)
        .to(shine2, { strokeDashoffset: 0, duration: .5 }, 4.3)
        .to(dot, { x: 318 + OX, y: 106 + OY, duration: .45, ease: 'power2.inOut' }, 3.95)
        .to(dot, { scale: 0, opacity: 0, duration: .25 }, 4.35)
        .to(spark, { scale: 1, rotation: 0, duration: .9, ease: 'back.out(2.2)', onStart: function () { burst(9); } }, 4.35)
        .to(spark2, { scale: 1, rotation: 0, duration: .7, ease: 'back.out(2)' }, 4.6)
        .fromTo(ringfx, { opacity: .9, scale: 1 }, { immediateRender: false, opacity: 0, scale: 4.2, duration: 1.1, ease: 'power2.out' }, 4.4)
        .fromTo(pulse, { opacity: .8, scale: 1 }, { immediateRender: false, opacity: 0, scale: 1.28, duration: 1.4, ease: 'power2.out' }, 4.4)
        .to(thread, { opacity: .28, duration: 1 }, 4.4);
      if (reduce) tl.progress(1);
      return tl;
    }
    scene.addEventListener('click', function () { play(); });
    scene.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
    scene.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && done && Date.now() - doneAt > 2500) play(); });
    reset();
    return { play: play, calm: function () { calm = true; idle.forEach(function (t) { t.pause(); }); } };
  })();

  var NARROW = window.matchMedia('(max-width:860px)').matches;
  /* --- вход героя --- */
  (function () {
    var hero = $('.hero'); if (!hero) return;
    var silks = $$('.silk', hero), beads = $$('.bead', hero);
    var loops = [];
    if (!reduce) {
      silks.forEach(function (s, i) {
        var img = $('img', s);
        loops.push(gsap.to(img, { xPercent: i % 2 ? -2.2 : 2, yPercent: i % 2 ? 2.4 : -2, rotation: i % 2 ? .9 : -1.1, scale: 1.05, duration: 9 + i * 3, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      });
      beads.forEach(function (b, i) { loops.push(gsap.to(b, { y: i % 2 ? 22 : -26, x: i % 2 ? -10 : 12, duration: 5 + i * 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1 })); });
      loops.push(gsap.to('.ring--a', { rotation: 360, duration: 70, ease: 'none', repeat: -1 }));
      loops.push(gsap.to('.ring--b', { rotation: -360, duration: 46, ease: 'none', repeat: -1 }));
      var bgLoops = loops.slice(0, silks.length + beads.length), lite = false, heroOn = true;
      ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: function (self) { heroOn = self.isActive; loops.forEach(function (t) { (self.isActive && !(lite && bgLoops.indexOf(t) > -1)) ? t.play() : t.pause(); }); } });
      /* Страховка для слабой отрисовки (Firefox без видеокарты, старые ноутбуки):
         если герой стабильно идёт ниже 40 кадров/с, фоновые покачивания героя (шёлк, бусины,
         кольца, зуб) замирают; лечение зуба по клику и остальные анимации сайта работают. */
      (function watch() {
        var n = 0, t0 = 0, tries = 0;
        function tick() {
          if (!heroOn || d.hidden) { n = 0; t0 = 0; return; }
          var now = performance.now(); if (!t0) { t0 = now; n = 0; return; }
          n++;
          if (now - t0 >= 2000) {
            var fps = n * 1000 / (now - t0); n = 0; t0 = 0; tries++;
            if (fps < 40) { lite = true; bgLoops = loops.slice(); loops.forEach(function (t) { t.pause(); }); if (sceneApi) sceneApi.calm(); gsap.ticker.remove(tick); }
            else if (tries >= 4) gsap.ticker.remove(tick);
          }
        }
        gsap.delayedCall(7, function () { gsap.ticker.add(tick); });
      })();

      if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        var movers = silks.concat(beads).map(function (el, i) {
          var dep = parseFloat(el.getAttribute('data-depth')) || (1.2 + i * .3);
          return { dep: dep, x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }) };
        });
        var sx = gsap.quickTo(scene, 'x', { duration: 1.2, ease: 'power3.out' }), sy = gsap.quickTo(scene, 'y', { duration: 1.2, ease: 'power3.out' });
        hero.addEventListener('pointermove', function (e) {
          var nx = e.clientX / window.innerWidth - .5, ny = e.clientY / window.innerHeight - .5;
          if (!lite) movers.forEach(function (m) { m.x(-nx * 34 * m.dep); m.y(-ny * 24 * m.dep); });
          if (!lite) { sx(nx * 14); sy(ny * 10); }
        });
      }
      gsap.to('.hero__bg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }

    function intro() {
      if (reduce) { sceneApi && sceneApi.play(); return; }
      var t = gsap.timeline();
      t.from(silks, NARROW ? { scale: 1.12, duration: 1.8, stagger: .15, ease: 'power2.out' } : { opacity: 0, scale: 1.12, duration: 1.8, stagger: .15, ease: 'power2.out' }, 0)
       .from(beads, { opacity: 0, scale: .3, duration: 1.2, stagger: .12 }, .5)
       .from('.scene__disc', { scale: .82, opacity: 0, duration: 1.3 }, .1)
       .from('.scene__rings', { scale: .9, opacity: 0, rotation: -40, transformOrigin: '50% 50%', duration: 1.6 }, .2)
       .from('.scene__tooth', { opacity: 0, scale: .94, transformOrigin: '50% 50%', duration: 1 }, .35)
       .from('.hero .kicker', { opacity: 0, x: -16, duration: .8 }, .1)
       .from(NARROW ? '.hero__btns > *, .hero .tlink' : '.hero .lead, .hero__btns > *, .hero .tlink', { opacity: 0, y: 22, duration: .9, stagger: STG }, .45)
       .from('.facts li', { opacity: 0, y: 22, duration: .9, stagger: STG, onStart: function () { $$('.facts .uline').forEach(function (u) { u.classList.add('in'); }); } }, .8)
       .from('.hdr-in > *', { opacity: 0, y: -14, duration: .8, stagger: .06 }, .1);
      if (NARROW) { gsap.from('.hero .h1, .hero .lead', { y: 14, duration: .9, stagger: STG }); }
      else splitLines($('.hero .h1'), { delay: .15 });
      gsap.delayedCall(.9, function () { sceneApi && sceneApi.play(); });
    }
    var started = false;
    function go() { if (started) return; started = true; intro(); }
    if (d.fonts && d.fonts.ready) { d.fonts.ready.then(go); setTimeout(go, NARROW ? 300 : 1200); } else go();
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(buildMq); else buildMq();
  })();

  function setupReveals() {
  /* --- раскрытия при прокрутке --- */
  if (!reduce) {
    var RV = '.sec .kicker,.sec .lead,.sec .note,.sec .btns,.sec .h3,.ticks li,.chips li,.pgroup,.clist>div,.nums__list li,.steps__list li,.crown,.arch,.case,.rev,.rate,.form,.seal,.ak-price,.disc,.works__foot .btn,.revs__foot .btn,.ftr__in>*';
    var items = $$(RV);
    gsap.set(items, { opacity: 0, y: 30 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: .95, stagger: STG, ease: EASE, overwrite: true, clearProps: 'transform' }); }
    });
    $$('.sec .h2').forEach(function (h) {
      gsap.set(h, { opacity: 0 });
      ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () { gsap.set(h, { opacity: 1 }); if (!splitLines(h)) gsap.from(h, { opacity: 0, y: 30 }); } });
    });
    $$('.shot--after').forEach(function (s) {
      gsap.fromTo(s, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1.3, ease: 'power2.inOut', delay: .35, clearProps: 'clipPath', scrollTrigger: { trigger: s, start: 'top 82%', once: true } });
    });
    $$('.arch__img img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-par]').forEach(function (el) {
      if (window.innerWidth < 861) return;
      var v = parseFloat(el.getAttribute('data-par'));
      gsap.fromTo(el, { y: v }, { y: -v, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('.pop').forEach(function (el) {
      var p = $('path', el);
      gsap.from(p, { scale: 0, rotation: -90, svgOrigin: '0 0', duration: .9, ease: 'back.out(2.2)', delay: 1, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
  }
  // коронки: колпачок над обточенным зубом, по наведению садится
  $$('.crown').forEach(function (c) {
    var cap = $('.cap', c), gd = $('.cap-guide', c); if (!cap) return;
    var UP = -36;
    gsap.set(cap, { y: UP });
    if (reduce) return;
    gsap.from(cap, { y: -96, opacity: 0, duration: 1.2, ease: 'power3.out', delay: .3, scrollTrigger: { trigger: c, start: 'top 82%', once: true } });
    c.addEventListener('mouseenter', function () { gsap.to(cap, { y: 0, duration: .6, ease: 'power2.inOut', overwrite: true }); gsap.to(gd, { opacity: 0, duration: .3 }); });
    c.addEventListener('mouseleave', function () { gsap.to(cap, { y: UP, duration: .7, ease: 'power2.out', overwrite: true }); gsap.to(gd, { opacity: 1, duration: .4, delay: .3 }); });
  });
  // линии
  $$('.uline').forEach(function (u) {
    if (u.closest('.facts')) return;
    ScrollTrigger.create({ trigger: u, start: 'top 92%', once: true, onEnter: function () { u.classList.add('in'); } });
  });
  $$('svg').forEach(function (svg) {
    var ds = $$('.draw', svg); if (!ds.length) return;
    if (reduce) return;
    gsap.to(ds, { strokeDashoffset: 0, duration: 1.8, stagger: .25, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'top 85%', once: true } });
  });
  if (!reduce) $$('.draw-scrub').forEach(function (p) {
    gsap.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: p.ownerSVGElement, start: 'top 92%', end: 'top 35%', scrub: .6 } });
  });
  // рамки
  $$('.framed').forEach(function (el) {
    var r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 28;
    var svg = d.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'frame-svg'); svg.setAttribute('aria-hidden', 'true');
    var rect = d.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width','100%'); rect.setAttribute('height','100%'); rect.setAttribute('x', .6); rect.setAttribute('y', .6); rect.setAttribute('rx', r); rect.setAttribute('pathLength', 1);
    rect.style.width = 'calc(100% - 1.2px)'; rect.style.height = 'calc(100% - 1.2px)';
    svg.appendChild(rect); el.appendChild(svg);
    if (reduce) return;
    gsap.fromTo(rect, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.9, ease: 'power2.inOut', scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });
  // счётчики
  $$('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count'), o = { v: 0 };
    if (reduce) return;
    el.textContent = '0';
    gsap.to(o, { v: to, duration: 2, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); }, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  // прайс
  $$('.pgroup').forEach(function (g) {
    g.addEventListener('toggle', function () {
      if (g.open && !reduce) gsap.from($$('.prow,.pnote', g), { opacity: 0, y: 12, duration: T2, stagger: .035, ease: EASE, clearProps: 'all' });
      ScrollTrigger.refresh();
    });
  });
    ScrollTrigger.refresh();
  }
  var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 200); };
  idle(setupReveals, { timeout: 1500 });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
