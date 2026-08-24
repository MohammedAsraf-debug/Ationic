/**
 * Functional QA tests for interactive behaviors.
 * Usage: node tests/qa-functional.mjs
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = f => 'file:///' + path.join(ROOT, f).replace(/\\/g, '/');
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };

const browser = await chromium.launch();

// ── Contact page: native select + custom service reveal + labels ──
{
  const p = await browser.newPage();
  await p.goto(url('contact.html'), { waitUntil: 'load' });

  const select = p.locator('#subject');
  ok('contact: native <select> exists', await select.count() === 1);
  ok('contact: select has accessible label', await p.locator('label[for="subject"]').count() === 1);
  const optCount = await select.locator('option').count();
  ok('contact: select has all options (14)', optCount === 14);

  // required validation blocks empty service
  await p.fill('#from_name', 'Test User');
  await p.fill('#from_email', 'test@example.com');
  await p.fill('#phone', '9876543210');
  await p.fill('#message', 'Hello');
  const invalid = await select.evaluate(el => !el.checkValidity());
  ok('contact: empty service fails validation', invalid);

  // custom option reveals custom input
  await select.selectOption('custom');
  const visible = await p.locator('#custom-service-group').isVisible();
  ok('contact: custom input revealed on "Custom Service"', visible);

  // selecting normal service hides it again
  await select.selectOption('SEO');
  const hidden = await p.locator('#custom-service-group').isHidden();
  ok('contact: custom input hidden after normal selection', hidden);
  await p.close();
}

// ── Index: popup dialog behavior ──
{
  const p = await browser.newPage();
  await p.goto(url('index.html'), { waitUntil: 'load' });
  await p.evaluate(() => sessionStorage.clear());
  await p.reload({ waitUntil: 'load' });
  const popup = p.locator('#contactPopup');

  ok('popup: role=dialog present', (await p.locator('#contactPopup .popup-modal').getAttribute('role')) === 'dialog');
  ok('popup: aria-modal=true', (await p.locator('#contactPopup .popup-modal').getAttribute('aria-modal')) === 'true');
  ok('popup: hidden on load', await popup.isHidden());

  // force open via timer path: emulate by calling showPopup through re-add class
  await p.waitForTimeout(10600); // auto-open after 10s
  const opened = await popup.evaluate(el => el.classList.contains('active'));
  ok('popup: auto-opens after ~10s', opened);

  // focus lands inside dialog
  const focusInPopup = await p.evaluate(() => document.getElementById('contactPopup').contains(document.activeElement));
  ok('popup: focus moves into dialog', focusInPopup);

  // Tab cycles within dialog
  for (let i = 0; i < 12; i++) await p.keyboard.press('Tab');
  const stillInside = await p.evaluate(() => document.getElementById('contactPopup').contains(document.activeElement));
  ok('popup: Tab focus stays trapped inside', stillInside);

  // Escape closes and restores focus to body/last element
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  ok('popup: Escape closes', !(await popup.evaluate(el => el.classList.contains('active'))));
  const outside = await p.evaluate(() => !document.getElementById('contactPopup').contains(document.activeElement));
  ok('popup: focus restored outside', outside);
  await p.close();
}

// ── Index: FAQ accordion toggles with aria-expanded ──
{
  const p = await browser.newPage();
  await p.goto(url('index.html'), { waitUntil: 'load' });
  const first = p.locator('.accordion-header').first();
  await first.scrollIntoViewIfNeeded();
  await first.click();
  const expanded = await first.getAttribute('aria-expanded');
  ok('accordion: aria-expanded=true after click', expanded === 'true');
  await first.click();
  ok('accordion: aria-expanded=false after second click', (await first.getAttribute('aria-expanded')) === 'false');
  await p.close();
}

// ── Portfolio: filter buttons work, images have dimensions, modal focus ──
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url('portfolio.html'), { waitUntil: 'load' });
  await p.waitForTimeout(500);

  const cardCount = await p.locator('.portfolio-card').count();
  ok('portfolio: 16 cards rendered', cardCount === 16);

  const imgsNoDims = await p.evaluate(() =>
    Array.from(document.querySelectorAll('.portfolio-card__img')).filter(i => !i.width || !i.height).length);
  ok('portfolio: all card images declare dimensions', imgsNoDims === 0);

  await p.locator('.portfolio-filter__btn[data-filter="saas"]').click();
  await p.waitForTimeout(400);
  const saasVisible = await p.locator('.portfolio-card:not(.filter-hide)').count();
  ok('portfolio: SaaS filter shows 6 cards', saasVisible === 6);

  // open modal via Case Study button
  await p.locator('.portfolio-card:not(.filter-hide) .portfolio-card__overlay-btn').first().click({ force: true });
  await p.waitForTimeout(300);
  const modalActive = await p.evaluate(() => document.getElementById('portfolioModal').classList.contains('active'));
  ok('portfolio: modal opens', modalActive);
  const closeFocused = await p.evaluate(() => document.activeElement && document.activeElement.id === 'modalClose');
  ok('portfolio: close button focused on open', closeFocused);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(200);
  ok('portfolio: Escape closes modal', await p.evaluate(() => !document.getElementById('portfolioModal').classList.contains('active')));
  await p.close();
}

// ── Social media campaign: strategy anchor exists ──
{
  const p = await browser.newPage();
  await p.goto(url('showcase-projects/social-media-campaign/index.html'), { waitUntil: 'load' });
  const anchorTarget = await p.evaluate(() => !!document.getElementById('strategy'));
  const ctaHref = await p.locator('a.hero-cta-btn', { hasText: 'Explore the Campaign' }).getAttribute('href');
  ok('social-campaign: CTA points to #strategy', ctaHref === '#strategy' && anchorTarget);
  await p.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);