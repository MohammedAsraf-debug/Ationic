# Ationic Website — QA Report

**Date:** 2026-08-24 · **Scope:** Production pages (root, services/, case-studies/, showcase-projects/) + shared `css/`, `js/`
**Constraints honored:** No visual redesign; no framework changes; bulkmailer component NOT recreated; EmailJS/GA IDs preserved.

---

## Verification

| Check | Command | Result |
|---|---|---|
| Page sweep (38 pages): JS errors, horizontal overflow @375px & @1440px, unlabeled form controls, missing image dimensions, failed local requests | `node tests/qa-check.mjs` | **0 issues** |
| Functional tests (23): select validation/reveal, popup focus trap + Escape + focus restore, accordion ARIA, portfolio filters/modal/focus, anchor CTA | `node tests/qa-functional.mjs` | **23/23 pass** |
| Internal link / asset integrity | temp linkcheck script | **0 missing** |
| JSON-LD validity | temp schema-validate script | **all valid** |
| Sitemap ↔ filesystem | temp sitemap-check script | **34/34 entries resolve** |

---

## Fixes Applied

### 1. Google Analytics placeholder
- Replaced `G-XXXXXXXXXX` → production `G-JMY0RW5Z3X` in **19 files** (about, contact, portfolio, services.html, all 12 service pages, privacy-policy, terms, 404).
- Verified: no placeholders remain; homepage ID untouched; exactly one GA snippet per page.

### 2. Broken internal links
- `showcase-projects/social-media-campaign/index.html`: hero CTA pointed to non-existent `strategy.html`. Strategy content lives on the same page → CTA now anchors to `#strategy`; added matching `id="strategy"` to the strategy section.
- `showcase-projects/construction/style.css`: removed two dead `url('assets/hero-bg.jpg')` references (file never existed); kept existing solid-color fallbacks — visuals unchanged.
- `showcase-projects/ecommerce-fashion/style.css`: same for `assets/hero-campaign.jpg`.

### 3. Contact form accessibility (`contact.html`)
- Added visually-hidden `<label class="sr-only" for=…>` for every field (name, email, phone, service, custom service, message); `.sr-only` utility added to `css/style.css`.
- Autocomplete tokens: `name`, `email`, `tel-national`.
- Phone input keeps its pattern/inputmode sanitization.

### 4. Custom service selector → native `<select>`
- The keyboard/screen-reader-hostile `role="listbox"` div widget was replaced with a native `<select>` reusing the site's existing native-select styling (chevron SVG, dark options). Placeholder is a disabled selected option → browser-native "required" validation now works for the service field.
- "Custom Service" reveal logic moved from inline `onclick` handlers to one delegated `change` listener in `js/script.js` (old `toggleSelect`/`selectOption` functions removed).
- On submit, value `custom` + typed text still becomes `Custom: …` as before.

### 5. EmailJS reliability (IDs unchanged)
- Both form handlers never fail silently:
  - Failure → button restored + visible error with fallback email (`hello@ationic.agency`), exposed via `role="alert"` live region.
  - SDK-not-loaded → explicit error message instead of silent reset.
- Success messages are `role="status"` regions that receive focus.
- Double-submit prevented (button disabled during send; restored only on failure).

### 6. Popup modal accessibility (`index.html`)
- `.popup-modal` now has `role="dialog"`, `aria-modal="true"`, `aria-labelledby="popup-title"`.
- Overlay gets `aria-hidden` toggling; body scroll locked while open.
- Focus moves into dialog on open, Tab/Shift-Tab cycle is trapped inside, Escape closes, previously-focused element regains focus on close.
- Popup form fields also got labels + autocomplete.
- Session-storage suppression behavior preserved (10 s timer).

### 7. Portfolio modal (`portfolio.html` / `js/portfolio.js`)
- Already had `role="dialog"`/`aria-modal`; added focus management: close button focused on open, Escape/bg-close restores focus to the invoking card control.

### 8. Keyboard access & button semantics
- Audit found **no** un-typed buttons inside forms (no accidental submits).
- Added `type="button"` (+ initial `aria-expanded="false"`) to hamburgers, `type="button"` to FAQ accordion headers, portfolio filter buttons and back-to-top across all tracked pages.
- Hamburger already toggles `aria-expanded` in JS; accordion headers manage it too. All interactive controls are native buttons/links → keyboard operable.

### 9. Focus visibility
- Global `:focus-visible` outline (brand yellow) added; form fields get a border+glow ring instead of their previous invisible `outline:none`.

### 10. Reduced motion
- `@media (prefers-reduced-motion: reduce)` block disables animations/transitions/smooth-scroll globally.

### 11. Image performance / LCP / CLS
- Hero: `images/hero-image.png` (**1736 KB**, no alpha) converted to `images/hero-image.webp` (**80 KB**, −95 %); old PNG deleted (no remaining references). `<img>` got intrinsic `width="1240" height="827"` (verified), `decoding="async"`, `fetchpriority="high"` (LCP), kept `loading="eager"`.
- `images/og-image.jpg`: recompressed **1205 KB → 99 KB** (mozjpeg q80) — same pixels/dimensions, share cards unchanged.
- All 16 portfolio thumbnails (1280×800, verified identical) now declare `width`/`height` in both card and modal templates + `decoding="async"`; card images stay lazy-loaded.
- Not deleted (flagged only): unreferenced orphans `images/team/sudalai.png` (862 KB), `images/nexus.png` (379 KB), `images/bloom.png` (184 KB), `images/team/narendran.jpg.jpeg` (167 KB) — safe to remove if you don't need them.

### 12. Mobile overflow fixes (375 px verified)
- Root cause in every case-study page: inline stats grid `repeat(4,1fr)` that never collapsed → replaced with `repeat(auto-fit,minmax(140px,1fr))` across **16 case-study files**.
- `about.html`: team grid's forced inline `repeat(2,1fr)` removed → new `.features-grid--team` class (2-up desktop, inherits existing 1-column rule ≤480 px).
- Long-word blowout ("Microservices") fixed via `min-width:0` on `.value-card` + `overflow-wrap:break-word` on its headings/text.

### 13. JavaScript cleanup (`js/script.js`)
- Removed unused `lastScroll` bookkeeping from the scroll handler.
- Removed dead custom-listbox code; delegated listener replaces per-element inline handlers.

### 14. SEO head hygiene (`index.html`)
- Duplicate OG/Twitter blocks consolidated into one (title/description unified; share image standardized on optimized `og-image.jpg` with explicit width/height tags).
- Fourth duplicate Organization JSON-LD block (with divergent logo/sameAs) removed; canonical trio (Organization, LocalBusiness, FAQPage) kept — all JSON-LD validated.

### 15. Sitemap / robots / third-party audit
- `sitemap.xml`: all 34 URLs map to real files; empty `content/blog/index.html` correctly excluded; 404 correctly excluded. `robots.txt` fine.
- Third-party inventory is intentional-only: GA (20 pages), Clarity (home), EmailJS CDN (contact/home), Netlify Identity + DecapCMS (`admin/`). Nothing unknown; nothing to strip.

### 16. Repo / deployment hygiene
- `.gitignore` extended: `node_modules/`, `.vs/`, OS junk (existing rules kept).
- `node_modules` (174 tracked files) and `.vs/` (5 files) untracked via `git rm -r --cached` — staged for your next commit, nothing committed by me.
- Kept tracked on purpose: `admin/` (Decap CMS), `google23e8116817a3541e.html` (Google verification).

### 17. Security headers
- Hosting is Netlify (admin uses Identity widget) → added root **`netlify.toml`**: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and a CSP whitelisting exactly GA, Clarity, EmailJS, Google Fonts, Font Awesome, jsDelivr, Netlify Identity/DecapCMS.
- Honest caveat (also commented in the file): `script-src 'unsafe-inline'` is required today because of inline GA/Clarity config and inline `oninput` handlers. Migrating those to external/nonced scripts would allow dropping `'unsafe-inline'`.
- If any host other than Netlify ends up serving the domain, translate these into that host's header mechanism instead of shipping netlify.toml blindly.

---

## Automated test suite shipped

```
tests/qa-check.mjs        # full-page sweep (overflow, labels, dims, JS errors, requests)
tests/qa-functional.mjs   # 23 behavioral assertions (forms, modal, accordion, filters)
tests/find-overflow.mjs   # helper: lists elements wider than viewport for any page
tests/inspect-cs.mjs      # helper: computed-style probe for layout debugging
```
Run with `node tests/<file>.mjs` (uses the project's existing Playwright install). Exit code 1 on failure → CI-ready.

---

## Left as-is (deliberate)

| Item | Reason |
|---|---|
| Your in-progress WIP: `admin/index.html` (+184 lines CMS UI), `css/portfolio.css` case-links section, `netlify/functions/*`, `css/blog.css` | Untouched — not part of this task. Note: `admin/index.html` references `/admin/app.js` which doesn't exist yet (presumably pending in your WIP). |
| `case-studies/bulk-mailer.html` | Exists and is tracked; only received harmless `type="button"` attributes from the global sweep. Component not recreated anywhere. |
| Orphaned large images (see §11) | Removal is safe but irreversible — flagged for your call. |
| Showcase-project demo buttons without `type` outside forms | Zero functional impact (no form to submit); avoided churn across ~150 demo controls. |
| Inline GA/Clarity/oninput scripts | Required for `'unsafe-inline'` in CSP; migration optional future hardening. |

---

## Recommended next steps

1. Review + commit the staged untracking of `node_modules`/`.vs` along with these changes.
2. Delete the four orphaned images if not needed (−1.6 MB from deploys).
3. When convenient, move inline analytics snippets to an external file to tighten CSP.
4. Give `content/blog/index.html` real content or exclude it from deploy until ready (it renders blank today but passes all checks).
