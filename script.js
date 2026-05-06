/* ═══════════════════════════════════════════════
   BOSSA NOVA STEAM CLEANING — script.js
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. NAVBAR: scroll effect + hamburger ── */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    });
  });


  /* ── 2. REVEAL ON SCROLL (IntersectionObserver) ── */
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(
          entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')
        );
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => {
    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyInView) {
      // Elemento já visível no carregamento (acima do fold) — revela imediatamente
      // sem passar pelo IntersectionObserver, evitando bug de desaparecimento
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });


  /* ── 3. STICKY CTA ── */
  const stickyCta  = document.getElementById('stickyCta');
  const heroEl     = document.getElementById('hero');

  window.addEventListener('scroll', () => {
    const heroHeight = heroEl ? heroEl.offsetHeight : 400;
    stickyCta.classList.toggle('visible', window.scrollY > heroHeight * 0.6);
  }, { passive: true });


  /* ── 4. BEFORE & AFTER SLIDER ── */
  function initSlider(sliderId, handleId) {
    const slider = document.getElementById(sliderId);
    const handle = document.getElementById(handleId);
    const before = slider ? slider.querySelector('.ba-before') : null;
    if (!slider || !handle || !before) return;

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

  initSlider('slider1', 'handle1');
  initSlider('slider2', 'handle2');


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
    const digits = phoneInput.value.replace(/\D/g, '');
    const ok     = digits.length >= 7;
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
    const ok = validateName() & validatePhone() & validateService();
    // Bitwise & garante que TODAS as funções de validação rodam (sem short-circuit)
    if (ok) {
      showModal(document.getElementById('modalOverlay'));
      form.reset();
    } else {
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });


  /* ── 6. MODAL GENÉRICO (foco gerenciado) ── */
  function showModal(overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Foca o primeiro elemento focável dentro do modal
    const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) setTimeout(() => focusable.focus(), 50);
  }

  function closeModal(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Modal de sucesso do formulário
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
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── 8. HERO PARALLAX (sutil) ── */
  const heroGlow1 = document.querySelector('.glow-1');
  const heroGlow2 = document.querySelector('.glow-2');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      if (heroGlow1) heroGlow1.style.transform = `translateY(${scrollY * 0.2}px)`;
      if (heroGlow2) heroGlow2.style.transform = `translateY(${scrollY * -0.15}px)`;
    }
  }, { passive: true });


  /* ── 9. COUNTER ANIMATION ──
     Usa data-target e data-decimals no .stat-value.
     O sufixo fica num elemento separado (.stat-suffix) e nunca é tocado pelo JS,
     eliminando o bug de piscar ao final da animação.
  ── */
  function animateCounter(el, target, decimals, duration) {
    const start    = performance.now();
    const isFloat  = decimals > 0;

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quart
      const eased    = 1 - Math.pow(1 - progress, 4);
      const current  = eased * target;

      el.textContent = isFloat ? current.toFixed(decimals) : Math.floor(current).toString();

      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = isFloat ? target.toFixed(decimals) : target.toString();
    }

    requestAnimationFrame(tick);
  }

  const statValues = document.querySelectorAll('.stat-value');

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el       = entry.target;
      const target   = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals, 10) || 0;

      if (!isNaN(target)) {
        // Zera o display antes de animar
        el.textContent = decimals > 0 ? (0).toFixed(decimals) : '0';
        animateCounter(el, target, decimals, 1800);
      }

      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statValues.forEach(el => statObserver.observe(el));


  /* ── 10. ACTIVE NAV LINK on scroll ── */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) current = section.getAttribute('id');
    });
    navAnchors.forEach(a => {
      if (a.classList.contains('nav-cta')) return; // CTA mantém sua própria cor sempre
      a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--green-light)' : '';
    });
  }, { passive: true });


  /* ── 11. SERVICE DETAIL MODALS (foco gerenciado) ── */

  // Guarda o elemento que abriu o modal para restaurar foco ao fechar
  let lastFocusedTrigger = null;

  function openServiceModal(serviceKey, triggerEl) {
    const overlay = document.getElementById(`svc-${serviceKey}`);
    if (!overlay) return;
    lastFocusedTrigger = triggerEl || null;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Foca o botão de fechar
    const closeBtn = overlay.querySelector('.svc-close');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeServiceModal(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Restaura foco ao botão que abriu o modal
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  }

  // Botões "See Details →"
  document.querySelectorAll('.service-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => openServiceModal(btn.dataset.service, btn));
  });

  // Botões de fechar dentro dos modais
  document.querySelectorAll('.svc-close').forEach(btn => {
    btn.addEventListener('click', () => closeServiceModal(btn.closest('.svc-overlay')));
  });

  // Fechar ao clicar no backdrop
  document.querySelectorAll('.svc-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeServiceModal(overlay);
    });
  });

  // CTAs dentro dos modais: fecha e rola até #contact
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

  // ESC fecha qualquer modal aberto
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;

    // Fecha success modal se aberto
    if (successOverlay.classList.contains('open')) {
      closeModal(successOverlay);
      return;
    }

    // Fecha service modals
    document.querySelectorAll('.svc-overlay.open').forEach(o => closeServiceModal(o));
  });


  /* ── INIT: inicializa ícones Lucide ── */
  if (window.lucide) {
    lucide.createIcons();
  } else {
    // Fallback: tenta novamente após o script carregar (raramente necessário com versão fixada)
    window.addEventListener('load', () => {
      if (window.lucide) lucide.createIcons();
    });
  }

  console.log('Bossa Nova Steam Cleaning — JS loaded ✓');

});
