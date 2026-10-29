// Skrip halaman utama. Navbar, menu mobile, footer, dan fallback gambar ada di common.js.
(() => {
  'use strict';

  const { esc, reduceMotion } = window.Site;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  // introDone = janji yang selesai saat animasi pembuka berakhir (animasi lain menunggu ini)
  const introDone = initIntro();
  initActiveMenu();
  initReveal();
  initTyper();
  initContactForm();
  initCertificates();
  initWind();
  document.addEventListener('DOMContentLoaded', initCarousel);   // Swiper dimuat paling akhir (lihat urutan <script>)

  /* ---------- Animasi pembuka: awan membesar lalu web muncul ---------- */
  function initIntro() {
    const intro = $('#intro');
    return new Promise(resolve => {
      if (!intro || reduceMotion) { intro?.remove(); resolve(); return; }

      const root = document.documentElement;
      root.style.overflow = 'hidden';   // cegah gulir selama animasi pembuka
      let timer;
      const finish = () => {
        clearTimeout(timer);
        intro.remove();
        root.style.overflow = '';
        resolve();
      };
      timer = setTimeout(finish, 3450);
      intro.addEventListener('click', () => {   // klik = lewati animasi
        intro.classList.add('skip');
        clearTimeout(timer);
        setTimeout(finish, 350);
      }, { once: true });
    });
  }

  /* ---------- Tandai menu aktif sesuai bagian yang sedang dilihat ---------- */
  function initActiveMenu() {
    const links = $$('#menu a');
    const targets = [$('#home'), ...links.map(a => $(a.hash))].filter(Boolean);   // #home: menghapus tanda saat kembali ke atas
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(el => observer.observe(el));
  }

  /* ---------- Scroll reveal (pengganti AOS): elemen [data-reveal] muncul sekali saat terlihat ---------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    items.forEach(el => observer.observe(el));
  }

  /* ---------- Efek mengetik di judul (pengganti Typed.js) ---------- */
  async function initTyper() {
    const el = $('#typed');
    if (!el || reduceMotion) return;

    const words = ['Friends!', 'Visitors!', 'Everyone!'];
    await introDone;
    await wait(300);
    el.classList.add('is-typing');

    for (let i = 0; ; i = (i + 1) % words.length) {
      const word = words[i];
      for (let n = 1; n <= word.length; n++) { el.textContent = word.slice(0, n); await wait(80); }
      await wait(1500);
      for (let n = word.length - 1; n >= 0; n--) { el.textContent = word.slice(0, n); await wait(45); }
    }
  }

  /* ---------- Form kontak (demo: belum terkirim ke server) ---------- */
  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.elements.name.value.trim();
      $('#formNote').textContent =
        `Terima kasih, ${name}! Hubungkan form ini ke Formspree/EmailJS agar pesan benar-benar terkirim.`;
      form.reset();
    });
  }

  /* ---------- Galeri sertifikat: kartu dibuat dari sertifikat-data.js (klik -> sertifikat.html?id=...) ---------- */
  function initCertificates() {
    const wrapper = $('#certWrapper');
    const data = window.SERTIFIKAT;
    if (!wrapper || !data) return;

    wrapper.innerHTML = data.map(s => `
      <div class="swiper-slide">
        <a class="slide-card" href="sertifikat.html?id=${encodeURIComponent(s.id)}">
          <div class="slide-img" data-img>
            <img src="${esc(s.gambar)}" alt="Sertifikat ${esc(s.judul)}" loading="lazy" decoding="async">
            <span class="slide-more">Lihat detail &rarr;</span>
          </div>
          <div class="slide-cap">
            <h4 class="slide-title">${esc(s.judul)}</h4>
            <p class="slide-meta">${esc(s.penyelenggara)} &middot; ${esc(s.tahun)}</p>
          </div>
        </a>
      </div>`).join('');
  }

  /* ---------- Carousel sertifikat (Swiper) ---------- */
  function initCarousel() {
    const el = $('.cert-swiper');
    const count = el ? $$('.swiper-slide', el).length : 0;
    if (!el || !count || !window.Swiper) return;

    const swiper = new Swiper(el, {
      loop: count >= 6,
      rewind: count < 6,
      spaceBetween: 24,
      grabCursor: true,
      slidesPerView: 1,
      breakpoints: { 640: { slidesPerView: 2 }, 980: { slidesPerView: 3 } },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      autoplay: reduceMotion ? false : { delay: 3500, pauseOnMouseEnter: true, disableOnInteraction: false }
    });

    // Autoplay hanya berjalan saat galeri terlihat
    if (!reduceMotion) {
      new IntersectionObserver(([entry]) =>
        entry.isIntersecting ? swiper.autoplay.start() : swiper.autoplay.stop()
      ).observe(el);
    }
  }

  /* ---------- Angin membawa ikon bahasa pemrograman ----------
     Siklus: ikon tertiup keluar -> melayang & bergoyang -> tersedot ke nama -> tertiup keluar lagi.
     Ikon diambil otomatis dari daftar tools di "What I Can Do". */
  function initWind() {
    const hero = $('.hero');
    const wind = $('#wind');
    const nameEl = $('.hero-name');
    const streaks = wind && $('.wind-streaks', wind);
    const icons = $$('.tools .tool img');
    if (!hero || !wind || !nameEl || !streaks || !icons.length) return;

    // ---- Pengaturan waktu (milidetik), silakan diubah ----
    const EMIT = 1900;      // lama ikon tertiup keluar
    const EMIT_GAP = 110;   // jeda antar ikon saat keluar
    const HOLD = 6500;      // lama ikon melayang & bergoyang sebelum tersedot
    const SUCK = 1500;      // lama ikon tersedot ke nama
    const SUCK_GAP = 70;    // jeda antar ikon saat tersedot

    // [dx, y]: dx = jarak dari tengah, y = jarak dari atas (satuan: tinggi area foto)
    const SPOTS = [
      [-34, 12], [35, 8],  [-54, 30], [55, 26],
      [-30, 48], [30, 44], [-64, 62], [64, 58],
      [-40, 78], [38, 74], [-26, 92], [26, 90]
    ];

    const items = icons.map((img, i) => {
      const [dx, y] = SPOTS[i % SPOTS.length];
      const item = document.createElement('div');
      item.className = 'wind-item';
      item.style.cssText =
        `--dx:${dx};--y:${y};--sdur:${5.5 + (i % 4) * 1.2}s;--sdelay:${-i * 0.9}s;--sa:${6 + (i % 3) * 3}`;
      item.innerHTML = `<div class="wi"><img src="${esc(img.currentSrc || img.src)}" alt=""></div>`;
      return item;
    });
    wind.append(...items);

    // Tanpa animasi: ikon langsung diam di posisinya
    if (reduceMotion) { items.forEach(item => (item.style.opacity = 1)); return; }

    // Jeda semua animasi hero saat hero tidak terlihat (hemat CPU/baterai)
    let onScreen = true;
    let resume;
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      hero.classList.toggle('is-off', !onScreen);
      if (onScreen && resume) { resume(); resume = undefined; }
    }).observe(hero);
    const whenOnScreen = () => onScreen ? Promise.resolve() : new Promise(r => (resume = r));

    const visible = () => items.filter(item => item.offsetParent !== null);
    const restOf = item => ({ x: item.offsetLeft + item.offsetWidth / 2, y: item.offsetTop + item.offsetHeight / 2 });

    function geometry() {
      const w = wind.getBoundingClientRect();
      const n = nameEl.getBoundingClientRect();
      return {
        name:  { x: n.left + n.width / 2 - w.left, y: n.top + n.height / 2 - w.top },
        photo: { x: w.width / 2, y: w.height * 0.45 }
      };
    }

    // Titik tengah lintasan melengkung (tegak lurus garis lurus asal-tujuan)
    function bend(vx, vy, t, amount) {
      const d = Math.hypot(vx, vy) || 1;
      return { x: vx * t + (-vy / d) * amount, y: vy * t + (vx / d) * amount, d };
    }

    // Ikon tertiup keluar dari titik asal (foto di awal, nama di putaran berikutnya)
    function emit(origin) {
      visible().forEach((item, i) => {
        const r = restOf(item);
        const ox = origin.x - r.x, oy = origin.y - r.y;
        const m = bend(ox, oy, .45, Math.hypot(ox, oy) * .18 * (i % 2 ? 1 : -1));
        const previous = item.getAnimations();
        item.animate([
          { transform: `translate(${ox}px,${oy}px) scale(.2) rotate(-120deg)`, opacity: 0, offset: 0 },
          { opacity: 1, offset: .15 },
          { transform: `translate(${m.x}px,${m.y}px) scale(1.15) rotate(150deg)`, opacity: 1, offset: .55 },
          { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1, offset: 1 }
        ], { duration: EMIT, delay: i * EMIT_GAP, easing: 'cubic-bezier(.22,.9,.28,1)', fill: 'both' });
        previous.forEach(a => a.cancel());
      });
    }

    // Ikon berputar tersedot ke arah nama
    function suck(target) {
      visible().forEach((item, i) => {
        const r = restOf(item);
        const tx = target.x - r.x, ty = target.y - r.y;
        const m = bend(tx, ty, .5, Math.hypot(tx, ty) * .22 * (i % 2 ? -1 : 1));
        const previous = item.getAnimations();
        item.animate([
          { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1, filter: 'blur(0px)', offset: 0 },
          { transform: `translate(${m.x}px,${m.y}px) scale(.8) rotate(220deg)`, opacity: 1, filter: 'blur(3px)', offset: .55 },
          { transform: `translate(${tx}px,${ty}px) scale(.1) rotate(560deg)`, opacity: 0, filter: 'blur(8px)', offset: 1 }
        ], { duration: SUCK, delay: i * SUCK_GAP, easing: 'cubic-bezier(.5,0,.9,.45)', fill: 'both' });
        previous.forEach(a => a.cancel());
      });
    }

    // Garis angin: 'blow' (keluar dari balik foto) atau 'suck' (menuju nama)
    function gust(type) {
      streaks.classList.remove('blow', 'suck');
      streaks.getBoundingClientRect();   // paksa browser memulai ulang animasi
      streaks.classList.add(type);
    }

    // Nama berdenyut dan bersinar saat "menelan" ikon
    function pulse() {
      nameEl.animate([
        { transform: 'scale(1)',    textShadow: '0 0 0 rgba(91,184,255,0)' },
        { transform: 'scale(1.08)', textShadow: '0 0 18px rgba(91,184,255,.85)', offset: .4 },
        { transform: 'scale(1)',    textShadow: '0 0 0 rgba(91,184,255,0)' }
      ], { duration: 800, easing: 'ease-out' });
    }

    (async function loop() {
      await introDone;
      await wait(300);
      gust('blow');
      emit(geometry().photo);                    // pertama kali: keluar dari foto
      for (;;) {
        await wait(EMIT + EMIT_GAP * items.length + HOLD);
        await whenOnScreen();                    // tunda putaran berikutnya sampai hero terlihat lagi
        gust('suck');
        suck(geometry().name);                   // tersedot ke nama
        await wait(SUCK + SUCK_GAP * items.length);
        pulse();
        gust('blow');
        emit(geometry().name);                   // langsung ditiup keluar lagi dari nama
      }
    })();
  }
})();