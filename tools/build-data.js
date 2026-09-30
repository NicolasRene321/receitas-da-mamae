// Gera assets/js/receitas-data.js a partir de data/receitas.json.
// Assim o site funciona abrindo o index.html direto (file://), sem servidor.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'data', 'receitas.json');
const out = path.join(root, 'assets', 'js', 'receitas-data.js');

const dados = JSON.parse(fs.readFileSync(src, 'utf8'));

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  '// ARQUIVO GERADO — edite data/receitas.json e rode: node tools/build-data.js\n' +
    'window.RECEITAS = ' +
    JSON.stringify(dados, null, 2) +
    ';\n',
  'utf8'
);

console.log('ok: ' + dados.receitas.length + ' receitas -> assets/js/receitas-data.js');
