const fs = require('fs');
const s = fs.readFileSync('node_modules/@tonconnect/ui-react/lib/index.mjs', 'utf8');
const out = [];
function ctx(label, idx, len) {
  out.push("==== " + label + " idx=" + idx);
  out.push(s.slice(Math.max(0, idx - 100), idx + (len || 800)));
  out.push("");
}
ctx("TonConnectUIContext", s.indexOf("TonConnectUIContext"));
ctx("TonConnectUIContext.Provider", s.indexOf("Context.Provider"));
ctx("get wallet", s.indexOf("get wallet"));
ctx("wallet:", s.indexOf("wallet:"));
ctx("TonConnectUIProvider$1", s.indexOf("TonConnectUIProvider$1"));
fs.writeFileSync('.tmp_hooks2_out.txt', out.join('\n'));
console.log('done');
