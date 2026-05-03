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
    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      const matchesQuery = !q || title.includes(q) || desc.includes(q);
      card.style.display = matchesQuery ? '' : 'none';
    });
  }
  tourSearch?.addEventListener('input', filterTours);

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
