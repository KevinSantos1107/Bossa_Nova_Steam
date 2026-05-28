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


  /* -- 3. UNIFIED SCROLL HANDLER (rAF-throttled) --
     Centralizes navbar scrolled state, sticky CTA, parallax, and active nav
     in one requestAnimationFrame listener.
     Multiple separate listeners were competing for frames and causing
     mobile paint issues where the hero title disappeared. */
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

    // Hero parallax: desktop only. Mobile causes paint issues with 120px blurred glows.
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


  /* -- 4. RESULTS CAROUSEL -- */
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
    // Run all validations, without short-circuiting, then combine the result.
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
  let scrollLockY = 0;
  let scrollLockCount = 0;
  let scrollLockPaddingRight = '';

  function lockBodyScroll() {
    if (scrollLockCount === 0) {
      scrollLockY = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      scrollLockPaddingRight = document.body.style.paddingRight;
      document.documentElement.classList.add('scroll-locked');
      document.body.classList.add('scroll-locked');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollLockY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    scrollLockCount += 1;
  }

  function unlockBodyScroll() {
    if (scrollLockCount === 0) return;
    scrollLockCount -= 1;
    if (scrollLockCount > 0) return;

    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = scrollLockPaddingRight;
    window.scrollTo(0, scrollLockY);
  }

  function showModal(overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    lockBodyScroll();
    const focusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) setTimeout(() => focusable.focus(), 50);
  }

  function closeModal(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    unlockBodyScroll();
  }

  const successOverlay = document.getElementById('modalOverlay');
  const modalClose     = document.getElementById('modalClose');

  modalClose.addEventListener('click', () => closeModal(successOverlay));
  successOverlay.addEventListener('click', e => {
    if (e.target === successOverlay) closeModal(successOverlay);
  });


  /* -- 7. SMOOTH SCROLL for anchor links -- */
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
    lockBodyScroll();
    const closeBtn = overlay.querySelector('.svc-close');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  function closeServiceModal(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    unlockBodyScroll();
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  }

  document.querySelectorAll('.service-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => openServiceModal(btn.dataset.service, btn));
  });

  /* Marquee items: clicking opens the service modal directly.
     Before opening, scroll to #services so that after closing the modal,
     the user remains in the services section. */
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
      // Use the services section itself as the trigger so focus returns there
      // instead of jumping back to the marquee item above.
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

  // ESC closes modals.
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (successOverlay.classList.contains('open')) {
      closeModal(successOverlay);
      return;
    }
    document.querySelectorAll('.svc-overlay.open').forEach(o => closeServiceModal(o));
  });



  /* -- 11. THEME TOGGLE --
     To avoid flicker during theme switching, disable all transitions
     for one frame, switch the theme instantly, then re-enable them.
     This keeps body, card, text, and border colors changing together. */
  (function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const root = document.documentElement;

    function apply(theme, instant) {
      if (instant) {
        root.classList.add('theme-switching');
        // Force reflow so the browser applies no-transition
        // before changing CSS variables.
        void root.offsetHeight;
      }
      root.setAttribute('data-theme', theme);
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      try { localStorage.setItem('bn-theme', theme); } catch (e) {}
      if (instant) {
        // Remove on the next frame after the new colors have painted.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => root.classList.remove('theme-switching'));
        });
      }
    }

    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      apply(current === 'dark' ? 'light' : 'dark', true);
    });

    // Initial setup: no flicker, no transition.
    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  })();

  /* -- 12. MARQUEE SWIPE (interactive touch, left only) --
   Uses negative animation-delay to sync the animation position
   with the finger position without transform-vs-animation conflicts. */
(function initMarqueeSwipe() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  let dragging  = false;
  let startX    = 0;
  let startProg = 0; // progress at touch start (0 to 1)

  /* Return the current animated duration in seconds. */
  function getDuration() {
    return window.innerWidth <= 768 ? 28 : 38;
  }

  /* Read the current visual animation position as a fraction (0-1). */
  function getCurrentProgress() {
    const matrix = new DOMMatrix(window.getComputedStyle(track).transform);
    const px     = matrix.m41; // translateX in px, negative value
    const total  = track.scrollWidth / 2; // distance of one complete loop
    return Math.abs(px) / total;
  }

  /* Apply progress (0-1) through negative animation-delay. */
  function setProgress(p) {
    p = ((p % 1) + 1) % 1; // keep within [0, 1)
    track.style.animationDelay = `${-(p * getDuration())}s`;
  }

  track.addEventListener('touchstart', (e) => {
    dragging   = true;
    startX     = e.touches[0].clientX;
    startProg  = getCurrentProgress();
    track.style.animationPlayState = 'paused';
    setProgress(startProg); // freeze exactly on the current frame
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX;
    if (dx > 0) return; // block rightward movement

    const total    = track.scrollWidth / 2;
    const deltaPct = Math.abs(dx) / total;
    setProgress(startProg + deltaPct);
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    track.style.animationPlayState = 'running'; // resume from the current point
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
  function setSliderDragLock(active) {
    document.documentElement.classList.toggle('slider-dragging', active);
    document.body.classList.toggle('slider-dragging', active);
  }

  function setupSlider(slider) {
    if (slider.dataset.sliderReady) return;
    slider.dataset.sliderReady = '1';

    const mask   = slider.querySelector('.svc-slider-before-mask');
    const handle = slider.querySelector('.svc-slider-handle');
    if (!mask || !handle) return;

    let dragging = false;
    let dragRect = null;

    function applyPos(x) {
      const rect = dragRect || slider.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
      const val = pct + '%';
      mask.style.width = val;
      handle.style.left = val;
    }

    function startDrag(x) {
      dragging = true;
      dragRect = slider.getBoundingClientRect();
      slider.classList.add('is-dragging');
      setSliderDragLock(true);
      applyPos(x);
    }

    function moveDrag(x) {
      if (!dragging) return;
      applyPos(x);
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      dragRect = null;
      slider.classList.remove('is-dragging');
      setSliderDragLock(false);
    }

    // Mouse
    slider.addEventListener('mousedown', e => {
      startDrag(e.clientX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      moveDrag(e.clientX);
    });
    window.addEventListener('mouseup', endDrag);

    // Touch
    slider.addEventListener('touchstart', e => {
      if (!e.touches.length) return;
      e.preventDefault();
      startDrag(e.touches[0].clientX);
    }, { passive: false });
    window.addEventListener('touchmove', e => {
      if (!dragging) return;
      e.preventDefault();
      if (e.touches.length) moveDrag(e.touches[0].clientX);
    }, { passive: false });
    window.addEventListener('touchend', endDrag);
    window.addEventListener('touchcancel', endDrag);

    // Hint animation on first interaction
    slider.classList.add('do-hint');
    slider.addEventListener('mousedown',  () => slider.classList.remove('do-hint'), { once: true });
    slider.addEventListener('touchstart', () => slider.classList.remove('do-hint'), { once: true, passive: true });
  }

  // Watch for modals opening and init their sliders
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.attributeName === 'aria-hidden') {
        const overlay = m.target;
        if (overlay.getAttribute('aria-hidden') === 'false') {
          // Modal just opened — init all sliders inside it
          overlay.querySelectorAll('[data-slider]').forEach(sl => {
            // Reset position
            const mask   = sl.querySelector('.svc-slider-before-mask');
            const handle = sl.querySelector('.svc-slider-handle');
            if (mask)   mask.style.width  = '50%';
            if (handle) handle.style.left = '50%';
            sl.classList.add('do-hint');
            setupSlider(sl);
          });
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
