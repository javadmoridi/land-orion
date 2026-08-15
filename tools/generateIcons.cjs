/*
 * tools/generateIcons.js — generates missing Orion egg & fruit PNG icons.
 * Uses only Node built-ins (fs + zlib). 3x supersampling + premultiplied
 * downsample for smooth edges. Run: node tools/generateIcons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const ASSETS = path.resolve(__dirname, '..', 'public', 'assets');
const N = 96, SUP = 3, W = N * SUP, H = N * SUP;
let px = new Uint8ClampedArray(W * H * 4); // straight-alpha RGBA

const BG = hex('#0d0f16');
const BORDER = hex('#ff9e60');

function hex(h, a = 255) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}
function clear() { px.fill(0); }

// ---- CRC32 + PNG ----
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b) {
  let c = -1;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const tbuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length >>> 0, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tbuf, data])), 0);
  return Buffer.concat([len, tbuf, data, crc]);
}
function encodePngBytes(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  let o = 0;
  for (let y = 0; y < h; y++) {
    raw[o++] = 0;
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4;
      raw[o++] = rgba[s]; raw[o++] = rgba[s + 1];
      raw[o++] = rgba[s + 2]; raw[o++] = rgba[s + 3];
    }
  }
  const idat = zlib.deflateRawSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- Canvas primitives (sup-space, over-compositing) ----
function sset(sx, sy, col) {
  if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
  const i = (sy * W + sx) * 4, r = col[0], g = col[1], b = col[2], a = col[3];
  const sa = a / 255, da = px[i + 3] / 255, oa = sa + da * (1 - sa);
  if (oa <= 0) { px[i + 3] = 0; return; }
  px[i] = (r * sa + px[i] * da * (1 - sa)) / oa;
  px[i + 1] = (g * sa + px[i + 1] * da * (1 - sa)) / oa;
  px[i + 2] = (b * sa + px[i + 2] * da * (1 - sa)) / oa;
  px[i + 3] = oa * 255;
}
function fillRect(x, y, w, h, col) {
  for (let sy = Math.max(0, y * SUP); sy < Math.min(H, (y + h) * SUP); sy++)
    for (let sx = Math.max(0, x * SUP); sx < Math.min(W, (x + w) * SUP); sx++) sset(sx, sy, col);
}
function fillDisc(cx, cy, r, col) {
  const cxS = cx * SUP, cyS = cy * SUP, R = r * SUP;
  for (let sy = Math.max(0, Math.floor((cy - r) * SUP)); sy < Math.min(H, Math.ceil((cy + r) * SUP)); sy++) {
    const chord = Math.sqrt(Math.max(0, R * R - (sy - cyS) ** 2));
    for (let sx = Math.ceil(cxS - chord); sx <= Math.floor(cxS + chord); sx++) sset(sx, sy, col);
  }
}
function fillEll(cx, cy, rx, ry, col) {
  const cxS = cx * SUP, cyS = cy * SUP, rxS = rx * SUP, ryS = ry * SUP;
  for (let sy = Math.max(0, Math.floor((cy - ry) * SUP)); sy < Math.min(H, Math.ceil((cy + ry) * SUP)); sy++) {
    const chord = rxS * Math.sqrt(Math.max(0, 1 - ((sy - cyS) / ryS) ** 2));
    for (let sx = Math.ceil(cxS - chord); sx <= Math.floor(cxS + chord); sx++) sset(sx, sy, col);
  }
}
function strokeEllipse(cx, cy, rx, ry, t, col) {
  const steps = 120, poly = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    poly.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  for (let i = 0; i < poly.length - 1; i++) line(poly[i][0], poly[i][1], poly[i + 1][0], poly[i + 1][1], t, col);
}
function fillRounded(x, y, w, h, r, col) {
  fillRect(x + r, y, w - r * 2, h, col);
  fillRect(x, y + r, w, h - r * 2, col);
  for (const [cx, cy] of [[x + r, y + r], [x + w - r, y + r], [x + r, y + h - r], [x + w - r, y + h - r]]) {
    for (let sy = Math.max(0, (cy - r) * SUP); sy < Math.min(H, (cy + r) * SUP); sy++) {
      const chord = Math.sqrt(Math.max(0, r * r - (sy / SUP - cy) ** 2));
      for (let sx = Math.max(0, (cx - chord) * SUP); sx < Math.min(W, (cx + chord) * SUP); sx++) sset(sx, sy, col);
    }
  }
}
function strokeRounded(x, y, w, h, r, t, col) {
  fillRounded(x, y, w, h, r, col);
  fillRounded(x + t, y + t, w - t * 2, h - t * 2, r - t, BG);
}
function pointInPoly(pts, tx, ty) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if ((yi > ty) !== (yj > ty) && tx < (xj - xi) * (ty - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function fillPoly(pts, col) {
  const spts = pts.map(p => [p[0] * SUP, p[1] * SUP]);
  for (let sy = 0; sy < H; sy++) for (let sx = 0; sx < W; sx++) if (pointInPoly(spts, sx, sy)) sset(sx, sy, col);
}
function line(x0, y0, x1, y1, t, col) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len, rx = -uy * t, ry = ux * t;
  fillPoly([[x0 + rx, y0 + ry], [x0 - rx, y0 - ry], [x1 - rx, y1 - ry], [x1 + rx, y1 + ry]], col);
}
function badge() {
  fillRounded(4, 4, N - 8, N - 8, 15, BG);
  strokeRounded(4, 4, N - 8, N - 8, 15, 3, BORDER);
}
/* ---- Glyphs (white/silver, centred, radius gr) ---- */
function gStar(gx, gy, gr) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2; pts.push([gx + Math.cos(a) * (i % 2 === 0 ? gr : gr * .45), gy + Math.sin(a) * (i % 2 === 0 ? gr : gr * .45)]); }
  fillPoly(pts, hex('#fffaf0', 245));
}
function gLeaf(gx, gy, gr) {
  fillPoly([[gx, gy - gr], [gx + gr * .6, gy - gr * .2], [gx + gr * .3, gy + gr * .6], [gx, gy + gr], [gx - gr * .3, gy + gr * .6], [gx - gr * .6, gy - gr * .2]], hex('#e6f7e6', 240));
  line(gx, gy - gr + 2, gx, gy + gr - 2, gr * .14, hex('#5ac45a', 220));
  line(gx - gr * .3, gy, gx + gr * .3, gy, gr * .1, hex('#5ac45a', 200));
}
function gCrescent(gx, gy, gr) {
  fillDisc(gx, gy, gr, hex('#fffaf0', 245));
  fillDisc(gx + gr * .3, gy, gr * .82, BG);
}
function gBolt(gx, gy, gr) {
  fillPoly([[gx - gr * .36, gy + gr * .32], [gx - gr * .08, gy - gr * .38], [gx + gr * .14, gy + gr * .16], [gx + gr * .38, gy - gr * .02], [gx + gr * .1, gy + gr * .46], [gx - gr * .06, gy + gr * .22]], hex('#f0f0ff', 250));
  fillDisc(gx + gr * .06, gy - gr * .1, gr * .26, hex('#fff8e1', 180));
}
function gFlame(gx, gy, gr) {
  fillPoly([[gx, gy - gr * .85], [gx + gr * .55, gy - gr * .3], [gx + gr * .35, gy + gr * .1], [gx + gr * .5, gy + gr * .5], [gx, gy + gr * .2], [gx - gr * .5, gy + gr * .5], [gx - gr * .35, gy + gr * .1], [gx - gr * .55, gy - gr * .3]], hex('#fffaf0', 245));
}
function gSunRays(gx, gy, gr) {
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(gx + Math.cos(a) * gr * .72, gy + Math.sin(a) * gr * .72, gx + Math.cos(a) * gr, gy + Math.sin(a) * gr, gr * .11, hex('#ffd230', 220)); }
  fillDisc(gx, gy, gr * .34, hex('#ffcc33', 255));
}
function gCrystal(gx, gy, gr) {
  const pts = [];
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 2; pts.push([gx + Math.cos(a) * gr, gy + Math.sin(a) * gr]); }
  fillPoly(pts, hex('#e8f0ff', 245));
  for (const p of pts) line(gx, gy, p[0], p[1], gr * .1, hex('#ffffff', 170));
}
/* ---- Icon builders ---- */
function eggIcon(color, glyph) {
  badge(); fillEll(N / 2, N / 2 + 6, 33, 44, hex(color));
  fillEll(N / 2 - 11, N / 2 - 2, 13, 17, hex('#ffffff', 120));
  strokeEllipse(N / 2, N / 2 + 6, 34, 45, 2, hex('#0d0f16', 235));
  if (glyph) glyph(N / 2, N / 2 + 2, 15);
}
function berryIcon(color, glyph) {
  badge(); fillDisc(N / 2, N / 2, 34, hex(color));
  fillDisc(N / 2 - 11, N / 2 - 5, 12, hex('#ffffff', 115));
  strokeEllipse(N / 2, N / 2, 35, 35, 2, hex('#0d0f16', 235));
  if (glyph) glyph(N / 2, N / 2, 15);
}
function sunBerryIcon() {
  badge(); fillDisc(N / 2, N / 2, 33, hex('#ffcc33'));
  gSunRays(N / 2, N / 2, 42);
  fillDisc(N / 2 - 10, N / 2 - 5, 11, hex('#ffffff', 115));
}
function moonIcon() {
  badge(); fillDisc(N / 2, N / 2, 34, hex('#cdd6f4'));
  fillDisc(N / 2 - 12, N / 2 + 2, 26, BG);
  fillDisc(N / 2 + 15, N / 2 - 3, 8, hex('#fff9c4', 230));
  fillDisc(N / 2 + 18, N / 2 + 8, 5, hex('#fff9c4', 230));
  fillDisc(N / 2 - 16, N / 2 + 14, 6, hex('#fff9c4', 230));
  strokeEllipse(N / 2, N / 2, 35, 35, 2, hex('#0d0f16', 235));
}
function starFruitIcon() {
  badge(); const pts = [];
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2; const rad = i % 2 === 0 ? 34 : 17; pts.push([N / 2 + Math.cos(a) * rad, N / 2 + Math.sin(a) * rad]); }
  fillPoly(pts, hex('#ffd700'));
  fillDisc(N / 2 - 10, N / 2 - 5, 11, hex('#ffffff', 120));
  strokeEllipse(N / 2, N / 2, 36, 36, 2, hex('#0d0f16', 235));
}
function crystalIcon() {
  badge(); const cx = N / 2, pts = [];
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 2; pts.push([cx + Math.cos(a) * 33, N / 2 + Math.sin(a) * 33]); }
  fillPoly(pts, hex('#00e5ff'));
  for (const p of pts) line(cx, N / 2, p[0], p[1], 1.5, hex('#ffffff', 150));
  fillDisc(cx - 10, N / 2 - 4, 11, hex('#ffffff', 130));
  strokeEllipse(cx, N / 2, 35, 35, 2, hex('#0d0f16', 235));
}
function flameFruitIcon() {
  badge(); const cx = N / 2;
  fillPoly([[cx, 28], [cx + 26, 64], [cx + 10, 68], [cx + 22, 98], [cx, 82], [cx - 22, 98], [cx - 10, 68], [cx - 26, 64]], hex('#ff6b35'));
  fillDisc(cx - 4, 62, 11, hex('#ffd230', 220)); fillDisc(cx + 6, 72, 9, hex('#ff9e44', 220));
  strokeEllipse(cx, 64, 30, 32, 2, hex('#0d0f16', 235));
}
function eggShopSprite() {
  const cx = N / 2;
  fillDisc(cx, N / 2 - 2, 46, hex('#ff9e60', 55));                  // warm glow so it reads on dark maps
  fillRounded(cx - 20, 50, 40, 24, 5, hex('#a97422'));              // chest body
  fillRect(cx - 20, 54, 40, 2, hex('#6b3a1b'));                    // lid seam
  fillDisc(cx - 12, 46, 4, hex('#8b5a2b'));                        // hinges
  fillDisc(cx + 12, 46, 4, hex('#8b5a2b'));
  fillRect(cx - 20, 62, 40, 4, hex('#c0a070'));                     // metal band
  fillDisc(cx, 68, 6, hex('#d4af37'));                              // brass lock
  fillEll(cx - 1.5, 65, 3, 4, hex('#8b5a2b', 220));
  fillEll(cx, 36, 11, 13, hex('#ffd230'));                          // golden egg on lid
  strokeEllipse(cx, 36, 12, 14, 2, hex('#0d0f16', 235));
  fillEll(cx - 2.8, 33, 4, 6, hex('#ffffff', 210));                 // egg highlight
  strokeEllipse(cx, N / 2 + 14, 28, 22, 3, hex('#ff9e60', 230));    // gold visibility ring
}
function rootIcon() {
  badge(); const cx = N / 2, top = 30;
  fillPoly([[cx, top], [cx + 16, top + 18], [cx + 10, top + 22], [cx + 20, N - 28], [cx + 6, N - 22], [cx, N - 14], [cx - 6, N - 22], [cx - 20, N - 28], [cx - 10, top + 22], [cx - 16, top + 18]], hex('#ffb84d'));
  fillEll(cx, top + 4, 10, 6, hex('#2ecc71')); fillEll(cx + 12, top + 2, 7, 5, hex('#2ecc71')); fillEll(cx - 12, top + 2, 7, 5, hex('#2ecc71'));
  strokeEllipse(cx, N / 2 - 2, 36, 22, 2, hex('#0d0f16', 235));
}

function downsample() {
  const out = new Uint8ClampedArray(N * N * 4), n = SUP * SUP;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let pr = 0, pg = 0, pb = 0, pa = 0;
    for (let dy = 0; dy < SUP; dy++) { const base = ((y * SUP + dy) * W + x * SUP) * 4; for (let dx = 0; dx < SUP; dx++) { const i = base + dx * 4; const a = px[i + 3] / 255; pr += px[i] * a; pg += px[i + 1] * a; pb += px[i + 2] * a; pa += a; } }
    const idx = (y * N + x) * 4;
    if (pa > 0.0001) { out[idx] = Math.min(255, Math.round(pr / pa)); out[idx + 1] = Math.min(255, Math.round(pg / pa)); out[idx + 2] = Math.min(255, Math.round(pb / pa)); out[idx + 3] = Math.min(255, Math.round((pa / n) * 255)); }
    else { out[idx] = 0; out[idx + 1] = 0; out[idx + 2] = 0; out[idx + 3] = 0; }
  }
  return out;
}
function render(draw) { clear(); draw(); return downsample(); }

const ICONS = [
  ['orion-flame-egg.png', () => eggIcon('#ff6b35', gFlame)],
  ['orion-nature-egg.png', () => eggIcon('#4caf50', gLeaf)],
  ['orion-shadow-egg.png', () => eggIcon('#5a3a8c', gCrescent)],
  ['orion-energy-egg.png', () => eggIcon('#ffd230', gBolt)],
  ['orion-golden-egg.png', () => eggIcon('#ffd700', gStar)],
  ['sun-berry.png', () => sunBerryIcon()],
  ['crystal-apple.png', () => berryIcon('#ff5252', gCrystal)],
  ['ancient-moon-fruit.png', () => moonIcon()],
  ['celestial-star-fruit.png', () => starFruitIcon()],
  ['eternal-crystal-fruit.png', () => crystalIcon()],
  ['fire-bloom-fruit.png', () => flameFruitIcon()],
  ['green-life-fruit.png', () => berryIcon('#4caf50', gLeaf)],
  ['shadow-berry.png', () => berryIcon('#5a3a8c', null)],
  ['energy-core-fruit.png', () => berryIcon('#ffd230', gBolt)],
  ['golden-root-fruit.png', () => rootIcon()],
];

function verify(file) {
  const b = fs.readFileSync(file);
  if (b.length < 24 || b[0] !== 137 || b[1] !== 80 || b[2] !== 78 || b[3] !== 71) throw new Error('bad signature');
  let off = 8, w = 0, h = 0, idat = Buffer.alloc(0);
  while (off < b.length) {
    const len = b.readUInt32BE(off); const type = b.slice(off + 4, off + 8).toString('ascii');
    const data = b.slice(off + 8, off + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); }
    if (type === 'IDAT') idat = Buffer.concat([idat, data]);
    if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateRawSync(idat);
  if (raw.length !== (w * 4 + 1) * h) throw new Error('bad IDAT length ' + raw.length);
  return { w, h, bytes: b.length };
}

let ok = 0;
for (const [name, draw] of ICONS) {
  const file = path.join(ASSETS, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, encodePngBytes(N, N, render(draw)));
  const v = verify(file);
  console.log('  ok  ' + name.padEnd(26) + v.w + 'x' + v.h + '  ' + v.bytes + 'B');
  ok++;
}
console.log('\nGenerated ' + ok + '/' + ICONS.length + ' icons -> ' + ASSETS);

// ---- Shop building sprite ----
const shopFile = path.join(ASSETS, 'orion-egg-shop.png');
fs.writeFileSync(shopFile, encodePngBytes(N, N, render(eggShopSprite)));
fs.mkdirSync(path.dirname(shopFile), { recursive: true });
console.log('  ok  ' + 'orion-egg-shop.png'.padEnd(26) + '96x96  ' + fs.statSync(shopFile).size + 'B');
console.log('\nDone.');



