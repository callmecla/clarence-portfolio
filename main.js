'use strict';

var ROOT = document.documentElement;

function $(id) { return document.getElementById(id); }

var ls = {
  get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: function (k, v) {
    try { localStorage.setItem(k, v); return true; }
    catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) console.warn('[Portfolio] localStorage quota exceeded:', k);
      return false;
    }
  },
  remove: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
};

function toast(msg, type, dur) {
  var wrap = $('toast-wrap');
  if (!wrap) return;

  // ✅ Adjust position if Back-to-Top is visible
  var btt = $('btt');
  var offset = (btt && btt.classList.contains('show')) ? 70 : 20;
  wrap.style.bottom = offset + 'px';

  // ✅ Remove existing toasts
  var existing = wrap.querySelectorAll('.toast');
  existing.forEach(function (el) {
    el.classList.remove('show');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  });

  var t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  wrap.appendChild(t);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      t.classList.add('show');
    });
  });

  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () {
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 400);
  }, dur || 3500);
}

/* ── 1. PAGE LOADER ── */
(function () {
  var loader = $('loader');
  if (!loader) return;
  function done() { loader.classList.add('done'); }
  if (document.readyState === 'complete') { setTimeout(done, 500); }
  else { window.addEventListener('load', function () { setTimeout(done, 500); }); }
  setTimeout(done, 1500);
}());

/* ── 2. SCROLL PROGRESS BAR ── */
(function () {
  var bar = $('spb');
  if (!bar) return;
  var ticking = false;
  function update() {
    var scrollable = document.body.scrollHeight - window.innerHeight;
    bar.style.width = Math.min(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0, 100) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
}());

/* ── 3. BACK TO TOP ── */
(function () {
  var btn = $('btt');
  if (!btn) return;
  var ticking = false;
  function update() { btn.classList.toggle('show', window.scrollY > 400); ticking = false; }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}());

/* ── 4. THEME TOGGLE ── */
(function () {
  var tg = $('tg');
  if (!tg) return;
  tg.addEventListener('click', function () {
    var next = ROOT.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    ROOT.setAttribute('data-theme', next);
    ls.set('pt', next);
    toast(next === 'light' ? '☀️ Light mode' : '🌙 Dark mode', '', 2000);
  });
}());

/* ── 5. TYPEWRITER ── */
(function () {
  var el = $('tw');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = 'Full-Stack Developer'; return; }
  var words = ['Full-Stack Developer', 'UI/UX Enthusiast', 'Problem Solver', 'IT Student', 'Open-Source Contributor'];
  var w = 0, c = 0, del = false, timer;
  function tick() {
    var word = words[w];
    el.textContent = del ? word.slice(0, c--) : word.slice(0, c++);
    var wait = del ? 50 : 95;
    if (!del && c > word.length) { wait = 1800; del = true; }
    else if (del && c < 0) { del = false; w = (w + 1) % words.length; c = 0; wait = 350; }
    timer = setTimeout(tick, wait);
  }
  timer = setTimeout(tick, 1300);
}());

/* ── 6. CANVAS PARTICLES ── */
(function () {
  var canvas = $('cv');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, pts = [], raf;
  var N = window.innerWidth < 600 ? 30 : 65;
  var LINK = 110;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function mkPt() { return { x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, l: Math.random() }; }
  function color() { return ROOT.getAttribute('data-theme') === 'light' ? '61,122,0,' : '200,244,104,'; }
  function buildGrid() {
    var grid = {};
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], cx = Math.floor(p.x/LINK), cy = Math.floor(p.y/LINK), k = cx+','+cy;
      if (!grid[k]) grid[k] = [];
      grid[k].push(i);
    }
    return grid;
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var c = color(), i, p, dx, dy, d;
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      p.x += p.vx; p.y += p.vy; p.l = (p.l + .002) % 1;
      if (p.x < -2) p.x = W+2; if (p.x > W+2) p.x = -2;
      if (p.y < -2) p.y = H+2; if (p.y > H+2) p.y = -2;
      ctx.beginPath(); ctx.arc(p.x, p.y, .9, 0, Math.PI*2);
      ctx.fillStyle = 'rgba('+c+(Math.sin(p.l*Math.PI)*.5)+')'; ctx.fill();
    }
    var grid = buildGrid(), seen = {};
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      var gx = Math.floor(p.x/LINK), gy = Math.floor(p.y/LINK);
      for (var nx = gx-1; nx <= gx+1; nx++) {
        for (var ny = gy-1; ny <= gy+1; ny++) {
          var cell = grid[nx+','+ny];
          if (!cell) continue;
          for (var ci = 0; ci < cell.length; ci++) {
            var j = cell[ci];
            if (j <= i) continue;
            var key = i+'-'+j;
            if (seen[key]) continue;
            seen[key] = true;
            dx = p.x-pts[j].x; dy = p.y-pts[j].y; d = Math.sqrt(dx*dx+dy*dy);
            if (d < LINK) {
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = 'rgba('+c+((1-d/LINK)*.07)+')'; ctx.lineWidth = .5; ctx.stroke();
            }
          }
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }
  function init() {
    cancelAnimationFrame(raf); resize();
    N = window.innerWidth < 600 ? 30 : 65;
    pts = [];
    for (var i = 0; i < N; i++) pts.push(mkPt());
    draw();
  }
  init();
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(init, 120); }, { passive: true });
}());

/* ── 7. CUSTOM CURSOR ── */
(function () {
  var dot = $('cd'), ring = $('cr');
  if (!dot || !ring) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var mx = 0, my = 0, rx = 0, ry = 0, active = false;
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!active) { rx = mx; ry = my; active = true; document.body.classList.add('has-cursor'); dot.style.opacity = '1'; ring.style.opacity = '.6'; }
    dot.style.left = mx+'px'; dot.style.top = my+'px';
  }, { passive: true });
  document.addEventListener('mouseleave', function () { dot.style.opacity = ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { if (active) { dot.style.opacity = '1'; ring.style.opacity = '.6'; } });
  (function loop() { rx += (mx-rx)*.12; ry += (my-ry)*.12; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(loop); }());
  var SEL = 'a, button, label, [data-tilt], .pill, .tag, .badge, .cert, .proj, .stat, .social, .tt, .copy-btn';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(SEL)) { ring.style.width='50px'; ring.style.height='50px'; ring.style.borderColor='var(--acc2)'; ring.style.opacity='.85'; }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(SEL)) { ring.style.width='34px'; ring.style.height='34px'; ring.style.borderColor='var(--acc)'; ring.style.opacity='.6'; }
  });
}());

/* ── 8. NAV ACTIVE STATE ── */
(function () {
  var nav = $('nv'), links = document.querySelectorAll('.na');
  if (!nav) return;
  var ticking = false;
  function updateNav() { nav.classList.toggle('scrolled', window.scrollY > 40); ticking = false; }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(updateNav); ticking = true; } }, { passive: true });
  updateNav();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#'+e.target.id); });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });
}());

/* ── 9. MOBILE NAV ── */
(function () {
  var hb = $('hb'), mo = $('mo');
  if (!hb || !mo) return;
  document.querySelectorAll('#nls .na').forEach(function (l) { mo.appendChild(l.cloneNode(true)); });
  function toggle(open) {
    hb.classList.toggle('open', open); hb.setAttribute('aria-expanded', String(open));
    mo.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : '';
  }
  hb.addEventListener('click', function () { toggle(!mo.classList.contains('open')); });
  mo.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
  mo.addEventListener('click', function (e) { if (e.target === mo) toggle(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
}());

/* ── 10. SCROLL REVEAL ── */
(function () {
  try {
    var els = document.querySelectorAll('.rv');
    if (!els.length) return;
    document.body.classList.add('js-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { document.querySelectorAll('.rv:not(.visible)').forEach(function (el) { el.classList.add('visible'); }); }, 1500);
  } catch (e) { document.body.classList.remove('js-ready'); }
}());

/* ── 11. ANIMATED COUNTERS ── */
(function () {
  var els = document.querySelectorAll('.stat-n[data-t]');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = +el.dataset.t, dur = 1200, t0 = performance.now();
      (function tick(now) { var p = Math.min((now-t0)/dur, 1); el.textContent = Math.round((1-Math.pow(1-p,4))*target); if (p < 1) requestAnimationFrame(tick); }(performance.now()));
      io.unobserve(el);
    });
  }, { threshold: .5 });
  els.forEach(function (el) { io.observe(el); });
}());

/* ── 12. PROJECT CARD TILT + GLOW ── */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    var glow = card.querySelector('.proj-glow');
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var cx = (e.clientX-r.left)/r.width, cy = (e.clientY-r.top)/r.height;
      card.style.transform = 'perspective(700px) rotateX('+((cy-.5)*-7)+'deg) rotateY('+((cx-.5)*7)+'deg) translateZ(4px)';
      card.style.transition = 'transform .1s linear';
      if (glow) { glow.style.setProperty('--gx', (cx*100)+'%'); glow.style.setProperty('--gy', (cy*100)+'%'); }
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)'; });
  });
}());

/* ── 13. GITHUB CONTRIBUTION GRAPH ── */
(function () {
  var canvas = $('gh-canvas'), fallback = $('gh-fallback'), totalEl = $('gh-total');
  var wrapper = canvas && canvas.parentElement;
  if (!canvas || !wrapper) return;
  var DARK_PAL = ['#1c2030','#1e3a1e','#2d5a1e','#4a8c2a','#7cc832'];
  var LIGHT_PAL = ['#ebedf0','#c6e48b','#7bc96f','#239a3b','#196127'];
  var ROWS = 7, GAP = 3, LABEL = 18;
  function getPal() { return ROOT.getAttribute('data-theme') === 'light' ? LIGHT_PAL : DARK_PAL; }
  function drawGraph(weeks) {
    if (!weeks || !weeks.length) return;
    var totalWeeks = weeks.length, containerW = wrapper.clientWidth || 720;
    var CELL = Math.max(8, Math.floor((containerW+GAP)/totalWeeks-GAP));
    var W = totalWeeks*(CELL+GAP)-GAP, H = LABEL+ROWS*(CELL+GAP)-GAP;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr);
    canvas.style.width = '100%'; canvas.style.height = H+'px';
    var ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);
    var p = getPal(), isLight = ROOT.getAttribute('data-theme') === 'light';
    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    ctx.font = (Math.max(8,CELL-2))+'px "JetBrains Mono", monospace';
    ctx.fillStyle = isLight ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.3)'; ctx.textBaseline = 'top';
    var lastMon = -1;
    for (var wi = 0; wi < weeks.length; wi++) {
      var sun = weeks[wi] && weeks[wi][0];
      if (sun && sun.date) { var mo = new Date(sun.date+'T12:00:00').getMonth(); if (mo !== lastMon) { ctx.fillText(MONTHS[mo], wi*(CELL+GAP), 0); lastMon = mo; } }
    }
    for (var w = 0; w < weeks.length; w++) {
      for (var d = 0; d < ROWS; d++) {
        var cell = weeks[w] && weeks[w][d]; if (!cell) continue;
        var x = w*(CELL+GAP), y = LABEL+d*(CELL+GAP), lv = Math.min(Math.max(cell.level||0,0),4);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, CELL, CELL, Math.max(2, CELL*0.18)); else ctx.rect(x, y, CELL, CELL);
        ctx.fillStyle = p[lv]; ctx.fill();
      }
    }
  }
  function showFallback() { canvas.style.display = 'none'; if (fallback) fallback.style.display = 'block'; }
  function load() {
    /* ── sessionStorage cache: one network request per session ──
       Prevents re-fetching on every tab open or page refresh.     */
    var CACHE_KEY = 'gh_contrib_v1';
    var cached = null;
    try { cached = sessionStorage.getItem(CACHE_KEY); } catch (e) {}

    var promise = cached
      ? Promise.resolve(JSON.parse(cached))
      : fetch('https://github-contributions-api.deno.dev/callmecla')
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (json) {
            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(json)); } catch (e) {}
            return json;
          });

    promise.then(function (json) {
        var flat = json && json.contributions;
        if (!flat || !flat.length) { showFallback(); return; }
        flat = flat.slice().sort(function (a,b) { return a.date < b.date ? -1 : 1; });
        var weeks = [], curWeek = null, total = 0;
        flat.forEach(function (c) {
          var dayOfWeek = new Date(c.date+'T12:00:00').getDay();
          if (dayOfWeek === 0 || curWeek === null) {
            if (curWeek && curWeek.length < 7) while (curWeek.length < 7) curWeek.push({ count:0, level:0, date:'' });
            curWeek = [];
            if (dayOfWeek !== 0) for (var pad = 0; pad < dayOfWeek; pad++) curWeek.push({ count:0, level:0, date:'' });
            weeks.push(curWeek);
          }
          curWeek.push({ count: c.count, level: c.level||0, date: c.date });
          total += c.count || 0;
        });
        if (curWeek && curWeek.length < 7) while (curWeek.length < 7) curWeek.push({ count:0, level:0, date:'' });
        if (weeks.length > 53) weeks = weeks.slice(weeks.length-53);
        drawGraph(weeks); canvas.style.display = 'block';
        if (totalEl) totalEl.textContent = total.toLocaleString()+' contributions in the last year';
        new MutationObserver(function () { drawGraph(weeks); }).observe(ROOT, { attributes: true, attributeFilter: ['data-theme'] });
        var rt;
        window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { drawGraph(weeks); }, 150); }, { passive: true });
      }).catch(showFallback);
  }
  var graphEl = $('gh-graph');
  if (graphEl && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) { if (entries[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '200px' });
    io.observe(graphEl);
  } else { load(); }
}());

/* ── 14. PROFILE PHOTO ── */
(function () {
  var inp = $('phu'), img = $('pi');
  if (!inp || !img) return;
  var saved = ls.get('pf_photo');
  if (saved) img.src = saved;
  inp.addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      var dataUrl = ev.target.result; img.src = dataUrl;
      if (dataUrl.length < 2*1024*1024) { var ok = ls.set('pf_photo', dataUrl); toast(ok ? '📷 Photo updated & saved!' : '📷 Photo updated (storage full)', ok ? 'ok' : '', 2500); }
      else toast('📷 Photo updated (too large to save)', '', 3000);
    };
    reader.readAsDataURL(f);
  });
  window.resetPhoto = function () { ls.remove('pf_photo'); img.src = img.dataset.fallback || 'profile.jpg'; toast('🗑 Photo reset', '', 2000); };
}());

/* ── 15. COPY EMAIL ── */
(function () {
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var text = btn.dataset.copy; if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast('📋 Email copied!', 'ok', 2500); }).catch(function () { toast('Could not copy.', 'err', 3000); });
      } else {
        var tmp = document.createElement('input'); tmp.value = text; document.body.appendChild(tmp); tmp.select(); document.execCommand('copy'); document.body.removeChild(tmp);
        toast('📋 Email copied!', 'ok', 2500);
      }
    });
  });
}());

/* ── 16. WIP PROJECT LINKS ── */
(function () {
  document.querySelectorAll('.proj-link[data-wip]').forEach(function (link) { link.setAttribute('aria-disabled','true'); link.setAttribute('tabindex','-1'); });
}());

/* ── 17. CONTACT FORM — EmailJS (lazy-loaded) ── */
(function () {
  var PK = 'alg84AK46Bvk1Yx4b', SI = 'service_wg7jkbe', TI = 'template_0oafehi', YN = 'Clarence Flores';
  var form = $('cf'); if (!form) return;
  var btn = $('cfb'), lbl = $('cbl'), spin = $('cs');
  var ejsReady = false;

  /* ── Lazy-load the EmailJS SDK only when contact section nears viewport ──
     Saves ~15 KB on every page load for visitors who never scroll to contact. */
  function loadEmailJS(cb) {
    if (ejsReady) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = function () { emailjs.init({ publicKey: PK }); ejsReady = true; cb(); };
    s.onerror = function () { cb(new Error('EmailJS failed to load')); };
    document.body.appendChild(s);
  }

  var contact = document.getElementById('contact');
  if (contact && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); loadEmailJS(function () {}); }
    }, { rootMargin: '300px' });
    io.observe(contact);
  }

  function setLoading(on) { btn.disabled = on; lbl.textContent = on ? 'Sending…' : 'Send Message'; if (spin) spin.style.display = on ? 'inline-block' : 'none'; }
  function shake(el) { el.style.animation = 'none'; el.getBoundingClientRect(); el.style.animation = 'shake .4s ease'; el.addEventListener('animationend', function () { el.style.animation = ''; }, { once: true }); el.focus(); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.querySelector('#cfn').value.trim(), email = form.querySelector('#cfe').value.trim(), msg = form.querySelector('#cfm').value.trim();
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name) { shake(form.querySelector('#cfn')); return; }
    if (!re.test(email)) { shake(form.querySelector('#cfe')); return; }
    if (!msg) { shake(form.querySelector('#cfm')); return; }
    setLoading(true);
    loadEmailJS(function (err) {
      if (err) { setLoading(false); toast('✗ Send failed — email me directly.', 'err'); return; }
      emailjs.send(SI, TI, { to_name: YN, from_name: name, from_email: email, subject: form.querySelector('#cfs').value.trim() || '(no subject)', message: msg, reply_to: email })
        .then(function () { setLoading(false); form.reset(); toast('✓ Message sent!', 'ok'); },
              function (err) { console.error('[EmailJS]', err); setLoading(false); toast('✗ Send failed — email me directly.', 'err'); });
    });
  });
}());

/* ══════════════════════════════════════════════════════════
   FEATURE 18 — SYSTEM THEME SYNC (OS live listener)
   The initial theme is set before paint in index.html.
   This adds a live listener for OS theme changes mid-session.
   ══════════════════════════════════════════════════════════ */
(function () {
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', function (e) {
    if (!ls.get('pt')) ROOT.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  });
}());

/* ══════════════════════════════════════════════════════════
   FEATURE 19 — MAGNETIC BUTTON HOVER
   Elements with class .mag translate toward the cursor.
   Desktop + fine pointer only. Respects reduced-motion.
   ══════════════════════════════════════════════════════════ */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var STRENGTH = 0.32;

  document.querySelectorAll('.mag').forEach(function (el) {
    var tx = 0, ty = 0, animating = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function loop() {
      if (!animating) return;
      tx = lerp(tx, el._tx || 0, 0.14);
      ty = lerp(ty, el._ty || 0, 0.14);
      el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
      requestAnimationFrame(loop);
    }

    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      el._tx = (e.clientX - (r.left + r.width  / 2)) * STRENGTH;
      el._ty = (e.clientY - (r.top  + r.height / 2)) * STRENGTH;
      if (!animating) { animating = true; loop(); }
    });

    el.addEventListener('mouseleave', function () {
      el._tx = 0; el._ty = 0;
      function snapBack() {
        tx = lerp(tx, 0, 0.16); ty = lerp(ty, 0, 0.16);
        el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
        if (Math.abs(tx) > 0.05 || Math.abs(ty) > 0.05) requestAnimationFrame(snapBack);
        else { tx = ty = 0; el.style.transform = ''; animating = false; }
      }
      requestAnimationFrame(snapBack);
    });
  });
}());

/* ══════════════════════════════════════════════════════════
   FEATURE 20 — COMMAND PALETTE  ⌘K / Ctrl+K
   ══════════════════════════════════════════════════════════ */
(function () {
  var overlay = $('cp-overlay');
  var modal   = $('cp-modal');
  var input   = $('cp-input');
  var results = $('cp-results');
  var trigger = $('cp-trigger');
  if (!overlay || !input || !results) return;

  var ITEMS = [
    { icon:'👤', label:'About Me',        cat:'Section', keys:'about me bio',                     action: function(){ go('#about'); } },
    { icon:'🎓', label:'Education',        cat:'Section', keys:'education university degree qcu',  action: function(){ go('#education'); } },
    { icon:'💼', label:'Experience',       cat:'Section', keys:'experience work job career',        action: function(){ go('#experience'); } },
    { icon:'🚀', label:'Projects',         cat:'Section', keys:'projects portfolio work',           action: function(){ go('#projects'); } },
    { icon:'⚙️', label:'Skills',           cat:'Section', keys:'skills tech stack react node',      action: function(){ go('#skills'); } },
    { icon:'📜', label:'Certifications',   cat:'Section', keys:'certifications aws google meta',    action: function(){ go('#certifications'); } },
    { icon:'✉️', label:'Contact',          cat:'Section', keys:'contact email hire message',        action: function(){ go('#contact'); } },
    { icon:'🚀', label:'LaunchPad',        cat:'Project', keys:'launchpad no-code landing vercel',  action: function(){ go('#projects'); } },
    { icon:'🧠', label:'MindMap AI',       cat:'Project', keys:'mindmap ai knowledge openai d3',    action: function(){ go('#projects'); } },
    { icon:'📊', label:'DataPulse',        cat:'Project', keys:'datapulse analytics kafka webgl',   action: function(){ go('#projects'); } },
    { icon:'🎨', label:'Pixel Studio',     cat:'Project', keys:'pixel studio art webrtc canvas',    action: function(){ go('#projects'); } },
    { icon:'🔐', label:'VaultPass',        cat:'Project', keys:'vaultpass password crypto rust',    action: function(){ go('#projects'); } },
    { icon:'🌍', label:'EcoTrack',         cat:'Project', keys:'ecotrack carbon vue firebase',      action: function(){ go('#projects'); } },
    { icon:'⬇️', label:'Download Resume',  cat:'Action',  keys:'download resume cv pdf',            action: function(){ var a=document.createElement('a'); a.href='cv.pdf'; a.download=''; a.click(); closePalette(); } },
    { icon:'✉️', label:'Send Email',       cat:'Action',  keys:'email send contact message',        action: function(){ window.location.href='mailto:flores.clarencekyle.manrique@gmail.com'; closePalette(); } },
    { icon:'🐙', label:'GitHub',           cat:'Action',  keys:'github code repository',            action: function(){ window.open('https://github.com/callmecla','_blank'); closePalette(); } },
    { icon:'💼', label:'LinkedIn',         cat:'Action',  keys:'linkedin professional network',     action: function(){ window.open('https://linkedin.com/in/clarenceflores8/','_blank'); closePalette(); } },
    { icon:'☀️', label:'Light Mode',       cat:'Theme',   keys:'light theme mode day',              action: function(){ setTh('light'); } },
    { icon:'🌙', label:'Dark Mode',        cat:'Theme',   keys:'dark theme mode night',             action: function(){ setTh('dark'); } },
  ];

  function setTh(t) { ROOT.setAttribute('data-theme',t); ls.set('pt',t); toast(t==='light'?'☀️ Light mode':'🌙 Dark mode','',2000); closePalette(); }

  function go(hash) {
    closePalette();
    setTimeout(function () { var el = document.querySelector(hash); if (el) el.scrollIntoView({ behavior:'smooth' }); }, 100);
  }

  var activeIdx = -1, flatList = [];

  function openPalette() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    input.value = ''; render('');
    requestAnimationFrame(function () { input.focus(); });
  }

  function closePalette() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    activeIdx = -1;
  }

  function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function highlight(text, q) {
    if (!q) return escHtml(text);
    return escHtml(text).replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>');
  }

  function render(q) {
    var query = q.trim().toLowerCase();
    var filtered = query
      ? ITEMS.filter(function (it) { return (it.label+' '+it.keys).toLowerCase().indexOf(query) !== -1; })
      : ITEMS;

    results.innerHTML = '';
    flatList = filtered;
    activeIdx = filtered.length ? 0 : -1;

    if (!filtered.length) {
      results.innerHTML = '<div style="text-align:center;padding:1.5rem;font-family:var(--mono);font-size:.72rem;color:var(--tx3)">No results</div>';
      return;
    }

    var groups = {}, ORDER = ['Section','Project','Action','Theme'];
    filtered.forEach(function (it) { if (!groups[it.cat]) groups[it.cat] = []; groups[it.cat].push(it); });

    var globalIdx = 0;
    ORDER.forEach(function (cat) {
      if (!groups[cat]) return;
      var hdr = document.createElement('div');
      hdr.className = 'cp-section-header'; hdr.textContent = cat+'s';
      results.appendChild(hdr);
      groups[cat].forEach(function (item) {
        var i = filtered.indexOf(item);
        var btn = document.createElement('button');
        btn.className = 'cp-item' + (i === 0 ? ' active' : '');
        btn.setAttribute('role','option'); btn.setAttribute('data-idx', i);
        btn.innerHTML =
          '<span class="cp-item-icon">'+item.icon+'</span>'+
          '<span class="cp-item-body">'+
            '<span class="cp-item-label">'+highlight(item.label, query)+'</span>'+
            '<span class="cp-item-cat">'+escHtml(item.cat)+'</span>'+
          '</span>';
        btn.addEventListener('mouseenter', function () { setActive(i); });
        btn.addEventListener('click',      function () { item.action(); });
        results.appendChild(btn);
        globalIdx++;
      });
    });
  }

  function setActive(i) {
    activeIdx = Math.max(0, Math.min(flatList.length-1, i));
    results.querySelectorAll('.cp-item').forEach(function (b) {
      var on = +b.dataset.idx === activeIdx;
      b.classList.toggle('active', on);
      if (on) b.scrollIntoView({ block:'nearest' });
    });
  }

  input.addEventListener('input', function () { render(input.value); });

  input.addEventListener('keydown', function (e) {
    var len = flatList.length;
    if (!len) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((activeIdx+1) % len); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((activeIdx-1+len) % len); }
    else if (e.key === 'Enter') { e.preventDefault(); if (flatList[activeIdx]) flatList[activeIdx].action(); }
    else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
  });

  if (trigger) trigger.addEventListener('click', openPalette);
  window.openCommandPalette = openPalette;

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); overlay.classList.contains('open') ? closePalette() : openPalette(); }
    if (e.key === 'Escape' && overlay.classList.contains('open')) closePalette();
  });

  overlay.addEventListener('click', function (e) { if (!modal.contains(e.target)) closePalette(); });
}());

/* ══════════════════════════════════════════════════════════
   FEATURE 21 — AI CHAT WIDGET
   ══════════════════════════════════════════════════════════ */
(function () {
  var bubble   = $('chat-bubble');
  var panel    = $('chat-panel');
  var closeBtn = $('chat-close');
  var messages = $('chat-messages');
  var inputEl  = $('chat-input');
  var sendBtn  = $('chat-send');
  var sugBox   = $('chat-suggestions');
  if (!bubble || !panel) return;

  var SYSTEM = [
    'You are a helpful AI assistant embedded in Clarence Flores\'s personal portfolio website.',
    'Answer questions about Clarence concisely, warmly, and in 2-4 sentences max.',
    '',
    'NAME: Clarence Flores | ROLE: IT Student, Full-Stack Developer, UI/UX Enthusiast | LOCATION: Philippines',
    'EMAIL: flores.clarencekyle.manrique@gmail.com | GITHUB: github.com/callmecla | LINKEDIN: linkedin.com/in/clarenceflores8',
    '',
    'EDUCATION:',
    '- B.S. IT, Quezon City University (2022-Present), GPA 1.75, Dean\'s List',
    '- STEM, Our Lady of Fatima University (2020-2022), Dean\'s List',
    '- UX Design Bootcamp, Design Academy Online (Summer 2022)',
    '',
    'EXPERIENCE:',
    '- Senior Frontend Engineer @ TechCorp (Jan 2024-Present): SaaS dashboard, -62% load time, mentored 3 devs. Stack: React, TypeScript, GraphQL.',
    '- Full-Stack Developer @ StartupXYZ (Jun 2022-Dec 2023): Fintech app, 3 payment APIs, WebSockets. Stack: Next.js, Node.js, PostgreSQL, AWS.',
    '- Junior Web Developer @ Agency Co. (Sep 2021-May 2022): 12+ client sites, CI/CD. Stack: HTML/CSS, JS, WordPress.',
    '',
    'PROJECTS: LaunchPad (no-code builder, 1200+ users), MindMap AI (knowledge graph), DataPulse (analytics, Kafka), Pixel Studio (WebRTC art editor), VaultPass (E2E password manager), EcoTrack (hackathon winner).',
    '',
    'SKILLS: React/Next.js, TypeScript, CSS/Tailwind, Three.js, Node.js, Python/FastAPI, PostgreSQL, Redis, AWS, Docker, Git, Figma.',
    '',
    'CERTIFICATIONS: AWS Solutions Architect, Google Cloud Developer, Meta Frontend Developer, CompTIA Security+, Python/IBM, MongoDB.',
    '',
    'AVAILABILITY: Open to new opportunities. Direct to email or LinkedIn for hiring.',
    'Only answer questions about Clarence. Keep it friendly, short, plain text only.'
  ].join('\n');

  var history = [], isOpen = false, isBusy = false;

  function togglePanel(open) {
    isOpen = open;
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    if (open) setTimeout(function () { inputEl.focus(); }, 150);
  }

  bubble.addEventListener('click', function () { togglePanel(!isOpen); });
  if (closeBtn) closeBtn.addEventListener('click', function () { togglePanel(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) togglePanel(false); });

  if (sugBox) {
    sugBox.querySelectorAll('.chat-suggestion').forEach(function (btn) {
      btn.addEventListener('click', function () { sugBox.style.display = 'none'; send(btn.dataset.q); });
    });
  }

  inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !isBusy) { e.preventDefault(); send(inputEl.value.trim()); } });
  sendBtn.addEventListener('click', function () { if (!isBusy) send(inputEl.value.trim()); });

  function addMsg(role, text) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    var p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addTyping() {
    var div = document.createElement('div');
    div.className = 'chat-msg ai'; div.id = 'chat-typing-indicator';
    div.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(div); messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() { var t = $('chat-typing-indicator'); if (t) t.parentNode.removeChild(t); }

  function send(text) {
    if (!text || isBusy) return;
    inputEl.value = ''; isBusy = true; sendBtn.disabled = true;
    if (sugBox) sugBox.style.display = 'none';
    addMsg('user', text);
    history.push({ role:'user', content:text });
    addTyping();
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: history,
        system: SYSTEM,
        max_tokens: 300
      })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      removeTyping();
      if (data.error) {
        console.error(data.error);
        addMsg('ai', 'Something went wrong. Try emailing Clarence at flores.clarencekyle.manrique@gmail.com!');
        return;
      }
      var reply = (data.content && data.content[0] && data.content[0].text) || 'Sorry, I couldn\'t get a response right now.';
      history.push({ role:'assistant', content:reply });
      addMsg('ai', reply);
    })
    .catch(function (err) {
      removeTyping();
      console.error('Request failed:', err);
      addMsg('ai', 'Something went wrong. Try emailing Clarence at flores.clarencekyle.manrique@gmail.com!');
    })
    .finally(function () { isBusy = false; sendBtn.disabled = false; });
  }
}());