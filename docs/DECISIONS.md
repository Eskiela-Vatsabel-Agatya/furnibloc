# FurniBLOC — Decision Log

Date: 2026-10-21

Source: FurniBLOC master plan. Humans maintain; agents append, never delete.

This is the equivalent of `company.md` §7 ("Special Requirements / Deviations from DNA"). These were deliberate decisions by the humans. Do not re-flag them. Anything **not** listed here that conflicts with `agent.md`, `design.md` or `security.md` is still a stop-and-ask.

| ID | Decision / deviation | DNA it departs from | Why, and the guardrails that stay |
|---|---|---|---|
| D1 | Astro as a **build-time** framework | `agent.md` (vanilla stack), `security.md` §8 (prefer CDN scripts) | The team wants component reuse and a real toolchain. Output stays **static**: `output: 'static'`, no adapter, no SSR, no API routes, no server code. Versions pinned exactly, lockfile committed. |
| D2 | **GitHub-linked Cloudflare Pages auto-build** instead of Direct Upload | `agent.md` §4, `security.md` §2.1 and §10 | The human decided this after talking to a more senior developer. The 500 free build minutes/month are plenty. Guardrails: `main` is production and is only merged after a local `npm run build && npm run preview` check; feature branches get preview deploys only; **no `functions/` folder and no wrangler config at the repo root** (so Pages cannot auto-provision Functions/Worker bindings); no Astro server adapter. |
| D3 | **Soft-UI (neumorphic) surfaces** with a flat, high-contrast layer on top | `design.md` §5 (low-opacity shadows) and §10 (no loud shadows) | Client look wanted by the team. Middle ground defined in A4: capped shadow alpha, mandatory control borders, flat CTAs, squint test. |
| D4 | **Product video hosted in R2**, served through the Worker with HTTP Range support | not covered | The Worker stays "stream bytes + set headers". No logic, no writes. |
| D5 | **Copper is the single brand color**; deep olive from the logo is used only as the **neutral ink** (text) color | `design.md` §2.1 (one brand color) | Olive is not an accent. It never fills buttons, badges or highlights. |
| D6 | **Light mode only at launch** | `design.md` §5 (dark mode optional) | Neumorphism needs its own dark-mode pass. Not in scope. |
| D7 | **`furnibloc.com` is repointed to the new site**, replacing the old one | not covered | Cutover plan and gates are in Phase 3. |
| D8 | Catalog shape **drops `tiers`/`options`/`variants`-by-price** | `agent.md` §4 reference shape | FurniBLOC products are not quantity-priced or configurable. Keeps `category`, a featured flag, and per-product media. |
| D9 | Worker CORS also allows **preview deployments of this project only** (`https://<hash>.<project>.pages.dev`) via a strict regex | `security.md` §5a (list origins explicitly) | Lets previews test 3D/AR. The pattern is anchored to this project's own subdomain, so it is not a wildcard on the internet. |

## Appended by agents

| Date | ID | Note |
|---|---|---|
| 2026-10-21 | P1-1 | Phase 1 added `@astrojs/check` and `typescript` (exact-pinned, dev-only) because the plan's own `npm run check` (`astro check`) cannot run without them. |
| 2026-10-21 | P1-2 | Control borders use `--border-control` (`#A57B45`, 3.2:1 on the surface) instead of copper-300, which measures only 1.56:1 and fails the plan's 3:1 rule. Soft decorative edges use `--border-soft`. |
| 2026-10-21 | P1-3 | Primary button fill is copper **700**: white on copper-600 measures 4.46:1, just under AA. WhatsApp button fill is a darker green token (`--whatsapp-strong`) because white on `#25D366` is only about 1.9:1. |
| 2026-10-22 | P2-1 | Phase 2 added the planned `qrcode` dependency (exact-pinned). Its types are declared locally in `src/env.d.ts` instead of adding `@types/qrcode`. |
| 2026-10-22 | P2-2 | The logo is inlined as SVG (not `<img>`): an `<img>` SVG cannot see page CSS variables or the page font, and the supplied file had `width/height="100%"` (no intrinsic size). `npm run favicons` regenerates a self-contained `public/favicon.svg` plus PNGs from `src/assets/brand/favicon.svg`. |
| 2026-10-22 | P2-3 | The hero "Kunjungi showroom" button renders only once the Showroom nav item is enabled (Phase 3), so Phase 2 has no dead anchor. |
| 2026-10-22 | P2-4 | `Product` gained an optional `photoDir` (defaults to `slug`) so dev fixtures can share `src/assets/products/_fixture/`. |
| 2026-10-22 | P3-1 | **WhatsApp green: kept `#0F7A3D`** (`--whatsapp-strong`) for the button fill with white text (5.4:1). The brand-bright `#25D366` stays as the icon accent only (white on it fails AA). The human left the choice open; switching to `#25D366` with dark ink text is a one-token change. |
| 2026-10-22 | P3-2 | **Brochure link** opens `https://docs.google.com/viewerng/viewer?url=https://www.furnibloc.com/FB.pdf` (human's choice), so it works only once `www.furnibloc.com` serves this site. The original PDF is shipped unaltered at `/FB.pdf` and must never be redirected. |
| 2026-10-22 | P3-3 | The "Lihat di ruanganmu (AR)" nav item points to the "Cara pakai AR" section (`/#cara-ar`), since AR itself lives on each product page. |
| 2026-10-22 | P3-4 | Added `@astrojs/sitemap` 3.7.4 (exact-pinned): plan 3.5 asks for a sitemap. `/dev/*` and `/404` are filtered out. |
| 2026-10-22 | P3-5 | The social card `public/og-default.png` is a **TEMP** card generated by `npm run og` (logo + tagline, colours read from `tokens.css`). Product pages use their own photo. |
| 2026-10-22 | P3-6 | FAQ: all 13 entries are live; 7 are `status: 'verify'` with non-committal provisional wording (they point to WhatsApp). The build prints a warning listing them. FAQ JSON-LD includes them as-is. |
| 2026-10-22 | P3-7 | Opening hours are shown as `Setiap hari, 09.00–17.00 WIB` (`site.hours`, **VERIFY**). `openingHours` in JSON-LD is emitted only when `hours.confirmed` is true; `geo` only when `site.geo` is set. |
| 2026-10-22 | P3-8 | Proposed infra names (**confirm when created**): bucket `furnibloc-3d-asset`, Worker `furnibloc-3d`, domain `ar.furnibloc.com`, binding `MY_BUCKET`. Infra tasks 3.6–3.10 were **prepared only** (no Cloudflare access): `infra/worker/index.js`, `docs/INFRA_RUNBOOK.md`. Cutover date: *not yet*. |
| 2026-10-22 | P3-9 | The showroom map is the keyless `maps.google.com/maps?q=…&output=embed` iframe with `loading="lazy"`; no API key, no script. |
| 2026-10-22 | P3-10 | A back-to-top button appears after two screens of scroll (the home page is now long). |
