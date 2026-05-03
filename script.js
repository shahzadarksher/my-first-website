// Basic interactive behavior: form handling, booking modal, small validations
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Dark mode toggle
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)) {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀';
  }
  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀' : '☾';
  });

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle?.addEventListener('click', () => mainNav?.classList.toggle('open'));
  // Close mobile menu on nav link click
  mainNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mainNav?.classList.remove('open'));
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a');
  function setActiveNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === `#${id}`) a.classList.add('active');
        });
      }
    });
  }
  window.addEventListener('scroll', setActiveNav);

  // Set minimum date for booking
  const bookingDate = document.getElementById('bookingDate');
  if (bookingDate) {
    const today = new Date().toISOString().split('T')[0];
    bookingDate.setAttribute('min', today);
  }

  // Scroll reveal animations
  const revealElements = document.querySelectorAll('.tour-card, .stat-card, .testimonial, .faq-item, .about-section, .contact-section, .newsletter-section, .stats-section');
  revealElements.forEach(el => el.classList.add('reveal'));
  function revealOnScroll() {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  // Header scroll shadow
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 10));

  // Back to top button
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => backToTop?.classList.toggle('hidden', window.scrollY < 400));
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Toast notification system
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = type === 'error' ? 'crimson' : type === 'warning' ? '#f59e0b' : 'var(--primary)';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-exit');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

  // Loading spinner helper
  function showSpinner(btn) {
    const spinner = btn.querySelector('.spinner');
    const text = btn.querySelector('.btn-text');
    spinner?.classList.remove('hidden');
    if (text) text.style.opacity = '0.6';
    btn.disabled = true;
  }
  function hideSpinner(btn) {
    const spinner = btn.querySelector('.spinner');
    const text = btn.querySelector('.btn-text');
    spinner?.classList.add('hidden');
    if (text) text.style.opacity = '1';
    btn.disabled = false;
  }

  // Modal behavior
  const modal = document.getElementById('bookingModal');
  const bookingTour = document.getElementById('bookingTour');
  const bookingForm = document.getElementById('bookingForm');
  const bookingMessage = document.getElementById('bookingMessage');

  function openModal(tourName = '') {
    if (bookingTour) bookingTour.value = tourName;
    if (bookingMessage) bookingMessage.textContent = '';
    modal?.classList.remove('hidden');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal?.classList.add('hidden');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.getElementById('bookNow')?.addEventListener('click', () => openModal('Custom Tour'));

  function inlineClick(e) { openModal(e.currentTarget.dataset.tour); }
  function attachBookButtons() {
    document.querySelectorAll('.book-inline').forEach(btn => {
      btn.removeEventListener('click', inlineClick);
      btn.addEventListener('click', inlineClick);
    });
  }
  attachBookButtons();

  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('cancelBooking')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal?.classList.contains('hidden')) closeModal(); });

  // Tour detail modal
  const tourModal = document.getElementById('tourModal');
  const tourModalTitle = document.getElementById('tourModalTitle');
  const tourModalClose = document.getElementById('tourModalClose');
  const bookFromDetail = document.getElementById('bookFromDetail');
  function openTourDetail(btn) {
    document.getElementById('tourDetailDescription').textContent = btn.dataset.description || '';
    document.getElementById('tourDetailDuration').textContent = btn.dataset.duration || '';
    document.getElementById('tourDetailGroup').textContent = btn.dataset.group || '';
    document.getElementById('tourDetailLocation').textContent = btn.dataset.location || '';
    const includesEl = document.getElementById('tourDetailIncludes');
    const excludesEl = document.getElementById('tourDetailExcludes');
    includesEl.innerHTML = '';
    excludesEl.innerHTML = '';
    (btn.dataset.includes || '').split(',').forEach(item => {
      if (item.trim()) { const li = document.createElement('li'); li.textContent = item.trim(); includesEl.appendChild(li); }
    });
    (btn.dataset.excludes || '').split(',').forEach(item => {
      if (item.trim()) { const li = document.createElement('li'); li.textContent = item.trim(); excludesEl.appendChild(li); }
    });
    tourModalTitle.textContent = btn.dataset.tour + ' — Details';
    tourModal?.classList.remove('hidden');
    tourModal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeTourModal() {
    tourModal?.classList.add('hidden');
    tourModal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  tourModalClose?.addEventListener('click', closeTourModal);
  tourModal?.addEventListener('click', (e) => { if (e.target === tourModal) closeTourModal(); });
  bookFromDetail?.addEventListener('click', () => {
    closeTourModal();
    setTimeout(() => openModal(tourModalTitle.textContent.replace(' — Details', '')), 200);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !tourModal?.classList.contains('hidden')) closeTourModal(); });
  document.querySelectorAll('.tour-details').forEach(btn => btn.addEventListener('click', () => openTourDetail(btn)));

  bookingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.btn-with-spinner');
    const name = document.getElementById('bookingName')?.value.trim() || '';
    const email = document.getElementById('bookingEmail')?.value.trim() || '';
    const date = document.getElementById('bookingDate')?.value || '';
    const guests = document.getElementById('bookingGuests')?.value || '1';
    if (!name || !email || !date) {
      if (bookingMessage) {
        bookingMessage.style.color = 'crimson';
        bookingMessage.textContent = 'Please complete all required fields.';
      }
      return;
    }

    showSpinner(submitBtn);
    const booking = { tour: bookingTour?.value || '', name, email, date, guests, created: new Date().toISOString() };

    try {
      const resp = await fetch('http://localhost:3000/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      if (resp.ok) {
        if (bookingMessage) {
          bookingMessage.style.color = 'green';
          bookingMessage.textContent = `Thanks ${name}! Your booking has been received.`;
        }
        showToast(`Booking confirmed for ${name}!`);
        bookingForm.reset();
        setTimeout(closeModal, 2000);
        hideSpinner(submitBtn);
        return;
      }
    } catch (err) {
      console.warn('Booking server not reachable, saving locally', err);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
      existing.push(booking);
      localStorage.setItem('bookings', JSON.stringify(existing));
    } catch (err) {
      console.warn('localStorage failed', err);
    }
    if (bookingMessage) {
      bookingMessage.style.color = 'green';
      bookingMessage.textContent = `Thanks ${name}! Your booking is recorded (saved locally).`;
    }
    showToast(`Booking recorded for ${name}!`);
    bookingForm.reset();
    setTimeout(() => { closeModal(); hideSpinner(submitBtn); }, 2500);
  });

  // Contact form
  const contactForm = document.getElementById('contactForm');
  let contactMessage = document.querySelector('.form-message');
  if (!contactMessage && contactForm) {
    contactMessage = document.createElement('div');
    contactMessage.className = 'form-message';
    contactForm.appendChild(contactMessage);
  }

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const honeypot = document.getElementById('website')?.value;
    if (honeypot) return;
    const submitBtn = e.target.querySelector('.btn-with-spinner');
    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';
    if (!name || !email) {
      if (contactMessage) {
        contactMessage.style.color = 'crimson';
        contactMessage.textContent = 'Please provide your name and email.';
      }
      return;
    }

    showSpinner(submitBtn);
    const payload = { name, email, message };
    try {
      const resp = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        if (contactMessage) {
          contactMessage.style.color = 'green';
          contactMessage.textContent = 'Thanks! Your message has been sent.';
        }
        showToast('Message sent successfully!');
        contactForm.reset();
        hideSpinner(submitBtn);
        return;
      }
    } catch (err) {
      console.warn('Contact server not reachable, saving locally', err);
    }

    try {
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      messages.push(Object.assign({}, payload, { created: new Date().toISOString() }));
      localStorage.setItem('messages', JSON.stringify(messages));
    } catch (err) {
      console.warn('localStorage failed', err);
    }
    if (contactMessage) {
      contactMessage.style.color = 'green';
      contactMessage.textContent = 'Thanks! Your message has been recorded.';
    }
    showToast('Message recorded!');
    contactForm.reset();
    hideSpinner(submitBtn);
  });

  document.getElementById('clearForm')?.addEventListener('click', () => contactForm?.reset());

  // Newsletter form
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.btn-with-spinner');
    const email = document.getElementById('newsletterEmail')?.value.trim();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    showSpinner(submitBtn);
    await new Promise(r => setTimeout(r, 1000));
    showToast(`Subscribed with ${email}!`);
    newsletterForm.reset();
    hideSpinner(submitBtn);
  });

  // Tour search / filter
  const tourSearch = document.getElementById('tourSearch');
  const toursGrid = document.getElementById('toursGrid');
  function filterTours() {
    const q = tourSearch?.value.trim().toLowerCase() || '';
    const cards = toursGrid?.querySelectorAll('.tour-card') || [];
    let visible = 0;
    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      const matchesQuery = !q || title.includes(q) || desc.includes(q);
      card.style.display = matchesQuery ? '' : 'none';
      if (matchesQuery) visible++;
    });
    let noResults = toursGrid?.querySelector('.no-results');
    if (visible === 0 && q) {
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = `No tours found for "${q}"`;
        toursGrid?.appendChild(noResults);
      }
    } else if (noResults) {
      noResults.remove();
    }
  }
  tourSearch?.addEventListener('input', filterTours);

  // Currency converter
  const rates = { USD: 1, PKR: 278, EUR: 0.92, GBP: 0.79 };
  const symbols = { USD: '$', PKR: 'Rs ', EUR: '€', GBP: '£' };
  const currencySelector = document.getElementById('currencySelector');
  function updatePrices() {
    const currency = currencySelector?.value || 'USD';
    const rate = rates[currency];
    const symbol = symbols[currency];
    document.querySelectorAll('.price[data-price-usd]').forEach(el => {
      const usd = parseFloat(el.dataset.priceUsd);
      const converted = Math.round(usd * rate);
      el.textContent = `From ${symbol}${converted}`;
    });
  }
  currencySelector?.addEventListener('change', () => {
    localStorage.setItem('currency', currencySelector?.value || 'USD');
    updatePrices();
  });
  const savedCurrency = localStorage.getItem('currency');
  if (savedCurrency && currencySelector) {
    currencySelector.value = savedCurrency;
    updatePrices();
  }

  // Stats counter animation
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;
  function animateStats() {
    if (statsAnimated) return;
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;
    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      statsAnimated = true;
      statNumbers.forEach(el => {
        const target = parseFloat(el.dataset.target);
        const isFloat = target % 1 !== 0;
        const duration = 2000;
        const start = performance.now();
        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;
          el.textContent = isFloat ? current.toFixed(1) : Math.floor(current) + (target >= 50 ? '+' : '');
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
    }
  }
  window.addEventListener('scroll', animateStats);
  animateStats();

  // Image lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  document.querySelectorAll('.lightbox-img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox?.classList.remove('hidden');
      lightbox?.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
  function closeLightbox() {
    lightbox?.classList.add('hidden');
    lightbox?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lightbox?.classList.contains('hidden')) closeLightbox(); });
});
