// Halaman detail sertifikat: isi diambil dari sertifikat-data.js berdasarkan ?id=...
(function () {
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Navbar: putih di atas, oranye saat digulir + menu mobile
  const navbar = document.querySelector('.navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  document.getElementById('year').textContent = new Date().getFullYear();

  const root = document.getElementById('detail');
  const data = window.SERTIFIKAT || [];
  const id = new URLSearchParams(location.search).get('id');
  const i = data.findIndex(s => s.id === id);
  const back = '<a class="dt-back" href="index.html#achievement">&larr; Kembali ke Achievement</a>';

  if (i < 0) {
    root.insertAdjacentHTML('beforeend',
      back + '<h1 class="dt-title">Sertifikat tidak ditemukan</h1>' +
      '<p>Link yang kamu buka tidak cocok dengan data sertifikat mana pun.</p>');
    return;
  }

  const s = data[i];
  const prev = data[(i - 1 + data.length) % data.length];
  const next = data[(i + 1) % data.length];
  document.title = s.judul + ' | Anugrah';

  const facts = [['Penyelenggara', s.penyelenggara], ['Tahun', s.tahun], ['Kategori', s.kategori], ['Peran', s.peran]]
    .filter(f => f[1])
    .map(f => `<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join('');
  const paras = (s.deskripsi || []).map(p => `<p>${esc(p)}</p>`).join('');
  const points = (s.sorotan || []).map(p => `<li>${esc(p)}</li>`).join('');
  const link = s.tautan
    ? `<a class="dt-link" href="${esc(s.tautan.url)}" target="_blank" rel="noopener">${esc(s.tautan.label)} &rarr;</a>` : '';
  const pad = n => String(n).padStart(2, '0');

  root.insertAdjacentHTML('beforeend', `
    ${back}
    <header class="dt-head dt-in">
      <p class="dt-eyebrow">Achievement &middot; ${pad(i + 1)} / ${pad(data.length)}</p>
      <h1 class="dt-title">${esc(s.judul)}</h1>
      <div class="dt-chips">${[s.kategori, s.tahun].filter(Boolean).map(c => `<span>${esc(c)}</span>`).join('')}</div>
    </header>

    <div class="dt-grid">
      <figure class="dt-cert dt-in" style="--d:.12s">
        <button class="dt-zoom" type="button" aria-label="Perbesar foto sertifikat">
          <img src="${esc(s.gambar)}" alt="Foto sertifikat ${esc(s.judul)}"
               onerror="this.closest('.dt-cert').classList.add('no-img');this.remove()">
        </button>
        <figcaption>Klik foto untuk memperbesar</figcaption>
      </figure>

      <section class="dt-info dt-in" style="--d:.24s">
        <h2 class="dt-h">Tentang sertifikat ini</h2>
        ${paras}
        <dl class="dt-facts">${facts}</dl>
        ${points ? `<h2 class="dt-h">Sorotan</h2><ul class="dt-list">${points}</ul>` : ''}
        ${link}
      </section>
    </div>

    <nav class="dt-pager dt-in" style="--d:.36s" aria-label="Sertifikat lainnya">
      <a class="dt-nav" href="sertifikat.html?id=${encodeURIComponent(prev.id)}">&larr; ${esc(prev.judul)}</a>
      <a class="dt-nav dt-nav-all" href="index.html#achievement">Semua</a>
      <a class="dt-nav" href="sertifikat.html?id=${encodeURIComponent(next.id)}">${esc(next.judul)} &rarr;</a>
    </nav>
  `);

  // Perbesar foto (lightbox)
  const cert = root.querySelector('.dt-cert');
  cert.querySelector('.dt-zoom').addEventListener('click', () => {
    if (cert.classList.contains('no-img')) return;
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML = `<img src="${esc(s.gambar)}" alt=""><button type="button" aria-label="Tutup">&times;</button>`;
    const close = () => { lb.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    lb.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(lb);
  });
})();