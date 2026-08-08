const fs = require('fs');
const dev = fs.readFileSync('node_modules/react-dom/cjs/react-dom.development.js', 'utf8');
const prod = fs.readFileSync('node_modules/react-dom/cjs/react-dom.production.min.js', 'utf8');

function findProd(code) {
  const re = new RegExp(code + ':\\s*"[^"]*', 'g');
  const m = [];
  let x;
  while ((x = re.exec(prod)) !== null) m.push(x[0]);
  return m;
}

for (const c of [184, 185, 186]) {
  console.log('=== prod code', c, '===');
  console.log(findProd(c));
}

// dev throw sites
for (const msg of ['Maximum update depth', 'Cannot update a component']) {
  const idx = dev.indexOf(msg);
  console.log('=== dev msg:', msg, 'idx=', idx);
  if (idx !== -1) console.log(dev.slice(Math.max(0, idx - 400), idx + 200));
}
