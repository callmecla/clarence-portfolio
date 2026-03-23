/* ============================================================
   PORTFOLIO — main.js
   ============================================================ */
'use strict';

const html = document.documentElement;

/* ============================================================
   1. THEME  — toggle wired here, initial value set in <head>
   ============================================================ */
document.getElementById('theme-toggle')?.addEventListener('click', function () {
  var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
});

/* ============================================================
   2. CANVAS — particles + connecting lines
   ============================================================ */
(function () {
  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, pts = [], raf;
  var N = window.innerWidth < 600 ? 35 : 70;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function mkPt()   { return { x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3, life:Math.random() }; }
  function color()  { return html.getAttribute('data-theme')==='light' ? '61,122,0,' : '200,244,104,'; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var c = color();
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      p.life = (p.life + .002) % 1;
      if (p.x < -2) p.x = W+2; if (p.x > W+2) p.x = -2;
      if (p.y < -2) p.y = H+2; if (p.y > H+2) p.y = -2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, .9, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(' + c + (Math.sin(p.life * Math.PI) * .5) + ')';
      ctx.fill();
    }
    for (var i = 0; i < pts.length; i++) {
      for (var j = i+1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        var d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = 'rgba(' + c + ((1 - d/110) * .07) + ')';
          ctx.lineWidth   = .5;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  for (var i = 0; i < N; i++) pts.push(mkPt());
  draw();
  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf);
    resize();
    pts = [];
    for (var i = 0; i < N; i++) pts.push(mkPt());
    draw();
  });
})();

/* ============================================================
   3. CURSOR — dot follows instantly, ring lerps behind
      Only on real desktop pointer devices.
   ============================================================ */
(function () {
  var dot  = document.getElementById('cursor-dot');
  var ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  /* bail out on touch / stylus-only screens */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
    return;
  }

  var mx = 0, my = 0;   /* dot — tracks mouse exactly */
  var rx = 0, ry = 0;   /* ring — lerps behind */
  var started = false;

  /* Make cursor elements visible once we know we're on desktop */
  dot.style.opacity  = '0';
  ring.style.opacity = '0';

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;

    /* First move: place everything at the real position so no sweep */
    if (!started) {
      rx = mx; ry = my;
      started = true;
      document.body.classList.add('has-cursor');
      dot.style.opacity  = '1';
      ring.style.opacity = '.6';
    }

    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  document.addEventListener('mouseleave', function () {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    if (started) {
      dot.style.opacity  = '1';
      ring.style.opacity = '.6';
    }
  });

  /* RAF loop — moves ring with smooth lerp, no CSS transition needed */
  (function loop() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  }());

  /* Grow ring on interactive elements */
  var SEL = 'a, button, label, [data-tilt], .pill, .tag, .badge, ' +
            '.cert-card, .proj-card, .stat-card, .soc-link, .tl-item, .theme-toggle';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(SEL)) {
      ring.style.width       = '52px';
      ring.style.height      = '52px';
      ring.style.borderColor = 'var(--acc2)';
      ring.style.opacity     = '.9';
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(SEL)) {
      ring.style.width       = '34px';
      ring.style.height      = '34px';
      ring.style.borderColor = 'var(--acc)';
      ring.style.opacity     = '.6';
    }
  });
}());

/* ============================================================
   4. NAV — add .scrolled on scroll, highlight active section
   ============================================================ */
(function () {
  var nav   = document.getElementById('nav');
  var links = document.querySelectorAll('.nav-link');

  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

/* ============================================================
   5. MOBILE NAV
   ============================================================ */
(function () {
  var ham = document.getElementById('hamburger');
  var ov  = document.getElementById('mob-overlay');
  if (!ham || !ov) return;

  document.querySelectorAll('#nav-links .nav-link').forEach(function (l) {
    var c = l.cloneNode(true);
    c.style.fontSize     = '1.05rem';
    c.style.letterSpacing = '.18em';
    ov.appendChild(c);
  });

  function toggle(open) {
    ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open);
    ov.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  ham.addEventListener('click', function () { toggle(!ov.classList.contains('open')); });
  ov.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
  ov.addEventListener('click', function (e) { if (e.target === ov) toggle(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
}());

/* ============================================================
   6. SCROLL REVEAL
   Elements are visible by default (no opacity:0 in HTML).
   JS-ready class is added ONLY after confirming IO works,
   then a 1.5s safety net forces everything visible anyway.
   ============================================================ */
(function () {
  try {
    var els = document.querySelectorAll('.rv');
    if (!els.length) return;

    document.body.classList.add('js-ready');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });

    /* Safety net */
    setTimeout(function () {
      document.querySelectorAll('.rv:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 1500);

  } catch (err) {
    document.body.classList.remove('js-ready');
  }
}());

/* ============================================================
   7. COUNTERS
   ============================================================ */
(function () {
  var els = document.querySelectorAll('.stat-n[data-target]');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = +el.dataset.target, dur = 1400, t0 = performance.now();
      (function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1-p, 4)) * target);
        if (p < 1) requestAnimationFrame(tick);
      }(performance.now()));
      io.unobserve(el);
    });
  }, { threshold: .5 });
  els.forEach(function (el) { io.observe(el); });
}());

/* ============================================================
   8. SKILL BARS
   ============================================================ */
(function () {
  var sec = document.getElementById('skills');
  if (!sec) return;
  var fills = sec.querySelectorAll('.sk-fill[data-w]');
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      fills.forEach(function (f, i) {
        setTimeout(function () { f.style.width = f.dataset.w + '%'; }, i * 70);
      });
    });
  }, { threshold: .2 }).observe(sec);
}());

/* ============================================================
   9. CARD TILT + GLOW
   ============================================================ */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    var glow = card.querySelector('.proj-glow');
    card.addEventListener('mousemove', function (e) {
      var r  = card.getBoundingClientRect();
      var cx = (e.clientX - r.left) / r.width;
      var cy = (e.clientY - r.top)  / r.height;
      card.style.transform  = 'perspective(700px) rotateX(' + ((cy-.5)*-8) + 'deg) rotateY(' + ((cx-.5)*8) + 'deg) translateZ(4px)';
      card.style.transition = 'transform .1s linear';
      if (glow) { glow.style.setProperty('--mx', (cx*100)+'%'); glow.style.setProperty('--my', (cy*100)+'%'); }
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform  = '';
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
    });
  });
}());

/* ============================================================
   10. PHOTO UPLOAD
   ============================================================ */
(function () {
  var input = document.getElementById('photo-upload');
  var img   = document.getElementById('profile-img');
  if (!input || !img) return;
  input.addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function (ev) { img.src = ev.target.result; };
    reader.readAsDataURL(f);
  });
}());

/* ============================================================
   11. CONTACT FORM — EmailJS
   ─────────────────────────────────────────────────────────
   HOW TO SET UP (free, 5 min):
   1. Sign up at https://www.emailjs.com
   2. Add an Email Service  → copy your SERVICE_ID
   3. Create an Email Template using these variables:
        {{from_name}}  {{from_email}}  {{subject}}  {{message}}  {{to_name}}
      → copy your TEMPLATE_ID
   4. Account → General → copy your PUBLIC_KEY
   5. Paste all three values below ↓
   ─────────────────────────────────────────────────────────
   ============================================================ */
(function () {
  var PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
  var SERVICE_ID  = 'YOUR_SERVICE_ID';
  var TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  var YOUR_NAME   = 'Your Name';

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: PUBLIC_KEY });
  }

  var form   = document.getElementById('contact-form');
  if (!form) return;
  var btn    = document.getElementById('cf-btn');
  var lbl    = document.getElementById('cf-btn-lbl');
  var spin   = document.getElementById('cf-spin');
  var okMsg  = document.getElementById('cf-ok');
  var errMsg = document.getElementById('cf-err');

  function setLoading(on) {
    btn.disabled    = on;
    lbl.textContent = on ? 'Sending…' : 'Send Message';
    if (spin) spin.style.display = on ? 'inline-block' : 'none';
  }
  function showEl(el) {
    el.style.display = 'block';
    setTimeout(function () { el.style.display = 'none'; }, 6000);
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
    okMsg.style.display  = 'none';
    errMsg.style.display = 'none';

    var name  = form.querySelector('#cf-name').value.trim();
    var email = form.querySelector('#cf-email').value.trim();
    var msg   = form.querySelector('#cf-msg').value.trim();
    var re    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name)           { shake(form.querySelector('#cf-name'));  return; }
    if (!re.test(email)) { shake(form.querySelector('#cf-email')); return; }
    if (!msg)            { shake(form.querySelector('#cf-msg'));   return; }

    /* Dev guard */
    if (PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      console.warn('[EmailJS] Paste your credentials into main.js');
      setLoading(true);
      setTimeout(function () { setLoading(false); form.reset(); showEl(okMsg); }, 1200);
      return;
    }

    setLoading(true);
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_name:    YOUR_NAME,
      from_name:  name,
      from_email: email,
      subject:    form.querySelector('#cf-subject').value.trim() || '(no subject)',
      message:    msg,
      reply_to:   email
    }).then(function () {
      setLoading(false); form.reset(); showEl(okMsg);
    }, function (err) {
      console.error('[EmailJS]', err);
      setLoading(false); showEl(errMsg);
    });
  });
}());
