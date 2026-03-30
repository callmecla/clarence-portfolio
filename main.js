/* ============================================================
   main.js — Clarence Flores Portfolio
   All features: loader, scroll progress, typewriter, cursor,
   theme toggle, canvas, nav, mobile menu, reveal, counters,
   skill bars, tilt, photo upload, copy email, toast, EmailJS
   ============================================================ */
'use strict';

var H = document.documentElement;

/* ─────────────────────────────────────────────
   1. PAGE LOADER
   ───────────────────────────────────────────── */
(function () {
  var loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', function () {
    setTimeout(function () { loader.classList.add('done'); }, 700);
  });
  // Fallback — remove after 2.5s regardless
  setTimeout(function () { loader.classList.add('done'); }, 2500);
}());

/* ─────────────────────────────────────────────
   2. SCROLL PROGRESS BAR
   ───────────────────────────────────────────── */
(function () {
  var bar = document.getElementById('spb');
  if (!bar) return;
  window.addEventListener('scroll', function () {
    var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}());

/* ─────────────────────────────────────────────
   3. BACK TO TOP BUTTON
   ───────────────────────────────────────────── */
(function () {
  var btn = document.getElementById('btt');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}());

/* ─────────────────────────────────────────────
   4. TOAST NOTIFICATIONS
   ───────────────────────────────────────────── */
function toast(msg, type, dur) {
  var container = document.getElementById('toast-container');
  if (!container) return;
  var t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  container.appendChild(t);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { t.classList.add('show'); });
  });
  setTimeout(function () {
    t.classList.remove('show');
    setTimeout(function () { t.remove(); }, 450);
  }, dur || 4000);
}

/* ─────────────────────────────────────────────
   5. THEME TOGGLE
   ───────────────────────────────────────────── */
(function () {
  var btn = document.getElementById('tg');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var next = H.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    H.setAttribute('data-theme', next);
    localStorage.setItem('pt', next);
    toast(next === 'light' ? '☀️ Light mode on' : '🌙 Dark mode on', '', 2000);
  });
}());

/* ─────────────────────────────────────────────
   6. TYPEWRITER EFFECT
   ───────────────────────────────────────────── */
(function () {
  var el = document.getElementById('tw');
  if (!el) return;
  var words = ['Full-Stack Developer', 'UI/UX Enthusiast', 'Problem Solver', 'IT Student', 'Open-Source Contributor'];
  var wi = 0, ci = 0, deleting = false;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = words[0]; return;
  }

  function tick() {
    var word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    var wait = deleting ? 55 : 100;
    if (!deleting && ci > word.length) { wait = 1800; deleting = true; }
    else if (deleting && ci < 0)       { deleting = false; wi = (wi + 1) % words.length; ci = 0; wait = 350; }
    setTimeout(tick, wait);
  }
  setTimeout(tick, 1400);
}());

/* ─────────────────────────────────────────────
   7. CANVAS BACKGROUND — particles + lines
   ───────────────────────────────────────────── */
(function () {
  var c = document.getElementById('cv');
  if (!c) return;
  var x = c.getContext('2d'), W, H2, pts = [], raf;
  var N = window.innerWidth < 600 ? 35 : 70;

  function rs() { W = c.width = window.innerWidth; H2 = c.height = window.innerHeight; }
  function mk() { return { x: Math.random()*W, y: Math.random()*H2, vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, l: Math.random() }; }
  function cl() { return H.getAttribute('data-theme') === 'light' ? '61,122,0,' : '200,244,104,'; }

  function dr() {
    x.clearRect(0, 0, W, H2);
    var c2 = cl();
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy; p.l = (p.l + .002) % 1;
      if (p.x < -2) p.x = W+2; if (p.x > W+2) p.x = -2;
      if (p.y < -2) p.y = H2+2; if (p.y > H2+2) p.y = -2;
      x.beginPath(); x.arc(p.x, p.y, .9, 0, Math.PI*2);
      x.fillStyle = 'rgba(' + c2 + (Math.sin(p.l*Math.PI)*.5) + ')'; x.fill();
    }
    for (var i = 0; i < pts.length; i++) {
      for (var j = i+1; j < pts.length; j++) {
        var dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 110) {
          x.beginPath(); x.moveTo(pts[i].x, pts[i].y); x.lineTo(pts[j].x, pts[j].y);
          x.strokeStyle = 'rgba(' + c2 + ((1-d/110)*.07) + ')'; x.lineWidth = .5; x.stroke();
        }
      }
    }
    raf = requestAnimationFrame(dr);
  }
  rs(); for (var i = 0; i < N; i++) pts.push(mk()); dr();
  window.addEventListener('resize', function () { cancelAnimationFrame(raf); rs(); pts = []; for (var i = 0; i < N; i++) pts.push(mk()); dr(); });
}());

/* ─────────────────────────────────────────────
   8. CUSTOM CURSOR
   ───────────────────────────────────────────── */
(function () {
  var dot  = document.getElementById('cd');
  var ring = document.getElementById('cr');
  if (!dot || !ring) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    dot.style.display = ring.style.display = 'none'; return;
  }
  var mx = 0, my = 0, rx = 0, ry = 0, on = false;
  dot.style.transition  = 'opacity .15s';
  ring.style.transition = 'width .3s cubic-bezier(.16,1,.3,1),height .3s cubic-bezier(.16,1,.3,1),border-color .3s,opacity .15s';

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!on) { rx = mx; ry = my; on = true; document.body.classList.add('hc'); dot.style.opacity = '1'; ring.style.opacity = '.6'; }
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  document.addEventListener('mouseleave', function () { dot.style.opacity = ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { if (on) { dot.style.opacity = '1'; ring.style.opacity = '.6'; } });

  (function loop() { rx += (mx-rx)*.12; ry += (my-ry)*.12; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(loop); }());

  var SEL = 'a,button,label,[data-tilt],.pill,.tag,.badge,.cc,.pc,.sc2,.sl3,.tt,.copy-btn';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(SEL)) { ring.style.width = '52px'; ring.style.height = '52px'; ring.style.borderColor = 'var(--a2)'; ring.style.opacity = '.9'; }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(SEL)) { ring.style.width = '34px'; ring.style.height = '34px'; ring.style.borderColor = 'var(--ac)'; ring.style.opacity = '.6'; }
  });
}());

/* ─────────────────────────────────────────────
   9. NAV — scrolled state + active link highlight
   ───────────────────────────────────────────── */
(function () {
  var nv    = document.getElementById('nv');
  var links = document.querySelectorAll('.na');
  window.addEventListener('scroll', function () { nv.classList.toggle('sc', window.scrollY > 40); }, { passive: true });
  nv.classList.toggle('sc', window.scrollY > 40);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });
}());

/* ─────────────────────────────────────────────
   10. MOBILE NAV
   ───────────────────────────────────────────── */
(function () {
  var hb = document.getElementById('hb');
  var mo = document.getElementById('mo');
  if (!hb || !mo) return;
  document.querySelectorAll('#nls .na').forEach(function (l) {
    var clone = l.cloneNode(true); clone.style.fontSize = '1rem'; clone.style.letterSpacing = '.18em'; mo.appendChild(clone);
  });
  function toggle(open) { hb.classList.toggle('op', open); hb.setAttribute('aria-expanded', open); mo.classList.toggle('op', open); document.body.style.overflow = open ? 'hidden' : ''; }
  hb.addEventListener('click', function () { toggle(!mo.classList.contains('op')); });
  mo.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
  mo.addEventListener('click', function (e) { if (e.target === mo) toggle(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
}());

/* ─────────────────────────────────────────────
   11. SCROLL REVEAL
   ───────────────────────────────────────────── */
(function () {
  try {
    var els = document.querySelectorAll('.rv');
    if (!els.length) return;
    document.body.classList.add('jr');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { document.querySelectorAll('.rv:not(.in)').forEach(function (el) { el.classList.add('in'); }); }, 1500);
  } catch (err) { document.body.classList.remove('jr'); }
}());

/* ─────────────────────────────────────────────
   12. ANIMATED COUNTERS
   ───────────────────────────────────────────── */
(function () {
  var els = document.querySelectorAll('.sn2[data-t]');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = +el.dataset.t, dur = 1400, t0 = performance.now();
      (function tick(now) { var p = Math.min((now-t0)/dur,1); el.textContent = Math.round((1-Math.pow(1-p,4))*target); if (p<1) requestAnimationFrame(tick); }(performance.now()));
      io.unobserve(el);
    });
  }, { threshold: .5 });
  els.forEach(function (el) { io.observe(el); });
}());

/* ─────────────────────────────────────────────
   13. SKILL BARS
   ───────────────────────────────────────────── */
(function () {
  var sec = document.getElementById('skills');
  if (!sec) return;
  var fills = sec.querySelectorAll('.skf[data-w]');
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      fills.forEach(function (f, i) { setTimeout(function () { f.style.width = f.dataset.w + '%'; }, i * 70); });
    });
  }, { threshold: .2 }).observe(sec);
}());

/* ─────────────────────────────────────────────
   14. PROJECT CARD TILT + GLOW
   ───────────────────────────────────────────── */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    var glow = card.querySelector('.pg2');
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect(), cx = (e.clientX-r.left)/r.width, cy = (e.clientY-r.top)/r.height;
      card.style.transform = 'perspective(700px) rotateX('+((cy-.5)*-8)+'deg) rotateY('+((cx-.5)*8)+'deg) translateZ(4px)';
      card.style.transition = 'transform .1s linear';
      if (glow) { glow.style.setProperty('--mx2',(cx*100)+'%'); glow.style.setProperty('--my',(cy*100)+'%'); }
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)'; });
  });
}());

/* ─────────────────────────────────────────────
   15. PROFILE PHOTO UPLOAD
   ───────────────────────────────────────────── */
(function () {
  var inp = document.getElementById('phu'), img = document.getElementById('pi');
  if (!inp || !img) return;
  inp.addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function (ev) { img.src = ev.target.result; toast('📷 Photo updated!', 'ok', 2500); };
    reader.readAsDataURL(f);
  });
}());

/* ─────────────────────────────────────────────
   16. COPY EMAIL TO CLIPBOARD
   ───────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var text = btn.dataset.copy;
      if (!text) return;
      navigator.clipboard.writeText(text).then(function () {
        toast('📋 Email copied to clipboard!', 'ok', 2500);
      }).catch(function () {
        toast('Could not copy — please copy manually.', 'err', 3000);
      });
    });
  });
}());

/* ─────────────────────────────────────────────
   17. CONTACT FORM — EmailJS
   ─────────────────────────────────────────────
   Setup (free, ~5 min):
   1. Sign up at https://www.emailjs.com
   2. Email Services → Add Service → copy SERVICE_ID
   3. Email Templates → Create Template with:
        {{from_name}} {{from_email}} {{subject}} {{message}} {{to_name}}
      → copy TEMPLATE_ID
   4. Account → General → copy PUBLIC_KEY
   5. Paste the three values below ↓
   ───────────────────────────────────────────── */
(function () {
  var PK = 'alg84AK46Bvk1Yx4b';
  var SI = 'service_pfg97tj';
  var TI = 'template_0oafehi';
  var YN = 'Clarence Flores';

  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: PK });

  var form = document.getElementById('cf');
  if (!form) return;
  var btn  = document.getElementById('cfb');
  var lbl  = document.getElementById('cbl');
  var spin = document.getElementById('cs');

  function setLoading(on) { btn.disabled = on; lbl.textContent = on ? 'Sending…' : 'Send Message'; if (spin) spin.style.display = on ? 'inline-block' : 'none'; }
  function shake(el) { el.style.animation = 'none'; el.getBoundingClientRect(); el.style.animation = 'shake .4s ease'; el.addEventListener('animationend', function () { el.style.animation = ''; }, { once: true }); el.focus(); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name  = form.querySelector('#cfn').value.trim();
    var email = form.querySelector('#cfe').value.trim();
    var msg   = form.querySelector('#cfm').value.trim();
    var re    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name)           { shake(form.querySelector('#cfn')); return; }
    if (!re.test(email)) { shake(form.querySelector('#cfe')); return; }
    if (!msg)            { shake(form.querySelector('#cfm')); return; }

    if (PK === 'YOUR_PUBLIC_KEY') {
      console.warn('[EmailJS] Paste your credentials into main.js');
      setLoading(true);
      setTimeout(function () { setLoading(false); form.reset(); toast('✓ Message sent! I\'ll be in touch soon.', 'ok'); }, 1200);
      return;
    }

    setLoading(true);
    emailjs.send(SI, TI, {
      to_name: YN, from_name: name, from_email: email,
      subject: form.querySelector('#cfs').value.trim() || '(no subject)',
      message: msg, reply_to: email
    }).then(function () {
      setLoading(false); form.reset(); toast('✓ Message sent! I\'ll be in touch soon.', 'ok');
    }, function (err) {
      console.error('[EmailJS]', err); setLoading(false); toast('✗ Something went wrong. Please try again.', 'err');
    });
  });
}());
