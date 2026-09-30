// Tira screenshots das páginas com o Chrome headless (sem dependências npm).
// uso: node tools/shot.js [rodada]
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const root = path.join(__dirname, '..');
const rodada = process.argv[2] || '1';
const outDir = path.join(root, '.shots', 'r' + rodada);
fs.mkdirSync(outDir, { recursive: true });

const PERFIL = path.join(require('os').tmpdir(), 'chrome-receitas-' + Date.now());

const fileUrl = p => 'file:///' + path.join(root, p).replace(/\\/g, '/').replace(/ /g, '%20');

const alvos = [
  { nome: 'home',            url: fileUrl('index.html'),                                   w: 1440, h: 3300 },
  { nome: 'home-mobile',     url: fileUrl('index.html'),                                   w: 500,  h: 2400 },
  { nome: 'receita',         url: fileUrl('receita.html') + '?id=bolo-de-chocolate',       w: 1440, h: 3400 },
  { nome: 'receita-mobile',  url: fileUrl('receita.html') + '?id=bolo-de-chocolate',       w: 500,  h: 4300 },
  { nome: 'receita-calda',   url: fileUrl('receita.html') + '?id=bolo-de-beterraba',       w: 1440, h: 3400 }
];

for (const a of alvos) {
  const dest = path.join(outDir, a.nome + '.png');
  execFileSync(CHROME, [
    '--headless=new',
    '--user-data-dir=' + PERFIL,   // perfil novo: nunca serve JS/CSS em cache
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--virtual-time-budget=6000',
    '--window-size=' + a.w + ',' + a.h,
    '--screenshot=' + dest,
    a.url
  ], { stdio: 'ignore' });
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`${a.nome}.png  ${a.w}x${a.h}  ${kb}kb`);
}

console.log('\nsalvo em ' + outDir);
