/* ═══════════════════════════════════════════════
   BOSSA NOVA STEAM CLEANING — script.js
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  /* ── 1. NAVBAR: hamburger ── */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    });
  });


  /* ── 2. REVEAL ON SCROLL ── */
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(
        entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')
      );
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.min(idx * 50, 180)}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });

  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });


  /* ── 3. UNIFIED SCROLL HANDLER (rAF-throttled) ──
     Centraliza navbar scrolled, sticky CTA, parallax e active nav
     em UM único listener com requestAnimationFrame.
     Antes eram 4 listeners separados disputando frames — causava
     bug de pintura no mobile (título do hero sumindo). */
  const stickyCta  = document.getElementById('stickyCta');
  const heroEl     = document.getElementById('hero');
  const heroGlow1  = document.querySelector('.glow-1');
  const heroGlow2  = document.querySelector('.glow-2');
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  let ticking = false;

  function onScroll() {
    const y = window.scrollY;

    // Navbar
    navbar.classList.toggle('scrolled', y > 40);

    // Sticky CTA
    const heroHeight = heroEl ? heroEl.offsetHeight : 400;
    stickyCta.classList.toggle('visible', y > heroHeight * 0.6);

    // Hero parallax — DESKTOP ONLY (mobile causa bug de paint nos glows com blur 120px)
    if (!isMobile && y < window.innerHeight) {
      if (heroGlow1) heroGlow1.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;
      if (heroGlow2) heroGlow2.style.transform = `translate3d(0, ${y * -0.15}px, 0)`;
    }

    // Active nav link
    let current = '';
    sections.forEach(section => {
      if (y >= section.offsetTop - 120) current = section.getAttribute('id');
    });
    navAnchors.forEach(a => {
      if (a.classList.contains('nav-cta')) return;
      a.classList.toggle('is-active', a.getAttribute('href') === `#${current}`);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });


  /* ── 4. BEFORE & AFTER SLIDERS (todos os cards do carrossel) ── */
  function initBaSlider(slider) {
    const handle = slider.querySelector('.ba-handle');
    const before = slider.querySelector('.ba-before');
    if (!handle || !before) return;

    let isDragging = false;

    function setPosition(clientX) {
      const rect = slider.getBoundingClientRect();
      const pct  = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
      const val  = pct * 100 + '%';
      before.style.width = val;
      handle.style.left  = val;
    }

    handle.addEventListener('mousedown', e => { isDragging = true; e.preventDefault(); });
    window.addEventListener('mousemove', e => { if (isDragging) setPosition(e.clientX); });
    window.addEventListener('mouseup',   () => { isDragging = false; });

    handle.addEventListener('touchstart', e => { isDragging = true; e.preventDefault(); }, { passive: false });
    window.addEventListener('touchmove',  e => { if (isDragging) setPosition(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend',   () => { isDragging = false; });

    slider.addEventListener('click', e => { if (!isDragging) setPosition(e.clientX); });
  }

  document.querySelectorAll('.ba-carousel .ba-slider').forEach(initBaSlider);

  /* ── 4b. RESULTS CAROUSEL ── */
  (function initBaCarousel() {
    const carousel = document.getElementById('baCarousel');
    if (!carousel) return;
    const track = document.getElementById('baTrack');
    const cards = Array.from(track.querySelectorAll('.ba-card'));
    const prev  = document.getElementById('baPrev');
    const next  = document.getElementById('baNext');
    const dotsEl = document.getElementById('baDots');
    let index = 0;

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'ba-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to transformation ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });

    function goTo(i) {
      index = (i + cards.length) % cards.length;
      track.scrollTo({ left: cards[index].offsetLeft, behavior: 'smooth' });
      dotsEl.querySelectorAll('.ba-dot').forEach((d, di) => d.classList.toggle('active', di === index));
    }

    prev.addEventListener('click', () => goTo(index - 1));
    next.addEventListener('click', () => goTo(index + 1));

    // Keyboard nav when carousel is in viewport / focused
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });

    // Resync on resize so the active card stays aligned
    window.addEventListener('resize', () => {
      track.scrollTo({ left: cards[index].offsetLeft, behavior: 'auto' });
    }, { passive: true });
  })();


  /* ── 5. FORM VALIDATION ── */
  const form         = document.getElementById('contactForm');
  const nameInput    = document.getElementById('name');
  const phoneInput   = document.getElementById('phone');
  const serviceInput = document.getElementById('service');
  const nameError    = document.getElementById('nameError');
  const phoneError   = document.getElementById('phoneError');
  const serviceError = document.getElementById('serviceError');

  function validateName() {
    const ok = nameInput.value.trim().length >= 2;
    nameInput.classList.toggle('error', !ok);
    nameError.classList.toggle('visible', !ok);
    return ok;
  }
  function validatePhone() {
    const ok = phoneInput.value.replace(/\D/g, '').length >= 7;
    phoneInput.classList.toggle('error', !ok);
    phoneError.classList.toggle('visible', !ok);
    return ok;
  }
  function validateService() {
    const ok = serviceInput.value !== '';
    serviceInput.classList.toggle('error', !ok);
    serviceError.classList.toggle('visible', !ok);
    return ok;
  }

  nameInput.addEventListener('blur', validateName);
  phoneInput.addEventListener('blur', validatePhone);
  serviceInput.addEventListener('change', validateService);

  // Auto-format phone as (XXX) XXX-XXXX
  phoneInput.addEventListener('input', () => {
    const digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    let fmt = digits;
    if (digits.length > 6)      fmt = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    else if (digits.length > 3) fmt = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    else if (digits.length > 0) fmt = `(${digits}`;
    phoneInput.value = fmt;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    // Roda TODAS as validações (sem short-circuit) e depois combina
    const okName    = validateName();
    const okPhone   = validatePhone();
    const okService = validateService();
    if (okName && okPhone && okService) {
      showModal(document.getElementById('modalOverlay'));
      form.reset();
    } else {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });


  /* ── 6. MODAL HELPERS ── */
  function showModal(overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) setTimeout(() => focusable.focus(), 50);
  }

  function closeModal(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  const successOverlay = document.getElementById('modalOverlay');
  const modalClose     = document.getElementById('modalClose');

  modalClose.addEventListener('click', () => closeModal(successOverlay));
  successOverlay.addEventListener('click', e => {
    if (e.target === successOverlay) closeModal(successOverlay);
  });


  /* ── 7. SMOOTH SCROLL para anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ── 8. COUNTER ANIMATION ── */
  function animateCounter(el, target, decimals, duration) {
    const start   = performance.now();
    const isFloat = decimals > 0;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4); // ease-out quart
      const current  = eased * target;
      el.textContent = isFloat ? current.toFixed(decimals) : Math.floor(current).toString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = isFloat ? target.toFixed(decimals) : target.toString();
    }
    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals, 10) || 0;
      if (!isNaN(target)) {
        el.textContent = decimals > 0 ? (0).toFixed(decimals) : '0';
        animateCounter(el, target, decimals, 1800);
      }
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-value').forEach(el => statObserver.observe(el));


  /* ── 9. SERVICE DETAIL MODALS ── */
  let lastFocusedTrigger = null;

  function openServiceModal(serviceKey, triggerEl) {
    const overlay = document.getElementById(`svc-${serviceKey}`);
    if (!overlay) return;
    lastFocusedTrigger = triggerEl || null;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = overlay.querySelector('.svc-close');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeServiceModal(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  }

  document.querySelectorAll('.service-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => openServiceModal(btn.dataset.service, btn));
  });

  /* Marquee items: clicar abre o modal do serviço diretamente.
     Antes de abrir, leva o scroll até a seção #services para que,
     ao fechar o modal (X), o usuário permaneça na seção de serviços. */
  document.querySelectorAll('.marquee-item[data-svc]').forEach(item => {
    item.addEventListener('click', e => {
      const key = item.dataset.svc;
      if (!key) return;
      e.preventDefault();
      const services = document.getElementById('services');
      if (services) {
        const top = services.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      // Usa a própria seção de serviços como "trigger" — ao fechar, o foco
      // volta para lá em vez de voltar para o item da marquee (que está acima).
      openServiceModal(key, services || item);
    });
  });

  document.querySelectorAll('.svc-close').forEach(btn => {
    btn.addEventListener('click', () => closeServiceModal(btn.closest('.svc-overlay')));
  });

  document.querySelectorAll('.svc-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeServiceModal(overlay);
    });
  });

  document.querySelectorAll('.svc-cta-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const overlay = btn.closest('.svc-overlay');
      closeServiceModal(overlay);
      setTimeout(() => {
        const contact = document.getElementById('contact');
        if (contact) {
          const top = contact.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 350);
    });
  });

  // ESC fecha modais
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (successOverlay.classList.contains('open')) {
      closeModal(successOverlay);
      return;
    }
    document.querySelectorAll('.svc-overlay.open').forEach(o => closeServiceModal(o));
  });



  /* ── 11. THEME TOGGLE ──
     Para evitar o "piscar" durante a troca: desligamos TODAS as transições
     por um frame, trocamos o tema instantaneamente, e religamos depois.
     Assim cores de body, cards, textos e bordas mudam ao mesmo tempo. */
  (function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const root = document.documentElement;

    function apply(theme, instant) {
      if (instant) {
        root.classList.add('theme-switching');
        // força reflow para garantir que o navegador "veja" o no-transition
        // antes de mudar as variáveis CSS
        void root.offsetHeight;
      }
      root.setAttribute('data-theme', theme);
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      try { localStorage.setItem('bn-theme', theme); } catch (e) {}
      if (instant) {
        // Remove no próximo frame, depois que as novas cores foram pintadas
        requestAnimationFrame(() => {
          requestAnimationFrame(() => root.classList.remove('theme-switching'));
        });
      }
    }

    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      apply(current === 'dark' ? 'light' : 'dark', true);
    });

    // Set inicial — sem flicker, sem transição
    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  })();

  /* ── 12. MARQUEE SWIPE (toque interativo, só para esquerda) ──
   Usa o truque de animation-delay negativo para sincronizar a
   posição da animação com a posição do dedo sem conflito de
   transform vs animação. */
(function initMarqueeSwipe() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  let dragging  = false;
  let startX    = 0;
  let startProg = 0; // progresso no momento do toque (0 a 1)

  /* Retorna a duração animada atual em segundos */
  function getDuration() {
    return window.innerWidth <= 768 ? 28 : 38;
  }

  /* Lê a posição visual atual da animação como fração (0–1) */
  function getCurrentProgress() {
    const matrix = new DOMMatrix(window.getComputedStyle(track).transform);
    const px     = matrix.m41; // translateX em px (valor negativo)
    const total  = track.scrollWidth / 2; // distância de um loop completo
    return Math.abs(px) / total;
  }

  /* Aplica um progresso (0–1) via animation-delay negativo */
  function setProgress(p) {
    p = ((p % 1) + 1) % 1; // mantém no intervalo [0, 1)
    track.style.animationDelay = `${-(p * getDuration())}s`;
  }

  track.addEventListener('touchstart', (e) => {
    dragging   = true;
    startX     = e.touches[0].clientX;
    startProg  = getCurrentProgress();
    track.style.animationPlayState = 'paused';
    setProgress(startProg); // congela exatamente no frame atual
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX;
    if (dx > 0) return; // bloqueia movimento para direita

    const total    = track.scrollWidth / 2;
    const deltaPct = Math.abs(dx) / total;
    setProgress(startProg + deltaPct);
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    track.style.animationPlayState = 'running'; // retoma do ponto atual
  });
})();

  /* ── 10. INIT Lucide ── */
  if (window.lucide) {
    lucide.createIcons();
  } else {
    window.addEventListener('load', () => {
      if (window.lucide) lucide.createIcons();
    });
  }
});
