# Infrastructure runbook (Cloudflare): for the human to follow

Written in Phase 3. **Nothing in here has been executed.** The builder had no access to Cloudflare, GitHub or a deployed Worker.
Follow the steps **in this order**. Each ☐ is a tick-box; each **GATE** is a stop sign.

SOPs are referenced by step number and not repeated:
- **SOP 01** = `01_SOP_Akses_Akun_Cloudflare_Klien` · **SOP 02** = `02_SOP_Setup_Domain_Path_A_dan_B` · **SOP 03** = `03_SOP_Sesi_Screen_Share_Beli_Domain`

## 0. Names to use (proposed, **confirm when created** and record the real ones in the table at the bottom)

| Thing | Proposed name |
|---|---|
| R2 bucket | `furnibloc-3d-asset` |
| Worker | `furnibloc-3d` |
| Worker URL (**in use now**) | `https://furnibloc-3d-asset.lunarcreativa.workers.dev` |
| Worker custom domain (optional, later) | `ar.furnibloc.com` |
| Worker binding variable | `MY_BUCKET` (must be exactly this: the source uses `env.MY_BUCKET`) |
| Pages project | `furnibloc` (any name; it becomes `<name>.pages.dev`) |
| Production site | `https://www.furnibloc.com` (apex `furnibloc.com` redirects to it) |

---

## 1. GATE: Cloudflare account ownership (plan 3.7)

Ask FurniBLOC first. Do **not** create Pages, R2 or the Worker until these are answered, because moving resources between accounts later is painful.

- ☐ Whose Cloudflare account hosts this? SOP 01 recommends: **FurniBLOC owns it, LunAR is Administrator.**
- ☐ Where is `furnibloc.com` registered, where is its DNS today, and who can log in there?
- ☐ Final resource names agreed (section 0).

If FurniBLOC owns the account:
1. ☐ FurniBLOC creates the account with their own company email: **SOP 01, Step 1**.
2. ☐ FurniBLOC invites LunAR as **Administrator** (not Super Administrator): **SOP 01, Step 2**.
3. ☐ LunAR accepts the invitation (SOP 01, Step 2, items 9–10) and can see the client's account in the account dropdown.

## 2. Billing session (only if R2 asks for a payment method)

R2 usually asks for a payment method on the account even inside the free tier. Only the Super Administrator (the client) can add one.

- ☐ Do the screen-share session: **SOP 03, Steps 2–3** (add the payment method). Skip SOP 03 Steps 1 and 4–7 (no domain purchase: `furnibloc.com` already exists).

## 3. R2 bucket and upload

In the dashboard, with the client's account selected:

1. ☐ Left sidebar → **R2 Object Storage** → **Create bucket**. Name: `furnibloc-3d-asset`. Location: Automatic. Create.
2. ☐ **Do not** turn on the public `r2.dev` URL (some Indonesian ISPs block it, and the site never uses it).
3. ☐ Open the bucket → **Objects** → **Upload**. Upload the **prepared** files (see launch gate G1: decimated shell, logo baked in, never the raw model) so the object keys are exactly:
   - `bed-side-panel.glb`
   - `bed-side-panel.usdz`
   Files go at the **root** of the bucket (no folder). Keys are lowercase and case-sensitive.
4. ☐ Videos later go at the root too (same rules).

## 4. Worker and the R2 binding

1. ☐ Sidebar → **Workers & Pages** → **Create** → **Create Worker** (the "Hello World" starter). Name: `furnibloc-3d`. Deploy.
2. ☐ **Edit code**: delete the starter and paste the whole of `infra/worker/index.js` from this repo. **Leave the two `___` placeholders for now** (you fill them in section 6). Deploy.
3. ☐ Worker → **Settings** → **Bindings** → **Add** → **R2 bucket**. Variable name: `MY_BUCKET`. Bucket: `furnibloc-3d-asset`. Save and deploy.
4. ☐ No secrets, no access keys, no environment variables are needed. If you find yourself pasting a key, stop: the binding replaces it.

## 5. Pages project connected to GitHub (plan 3.8, decision D2)

1. ☐ Push this project to a GitHub repository (the user's own; exclude `node_modules`, `dist`, `.astro`, `.env`; `public/model` and `public/video` are not committed because 3D files live in R2).
2. ☐ **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick the repo.
3. ☐ Use these settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Environment variable (**Production and Preview**) | `PUBLIC_ASSET_BASE` = `https://furnibloc-3d-asset.lunarcreativa.workers.dev` (switch to `https://ar.furnibloc.com` if the custom domain is added later) |
| Node version | The repo has `.nvmrc` (22). If the build log shows an older Node, add `NODE_VERSION` = `22` |

4. ☐ Save and deploy. Open the first build log and confirm there are **no "Functions" or "bindings" lines** (there is no `functions/` folder and no root `wrangler.*` on purpose).
5. ☐ Write down the production hostname (`<project>.pages.dev`).
6. Guardrails to remember:
   - Production deploys only from `main`. Work on feature branches, which get preview URLs. Before merging: `npm run build && npm run preview` and click through.
   - To save build minutes, a commit message starting with `[CI Skip]` (also accepted: `[CI-Skip]`, `[Skip CI]`, `[Skip-CI]`, `[CF-Pages-Skip]`, case-insensitive) skips the build. Check the current marker in the Pages docs if it ever stops working.

## 6. Fill the `___` placeholders in the Worker (plan 3.7/3.8)

With the real Pages project name from step 5:

1. ☐ In the Worker source, replace the **first** `___` (in `ALLOWED_ORIGINS`) so the line reads `"https://<project>.pages.dev"`.
2. ☐ Replace the **second** `___` (in `PREVIEW_ORIGIN`) with the project name: `/^https:\/\/[a-z0-9-]+\.<project>\.pages\.dev$/`.
3. ☐ Deploy. Copy the edited file back into `infra/worker/index.js` in the repo and commit it (the repo copy is the record).
4. ☐ Check: the Worker must contain **no `*` CORS** and **no key**.

## 7. DNS onboarding and the Worker domain: no downtime (plan 3.9 steps 1–3, 5)

`furnibloc.com` is already live elsewhere, so there is **no domain purchase**. The old site keeps working until section 9.

1. ☐ **Record the current zone** (this is the rollback map): screenshot or export every DNS record at the current provider; note the registrar, the current nameservers, TTLs, and whether DNSSEC is on. Lower TTLs ~24 h ahead if you can.
2. ☐ **Email:** the public email is a Gmail address, so MX probably isn't on this domain, but check. Carry over any MX/TXT (SPF/DKIM) **exactly**: **SOP 02, Path B, Step 4**.
3. ☐ If DNS is not on Cloudflare yet, follow **SOP 02, Path B, Steps 2–7**: turn DNSSEC off at the current registrar → add the site in the client's Cloudflare account (Free plan) → review the scanned records → change the two nameservers at the registrar → wait for **Active**. **Do not continue until the zone is Active.**
4. ☐ Attach the Worker domain: Worker `furnibloc-3d` → **Settings** → **Domains & Routes** → **Add** → **Custom Domain** → `ar.furnibloc.com`: **SOP 02, Path A, Step 5**. SSL issues automatically in minutes (SOP 02 Path A, Step 6).

## 8. QA on the `*.pages.dev` URL (before touching `www`)

Everything in sections 8a–8c must pass **before** the cutover.

### 8a. Worker curl tests (record the output in the report)
```bash
# allowed origin: ACAO echoes it
curl -sI -H "Origin: https://www.furnibloc.com" https://ar.furnibloc.com/bed-side-panel.glb | grep -i -E "HTTP|access-control|content-type|accept-ranges"
# foreign origin: NO access-control-allow-origin header
curl -sI -H "Origin: https://evil.example" https://ar.furnibloc.com/bed-side-panel.glb | grep -i access-control || echo "no ACAO (correct)"
# range request: 206
curl -s -o /dev/null -w "%{http_code}\n" -H "Range: bytes=0-99" https://ar.furnibloc.com/bed-side-panel.glb
# usdz content type: model/vnd.usdz+zip
curl -sI https://ar.furnibloc.com/bed-side-panel.usdz | grep -i content-type
# bad key: 404
curl -s -o /dev/null -w "%{http_code}\n" --path-as-is https://ar.furnibloc.com/../secret
```
Expected: 200 + `access-control-allow-origin: https://www.furnibloc.com` + `model/gltf-binary` + `accept-ranges: bytes`; no ACAO for the foreign origin; `206`; `model/vnd.usdz+zip`; `404`. Also try the Pages preview origin (`https://<project>.pages.dev` and a `https://<hash>.<project>.pages.dev` preview): both should be echoed.

### 8b. Real-device tests (real mobile SIM: Telkomsel / IndiHome, **not** office Wi-Fi: SOP 02 Path A, Step 7)
- ☐ iPhone Safari: product page → "Lihat di ruanganmu" opens AR Quick Look with the `.usdz`.
- ☐ Android Chrome: opens Scene Viewer or WebXR with the `.glb`.
- ☐ Desktop Chrome, Safari, Firefox: 3D works; the AR pill is replaced by the "Lihat di HP-mu" QR popover.
- ☐ Scan the QR from a product page with a phone: it opens that product.
- ☐ Video (once a video exists): playback starts, seeking works, iOS plays inline (proves Range support).
- ☐ Floor plan and FAQ readable at phone width.

### 8c. Failure paths
- ☐ In R2, rename `bed-side-panel.glb` → the page falls back to the photo with **no error text and no stuck loader**. Rename it back.
- ☐ In devtools, block `ar.furnibloc.com` → same result.

### 8d. Lighthouse (mobile, throttled), record the numbers
- ☐ Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 95 · SEO ≥ 95. (The 3D model's weight is excluded from the performance target; the page must be healthy without it.)

### 8e. Pre-ship checklists
- ☐ Go through `docs/QA_CHECKLIST.md` (design.md §12 and security.md §10). The Direct Upload item is **D2** (git-linked deploy by decision).
- ☐ Security sweep: no keys or secrets in the repo or in `dist/`; no `*.r2.dev` URL anywhere; Worker has no `*` CORS; every `<model-viewer>` carries both `src` and `ios-src`.

## 9. Launch gates (human-owned; the builder never does these)

- ☐ **G1.** 3D assets are decimated "hollow shells" with the logo baked into the texture **before** upload to the live bucket (security.md §6). Never upload the raw/manufacturing model.
- ☐ **G2.** FurniBLOC confirmed a **one-product public catalog is acceptable at launch** (the old site shows many; this cutover removes them). If not, add more products first (photo-only is fine).
- ☐ **G3.** FurniBLOC confirmed the **opening hours**, the **WhatsApp number policy** (one number for all products) and whether a **promo** is running (`site.promo` in `src/data/site.ts`).
- ☐ **G4.** Original higher-resolution product photos and the logo files are delivered (or the team accepts the TEMP versions, incl. the TEMP social card `public/og-default.png`).
- ☐ **G5.** **QR labels:** ask FurniBLOC whether old showroom tags exist and what they encode. Either add redirects in `public/_redirects` for the old URLs, or reprint from `/dev/qr-sheet` / `/qr/<slug>.svg`.
- ☐ **G6.** **FAQ:** every entry listed by the build warning (`status: 'verify'`: hours, price vs showroom, ordering/payment, shipping, custom, warranty/returns, stock) is reviewed with FurniBLOC, the answer replaced in `src/data/faq.ts`, and the entry flipped to `confirmed`.
- ☐ **G7.** The client's **old catalog source data is exported** (the old site's content disappears at the cutover).

## 10. Domain cutover (plan 3.9 steps 4, 6, 7) — only when sections 8 and 9 are green

1. ☐ Pages project → **Custom domains** → add `www.furnibloc.com` (canonical) and `furnibloc.com`: **SOP 02, Path A, Step 4** (Cloudflare proposes the DNS records).
2. ☐ Add a **redirect rule** so the apex `furnibloc.com` → `https://www.furnibloc.com` (301, preserve path).
3. ☐ Remove or replace the old A/CNAME records that pointed to the previous host (the proposed Pages records replace them). **Keep any MX/TXT** from step 7.2.
4. ☐ Wait for SSL (a few minutes), then smoke-test immediately:
   - `https://www.furnibloc.com` loads, valid padlock; `https://furnibloc.com` redirects to `www`; `https://ar.furnibloc.com` has a valid certificate.
   - `https://www.furnibloc.com/FB.pdf` opens (this exact URL is cited publicly and feeds the brochure viewer link).
   - `https://www.furnibloc.com/sitemap-index.xml` and `/robots.txt` load.
   - Repeat the 8a curl tests against the **production** origin and one 8b phone check.
5. ☐ **Rollback:** restore the old DNS records recorded in step 7.1 (or point the nameservers back at the old provider). **Keep the old host paid and untouched for at least 2 weeks.**
6. ☐ Record the cutover date in `docs/DECISIONS.md`.

## 11. Record the real resource names (fill in as created)

| Thing | Proposed | Actual (fill in) | Date |
|---|---|---|---|
| Cloudflare account (owner) | the client | | |
| R2 bucket | `furnibloc-3d-asset` | | |
| Worker | `furnibloc-3d` | | |
| Worker domain | `ar.furnibloc.com` | | |
| Pages project / `.pages.dev` host | `furnibloc` | | |
| Cutover date | | | |

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Model never loads, console shows a CORS error | The Pages host is missing from the Worker's allowed origins, or `___` was not replaced | Section 6, redeploy the Worker |
| Worker returns 404 for a file that exists | Key mismatch (case, folder, extension) | Keys must be exactly `<name>.glb` etc. at the bucket root, lowercase |
| Worker 500 / "env.MY_BUCKET undefined" | Binding variable not named exactly `MY_BUCKET` | Section 4, step 3 |
| Pages build uses an old Node | `.nvmrc` ignored | Add `NODE_VERSION` = `22` |
| `ar.` works on Wi-Fi but not on mobile data | Something still points at `r2.dev` | Search the build for `r2.dev`; it must never appear |
| QR code opens a 404 | Old printed label, or a renamed slug | Section 9 G5 / `_redirects` |
| iPhone AR does nothing | `.usdz` missing or wrong content type | Check `curl -sI` on the `.usdz` (8a) |
