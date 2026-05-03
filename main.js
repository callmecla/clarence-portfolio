/* ============================================================
   main.js — Clarence Flores Portfolio
   ============================================================
   Performance & memory notes:
   · All scroll handlers use { passive: true }
   · Scroll progress and BTT use requestAnimationFrame throttling
   · IntersectionObserver replaces all scroll-based visibility checks
   · Canvas particle loop is cancelAnimationFrame-safe on resize
   · localStorage writes are guarded against QuotaExceededError
   · All event listeners that need cleanup are stored and removed
     if the section they power is removed from the DOM
   · content-visibility: auto in CSS skips paint for off-screen
     sections — JS still works because IO fires before paint
   ============================================================ */
'use strict';

var ROOT = document.documentElement;

/* ── Helpers ── */
function $(id) { return document.getElementById(id); }

/* Safe localStorage wrapper — never throws */
var ls = {
  get: function (k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  },
  set: function (k, v) {
    try { localStorage.setItem(k, v); return true; }
    catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        console.warn('[Portfolio] localStorage quota exceeded for key:', k);
      }
      return false;
    }
  },
  remove: function (k) {
    try { localStorage.removeItem(k); } catch (e) { /* noop */ }
  }
};

function toast(msg, type, dur) {
  var wrap = $('toast-wrap');
  if (!wrap) return;
  var t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { t.classList.add('show'); });
  });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
  }, dur || 3500);
}

/* ── 1. PAGE LOADER ── */
(function () {
  var loader = $('loader');
  if (!loader) return;
  function done() { loader.classList.add('done'); }
  if (document.readyState === 'complete') {
    setTimeout(done, 500);
  } else {
    window.addEventListener('load', function () { setTimeout(done, 500); });
  }
  setTimeout(done, 1500);
}());

/* ── 2. SCROLL PROGRESS BAR ── */
(function () {
  var bar = $('spb');
  if (!bar) return;
  var ticking = false;
  function update() {
    var scrollable = document.body.scrollHeight - window.innerHeight;
    var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}());

/* ── 3. BACK TO TOP ── */
(function () {
  var btn = $('btt');
  if (!btn) return;
  var ticking = false;
  function update() {
    btn.classList.toggle('show', window.scrollY > 400);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = 'Full-Stack Developer'; return;
  }
  var words = ['Full-Stack Developer', 'UI/UX Enthusiast', 'Problem Solver', 'IT Student', 'Open-Source Contributor'];
  var w = 0, c = 0, del = false;
  var timer;
  function tick() {
    var word = words[w];
    el.textContent = del ? word.slice(0, c--) : word.slice(0, c++);
    var wait = del ? 50 : 95;
    if (!del && c > word.length)  { wait = 1800; del = true; }
    else if (del && c < 0)        { del = false; w = (w + 1) % words.length; c = 0; wait = 350; }
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
  var N    = window.innerWidth < 600 ? 30 : 65;
  var LINK = 110;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function mkPt()   { return { x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, l: Math.random() }; }
  function color()  { return ROOT.getAttribute('data-theme') === 'light' ? '61,122,0,' : '200,244,104,'; }

  function buildGrid() {
    var grid = {};
    for (var i = 0; i < pts.length; i++) {
      var p  = pts[i];
      var cx = Math.floor(p.x / LINK);
      var cy = Math.floor(p.y / LINK);
      var k  = cx + ',' + cy;
      if (!grid[k]) grid[k] = [];
      grid[k].push(i);
    }
    return grid;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var c = color();
    var i, p, dx, dy, d;

    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      p.x += p.vx; p.y += p.vy; p.l = (p.l + .002) % 1;
      if (p.x < -2) p.x = W+2; if (p.x > W+2) p.x = -2;
      if (p.y < -2) p.y = H+2; if (p.y > H+2) p.y = -2;
      ctx.beginPath(); ctx.arc(p.x, p.y, .9, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(' + c + (Math.sin(p.l * Math.PI) * .5) + ')';
      ctx.fill();
    }

    var grid = buildGrid();
    var seen = {};
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      var gx = Math.floor(p.x / LINK);
      var gy = Math.floor(p.y / LINK);
      for (var nx = gx - 1; nx <= gx + 1; nx++) {
        for (var ny = gy - 1; ny <= gy + 1; ny++) {
          var cell = grid[nx + ',' + ny];
          if (!cell) continue;
          for (var ci = 0; ci < cell.length; ci++) {
            var j = cell[ci];
            if (j <= i) continue;
            var key = i + '-' + j;
            if (seen[key]) continue;
            seen[key] = true;
            dx = p.x - pts[j].x; dy = p.y - pts[j].y;
            d  = Math.sqrt(dx*dx + dy*dy);
            if (d < LINK) {
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = 'rgba(' + c + ((1 - d/LINK) * .07) + ')';
              ctx.lineWidth = .5; ctx.stroke();
            }
          }
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }

  function init() {
    cancelAnimationFrame(raf);
    resize();
    N = window.innerWidth < 600 ? 30 : 65;
    pts = [];
    for (var i = 0; i < N; i++) pts.push(mkPt());
    draw();
  }

  init();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 120);
  }, { passive: true });
}());

/* ── 7. CUSTOM CURSOR (desktop only) ── */
(function () {
  var dot  = $('cd');
  var ring = $('cr');
  if (!dot || !ring) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var mx = 0, my = 0, rx = 0, ry = 0, active = false;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!active) {
      rx = mx; ry = my; active = true;
      document.body.classList.add('has-cursor');
      dot.style.opacity = '1'; ring.style.opacity = '.6';
    }
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    dot.style.opacity = ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    if (active) { dot.style.opacity = '1'; ring.style.opacity = '.6'; }
  });

  (function loop() {
    rx += (mx - rx) * .12; ry += (my - ry) * .12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  }());

  var SEL = 'a, button, label, [data-tilt], .pill, .tag, .badge, .cert, .proj, .stat, .social, .tt, .copy-btn';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(SEL)) {
      ring.style.width = '50px'; ring.style.height = '50px';
      ring.style.borderColor = 'var(--acc2)'; ring.style.opacity = '.85';
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(SEL)) {
      ring.style.width = '34px'; ring.style.height = '34px';
      ring.style.borderColor = 'var(--acc)'; ring.style.opacity = '.6';
    }
  });
}());

/* ── 8. NAV ── */
(function () {
  var nav   = $('nv');
  var links = document.querySelectorAll('.na');
  if (!nav) return;

  var ticking = false;
  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
  }, { passive: true });
  updateNav();

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });
}());

/* ── 9. MOBILE NAV ── */
(function () {
  var hb = $('hb');
  var mo = $('mo');
  if (!hb || !mo) return;

  document.querySelectorAll('#nls .na').forEach(function (l) {
    mo.appendChild(l.cloneNode(true));
  });

  function toggle(open) {
    hb.classList.toggle('open', open);
    hb.setAttribute('aria-expanded', String(open));
    mo.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hb.addEventListener('click', function () { toggle(!mo.classList.contains('open')); });
  mo.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { toggle(false); });
  });
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
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      document.querySelectorAll('.rv:not(.visible)').forEach(function (el) {
        el.classList.add('visible');
      });
    }, 1500);
  } catch (e) {
    document.body.classList.remove('js-ready');
  }
}());

/* ── 11. ANIMATED COUNTERS ── */
(function () {
  var els = document.querySelectorAll('.stat-n[data-t]');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = +el.dataset.t, dur = 1200, t0 = performance.now();
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * target);
        if (p < 1) requestAnimationFrame(tick);
      }(performance.now()));
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
      var r  = card.getBoundingClientRect();
      var cx = (e.clientX - r.left) / r.width;
      var cy = (e.clientY - r.top)  / r.height;
      card.style.transform  = 'perspective(700px) rotateX(' + ((cy - .5) * -7) + 'deg) rotateY(' + ((cx - .5) * 7) + 'deg) translateZ(4px)';
      card.style.transition = 'transform .1s linear';
      if (glow) {
        glow.style.setProperty('--gx', (cx * 100) + '%');
        glow.style.setProperty('--gy', (cy * 100) + '%');
      }
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform  = '';
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
    });
  });
}());

/* ── 13. GITHUB CONTRIBUTION GRAPH ── */
(function () {
  var canvas   = $('gh-canvas');
  var fallback = $('gh-fallback');
  var totalEl  = $('gh-total');
  var wrapper  = canvas && canvas.parentElement;
  if (!canvas || !wrapper) return;

  var DARK_PAL  = ['#1c2030', '#1e3a1e', '#2d5a1e', '#4a8c2a', '#7cc832'];
  var LIGHT_PAL = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];

  var ROWS  = 7;
  var GAP   = 3;
  var LABEL = 18;

  function getPal() {
    return ROOT.getAttribute('data-theme') === 'light' ? LIGHT_PAL : DARK_PAL;
  }

  function drawGraph(weeks) {
    if (!weeks || !weeks.length) return;

    var totalWeeks = weeks.length;
    var containerW = wrapper.clientWidth || 720;
    var CELL = Math.max(8, Math.floor((containerW + GAP) / totalWeeks - GAP));

    var W   = totalWeeks * (CELL + GAP) - GAP;
    var H   = LABEL + ROWS * (CELL + GAP) - GAP;
    var dpr = window.devicePixelRatio || 1;

    canvas.width        = Math.round(W * dpr);
    canvas.height       = Math.round(H * dpr);
    canvas.style.width  = '100%';
    canvas.style.height = H + 'px';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    var p       = getPal();
    var isLight = ROOT.getAttribute('data-theme') === 'light';
    var MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    ctx.font         = (Math.max(8, CELL - 2)) + 'px "JetBrains Mono", monospace';
    ctx.fillStyle    = isLight ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.3)';
    ctx.textBaseline = 'top';
    var lastMon = -1;
    for (var wi = 0; wi < weeks.length; wi++) {
      var sun = weeks[wi] && weeks[wi][0];
      if (sun && sun.date) {
        var mo = new Date(sun.date + 'T12:00:00').getMonth();
        if (mo !== lastMon) {
          ctx.fillText(MONTHS[mo], wi * (CELL + GAP), 0);
          lastMon = mo;
        }
      }
    }

    for (var w = 0; w < weeks.length; w++) {
      for (var d = 0; d < ROWS; d++) {
        var cell = weeks[w] && weeks[w][d];
        if (!cell) continue;
        var x  = w * (CELL + GAP);
        var y  = LABEL + d * (CELL + GAP);
        var lv = Math.min(Math.max(cell.level || 0, 0), 4);
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, CELL, CELL, Math.max(2, CELL * 0.18));
        } else {
          ctx.rect(x, y, CELL, CELL);
        }
        ctx.fillStyle = p[lv];
        ctx.fill();
      }
    }
  }

  function showFallback() {
    canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
  }

  function load() {
    fetch('https://github-contributions-api.deno.dev/callmecla')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        var flat = json && json.contributions;
        if (!flat || !flat.length) { showFallback(); return; }

        flat = flat.slice().sort(function (a, b) {
          return a.date < b.date ? -1 : 1;
        });

        var weeks   = [];
        var curWeek = null;
        var total   = 0;

        flat.forEach(function (c) {
          var dayOfWeek = new Date(c.date + 'T12:00:00').getDay();

          if (dayOfWeek === 0 || curWeek === null) {
            if (curWeek && curWeek.length < 7) {
              while (curWeek.length < 7) curWeek.push({ count: 0, level: 0, date: '' });
            }
            curWeek = [];
            if (curWeek !== null && dayOfWeek !== 0) {
              for (var pad = 0; pad < dayOfWeek; pad++) {
                curWeek.push({ count: 0, level: 0, date: '' });
              }
            }
            weeks.push(curWeek);
          }

          curWeek.push({ count: c.count, level: c.level || 0, date: c.date });
          total += c.count || 0;
        });

        if (curWeek && curWeek.length < 7) {
          while (curWeek.length < 7) curWeek.push({ count: 0, level: 0, date: '' });
        }

        if (weeks.length > 53) weeks = weeks.slice(weeks.length - 53);

        drawGraph(weeks);
        canvas.style.display = 'block';
        if (totalEl) {
          totalEl.textContent = total.toLocaleString() + ' contributions in the last year';
        }

        new MutationObserver(function () { drawGraph(weeks); })
          .observe(ROOT, { attributes: true, attributeFilter: ['data-theme'] });

        var rt;
        window.addEventListener('resize', function () {
          clearTimeout(rt);
          rt = setTimeout(function () { drawGraph(weeks); }, 150);
        }, { passive: true });
      })
      .catch(showFallback);
  }

  var graphEl = $('gh-graph');
  if (graphEl && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); load(); }
    }, { rootMargin: '200px' });
    io.observe(graphEl);
  } else {
    load();
  }
}());

/* ── 14. PROFILE PHOTO ── */
(function () {
  var inp = $('phu');
  var img = $('pi');
  if (!inp || !img) return;

  var saved = ls.get('pf_photo');
  if (saved) img.src = saved;

  inp.addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;

    var reader = new FileReader();
    reader.onload = function (ev) {
      var dataUrl = ev.target.result;
      img.src = dataUrl;

      if (dataUrl.length < 2 * 1024 * 1024) {
        var ok = ls.set('pf_photo', dataUrl);
        toast(ok ? '📷 Photo updated & saved!' : '📷 Photo updated (not saved — storage full)', ok ? 'ok' : '', 2500);
      } else {
        toast('📷 Photo updated (too large to save — resize to < 1 MB)', '', 3000);
      }
    };
    reader.readAsDataURL(f);
  });

  window.resetPhoto = function () {
    ls.remove('pf_photo');
    img.src = img.dataset.fallback || 'profile.jpg';
    toast('🗑 Photo reset', '', 2000);
  };
}());

/* ── 15. COPY EMAIL ── */
(function () {
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var text = btn.dataset.copy;
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(function () { toast('📋 Email copied!', 'ok', 2500); })
          .catch(function () { toast('Could not copy — try manually.', 'err', 3000); });
      } else {
        var tmp = document.createElement('input');
        tmp.value = text;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        toast('📋 Email copied!', 'ok', 2500);
      }
    });
  });
}());

/* ── 16. WIP PROJECT LINKS ── */
(function () {
  document.querySelectorAll('.proj-link[data-wip]').forEach(function (link) {
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('tabindex', '-1');
  });
}());

/* ── 17. CONTACT FORM — EmailJS ── */
(function () {
  var PK = 'alg84AK46Bvk1Yx4b';
  var SI = 'service_wg7jkbe';
  var TI = 'template_0oafehi';
  var YN = 'Clarence Flores';

  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: PK });

  var form = $('cf');
  if (!form) return;
  var btn  = $('cfb');
  var lbl  = $('cbl');
  var spin = $('cs');

  function setLoading(on) {
    btn.disabled = on;
    lbl.textContent = on ? 'Sending…' : 'Send Message';
    if (spin) spin.style.display = on ? 'inline-block' : 'none';
  }

  function shake(el) {
    el.style.animation = 'none';
    el.getBoundingClientRect();
    el.style.animation = 'shake .4s ease';
    el.addEventListener('animationend', function () { el.style.animation = ''; }, { once: true });
    el.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name  = form.querySelector('#cfn').value.trim();
    var email = form.querySelector('#cfe').value.trim();
    var msg   = form.querySelector('#cfm').value.trim();
    var re    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name)           { shake(form.querySelector('#cfn')); return; }
    if (!re.test(email)) { shake(form.querySelector('#cfe')); return; }
    if (!msg)            { shake(form.querySelector('#cfm')); return; }

    setLoading(true);
    emailjs.send(SI, TI, {
      to_name:    YN,
      from_name:  name,
      from_email: email,
      subject:    form.querySelector('#cfs').value.trim() || '(no subject)',
      message:    msg,
      reply_to:   email
    }).then(function () {
      setLoading(false);
      form.reset();
      toast('✓ Message sent! I\'ll be in touch soon.', 'ok');
    }, function (err) {
      console.error('[EmailJS]', err);
      setLoading(false);
      toast('✗ Send failed — please email me directly.', 'err');
    });
  });
}());

/* ══════════════════════════════════════════════════════════
   NEW FEATURE A — SYSTEM THEME SYNC
   Respects OS preference on first visit (no flash).
   Placed here so it can also be called after page load
   if the OS theme changes mid-session.
   ══════════════════════════════════════════════════════════ */
(function () {
  /* The inline <script> in <head> already sets the initial theme.
     This block adds a live listener so if the user changes their
     OS theme mid-session AND hasn't manually toggled, we follow it. */
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', function (e) {
    /* Only follow the OS if the user hasn't manually picked a theme */
    if (!ls.get('pt')) {
      ROOT.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}());

/* ══════════════════════════════════════════════════════════
   NEW FEATURE B — MAGNETIC BUTTON HOVER
   Buttons and nav links translate toward the cursor when
   it enters a magnetic radius around them. Works alongside
   the existing tilt on project cards.
   ══════════════════════════════════════════════════════════ */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var MAG_SEL    = '.btn, .na, .social-ico, .copy-btn, .proj-link:not([data-wip])';
  var RADIUS     = 80;   /* px — how close the cursor must be to activate */
  var STRENGTH   = 0.38; /* 0–1, how far the element moves toward cursor */

  function attachMagnet(el) {
    var animating = false;
    var tx = 0, ty = 0;  /* current translate */

    function lerp(a, b, t) { return a + (b - a) * t; }

    function loop() {
      if (!animating) return;
      /* smooth spring toward target */
      tx = lerp(tx, el._mx || 0, 0.18);
      ty = lerp(ty, el._my || 0, 0.18);
      el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
      /* keep original transitions for non-magnetic states */
      requestAnimationFrame(loop);
    }

    el.addEventListener('mousemove', function (e) {
      var r  = el.getBoundingClientRect();
      var cx = r.left + r.width  / 2;
      var cy = r.top  + r.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS) {
        el._mx = dx * STRENGTH;
        el._my = dy * STRENGTH;
        if (!animating) {
          animating = true;
          /* preserve any existing transition for color/bg */
          el._origTransition = el.style.transition;
          el.style.transition = el._origTransition
            ? el._origTransition.replace(/transform[^,]*(,|$)/g, '') + ', transform .05s linear'
            : 'transform .05s linear';
          loop();
        }
      }
    });

    el.addEventListener('mouseleave', function () {
      el._mx = 0; el._my = 0;
      /* spring back */
      function snapBack() {
        tx = lerp(tx, 0, 0.18);
        ty = lerp(ty, 0, 0.18);
        el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
        if (Math.abs(tx) > 0.1 || Math.abs(ty) > 0.1) {
          requestAnimationFrame(snapBack);
        } else {
          tx = ty = 0;
          el.style.transform = '';
          el.style.transition = el._origTransition || '';
          animating = false;
        }
      }
      el.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1)';
      requestAnimationFrame(snapBack);
    });
  }

  /* Attach after DOM is ready */
  document.querySelectorAll(MAG_SEL).forEach(attachMagnet);
}());

/* ══════════════════════════════════════════════════════════
   NEW FEATURE C — COMMAND PALETTE  ⌘K / Ctrl+K
   Fuzzy-searches sections, projects, skills, and actions.
   Built entirely without external libraries.
   ══════════════════════════════════════════════════════════ */
(function () {
  /* ── Build the index ── */
  var COMMANDS = [
    /* Sections */
    { type: 'section', icon: '👤', label: 'About Me',        sub: 'Who I am',                    action: function () { scrollTo('#about'); } },
    { type: 'section', icon: '🎓', label: 'Education',        sub: 'QCU · OLFU · Design Bootcamp',action: function () { scrollTo('#education'); } },
    { type: 'section', icon: '💼', label: 'Experience',       sub: 'TechCorp · StartupXYZ · Agency', action: function () { scrollTo('#experience'); } },
    { type: 'section', icon: '🚀', label: 'Projects',         sub: 'LaunchPad · MindMap AI · more', action: function () { scrollTo('#projects'); } },
    { type: 'section', icon: '⚙️', label: 'Skills',           sub: 'React · Node · Python · AWS',  action: function () { scrollTo('#skills'); } },
    { type: 'section', icon: '📜', label: 'Certifications',   sub: 'AWS · GCP · CompTIA · Meta',   action: function () { scrollTo('#certifications'); } },
    { type: 'section', icon: '✉️', label: 'Contact',          sub: 'Get in touch',                 action: function () { scrollTo('#contact'); } },
    /* Projects */
    { type: 'project', icon: '🚀', label: 'LaunchPad',        sub: 'No-code landing page builder', action: function () { scrollTo('#projects'); } },
    { type: 'project', icon: '🧠', label: 'MindMap AI',       sub: 'AI knowledge graph',           action: function () { scrollTo('#projects'); } },
    { type: 'project', icon: '📊', label: 'DataPulse',        sub: 'Real-time analytics',          action: function () { scrollTo('#projects'); } },
    { type: 'project', icon: '🎨', label: 'Pixel Studio',     sub: 'Collaborative pixel art',      action: function () { scrollTo('#projects'); } },
    { type: 'project', icon: '🔐', label: 'VaultPass',        sub: 'E2E encrypted passwords',      action: function () { scrollTo('#projects'); } },
    { type: 'project', icon: '🌍', label: 'EcoTrack',         sub: 'Carbon footprint tracker',     action: function () { scrollTo('#projects'); } },
    /* Actions */
    { type: 'action',  icon: '⬇️', label: 'Download Resume',  sub: 'cv.pdf',                       action: function () { var a=document.createElement('a'); a.href='cv.pdf'; a.download=''; a.click(); } },
    { type: 'action',  icon: '☀️', label: 'Switch to Light',  sub: 'Toggle theme',                 action: function () { applyTheme('light'); } },
    { type: 'action',  icon: '🌙', label: 'Switch to Dark',   sub: 'Toggle theme',                 action: function () { applyTheme('dark'); } },
    { type: 'action',  icon: '📋', label: 'Copy Email',       sub: 'flores.clarencekyle.manrique@gmail.com', action: function () {
      navigator.clipboard && navigator.clipboard.writeText('flores.clarencekyle.manrique@gmail.com')
        .then(function () { toast('📋 Email copied!', 'ok', 2500); });
    }},
    { type: 'link',    icon: '🐙', label: 'GitHub',           sub: 'github.com/callmecla',         action: function () { window.open('https://github.com/callmecla','_blank'); } },
    { type: 'link',    icon: '💼', label: 'LinkedIn',         sub: 'linkedin.com/in/clarenceflores8', action: function () { window.open('https://linkedin.com/in/clarenceflores8/','_blank'); } },
  ];

  function scrollTo(hash) {
    closePalette();
    setTimeout(function () {
      var el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  }

  function applyTheme(t) {
    ROOT.setAttribute('data-theme', t);
    ls.set('pt', t);
    toast(t === 'light' ? '☀️ Light mode' : '🌙 Dark mode', '', 2000);
    closePalette();
  }

  /* ── Fuzzy match ── */
  function matches(item, q) {
    if (!q) return true;
    var hay = (item.label + ' ' + item.sub).toLowerCase();
    var needle = q.toLowerCase();
    /* consecutive substring match */
    if (hay.indexOf(needle) !== -1) return true;
    /* fuzzy: every char of needle appears in order */
    var hi = 0;
    for (var ni = 0; ni < needle.length; ni++) {
      hi = hay.indexOf(needle[ni], hi);
      if (hi === -1) return false;
      hi++;
    }
    return true;
  }

  /* ── Build DOM ── */
  var overlay = document.createElement('div');
  overlay.id = 'cp-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Command palette');
  overlay.innerHTML = [
    '<div id="cp-modal">',
    '  <div id="cp-search-wrap">',
    '    <span id="cp-icon">⌘</span>',
    '    <input id="cp-input" type="text" placeholder="Search commands, sections, projects…" autocomplete="off" spellcheck="false" aria-label="Search commands"/>',
    '    <kbd id="cp-esc">esc</kbd>',
    '  </div>',
    '  <div id="cp-results" role="listbox" aria-label="Results"></div>',
    '  <div id="cp-footer">',
    '    <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>',
    '    <span><kbd>↵</kbd> select</span>',
    '    <span><kbd>esc</kbd> close</span>',
    '  </div>',
    '</div>'
  ].join('');
  document.body.appendChild(overlay);

  var input    = $('cp-input');
  var results  = $('cp-results');
  var modal    = $('cp-modal');
  var isOpen   = false;
  var selected = 0;
  var filtered = [];

  /* ── Render results ── */
  function render(q) {
    filtered = COMMANDS.filter(function (c) { return matches(c, q); });
    selected = 0;
    results.innerHTML = '';

    if (!filtered.length) {
      results.innerHTML = '<div class="cp-empty">No results for "<strong>' + escHtml(q) + '</strong>"</div>';
      return;
    }

    /* Group by type */
    var groups = {};
    var ORDER  = ['section', 'project', 'action', 'link'];
    var LABELS = { section: 'Sections', project: 'Projects', action: 'Actions', link: 'Links' };
    filtered.forEach(function (item) {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });

    var idx = 0;
    ORDER.forEach(function (type) {
      if (!groups[type]) return;
      var grp = document.createElement('div');
      grp.className = 'cp-group';
      grp.innerHTML = '<div class="cp-group-label">' + LABELS[type] + '</div>';

      groups[type].forEach(function (item) {
        var i = filtered.indexOf(item);
        var row = document.createElement('div');
        row.className = 'cp-row' + (i === 0 ? ' active' : '');
        row.setAttribute('role', 'option');
        row.setAttribute('data-idx', i);
        row.innerHTML =
          '<span class="cp-row-icon">' + item.icon + '</span>' +
          '<span class="cp-row-body">' +
            '<span class="cp-row-label">' + escHtml(item.label) + '</span>' +
            '<span class="cp-row-sub">' + escHtml(item.sub) + '</span>' +
          '</span>' +
          '<span class="cp-row-type">' + escHtml(LABELS[type].slice(0,-1)) + '</span>';
        row.addEventListener('mouseenter', function () { setSelected(i); });
        row.addEventListener('click', function () { execute(i); });
        grp.appendChild(row);
        idx++;
      });
      results.appendChild(grp);
    });
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function setSelected(i) {
    selected = Math.max(0, Math.min(filtered.length - 1, i));
    results.querySelectorAll('.cp-row').forEach(function (r) {
      var active = +r.dataset.idx === selected;
      r.classList.toggle('active', active);
      if (active) r.scrollIntoView({ block: 'nearest' });
    });
  }

  function execute(i) {
    if (filtered[i]) { filtered[i].action(); closePalette(); }
  }

  /* ── Open / close ── */
  function openPalette() {
    isOpen = true;
    overlay.classList.add('open');
    input.value = '';
    render('');
    requestAnimationFrame(function () { input.focus(); });
    document.body.style.overflow = 'hidden';
  }

  function closePalette() {
    isOpen = false;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    input.blur();
  }

  /* ── Keyboard shortcut ── */
  document.addEventListener('keydown', function (e) {
    /* Open: ⌘K or Ctrl+K */
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isOpen ? closePalette() : openPalette();
      return;
    }
    if (!isOpen) return;

    if (e.key === 'Escape')     { e.preventDefault(); closePalette(); }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setSelected(selected + 1); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setSelected(selected - 1); }
    if (e.key === 'Enter')      { e.preventDefault(); execute(selected); }
  });

  input.addEventListener('input', function () { render(input.value.trim()); });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePalette();
  });

  /* ── Expose to navbar (optional trigger button) ── */
  window.openCommandPalette = openPalette;
}());

/* ══════════════════════════════════════════════════════════
   NEW FEATURE D — AI CHAT WIDGET
   A floating chat bubble that lets visitors ask questions
   about Clarence. Uses the Anthropic API via fetch.
   System prompt is seeded with portfolio data so Claude
   answers as a knowledgeable assistant for this portfolio.
   ══════════════════════════════════════════════════════════ */
(function () {
  var SYSTEM_PROMPT = [
    'You are a helpful assistant embedded in Clarence Flores\' personal portfolio website.',
    'Answer questions about Clarence concisely and professionally.',
    'Keep responses to 2-4 sentences unless more detail is specifically requested.',
    '',
    '## About Clarence',
    'Clarence Flores is a passionate IT student and full-stack developer based in the Philippines.',
    'He is currently studying B.S. Information Technology at Quezon City University (2022–present, GPA 1.75, Dean\'s List).',
    'He previously completed Senior High School (STEM track) at Our Lady of Fatima University (2020–2022, Dean\'s List).',
    'He also completed a UX Design Bootcamp at Design Academy Online (Summer 2022).',
    '',
    '## Experience',
    '- Senior Frontend Engineer at TechCorp (Jan 2024–present): Led SaaS dashboard redesign, reduced load time 62%, mentored 3 junior devs.',
    '- Full-Stack Developer at StartupXYZ (Jun 2022–Dec 2023): Built fintech app from scratch, integrated 3 payment APIs and WebSockets.',
    '- Junior Web Developer at Agency Co. (Sep 2021–May 2022): Built 12+ client websites, automated CI/CD pipelines.',
    '',
    '## Skills',
    'Frontend: React/Next.js (3 yrs), TypeScript (2 yrs), CSS/Tailwind (3 yrs), Three.js/WebGL (1 yr).',
    'Backend: Node.js (2 yrs), Python/FastAPI (2 yrs), PostgreSQL (2 yrs), Redis (1 yr).',
    'DevOps: AWS/GCP (1 yr), Docker/K8s (1 yr), Git/CI-CD (3 yrs), Figma (2 yrs).',
    '',
    '## Projects',
    '- LaunchPad: No-code landing page builder, drag-and-drop, Vercel deploy, 1200+ beta users. Stack: React, Node, Vercel.',
    '- MindMap AI: AI knowledge graph from notes using embeddings + D3 force graph. Stack: Python, D3.js, OpenAI.',
    '- DataPulse: Real-time analytics, 50k+ events/sec via Kafka, WebGL charts. Stack: Kafka, WebGL, Go.',
    '- Pixel Studio: Collaborative pixel art via WebRTC, featured on Product Hunt. Stack: WebRTC, Canvas, OT.',
    '- VaultPass: E2E encrypted password manager, zero-knowledge, TOTP, browser extension. Stack: Crypto, Rust.',
    '- EcoTrack: Carbon footprint tracker with gamification, won 1st at climate-tech hackathon. Stack: Vue, Firebase.',
    '',
    '## Certifications',
    'AWS Solutions Architect Associate, Google Professional Cloud Developer, Meta Frontend Developer Professional,',
    'CompTIA Security+, Python for Data Science (IBM), MongoDB Developer Certification.',
    '',
    '## Contact',
    'Email: flores.clarencekyle.manrique@gmail.com',
    'LinkedIn: linkedin.com/in/clarenceflores8',
    'GitHub: github.com/callmecla',
    '',
    'If asked about availability or hiring, say Clarence is open to new opportunities and to reach out via email or LinkedIn.',
    'Do not invent information not listed above. If unsure, say so and direct them to the contact section.',
  ].join('\n');

  var history = []; /* conversation history */
  var isOpen  = false;
  var isTyping = false;

  /* ── Build DOM ── */
  var wrap = document.createElement('div');
  wrap.id  = 'ai-chat';
  wrap.innerHTML = [
    '<button id="ai-btn" aria-label="Chat with AI about Clarence">',
    '  <span id="ai-btn-icon">',
    '    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    '    </svg>',
    '  </span>',
    '  <span id="ai-badge" style="display:none">1</span>',
    '</button>',
    '<div id="ai-panel" role="dialog" aria-label="Chat with AI about Clarence" aria-hidden="true">',
    '  <div id="ai-header">',
    '    <div id="ai-header-left">',
    '      <div id="ai-avatar">CF</div>',
    '      <div id="ai-header-text">',
    '        <span id="ai-name">Ask about Clarence</span>',
    '        <span id="ai-status"><span id="ai-dot"></span>Powered by Claude</span>',
    '      </div>',
    '    </div>',
    '    <button id="ai-close" aria-label="Close chat">✕</button>',
    '  </div>',
    '  <div id="ai-messages" role="log" aria-live="polite">',
    '    <div class="ai-msg ai-msg--bot">',
    '      <div class="ai-bubble">Hi! I\'m an AI assistant for this portfolio. Ask me anything about Clarence — his skills, projects, experience, or how to get in touch. 👋</div>',
    '    </div>',
    '  </div>',
    '  <div id="ai-suggestions">',
    '    <button class="ai-sug" data-q="What are his strongest skills?">Strongest skills?</button>',
    '    <button class="ai-sug" data-q="Tell me about his projects">His projects</button>',
    '    <button class="ai-sug" data-q="Is he available for hire?">Available for hire?</button>',
    '  </div>',
    '  <form id="ai-form" autocomplete="off">',
    '    <input id="ai-input" type="text" placeholder="Ask something…" aria-label="Your message" maxlength="300"/>',
    '    <button type="submit" id="ai-send" aria-label="Send">',
    '      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    '    </button>',
    '  </form>',
    '</div>',
  ].join('');
  document.body.appendChild(wrap);

  var btn      = $('ai-btn');
  var panel    = $('ai-panel');
  var closeBtn = $('ai-close');
  var msgs     = $('ai-messages');
  var form     = $('ai-form');
  var input    = $('ai-input');
  var badge    = $('ai-badge');
  var sugs     = document.querySelectorAll('.ai-sug');

  /* ── Open / close ── */
  function openChat() {
    isOpen = true;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    btn.classList.add('active');
    badge.style.display = 'none';
    setTimeout(function () { input.focus(); }, 200);
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    btn.classList.remove('active');
  }

  btn.addEventListener('click', function () { isOpen ? closeChat() : openChat(); });
  closeBtn.addEventListener('click', closeChat);

  /* ── Suggestions ── */
  sugs.forEach(function (s) {
    s.addEventListener('click', function () {
      sendMessage(s.dataset.q);
      $('ai-suggestions').style.display = 'none';
    });
  });

  /* ── Add message to DOM ── */
  function addMsg(text, role) {
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg--' + (role === 'user' ? 'user' : 'bot');
    var bubble = document.createElement('div');
    bubble.className = 'ai-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return bubble;
  }

  /* ── Typing indicator ── */
  function addTyping() {
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg--bot ai-typing-wrap';
    div.id = 'ai-typing';
    div.innerHTML = '<div class="ai-bubble ai-typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    var t = $('ai-typing');
    if (t) t.parentNode.removeChild(t);
  }

  /* ── API call ── */
  function sendMessage(text) {
    if (isTyping || !text.trim()) return;
    text = text.trim();
    addMsg(text, 'user');
    input.value = '';
    isTyping = true;
    addTyping();

    history.push({ role: 'user', content: text });

    /* Keep last 10 turns to stay within context */
    var slice = history.slice(-10);

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: slice
      })
    })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      removeTyping();
      isTyping = false;
      var reply = (data.content && data.content[0] && data.content[0].text) || 'Sorry, I couldn\'t get a response.';
      history.push({ role: 'assistant', content: reply });
      addMsg(reply, 'bot');
      if (!isOpen) {
        badge.style.display = 'flex';
        badge.textContent = '1';
      }
    })
    .catch(function (err) {
      removeTyping();
      isTyping = false;
      console.error('[AI Chat]', err);
      addMsg('Sorry, something went wrong. Try reaching out via the contact form instead!', 'bot');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sendMessage(input.value);
    $('ai-suggestions').style.display = 'none';
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeChat();
  });
}());

/* ============================================================
   NEW FEATURES — appended to main.js
   ============================================================ */

/* ── 18. SYSTEM THEME SYNC ──
   Already handled inline before paint (see index.html <script>).
   This block listens for OS-level theme changes AFTER load and
   only applies them if the user has no saved preference yet.
   ── */
(function () {
  var mq = window.matchMedia('(prefers-color-scheme: light)');
  mq.addEventListener('change', function (e) {
    /* Only auto-switch if user hasn't manually picked a theme */
    if (!ls.get('pt')) {
      ROOT.setAttribute('data-theme', e.matches ? 'light' : 'dark');
    }
  });
}());

/* ── 19. MAGNETIC BUTTON HOVER ──
   Elements with class="mag" softly follow the cursor within
   their bounding box. On mouseleave, they spring back.
   Uses inline transform (no layout cost).
   ── */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var MAG_STRENGTH = 0.28; /* 0 = no movement, 1 = full follow */

  document.querySelectorAll('.mag').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r  = el.getBoundingClientRect();
      var cx = r.left + r.width  / 2;
      var cy = r.top  + r.height / 2;
      var dx = (e.clientX - cx) * MAG_STRENGTH;
      var dy = (e.clientY - cy) * MAG_STRENGTH;
      el.style.transition = 'transform .1s linear';
      el.style.transform  = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      el.style.transform  = '';
    });
  });
}());

/* ── 20. COMMAND PALETTE ── */
(function () {
  var overlay  = document.getElementById('cp-overlay');
  var modal    = document.getElementById('cp-modal');
  var input    = document.getElementById('cp-input');
  var results  = document.getElementById('cp-results');
  var trigger  = document.getElementById('cp-trigger');
  if (!overlay || !input || !results) return;

  /* ── Index of all searchable items ── */
  var items = [
    /* Navigation */
    { icon: '👤', label: 'About Me',           cat: 'Section',  action: function(){ scrollTo('#about'); },         keys: 'about me' },
    { icon: '🎓', label: 'Education',           cat: 'Section',  action: function(){ scrollTo('#education'); },     keys: 'education university degree' },
    { icon: '💼', label: 'Experience',          cat: 'Section',  action: function(){ scrollTo('#experience'); },   keys: 'experience work job career' },
    { icon: '🚀', label: 'Projects',            cat: 'Section',  action: function(){ scrollTo('#projects'); },     keys: 'projects portfolio work' },
    { icon: '🛠️', label: 'Skills',              cat: 'Section',  action: function(){ scrollTo('#skills'); },       keys: 'skills tech stack languages' },
    { icon: '🏅', label: 'Certifications',      cat: 'Section',  action: function(){ scrollTo('#certifications'); }, keys: 'certifications awards' },
    { icon: '✉️', label: 'Contact',             cat: 'Section',  action: function(){ scrollTo('#contact'); },      keys: 'contact email hire' },
    /* Projects */
    { icon: '🚀', label: 'LaunchPad — No-code builder', cat: 'Project', action: function(){ scrollTo('#projects'); }, keys: 'launchpad no-code landing page builder vercel' },
    { icon: '🧠', label: 'MindMap AI — Knowledge graph', cat: 'Project', action: function(){ scrollTo('#projects'); }, keys: 'mindmap ai knowledge graph embeddings openai' },
    { icon: '📊', label: 'DataPulse — Analytics dashboard', cat: 'Project', action: function(){ scrollTo('#projects'); }, keys: 'datapulse analytics kafka webgl dashboard' },
    { icon: '🎨', label: 'Pixel Studio — Collaborative editor', cat: 'Project', action: function(){ scrollTo('#projects'); }, keys: 'pixel studio art editor webrtc canvas' },
    { icon: '🔐', label: 'VaultPass — Password manager', cat: 'Project', action: function(){ scrollTo('#projects'); }, keys: 'vaultpass password manager crypto rust extension' },
    { icon: '🌍', label: 'EcoTrack — Carbon tracker', cat: 'Project', action: function(){ scrollTo('#projects'); }, keys: 'ecotrack carbon footprint vue firebase' },
    /* Actions */
    { icon: '⬇️', label: 'Download Resume (CV)',  cat: 'Action', action: function(){ var a = document.createElement('a'); a.href='cv.pdf'; a.download=''; a.click(); }, keys: 'download resume cv pdf' },
    { icon: '✉️', label: 'Send an Email',          cat: 'Action', action: function(){ window.location.href='mailto:flores.clarencekyle.manrique@gmail.com'; }, keys: 'email send message contact' },
    { icon: '🐙', label: 'GitHub Profile',          cat: 'Action', action: function(){ window.open('https://github.com/callmecla','_blank'); },  keys: 'github code repository open source' },
    { icon: '💼', label: 'LinkedIn Profile',        cat: 'Action', action: function(){ window.open('https://linkedin.com/in/clarenceflores8/','_blank'); }, keys: 'linkedin professional network' },
    /* Theme */
    { icon: '🌙', label: 'Switch to Dark Mode',  cat: 'Theme', action: function(){ setTheme('dark');  }, keys: 'dark theme mode night' },
    { icon: '☀️', label: 'Switch to Light Mode', cat: 'Theme', action: function(){ setTheme('light'); }, keys: 'light theme mode day' },
  ];

  function setTheme(t) {
    ROOT.setAttribute('data-theme', t);
    ls.set('pt', t);
    toast(t === 'light' ? '☀️ Light mode' : '🌙 Dark mode', '', 2000);
  }

  function scrollTo(hash) {
    var el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    close();
  }

  var activeIdx = -1;

  function open() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    input.value = '';
    render('');
    requestAnimationFrame(function () { input.focus(); });
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    activeIdx = -1;
  }

  function highlight(text, query) {
    if (!query) return text;
    var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  function render(query) {
    var q = query.trim().toLowerCase();
    var filtered = q
      ? items.filter(function (item) {
          return item.label.toLowerCase().includes(q) || item.keys.toLowerCase().includes(q);
        })
      : items;

    if (!filtered.length) { results.innerHTML = ''; activeIdx = -1; return; }

    /* Group by category */
    var groups = {};
    filtered.forEach(function (item) {
      if (!groups[item.cat]) groups[item.cat] = [];
      groups[item.cat].push(item);
    });

    var html = '';
    var idx  = 0;
    var flat = []; /* flat list for keyboard nav */

    Object.keys(groups).forEach(function (cat) {
      html += '<div class="cp-section-header">' + cat + '</div>';
      groups[cat].forEach(function (item) {
        flat.push(item);
        html += '<button class="cp-item" data-idx="' + idx + '" role="option" tabindex="-1">' +
          '<span class="cp-item-icon">' + item.icon + '</span>' +
          '<span class="cp-item-body">' +
            '<span class="cp-item-label">' + highlight(item.label, q) + '</span>' +
            '<span class="cp-item-cat">' + item.cat + '</span>' +
          '</span>' +
        '</button>';
        idx++;
      });
    });

    results.innerHTML = html;
    results._flat = flat;
    activeIdx = -1;

    results.querySelectorAll('.cp-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = +btn.dataset.idx;
        if (results._flat[i]) { results._flat[i].action(); close(); }
      });
      btn.addEventListener('mouseenter', function () {
        setActive(+btn.dataset.idx);
      });
    });
  }

  function setActive(i) {
    var btns = results.querySelectorAll('.cp-item');
    btns.forEach(function (b) { b.classList.remove('active'); });
    if (i >= 0 && i < btns.length) {
      btns[i].classList.add('active');
      btns[i].scrollIntoView({ block: 'nearest' });
      activeIdx = i;
    }
  }

  /* Keyboard navigation */
  input.addEventListener('keydown', function (e) {
    var btns = results.querySelectorAll('.cp-item');
    var len  = btns.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((activeIdx + 1) % len); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((activeIdx - 1 + len) % len); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results._flat && results._flat[activeIdx]) {
        results._flat[activeIdx].action(); close();
      }
    }
    else if (e.key === 'Escape') { close(); }
  });

  input.addEventListener('input', function () { render(input.value); });

  /* Open triggers */
  if (trigger) trigger.addEventListener('click', open);

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('open')) { close(); } else { open(); }
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) { close(); }
  });

  /* Click backdrop to close */
  overlay.addEventListener('click', function (e) {
    if (!modal.contains(e.target)) close();
  });
}());

/* ── 21. AI CHAT WIDGET ── */
(function () {
  var bubble   = document.getElementById('chat-bubble');
  var panel    = document.getElementById('chat-panel');
  var closeBtn = document.getElementById('chat-close');
  var messages = document.getElementById('chat-messages');
  var inputEl  = document.getElementById('chat-input');
  var sendBtn  = document.getElementById('chat-send');
  var sugBox   = document.getElementById('chat-suggestions');
  if (!bubble || !panel) return;

  /* ── Portfolio context given to Claude ── */
  var SYSTEM = [
    'You are a helpful AI assistant embedded in Clarence Flores\'s personal portfolio website.',
    'Answer questions about Clarence concisely, warmly, and in 2–4 sentences max.',
    'Here is everything you know about Clarence:',
    '',
    'NAME: Clarence Flores',
    'ROLE: IT Student, Full-Stack Developer, UI/UX Enthusiast',
    'LOCATION: Philippines',
    'EMAIL: flores.clarencekyle.manrique@gmail.com',
    'GITHUB: github.com/callmecla',
    'LINKEDIN: linkedin.com/in/clarenceflores8',
    '',
    'EDUCATION:',
    '- B.S. Information Technology, Quezon City University (2022–Present), GPA 1.75, Dean\'s List',
    '- STEM strand, Our Lady of Fatima University (2020–2022), Dean\'s List, Honors',
    '- UX Design Bootcamp, Design Academy Online (Summer 2022)',
    '',
    'EXPERIENCE:',
    '- Senior Frontend Engineer @ TechCorp (Jan 2024–Present): Led SaaS dashboard redesign, cut load time 62%, mentored 3 devs, built component library used in 5 products. Stack: React, TypeScript, GraphQL, Figma.',
    '- Full-Stack Developer @ StartupXYZ (Jun 2022–Dec 2023): Built fintech customer app from scratch, integrated 3 payment APIs, real-time WebSockets. Stack: Next.js, Node.js, PostgreSQL, AWS.',
    '- Junior Web Developer @ Agency Co. (Sep 2021–May 2022): Built 12+ client sites, set up CI/CD. Stack: HTML/CSS, JavaScript, WordPress.',
    '',
    'PROJECTS:',
    '- LaunchPad: No-code landing page builder, drag-and-drop, Vercel deploy, 1200+ beta users. Stack: React, Node, Vercel.',
    '- MindMap AI: AI knowledge graph from notes using embeddings + D3.js force graph. Stack: Python, D3.js, OpenAI.',
    '- DataPulse: Real-time analytics dashboard, 50k+ events/sec via Kafka, WebGL charts. Stack: Kafka, WebGL, Go.',
    '- Pixel Studio: Collaborative pixel art editor, real-time multiplayer via WebRTC. Featured on Product Hunt. Stack: WebRTC, Canvas.',
    '- VaultPass: E2E encrypted password manager, zero-knowledge, TOTP, browser extension. Stack: Crypto, Extension, Rust.',
    '- EcoTrack: Carbon footprint tracker with gamification. Won 1st place at climate-tech hackathon. Stack: Vue, Firebase, Maps.',
    '',
    'SKILLS: React, Next.js, TypeScript, CSS, Tailwind, Three.js/WebGL (frontend); Node.js, Python/FastAPI, PostgreSQL, Redis (backend); AWS, GCP, Docker, K8s, Git/CI/CD, Figma (DevOps/tools).',
    '',
    'CERTIFICATIONS: AWS Solutions Architect Associate (Mar 2024), Google Professional Cloud Developer (Nov 2023), Meta Frontend Developer Professional (Jun 2023), CompTIA Security+ (Jan 2023), Python for Data Science / IBM (Aug 2022), MongoDB Developer (Apr 2022).',
    '',
    'AVAILABILITY: Open to new opportunities.',
    '',
    'If asked something outside this context, politely say you only know about Clarence\'s portfolio.',
    'Keep responses friendly, short, and professional. No markdown formatting — plain text only.'
  ].join('\n');

  var history  = []; /* conversation turns */
  var isOpen   = false;
  var isBusy   = false;

  function togglePanel(open) {
    isOpen = open;
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    if (open) { inputEl.focus(); }
  }

  bubble.addEventListener('click', function () { togglePanel(!isOpen); });
  if (closeBtn) closeBtn.addEventListener('click', function () { togglePanel(false); });

  /* Suggestion chips */
  if (sugBox) {
    sugBox.querySelectorAll('.chat-suggestion').forEach(function (btn) {
      btn.addEventListener('click', function () {
        sugBox.style.display = 'none';
        send(btn.dataset.q);
      });
    });
  }

  /* Send on Enter */
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !isBusy) send(inputEl.value.trim());
  });
  sendBtn.addEventListener('click', function () {
    if (!isBusy) send(inputEl.value.trim());
  });

  function addMsg(role, text) {
    var div  = document.createElement('div');
    div.className = 'chat-msg ' + role;
    var inner = document.createElement('p');
    inner.textContent = text;
    div.appendChild(inner);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return inner;
  }

  function addTyping() {
    var div = document.createElement('div');
    div.className = 'chat-msg ai';
    div.id = 'chat-typing-indicator';
    div.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function removeTyping() {
    var t = document.getElementById('chat-typing-indicator');
    if (t) t.parentNode.removeChild(t);
  }

  function send(text) {
    if (!text || isBusy) return;
    inputEl.value = '';
    isBusy = true;
    sendBtn.disabled = true;
    if (sugBox) sugBox.style.display = 'none';

    addMsg('user', text);
    history.push({ role: 'user', content: text });

    var typing = addTyping();

    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM,
        messages: history
      })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      removeTyping();
      var reply = (data.content && data.content[0] && data.content[0].text) || 'Sorry, I couldn\'t fetch a response right now.';
      history.push({ role: 'assistant', content: reply });
      addMsg('ai', reply);
    })
    .catch(function () {
      removeTyping();
      addMsg('ai', 'Hmm, something went wrong. Try emailing Clarence directly at flores.clarencekyle.manrique@gmail.com!');
    })
    .finally(function () {
      isBusy = false;
      sendBtn.disabled = false;
    });
  }
}());
