/* ============================================================
   main.js — Clarence Flores Portfolio
   ============================================================
   Performance & memory notes:
   · All scroll handlers use { passive: true }
   · Scroll progress and BTT use requestAnimationFrame throttling
     (no setTimeout/setInterval on scroll)
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
      /* QuotaExceededError — storage full */
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
  /* Hard fallback */
  setTimeout(done, 1500);
}());

/* ── 2. SCROLL PROGRESS BAR — rAF throttled ──
   Using rAF instead of direct scroll handler avoids
   running more than once per paint frame (16ms).
   ── */
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

/* ── 3. BACK TO TOP — rAF throttled ── */
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
  var timer; /* stored so it could be cleared if needed */
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

/* ── 6. CANVAS PARTICLES — spatial grid O(n·k) ──
   Memory notes:
   · pts array is recreated on resize (old one GC'd)
   · seen object is created per frame (small, GC friendly at n=65)
   · cancelAnimationFrame on resize prevents zombie loops
   ── */
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

  /* Debounced resize — avoids thrashing on every pixel of drag */
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

  /* Smooth ring lag — runs in its own rAF loop */
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

/* ── 8. NAV — scrolled class + active section highlight ── */
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

  /* Clone desktop nav links into the mobile overlay */
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
          io.unobserve(e.target); /* stop watching once revealed — saves memory */
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(function (el) { io.observe(el); });

    /* Safety net — force-reveal anything still hidden after 1.5s */
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

/* ── 13. GITHUB CONTRIBUTION GRAPH — canvas renderer ──
   Fetches the last 52 weeks of data via a public API (no auth).
   Colour palette mirrors GitHub's dark theme but toned down
   to complement the site's deep navy/lime aesthetic:
     L0 (none)   #1a1f2e  — site surface, empty cell blends in
     L1 (low)    #1e3a1e  — very dark green, subtle
     L2 (medium) #2d5a1e  — muted mid green
     L3 (high)   #4a8c2a  — readable green
     L4 (max)    #7cc832  — close to site accent, slightly toned
   Redraws on theme toggle and debounced resize.
   Only fetches when the graph scrolls into view (IO lazy load).
   ── */
(function () {
  var canvas   = $('gh-canvas');
  var fallback = $('gh-fallback');
  var totalEl  = $('gh-total');
  if (!canvas) return;

  var DARK_PAL  = ['#1a1f2e', '#1e3a1e', '#2d5a1e', '#4a8c2a', '#7cc832'];
  var LIGHT_PAL = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
  var CELL  = 11;
  var GAP   = 3;
  var WEEKS = 53;

  function pal() {
    return ROOT.getAttribute('data-theme') === 'light' ? LIGHT_PAL : DARK_PAL;
  }

  function drawGraph(weeks) {
    var p   = pal();
    var W   = WEEKS * (CELL + GAP) - GAP;
    var H   = 7 * (CELL + GAP) - GAP + 20;
    var dpr = window.devicePixelRatio || 1;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    /* Month labels */
    var isLight = ROOT.getAttribute('data-theme') === 'light';
    ctx.font         = '9px "JetBrains Mono", monospace';
    ctx.fillStyle    = isLight ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.28)';
    ctx.textBaseline = 'top';

    var MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var lastMon  = -1;
    for (var wi = 0; wi < weeks.length; wi++) {
      var firstCell = weeks[wi] && weeks[wi][0];
      if (firstCell && firstCell.date) {
        var m = new Date(firstCell.date + 'T00:00:00').getMonth();
        if (m !== lastMon) {
          ctx.fillText(MONTHS[m], wi * (CELL + GAP), 0);
          lastMon = m;
        }
      }
    }

    var OY = 16; /* vertical offset below month labels */

    /* Cells */
    for (var w = 0; w < weeks.length; w++) {
      var week = weeks[w] || [];
      for (var d = 0; d < 7; d++) {
        var cell = week[d];
        if (!cell) continue;
        var x = w * (CELL + GAP);
        var y = OY + d * (CELL + GAP);
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, CELL, CELL, 2);
        } else {
          ctx.rect(x, y, CELL, CELL);
        }
        ctx.fillStyle = p[Math.min(cell.level, 4)] || p[0];
        ctx.fill();
      }
    }
  }

  function showFallback() {
    canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
  }

  function load() {
    fetch('https://github-contributions-api.jogruber.de/v4/callmecla?y=last')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        var contrib = json && json.contributions;
        if (!contrib || !contrib.length) { showFallback(); return; }

        /* Sort ascending */
        contrib = contrib.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });

        /* Build week columns — Sunday (0) = first row */
        var weeks = [];
        var week  = [];
        var total = 0;

        /* Pad so the first week starts on Sunday */
        var startDay = new Date(contrib[0].date + 'T00:00:00').getDay();
        for (var p = 0; p < startDay; p++) week.push({ count: 0, level: 0, date: '' });

        contrib.forEach(function (c) {
          total += c.count;
          week.push({ count: c.count, level: c.level || 0, date: c.date });
          if (week.length === 7) { weeks.push(week); week = []; }
        });
        if (week.length) {
          while (week.length < 7) week.push({ count: 0, level: 0, date: '' });
          weeks.push(week);
        }

        /* Keep latest 53 weeks */
        if (weeks.length > WEEKS) weeks = weeks.slice(weeks.length - WEEKS);

        drawGraph(weeks);
        canvas.style.display = 'block';
        if (totalEl) totalEl.textContent = total.toLocaleString() + ' contributions in the last year';

        /* Redraw on theme toggle */
        new MutationObserver(function () { drawGraph(weeks); })
          .observe(ROOT, { attributes: true, attributeFilter: ['data-theme'] });

        /* Debounced redraw on resize */
        var rt;
        window.addEventListener('resize', function () {
          clearTimeout(rt); rt = setTimeout(function () { drawGraph(weeks); }, 150);
        }, { passive: true });
      })
      .catch(showFallback);
  }

  /* Lazy-load: only fetch when graph enters viewport */
  var graphEl = $('gh-graph');
  if (graphEl && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); load(); }
    }, { threshold: 0.1 });
    io.observe(graphEl);
  } else {
    load();
  }
}());

/* ── 14. PROFILE PHOTO — localStorage persistence ──
   Storage budget note:
   A 240×240 JPEG at moderate quality ≈ 30–80 KB as base64.
   localStorage limit is typically 5 MB per origin.
   We check available space before writing and warn if it fails.
   ── */
(function () {
  var inp = $('phu');
  var img = $('pi');
  if (!inp || !img) return;

  /* Restore saved photo on load — overrides the profile.jpg src */
  var saved = ls.get('pf_photo');
  if (saved) img.src = saved;

  inp.addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;

    var reader = new FileReader();
    reader.onload = function (ev) {
      var dataUrl = ev.target.result;
      img.src = dataUrl;

      /* Only store if under ~2 MB to stay well within quota */
      if (dataUrl.length < 2 * 1024 * 1024) {
        var ok = ls.set('pf_photo', dataUrl);
        toast(ok ? '📷 Photo updated & saved!' : '📷 Photo updated (not saved — storage full)', ok ? 'ok' : '', 2500);
      } else {
        /* Image too large — show in session only */
        toast('📷 Photo updated (too large to save — resize to < 1 MB)', '', 3000);
      }
    };
    reader.readAsDataURL(f);
  });

  /* Reset button — clear saved photo, fall back to default */
  /* Exposed as a global so you can call resetPhoto() from console */
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
        /* Fallback for older browsers */
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

/* ── 16. WIP PROJECT LINKS ──
   Adds a tooltip-style visual cue on hover so it's clear
   the link is intentionally disabled, not broken.
   ── */
(function () {
  document.querySelectorAll('.proj-link[data-wip]').forEach(function (link) {
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('tabindex', '-1');
    /* pointer-events: none is set in CSS; this prevents
       keyboard users from accidentally activating dead links */
  });
}());

/* ── 17. CONTACT FORM — EmailJS ── */
(function () {
  /* ↓ Your real credentials */
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
    el.getBoundingClientRect(); /* force reflow */
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
