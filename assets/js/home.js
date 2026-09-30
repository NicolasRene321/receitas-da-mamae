/* ==========================================================================
   Página inicial — vitrine com todos os bolos
   ========================================================================== */

(function () {
  const dados = window.RECEITAS;
  const receitas = dados.receitas;

  document.getElementById('header').innerHTML = montaHeader('home');
  document.getElementById('footer').innerHTML = montaFooter();
  iniciaTema();

  /* ------------------------------------------------------------- hero */

  document.getElementById('hero').innerHTML = `
  <section class="hero">
    <div class="wrap hero__inner">
      <span class="hero__eyebrow">${ICO.coracao} ${receitas.length} receitas do caderno</span>
      <h1>Os bolos da <em>mamãe</em>, todos num lugar só</h1>
      <p>Bolos simples de liquidificador que ela fez a vida inteira — copiados página por
         página do caderno para nunca mais se perderem. Escolha um e mãos à obra.</p>
      <label class="hero__search">
        <span style="color:var(--muted);display:flex">${ICO.lupa}</span>
        <input type="search" id="busca" placeholder="buscar por nome ou ingrediente..." aria-label="Buscar receita">
        <button class="btn btn--red" id="btnBusca">buscar</button>
      </label>
      <div class="chips" id="chips">
        ${CATEGORIAS.map((c, i) =>
          `<button class="chip ${i === 0 ? 'is-active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`
        ).join('')}
      </div>
    </div>
  </section>`;

  /* ------------------------------------------------------- estado/render */

  let filtroCat = 'Todos';
  let termo = '';

  const grid = document.getElementById('grid');
  const contador = document.getElementById('contador');

  function cardHTML(r) {
    const s = sabor(r.id);
    return `
    <a class="card" href="receita.html?id=${encodeURIComponent(r.id)}">
      <div class="card__art">
        ${arteBolo(r.id)}
        <span class="card__tag">${esc(s.cat)}</span>
      </div>
      <div class="card__body">
        <h3>${esc(r.nome)}</h3>
        <div class="card__meta">
          <span>${ICO.relogio} ${esc(partesTempo(r.tempo).base)}</span>
          <span>${ICO.prato} ${r.porcoes} porções</span>
        </div>
        <span class="card__cta">ver receita ${ICO.seta}</span>
      </div>
    </a>`;
  }

  function filtra() {
    const t = slugBusca(termo.trim());
    return receitas.filter(r => {
      if (filtroCat !== 'Todos' && sabor(r.id).cat !== filtroCat) return false;
      if (!t) return true;
      const alvo = slugBusca(
        r.nome + ' ' +
        (r.ingredientes || []).join(' ') + ' ' +
        (r.cobertura || []).join(' ') + ' ' +
        (r.calda || []).join(' ')
      );
      return alvo.includes(t);
    });
  }

  function render() {
    const lista = filtra();
    contador.textContent = lista.length === receitas.length
      ? `${receitas.length} receitas`
      : `${lista.length} de ${receitas.length} receitas`;

    grid.innerHTML = lista.length
      ? lista.map(cardHTML).join('')
      : `<div class="empty">
           <h3 style="margin-bottom:6px">Nenhum bolo com isso</h3>
           <p style="margin:0">Tente outro ingrediente — ou limpe a busca para ver os ${receitas.length}.</p>
         </div>`;
  }

  /* ------------------------------------------------------------ eventos */

  document.getElementById('chips').addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    filtroCat = b.dataset.cat;
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === b));
    render();
  });

  const inputBusca = document.getElementById('busca');
  inputBusca.addEventListener('input', () => { termo = inputBusca.value; render(); });
  document.getElementById('btnBusca').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('lista').scrollIntoView({ behavior: 'smooth' });
  });

  const topo = document.getElementById('buscaTopo');
  if (topo) {
    topo.addEventListener('input', () => {
      termo = topo.value;
      inputBusca.value = topo.value;
      render();
    });
  }

  /* categoria vinda do #hash (links do menu/rodapé) */
  function aplicaHash() {
    const m = location.hash.match(/cat=([^&]+)/);
    if (!m) return;
    const cat = decodeURIComponent(m[1]);
    if (!CATEGORIAS.includes(cat)) return;
    filtroCat = cat;
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.cat === cat));
    render();
    document.getElementById('lista').scrollIntoView({ behavior: 'smooth' });
  }
  window.addEventListener('hashchange', aplicaHash);

  render();
  aplicaHash();
})();
