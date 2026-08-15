const fs = require('fs');
const filePath = 'C:\\Users\\javad1999\\Desktop\\land-Orion\\src\\game\\ActionBuildings.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace openMiner
const oldOpen = 'function openMiner() {\n    setMessage(null);\n    setUpgradeOpen(false);\n    setNow(Date.now());\n    setOpen(true);\n    onClick?.();\n  }';
const newOpen = 'function openMiner() {\n    setNow(Date.now());\n    setOpen(true);\n  }';
content = content.replace(oldOpen, newOpen);

// Replace doUpgrade
const start = content.indexOf('function doUpgrade() {');
const end = content.indexOf('function upgradeMiner() {');
if (start >= 0 && end > start) {
  const before = content.substring(0, start);
  const after = content.substring(end);
  const newDoUpgrade = [
    'function doUpgrade() {',
    '    if (atMaxLevel) return;',
    '    const rs = useResourceStore.getState();',
    '    if (rs.resources.coins < upgradeCost) { return; }',
    '    rs.spendCoins(upgradeCost);',
    '    const nextData = { ...minerData, level: minerData.level + 1, lastCollectedAt: Date.now(), fractionalWater: 0, fractionalAir: 0, fractionalEarth: 0, fractionalFire: 0 };',
    '    setMinerData(nextData);',
    '    saveMinerData(nextData);',
    '  }'
  ].join('\n    ');
  content = before + newDoUpgrade + after;
}

// Remove upgradeMiner and resetMiner
const upgStart = content.indexOf('function upgradeMiner() {');
const resetStart = content.indexOf('function resetMiner() {');
if (upgStart >= 0 && resetStart > upgStart) {
  const afterReset = content.indexOf('\n}\n\n', resetStart);
  if (afterReset >= 0) {
    content = content.substring(0, upgStart) + content.substring(afterReset + 3);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('OK. Size:', content.length);
