/* ══════════════════════════════════════════════
   LUMIÈRE STUDIO — MAIN JS
══════════════════════════════════════════════ */

'use strict';

/* ── AOS Init ──────────────────────────────── */
AOS.init({
  duration: 800,
  easing: 'ease-out-quart',
  once: true,
  offset: 60,
});

/* ══════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;

  // Direct position for dot, lagged for ring
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.transform = `translate(${ringX - 19}px, ${ringY - 19}px)`;
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state on interactive elements
  const interactives = 'a, button, input, textarea, select, .filter-btn, .portfolio-card, .dot';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // Cursor trail on hero only
  const hero = document.getElementById('hero');
  if (hero) {
    const TRAIL_SIZE = 12;
    const trail = [];

    for (let i = 0; i < TRAIL_SIZE; i++) {
      const t = document.createElement('div');
      t.classList.add('cursor-trail');
      t.style.opacity = '0';
      document.body.appendChild(t);
      trail.push({ el: t, x: 0, y: 0 });
    }

    hero.addEventListener('mousemove', (e) => {
      trail.forEach((t, i) => {
        setTimeout(() => {
          t.x = e.clientX;
          t.y = e.clientY;
          t.el.style.transform = `translate(${t.x - 2.5}px, ${t.y - 2.5}px)`;
          t.el.style.opacity = String(1 - i / TRAIL_SIZE);
        }, i * 28);
      });
    });

    hero.addEventListener('mouseleave', () => {
      trail.forEach(t => { t.el.style.opacity = '0'; });
    });
  }
})();

/* ══════════════════════════════════════════════
   NAVBAR — scroll glass effect
══════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }
})();

/* ══════════════════════════════════════════════
   SMOOTH SCROLL for nav links
══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ══════════════════════════════════════════════
   NUMBER COUNTERS
══════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const DURATION = 1800; // ms

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const start   = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ══════════════════════════════════════════════
   PORTFOLIO FILTER
══════════════════════════════════════════════ */
(function initPortfolioFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.portfolio-card');

  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Active state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach((card, i) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('hidden');
          // Stagger reveal
          card.style.animation = 'none';
          card.style.opacity   = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = `opacity 0.4s ease ${i * 40}ms, transform 0.4s ease ${i * 40}ms`;
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ══════════════════════════════════════════════
   TESTIMONIAL CAROUSEL
══════════════════════════════════════════════ */
(function initCarousel() {
  const cards   = document.querySelectorAll('.testimonial-card');
  const dots    = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevArrow');
  const nextBtn = document.getElementById('nextArrow');

  if (!cards.length) return;

  let current   = 0;
  let autoTimer;
  const INTERVAL = 5000;

  function goTo(index) {
    // Exit current
    cards[current].classList.add('exit-left');
    cards[current].classList.remove('active');
    dots[current].classList.remove('active');

    // Small delay then swap
    setTimeout(() => {
      cards[current].classList.remove('exit-left');
      current = (index + cards.length) % cards.length;
      cards[current].classList.add('active');
      dots[current].classList.add('active');
    }, 150);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, INTERVAL);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      startAuto();
    });
  });

  // Touch/swipe support
  const carousel = document.querySelector('.testimonial-carousel');
  if (carousel) {
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        dx < 0 ? next() : prev();
        startAuto();
      }
    }, { passive: true });
  }

  startAuto();
})();

/* ══════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════ */
(function initForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText   = submitBtn?.querySelector('.btn-text');
  const btnLoader = submitBtn?.querySelector('.btn-loader');
  const success   = document.getElementById('formSuccess');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Loading state
    if (btnText)   btnText.hidden   = true;
    if (btnLoader) btnLoader.hidden = false;
    submitBtn.disabled = true;

    // Simulate async submission (replace with real fetch)
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Success state
    if (btnText)   btnText.hidden   = false;
    if (btnLoader) btnLoader.hidden = true;
    submitBtn.disabled = false;
    if (success) success.hidden = false;
    form.reset();

    // Re-hide after 4s
    setTimeout(() => {
      if (success) success.hidden = true;
    }, 4000);
  });
})();

/* ══════════════════════════════════════════════
   PARALLAX — subtle hero orb on mousemove
══════════════════════════════════════════════ */
(function initParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const orbs = hero.querySelectorAll('.hero-orb');

  hero.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (clientX - cx) / cx;
    const dy = (clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 12;
      orb.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    orbs.forEach(orb => {
      orb.style.transition = 'transform 1s ease';
      orb.style.transform  = 'translate(0,0)';
      setTimeout(() => { orb.style.transition = ''; }, 1000);
    });
  });
})();
