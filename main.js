/* ============================================================
   main.js — Clarence Flores Portfolio
   ============================================================ */
'use strict';

var ROOT = document.documentElement;

/* ── Helpers ── */
function $(id) { return document.getElementById(id); }
function toast(msg, type, dur) {
  var wrap = $('toast-wrap');
  if (!wrap) return;
  var t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('show'); }); });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { t.remove(); }, 400);
  }, dur || 3500);
}

/* ── 1. PAGE LOADER ── */
(function () {
  var loader = $('loader');
  if (!loader) return;
  function done() { loader.classList.add('done'); }
  window.addEventListener('load', function () { setTimeout(done, 600); });
  setTimeout(done, 2200); /* fallback */
}());

/* ── 2. SCROLL PROGRESS BAR ── */
(function () {
  var bar = $('spb');
  if (!bar) return;
  window.addEventListener('scroll', function () {
    var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}());

/* ── 3. BACK TO TOP ── */
(function () {
  var btn = $('btt');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}());

/* ── 4. THEME TOGGLE ── */
$('tg').addEventListener('click', function () {
  var next = ROOT.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  ROOT.setAttribute('data-theme', next);
  localStorage.setItem('pt', next);
  toast(next === 'light' ? '☀️ Light mode' : '🌙 Dark mode', '', 2000);
});

/* ── 5. TYPEWRITER ── */
(function () {
  var el = $('tw');
  if (!el) return;
  /* Skip animation if user prefers reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = 'Full-Stack Developer'; return;
  }
  var words = ['Full-Stack Developer', 'UI/UX Enthusiast', 'Problem Solver', 'IT Student', 'Open-Source Contributor'];
  var w = 0, c = 0, del = false;
  function tick() {
    var word = words[w];
    el.textContent = del ? word.slice(0, c--) : word.slice(0, c++);
    var wait = del ? 50 : 95;
    if (!del && c > word.length)  { wait = 1800; del = true; }
    else if (del && c < 0)        { del = false; w = (w + 1) % words.length; c = 0; wait = 350; }
    setTimeout(tick, wait);
  }
  setTimeout(tick, 1300);
}());

/* ── 6. CANVAS PARTICLES ── */
(function () {
  var canvas = $('cv');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, pts = [], raf;
  var N = window.innerWidth < 600 ? 30 : 65;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function mkPt()   { return { x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, l: Math.random() }; }
  function color()  { return ROOT.getAttribute('data-theme') === 'light' ? '61,122,0,' : '200,244,104,'; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var c = color();
    var i, j, p, dx, dy, d;
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      p.x += p.vx; p.y += p.vy; p.l = (p.l + .002) % 1;
      if (p.x < -2) p.x = W+2; if (p.x > W+2) p.x = -2;
      if (p.y < -2) p.y = H+2; if (p.y > H+2) p.y = -2;
      ctx.beginPath(); ctx.arc(p.x, p.y, .9, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(' + c + (Math.sin(p.l*Math.PI)*.5) + ')'; ctx.fill();
    }
    for (i = 0; i < pts.length; i++) {
      for (j = i+1; j < pts.length; j++) {
        dx = pts[i].x-pts[j].x; dy = pts[i].y-pts[j].y; d = Math.sqrt(dx*dx+dy*dy);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = 'rgba(' + c + ((1-d/110)*.07) + ')'; ctx.lineWidth = .5; ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }

  resize(); for (var i = 0; i < N; i++) pts.push(mkPt()); draw();
  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf); resize(); pts = [];
    for (var i = 0; i < N; i++) pts.push(mkPt()); draw();
  });
}());

/* ── 7. CUSTOM CURSOR (desktop only) ── */
(function () {
  var dot  = $('cd');
  var ring = $('cr');
  if (!dot || !ring) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var mx = 0, my = 0, rx = 0, ry = 0, active = false;
  dot.style.transition  = 'opacity .15s';
  ring.style.transition = 'width .3s cubic-bezier(.16,1,.3,1), height .3s cubic-bezier(.16,1,.3,1), border-color .3s, opacity .15s';

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!active) {
      rx = mx; ry = my; active = true;
      document.body.classList.add('has-cursor');
      dot.style.opacity = '1'; ring.style.opacity = '.6';
    }
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  }, { passive: true });

  document.addEventListener('mouseleave', function () { dot.style.opacity = ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { if (active) { dot.style.opacity = '1'; ring.style.opacity = '.6'; } });

  (function loop() {
    rx += (mx-rx) * .12; ry += (my-ry) * .12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  }());

  var SEL = 'a, button, label, [data-tilt], .pill, .tag, .badge, .cert, .proj, .stat, .social, .tt, .copy-btn';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(SEL)) { ring.style.width = '50px'; ring.style.height = '50px'; ring.style.borderColor = 'var(--acc2)'; ring.style.opacity = '.85'; }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(SEL)) { ring.style.width = '34px'; ring.style.height = '34px'; ring.style.borderColor = 'var(--acc)'; ring.style.opacity = '.6'; }
  });
}());

/* ── 8. NAV — scrolled + active link ── */
(function () {
  var nav   = $('nv');
  var links = document.querySelectorAll('.na');
  window.addEventListener('scroll', function () { nav.classList.toggle('scrolled', window.scrollY > 40); }, { passive: true });
  nav.classList.toggle('scrolled', window.scrollY > 40);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting)
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
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
    var c = l.cloneNode(true);
    mo.appendChild(c);
  });

  function toggle(open) {
    hb.classList.toggle('open', open);
    hb.setAttribute('aria-expanded', String(open));
    mo.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
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
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(function (el) { io.observe(el); });
    /* Safety net — force-reveal anything still hidden after 1.5s */
    setTimeout(function () {
      document.querySelectorAll('.rv:not(.visible)').forEach(function (el) { el.classList.add('visible'); });
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
        var p = Math.min((now-t0)/dur, 1);
        el.textContent = Math.round((1 - Math.pow(1-p, 4)) * target);
        if (p < 1) requestAnimationFrame(tick);
      }(performance.now()));
      io.unobserve(el);
    });
  }, { threshold: .5 });
  els.forEach(function (el) { io.observe(el); });
}());

/* ── 12. SKILL BARS ── */
(function () {
  var sec = $('skills');
  if (!sec) return;
  var fills = sec.querySelectorAll('.skill-fill[data-w]');
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      fills.forEach(function (f, i) { setTimeout(function () { f.style.width = f.dataset.w + '%'; }, i * 60); });
    });
  }, { threshold: .2 }).observe(sec);
}());

/* ── 13. PROJECT CARD TILT + GLOW ── */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    var glow = card.querySelector('.proj-glow');
    card.addEventListener('mousemove', function (e) {
      var r  = card.getBoundingClientRect();
      var cx = (e.clientX - r.left) / r.width;
      var cy = (e.clientY - r.top)  / r.height;
      card.style.transform  = 'perspective(700px) rotateX(' + ((cy-.5)*-7) + 'deg) rotateY(' + ((cx-.5)*7) + 'deg) translateZ(4px)';
      card.style.transition = 'transform .1s linear';
      if (glow) { glow.style.setProperty('--gx', (cx*100)+'%'); glow.style.setProperty('--gy', (cy*100)+'%'); }
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform  = '';
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
    });
  });
}());

/* ── 14. PROFILE PHOTO UPLOAD ── */
(function () {
  var inp = $('phu'), img = $('pi');
  if (!inp || !img) return;
  inp.addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function (ev) { img.src = ev.target.result; toast('📷 Photo updated!', 'ok', 2500); };
    reader.readAsDataURL(f);
  });
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
        tmp.value = text; document.body.appendChild(tmp);
        tmp.select(); document.execCommand('copy'); document.body.removeChild(tmp);
        toast('📋 Email copied!', 'ok', 2500);
      }
    });
  });
}());

/* ── 16. CONTACT FORM — */

(function () {
  var PK = 'alg84AK46Bvk1Yx4b';
  var SI = 'service_pfg97tj';
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

    /* Dev mode — credentials not yet set */
    if (PK === 'alg84AK46Bvk1Yx4b') {
      console.warn('[EmailJS] Add your credentials to main.js');
      setLoading(true);
      setTimeout(function () { setLoading(false); form.reset(); toast('✓ Message sent! I\'ll be in touch soon.', 'ok'); }, 1200);
      return;
    }

    setLoading(true);
    emailjs.send(SI, TI, {
      to_name:    YN,
      from_name:  name,
      from_email: email,
      subject:    form.querySelector('#cfs').value.trim() || '(no subject)',
      message:    msg,
      reply_to:   email
    }).then(function () {
      setLoading(false); form.reset();
      toast('✓ Message sent! I\'ll be in touch soon.', 'ok');
    }, function (err) {
      console.error('[EmailJS]', err);
      setLoading(false);
      toast('✗ Send failed — please email me directly.', 'err');
    });
  });
}());
