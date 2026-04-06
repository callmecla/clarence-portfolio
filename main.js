/* ============================================================
   main.js — Clarence Flores Portfolio
   ============================================================ */
'use strict';

const ROOT = document.documentElement;

/* ── Helpers ── */
const $ = id => document.getElementById(id);
const toast = (msg, type, dur = 3500) => {
  const wrap = $('toast-wrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, dur);
};

/* ── 1. PAGE LOADER ── */
(function () {
  const loader = $('loader');
  if (!loader) return;
  const done = () => loader.classList.add('done');
  window.addEventListener('load', () => setTimeout(done, 600));
  setTimeout(done, 2200); /* fallback */
}());

/* ── 2. SCROLL PROGRESS BAR ── */
(function () {
  const bar = $('spb');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}());

/* ── 3. BACK TO TOP ── */
(function () {
  const btn = $('btt');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}());

/* ── 4. THEME TOGGLE ── */
const themeToggle = $('tg');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = ROOT.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    ROOT.setAttribute('data-theme', next);
    localStorage.setItem('pt', next);
    toast(next === 'light' ? '☀️ Light mode' : '🌙 Dark mode', '', 2000);
  });
}

/* ── 5. TYPEWRITER ── */
(function () {
  const el = $('tw');
  if (!el) return;
  /* Skip animation if user prefers reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = 'Full-Stack Developer';
    return;
  }
  const words = ['Full-Stack Developer', 'UI/UX Enthusiast', 'Problem Solver', 'IT Student', 'Open-Source Contributor'];
  let w = 0;
  let c = 0;
  let del = false;
  const tick = () => {
    const word = words[w];
    el.textContent = del ? word.slice(0, c--) : word.slice(0, c++);
    const wait = del ? 50 : 95;
    if (!del && c > word.length) {
      del = true;
      setTimeout(tick, 1800);
      return;
    }
    if (del && c < 0) {
      del = false;
      w = (w + 1) % words.length;
      c = 0;
      setTimeout(tick, 350);
      return;
    }
    setTimeout(tick, wait);
  };
  setTimeout(tick, 1300);
}());

/* ── 6. CANVAS PARTICLES ── */
(function () {
  const canvas = $('cv');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W;
  let H;
  let pts = [];
  let raf;
  const N = window.innerWidth < 600 ? 30 : 65;

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  const mkPt = () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, l: Math.random() });
  const color = () => ROOT.getAttribute('data-theme') === 'light' ? '61,122,0,' : '200,244,104,';

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const c = color();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.l = (p.l + .002) % 1;
      if (p.x < -2) p.x = W + 2;
      if (p.x > W + 2) p.x = -2;
      if (p.y < -2) p.y = H + 2;
      if (p.y > H + 2) p.y = -2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, .9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c}${Math.sin(p.l * Math.PI) * .5})`;
      ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${c}${(1 - d / 110) * .07})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  };

  resize();
  for (let i = 0; i < N; i++) pts.push(mkPt());
  draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    pts = [];
    for (let i = 0; i < N; i++) pts.push(mkPt());
    draw();
  });
}());

/* ── 7. CUSTOM CURSOR (desktop only) ── */
(function () {
  const dot = $('cd');
  const ring = $('cr');
  if (!dot || !ring) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mx = 0;
  let my = 0;
  let rx = 0;
  let ry = 0;
  let active = false;
  dot.style.transition = 'opacity .15s';
  ring.style.transition = 'width .3s cubic-bezier(.16,1,.3,1), height .3s cubic-bezier(.16,1,.3,1), border-color .3s, opacity .15s';

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if (!active) {
      rx = mx;
      ry = my;
      active = true;
      document.body.classList.add('has-cursor');
      dot.style.opacity = '1';
      ring.style.opacity = '.6';
    }
    dot.style.left = `${mx}px`;
    dot.style.top = `${my}px`;
  }, { passive: true });

  document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { if (active) { dot.style.opacity = '1'; ring.style.opacity = '.6'; } });

  const loop = () => {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const SEL = 'a, button, label, [data-tilt], .pill, .tag, .badge, .cert, .proj, .stat, .social, .tt, .copy-btn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(SEL)) {
      ring.style.width = '50px';
      ring.style.height = '50px';
      ring.style.borderColor = 'var(--acc2)';
      ring.style.opacity = '.85';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(SEL)) {
      ring.style.width = '34px';
      ring.style.height = '34px';
      ring.style.borderColor = 'var(--acc)';
      ring.style.opacity = '.6';
    }
  });
}());

/* ── 8. NAV — scrolled + active link ── */
(function () {
  const nav = $('nv');
  if (!nav) return;
  const links = document.querySelectorAll('.na');
  const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  document.querySelectorAll('section[id]').forEach(s => io.observe(s));
}());

/* ── 9. MOBILE NAV ── */
(function () {
  const hb = $('hb');
  const mo = $('mo');
  if (!hb || !mo) return;

  document.querySelectorAll('#nls .na').forEach(l => mo.appendChild(l.cloneNode(true)));

  const toggle = open => {
    hb.classList.toggle('open', open);
    hb.setAttribute('aria-expanded', String(open));
    mo.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hb.addEventListener('click', () => toggle(!mo.classList.contains('open')));
  mo.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  mo.addEventListener('click', e => { if (e.target === mo) toggle(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
}());

/* ── 10. SCROLL REVEAL ── */
(function () {
  try {
    const els = document.querySelectorAll('.rv');
    if (!els.length) return;
    document.body.classList.add('js-ready');

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => io.observe(el));
    /* Safety net — force-reveal anything still hidden after 1.5s */
    setTimeout(() => {
      document.querySelectorAll('.rv:not(.visible)').forEach(el => el.classList.add('visible'));
    }, 1500);
  } catch (e) {
    document.body.classList.remove('js-ready');
  }
}());

/* ── 11. ANIMATED COUNTERS ── */
(function () {
  const els = document.querySelectorAll('.stat-n[data-t]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = Number(el.dataset.t);
      const dur = 1200;
      const t0 = performance.now();

      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * target);
        if (p < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: .5 });

  els.forEach(el => io.observe(el));
}());

/* ── 12. SKILL BARS ── */
(function () {
  const sec = $('skills');
  if (!sec) return;
  const fills = sec.querySelectorAll('.skill-fill[data-w]');

  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      fills.forEach((f, i) => setTimeout(() => { f.style.width = `${f.dataset.w}%`; }, i * 60));
    });
  }, { threshold: .2 }).observe(sec);
}());

/* ── 13. PROJECT CARD TILT + GLOW ── */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(card => {
    const glow = card.querySelector('.proj-glow');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width;
      const cy = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(700px) rotateX(${(cy - .5) * -7}deg) rotateY(${(cx - .5) * 7}deg) translateZ(4px)`;
      card.style.transition = 'transform .1s linear';
      if (glow) {
        glow.style.setProperty('--gx', `${cx * 100}%`);
        glow.style.setProperty('--gy', `${cy * 100}%`);
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
    });
  });
}());

/* ── 14. PROFILE PHOTO UPLOAD ── */
(function () {
  const inp = $('phu');
  const img = $('pi');
  if (!inp || !img) return;

  inp.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = ev => { img.src = ev.target.result; toast('📷 Photo updated!', 'ok', 2500); };
    reader.readAsDataURL(f);
  });
}());

/* ── 15. COPY EMAIL ── */
(function () {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const text = btn.dataset.copy;
      if (!text) return;

      const onSuccess = () => toast('📋 Email copied!', 'ok', 2500);
      const onError = () => toast('Could not copy — try manually.', 'err', 3000);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onSuccess).catch(onError);
      } else {
        const tmp = document.createElement('input');
        tmp.value = text;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        onSuccess();
      }
    });
  });
}());

/* ── 16. CONTACT FORM — */

(function () {
  const PK = 'alg84AK46Bvk1Yx4b';
  const SI = 'service_pfg97tj';
  const TI = 'template_0oafehi';
  const YN = 'Clarence Flores';

  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: PK });

  const form = $('cf');
  if (!form) return;
  const btn = $('cfb');
  const lbl = $('cbl');
  const spin = $('cs');

  const setLoading = on => {
    if (btn) btn.disabled = on;
    if (lbl) lbl.textContent = on ? 'Sending…' : 'Send Message';
    if (spin) spin.style.display = on ? 'inline-block' : 'none';
  };

  const shake = el => {
    if (!el) return;
    el.style.animation = 'none';
    el.getBoundingClientRect();
    el.style.animation = 'shake .4s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
    el.focus();
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('#cfn').value.trim();
    const email = form.querySelector('#cfe').value.trim();
    const msg = form.querySelector('#cfm').value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) { shake(form.querySelector('#cfn')); return; }
    if (!re.test(email)) { shake(form.querySelector('#cfe')); return; }
    if (!msg) { shake(form.querySelector('#cfm')); return; }

    /* Dev mode — credentials not yet set */
    if (PK === 'alg84AK46Bvk1Yx4b') {
      console.warn('[EmailJS] Add your credentials to main.js');
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        form.reset();
        toast('✓ Message sent! I\'ll be in touch soon.', 'ok');
      }, 1200);
      return;
    }

    setLoading(true);
    emailjs.send(SI, TI, {
      to_name: name,
      from_name: name,
      from_email: email,
      subject: form.querySelector('#cfs').value.trim() || '(no subject)',
      message: msg,
      reply_to: email
    }).then(() => {
      setLoading(false);
      form.reset();
      toast('✓ Message sent! I\'ll be in touch soon.', 'ok');
    }, err => {
      console.error('[EmailJS]', err);
      setLoading(false);
      toast('✗ Send failed — please email me directly.', 'err');
    });
  });
}());
