# Arquitetura

**Fonte da verdade:** `data/receitas.json`. `assets/js/receitas-data.js` é **gerado** —
nunca edite à mão; qualquer alteração ali é perdida no próximo `build-data.js`.

Duas páginas, ambas montadas inteiramente por JS via `innerHTML` (o HTML é só a casca
com `#header`, `#app`/`#grid`, `#footer` e três `<script>` na ordem
`receitas-data.js` → `common.js` → página):

- `index.html` + `assets/js/home.js` — vitrine; busca por nome **ou ingrediente**,
  filtro por categoria via chips e via `#cat=<Categoria>` no hash (usado pelos links do
  menu e do rodapé).
- `receita.html?id=<id>` + `assets/js/receita.js` — uma receita. Sem id válido, cai na
  primeira receita.

`assets/js/common.js` é o módulo compartilhado (escopo global, sem bundler): header,
footer, tema, ícones SVG em `ICO`, helpers de tempo e o gerador de ilustrações.

## SABORES — o registro que acopla arte e categoria

`SABORES` em `common.js` mapeia `id` da receita → `{ base, topo, cat }`. Isso define
simultaneamente **as cores da ilustração SVG e a categoria** usada nos filtros, nas
breadcrumbs e nas recomendações da sidebar. A categoria **não** vem do JSON.

Uma receita sem entrada em `SABORES` continua funcionando, mas entra com a cor padrão
em "Clássicos" (ver `sabor()`). Ao adicionar uma receita nova, adicione também a entrada
aqui. `CATEGORIAS` é a lista fechada de filtros; uma `cat` fora dela some da navegação.

## Ilustrações

Não há imagens de bolo — `arteBolo(id, {largo})` devolve SVG inline gerado a partir de
`hashId(id)`, determinístico de propósito (a mesma arte em todo carregamento é o que
torna as screenshots comparáveis entre rodadas). `opts.largo` troca a viewBox para o
banner 16:9 do topo da receita; `clareia`/`escurece` derivam toda a paleta das duas
cores de `SABORES`.

## Escala de porções (`receita.js`)

O `+`/`−` recalcula as quantidades reescrevendo o **texto** de cada ingrediente:
`escala()` casa quatro formatos ("1 e 1/2 xícara", "3/4 de xícara", "150g", "2 ovos"),
`formataQtd()` arredonda para uma fração de cozinha usável, `ajustaUnidade()` pluraliza
e `juntaQtd()` insere o "de" ("3/4 **de** xícara"). Duas listas governam os casos
especiais: `CONTAVEL` (ovos, bananas — sempre inteiros) e `PEDE_DE`. Linha sem número
no início passa intacta. Ao mexer nisso, teste com receitas de frações variadas.

Outros textos derivados do conteúdo, não de campos do JSON: os passos numerados vêm de
`emPassos()` quebrando `preparo` por frase (frases < 40 caracteres grudam na anterior),
e o tempo de forno vem de `minutosDeForno()` procurando "por N minutos" no preparo.

## Decorativo, não real

Nota, número de avaliações (`notaDe`/`avaliacoesDe`) e as estrelas clicáveis são
enfeite derivado do hash do id — não há backend. Favoritos e tema ficam em
`localStorage`, sempre dentro de `try/catch` (o `file://` pode bloquear).
