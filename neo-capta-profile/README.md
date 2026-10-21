# Neo Capta — company profile deck

Two takes, both 10 slides, Arabic (RTL), 16:9, brand palette from the logo:

- `neo-capta-profile.pptx` — light content slides with cards and icons (`node build.js`).
- `neo-capta-profile-bold.pptx` — dark throughout, big type, full-bleed stills (`python3 make_assets_bold.py && node build_bold.js`).

Rebuild:

```bash
npm install
python3 make_assets.py   # logos, halftone backgrounds, stills from ../neo-capta-video/out
node build.js            # -> neo-capta-profile.pptx
```

Text lives in `build.js`. The contact slide has bracketed fields to fill in.
