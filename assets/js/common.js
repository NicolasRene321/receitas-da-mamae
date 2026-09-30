/* ==========================================================================
   Receitas da Mamãe — utilidades compartilhadas
   ========================================================================== */

const SITE = {
  nome: 'Receitas da Mamãe',
  autora: 'Mamãe',
  atualizado: '20/09/2026'
};

/* --------------------------------------------------- paleta por receita */
/* Cada bolo ganha uma arte própria, colorida pelo sabor. */
const SABORES = {
  'bolo-de-beterraba':                { base: '#b8275f', topo: '#5c3222', cat: 'Legumes' },
  'bolo-ao-rum':                      { base: '#cf9147', topo: '#e8d5ab', cat: 'Clássicos' },
  'bolo-de-maca-com-canela':          { base: '#d4913f', topo: '#f0dcb4', cat: 'Frutas' },
  'bolo-branco':                      { base: '#e9dcc7', topo: '#fdf6ea', cat: 'Clássicos' },
  'bolo-caseiro-com-passas':          { base: '#b5793e', topo: '#6b4526', cat: 'Clássicos' },
  'bolo-de-cenoura-com-chocolate':    { base: '#e8853a', topo: '#4f2d1c', cat: 'Chocolate' },
  'bolo-de-chocolate':                { base: '#6b3a24', topo: '#3b1f13', cat: 'Chocolate' },
  'bolo-caipira':                     { base: '#e3b23c', topo: '#f4dc98', cat: 'Milho e fubá' },
  'bolo-capim-santo':                 { base: '#94ad55', topo: '#f3ecd6', cat: 'Clássicos' },
  'bolo-cha-de-maca':                 { base: '#c9853f', topo: '#eddcb8', cat: 'Frutas' },
  'bolo-com-maca':                    { base: '#d19a46', topo: '#f2e0bb', cat: 'Frutas' },
  'bolo-com-sorvete':                 { base: '#7b4b33', topo: '#f7e9dd', cat: 'Chocolate' },
  'bolo-de-mandioca':                 { base: '#ddbc86', topo: '#f0cf8f', cat: 'Legumes' },
  'bolo-de-milho':                    { base: '#ebb83a', topo: '#f7e6b5', cat: 'Milho e fubá' },
  'bolo-cookie-de-coco':              { base: '#8a6142', topo: '#f5ead8', cat: 'Coco' },
  'bolo-cowboy':                      { base: '#a9713f', topo: '#e3c79c', cat: 'Frutas' },
  'bolo-cremogema':                   { base: '#f0c64e', topo: '#fbf0d2', cat: 'Cremosos' },
  'bolo-creme':                       { base: '#5e4032', topo: '#f6ead9', cat: 'Chocolate' },
  'bolo-de-morango':                  { base: '#e5476b', topo: '#ffe0e7', cat: 'Frutas' },
  'bolo-de-ricota-com-canela':        { base: '#e0c49b', topo: '#c98b48', cat: 'Cremosos' },
  'bolo-cremoso':                     { base: '#e6c25a', topo: '#f6e6b8', cat: 'Milho e fubá' },
  'bolo-cremoso-de-banana':           { base: '#e8c25c', topo: '#d9a24a', cat: 'Frutas' },
  'bolo-cremoso-de-batata-doce':      { base: '#d98c5f', topo: '#f0c9a8', cat: 'Legumes' },
  'bolo-cremoso-de-cereja-com-ricota':{ base: '#c62b48', topo: '#f3e2c4', cat: 'Cremosos' },
  'bolo-cremoso-de-coco':             { base: '#f0e2cc', topo: '#ffffff', cat: 'Coco' },
  'bolo-formigueiro':                 { base: '#e2cfa4', topo: '#f2e6c9', cat: 'Chocolate', confeito: '#3f2717', confeitos: 34 }
};

const CATEGORIAS = ['Todos', 'Chocolate', 'Frutas', 'Coco', 'Milho e fubá', 'Cremosos', 'Legumes', 'Clássicos'];

function sabor(id) {
  return SABORES[id] || { base: '#d9a24a', topo: '#f2e0bb', cat: 'Clássicos' };
}

/* ------------------------------------------------------------ cores aux */

function clareia(hex, p) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round((n >> 16) + (255 - (n >> 16)) * p));
  const g = Math.min(255, Math.round(((n >> 8) & 255) + (255 - ((n >> 8) & 255)) * p));
  const b = Math.min(255, Math.round((n & 255) + (255 - (n & 255)) * p));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function escurece(hex, p) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round((n >> 16) * (1 - p));
  const g = Math.round(((n >> 8) & 255) * (1 - p));
  const b = Math.round((n & 255) * (1 - p));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* --------------------------------------------------------- arte do bolo */
/* Bolo de fôrma com buraco no meio, em perspectiva, com calda escorrendo. */

function arteBolo(id, opts) {
  opts = opts || {};
  const largo = !!opts.largo;          // quadro 620x300 para o topo da receita (16:9)
  const OX = largo ? -110 : 0;
  const LG = largo ? 620 : 400;
  const seed = opts.seed;
  const s = sabor(id);
  const base = s.base;
  const glace = s.topo;
  const n = (seed === undefined ? hashId(id) : seed);
  // id determinístico: mesma arte em todo carregamento (facilita comparar screenshots)
  arteBolo._i = (arteBolo._i || 0) + 1;
  const uid = 'a' + Math.abs(n).toString(36) + '_' + arteBolo._i;

  const fundoA = clareia(base, 0.84);
  const fundoB = clareia(base, 0.62);
  const massaA = clareia(base, 0.18);
  const massaB = escurece(base, 0.22);
  const lado = escurece(base, 0.34);

  // calda escorrendo pela lateral, em pingos de comprimento variável
  let pingos = '';
  for (let i = 0; i < 13; i++) {
    const frac = (i + 0.5) / 13;
    const x = 200 + Math.cos(Math.PI * (1 - frac)) * -152;
    const yBorda = 128 + Math.sin(Math.PI * frac) * 44;
    const h = 14 + ((n >> (i % 12)) & 7) * 5;      // comprimento do pingo
    const w = 7 + ((n >> (i % 9)) & 3) * 2;         // metade da largura
    // "língua" de calda: lados retos e ponta arredondada
    pingos += `<path d="M${(x - w).toFixed(1)} ${(yBorda - 14).toFixed(1)}
      v${h} a${w} ${w * 0.9} 0 0 0 ${w * 2} 0 v${-h} z" fill="${glace}"/>`;
  }

  // confeitos sobre a calda
  const corConfeito = s.confeito || escurece(base, 0.5);
  const qtdConfeitos = s.confeitos || 16;
  let confeitos = '';
  for (let i = 0; i < qtdConfeitos; i++) {
    const a = (i * 137.5 + n) % 360;
    const rad = (a * Math.PI) / 180;
    const dist = 0.35 + ((n >> (i % 10)) & 3) / 4.4;
    const rx = 200 + Math.cos(rad) * 140 * dist;
    const ry = 118 + Math.sin(rad) * 42 * dist;
    confeitos += `<ellipse cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" rx="3.4" ry="2.2" fill="${corConfeito}" opacity="0.6"/>`;
  }

  return `<svg viewBox="${OX} 0 ${LG} 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg${uid}" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${fundoA}"/><stop offset="1" stop-color="${fundoB}"/>
    </linearGradient>
    <linearGradient id="md${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${massaA}"/><stop offset="1" stop-color="${massaB}"/>
    </linearGradient>
    <linearGradient id="gl${uid}" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="${clareia(glace, 0.34)}"/>
      <stop offset="0.55" stop-color="${glace}"/>
      <stop offset="1" stop-color="${escurece(glace, 0.14)}"/>
    </linearGradient>
  </defs>

  <rect x="${OX}" y="0" width="${LG}" height="300" fill="url(#bg${uid})"/>
  <circle cx="${OX + 54}" cy="46" r="48" fill="#fff" opacity="0.24"/>
  <circle cx="${OX + LG - 48}" cy="36" r="30" fill="#fff" opacity="0.18"/>
  <circle cx="${OX + LG - 28}" cy="256" r="58" fill="${escurece(base, 0.1)}" opacity="0.1"/>

  <!-- prato -->
  <ellipse cx="200" cy="238" rx="172" ry="35" fill="${escurece(base, 0.5)}" opacity="0.14"/>
  <ellipse cx="200" cy="230" rx="164" ry="32" fill="${clareia(base, 0.9)}"/>
  <ellipse cx="200" cy="225" rx="164" ry="32" fill="#fff"/>

  <!-- corpo do bolo -->
  <path d="M48 126 v72 a152 44 0 0 0 304 0 v-72 z" fill="url(#md${uid})"/>
  <path d="M48 126 v72 a152 44 0 0 0 46 31 v-100 z" fill="${lado}" opacity="0.3"/>
  <path d="M306 126 v103 a152 44 0 0 0 46 -31 v-72 z" fill="#fff" opacity="0.13"/>
  <ellipse cx="200" cy="126" rx="152" ry="44" fill="${clareia(base, 0.34)}"/>

  <!-- calda por cima -->
  ${pingos}
  <ellipse cx="200" cy="118" rx="152" ry="44" fill="url(#gl${uid})"/>
  <ellipse cx="146" cy="99" rx="54" ry="11" fill="#fff" opacity="0.15"/>
  ${confeitos}

  <!-- buraco do meio -->
  <ellipse cx="200" cy="120" rx="52" ry="16" fill="${escurece(base, 0.55)}"/>
  <ellipse cx="200" cy="117" rx="52" ry="16" fill="${escurece(glace, 0.3)}"/>
  <ellipse cx="200" cy="114" rx="45" ry="13" fill="${escurece(base, 0.62)}" opacity="0.75"/>
</svg>`;
}

function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

/* ------------------------------------------------------------- ícones */

const ICO = {
  relogio: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  prato: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M3 11h18M5 11a7 7 0 0 1 14 0M12 4v-1"/><path d="M4 11a8 8 0 0 0 16 0"/></svg>',
  estrela: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6"/></svg>',
  checkCirc: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.6 2.6L16 9.5"/></svg>',
  seta: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  lupa: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>',
  coracao: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20z"/></svg>',
  impressora: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 9V3h10v6M7 19H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="7" y="15" width="10" height="6" rx="1"/></svg>',
  fogo: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"><path d="M12 22c4 0 6.5-2.7 6.5-6.2 0-4.6-4.6-6-4.3-10.8-2.6 1.3-4 3.6-4 6 0 1.6-1 2.2-1.8 1.4-.7-.7-.9-1.8-.9-1.8-1.3 1.5-2 3.4-2 5.2C5.5 19.3 8 22 12 22z"/></svg>',
  lampada: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M9.5 18h5M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.1 1 1.6h5c.1-.5.4-1.1 1-1.6A6 6 0 0 0 12 3z"/></svg>',
  geladeira: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M6 10h12M9 6v2M9 13.5v3"/></svg>',
  lua: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>'
};

/* ------------------------------------------------------- header/footer */

function montaHeader(ativo) {
  const cats = CATEGORIAS.filter(c => c !== 'Todos');
  return `
  <header class="topbar">
    <div class="wrap topbar__row">
      <a class="brand" href="index.html">
        <span class="brand__mark">R</span>
        <span class="brand__name">receitas da mamãe</span>
      </a>
      <nav class="nav">
        <a href="index.html" class="${ativo === 'home' ? 'is-active' : ''}">todos os bolos</a>
        ${cats.map(c => `<a href="index.html#cat=${encodeURIComponent(c)}">${c.toLowerCase()}</a>`).join('')}
      </nav>
      <div class="topbar__tools">
        <label class="searchpill">
          <span style="color:var(--muted);display:flex">${ICO.lupa}</span>
          <input type="search" id="buscaTopo" placeholder="buscar um bolo..." aria-label="Buscar receita">
        </label>
        <button class="iconbtn" id="btnTema" title="Alternar tema" aria-label="Alternar tema">${ICO.lua}</button>
      </div>
    </div>
  </header>`;
}

function montaFooter() {
  const cats = CATEGORIAS.filter(c => c !== 'Todos');
  return `
  <footer class="footer">
    <div class="wrap">
      <div class="footer__grid">
        <div>
          <a class="brand" href="index.html">
            <span class="brand__mark">R</span>
            <span class="brand__name">receitas da mamãe</span>
          </a>
          <p>As receitas de bolo do caderno da minha mãe, digitalizadas para não se perderem.
             Todas de liquidificador, todas testadas na cozinha de casa.</p>
        </div>
        <div>
          <h4>categorias</h4>
          <ul>${cats.map(c => `<li><a href="index.html#cat=${encodeURIComponent(c)}">${c}</a></li>`).join('')}</ul>
        </div>
        <div>
          <h4>o caderno</h4>
          <ul>
            <li><a href="index.html">Todas as receitas</a></li>
            <li><a href="index.html#lista">Buscar por ingrediente</a></li>
            <li><a href="#" onclick="window.print();return false">Imprimir</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bar">
        <span>Feito com carinho para a família · ${new Date().getFullYear()}</span>
        <span>Receitas originais da revista Puro Sabor</span>
      </div>
    </div>
  </footer>`;
}

/* --------------------------------------------------------------- tema */

function iniciaTema() {
  // claro por padrão (é a cara do site); o escuro fica no botão, para quem quiser
  const salvo = (() => { try { return localStorage.getItem('tema'); } catch (e) { return null; } })();
  let tema = salvo === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', tema);

  const btn = document.getElementById('btnTema');
  if (!btn) return;
  btn.addEventListener('click', () => {
    tema = tema === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', tema);
    try { localStorage.setItem('tema', tema); } catch (e) {}
  });
}

/* ------------------------------------------------------------- helpers */

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function slugBusca(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function estrelasHTML(n) {
  return `<span class="stars">${ICO.estrela.repeat(n)}</span>`;
}

/* ------------------------------------------------------------- tempos */

/* "1h (+2h de geladeira)" -> { base: "1h", extra: "+2h de geladeira" } */
function partesTempo(t) {
  return {
    base: t.split('(')[0].trim(),
    extra: (t.match(/\(([^)]+)\)/) || [])[1] || null
  };
}

/* "1h20" -> 80 ; "50min" -> 50 */
function emMinutos(base) {
  let m = base.match(/^(\d+)\s*h\s*(\d+)?$/i);
  if (m) return (+m[1]) * 60 + (+(m[2] || 0));
  m = base.match(/^(\d+)\s*min$/i);
  if (m) return +m[1];
  return 0;
}

/* 80 -> "1h20" */
function deMinutos(n) {
  if (n <= 0) return '—';
  if (n < 60) return n + 'min';
  const h = Math.floor(n / 60), r = n % 60;
  return r ? h + 'h' + String(r).padStart(2, '0') : h + 'h';
}

/* tempo de forno/fogão declarado no preparo ("por 30 minutos") */
function minutosDeForno(preparo) {
  const m = preparo.match(/por\s+(\d+)\s+minutos/i);
  return m ? +m[1] : 0;
}

/* nota "estável" por receita, só para decoração */
function notaDe(id) {
  const h = Math.abs(hashId(id));
  return (4.4 + (h % 6) / 10).toFixed(1);
}
function avaliacoesDe(id) {
  return 40 + (Math.abs(hashId(id)) % 260);
}
