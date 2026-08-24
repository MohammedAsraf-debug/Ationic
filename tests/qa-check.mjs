/**
 * Automated QA sweep for the Ationic static site.
 *
 * Usage:  node tests/qa-check.mjs
 *
 * Checks every tracked page (excluding node_modules and showcase demos):
 *  - page loads without JS errors
 *  - no horizontal overflow at 375px and 1440px
 *  - all form controls have accessible labels
 *  - images declare width/height (CLS)
 *  - local asset requests do not fail
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const files = execSync('git ls-files "*.html"', { cwd: ROOT }).toString().trim().split('\n')
  .filter(f => f && fs.existsSync(path.join(ROOT, f)) && !f.includes('node_modules') && !f.includes('showcase') && !f.startsWith('admin/'));

const results = [];
const browser = await chromium.launch();

for (const f of files) {
  const url = 'file:///' + path.join(ROOT, f).replace(/\\/g, '/');
  const pageErrors = [];
  const failedRequests = [];
  const p = await browser.newPage({ viewport: { width: 375, height: 812 } });
  p.on('pageerror', e => pageErrors.push(e.message));
  p.on('requestfailed', r => {
    if (r.url().startsWith('file://')) failedRequests.push(r.url());
  });
  try {
    await p.goto(url, { waitUntil: 'load', timeout: 30000 });
    await p.waitForTimeout(400);
    const overflow375 = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.waitForTimeout(200);
    const overflow1440 = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const imgsNoDims = await p.evaluate(() =>
      Array.from(document.querySelectorAll('img:not([width]):not([height])')).map(i => i.getAttribute('src')));
    const unlabeled = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), select, textarea').forEach(el => {
        const id = el.id;
        const hasLabel = (id && document.querySelector(`label[for="${id}"]`)) || el.closest('label') || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        if (!hasLabel) out.push(el.tagName.toLowerCase() + ':' + (el.name || el.id || '?'));
      });
      return out;
    });
    results.push({ f, overflow375, overflow1440, pageErrors, failedRequests, imgsNoDims, unlabeled });
  } catch (e) {
    results.push({ f, error: e.message.slice(0, 150) });
  }
  await p.close();
}
await browser.close();

let bad = 0;
for (const r of results) {
  const flags = [];
  if (r.error) flags.push('LOAD-ERROR');
  else {
    if (r.overflow375 > 1) flags.push('H-OVERFLOW-375(+' + r.overflow375 + 'px)');
    if (r.overflow1440 > 1) flags.push('H-OVERFLOW-1440(+' + r.overflow1440 + 'px)');
    if (r.pageErrors.length) flags.push('PAGE-ERRORS:' + r.pageErrors.length);
    if (r.failedRequests.length) flags.push('FAILED-LOCAL-REQ:' + r.failedRequests.length);
    if (r.unlabeled.length) flags.push('UNLABELED:' + r.unlabeled.join(','));
    if (r.imgsNoDims.length) flags.push('IMG-NO-DIMS:' + r.imgsNoDims.length);
  }
  if (flags.length) bad++;
  console.log((flags.length ? 'ISSUE ' : 'OK    ') + r.f + (flags.length ? ' -> ' + flags.join(' | ') : ''));
  for (const pe of r.pageErrors || []) console.log('      pageError:', pe);
}
console.log('\nChecked:', results.length, '| pages with issues:', bad);
process.exit(bad ? 1 : 0);