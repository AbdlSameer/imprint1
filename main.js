/* ============================================
   IMPRINT — MAIN.JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────
  // 1. CUSTOM CURSOR
  // ─────────────────────────────────────────────
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateCursor() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .layer-card, .fact-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.style.width = '60px';
      follower.style.height = '60px';
      follower.style.borderColor = '#4A9EFF';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width = '36px';
      follower.style.height = '36px';
      follower.style.borderColor = '#4A9EFF';
    });
  });

  // ─────────────────────────────────────────────
  // 2. NUCLEAR COUNTDOWN TIMER (glitch effect)
  // ─────────────────────────────────────────────
  const timerEl = document.getElementById('nuclear-timer');
  let totalMs = 4 * 60 * 1000;
  let timerRunning = false;

  function tickTimer() {
    if (!timerRunning || totalMs <= 0) return;
    totalMs -= 50;

    const m   = Math.floor(totalMs / 60000);
    const s   = Math.floor((totalMs % 60000) / 1000);
    const ms  = Math.floor((totalMs % 1000) / 10);

    const fmt = (n) => n.toString().padStart(2, '0');
    timerEl.textContent = `${fmt(m)}:${fmt(s)}.${fmt(ms)}`;

    // Random glitch
    if (Math.random() > 0.97) {
      timerEl.style.transform = `skewX(${(Math.random() - 0.5) * 6}deg) translateX(${(Math.random()-0.5)*4}px)`;
      timerEl.style.color = '#FF3333';
      setTimeout(() => {
        timerEl.style.transform = 'none';
        timerEl.style.color = '#ffffff';
      }, 80);
    }

    setTimeout(tickTimer, 50);
  }

  if (timerEl) {
    const nuclearObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !timerRunning) {
          timerRunning = true;
          tickTimer();
          nuclearObs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    nuclearObs.observe(timerEl);
  }

  // ─────────────────────────────────────────────
  // 4. INFINITE TICKER (requestAnimationFrame)
  // ─────────────────────────────────────────────
  const ticker = document.getElementById('moat-ticker');
  if (ticker) {
    // Clone for seamless loop
    ticker.innerHTML += ticker.innerHTML;
    let pos = 0;
    const speed = 1.2;

    function animTicker() {
      pos -= speed;
      if (Math.abs(pos) >= ticker.scrollWidth / 2) pos = 0;
      ticker.style.transform = `translateX(${pos}px)`;
      requestAnimationFrame(animTicker);
    }
    animTicker();
  }

  // ─────────────────────────────────────────────
  // 5. INTERSECTION OBSERVER — All reveal types
  // ─────────────────────────────────────────────
  // reveal-up (generic)
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObs.observe(el));

  // Layer cards (staggered)
  const layerCards = document.querySelectorAll('.layer-card');
  const layerObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
        layerObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  layerCards.forEach(c => layerObs.observe(c));

  // Timeline items
  const tlItems = document.querySelectorAll('.tl-item');
  const tlObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0);
        const bar   = e.target.querySelector('.tl-progress');
        const targetW = bar ? bar.style.width : '0%';
        if (bar) bar.style.setProperty('--target-width', targetW);
        setTimeout(() => {
          e.target.classList.add('visible');
          if (bar) bar.style.width = targetW;
        }, delay);
        tlObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  tlItems.forEach(item => {
    const bar = item.querySelector('.tl-progress');
    if (bar) {
      const original = bar.style.width;
      bar.style.width = '0%';
      item.dataset._targetW = original;
    }
    tlObs.observe(item);
  });

  // Fix timeline bar animation on visible
  const tlFixObs = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.target.classList.contains('visible')) {
        const bar = m.target.querySelector('.tl-progress');
        const tw = m.target.dataset._targetW;
        if (bar && tw) {
          const delay = parseInt(m.target.dataset.delay || 0);
          setTimeout(() => { bar.style.width = tw; }, delay + 100);
        }
      }
    });
  });
  tlItems.forEach(item => tlFixObs.observe(item, { attributes: true, attributeFilter: ['class'] }));

  // ─────────────────────────────────────────────
  // 6. NAVBAR SCROLL STATE
  // ─────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.style.background = 'rgba(5,5,5,0.95)';
      } else {
        navbar.style.background = 'rgba(5,5,5,0.85)';
      }
    });
  }

  // ─────────────────────────────────────────────
  // 7. FLYWHEEL HOVER ANIMATION
  // ─────────────────────────────────────────────
  const fwSteps = document.querySelectorAll('.fw-step');
  fwSteps.forEach(step => {
    step.addEventListener('mouseenter', () => {
      const icon = step.querySelector('.fw-icon');
      if (icon) {
        icon.style.borderColor = '#4A9EFF';
        icon.style.color = '#4A9EFF';
      }
    });
    step.addEventListener('mouseleave', () => {
      const icon = step.querySelector('.fw-icon:not(.accent-icon)');
      if (icon) {
        icon.style.borderColor = '';
        icon.style.color = '';
      }
    });
  });

});
