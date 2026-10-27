# Deliver Me brand files

Drop the **official** logo files here, exported from the supplied artwork — never redrawn.
The site picks them up automatically (SVG preferred, PNG/WebP accepted); until then it
shows a plain text fallback.

| File name (any of .svg/.png/.webp) | Use | Source lockup |
| --- | --- | --- |
| `logo-horizontal-dark` | Nav bar, light pages (primary) | White-card lockup: charcoal wordmark + icon |
| `logo-horizontal-light` | Dark sections | Dark-background lockup: cream wordmark + terracotta icon |
| `logo-compact-dark` | Footer / small spaces on light | Icon + wordmark, charcoal |
| `logo-compact-light` | Footer / small spaces on dark | Icon + wordmark, cream + terracotta |
| `logo-icon` | Icon only on light surfaces | Pin + grid icon |
| `logo-icon-dark-bg` | App-icon tile | Rounded dark tile with terracotta icon |

Also add, for browsers and home screens (in `/public`):

- `favicon.ico` (32×32) and `icon.svg` from the icon-only mark
- `apple-touch-icon.png` (180×180) from the app-icon tile
- `icon-192.png`, `icon-512.png` (app-icon tile) — referenced by the web manifest

Rules: same geometry everywhere; light lockup on light backgrounds, dark lockup on dark
backgrounds; no recolouring, no merged "third" mark, no re-typesetting of the wordmark.
