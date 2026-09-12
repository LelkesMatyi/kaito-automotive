const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const range = document.getElementById('baRange');
const beforeWrap = document.getElementById('beforeWrap');
const baLine = document.getElementById('baLine');

function updateCompare(value) {
  beforeWrap.style.width = value + '%';
  baLine.style.left = value + '%';
}
range.addEventListener('input', e => updateCompare(e.target.value));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form switcher.
const contactPaths = document.querySelectorAll('[data-contact-target]');
const contactPanels = document.querySelectorAll('.contact-form-panel');
contactPaths.forEach(button => button.addEventListener('click', () => {
  contactPaths.forEach(item => item.classList.remove('active'));
  contactPanels.forEach(panel => panel.classList.remove('active'));
  button.classList.add('active');
  const panel = document.getElementById(button.dataset.contactTarget);
  if (panel) panel.classList.add('active');
}));

function getFormMessage(form) {
  let message = form.querySelector('.form-message');
  if (!message) {
    message = document.createElement('small');
    message.className = 'form-message';
    form.querySelector('.form-submit').appendChild(message);
  }
  return message;
}

document.querySelectorAll('[data-discord-form]').forEach(form => {
  const formOpenedAt = Date.now();
  let lastSubmitAt = 0;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const message = getFormMessage(form);
    const originalText = submitButton.textContent;
    const now = Date.now();

    if (now - lastSubmitAt < 10000) {
      message.textContent = 'Kérjük, várj néhány másodpercet az újabb küldés előtt.';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'KÜLDÉS...';
    message.textContent = 'Küldés folyamatban...';

    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      payload._startedAt = String(formOpenedAt);
      const response = await fetch(form.dataset.discordForm, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Submission failed');

      message.textContent = form.dataset.discordForm.includes('partner')
        ? 'Sikeres jelentkezés! A Kaito vezetősége megkapta az adatokat.'
        : 'Sikeres ajánlatkérés! A Kaito Staff megkapta az adatokat.';
      lastSubmitAt = Date.now();
      form.reset();
    } catch (error) {
      console.error(error);
      message.textContent = 'A küldés nem sikerült. Kérjük, próbáld újra később.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
});
