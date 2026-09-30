# Receitas da Mamãe

Site das receitas de bolo do caderno da mamãe — 26 bolos de liquidificador
recortados da revista *Puro Sabor* e guardados no caderno.

É um site estático puro: **abra o `index.html` no navegador** e funciona,
sem servidor e sem instalar nada.

## Estrutura

```
index.html                  vitrine com todos os bolos (busca + filtros)
receita.html?id=<id>        página de uma receita
data/receitas.json          ← a fonte da verdade: todas as receitas
assets/css/style.css        estilo único do site
assets/js/common.js         header, rodapé, ilustrações dos bolos, utilitários
assets/js/home.js           lógica da página inicial
assets/js/receita.js        lógica da página de receita
assets/js/receitas-data.js  GERADO a partir do JSON — não edite à mão
tools/build-data.js         gera o arquivo acima
tools/shot.js               tira screenshots das páginas (Chrome headless)
tools/diag.js               aponta elementos que estouram a largura da tela
.shots/                     screenshots das rodadas de ajuste
```

## Adicionar ou corrigir uma receita

1. Edite `data/receitas.json`. Cada receita tem:

```json
{
  "id": "bolo-de-fuba",
  "nome": "Bolo de Fubá",
  "tempo": "1h",
  "porcoes": 12,
  "pagina": 9,
  "ingredientes": ["3 ovos", "..."],
  "cobertura": ["..."],
  "calda": ["..."],
  "preparo": "Texto corrido; o site quebra em passos numerados sozinho.",
  "dica": "opcional",
  "incompleto": "opcional — aviso mostrado no topo da receita"
}
```

2. Rode:

```bash
node tools/build-data.js
```

3. Se for um bolo novo, dê uma cor a ele em `assets/js/common.js`, no objeto
   `SABORES` — é o que define a ilustração e a categoria:

```js
'bolo-de-fuba': { base: '#e6c25a', topo: '#f6e6b8', cat: 'Milho e fubá' }
```

Sem isso o bolo continua funcionando, só entra com a cor padrão em "Clássicos".

## Conferir o visual

```bash
node tools/shot.js 8      # gera .shots/r8/*.png (desktop e telas estreitas)
node tools/diag.js 500    # lista o que estoura a largura em tela estreita
```

Observação: no Windows a janela mínima do Chrome é ~489px, então os prints
"mobile" são feitos a 500px de largura.

## Publicar

Como é estático, basta subir a pasta inteira em qualquer hospedagem —
GitHub Pages, Netlify, Vercel ou até uma pasta compartilhada. Não há build.

## O que o site faz

- Busca por nome **ou ingrediente** ("coco", "fubá", "banana")
- Filtro por categoria (também pelo menu do topo e pelo rodapé)
- **Ajuste de porções**: o `+`/`−` recalcula as quantidades, inclusive frações
  ("1 e 1/2 xícara" vira "3 xícaras")
- Riscar ingredientes já separados, com barra de progresso
- Tempo de preparo e de forno separados, lidos do próprio texto da receita
- Salvar favoritos no navegador, imprimir e enviar por WhatsApp
- Tema claro e escuro
