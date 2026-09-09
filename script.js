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

document.querySelectorAll(".fb-compare[data-compare]").forEach(c=>{const r=c.querySelector("[data-range]"),a=c.querySelector("[data-after]"),l=c.querySelector("[data-line]");const u=()=>{a.style.clipPath=`inset(0 0 0 ${r.value}%)`;l.style.left=`${r.value}%`};r.addEventListener("input",u);u();});