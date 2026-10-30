# YANIAER — Skincare Collection

Static product collection page for YANIAER, Japanese clinic-grade luxury skincare.

- `index.html` — page markup (hero, collection grid, brand intro, FAQ, story, reviews)
- `assets/css/style.css` — styles (mobile-first, 2 / 3-column grid)
- `assets/js/main.js` — sorting, category filter (refine chips + nav links), grid density, add-to-bag feedback, newsletter validation
- `assets/js/i18n.js` — language switcher (English / 繁體中文 / Tiếng Việt); picks `?lang=`, then the saved choice, then the browser language
- `assets/js/i18n/*.js` — Traditional Chinese and Vietnamese strings (English is the markup itself)
- `assets/data/products.json` — product catalogue
- `assets/img/` — product photography (`NN-name.webp` main, `NN-name-detail.webp` lifestyle; detail shows on hover)

## Catalogue

| No. | Product | Size | Price |
|---|---|---|---|
| 01 | Facial Sheet Mask | 25 sheets | USD 25.00 |
| 02 | Eye Patches | 60 patches | USD 20.00 |
| 03 | Hydrating Peel-Off Mask | 150 mL | USD 30.00 |

A product with `"status": "coming-soon"` and `"price": null` hides its price and cannot be added to the bag.
To launch it, set `status` to `"available"`, give it a `price`, and clear or change its `badge`.

## Languages

Translatable markup carries `data-i18n="key"` (inner HTML) or `data-i18n-attr="attr:key"`; add the same key to `assets/js/i18n/zh-hant.js` and `vi.js`.
Products are translated through each entry's `i18n` field in `products.json` (`name`, `size`, `desc`, `badge`).
Link to a language with `?lang=en`, `?lang=zh-Hant` or `?lang=vi`.

Run locally:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```
