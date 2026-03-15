/* ============================================================
   PORTFOLIO — main.js
   ============================================================ */

'use strict';

/* ============================================================
   1. THEME TOGGLE  (persisted to localStorage)
   ============================================================ */
const html         = document.documentElement;
const themeToggle  = document.getElementById('theme-toggle');

// Restore saved theme
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('portfolio-theme', next);
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

  // Skip on touch devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Smooth ring follow
  (function loop() {
    rx += (mx - rx) * .13;
    ry += (my - ry) * .13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // Hover state
  const hoverEls = 'a, button, [data-tilt], .pill, .tag, .badge, .cert-card, .project-card, .stat-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('cursor-hover');
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
   11. CONTACT FORM  (simulated submit)
   ============================================================ */
(function initForm() {
  const form    = document.getElementById('contact-form');
  const btn     = document.getElementById('form-submit');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Simple validation
    const name    = form.querySelector('#cf-name').value.trim();
    const email   = form.querySelector('#cf-email').value.trim();
    const message = form.querySelector('#cf-msg').value.trim();
    if (!name || !email || !message) return;

    // Loading state
    btn.classList.add('loading');
    btn.disabled = true;

    // Simulate async send (replace with actual fetch/EmailJS/Formspree)
    setTimeout(() => {
      btn.classList.remove('loading');
      btn.textContent = '✓ Sent!';
      success.classList.add('visible');
      form.reset();

      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        success.classList.remove('visible');
      }, 5000);
    }, 1800);
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
