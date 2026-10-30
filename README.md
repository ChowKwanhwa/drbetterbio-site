# YANIAER — Skincare Collection

Static product collection page for YANIAER, Japanese clinic-grade luxury skincare.

- `index.html` — page markup (hero, collection grid, brand intro, FAQ, story, reviews)
- `assets/css/style.css` — styles (mobile-first, 2 / 3-column grid)
- `assets/js/main.js` — sorting, category filter (refine chips + nav links), grid density, add-to-bag feedback, newsletter validation
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

Run locally:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```
