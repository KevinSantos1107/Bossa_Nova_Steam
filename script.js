/* ═══════════════════════════════════════════════
   BOSSA NOVA STEAM CLEANING — script.js
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── SCROLL LOCK UTILITY ──
     Uses position:fixed trick so iOS Safari also blocks background scroll.
     Multiple callers can nest: uses a reference counter so the first open
     locks and the last close unlocks. */
  let _scrollLockCount = 0;
  let _savedScrollY    = 0;

  function lockScroll() {
    if (_scrollLockCount === 0) {
      _savedScrollY = window.scrollY;
      document.body.style.position   = 'fixed';
      document.body.style.top        = `-${_savedScrollY}px`;
      document.body.style.left       = '0';
      document.body.style.right      = '0';
      document.body.style.overflow   = 'hidden';
    }
    _scrollLockCount++;
  }

  function unlockScroll() {
    if (_scrollLockCount <= 0) return;
    _scrollLockCount--;
    if (_scrollLockCount === 0) {
      document.body.style.position = '';
      document.body.style.top      = '';
      document.body.style.left     = '';
      document.body.style.right    = '';
      document.body.style.overflow = '';
      window.scrollTo({ top: _savedScrollY, behavior: 'instant' });
    }
  }

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
    if (isOpen) lockScroll(); else unlockScroll();
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      unlockScroll();
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
    if (!(okName && okPhone && okService)) {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // ── EMAILJS: enviar os dados do formulário ──
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const serviceMap = {
      carpet: 'Carpet Cleaning',
      upholstery: 'Upholstery Cleaning',
      stain: 'Stain & Odor Removal',
      steam: 'Steam Cleaning',
      residential: 'Residential Deep Clean',
      other: 'Other / Not Sure'
    };

    const templateParams = {
      from_name:    nameInput.value.trim(),
      phone:        phoneInput.value.trim(),
      service:      serviceMap[serviceInput.value] || serviceInput.value,
      message:      document.getElementById('message').value.trim() || '(no additional info)',
      reply_to:     'info@bossanovahomeservices.com',
    };

    // ─────────────────────────────────────────────────────────────────
    // SUBSTITUA OS VALORES ABAIXO PELAS SUAS CREDENCIAIS DO EMAILJS:
    //   SERVICE_ID  → Dashboard → Email Services → seu serviço
    //   TEMPLATE_ID → Email Templates → seu template
    //   PUBLIC_KEY  → Account → API Keys → Public Key
    // ─────────────────────────────────────────────────────────────────
    const EMAILJS_SERVICE_ID  = 'service_fsqdk9v';
    const EMAILJS_TEMPLATE_ID = 'template_up60b6k';
    const EMAILJS_PUBLIC_KEY  = 'egrTyJ98qhSWd19H2';

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
      .then(() => {
        showModal(document.getElementById('modalOverlay'));
        form.reset();
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        alert('Sorry, something went wrong. Please call us directly at (512) 744-8377.');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });


  /* ── 6. MODAL HELPERS ── */
  function showModal(overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
    const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) setTimeout(() => focusable.focus(), 50);
  }

  function closeModal(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    unlockScroll();
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


  /* ── 8c. REVIEW RELATIVE DATES ──
     Cada <span data-review-date="YYYY-MM-DD"> tem a data real do review.
     Este bloco calcula automaticamente "X dias/semanas/meses/anos atrás"
     toda vez que a página carrega, mantendo o texto sempre atualizado.
     Para atualizar um review: basta trocar o valor do atributo data-review-date.
     ─────────────────────────────────────────────────────── */
  (function updateReviewDates() {
    function timeAgo(dateStr) {
      const reviewDate = new Date(dateStr + 'T00:00:00');
      const now        = new Date();
      const diffMs     = now - reviewDate;
      const diffDays   = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 1)  return 'today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7)  return `${diffDays} days ago`;
      if (diffDays < 14) return '1 week ago';
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 60) return '1 month ago';
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      if (diffDays < 730) return '1 year ago';
      return `${Math.floor(diffDays / 365)} years ago`;
    }

    document.querySelectorAll('[data-review-date]').forEach(el => {
      const date     = el.getAttribute('data-review-date');
      const location = el.textContent.split('·')[1]?.trim() || 'Austin, TX';
      el.textContent = `${timeAgo(date)} · ${location}`;
    });
  })();


  /* ── 9. SERVICE DETAIL MODALS ── */
  let lastFocusedTrigger = null;

  function openServiceModal(serviceKey, triggerEl) {
    const overlay = document.getElementById(`svc-${serviceKey}`);
    if (!overlay) return;
    lastFocusedTrigger = triggerEl || null;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
    const closeBtn = overlay.querySelector('.svc-close');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeServiceModal(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    unlockScroll();

    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }

    // Reset sliders AFTER the overlay fade-out finishes (350ms transition)
    // so the user never sees the handle snapping back to center.
    setTimeout(() => {
      overlay.querySelectorAll('[data-slider]').forEach(sl => {
        const mask   = sl.querySelector('.svc-slider-before-mask');
        const handle = sl.querySelector('.svc-slider-handle');
        if (mask)   { mask.style.width  = '50%'; mask.style.animation = ''; }
        if (handle) { handle.style.left = '50%'; handle.style.animation = ''; }
        sl.style.setProperty('--slider-pct', '0.5');
        sl.dataset.sliderReady = '';
        sl.classList.remove('do-hint');
      });
    }, 400); // 350ms transition + 50ms margin
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
/* ══════════════════════════════════════════
   SERVICE MODAL — BEFORE/AFTER SLIDER
   Initialised when a modal opens, reset on close
══════════════════════════════════════════ */
(function initSvcSliders() {
  function setupSlider(slider) {
    if (slider.dataset.sliderReady) return;
    slider.dataset.sliderReady = '1';

    const mask   = slider.querySelector('.svc-slider-before-mask');
    const handle = slider.querySelector('.svc-slider-handle');
    let pct = 50;
    let dragging = false;

    function setPos(x) {
      const rect = slider.getBoundingClientRect();
      pct = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
      mask.style.width   = pct + '%';
      handle.style.left  = pct + '%';
      // Keep CSS var in sync so the before-image is always sized to the
      // full slider width, not just the clipped mask portion.
      slider.style.setProperty('--slider-pct', (pct / 100).toFixed(4));
    }

    // Seed the CSS custom property so the before-image calc() never
    // relies on the fallback value during the first interaction frame.
    slider.style.setProperty('--slider-pct', '0.5');

    // Mouse
    slider.addEventListener('mousedown', e => {
      // Cancel hint animation BEFORE setPos so CSS doesn't fight JS on
      // the first frame — this is what caused the "jump" on first click.
      // Explicitly cancel CSS animations too (animation-fill-mode:forwards
      // would otherwise freeze the last keyframe until next repaint).
      slider.classList.remove('do-hint');
      mask.style.animation   = 'none';
      handle.style.animation = 'none';
      dragging = true;
      slider.classList.add('is-dragging');
      setPos(e.clientX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      setPos(e.clientX);
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      slider.classList.remove('is-dragging');
    });

    // Touch
    slider.addEventListener('touchstart', e => {
      // Same fix for touch: cancel hint animation before computing position.
      slider.classList.remove('do-hint');
      mask.style.animation   = 'none';
      handle.style.animation = 'none';
      dragging = true;
      slider.classList.add('is-dragging');
      setPos(e.touches[0].clientX);
    }, { passive: true });
    slider.addEventListener('touchmove', e => {
      if (!dragging) return;
      setPos(e.touches[0].clientX);
    }, { passive: true });
    slider.addEventListener('touchend', () => {
      dragging = false;
      slider.classList.remove('is-dragging');
    });

    // Hint animation only on the very first time this slider is opened.
    // data-slider-hinted persists across open/close cycles so the hint
    // never plays again after the user has interacted once.
    if (!slider.dataset.sliderHinted) {
      slider.dataset.sliderHinted = '1';
      slider.classList.add('do-hint');
    }
  }

  // Watch for modals opening and (re-)init their sliders.
  // Reset already happened in closeServiceModal, so here we just call setupSlider.
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.attributeName === 'aria-hidden') {
        const overlay = m.target;
        if (overlay.getAttribute('aria-hidden') === 'false') {
          overlay.querySelectorAll('[data-slider]').forEach(sl => setupSlider(sl));
        }
      }
    });
  });

  document.querySelectorAll('.svc-overlay').forEach(overlay => {
    observer.observe(overlay, { attributes: true, attributeFilter: ['aria-hidden'] });
  });

  // Also init any already-open sliders on load
  document.querySelectorAll('[data-slider]').forEach(setupSlider);
})();
