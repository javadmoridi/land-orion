const fs = require('fs');
const file = 'src/game/OrionHouseInterior.tsx';
let s = fs.readFileSync(file, 'utf8');

/* ---------- 1. import useVipStore ---------- */
const impAnchor = `import { useGemStore } from '../economy/gemStore';`;
if (!s.includes(impAnchor)) throw new Error('import anchor not found');
s = s.replace(impAnchor, `${impAnchor}\nimport { useVipStore } from '../economy/vipStore';`);

/* ---------- 2. add queued? to CookingJob interface ---------- */
const ifaceAnchor = `  completed: boolean;\n}`;
if (!s.includes(ifaceAnchor)) throw new Error('iface anchor not found');
s = s.replace(ifaceAnchor, `  completed: boolean;\n\n  /** True while waiting for the previous dish to finish. */\n  queued?: boolean;\n}`);

/* ---------- 3. replace hook block ---------- */
const blockStart = `  const [jobs, setJobs] = useState<CookingJob[]>(\n    loadCookingJobs,\n  );`;
const blockEnd = `    setMessage(null);\n    finishJob(jobId);\n  };`;
if (!s.includes(blockStart)) throw new Error('block start not found');
if (!s.includes(blockEnd)) throw new Error('block end not found');

const startIdx = s.indexOf(blockStart);
const endIdx = s.indexOf(blockEnd, startIdx) + blockEnd.length;

const NEW_BLOCK =
  fs.readFileSync('fix-cooking-blk1.txt', 'utf8') +
  fs.readFileSync('fix-cooking-blk2.txt', 'utf8') +
  fs.readFileSync('fix-cooking-blk3.txt', 'utf8');

s = s.slice(0, startIdx) + NEW_BLOCK + s.slice(endIdx);

/* ---------- 4. replace active-jobs JSX ---------- */
const jsxStart = `            {/* ACTIVE COOKING JOBS */}`;
const jsxEnd = `            {/* TWO SIDES */}`;
if (!s.includes(jsxStart)) throw new Error('jsx start not found');
if (!s.includes(jsxEnd)) throw new Error('jsx end not found');

const jsxStartIdx = s.indexOf(jsxStart);
const jsxEndIdx = s.indexOf(jsxEnd, jsxStartIdx);

const NEW_JSX =
  fs.readFileSync('fix-cooking-jsx1.txt', 'utf8') +
  fs.readFileSync('fix-cooking-jsx2.txt', 'utf8');

s = s.slice(0, jsxStartIdx) + NEW_JSX + s.slice(jsxEndIdx);

fs.writeFileSync(file, s);
console.log('OrionHouseInterior cooking queue rewritten OK');
