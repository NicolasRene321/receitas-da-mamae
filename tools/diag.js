// Diagnóstico: lista elementos que estouram a largura da viewport.
// uso: node tools/diag.js [largura] [pagina]
const { execFileSync } = require('child_process');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const root = path.join(__dirname, '..');
const largura = process.argv[2] || '420';
const pagina = process.argv[3] || 'tools/_diag.html?id=bolo-de-chocolate';

const PERFIL = path.join(require('os').tmpdir(), 'chrome-receitas-' + Date.now());

const url = 'file:///' + path.join(root, pagina).replace(/\\/g, '/').replace(/ /g, '%20');

const out = execFileSync(CHROME, [
  '--headless=new', '--disable-gpu',
  '--user-data-dir=' + PERFIL,   // perfil novo: nunca serve JS/CSS em cache
  '--virtual-time-budget=4000',
  '--window-size=' + largura + ',900',
  '--dump-dom', url
], { encoding: 'utf8', maxBuffer: 1e8 });

const m = out.match(/<body[^>]*>([\s\S]*?)<\/body>/);
console.log(m ? m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '(vazio)');
