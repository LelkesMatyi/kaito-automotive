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

// Contact form switcher. Discord delivery will be connected in the final integration step.
const contactPaths = document.querySelectorAll('[data-contact-target]');
const contactPanels = document.querySelectorAll('.contact-form-panel');
contactPaths.forEach(button => button.addEventListener('click', () => {
  contactPaths.forEach(item => item.classList.remove('active'));
  contactPanels.forEach(panel => panel.classList.remove('active'));
  button.classList.add('active');
  const panel = document.getElementById(button.dataset.contactTarget);
  if (panel) panel.classList.add('active');
}));

document.querySelectorAll('[data-demo-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    let message = form.querySelector('.form-message');
    if (!message) {
      message = document.createElement('small');
      message.className = 'form-message';
      form.querySelector('.form-submit').appendChild(message);
    }
    message.textContent = 'Az űrlap működik — a Discord-küldést a végleges integrációnál aktiváljuk.';
  });
});
