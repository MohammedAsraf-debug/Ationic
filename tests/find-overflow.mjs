import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = process.argv.slice(2);
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 375, height: 812 } });

for (const t of targets) {
  const url = 'file:///' + path.join(ROOT, t).replace(/\\/g, '/');
  await p.goto(url, { waitUntil: 'load', timeout: 30000 });
  await p.waitForTimeout(300);
  const wide = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > vw + 2 || r.right > vw + 8) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className).slice(0, 60),
          w: Math.round(r.width),
          right: Math.round(r.right),
        });
      }
    });
    return out.slice(0, 25);
  });
  console.log('==', t);
  for (const w of wide) console.log('   ', w.tag, '.' + w.cls, 'w=' + w.w, 'right=' + w.right);
}
await browser.close();