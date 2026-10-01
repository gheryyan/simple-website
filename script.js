

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const setMenu = (open) => {
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };

  navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
  navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
  });

  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = [...navLinks]
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => navObserver.observe(s));
  }

  const demo = document.querySelector('.demo');
  const steps = [...demo.querySelectorAll('[data-step]')];
  const chatBody = document.getElementById('chatBody');
  const replayBtn = document.getElementById('replayBtn');
  let timers = [];
  let playing = false;

  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
  const removeTyping = () => chatBody.querySelectorAll('.typing').forEach((t) => t.remove());

  const lockHeight = () => {
    const prev = steps.map((s) => s.classList.contains('show'));
    demo.style.minHeight = '';
    steps.forEach((s) => s.classList.add('show'));
    demo.style.minHeight = demo.offsetHeight + 'px';
    steps.forEach((s, i) => s.classList.toggle('show', prev[i]));
  };

  const showAll = () => {
    clearTimers();
    removeTyping();
    steps.forEach((s) => s.classList.add('show'));
    playing = false;
  };

  const play = () => {
    clearTimers();
    removeTyping();
    steps.forEach((s) => s.classList.remove('show'));
    playing = true;

    let delay = 500;
    steps.forEach((step) => {
      const isBot = step.classList.contains('bot');
      const isChip = step.classList.contains('chip');

      if (isBot) {
        later(() => {
          const typing = document.createElement('div');
          typing.className = 'typing';
          typing.setAttribute('aria-hidden', 'true');
          typing.innerHTML = '<i></i><i></i><i></i>';
          chatBody.appendChild(typing);
        }, delay);
        delay += 1000;
      }

      later(() => {
        removeTyping();
        step.classList.add('show');
      }, delay);

      delay += isChip ? 450 : 900;
    });

    later(() => { playing = false; }, delay);
  };

  if (prefersReducedMotion) {
    showAll();
  } else {
    lockHeight();
    window.addEventListener('resize', () => { if (!playing) lockHeight(); });

    // Mulai saat demo terlihat di layar
    if ('IntersectionObserver' in window) {
      const demoObserver = new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { play(); obs.disconnect(); }
      }, { threshold: 0.35 });
      demoObserver.observe(demo);
    } else {
      play();
    }
  }

  replayBtn.addEventListener('click', () => {
    if (prefersReducedMotion) return;
    play();
  });

  const counters = document.querySelectorAll('.count');

  const animateCount = (el) => {
    const target = Number(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => countObserver.observe(c));
  }

  const faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  const form = document.getElementById('contactForm');
  const formOk = document.getElementById('formOk');

  const validators = {
    nama: (v) => (v.trim().length >= 3 ? '' : 'Nama minimal 3 karakter.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Masukkan alamat email yang valid.'),
    kebutuhan: (v) => (v ? '' : 'Pilih salah satu kebutuhan.')
  };

  const validateField = (input) => {
    const message = validators[input.name](input.value);
    const field = input.closest('.field');
    field.classList.toggle('invalid', Boolean(message));
    field.querySelector('.error').textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  };

  const inputs = form.querySelectorAll('input, select');
  inputs.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('invalid')) validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formOk.hidden = true;

    const results = [...inputs].map(validateField);
    const firstInvalid = [...inputs].find((_, i) => !results[i]);

    if (firstInvalid) { firstInvalid.focus(); return; }

    form.reset();
    formOk.hidden = false;
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});
