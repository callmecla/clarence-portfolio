/* ══════════════════════════════════════════════════════════
   FEATURE 23 — PROJECT & CERTIFICATION MODALS
   ══════════════════════════════════════════════════════════

   HOW TO UPDATE CONTENT:
   - Projects:       edit the PROJECTS array below
   - Certifications: edit the CERTS array below
   - Screenshots:    add image paths to the `image` field
   - Cert files:     add path/URL to `image` and `credentialUrl` fields

   NOTE: Each project/cert card in index.html needs a matching
   data-id attribute (e.g. <article class="proj" data-id="launchpad">)
   for the click-to-open behavior to work.
   ══════════════════════════════════════════════════════════ */

(function () {

  /* ── PROJECT DATA ──────────────────────────────────────── */
  var PROJECTS = [
    {
      id:    'launchpad',
      name:  'LaunchPad',
      icon:  '🚀',
      image: '',   // e.g. 'img/projects/launchpad.jpg' — leave empty until ready
      desc:  'LaunchPad is a no-code landing page builder that lets anyone create professional pages using a drag-and-drop block system, with a live preview and one-click Vercel deployment. It currently has over 1,200 beta users. I built the entire frontend architecture, the block rendering engine, and the Vercel integration.',
      tags:  ['React', 'Node', 'Vercel'],
      github: '',  // e.g. 'https://github.com/callmecla/launchpad'
      live:   '',  // e.g. 'https://launchpad.app'
    },
    {
      id:    'mindmap-ai',
      name:  'MindMap AI',
      icon:  '🧠',
      image: '',
      desc:  'MindMap AI transforms your personal notes into an interactive knowledge graph. It uses OpenAI embeddings to find conceptual connections between ideas and renders them as a force-directed graph you can explore. Great for studying, research, and connecting ideas across different topics.',
      tags:  ['Python', 'D3.js', 'OpenAI'],
      github: '',
      live:   '',
    },
    {
      id:    'datapulse',
      name:  'DataPulse',
      icon:  '📊',
      image: '',
      desc:  'DataPulse is a real-time analytics dashboard capable of ingesting 50,000+ events per second via Kafka. The visualizations are rendered with custom WebGL shaders for performance at scale. I designed the ingestion pipeline, the WebGL charting layer, and the Go backend.',
      tags:  ['Kafka', 'WebGL', 'Go'],
      github: '',
      live:   '',
    },
    {
      id:    'pixel-studio',
      name:  'Pixel Studio',
      icon:  '🎨',
      image: '',
      desc:  'Pixel Studio is a browser-based collaborative pixel art editor with real-time multiplayer powered by WebRTC. Multiple users can draw on the same canvas simultaneously using Operational Transformation to resolve conflicts. It was featured on Product Hunt.',
      tags:  ['WebRTC', 'Canvas', 'OT'],
      github: '',
      live:   '',
    },
    {
      id:    'vaultpass',
      name:  'VaultPass',
      icon:  '🔐',
      image: '',
      desc:  'VaultPass is an end-to-end encrypted password manager built on a zero-knowledge architecture — the server never sees your plaintext passwords. It supports TOTP two-factor authentication and comes with a browser extension for autofill. All encryption happens client-side using the Web Crypto API.',
      tags:  ['Crypto', 'Extension', 'Rust'],
      github: '',
      live:   '',
    },
    {
      id:    'ecotrack',
      name:  'EcoTrack',
      icon:  '🌍',
      image: '',
      desc:  'EcoTrack is a carbon footprint tracker that makes sustainability engaging through gamification — streaks, badges, and leaderboards. Users log daily activities and see their environmental impact visualized over time. It won 1st place at a climate-tech hackathon.',
      tags:  ['Vue', 'Firebase', 'Maps'],
      github: '',
      live:   '',
    },
  ];

  /* ── CERTIFICATION DATA ────────────────────────────────────
     Matches the 7 certs currently listed in the Certifications
     section of index.html. Add `image` (path to the cert image/PDF)
     and `credentialUrl` (verification link) as you get them.
  ──────────────────────────────────────────────────────────── */
  var CERTS = [
    {
      id:            'shepp-alibaba',
      name:          'She++ Masterclass on Alibaba Cloud System',
      issuer:        'PhilDev | Wells Fargo | Alibaba Cloud',
      date:          'April 2025',
      datetime:      '2025-04',
      icon:          '🔷',
      iconClass:     'csk',
      credentialId:  '',
      credentialUrl: '',
      image:         'credentials/She++ Certificate.jpg'
    },
    {
      id:            'qcu-ip-foundation',
      name:          'Foundation Course on Intellectual Property',
      issuer:        'Quezon City University — Research, Extension, Planning, and Linkages, Innovation and Technology Support Office',
      date:          'July 2025',
      datetime:      '2025-07',
      icon:          '🔷',
      iconClass:     'csk',
      credentialId:  '',
      credentialUrl: '',
      image:         'credentials/Foundational Course on Intellectual Property.jpg',
    },
    {
      id:            'cisco-cybersecurity',
      name:          'Introduction to Cybersecurity',
      issuer:        'Cisco Networking Academy',
      date:          'September 2025',
      datetime:      '2025-09',
      icon:          '🛡️',
      iconClass:     'co',
      credentialId:  'd32a8bd0-8dc8-4201-9a15-96e931b36439',
      credentialUrl: 'https://www.credly.com/badges/d32a8bd0-8dc8-4201-9a15-96e931b36439',
      image:         'credentials/Introduction_to_Cybersecurity_certificate_flores-clarencekyle-manrique-gmail-com_6ae19493-6628-4d11-9d60-72b739798512.jpg',
    },
    {
      id:            'cisco-iot',
      name:          'Introduction to IoT',
      issuer:        'Cisco Networking Academy',
      date:          'October 2025',
      datetime:      '2025-10',
      icon:          '🔷',
      iconClass:     'cb',
      credentialId:  'dd5942b3-3930-4bcf-8a24-3c6d719ec368',
      credentialUrl: 'https://www.credly.com/badges/dd5942b3-3930-4bcf-8a24-3c6d719ec368',
      image:         'credentials/Introduction_to_IoT_certificate_flores-clarencekyle-manrique-gmail-com_6742889e-a577-4a1a-b8c2-e9aa15369f71.jpg',
    },
    {
      id:            'cisco-ethical-hacking',
      name:          'Ethical Hacking',
      issuer:        'Cisco Networking Academy',
      date:          'November 2025',
      datetime:      '2025-11',
      icon:          '⚛️',
      iconClass:     'cte',
      credentialId:  '7ad15c9a-abb7-42c4-9109-1331f6b6280c',
      credentialUrl: 'https://www.credly.com/badges/7ad15c9a-abb7-42c4-9109-1331f6b6280c',
      image:         'credentials/Ethical_Hacker_certificate_flores-clarencekyle-manrique-gmail-com_4d0087ab-f1b2-40c4-b601-cd70985a51ba.jpg',
    },
    {
      id:            'cisco-modern-ai',
      name:          'Introduction to Modern AI',
      issuer:        'Cisco Networking Academy',
      date:          'December 2025',
      datetime:      '2025-12',
      icon:          '⚛️',
      iconClass:     'cg2',
      credentialId:  '499e9eb9-7365-4c67-858e-193214b161a6',
      credentialUrl: 'https://www.credly.com/badges/a1af774e-cc3e-4187-a0c1-5247e3052683',
      image:         'credentials/Introduction_to_Modern_AI_certificate_flores-clarencekyle-manrique-gmail-com_499e9eb9-7365-4c67-858e-193214b161a6.jpg',
    },
    {
      id:            'cisco-python-essentials-1',
      name:          'Python Essentials 1',
      issuer:        'Cisco Networking Academy',
      date:          'January 2026',
      datetime:      '2026-01',
      icon:          '🐍',
      iconClass:     'cr',
      credentialId:  'd96470a4-2895-452e-a367-85b88adbcfbd',
      credentialUrl: 'https://www.credly.com/badges/d96470a4-2895-452e-a367-85b88adbcfbd',
      image:         'credentials/Python_Essentials_1_certificate_flores-clarencekyle-manrique-gmail-com_a18cb793-c603-4acb-99b9-fa91d4d00de6.jpg',
    },
  ];

  /* ── BUILD MODAL DOM (once, reused for all modals) ──────── */
  var overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML =
    '<div id="modal-panel" tabindex="-1">' +
      '<button id="modal-close" aria-label="Close modal">✕</button>' +
      '<div id="modal-body"></div>' +
    '</div>';

  document.body.appendChild(overlay);

  var panel    = document.getElementById('modal-panel');
  var body     = document.getElementById('modal-body');
  var closeBtn = document.getElementById('modal-close');
  var lastFocused = null;

  /* ── Open / close ── */
  function openModal(label) {
    lastFocused = document.activeElement;
    overlay.setAttribute('aria-label', label);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { panel.focus(); });
  }

  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  /* Close triggers */
  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* Focus trap inside modal */
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = panel.querySelectorAll(
      'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ── Helpers ── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function tagHtml(tags, cls) {
    return tags.map(function (t) {
      return '<span class="' + cls + '">' + esc(t) + '</span>';
    }).join('');
  }

  /* ── PROJECT MODAL ── */
  function openProject(proj) {
    var imgHtml = proj.image
      ? '<img src="' + esc(proj.image) + '" alt="Screenshot of ' + esc(proj.name) + '" loading="lazy"/>'
      : '<div class="modal-img-placeholder" aria-hidden="true">' +
          '<span>' + proj.icon + '</span>' +
          '<span>Screenshot coming soon</span>' +
        '</div>';

    var ghHtml = proj.github
      ? '<a href="' + esc(proj.github) + '" target="_blank" rel="noopener noreferrer" class="modal-proj-link" aria-label="View ' + esc(proj.name) + ' on GitHub (opens in new tab)">GH ↗</a>'
      : '<span class="modal-proj-link" data-wip aria-disabled="true" title="Coming soon">GH ↗</span>';

    var liveHtml = proj.live
      ? '<a href="' + esc(proj.live) + '" target="_blank" rel="noopener noreferrer" class="modal-proj-link" aria-label="View live demo of ' + esc(proj.name) + ' (opens in new tab)">Live ↗</a>'
      : '<span class="modal-proj-link" data-wip aria-disabled="true" title="Coming soon">Live ↗</span>';

    body.innerHTML =
      '<div class="modal-proj-img">' + imgHtml + '</div>' +
      '<div class="modal-proj-content">' +
        '<div class="modal-proj-header">' +
          '<h2 class="modal-proj-title">' + esc(proj.name) + '</h2>' +
          '<div class="modal-proj-links">' + ghHtml + liveHtml + '</div>' +
        '</div>' +
        '<p class="modal-proj-desc">' + esc(proj.desc) + '</p>' +
        '<div class="modal-proj-tags">' + tagHtml(proj.tags, 'ptag') + '</div>' +
      '</div>';

    openModal(proj.name + ' project details');
  }

  /* ── CERT MODAL ── */
  function openCert(cert) {
    var imgHtml = cert.image
      ? '<img src="' + esc(cert.image) + '" alt="' + esc(cert.name) + ' certificate" loading="lazy"/>'
      : '<div class="modal-img-placeholder" aria-hidden="true">' +
          '<span>' + cert.icon + '</span>' +
          '<span>Certificate image coming soon</span>' +
        '</div>';

    var idRow = cert.credentialId
      ? '<div class="modal-cert-detail">' +
          '<div class="modal-cert-detail-label">Credential ID</div>' +
          '<div class="modal-cert-detail-value">' + esc(cert.credentialId) + '</div>' +
        '</div>'
      : '<div class="modal-cert-detail">' +
          '<div class="modal-cert-detail-label">Credential ID</div>' +
          '<div class="modal-cert-detail-value" style="color:var(--tx3)">Not Available</div>' +
        '</div>';

    var verifyBtn = cert.credentialUrl
      ? '<a href="' + esc(cert.credentialUrl) + '" target="_blank" rel="noopener noreferrer" class="modal-cert-btn primary" aria-label="Verify ' + esc(cert.name) + ' credential (opens in new tab)">✓ Verify Credential ↗</a>'
      : '<button class="modal-cert-btn primary" disabled aria-disabled="true" title="Verification link not available">✓ Verify Credential</button>';

    var pdfBtn = cert.image
      ? '<a href="' + esc(cert.image) + '" target="_blank" rel="noopener noreferrer" class="modal-cert-btn" aria-label="View certificate PDF (opens in new tab)">View Certificate ↗</a>'
      : '';

    body.innerHTML =
      '<div class="modal-cert-img">' + imgHtml + '</div>' +
      '<div class="modal-cert-content">' +
        '<div class="modal-cert-header">' +
          '<div class="modal-cert-ico ' + esc(cert.iconClass) + '" aria-hidden="true">' + cert.icon + '</div>' +
          '<div class="modal-cert-meta">' +
            '<h2 class="modal-cert-title">' + esc(cert.name) + '</h2>' +
            '<p class="modal-cert-issuer">' + esc(cert.issuer) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="modal-cert-details">' +
          '<div class="modal-cert-detail">' +
            '<div class="modal-cert-detail-label">Issued</div>' +
            '<div class="modal-cert-detail-value"><time datetime="' + esc(cert.datetime) + '">' + esc(cert.date) + '</time></div>' +
          '</div>' +
          idRow +
        '</div>' +
        '<div class="modal-cert-actions">' + verifyBtn + pdfBtn + '</div>' +
      '</div>';

    openModal(cert.name + ' certification details');
  }

  /* ── Wire up project cards ── */
  document.querySelectorAll('.proj[data-id]').forEach(function (card) {
    var proj = PROJECTS.find(function (p) { return p.id === card.dataset.id; });
    if (!proj) return;
    card.style.cursor = 'pointer';
    card.addEventListener('click', function (e) {
      if (e.target.closest('.proj-link')) return; // let link clicks through
      openProject(proj);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(proj); }
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'View ' + proj.name + ' project details');
  });

  /* ── Wire up certification cards ── */
  document.querySelectorAll('.cert[data-id]').forEach(function (card) {
    var cert = CERTS.find(function (c) { return c.id === card.dataset.id; });
    if (!cert) return;
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () { openCert(cert); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCert(cert); }
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'View ' + cert.name + ' certification details');
  });

}());
