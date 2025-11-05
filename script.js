// Basic interactive behavior: form handling, booking modal, small validations
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle (if present)
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle?.addEventListener('click', () => mainNav?.classList.toggle('open'));

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

  bookingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Simple validation
    const name = document.getElementById('bookingName')?.value.trim() || '';
    const email = document.getElementById('bookingEmail')?.value.trim() || '';
    const date = document.getElementById('bookingDate')?.value || '';
    if (!name || !email || !date) {
      if (bookingMessage) {
        bookingMessage.style.color = 'crimson';
        bookingMessage.textContent = 'Please complete all required fields.';
      }
      return;
    }

    const booking = { tour: bookingTour?.value || '', name, email, date, created: new Date().toISOString() };

    // Try server first, fall back to localStorage
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
        bookingForm.reset();
        setTimeout(closeModal, 2000);
        return;
      }
      // if server responded non-ok, fall through to localStorage
    } catch (err) {
      // network error or server down -> fallback
      console.warn('Booking server not reachable, saving locally', err);
    }

    // Fallback: save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
      existing.push(booking);
      localStorage.setItem('bookings', JSON.stringify(existing));
    } catch (err) {
      console.warn('localStorage failed', err);
    }
    if (bookingMessage) {
      bookingMessage.style.color = 'green';
      bookingMessage.textContent = `Thanks ${name}! Your booking for ${bookingTour?.value || ''} on ${date} is recorded (saved locally).`;
    }
    bookingForm.reset();
    setTimeout(closeModal, 2500);
  });

  // Contact form: inline feedback + honeypot
  const contactForm = document.getElementById('contactForm');
  let contactMessage = document.querySelector('.form-message');
  if (!contactMessage && contactForm) {
    contactMessage = document.createElement('div');
    contactMessage.className = 'form-message';
    contactForm.appendChild(contactMessage);
  }

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Honeypot anti-spam
    const honeypot = document.getElementById('website')?.value;
    if (honeypot) return; // drop silently

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

    const payload = { name, email, message };
    // Try server first
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
        contactForm.reset();
        return;
      }
      // else fall back
    } catch (err) {
      console.warn('Contact server not reachable, saving locally', err);
    }

    // Fallback: save to localStorage
    try {
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      messages.push(Object.assign({}, payload, { created: new Date().toISOString() }));
      localStorage.setItem('messages', JSON.stringify(messages));
    } catch (err) {
      console.warn('localStorage failed', err);
    }
    if (contactMessage) {
      contactMessage.style.color = 'green';
      contactMessage.textContent = 'Thanks! Your message has been recorded (saved locally). We will get back to you soon.';
    }
    contactForm.reset();
  });

  document.getElementById('clearForm')?.addEventListener('click', () => contactForm?.reset());

  // Tour search / filter (search box + price filter)
  const tourSearch = document.getElementById('tourSearch');
  const priceFilter = document.getElementById('priceFilter');
  const toursGrid = document.getElementById('toursGrid');
  function filterTours() {
    const q = tourSearch?.value.trim().toLowerCase() || '';
    const maxPrice = priceFilter?.value ? Number(priceFilter.value) : null;
    const cards = toursGrid?.querySelectorAll('.tour-card') || [];
    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      const price = Number(card.dataset.price || 0);
      const matchesQuery = !q || title.includes(q) || desc.includes(q);
      const matchesPrice = maxPrice == null || price <= maxPrice;
      card.style.display = (matchesQuery && matchesPrice) ? '' : 'none';
    });
  }
  tourSearch?.addEventListener('input', filterTours);
  priceFilter?.addEventListener('change', filterTours);
});