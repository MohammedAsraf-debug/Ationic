import { transform } from 'esbuild';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const TARGET_DIRS = ['css', 'js', ...readdirSync(ROOT).filter(name => name.startsWith('showcase-projects'))];

function collect(dir, ext, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (['admin', 'bulkmailer', 'content', 'netlify'].includes(name) && dir === ROOT) continue;
      collect(full, ext, out);
    } else if (name.endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

let totalBefore = 0;
let totalAfter = 0;
let count = 0;

for (const pattern of ['.css', '.js']) {
  const files = collect(ROOT, pattern).filter(f => !f.includes(`${sep}node_modules${sep}`));
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const result = await transform(source, {
      loader: pattern === '.css' ? 'css' : 'js',
      minify: true,
      legalComments: 'none'
    });
    if (result.warnings.length) {
      console.warn(`Warnings in ${file}:`, result.warnings.map(w => w.text).join('; '));
    }
    writeFileSync(file, result.code);
    totalBefore += Buffer.byteLength(source);
    totalAfter += Buffer.byteLength(result.code);
    count++;
  }
}

console.log(`Minified ${count} files: ${(totalBefore / 1024).toFixed(1)} KB -> ${(totalAfter / 1024).toFixed(1)} KB`);
