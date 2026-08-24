import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const t = process.argv[2];
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 375, height: 812 } });
await p.goto('file:///' + path.join(ROOT, t).replace(/\\/g, '/'), { waitUntil: 'load' });
await p.waitForTimeout(300);
const info = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('.about-values-grid, .value-card, .about-grid').forEach(el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    out.push({
      sel: el.tagName + '.' + String(el.className).slice(0, 40),
      display: cs.display,
      cols: cs.gridTemplateColumns.slice(0, 60),
      w: Math.round(r.width),
      left: Math.round(r.left),
      parent: el.parentElement ? el.parentElement.tagName + '.' + String(el.parentElement.className).slice(0, 30) : '',
      inlineStyle: el.getAttribute('style') || '',
    });
  });
  return out;
});
for (const i of info) console.log(JSON.stringify(i));
await browser.close();