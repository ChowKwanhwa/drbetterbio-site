# YANIAER — Skincare Collection

Static product collection page for YANIAER, Japanese clinic-grade luxury skincare.

- `index.html` — page markup (hero, collection grid, brand intro, FAQ, story, reviews)
- `assets/css/style.css` — styles (mobile-first, 2 / 3-column grid)
- `assets/js/main.js` — sorting, category filter (refine chips + nav links), grid density, add-to-bag feedback, newsletter validation
- `assets/js/i18n.js` — language switcher (日本語 / English / 한국어 / Tiếng Việt / 繁體中文); picks `?lang=`, then the saved choice, then the browser language
- `assets/js/i18n/*.js` — Traditional Chinese, Vietnamese, Japanese and Korean strings (English is the markup itself)
- `assets/data/products.json` — product catalogue
- `assets/img/payments/` — footer payment badges (SVG, from activemerchant/payment_icons, MIT)
- `assets/img/` — product photography (`NN-name.webp` main, `NN-name-detail.webp` lifestyle; detail shows on hover)

## Catalogue

| No. | Product | Size | Price |
|---|---|---|---|
| 01 | Facial Sheet Mask | 10 sheets | USD 25.00 |
| 02 | Eye Patches | 60 patches | USD 20.00 |
| 03 | Hydrating Peel-Off Mask | 150 mL | USD 30.00 |
| 04 | Face Cream | 40 g | Coming Soon |
| 05 | Gentle Facial Cleanser | 120 g | Coming Soon |
| 06 | Facial Serum | 60 mL | Coming Soon |

A product with `"status": "coming-soon"` and `"price": null` hides its price and cannot be added to the bag.
To launch it, set `status` to `"available"`, give it a `price`, and clear or change its `badge`.

## Languages

Translatable markup carries `data-i18n="key"` (inner HTML) or `data-i18n-attr="attr:key"`; add the same key to every file in `assets/js/i18n/`.
Products are translated through each entry's `i18n` field in `products.json` (`name`, `size`, `desc`, `badge`).
Link to a language with `?lang=en`, `?lang=zh-Hant`, `?lang=vi`, `?lang=ja` or `?lang=ko`.

Run locally:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```
