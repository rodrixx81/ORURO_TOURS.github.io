document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('lang-toggle');

  // Establecer idioma inicial
  setLanguage('es');

  // Cambiar idioma al hacer clic
  langToggle.addEventListener('click', () => {
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'es' ? 'en' : 'es';
    setLanguage(newLang);
  });
});

function setLanguage(lang) {
  document.documentElement.lang = lang;
  const elements = document.querySelectorAll('[data-es][data-en]');
  elements.forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
  const toggle = document.getElementById('lang-toggle');
  toggle.textContent = lang === 'es' ? 'EN' : 'ES';
}

(function () {
  const header = document.querySelector('header');
  const btn = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-nav');

  if (!header || !btn || !nav) return;

  // Toggle abrir/cerrar
  btn.addEventListener('click', () => {
    const open = header.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open);
    btn.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Cierra al tocar un enlace
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    header.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i class="fas fa-bars"></i>';
  });

  // Resetea al pasar a desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 860 && header.classList.contains('nav-open')) {
      header.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
  
})();




  
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-slider .slide');
  let current = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  setInterval(() => {
    current = (current + 1) % slides.length;
    showSlide(current);
  }, 5000);
});


document.querySelectorAll('.tour-tabs a').forEach(tab => {
  tab.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.tour-tabs a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(this.getAttribute('href').substring(1)).classList.add('active');
  });
});

(() => {
  function onReady() {
    // 1) Galerías presentes
    const galleries = document.querySelectorAll('.galeria-grid');
    if (!galleries.length) return;

    // 2) Elementos del lightbox (con checks defensivos)
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) { console.warn('[Lightbox] Falta el contenedor #lightbox en el HTML'); return; }

    const imgEl   = lightbox.querySelector('#lb-image');
    const capEl   = lightbox.querySelector('#lb-caption');
    const btnPrev = lightbox.querySelector('.lb-prev');
    const btnNext = lightbox.querySelector('.lb-next');
    const btnClose= lightbox.querySelector('.lb-close');
    const stage   = lightbox.querySelector('.lb-stage');

    if (!imgEl || !capEl || !btnPrev || !btnNext || !btnClose || !stage) {
      console.warn('[Lightbox] Marcado incompleto: asegúrate de tener #lb-image, #lb-caption, .lb-prev, .lb-next, .lb-close y .lb-stage');
      return;
    }

    // 3) Estado
    let list = [];   // {src, alt}[]
    let current = 0; // índice
    let startX = 0;  // swipe móvil

    // 4) Apertura / cierre
    function openLightbox(items, index){
      list = items;
      current = Math.max(0, Math.min(index, list.length - 1));
      updateStage(false);
      lightbox.classList.add('open');
      document.body.classList.add('lb-open');
      lightbox.setAttribute('aria-hidden', 'false');
      // foco seguro
      if (btnClose && btnClose.focus) btnClose.focus({preventScroll:true});
    }

    function closeLightbox(){
      lightbox.classList.remove('open');
      document.body.classList.remove('lb-open');
      lightbox.setAttribute('aria-hidden', 'true');
      list = [];
      current = 0;
      // limpia imagen para evitar "flash" si se vuelve a abrir
      imgEl.removeAttribute('src');
      imgEl.removeAttribute('alt');
      capEl.textContent = '';
    }

    // 5) Navegación
    function go(delta){
      if (!list.length) return;
      current = (current + delta + list.length) % list.length;
      updateStage(true);
    }

    // 6) Actualizar imagen/caption (con pequeña animación)
    function updateStage(animate){
      if (!list.length) return;
      const item = list[current];
      if (!item) return;

      const { src, alt } = item;
      if (!src) return;

      // animación simple de opacidad
      if (animate) {
        imgEl.style.opacity = .15;
        imgEl.style.transition = 'opacity .18s';
        requestAnimationFrame(() => { imgEl.style.opacity = 1; });
        setTimeout(() => { imgEl.style.transition = ''; }, 220);
      }

      imgEl.src = src;
      imgEl.alt = alt || '';
      capEl.textContent = alt || '';
    }

    // 7) Delegación: abrir desde cada galería
    galleries.forEach(gal => {
      gal.addEventListener('click', (e) => {
        const target = e.target;
        if (!target || target.tagName !== 'IMG') return;

        const imgs  = Array.from(gal.querySelectorAll('img'));
        const items = imgs.map(img => ({
          src: img.currentSrc || img.src,
          alt: img.alt || ''
        }));
        const idx = imgs.indexOf(target);
        if (idx === -1) return;

        openLightbox(items, idx);
      });
    });

    // 8) Controles (evitar burbujeo para que no cierre el overlay)
    btnClose.addEventListener('click', (e)=>{ e.stopPropagation(); closeLightbox(); });
    btnPrev .addEventListener('click', (e)=>{ e.stopPropagation(); go(-1); });
    btnNext .addEventListener('click', (e)=>{ e.stopPropagation(); go(1);  });
    stage   .addEventListener('click', (e)=>{ e.stopPropagation(); }); // clic dentro no cierra

    // 9) Cerrar al hacer clic en el fondo/overlay
    lightbox.addEventListener('click', () => { closeLightbox(); });

    // 10) Teclado
    document.addEventListener('keydown', (e)=>{
      if (!lightbox.classList.contains('open')) return;
      const k = e.key;
      if (k === 'Escape') { e.preventDefault(); closeLightbox(); }
      if (k === 'ArrowRight') { e.preventDefault(); go(1); }
      if (k === 'ArrowLeft')  { e.preventDefault(); go(-1); }
    });

    // 11) Swipe móvil básico
    lightbox.addEventListener('touchstart', (e)=>{
      if (!lightbox.classList.contains('open')) return;
      startX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : 0;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e)=>{
      if (!lightbox.classList.contains('open')) return;
      const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : 0;
      const dx = endX - startX;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // Ejecuta cuando el DOM esté listo (evita null si el script se carga en <head>)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();








