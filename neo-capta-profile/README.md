# Neo Capta — company profile deck

`neo-capta-profile.pptx` — 10 slides, Arabic (RTL), 16:9, brand palette from the logo.

Rebuild:

```bash
npm install
python3 make_assets.py   # logos, halftone backgrounds, stills from ../neo-capta-video/out
node build.js            # -> neo-capta-profile.pptx
```

Text lives in `build.js`. The contact slide has bracketed fields to fill in.
