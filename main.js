/* ============================================================
   PORTFOLIO — main.js
   ============================================================ */

'use strict';

/* ============================================================
   1. THEME TOGGLE  (persisted to localStorage)
   ============================================================ */
const html        = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

// Theme is already applied by the inline <script> in <head>.
// This just wires up the toggle button.
themeToggle?.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

  // Add transitioning class so CSS can animate the switch
  html.classList.add('theme-transitioning');
  html.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);

  setTimeout(() => html.classList.remove('theme-transitioning'), 500);
});

/* ============================================================
   2. ANIMATED CANVAS BACKGROUND  (floating particles)
   ============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  const COUNT = window.innerWidth < 600 ? 40 : 80;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.5 + 0.4,
      vx:   (Math.random() - .5) * .35,
      vy:   (Math.random() - .5) * .35,
      life: Math.random(),
    };
  }

  function init() {
    particles = Array.from({ length: COUNT }, randomParticle);
  }

  function getAccentColor() {
    const theme = html.getAttribute('data-theme');
    return theme === 'light'
      ? 'rgba(90,158,0,'
      : 'rgba(200,244,104,';
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const base = getAccentColor();

    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.life = (p.life + .003) % 1;

      const alpha = Math.sin(p.life * Math.PI) * .55;

      // Wrap edges
      if (p.x < -2)  p.x = W + 2;
      if (p.x > W+2) p.x = -2;
      if (p.y < -2)  p.y = H + 2;
      if (p.y > H+2) p.y = -2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = base + alpha + ')';
      ctx.fill();
    });

    // Draw faint connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * .08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = base + alpha + ')';
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    init();
    draw();
  });
})();

/* ============================================================
   3. CUSTOM CURSOR  (desktop only)
   ============================================================ */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only activate on real pointer devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
    return;
  }

  let mx = -200, my = -200;  // start offscreen
  let rx = -200, ry = -200;
  let visible = false;

  // Position dot instantly on first move
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;

    // Snap ring to cursor on first move so it doesn't sweep from corner
    if (!visible) {
      rx = mx;
      ry = my;
      visible = true;
    }

    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  // Smooth ring follow via RAF
  (function loop() {
    rx += (mx - rx) * .13;
    ry += (my - ry) * .13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // Hide when mouse leaves window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '.55';
  });

  // Hover expand state
  const hoverSel = 'a, button, label, [data-tilt], .pill, .tag, .badge, .cert-card, .project-card, .stat-card, .social-link, .timeline-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover');
  });
})();

/* ============================================================
   4. NAV — scroll style + active link highlight
   ============================================================ */
(function initNav() {
  const nav     = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scrolled class
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active section highlight
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ============================================================
   5. MOBILE NAV
   ============================================================ */
(function initMobileNav() {
  const hamburger     = document.getElementById('hamburger');
  const overlay       = document.getElementById('mobile-overlay');
  const navLinksEl    = document.getElementById('nav-links');
  if (!hamburger || !overlay) return;

  // Clone nav links into overlay
  const links = document.querySelectorAll('.nav-links .nav-link');
  links.forEach(link => {
    const clone = link.cloneNode(true);
    clone.style.cssText = 'font-size:1.1rem;letter-spacing:.18em;';
    overlay.appendChild(clone);
  });

  const toggle = (open) => {
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    overlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => {
    toggle(!overlay.classList.contains('open'));
  });

  // Close on link click
  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => toggle(false));
  });

  // Close on outside click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) toggle(false);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggle(false);
  });
})();

/* ============================================================
   6. SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ============================================================
   7. ANIMATED COUNTERS  (About stats)
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const dur    = 1400;
      const start  = performance.now();

      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        // Ease out quart
        const ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(ease * target);
        if (p < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ============================================================
   8. SKILL BARS
   ============================================================ */
(function initSkillBars() {
  const skillSection = document.getElementById('skills');
  if (!skillSection) return;

  const fills = skillSection.querySelectorAll('.skill-fill[data-w]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      fills.forEach((fill, i) => {
        setTimeout(() => {
          fill.style.width = fill.dataset.w + '%';
        }, i * 80);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  observer.observe(skillSection);
})();

/* ============================================================
   9. PROJECT CARD 3-D TILT + GLOW
   ============================================================ */
(function initTilt() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach(card => {
    const glow = card.querySelector('.project-glow');

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = (e.clientX - rect.left) / rect.width;
      const cy   = (e.clientY - rect.top)  / rect.height;
      const rx   = (cy - .5) * -10;
      const ry   = (cx - .5) *  10;

      card.style.transform        = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
      card.style.transition       = 'transform .1s linear';

      if (glow) {
        glow.style.setProperty('--mx', (cx * 100) + '%');
        glow.style.setProperty('--my', (cy * 100) + '%');
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
    });
  });
})();

/* ============================================================
   10. PROFILE PHOTO UPLOAD
   ============================================================ */
(function initPhotoUpload() {
  const input = document.getElementById('photo-upload');
  const img   = document.getElementById('profile-img');
  if (!input || !img) return;

  input.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = ev => {
      img.src = ev.target.result;
      img.style.animation = 'fadeIn .5s ease forwards';
    };
    reader.readAsDataURL(file);
  });
})();

/* ============================================================
   11. CONTACT FORM — EmailJS
   ─────────────────────────────────────────────────────────────
   SETUP STEPS (takes ~5 min — all free):
   1. Go to https://www.emailjs.com and create a free account.
   2. Dashboard → "Email Services" → Add Service (Gmail / Outlook / etc.)
      Copy your  SERVICE_ID  (looks like "service_xxxxxxx")
   3. Dashboard → "Email Templates" → Create Template.
      Use these exact variable names in your template body:
        {{from_name}}   — sender's name
        {{from_email}}  — sender's email
        {{subject}}     — subject line
        {{message}}     — message body
        {{to_name}}     — your name (auto-filled below)
      Save and copy your  TEMPLATE_ID  (looks like "template_xxxxxxx")
   4. Dashboard → Account → General → copy your  PUBLIC_KEY
   5. Paste the three values into the CONFIG block below.
   ─────────────────────────────────────────────────────────────
   NOTE: Free tier = 200 emails/month. No credit card needed.
   ============================================================ */
(function initForm() {

  /* ── CONFIG — paste your EmailJS credentials here ── */
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';      // e.g. 'abc123XYZdef'
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';      // e.g. 'service_abc123'
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';     // e.g. 'template_abc123'
  const YOUR_NAME           = 'Your Name';             // shown as {{to_name}} in template
  /* ── END CONFIG ── */

  // Initialise EmailJS with your public key
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const form    = document.getElementById('contact-form');
  const btn     = document.getElementById('form-submit');
  const btnLabel= document.getElementById('form-btn-label');
  const success = document.getElementById('form-success');
  const error   = document.getElementById('form-error');
  if (!form) return;

  // ── helpers ──
  const setLoading = (on) => {
    btn.classList.toggle('loading', on);
    btn.disabled = on;
    if (btnLabel) btnLabel.textContent = on ? 'Sending…' : 'Send Message';
  };

  const showMsg = (el, duration = 6000) => {
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), duration);
  };

  const hideAll = () => {
    success.classList.remove('visible');
    error.classList.remove('visible');
  };

  // ── inline validation ──
  const validate = () => {
    const name    = form.querySelector('#cf-name').value.trim();
    const email   = form.querySelector('#cf-email').value.trim();
    const message = form.querySelector('#cf-msg').value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name)              { shake(form.querySelector('#cf-name'));  return false; }
    if (!emailRe.test(email)){ shake(form.querySelector('#cf-email')); return false; }
    if (!message)           { shake(form.querySelector('#cf-msg'));   return false; }
    return { name, email, message };
  };

  const shake = (el) => {
    el.style.animation = 'none';
    el.getBoundingClientRect(); // reflow
    el.style.animation = 'shakeField .4s var(--ease)';
    el.addEventListener('animationend', () => el.style.animation = '', { once: true });
    el.focus();
  };

  // ── submit ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAll();

    const data = validate();
    if (!data) return;

    // Guard: if keys haven't been filled in, warn developer in console
    if (
      EMAILJS_PUBLIC_KEY  === 'YOUR_PUBLIC_KEY'  ||
      EMAILJS_SERVICE_ID  === 'YOUR_SERVICE_ID'  ||
      EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID'
    ) {
      console.warn(
        '%c[EmailJS] Fill in your credentials in main.js (search "CONFIG")',
        'background:#ff6b6b;color:#fff;padding:4px 8px;border-radius:4px;'
      );
      // Show success anyway in dev so you can test the UI flow
      setLoading(true);
      await new Promise(r => setTimeout(r, 1200));
      setLoading(false);
      form.reset();
      showMsg(success);
      return;
    }

    setLoading(true);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_name:    YOUR_NAME,
          from_name:  data.name,
          from_email: data.email,
          subject:    form.querySelector('#cf-subject').value.trim() || '(no subject)',
          message:    data.message,
          reply_to:   data.email,
        }
      );

      setLoading(false);
      form.reset();
      showMsg(success);

    } catch (err) {
      console.error('[EmailJS] Send failed:', err);
      setLoading(false);
      showMsg(error);
    }
  });

})();

/* ============================================================
   12. SMOOTH PARALLAX on hero orbs  (subtle, desktop only)
   ============================================================ */
(function initParallax() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  const hero = document.getElementById('hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const ring1 = hero.querySelector('.hero-profile-ring');
    const ring2 = hero.querySelector('.hero-profile-ring--2');
    if (ring1) ring1.style.transform = `scale(${1 + y * .0003})`;
    if (ring2) ring2.style.transform = `scale(${1 + y * .0005})`;
  }, { passive: true });
})();
