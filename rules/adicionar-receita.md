# Adicionar uma receita

1. Entrada em `data/receitas.json` (`cobertura`, `calda`, `dica`, `incompleto` são
   opcionais; `incompleto` vira um aviso no topo da página).
2. `node tools/build-data.js`.
3. Entrada em `SABORES` (`common.js`).
4. `node tools/shot.js <n>` para conferir.
