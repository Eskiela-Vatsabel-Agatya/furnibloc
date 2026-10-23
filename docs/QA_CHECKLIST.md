# Pre-ship checklists (Phase 3)

Status key: **pass** (verified by a scripted local check or code reading) · **N/A** · **D#** (deliberate deviation, see `DECISIONS.md`) · **HUMAN** (can only be verified on the live deployment/devices, see `INFRA_RUNBOOK.md`).
Visual judgement (look and feel) is left to the human by standing instruction; nothing here was screenshot-verified.

## design.md §12

| Item | Status | Note |
|---|---|---|
| One brand colour, full ramp, no second loud colour | pass (D5) | Copper ramp; olive is ink only; `scripts/check-hex.mjs` keeps hex values in `tokens.css` |
| ≤2 font families, ≤6 sizes | pass | Plus Jakarta Sans, 6 type tokens |
| Large headings: −2–3 % tracking, 110–120 % leading | pass | `--tracking-display`, `--leading-display` |
| Spacing on 4 px multiples | pass | `--space-*` tokens only |
| Every control has default, hover, active, disabled (+ focus/error for inputs) | pass | Button, Chip, Input, Select, SegmentedControl, FAQ summary, booths (hover/focus/selected) |
| Photo-with-text legibility treatment | N/A | No text on photos |
| Dark mode uses lighter-surface elevation | N/A (D6) | Light only at launch |
| AR CTA distinct, markerless only, shown only once loaded | pass | `ArButton`, state machine in `stage.ts` |
| Correct default media per §8, tested incl. fallback | pass | Scripted Phase 2 tests (model ok / missing / failed) |
| WhatsApp CTA present and pre-filled per product | pass | `waLink()`; FAQ buttons add the question as topic |
| Copy in Bahasa Indonesia with `Rp` formatting | pass | `formatRupiah` |

## security.md §10

| Item | Status | Note |
|---|---|---|
| Tier confirmed (A) | pass | Static Astro, no backend |
| No secrets/keys in repo or bundle; R2 via binding | pass (local sweep) | Worker has no key; `PUBLIC_ASSET_BASE` is a public URL. Re-sweep `dist/` before launch (HUMAN) |
| Worker CORS scoped, not `*` | pass (source) / HUMAN (deployed) | `infra/worker/index.js`; D9 adds this project's previews. Local mock test run |
| Pages via Direct Upload | **D2** | Git-linked deploy by decision |
| Anything needing a private key/backend halted | pass | None added |
| Devtools deterrents scoped + disclaimer | N/A | None used |
| AR `.glb`/`.usdz` decimated before live | HUMAN (gate G1) | No 3D asset exists yet |
| Watermark baked into texture | HUMAN (gate G1) | Not an overlay |
| `<model-viewer>` has `src` and `ios-src` via Worker | pass | Verified by scripted test; `usdz` is optional per product, see deviations in the report |
| Tested fallback to 2D image | pass | Scripted: missing model → photo, no stuck loader |
| No marker-based AR | pass | None |
| CDN scripts version-pinned / SRI | N/A | No CDN scripts: everything is bundled, exact-pinned in `package.json` (the only third-party iframe is the Google Maps embed) |
| Tier B form re-validation | N/A | No forms with data collection |
| Personal data / UU PDP | N/A | No personal data collected |
