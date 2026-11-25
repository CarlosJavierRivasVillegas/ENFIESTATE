/* ENFIESTATE Caquetá: interacciones de la página (sin librerías). */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORES = ['#991dae', '#1cbbfd', '#fe9f01', '#afd303', '#f5c602', '#fc2122', '#ffffff', '#ff5fa8'];
  const azar = (a, b) => a + Math.random() * (b - a);
  const elige = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Enlaces de WhatsApp con mensaje listo ---------- */
  const WA = 'https://wa.me/573213322252';
  $$('[data-wa]').forEach((a) => { a.href = `${WA}?text=${encodeURIComponent(a.dataset.wa)}`; });

  /* ---------- Navegación ---------- */
  const nav = $('#nav');
  const alScroll = () => nav.classList.toggle('solida', window.scrollY > 40);
  alScroll();
  window.addEventListener('scroll', alScroll, { passive: true });

  const enlaces = $$('.nav__links a');
  const secciones = enlaces.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const ioNav = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        enlaces.forEach((a) => a.classList.toggle('activo', a.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secciones.forEach((s) => ioNav.observe(s));
  }

  // Menú móvil
  const botonMenu = $('.menu-btn');
  const menu = $('#menu');
  let cierreMenu;
  const abrirMenu = () => {
    clearTimeout(cierreMenu);
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('abierto')));
    botonMenu.setAttribute('aria-expanded', 'true');
    botonMenu.setAttribute('aria-label', 'Cerrar menú');
    document.body.classList.add('menu-abierto');
  };
  const cerrarMenu = () => {
    menu.classList.remove('abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
    botonMenu.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('menu-abierto');
    cierreMenu = setTimeout(() => { menu.hidden = true; }, 560);
  };
  botonMenu.addEventListener('click', () => (botonMenu.getAttribute('aria-expanded') === 'true' ? cerrarMenu() : abrirMenu()));
  $$('a', menu).forEach((a) => a.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) cerrarMenu(); });

  /* ---------- Titular del inicio: cada palabra entra saltando ---------- */
  const titulo = $('.hero__titulo');
  if (titulo && !quieto) {
    let i = 0;
    const piezas = [];
    const palabra = (contenido) => {
      const s = document.createElement('span');
      s.className = 'p';
      s.style.setProperty('--i', i++);
      if (typeof contenido === 'string') s.textContent = contenido; else s.appendChild(contenido);
      return s;
    };
    [...titulo.childNodes].forEach((nodo) => {
      if (nodo.nodeType === Node.TEXT_NODE) {
        nodo.textContent.split(/(\s+)/).forEach((parte) => {
          if (!parte) return;
          piezas.push(/^\s+$/.test(parte) ? document.createTextNode(' ') : palabra(parte));
        });
      } else {
        piezas.push(palabra(nodo.cloneNode(true)));
      }
    });
    titulo.replaceChildren(...piezas);
  }

  /* ---------- Banderines ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const pintarBanderines = (el) => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    const caida = h * 0.32;
    const anchoBandera = w < 600 ? 28 : 38;
    const altoBandera = h * 0.62;
    const n = Math.max(6, Math.floor(w / (anchoBandera + 8)));
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    const cuerda = document.createElementNS(NS, 'path');
    cuerda.setAttribute('d', `M0 3 Q ${w / 2} ${3 + caida * 2} ${w} 3`);
    cuerda.setAttribute('fill', 'none');
    cuerda.setAttribute('stroke', 'rgba(255,255,255,.75)');
    cuerda.setAttribute('stroke-width', '2');
    svg.appendChild(cuerda);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const x = t * w;
      const y = 3 + 4 * t * (1 - t) * caida;
      const p = document.createElementNS(NS, 'polygon');
      p.setAttribute('points', `${x - anchoBandera / 2},${y} ${x + anchoBandera / 2},${y} ${x},${y + altoBandera}`);
      p.setAttribute('fill', COLORES[k % COLORES.length]);
      p.setAttribute('stroke', '#2b0f3a');
      p.setAttribute('stroke-width', '2');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('class', 'bandera');
      p.style.animationDelay = `${(-Math.random() * 2.8).toFixed(2)}s`;
      svg.appendChild(p);
    }
    el.replaceChildren(svg);
  };
  const banderines = $$('.banderines');
  const pintarTodos = () => banderines.forEach(pintarBanderines);
  pintarTodos();
  let esperaResize;
  let anchoPrevio = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === anchoPrevio) return;
    anchoPrevio = window.innerWidth;
    clearTimeout(esperaResize);
    esperaResize = setTimeout(pintarTodos, 150);
  });

  /* ---------- Marquesina: repite el texto para que el giro no tenga cortes ---------- */
  $$('.banda').forEach((banda) => {
    const pista = $('.banda__pista', banda);
    const original = pista.innerHTML;
    const veces = Math.max(1, Math.ceil(banda.clientWidth / Math.max(1, pista.scrollWidth)));
    pista.innerHTML = original.repeat(veces * 2);
  });

  /* ---------- Globos que siguen un poco al mouse ---------- */
  const hero = $('.hero');
  if (hero && !quieto && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  }

  /* ---------- Lluvia de confeti (inicio y contacto) ---------- */
  const lluvia = (canvas, cantidad) => {
    const ctx = canvas.getContext('2d');
    let w = 0; let h = 0; let activo = false; let id = 0;
    const piezas = [];
    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const nueva = (alInicio) => ({
      x: azar(0, w), y: alInicio ? azar(0, h) : azar(-40, -10),
      s: azar(6, 12), vy: azar(0.5, 1.5), vx: azar(-0.25, 0.25),
      r: azar(0, 6.28), vr: azar(-0.06, 0.06), fase: azar(0, 6.28),
      c: elige(COLORES), circulo: Math.random() < 0.3,
    });
    const cuadro = () => {
      ctx.clearRect(0, 0, w, h);
      piezas.forEach((p, k) => {
        p.fase += 0.03; p.y += p.vy; p.x += p.vx + Math.sin(p.fase) * 0.45; p.r += p.vr;
        if (p.y > h + 20) piezas[k] = nueva(false);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.85;
        if (p.circulo) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.6, 0, 6.28); ctx.fill(); }
        else { ctx.scale(1, Math.cos(p.fase * 2)); ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
        ctx.restore();
      });
      if (activo) id = requestAnimationFrame(cuadro);
    };
    medir();
    for (let k = 0; k < cantidad; k++) piezas.push(nueva(true));
    window.addEventListener('resize', medir);
    new IntersectionObserver(([e]) => {
      activo = e.isIntersecting && !document.hidden;
      cancelAnimationFrame(id);
      if (activo) id = requestAnimationFrame(cuadro);
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(id);
      activo = !document.hidden && canvas.getBoundingClientRect().bottom > 0 && canvas.getBoundingClientRect().top < window.innerHeight;
      if (activo) id = requestAnimationFrame(cuadro);
    });
  };
  if (!quieto && 'IntersectionObserver' in window) {
    const movil = window.innerWidth < 700;
    const cHero = $('.hero__confeti');
    const cContacto = $('.contacto__confeti');
    if (cHero) lluvia(cHero, movil ? 28 : 60);
    if (cContacto) lluvia(cContacto, movil ? 18 : 36);
  }

  /* ---------- Explosión de confeti al tocar un botón de cotizar ---------- */
  const fx = $('.fx');
  const fxCtx = fx.getContext('2d');
  const chispas = [];
  let fxId = 0;
  const medirFx = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fx.width = window.innerWidth * dpr; fx.height = window.innerHeight * dpr;
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  medirFx();
  window.addEventListener('resize', medirFx);
  const animarFx = () => {
    fxCtx.clearRect(0, 0, fx.width, fx.height);
    for (let k = chispas.length - 1; k >= 0; k--) {
      const p = chispas[k];
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.28; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vida--;
      if (p.vida <= 0) { chispas.splice(k, 1); continue; }
      fxCtx.save();
      fxCtx.globalAlpha = Math.min(1, p.vida / 30);
      fxCtx.translate(p.x, p.y); fxCtx.rotate(p.r);
      fxCtx.fillStyle = p.c;
      fxCtx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      fxCtx.restore();
    }
    fxId = chispas.length ? requestAnimationFrame(animarFx) : 0;
  };
  const explotar = (x, y) => {
    for (let k = 0; k < 80; k++) {
      const ang = -Math.PI / 2 + azar(-1.1, 1.1);
      const vel = azar(5, 13);
      chispas.push({ x, y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, r: azar(0, 6.28), vr: azar(-0.3, 0.3), s: azar(7, 12), c: elige(COLORES), vida: azar(70, 120) });
    }
    if (!fxId) fxId = requestAnimationFrame(animarFx);
  };
  if (!quieto) {
    document.addEventListener('click', (e) => {
      const b = e.target.closest('.js-confeti');
      if (!b) return;
      const r = b.getBoundingClientRect();
      explotar(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  const fotos = $$('.foto');
  if ('IntersectionObserver' in window) {
    const ioRv = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        ioRv.unobserve(el);
        if (el.classList.contains('foto')) {
          el.classList.remove('espera');
          el.style.animationDelay = `${(fotos.indexOf(el) % 3) * 90}ms`;
          el.classList.add('aparece');
          return;
        }
        el.classList.add('in');
        if (el.classList.contains('rv')) {
          // Al terminar, quita las clases de aparición para que el hover use sus propias transiciones.
          const d = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
          setTimeout(() => el.classList.remove('rv', 'rv--pop'), 1300 + d * 110);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.rv, .pasos-caja').forEach((el) => ioRv.observe(el));
    if (!quieto) fotos.forEach((f) => { f.classList.add('espera'); ioRv.observe(f); });
  } else {
    $$('.rv').forEach((el) => el.classList.add('in'));
    $$('.pasos-caja').forEach((el) => el.classList.add('in'));
  }

  /* ---------- Precios que cuentan hacia arriba ---------- */
  const formato = new Intl.NumberFormat('es-CO');
  const precios = $$('[data-precio]');
  if (!quieto && 'IntersectionObserver' in window) {
    const ioPrecio = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        ioPrecio.unobserve(e.target);
        const el = e.target;
        const meta = Number(el.dataset.precio);
        const dur = 1300;
        let inicio = 0;
        el.textContent = '$0';
        const paso = (t) => {
          if (!inicio) inicio = t;
          const k = Math.min(1, (t - inicio) / dur);
          const v = Math.round((meta * (1 - Math.pow(1 - k, 3))) / 1000) * 1000;
          el.textContent = `$${formato.format(v)}`;
          if (k < 1) requestAnimationFrame(paso);
        };
        setTimeout(() => requestAnimationFrame(paso), 250);
      });
    }, { threshold: 0.6 });
    precios.forEach((p) => ioPrecio.observe(p));
  }

  /* ---------- Filtros de la galería ---------- */
  const filtros = $$('.filtro');
  filtros.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filtro;
    filtros.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    let n = 0;
    fotos.forEach((el) => {
      const entra = f === 'todo' || el.dataset.cat.split(' ').includes(f);
      el.classList.remove('espera');
      el.classList.toggle('oculta', !entra);
      if (entra) {
        el.classList.remove('aparece');
        void el.offsetWidth; // reinicia la animación
        el.style.animationDelay = quieto ? '0ms' : `${n++ * 60}ms`;
        el.classList.add('aparece');
      }
    });
  }));

  /* ---------- Visor de imágenes ---------- */
  const visor = $('#visor');
  const visorImg = $('.lb__img', visor);
  const cuenta = $('.lb__cuenta', visor);
  let grupo = [];
  let actual = 0;
  const textoAlt = (a) => {
    const im = $('img', a);
    if (im && im.alt) return im.alt;
    const plan = a.closest('.plan');
    if (plan) return `Flyer del Plan ${$('h3', plan).textContent}`;
    return 'Flyer de ENFIESTATE';
  };
  const mostrar = () => {
    const a = grupo[actual];
    visorImg.style.animation = 'none';
    void visorImg.offsetWidth;
    visorImg.style.animation = '';
    visorImg.src = a.getAttribute('href');
    visorImg.alt = textoAlt(a);
    cuenta.textContent = `${actual + 1} de ${grupo.length}`;
    visor.classList.toggle('solo', grupo.length < 2);
  };
  const mover = (d) => { if (grupo.length < 2) return; actual = (actual + d + grupo.length) % grupo.length; mostrar(); };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-lb]');
    if (!a || typeof visor.showModal !== 'function') return;
    e.preventDefault();
    grupo = $$(`[data-lb="${a.dataset.lb}"]`).filter((x) => !x.classList.contains('oculta'));
    actual = Math.max(0, grupo.indexOf(a));
    mostrar();
    visor.showModal();
    document.body.style.overflow = 'hidden';
  });
  $('.lb__cerrar', visor).addEventListener('click', () => visor.close());
  $('.lb__prev', visor).addEventListener('click', () => mover(-1));
  $('.lb__next', visor).addEventListener('click', () => mover(1));
  visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
  visor.addEventListener('close', () => { document.body.style.overflow = ''; });
  visor.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mover(-1);
    if (e.key === 'ArrowRight') mover(1);
  });
  let toqueX = null;
  visor.addEventListener('touchstart', (e) => { toqueX = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener('touchend', (e) => {
    if (toqueX === null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
    toqueX = null;
  });

  /* ---------- Saludo del botón flotante ---------- */
  const fab = $('.fab');
  if (fab) {
    setTimeout(() => {
      fab.classList.add('saluda');
      setTimeout(() => fab.classList.remove('saluda'), 5000);
    }, 4500);
  }
})();
