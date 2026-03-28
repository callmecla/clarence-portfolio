/* ============================================================
   main.js — Clarence Flores Portfolio
   ============================================================ */
'use strict';

var H = document.documentElement;

/* ── 1. THEME TOGGLE ── */
document.getElementById('tg').addEventListener('click', function () {
  var next = H.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  H.setAttribute('data-theme', next);
  localStorage.setItem('pt', next);
});

/* ── 2. CANVAS BACKGROUND ── */
(function () {
  var c = document.getElementById('cv');
  var x = c.getContext('2d');
  var W, H2, pts = [], raf;
  var N = window.innerWidth < 600 ? 35 : 70;

  function rs() { W = c.width = window.innerWidth; H2 = c.height = window.innerHeight; }
  function mk() { return { x: Math.random()*W, y: Math.random()*H2, vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, l: Math.random() }; }
  function cl() { return H.getAttribute('data-theme') === 'light' ? '61,122,0,' : '200,244,104,'; }

  function dr() {
    x.clearRect(0, 0, W, H2);
    var c2 = cl();
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      p.l = (p.l + .002) % 1;
      if (p.x < -2) p.x = W+2; if (p.x > W+2) p.x = -2;
      if (p.y < -2) p.y = H2+2; if (p.y > H2+2) p.y = -2;
      x.beginPath();
      x.arc(p.x, p.y, .9, 0, Math.PI*2);
      x.fillStyle = 'rgba(' + c2 + (Math.sin(p.l * Math.PI) * .5) + ')';
      x.fill();
    }
    for (var i = 0; i < pts.length; i++) {
      for (var j = i+1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        var d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          x.beginPath();
          x.moveTo(pts[i].x, pts[i].y);
          x.lineTo(pts[j].x, pts[j].y);
          x.strokeStyle = 'rgba(' + c2 + ((1 - d/110) * .07) + ')';
          x.lineWidth = .5;
          x.stroke();
        }
      }
    }
    raf = requestAnimationFrame(dr);
  }

  rs();
  for (var i = 0; i < N; i++) pts.push(mk());
  dr();
  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf); rs(); pts = [];
    for (var i = 0; i < N; i++) pts.push(mk());
    dr();
  });
})();

/* ── 3. CURSOR ── */
(function () {
  var dot  = document.getElementById('cd');
  var ring = document.getElementById('cr');

  /* Only activate on real desktop pointer devices */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
    return;
  }

  var mx = 0, my = 0, rx = 0, ry = 0, on = false;

  /* Set transitions directly on the elements — avoids any CSS override */
  dot.style.transition  = 'opacity .15s';
  ring.style.transition = 'width .3s cubic-bezier(.16,1,.3,1), height .3s cubic-bezier(.16,1,.3,1), border-color .3s, opacity .15s';

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!on) {
      /* First move: snap ring to cursor so it doesn't sweep from the corner */
      rx = mx; ry = my;
      on = true;
      document.body.classList.add('hc');
      dot.style.opacity  = '1';
      ring.style.opacity = '.6';
    }
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', function () { if (on) { dot.style.opacity = '1'; ring.style.opacity = '.6'; } });

  /* RAF lerp for smooth ring follow */
  (function loop() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  }());

  /* Grow ring on interactive elements */
  var SEL = 'a, button, label, [data-tilt], .pill, .tag, .badge, .cc, .pc, .sc2, .sl3, .tt';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(SEL)) {
      ring.style.width       = '52px';
      ring.style.height      = '52px';
      ring.style.borderColor = 'var(--a2)';
      ring.style.opacity     = '.9';
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(SEL)) {
      ring.style.width       = '34px';
      ring.style.height      = '34px';
      ring.style.borderColor = 'var(--ac)';
      ring.style.opacity     = '.6';
    }
  });
}());

/* ── 4. NAV: scrolled state + active link ── */
(function () {
  var nv    = document.getElementById('nv');
  var links = document.querySelectorAll('.na');

  window.addEventListener('scroll', function () { nv.classList.toggle('sc', window.scrollY > 40); }, { passive: true });
  nv.classList.toggle('sc', window.scrollY > 40);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (a) {
          a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });
}());

/* ── 5. MOBILE NAV ── */
(function () {
  var hb = document.getElementById('hb');
  var mo = document.getElementById('mo');

  /* Clone desktop links into the mobile overlay */
  document.querySelectorAll('#nls .na').forEach(function (l) {
    var clone = l.cloneNode(true);
    clone.style.fontSize     = '1rem';
    clone.style.letterSpacing = '.18em';
    mo.appendChild(clone);
  });

  function toggle(open) {
    hb.classList.toggle('op', open);
    hb.setAttribute('aria-expanded', open);
    mo.classList.toggle('op', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hb.addEventListener('click', function () { toggle(!mo.classList.contains('op')); });
  mo.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
  mo.addEventListener('click', function (e) { if (e.target === mo) toggle(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
}());

/* ── 6. SCROLL REVEAL ── */
(function () {
  try {
    var els = document.querySelectorAll('.rv');
    if (!els.length) return;

    /* Add class so CSS can apply the hidden state */
    document.body.classList.add('jr');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });

    /* Safety net: force-reveal anything still hidden after 1.5s */
    setTimeout(function () {
      document.querySelectorAll('.rv:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 1500);

  } catch (err) {
    /* If anything fails, remove the class so elements stay visible */
    document.body.classList.remove('jr');
  }
}());

/* ── 7. ANIMATED COUNTERS ── */
(function () {
  var els = document.querySelectorAll('.sn2[data-t]');
  if (!els.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = +el.dataset.t, dur = 1400, t0 = performance.now();
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

/* ── 8. SKILL BARS ── */
(function () {
  var sec = document.getElementById('skills');
  if (!sec) return;
  var fills = sec.querySelectorAll('.skf[data-w]');

  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      fills.forEach(function (f, i) {
        setTimeout(function () { f.style.width = f.dataset.w + '%'; }, i * 70);
      });
    });
  }, { threshold: .2 }).observe(sec);
}());

/* ── 9. PROJECT CARD TILT + GLOW ── */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    var glow = card.querySelector('.pg2');
    card.addEventListener('mousemove', function (e) {
      var r  = card.getBoundingClientRect();
      var cx = (e.clientX - r.left) / r.width;
      var cy = (e.clientY - r.top)  / r.height;
      card.style.transform  = 'perspective(700px) rotateX(' + ((cy-.5)*-8) + 'deg) rotateY(' + ((cx-.5)*8) + 'deg) translateZ(4px)';
      card.style.transition = 'transform .1s linear';
      if (glow) {
        glow.style.setProperty('--mx2', (cx * 100) + '%');
        glow.style.setProperty('--my',  (cy * 100) + '%');
      }
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform  = '';
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
    });
  });
}());

/* ── 10. PROFILE PHOTO UPLOAD ── */
(function () {
  var inp = document.getElementById('phu');
  var img = document.getElementById('pi');
  if (!inp || !img) return;

  inp.addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    var reader = new FileReader();
    reader.onload = function (ev) { img.src = ev.target.result; };
    reader.readAsDataURL(f);
  });
}());

/* ── 11. CONTACT FORM — EmailJS ──────────────────────────
   Setup (free, ~5 min):
   1. Sign up at https://www.emailjs.com
   2. Email Services → Add Service → copy SERVICE_ID
   3. Email Templates → Create Template with these variables:
        {{from_name}}  {{from_email}}  {{subject}}  {{message}}  {{to_name}}
      → copy TEMPLATE_ID
   4. Account → General → copy PUBLIC_KEY
   5. Paste the three values below ↓
   ──────────────────────────────────────────────────────── */
(function () {
  var PK = 'YOUR_PUBLIC_KEY';   /* ← paste here */
  var SI = 'YOUR_SERVICE_ID';   /* ← paste here */
  var TI = 'YOUR_TEMPLATE_ID';  /* ← paste here */
  var YN = 'Clarence Flores';

  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: PK });

  var form = document.getElementById('cf');
  if (!form) return;
  var btn  = document.getElementById('cfb');
  var lbl  = document.getElementById('cbl');
  var spin = document.getElementById('cs');
  var ok   = document.getElementById('cok');
  var err  = document.getElementById('cer');

  function setLoading(on) {
    btn.disabled    = on;
    lbl.textContent = on ? 'Sending…' : 'Send Message';
    if (spin) spin.style.display = on ? 'inline-block' : 'none';
  }
  function showMsg(el) {
    el.style.display = 'block';
    setTimeout(function () { el.style.display = 'none'; }, 6000);
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
    ok.style.display = err.style.display = 'none';

    var name  = form.querySelector('#cfn').value.trim();
    var email = form.querySelector('#cfe').value.trim();
    var msg   = form.querySelector('#cfm').value.trim();
    var re    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name)           { shake(form.querySelector('#cfn')); return; }
    if (!re.test(email)) { shake(form.querySelector('#cfe')); return; }
    if (!msg)            { shake(form.querySelector('#cfm')); return; }

    /* Dev mode guard */
    if (PK === 'YOUR_PUBLIC_KEY') {
      console.warn('[EmailJS] Paste your credentials into main.js');
      setLoading(true);
      setTimeout(function () { setLoading(false); form.reset(); showMsg(ok); }, 1200);
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
      setLoading(false); form.reset(); showMsg(ok);
    }, function (e2) {
      console.error('[EmailJS]', e2);
      setLoading(false); showMsg(err);
    });
  });
}());
