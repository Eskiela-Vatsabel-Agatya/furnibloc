# Adding a product

For a teammate who is not a developer. About 15 minutes per product, plus the 3D preparation (a human step).

1. **Photos.** Make a folder `src/assets/products/<slug>/` and drop the photos in. Slug rules are in step 2.
2. **Entry.** In `src/data/products.ts`, copy the Bed Side Panel entry and edit it.

   | Field | What to put |
   |---|---|
   | `slug` | **lowercase kebab-case** (`kursi-rotan-bulat`). It is in the public URL and in the printed QR code, so it is **permanent**. |
   | `code` | The legacy "No. Produk". Shown as the code and used as `sku` in search-engine data. |
   | `name`, `category` | `category` is `'Furniture'`, `'Home Decoration'` or `'Craft'`. |
   | `tenant`, `material`, `color`, `dimensions` | Optional. Leave out what you don't know (never guess). `dimensions` is `{ w, d, h, unit: 'cm' }`. |
   | `description` | Optional. If empty, a sentence is generated. |
   | `price` | Whole rupiah, a number with no dots (`400000`). |
   | `discountPercent` | 0–100, optional. |
   | `featured` / `isNew` | Optional flags. `featured` pins it first and makes it a hero candidate. |
   | `media.photos` | **File names** inside the folder from step 1, e.g. `['1.jpg', '2.jpg']`. |
3. **3D and video, by file name only.** `model: R2Model('chair')` (means `chair.glb` + `chair.usdz`), or `R2('chair.glb')` / `R2('chair.usdz')`, and `video: { src: R2('chair.mp4') }`. Declaring them makes the "3D & AR" and "Video" tabs appear. Keep names **lowercase with no spaces**, since R2 names are case-sensitive.
4. **Prepare the 3D files (human step).** Decimate to a hollow shell and bake the logo/watermark into the texture (`security.md` §6). Never use the raw/manufacturing model. Name them `<name>.glb` and `<name>.usdz`.
5. **Upload to R2** (Cloudflare dashboard → R2 → the bucket → Upload) under `model/` (and `video/`) with **exactly** the names used in `R2()`: for example `model/chair.glb`.
6. **Test locally.** Copy the files to `public/model/` (and `public/video/`), run `npm run dev`, open the product. Then run `npm run check:assets`: it warns about any `R2()` file that is missing locally. (These two folders are git-ignored.)
7. **QR labels.** Every product gets a QR code automatically (`/qr/<slug>.svg`, and on its page). To print showroom labels: `npm run dev`, open `/dev/qr-sheet`, print.
8. **Ship.** Open a pull request from a feature branch, check the preview URL (3D and AR on a real phone), then merge to `main`. `main` is production.
9. **If the build fails**, read the message. Typical ones:
   - `Product data is invalid:` followed by a list: each line names the product and the field (bad slug, price not a whole number, discount outside 0–100, a photo file not found in `src/assets/products/<slug>/`, `model.glb must be an R2('x.glb') result` because you pasted a URL instead of using `R2()`).
   - `R2("My File.glb"): letters, digits, dot, dash, underscore only` : rename the file (lowercase, no spaces).
   - `R2("x.png"): extension must be one of …` : only `glb`, `usdz`, `mp4`, `webm` go through `R2()`.
10. **Renaming a slug.** Don't, if labels were printed. If you must, first add `/produk/old-slug  /produk/new-slug  301` to `public/_redirects`, otherwise printed QR codes break.
11. **When FurniBLOC wants more** (tenants editing their own products, stock, discounts): that is Tier B (`security.md` §2.2). It is a new project, not a patch to this one.
