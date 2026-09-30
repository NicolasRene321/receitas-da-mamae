# O que é

Site estático (sem build, sem npm, sem servidor) com as 26 receitas de bolo de
liquidificador do caderno da mãe do usuário. Todo o texto de interface, os nomes de
funções e os comentários estão em **português** — siga essa convenção.

`index.html` abre direto no navegador via `file://`. É por isso que os dados não são
carregados por `fetch` (bloqueado em `file://`), mas sim gerados como um script que
define `window.RECEITAS`.
