import fs from 'fs';
import { execSync } from 'child_process';
const files = execSync('git ls-files "case-studies/*.html"').toString().trim().split('\n').filter(f => f && fs.existsSync(f));
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const after = before.replaceAll(
    'grid-template-columns:repeat(4,1fr)',
    'grid-template-columns:repeat(auto-fit,minmax(140px,1fr))'
  );
  if (before !== after) {
    fs.writeFileSync(f, after);
    console.log('fixed', f);
  }
}