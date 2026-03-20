/* ============================================================
   PORTFOLIO — main.js
   ============================================================ */
'use strict';

/* ============================================================
   1. THEME TOGGLE
   Theme is already set by inline <script> in <head>.
   This just wires the button.
   ============================================================ */
const html = document.documentElement;
(function initTheme() {
  // Already applied by inline <script> in <head> — just wire the button
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const next   = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });

  // Set initial aria-label
  const cur = html.getAttribute('data-theme') || 'dark';
  btn.setAttribute('aria-label', cur === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
})();

/* ============================================================
   2. CANVAS BACKGROUND — floating particles + lines
   ============================================================ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [], raf;
  const N = window.innerWidth < 600 ? 35 : 70;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function mkPt() {
    return { x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3, life:Math.random() };
  }
  function accent() {
    return html.getAttribute('data-theme') === 'light' ? '61,122,0,' : '200,244,104,';
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    const a = accent();
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.life = (p.life + .002) % 1;
      if (p.x < -2) p.x = W+2; if (p.x > W+2) p.x = -2;
      if (p.y < -2) p.y = H+2; if (p.y > H+2) p.y = -2;
      const al = Math.sin(p.life * Math.PI) * .5;
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.random()*.5+.8,0,Math.PI*2);
      ctx.fillStyle = `rgba(${a}${al})`; ctx.fill();
    });
    for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++) {
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
      if (d<110) {
        ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=`rgba(${a}${(1-d/110)*.07})`; ctx.lineWidth=.5; ctx.stroke();
      }
    }
    raf = requestAnimationFrame(draw);
  }
  resize();
  pts = Array.from({length:N},mkPt);
  draw();
  window.addEventListener('resize',()=>{ cancelAnimationFrame(raf); resize(); pts=Array.from({length:N},mkPt); draw(); });
})();

/* ============================================================
   3. CUSTOM CURSOR — only activates on real pointer devices
   ============================================================ */
(function () {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only activate on true desktop pointer (not touch, not stylus-only)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
    return;
  }

  let mx = -999, my = -999;  // dot  — instant
  let rx = -999, ry = -999;  // ring — lagged
  let active = false;

  // Disable CSS left/top transitions on cursor elements so JS RAF is smooth
  dot.style.transition  = 'opacity .2s ease';
  ring.style.transition = 'opacity .2s ease, width .3s cubic-bezier(.16,1,.3,1), height .3s cubic-bezier(.16,1,.3,1), border-color .3s ease';

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    if (!active) {
      // First move: snap ring to cursor so it doesn't sweep from corner
      rx = mx; ry = my;
      active = true;
      document.body.classList.add('has-cursor');
    }

    // Move dot instantly
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  // Hide when pointer leaves window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (active) {
      dot.style.opacity  = '1';
      ring.style.opacity = '.6';
    }
  });

  // Smooth ring via RAF (lerp)
  (function loop() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // Hover expand
  const hov = 'a, button, label, [data-tilt], .pill, .tag, .badge, .cert-card, .proj-card, .stat-card, .soc-link, .tl-item, .theme-toggle';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hov)) document.body.classList.add('cur-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hov)) document.body.classList.remove('cur-hover');
  });
})();

/* ============================================================
   4. NAV — scrolled state + active link
   ============================================================ */
(function () {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 40); }, {passive:true});
  nav.classList.toggle('scrolled', window.scrollY > 40);

  const secs = document.querySelectorAll('section[id]');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id));
    });
  }, {rootMargin:'-40% 0px -55% 0px'}).observe
  ; // intentionally no-op end
  // Use forEach instead:
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id));
    });
  }, {rootMargin:'-40% 0px -55% 0px'});
  secs.forEach(s => io.observe(s));
})();

/* ============================================================
   5. MOBILE NAV
   ============================================================ */
(function () {
  const ham = document.getElementById('hamburger');
  const ov  = document.getElementById('mob-overlay');
  if (!ham || !ov) return;

  // Clone desktop nav links into overlay
  document.querySelectorAll('#nav-links .nav-link').forEach(l => {
    const c = l.cloneNode(true);
    c.style.fontSize = '1.05rem';
    c.style.letterSpacing = '.18em';
    ov.appendChild(c);
  });

  const toggle = open => {
    ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open);
    ov.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  ham.addEventListener('click', () => toggle(!ov.classList.contains('open')));
  ov.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  ov.addEventListener('click', e => { if (e.target===ov) toggle(false); });
  document.addEventListener('keydown', e => { if (e.key==='Escape') toggle(false); });
})();

/* ============================================================
   6. SCROLL REVEAL
   Uses a "safe" approach:
   — Adds body.js-ready ONLY after confirming IntersectionObserver works
   — Falls back gracefully: elements stay visible if anything fails
   ============================================================ */
(function () {
  try {
    const els = document.querySelectorAll('.rv');
    if (!els.length) return;

    // Mark body so CSS can now use opacity:0 on .rv
    document.body.classList.add('js-ready');

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));

    // Safety net: after 2s, force ALL reveals visible
    // (handles edge cases where IntersectionObserver doesn't fire)
    setTimeout(() => {
      document.querySelectorAll('.rv:not(.in)').forEach(el => el.classList.add('in'));
    }, 2000);

  } catch (err) {
    // If anything fails, remove js-ready so elements stay visible
    document.body.classList.remove('js-ready');
    console.warn('[Reveal] Fallback activated:', err);
  }
})();

/* ============================================================
   7. ANIMATED COUNTERS
   ============================================================ */
(function () {
  const els = document.querySelectorAll('.stat-n[data-target]');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.target, dur = 1400, t0 = performance.now();
      const tick = now => {
        const p = Math.min((now-t0)/dur, 1);
        el.textContent = Math.round((1-Math.pow(1-p,4)) * target);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, {threshold:.5});
  els.forEach(el => io.observe(el));
})();

/* ============================================================
   8. SKILL BARS
   ============================================================ */
(function () {
  const sec = document.getElementById('skills');
  if (!sec) return;
  const fills = sec.querySelectorAll('.sk-fill[data-w]');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      fills.forEach((f,i) => setTimeout(() => { f.style.width = f.dataset.w+'%'; }, i*70));
    });
  }, {threshold:.2}).observe(sec);
})();

/* ============================================================
   9. PROJECT CARD TILT + GLOW
   ============================================================ */
(function () {
  if (!window.matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(card => {
    const glow = card.querySelector('.proj-glow');
    card.addEventListener('mousemove', e => {
      const r=card.getBoundingClientRect(), cx=(e.clientX-r.left)/r.width, cy=(e.clientY-r.top)/r.height;
      card.style.transform = `perspective(700px) rotateX(${(cy-.5)*-8}deg) rotateY(${(cx-.5)*8}deg) translateZ(4px)`;
      card.style.transition = 'transform .1s linear';
      if (glow) { glow.style.setProperty('--mx',(cx*100)+'%'); glow.style.setProperty('--my',(cy*100)+'%'); }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
    });
  });
})();

/* ============================================================
   10. PROFILE PHOTO UPLOAD
   ============================================================ */
(function () {
  const input = document.getElementById('photo-upload');
  const img   = document.getElementById('profile-img');
  if (!input || !img) return;
  input.addEventListener('change', e => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => { img.src = ev.target.result; };
    reader.readAsDataURL(f);
  });
})();

/* ============================================================
   11. CONTACT FORM — EmailJS
   ─────────────────────────────────────────────────────────────
   SETUP (free, ~5 min):
   1. https://www.emailjs.com → sign up
   2. Email Services → Add Service → copy SERVICE_ID
   3. Email Templates → Create Template, use variables:
        {{from_name}} {{from_email}} {{subject}} {{message}} {{to_name}}
      → copy TEMPLATE_ID
   4. Account → General → copy PUBLIC_KEY
   5. Paste the 3 values below
   ============================================================ */
(function () {
  const PUBLIC_KEY   = 'alg84AK46Bvk1Yx4b';    // e.g. 'abc123XYZ'
  const SERVICE_ID   = 'service_ysq4klk';    // e.g. 'service_abc123'
  const TEMPLATE_ID  = 'template_0oafehi';   // e.g. 'template_abc123'
  const YOUR_NAME    = 'Clarence Flores';

  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: PUBLIC_KEY });

  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn   = document.getElementById('cf-btn');
  const lbl   = document.getElementById('cf-btn-lbl');
  const spin  = document.getElementById('cf-spin');
  const okMsg = document.getElementById('cf-ok');
  const errMsg= document.getElementById('cf-err');

  const setLoading = on => {
    btn.disabled = on;
    lbl.textContent = on ? 'Sending…' : 'Send Message';
    if (spin) spin.style.display = on ? 'block' : 'none';
  };
  const showMsg = (el, ms=6000) => {
    el.style.display='block';
    setTimeout(() => el.style.display='none', ms);
  };
  const hide = () => { okMsg.style.display='none'; errMsg.style.display='none'; };

  const shake = el => {
    el.style.animation='none'; el.getBoundingClientRect();
    el.style.animation='shake .4s ease'; el.focus();
    el.addEventListener('animationend',()=>el.style.animation='',{once:true});
  };

  form.addEventListener('submit', async e => {
    e.preventDefault(); hide();
    const name = form.querySelector('#cf-name').value.trim();
    const email= form.querySelector('#cf-email').value.trim();
    const msg  = form.querySelector('#cf-msg').value.trim();
    const re   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name)          { shake(form.querySelector('#cf-name'));  return; }
    if (!re.test(email)){ shake(form.querySelector('#cf-email')); return; }
    if (!msg)           { shake(form.querySelector('#cf-msg'));   return; }

    // Dev mode: credentials not yet filled in
    if (PUBLIC_KEY==='YOUR_PUBLIC_KEY' || SERVICE_ID==='YOUR_SERVICE_ID') {
      console.warn('%c[EmailJS] Add your credentials in main.js line ~220','background:#ff6b6b;color:#fff;padding:3px 8px;border-radius:3px');
      setLoading(true);
      await new Promise(r=>setTimeout(r,1200));
      setLoading(false); form.reset(); showMsg(okMsg);
      return;
    }

    setLoading(true);
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_name:   YOUR_NAME,
        from_name: name,
        from_email:email,
        subject:   form.querySelector('#cf-subject').value.trim() || '(no subject)',
        message:   msg,
        reply_to:  email,
      });
      setLoading(false); form.reset(); showMsg(okMsg);
    } catch (err) {
      console.error('[EmailJS]', err);
      setLoading(false); showMsg(errMsg);
    }
  });
})();
