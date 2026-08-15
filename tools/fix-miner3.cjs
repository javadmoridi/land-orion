const fs = require('fs');
const filePath = 'C:\\Users\\javad1999\\Desktop\\land-Orion\\src\\game\\ActionBuildings.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const upgStart = content.indexOf('function upgradeMiner() {');
const shopSection = '// ============================================================================\n// SHOP';
const shopIdx = content.indexOf(shopSection);

if (upgStart >= 0 && shopIdx > upgStart) {
  const before = content.substring(0, upgStart);
  const after = content.substring(shopIdx);

  const newMinerEnd = `  if (!open) {
    return (
      <ActionBuilding
        x={x}
        y={y}
        image={MINER_IMAGE}
        alt="Miner"
        size={10}
        onClick={openMiner}
      />
    );
  }

  const totalCollectable =
    yieldData.water +
    yieldData.air +
    yieldData.earth +
    yieldData.fire;

  return (
    <div onClick={closeMiner} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(180deg, #1a1a2e, #16213e)', color: 'white', borderRadius: 18, padding: 28, width: 'min(520px, 94vw)', maxHeight: '88vh', overflowY: 'auto', border: '1px solid rgba(255,215,0,.25)', boxShadow: '0 0 50px rgba(0,0,0,.6)' }}>
        <div style={{ textAlign: 'center' }}>
          <img src={MINER_IMAGE} alt="Miner" style={{ width: 90, height: 90, objectFit: 'contain', imageRendering: 'pixelated' }} />
          <h2 style={{ margin: '8px 0 4px', fontSize: '1.5rem', fontWeight: 900 }}>⛏ Four-Element Miner</h2>
          <div style={{ color: '#ffd700', fontWeight: 700, fontSize: '1.1rem' }}>Level {minerData.level} / {MINER_MAX_LEVEL}</div>
          <div style={{ marginTop: 4, color: '#9ca3af', fontSize: '0.8rem' }}>{rate} of each element per hour</div>
        </div>
        <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ElementStat label="💧 Water" value={yieldData.water} rate={rate} />
            <ElementStat label="🌪 Air" value={yieldData.air} rate={rate} />
            <ElementStat label="🌍 Earth" value={yieldData.earth} rate={rate} />
            <ElementStat label="🔥 Fire" value={yieldData.fire} rate={rate} />
          </div>
          <button type="button" onClick={collect} disabled={totalCollectable <= 0} style={{ width: '100%', marginTop: 16, padding: '14px 0', borderRadius: 12, border: 'none', fontWeight: 900, fontSize: '1.1rem', cursor: totalCollectable > 0 ? 'pointer' : 'not-allowed', background: totalCollectable > 0 ? 'linear-gradient(135deg, #ffd700, #f59e0b)' : 'rgba(255,255,255,.08)', color: totalCollectable > 0 ? '#0b1220' : '#666' }}>
            {totalCollectable > 0 ? `COLLECT ALL (${totalCollectable})` : 'Nothing to collect'}
          </button>
          {yieldData.water > 0 && <div style={{ marginTop: 8, textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af' }}>Fractions: {yieldData.newFracWater.toFixed(4)} 💧 {yieldData.newFracAir.toFixed(4)} 🌪 {yieldData.newFracEarth.toFixed(4)} 🌍 {yieldData.newFracFire.toFixed(4)} 🔥</div>}
        </div>
        {!atMaxLevel && <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: 8 }}>Upgrade to Level {minerData.level + 1} — {minerRate(minerData.level + 1)} of each/hr</div>
          <button type="button" onClick={doUpgrade} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', fontWeight: 800, cursor: 'pointer', background: '#2e8b57', color: 'white', fontSize: '0.95rem' }}>🪙 {upgradeCost.toLocaleString()} Coins</button>
        </div>}
        <button type="button" onClick={closeMiner} style={{ width: '100%', marginTop: 16, padding: '10px 0', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,.07)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Close</button>
      </div>
    </div>
  );
}

// Element Stat display
function ElementStat({ label, value, rate }: { label: string; value: number; rate: number }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,.25)', textAlign: 'center' }}>
      <div style={{ fontSize: '0.78rem', color: '#b7c0d3' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: 2, color: value > 0 ? '#86efac' : '#9ca3af' }}>{Math.floor(value)}</div>
      <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>+{rate}/hr</div>
    </div>
  );
}
`;

  content = before + newMinerEnd + '\n' + after;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated. Size:', content.length);
﻿const fs = require('fs');
const filePath = 'C:\\Users\\javad1999\\Desktop\\land-Orion\\src\\game\\ActionBuildings.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove from 'function upgradeMiner()' through the old return JSX up to '// SHOP'
const upgStart = content.indexOf('function upgradeMiner() {');
const shopSection = '// ============================================================================\n// SHOP';
const shopIdx = content.indexOf(shopSection);

if (upgStart >= 0 && shopIdx > upgStart) {
  // Keep everything before upgradeMiner
  const before = content.substring(0, upgStart);
  // Keep everything from SHOP onwards
  const after = content.substring(shopIdx);
  
  // Insert the new render JSX and ElementStat
  const newMinerEnd = [
    '  if (!open) {',
    '    return (',
    '      <ActionBuilding',
    '        x={x}',
    '        y={y}',
    '        image={MINER_IMAGE}',
    '        alt="Miner"',
    '        size={10}',
    '        onClick={openMiner}',
    '      />',
    '    );',
    '  }',
    '',
    '  const totalCollectable =',
    '    yieldData.water +',
    '    yieldData.air +',
    '    yieldData.earth +',
    '    yieldData.fire;',
    '',
    '  return (',
    '    <div onClick={closeMiner} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>',
    '      <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(180deg, #1a1a2e, #16213e)", color: "white", borderRadius: 18, padding: 28, width: "min(520px, 94vw)", maxHeight: "88vh", overflowY: "auto", border: "1px solid rgba(255,215,0,.25)", boxShadow: "0 0 50px rgba(0,0,0,.6)" }}>',
    '        <div style={{ textAlign: "center" }}>',
    '          <img src={MINER_IMAGE} alt="Miner" style={{ width: 90, height: 90, objectFit: "contain", imageRendering: "pixelated" }} />',
    '          <h2 style={{ margin: "8px 0 4px", fontSize: "1.5rem", fontWeight: 900 }}>⛏ Four-Element Miner</h2>',
    '          <div style={{ color: "#ffd700", fontWeight: 700, fontSize: "1.1rem" }}>Level {minerData.level} / {MINER_MAX_LEVEL}</div>',
    '          <div style={{ marginTop: 4, color: "#9ca3af", fontSize: "0.8rem" }}>{rate} of each element per hour</div>',
    '        </div>',
    '        <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>',
    '          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>',
    '            <ElementStat label="💧 Water" value={yieldData.water} rate={rate} />',
    '            <ElementStat label="🌪 Air" value={yieldData.air} rate={rate} />',
    '            <ElementStat label="🌍 Earth" value={yieldData.earth} rate={rate} />',
    '            <ElementStat label="🔥 Fire" value={yieldData.fire} rate={rate} />',
    '          </div>',
    '          <button type="button" onClick={collect} disabled={totalCollectable <= 0} style={{ width: "100%", marginTop: 16, padding: "14px 0", borderRadius: 12, border: "none", fontWeight: 900, fontSize: "1.1rem", cursor: totalCollectable > 0 ? "pointer" : "not-allowed", background: totalCollectable > 0 ? "linear-gradient(135deg, #ffd700, #f59e0b)" : "rgba(255,255,255,.08)", color: totalCollectable > 0 ? "#0b1220" : "#666" }}>',
    '            {totalCollectable > 0 ? COLLECT ALL () : "Nothing to collect"}',
    '          </button>',
    '          {yieldData.water > 0 && <div style={{ marginTop: 8, textAlign: "center", fontSize: "0.7rem", color: "#9ca3af" }}>Fractions: {yieldData.newFracWater.toFixed(4)} 💧 {yieldData.newFracAir.toFixed(4)} 🌪 {yieldData.newFracEarth.toFixed(4)} 🌍 {yieldData.newFracFire.toFixed(4)} 🔥</div>}',
    '        </div>',
    '        {!atMaxLevel && <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", textAlign: "center" }}>',
    '          <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: 8 }}>Upgrade to Level {minerData.level + 1} — {minerRate(minerData.level + 1)} of each/hr</div>',
    '          <button type="button" onClick={doUpgrade} style={{ padding: "10px 28px", borderRadius: 10, border: "none", fontWeight: 800, cursor: "pointer", background: "#2e8b57", color: "white", fontSize: "0.95rem" }}>🪙 {upgradeCost.toLocaleString()} Coins</button>',
    '        </div>}',
    '        <button type="button" onClick={closeMiner} style={{ width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 10, border: "none", background: "rgba(255,255,255,.07)", color: "white", cursor: "pointer", fontWeight: 700 }}>Close</button>',
    '      </div>',
    '    </div>',
    '  );',
    '}',
    '',
    '// Element Stat display',
    'function ElementStat({ label, value, rate }: { label: string; value: number; rate: number }) {',
    '  return (',
    '    <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(0,0,0,.25)", textAlign: "center" }}>',
    '      <div style={{ fontSize: "0.78rem", color: "#b7c0d3" }}>{label}</div>',
    '      <div style={{ fontSize: "1.5rem", fontWeight: 900, marginTop: 2, color: value > 0 ? "#86efac" : "#9ca3af" }}>{Math.floor(value)}</div>',
    '      <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>+{rate}/hr</div>',
    '    </div>',
    '  );',
    '}',
    ''
  ].join('\n');
  
  content = before + newMinerEnd + '\n' + after;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('OK. Size:', content.length);
