/* ==========================================================================
   Página da receita — layout inspirado no site de referência
   ========================================================================== */

(function () {
  const receitas = window.RECEITAS.receitas;

  const id = new URLSearchParams(location.search).get('id');
  const r = receitas.find(x => x.id === id) || receitas[0];

  document.title = r.nome + ' — ' + SITE.nome;
  document.getElementById('header').innerHTML = montaHeader('');
  document.getElementById('footer').innerHTML = montaFooter();
  iniciaTema();

  const s = sabor(r.id);

  /* ====================================================== escala de porções */

  const UNI_PLURAL = {
    'xícara': 'xícaras', 'colher': 'colheres', 'ovo': 'ovos', 'lata': 'latas',
    'vidro': 'vidros', 'copo': 'copos', 'talo': 'talos', 'gema': 'gemas',
    'caixa': 'caixas', 'pacote': 'pacotes', 'pitada': 'pitadas',
    'banana': 'bananas', 'maçã': 'maçãs', 'cenoura': 'cenouras', 'litro': 'litros'
  };
  const UNI_SINGULAR = Object.fromEntries(Object.entries(UNI_PLURAL).map(([a, b]) => [b, a]));

  /* frações de cozinha: o suficiente para cair sempre numa medida usável */
  const FRACOES = [
    [1 / 8, '1/8'], [1 / 6, '1/6'], [1 / 4, '1/4'], [1 / 3, '1/3'], [3 / 8, '3/8'],
    [1 / 2, '1/2'], [5 / 8, '5/8'], [2 / 3, '2/3'], [3 / 4, '3/4'], [5 / 6, '5/6'], [7 / 8, '7/8']
  ];

  /* unidades que pedem "de" antes quando a quantidade é só uma fração */
  const PEDE_DE = new RegExp('^(xícaras?|copos?|latas?|vidros?|litros?|caixas?|pacotes?)', 'iu');

  /* coisas que não se quebram ao meio: sempre número inteiro */
  const CONTAVEL = new RegExp('^(ovos?|bananas?|bananas-nanicas|maçãs?|cenouras?|talos?|latas?|vidros?|caixas?|pacotes?|gemas?|pitadas?)', 'iu');

  function formataQtd(v) {
    if (v <= 0) return '0';
    let inteiro = Math.floor(v + 1e-9);
    let resto = v - inteiro;

    if (resto > 0.94) { inteiro += 1; resto = 0; }   // 1,95 -> 2

    let frac = '';
    if (resto > 0.05) {
      let melhor = null, dist = 1;
      for (const [val, txt] of FRACOES) {
        const d = Math.abs(resto - val);
        if (d < dist) { dist = d; melhor = txt; }
      }
      frac = melhor;   // a lista é densa o bastante para nunca cair longe
    }

    if (inteiro && frac) return inteiro + ' e ' + frac;
    if (frac) return frac;
    return String(inteiro);
  }

  /* "3/4" + "xícara (chá) de óleo" -> "3/4 de xícara (chá) de óleo" */
  function juntaQtd(qtd, resto) {
    const soFracao = qtd.includes('/') && !qtd.includes(' e ');
    if (soFracao && !/^de\s/iu.test(resto) && PEDE_DE.test(resto.normalize('NFC'))) return qtd + ' de ' + resto;
    return qtd + ' ' + resto;
  }

  function ajustaUnidade(texto, qtd) {
    // pluraliza/singulariza a unidade logo após o número ("2 xícara" -> "2 xícaras")
    return texto.replace(/^((?:de\s+)?)([\wÀ-ÿ]+)/u, (m, de, palavra) => {
      const baixa = palavra.toLowerCase();
      if (qtd > 1.0001 && UNI_PLURAL[baixa]) return de + UNI_PLURAL[baixa];
      if (qtd <= 1.0001 && UNI_SINGULAR[baixa]) return de + UNI_SINGULAR[baixa];
      return m;
    });
  }

  function escala(linha, fator) {
    if (fator === 1) return linha;

    // "1 e 1/2 xícara"  |  "3/4 de xícara"  |  "2 xícaras"  |  "150g"  |  "1kg"
    let m = linha.match(/^(\d+)\s+e\s+(\d+)\/(\d+)\s*(.*)$/u);
    if (m) {
      const v = (+m[1] + (+m[2]) / (+m[3])) * fator;
      return juntaQtd(formataQtd(v), ajustaUnidade(m[4], v));
    }
    m = linha.match(/^(\d+)\/(\d+)\s*(.*)$/u);
    if (m) {
      const v = ((+m[1]) / (+m[2])) * fator;
      return juntaQtd(formataQtd(v), ajustaUnidade(m[3], v));
    }
    m = linha.match(/^(\d+)\s*(g|kg|ml|l)\b\s*(.*)$/iu);
    if (m) {
      const v = (+m[1]) * fator;
      const n = Number.isInteger(v) ? v : Math.round(v * 100) / 100;
      return String(n).replace('.', ',') + m[2] + ' ' + m[3];
    }
    m = linha.match(/^(\d+)\s+(.*)$/u);
    if (m) {
      let v = (+m[1]) * fator;
      if (CONTAVEL.test(m[2].normalize('NFC'))) v = Math.max(1, Math.round(v));
      return juntaQtd(formataQtd(v), ajustaUnidade(m[2], v));
    }
    return linha; // sem quantidade no início: deixa como está
  }


  /* ==================================================== divisão em passos */

  /* uma frase por passo; frases muito curtas grudam na anterior */
  function emPassos(texto) {
    const frases = texto.split(/(?<=\.)\s+/u).filter(f => f.trim());
    const passos = [];
    for (const f of frases) {
      if (passos.length && f.trim().length < 40) passos[passos.length - 1] += ' ' + f.trim();
      else passos.push(f.trim());
    }
    return passos;
  }

  /* ======================================================== tempos (tiles) */

  const T = partesTempo(r.tempo);
  const minTotal = emMinutos(T.base);
  const minForno = minutosDeForno(r.preparo);
  const minPreparo = minTotal && minForno && minTotal > minForno ? minTotal - minForno : 0;

  /* =============================================================== render */

  const grupos = [];
  grupos.push({ titulo: null, itens: r.ingredientes });
  if (r.cobertura) grupos.push({ titulo: 'Cobertura', itens: r.cobertura });
  if (r.calda) grupos.push({ titulo: 'Calda', itens: r.calda });

  const totalItens = grupos.reduce((n, g) => n + g.itens.length, 0);
  let porcoes = r.porcoes;

  const passos = emPassos(r.preparo);

  const outras = receitas.filter(x => x.id !== r.id);
  const mesmaCat = outras.filter(x => sabor(x.id).cat === s.cat);
  const populares = (mesmaCat.length >= 5 ? mesmaCat : outras)
    .slice(0, 6);
  const gostar = outras
    .filter(x => !populares.includes(x))
    .slice(Math.abs(hashId(r.id)) % 6, Math.abs(hashId(r.id)) % 6 + 3);

  document.getElementById('app').innerHTML = `
  <div class="wrap">
    <nav class="crumbs" aria-label="Você está aqui">
      <a href="index.html">receitas</a> <span>›</span>
      <a href="index.html#cat=${encodeURIComponent(s.cat)}">bolos · ${esc(s.cat.toLowerCase())}</a> <span>›</span>
      <span aria-current="page">${esc(r.nome.toLowerCase())}</span>
    </nav>

    <div class="layout">
      <!-- ================================================ coluna principal -->
      <div>
        <div class="rhero">
          ${arteBolo(r.id, { largo: true })}
          <div class="rhero__shade"></div>
          <h1 class="rhero__title">${esc(r.nome)}</h1>
        </div>

        <div class="metabar">
          <span class="metabar__item metabar__tested">
            ${ICO.checkCirc} Testado por <b>${SITE.autora}</b>
          </span>
          <span class="metabar__date">atualizado em ${SITE.atualizado}</span>
          <span class="metabar__item">${ICO.prato} ${r.porcoes} porções</span>
          <span class="metabar__item">${ICO.relogio} ${esc(T.base)}</span>
          <span class="metabar__item">
            ${estrelasHTML(5)}
            <span style="color:var(--muted);font-size:13px">${notaDe(r.id)} (${avaliacoesDe(r.id)})</span>
          </span>
        </div>

        <div class="actions">
          <button class="btn btn--ghost" id="btnSalvar">${ICO.coracao} salvar</button>
          <button class="btn btn--ghost" onclick="window.print()">${ICO.impressora} imprimir</button>
          <a class="btn btn--green" id="btnZap" target="_blank" rel="noopener">enviar por WhatsApp</a>
        </div>

        ${r.incompleto ? `
        <div class="alert">
          <span style="color:var(--red);flex-shrink:0">${ICO.lampada}</span>
          <span><b>Atenção:</b> ${esc(r.incompleto)}</span>
        </div>` : ''}

        <p class="intro">
          ${esc(r.nome)} é um bolo de liquidificador ${r.porcoes >= 16 ? 'bem rendoso' : 'para o dia a dia'} —
          rende <b>${r.porcoes} porções</b> e fica pronto em <b>${esc(T.base)}</b>${T.extra ? ` (${esc(T.extra)})` : ''}.
          Receita do caderno da mamãe, copiada exatamente como está na página.
        </p>

        <!-- ------------------------------------------------- ingredientes -->
        <section class="panel">
          <div class="blockhead">
            <h2 class="blocktitle">ingredientes</h2>
            <div class="stepper">
              <button id="menos" aria-label="Menos porções">−</button>
              <span class="stepper__val" id="porcoesVal">${r.porcoes} porções</span>
              <button id="mais" aria-label="Mais porções">+</button>
            </div>
          </div>

          <div class="progresso">
            <div class="progress"><div class="progress__bar" id="barra"></div></div>
            <span class="progresso__lbl" id="progLbl"></span>
          </div>

          <div id="ingredientes"></div>
        </section>

        <!-- ------------------------------------------------ modo de preparo -->
        <section class="panel">
          <h2 class="blocktitle" style="margin-bottom:18px">modo de preparo</h2>

          <div class="timetiles">
            <div class="tile">
              <div class="tile__val">${ICO.relogio} ${minPreparo ? deMinutos(minPreparo) : esc(T.base)}</div>
              <div class="tile__lbl">${minPreparo ? 'tempo de preparo' : 'tempo total'}</div>
            </div>
            <div class="tile">
              <div class="tile__val">${ICO.fogo} ${minForno ? deMinutos(minForno) : passos.length}</div>
              <div class="tile__lbl">${minForno ? 'tempo de forno' : 'passos'}</div>
            </div>
          </div>
          ${T.extra ? `<p class="tempoextra">
            <span>${ICO.geladeira}</span>
            <span><b>${esc(T.extra)}</b> — conte esse tempo à parte.</span>
          </p>` : ''}

          <ol class="steps">
            ${passos.map((p, i) => `
            <li>
              <span class="steps__n">${i + 1}</span>
              <p>${esc(p)}</p>
            </li>`).join('')}
          </ol>
        </section>

        <!-- ------------------------------------------------------ avaliação -->
        <section class="panel rate">
          <h3>como ficou essa receita?</h3>
          <p>toque nas estrelas para avaliar</p>
          <div class="rate__stars" id="avaliar">
            ${[1, 2, 3, 4, 5].map(n => `<button data-n="${n}" aria-label="${n} estrelas">${ICO.estrela}</button>`).join('')}
          </div>
          <p id="avalMsg" style="margin:0">${notaDe(r.id)} de 5 · ${avaliacoesDe(r.id)} avaliações na família</p>
        </section>

        <!-- ------------------------------------------------------- anote aí -->
        <section class="panel notes">
          <h2>anote aí...</h2>

          <div class="note">
            <span class="note__ico">${ICO.lampada}</span>
            <div>
              <h4>Sugestões de acompanhamento</h4>
              <p>${esc(dicaAcompanha(r, s))}</p>
            </div>
          </div>

          <div class="note">
            <span class="note__ico">${ICO.geladeira}</span>
            <div>
              <h4>Conservação do bolo</h4>
              <p>Para manter a umidade, guarde o bolo em pote hermético ou sob um prato limpo,
                 conservando-o macio por três dias. Se preferir a geladeira, ele dura até cinco dias,
                 mas lembre-se de aquecer a fatia por alguns segundos para recuperar a textura.</p>
            </div>
          </div>

          ${r.dica ? `
          <div class="note">
            <span class="note__ico">${ICO.fogo}</span>
            <div>
              <h4>Dica da receita original</h4>
              <p>${esc(r.dica)}</p>
            </div>
          </div>` : ''}

          <div class="note">
            <span class="note__ico">${ICO.prato}</span>
            <div>
              <h4>De onde veio</h4>
              <p>Revista <b>Puro Sabor</b>, seção “Bolos simples de liquidificador”${r.pagina ? `, página ${r.pagina}` : ''} —
                 recortada e guardada no caderno de receitas da mamãe.</p>
            </div>
          </div>
        </section>
      </div>

      <!-- ========================================================= sidebar -->
      <aside class="side">
        <div class="sidebox">
          <h3>receitas populares</h3>
          <ul class="poplist">
            ${populares.map(p => `
            <li><a href="receita.html?id=${encodeURIComponent(p.id)}">
              <span class="thumb">${arteBolo(p.id)}</span>
              <span>
                <strong>${esc(p.nome)}</strong>
                <small>${esc(partesTempo(p.tempo).base)} · ${p.porcoes} porções</small>
              </span>
            </a></li>`).join('')}
          </ul>
        </div>

        <div class="sidebox sidebox--cta">
          <h3>o caderno inteiro</h3>
          <p>São ${receitas.length} bolos copiados do caderno. Dá para filtrar por chocolate,
             frutas, coco, fubá e mais.</p>
          <a class="btn btn--block" href="index.html">ver todas as receitas</a>
        </div>

        <div class="sidebox">
          <h3>você também pode gostar...</h3>
          <ul class="poplist">
            ${gostar.map(p => `
            <li><a href="receita.html?id=${encodeURIComponent(p.id)}">
              <span class="thumb">${arteBolo(p.id)}</span>
              <span>
                <strong>${esc(p.nome)}</strong>
                <small>${esc(sabor(p.id).cat)}</small>
              </span>
            </a></li>`).join('')}
          </ul>
        </div>
      </aside>
    </div>
  </div>`;

  /* ==================================================== ingredientes: UI */

  const alvoIng = document.getElementById('ingredientes');
  const barra = document.getElementById('barra');
  const marcados = new Set();

  function desenhaIngredientes() {
    const fator = porcoes / r.porcoes;
    let i = 0;
    alvoIng.innerHTML = grupos.map(g => {
      const lis = g.itens.map(item => {
        const k = i++;
        return `<li data-k="${k}" class="${marcados.has(k) ? 'is-done' : ''}">
          <span class="box">${ICO.check}</span>
          <span>${esc(escala(item, fator))}</span>
        </li>`;
      }).join('');
      return (g.titulo ? `<div class="sublist"><div class="sublist__title">${esc(g.titulo)}</div>` : '<div>') +
        `<ul class="ing">${lis}</ul></div>`;
    }).join('');
    pintaProgresso();
  }

  const progLbl = document.getElementById('progLbl');
  function pintaProgresso() {
    barra.style.width = (marcados.size / totalItens * 100) + '%';
    progLbl.textContent = marcados.size + ' de ' + totalItens + ' itens';
  }

  alvoIng.addEventListener('click', e => {
    const li = e.target.closest('li[data-k]');
    if (!li) return;
    const k = +li.dataset.k;
    marcados.has(k) ? marcados.delete(k) : marcados.add(k);
    li.classList.toggle('is-done');
    pintaProgresso();
  });

  const val = document.getElementById('porcoesVal');
  function setPorcoes(n) {
    porcoes = Math.max(1, n);
    val.textContent = porcoes + (porcoes === 1 ? ' porção' : ' porções');
    desenhaIngredientes();
  }
  const passo = r.porcoes >= 16 ? 4 : 2;
  document.getElementById('mais').onclick = () => setPorcoes(porcoes + passo);
  document.getElementById('menos').onclick = () => setPorcoes(porcoes - passo);

  desenhaIngredientes();

  /* ============================================================== ações */

  const btnSalvar = document.getElementById('btnSalvar');
  const chave = 'salvos';
  function lidos() { try { return JSON.parse(localStorage.getItem(chave) || '[]'); } catch (e) { return []; } }
  function pintaSalvar() {
    const on = lidos().includes(r.id);
    btnSalvar.innerHTML = ICO.coracao + (on ? ' salvo' : ' salvar');
    btnSalvar.style.color = on ? 'var(--red)' : '';
    btnSalvar.style.borderColor = on ? 'var(--red)' : '';
  }
  btnSalvar.onclick = () => {
    const l = lidos();
    const novo = l.includes(r.id) ? l.filter(x => x !== r.id) : l.concat(r.id);
    try { localStorage.setItem(chave, JSON.stringify(novo)); } catch (e) {}
    pintaSalvar();
  };
  pintaSalvar();

  const texto = `${r.nome}\n\nIngredientes:\n` +
    grupos.map(g => (g.titulo ? g.titulo + ':\n' : '') + g.itens.map(x => '• ' + x).join('\n')).join('\n\n') +
    `\n\nModo de preparo:\n${r.preparo}`;
  document.getElementById('btnZap').href = 'https://wa.me/?text=' + encodeURIComponent(texto);

  const caixaAval = document.getElementById('avaliar');
  const msgAval = document.getElementById('avalMsg');
  caixaAval.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const n = +b.dataset.n;
    [...caixaAval.children].forEach((x, i) => x.classList.toggle('is-on', i < n));
    msgAval.textContent = n === 5 ? 'Obrigado! Que bom que ficou bom 💛' : `Você deu ${n} de 5 estrelas.`;
  });

  /* dica de acompanhamento conforme o sabor */
  function dicaAcompanha(rec, sb) {
    const cat = sb.cat;
    if (cat === 'Chocolate') return 'Fica ótimo com um café coado forte ou um copo de leite gelado. Se sobrar, aqueça a fatia por 15 segundos no micro-ondas — a cobertura volta a ficar macia.';
    if (cat === 'Coco') return 'Combina com café preto sem açúcar e também com um chá de erva-doce. Uma colher de leite de coco por cima da fatia realça o sabor.';
    if (cat === 'Frutas') return 'Sirva morno no lanche da tarde, com chá preto ou de canela. Uma bola de sorvete de creme ao lado transforma o bolo em sobremesa.';
    if (cat === 'Milho e fubá') return 'Clássico da tarde: café com leite e um pedaço de queijo minas ao lado. Guarde coberto para não ressecar.';
    if (cat === 'Cremosos') return 'Por ser um bolo úmido, fica melhor gelado. Sirva em fatias pequenas com café ou com um chá leve.';
    if (cat === 'Legumes') return 'Aceita bem calda de chocolate ou só um polvilhado de açúcar de confeiteiro. Ótimo com café da manhã.';
    return 'Bom para o café da tarde em família. Acompanha bem café coado, chá ou um copo de leite.';
  }
})();
