// Dipakai bersama oleh index.html dan sertifikat.html (dulu kodenya diduplikasi di script.js dan detail.js)
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mengamankan teks sebelum masuk ke innerHTML
  const esc = text => String(text).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  window.Site = { esc, reduceMotion };

  // ---------- Navbar: putih di atas, berwarna saat digulir ----------
  const navbar = document.querySelector('.navbar');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');

  const updateNavbar = () => navbar.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ---------- Menu mobile ----------
  const setMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    burger.textContent = open ? '✕' : '☰';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // ---------- Tahun di footer ----------
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- Gambar gagal dimuat ----------
  // Wrapper bertanda data-img diberi kelas .no-img (CSS menampilkan kotak pengganti), gambarnya dibuang.
  // Satu listener (fase capture) cukup untuk gambar statis maupun yang dibuat lewat JS.
  const markBroken = img => {
    img.closest('[data-img]')?.classList.add('no-img');
    img.remove();
  };
  addEventListener('error', e => {
    if (e.target instanceof HTMLImageElement && e.target.closest('[data-img]')) markBroken(e.target);
  }, true);
  // Gambar statis yang sudah terlanjur gagal sebelum skrip ini jalan
  document.querySelectorAll('[data-img] img').forEach(img => {
    if (img.complete && !img.naturalWidth) markBroken(img);
  });
})();