// Basic interactive behavior: form handling, booking modal, small validations
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Modal behavior
  const modal = document.getElementById('bookingModal');
  const bookingTour = document.getElementById('bookingTour');
  const bookingForm = document.getElementById('bookingForm');
  const bookingMessage = document.getElementById('bookingMessage');

  function openModal(tourName = '') {
    bookingTour.value = tourName;
    bookingMessage.textContent = '';
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.getElementById('bookNow')?.addEventListener('click', () => openModal('Custom Tour'));
  document.querySelectorAll('.book-inline').forEach(btn =>
    btn.addEventListener('click', (e) => openModal(e.currentTarget.dataset.tour))
  );

  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('cancelBooking')?.addEventListener('click', closeModal);

  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simple validation
    const name = document.getElementById('bookingName').value.trim();
    const email = document.getElementById('bookingEmail').value.trim();
    const date = document.getElementById('bookingDate').value;
    if (!name || !email || !date) {
      bookingMessage.style.color = 'crimson';
      bookingMessage.textContent = 'Please complete all required fields.';
      return;
    }
    // Here you would send booking to server (e.g., using fetch to an API)
    bookingMessage.style.color = 'green';
    bookingMessage.textContent = `Thank you ${name}! Your booking request for ${bookingTour.value} on ${date} has been received. We will contact you at ${email}.`;
    bookingForm.reset();
    setTimeout(closeModal, 3500);
  });

  // Contact form simple submit
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    // Gather values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    if (!name || !email) {
      alert('Please provide your name and email.');
      return;
    }
    // Normally send to server here
    alert('Thanks! Your message has been sent. We will get back to you soon.');
    contactForm.reset();
  });

  document.getElementById('clearForm')?.addEventListener('click', () => contactForm.reset());
});