const fs = require('fs');
const file = 'src/game/ActionBuildings.tsx';
let s = fs.readFileSync(file, 'utf8');
const len0 = s.length;

function must(name, re, text) {
  if (!re.test(text)) throw new Error(name + ' not found');
}

// 1) minerRatePerSecond helper inserted right after minerRate().
const hRe = /function minerRate\([\s\S]*?\n\}/;
must('minerRate', hRe, s);
const hNew = `function minerRate(
  level: number
): number {
  return Math.max(
    0,
    Math.min(
      MINER_MAX_LEVEL,
      Math.floor(level)
    )
  );
}

// Per-second production: the miner level is the hourly yield, so the
// per-second rate is level / 3600. At level 100 that is 0.027777...
// items/s, which produces exactly 300 of every element per 3h cycle.
function minerRatePerSecond(
  level: number
): number {
  return minerRate(level) / 3600;
}`;
s = s.replace(hRe, hNew);

// 2) Continuous per-second accrual with fractional carry.
const yRe = /function calcMinerYield\([\s\S]*?\n\}/;
must('calcMinerYield', yRe, s);
const yNew = `function calcMinerYield(
  level: number,
  lastCollectedAt: number,
  fractionalWater: number,
  fractionalAir: number,
  fractionalEarth: number,
  fractionalFire: number,
  now: number
): MinerYield {
  const elapsedMs = Math.max(
    0,
    now - lastCollectedAt
  );

  const ratePerSecond =
    minerRatePerSecond(level);

  // Produce continuously, second by second, carrying the leftover
  // fraction forward so the total is exact (no drift).
  const produced =
    (elapsedMs / 1000) * ratePerSecond;

  const totalWater =
    fractionalWater + produced;
  const totalAir =
    fractionalAir + produced;
  const totalEarth =
    fractionalEarth + produced;
  const totalFire =
    fractionalFire + produced;

  const water = Math.floor(totalWater);
  const air = Math.floor(totalAir);
  const earth = Math.floor(totalEarth);
  const fire = Math.floor(totalFire);

  // One claim is allowed per full 3-hour cycle, but the accrued
  // amount now ticks up live (level 100 reaches 300 at the 3h mark).
  const cycles = Math.floor(
    elapsedMs / MINER_CYCLE_MS
  );

  return {
    water,
    air,
    earth,
    fire,

    newFracWater: totalWater - water,
    newFracAir: totalAir - air,
    newFracEarth: totalEarth - earth,
    newFracFire: totalFire - fire,

    elapsedMs,
    cycles,
  };
}`;
s = s.replace(yRe, yNew);

// 3) Show the per-second rate on the production line.
const pRe = /Production: \{rate\}\{' '}\s*\n\s*of each element per\s*\n\s*hour · \{cycleReward\}\{' '}\s*\n\s*per 3h/;
must('production line', pRe, s);
const pNew = `Production: {rate}/h · {' '}
                    {(rate / 3600).toFixed(4)}/s · {cycleReward}
                    per 3h`;
s = s.replace(pRe, pNew);

// 4) Gate collection to a completed 3h cycle (no early partial claims).
const gRe = /if \(\s*\n\s*collected\.water <= 0 &&\s*\n\s*collected\.air <= 0 &&\s*\n\s*collected\.earth <= 0 &&\s*\n\s*collected\.fire <= 0\s*\n\s*\) \{/;
must('collect guard', gRe, s);
const gNew = `if (
      collected.cycles < 1 ||
      (collected.water <= 0 &&
        collected.air <= 0 &&
        collected.earth <= 0 &&
        collected.fire <= 0)
    ) {`;
s = s.replace(gRe, gNew);

s = s.replace(/\r\n/g, '\n');
fs.writeFileSync(file, s);
console.log('miner fix applied: ' + len0 + ' -> ' + s.length + ' chars');
