import fs from 'fs';
import { execSync } from 'child_process';
const files = execSync('git ls-files "*.html"').toString().trim().split('\n').filter(f => f && fs.existsSync(f) && !f.includes('node_modules'));
const patterns = new Map();
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const re = /grid-template-columns:\s*(repeat\(\d+,\s*1fr\))/g;
  let m;
  while ((m = re.exec(c))) {
    const key = m[1];
    if (!patterns.has(key)) patterns.set(key, []);
    patterns.get(key).push(f);
  }
}
for (const [p, fsx] of patterns) {
  console.log(p, '->', fsx.length, 'files');
  for (const x of [...new Set(fsx)]) console.log('   ', x);
}