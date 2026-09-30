# Comandos

```bash
node tools/build-data.js   # data/receitas.json -> assets/js/receitas-data.js (OBRIGATÓRIO após editar o JSON)
node tools/shot.js 9       # screenshots em .shots/r9/ (5 alvos: home/receita, desktop e 500px)
node tools/diag.js 500     # lista elementos que estouram a largura da viewport
```

Não há testes nem linter. A verificação é visual: rode `shot.js` com o número da
rodada seguinte ao maior `.shots/rN` existente e inspecione os PNGs.

`shot.js` e `diag.js` chamam o Chrome headless por caminho absoluto
(`C:\Program Files\Google\Chrome\Application\chrome.exe`) e usam um perfil temporário
novo a cada execução, justamente para nunca servir JS/CSS em cache — ao depurar uma
mudança que "não apareceu", desconfie de outra coisa, não do cache.

No Windows a janela mínima do Chrome é ~489px, então os prints "mobile" são a 500px.
