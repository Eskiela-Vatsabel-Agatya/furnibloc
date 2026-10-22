# FurniBLOC

AR-first, soft-UI website for FurniBLOC (Surakarta). Built by LunAR as **Tier A** (static): Astro → Cloudflare Pages, with 3D and video in R2 behind a Worker proxy (Phase 3).

## Run it

```bash
nvm use            # Node 22 (see .nvmrc; Astro 7 needs >= 22.22)
npm install
cp .env.example .env
npm run dev        # http://localhost:4321   (component kit: /dev/kit)
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Hex check + static build into `dist/` |
| `npm run preview` | Serves `dist/` |
| `npm run check` | Hex check + `astro check` (types) |
| `npm run check:assets` | Warns about `R2()` files missing from `public/model/` or `public/video/` |
| `npm run contrast` | Prints WCAG contrast ratios for the token pairs that matter |
| `npm run favicons` | Regenerates `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` from `src/assets/brand/favicon.svg` |
| `npm run fixtures:glb` | Writes `public/model/fixture-cube.glb` (a tiny cube) for `/dev/media-states` |

## Where 3D models and videos go

Put local test files in `public/model/` (`.glb`, `.usdz`) and `public/video/` (`.mp4`). Both folders are **git-ignored**: never commit them. In production the same files live in the R2 bucket and are served through the Worker.

In `src/data/products.ts` write the **file name only**:

```ts
model: R2Model('bed-side-panel'),              // bed-side-panel.glb + .usdz
video: { src: R2('bed-side-panel.mp4') },      // optional
```

`R2()` builds the full URL (`/model/…` in dev, `https://ar.furnibloc.com/model/…` in production). Names: lowercase, letters/digits/`.`/`-`/`_` only, no spaces. A bad name fails the build.

## Brand files

`src/assets/brand/logo.svg` is inlined by the Wordmark component. `src/assets/brand/favicon.svg` is the favicon source; run `npm run favicons` after changing it.

## Dev-only pages (never shipped)

`/dev/kit` (components), `/dev/media-states` (the four media states; run `npm run fixtures:glb` first), `/dev/qr-sheet` (A4 sheet of every product's QR label).

## QR codes

Every product page shows its QR, `/qr/<slug>.svg` is a downloadable file, and the QR always encodes `https://www.furnibloc.com/produk/<slug>`. Never rename a slug once labels may be printed.

## Adding a product

Edit `src/data/products.ts` and add the photo under `src/assets/products/<slug>/`. Full guide: [`docs/ADDING_PRODUCTS.md`](docs/ADDING_PRODUCTS.md) (written in Phase 3). A product's `slug` is permanent once a QR label may have been printed.

## Branches and deploys

- `main` = production. Merge only after a local `npm run build && npm run preview` check.
- Every other branch = Cloudflare preview deploy only.
- No `functions/` folder and no `wrangler.*` at the repo root (see `docs/DECISIONS.md`, D2).

## Docs

`docs/DECISIONS.md` lists the deliberate deviations from LunAR's DNA files.
