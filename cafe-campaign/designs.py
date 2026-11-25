"""«أول رشفة» — café opening campaign designs.

Renders each design from HTML/SVG with headless Chrome:
    python3 designs.py            # -> out/*.png

The café's name and logo are placeholders (a generic cup mark and "CAFÉ").
Swap BRAND_* below for the real ones and re-run.
"""
import os
import subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'out')
FONTS = os.path.join(ROOT, '..', 'neo-capta-video', 'public', 'fonts')
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell')

# --- brand placeholders (replace with the café's real name / details) -------
BRAND_WORDMARK = 'CAFÉ'
DATE_TEXT = '[تاريخ الافتتاح]'
PLACE_TEXT = '[الموقع]'
HANDLE = '@cafe'

# --- palette ----------------------------------------------------------------
ESPRESSO = '#1A0F0A'
ROAST = '#3B2418'
CREMA = '#EAD9C2'
MILK = '#F7F0E6'
CARAMEL = '#C8884A'
FOAM = '#FFF8EE'

FONT_CSS = f"""
@font-face {{ font-family: Cairo; src: url('file://{FONTS}/cairo-arabic-900-normal.woff2'); font-weight: 900; unicode-range: U+0600-06FF, U+FE70-FEFF, U+FB50-FDFF; }}
@font-face {{ font-family: Cairo; src: url('file://{FONTS}/cairo-arabic-700-normal.woff2'); font-weight: 700; unicode-range: U+0600-06FF, U+FE70-FEFF, U+FB50-FDFF; }}
@font-face {{ font-family: Cairo; src: url('file://{FONTS}/cairo-latin-900-normal.woff2'); font-weight: 900; }}
@font-face {{ font-family: Cairo; src: url('file://{FONTS}/cairo-latin-700-normal.woff2'); font-weight: 700; }}
@font-face {{ font-family: Montserrat; src: url('file://{FONTS}/montserrat-latin-800-normal.woff2'); font-weight: 800; }}
@font-face {{ font-family: Montserrat; src: url('file://{FONTS}/montserrat-latin-500-normal.woff2'); font-weight: 500; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: Cairo, sans-serif; direction: rtl; }}
.page {{ position: relative; overflow: hidden; }}
.abs {{ position: absolute; }}
.grain {{ position: absolute; inset: 0; opacity: .07; background-image: radial-gradient(circle, #fff 1px, transparent 1.5px); background-size: 7px 7px; }}
"""


def bean(size, color=ROAST, crease=ESPRESSO, rot=0):
    return f"""<svg width="{size}" height="{size * 1.35}" viewBox="0 0 100 135" style="transform: rotate({rot}deg)">
      <ellipse cx="50" cy="67" rx="46" ry="63" fill="{color}"/>
      <ellipse cx="38" cy="45" rx="14" ry="26" fill="#ffffff" opacity=".08"/>
      <path d="M50 8 C 30 40, 70 90, 50 127" stroke="{crease}" stroke-width="7" fill="none" stroke-linecap="round"/>
    </svg>"""


def cup(size, latte=True, saucer=True):
    """Top-down cup: saucer, cup, coffee and a latte-art heart."""
    heart = (f'<path d="M100 132 C 70 112, 64 88, 80 78 C 90 72, 100 78, 100 88 C 100 78, 110 72, 120 78 '
             f'C 136 88, 130 112, 100 132 Z" fill="{FOAM}" opacity=".92"/>'
             f'<path d="M100 132 L100 150" stroke="{FOAM}" stroke-width="4" stroke-linecap="round" opacity=".9"/>') if latte else ''
    sau = (f'<circle cx="100" cy="100" r="98" fill="{MILK}"/><circle cx="100" cy="100" r="92" fill="none" stroke="{CREMA}" stroke-width="3"/>') if saucer else ''
    return f"""<svg width="{size}" height="{size}" viewBox="0 0 200 200">
      {sau}
      <rect x="148" y="90" width="44" height="20" rx="10" fill="#ffffff" stroke="{CREMA}" stroke-width="2"/>
      <circle cx="100" cy="100" r="70" fill="#ffffff" stroke="{CREMA}" stroke-width="2"/>
      <circle cx="100" cy="100" r="60" fill="#6B3E22"/>
      <circle cx="100" cy="100" r="55" fill="#8A5530"/>
      {heart}
    </svg>"""


def steam(w, h, color=CREMA, opacity=.55):
    paths = ''.join(
        f'<path d="M{x} {h} C {x - 30} {h * .7}, {x + 30} {h * .45}, {x} {h * .2} S {x - 20} 0, {x} 0" stroke="{color}" stroke-width="8" fill="none" stroke-linecap="round" opacity="{opacity}"/>'
        for x in (w * .3, w * .5, w * .7)
    )
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">{paths}</svg>'


def mark(size, light=True):
    """Placeholder café logo: small cup + wordmark."""
    color = MILK if light else ESPRESSO
    return f"""<div style="display:flex;align-items:center;gap:{size * .35}px;direction:ltr">
      {cup(size, latte=True, saucer=False)}
      <span style="font-family:Montserrat;font-weight:800;font-size:{size * .62}px;letter-spacing:.18em;color:{color}">{BRAND_WORDMARK}</span>
    </div>"""


def page(w, h, bg, body):
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{FONT_CSS}</style></head><body><div class="page" style="width:{w}px;height:{h}px;background:{bg}">{body}</div></body></html>'


DESIGNS = {}

# 1 — Teaser: something is roasting
DESIGNS['01-teaser-roasting'] = (1080, 1350, page(1080, 1350, f'radial-gradient(circle at 50% 55%, {ROAST} 0%, {ESPRESSO} 70%)', f"""
  <div class="grain"></div>
  <div class="abs" style="top:140px;left:0;right:0;text-align:center;font-weight:900;font-size:120px;color:{CREMA}">شي يتحمّص…</div>
  <div class="abs" style="top:380px;left:50%;transform:translateX(-50%);filter:drop-shadow(0 40px 60px rgba(0,0,0,.6))">{bean(420, '#5A3420', '#2A160D', -18)}</div>
  <div class="abs" style="top:430px;left:170px;opacity:.5">{bean(90, '#4A2A19', '#2A160D', 30)}</div>
  <div class="abs" style="top:860px;right:160px;opacity:.45">{bean(70, '#4A2A19', '#2A160D', -40)}</div>
  <div class="abs" style="bottom:170px;left:0;right:0;text-align:center;font-weight:700;font-size:44px;color:{CARAMEL};letter-spacing:.05em">قريبًا</div>
  <div class="abs" style="bottom:70px;left:50%;transform:translateX(-50%)">{mark(54)}</div>
"""))

# 2 — Teaser: can you smell it? (3 days)
DESIGNS['02-teaser-3-days'] = (1080, 1350, page(1080, 1350, ROAST, f"""
  <div class="grain"></div>
  <div class="abs" style="bottom:-260px;left:50%;transform:translateX(-50%)">{cup(900)}</div>
  <div class="abs" style="bottom:470px;left:50%;transform:translateX(-50%)">{steam(420, 330, CREMA, .5)}</div>
  <div class="abs" style="top:110px;left:0;right:0;text-align:center;font-weight:900;font-size:110px;color:{MILK}">ريحته وصلت؟</div>
  <div class="abs" style="top:270px;left:0;right:0;display:flex;justify-content:center;align-items:baseline;gap:26px">
    <span style="font-weight:900;font-size:230px;line-height:1;color:{CARAMEL}">٣</span>
    <span style="font-weight:900;font-size:90px;color:{CARAMEL}">أيام</span>
  </div>
  <div class="abs" style="top:56px;left:60px">{mark(44)}</div>
"""))

# 3 — Teaser: one day to the first sip (light)
DESIGNS['03-teaser-1-day'] = (1080, 1350, page(1080, 1350, CREMA, f"""
  <div class="abs" style="top:120px;left:0;right:0;text-align:center;font-weight:900;font-size:104px;line-height:1.25;color:{ESPRESSO}">باقي يوم…<br><span style="color:{CARAMEL}">على أول رشفة.</span></div>
  <div class="abs" style="top:560px;left:50%;transform:translateX(-50%) rotate(-12deg);filter:drop-shadow(0 30px 50px rgba(60,30,10,.35))">{cup(700)}</div>
  <div class="abs" style="top:520px;left:90px">{bean(80, ROAST, ESPRESSO, 25)}</div>
  <div class="abs" style="bottom:110px;right:110px">{bean(64, ROAST, ESPRESSO, -30)}</div>
  <div class="abs" style="top:56px;left:60px">{mark(44, light=False)}</div>
"""))

# 4 — Opening day hero
DESIGNS['04-opening'] = (1080, 1350, page(1080, 1350, f'radial-gradient(circle at 50% 42%, #4A2C1C 0%, {ESPRESSO} 72%)', f"""
  <div class="grain"></div>
  <div class="abs" style="top:110px;left:0;right:0;text-align:center;font-weight:900;font-size:150px;line-height:1.1;color:{MILK}">افتتحنا.</div>
  <div class="abs" style="top:300px;left:0;right:0;text-align:center;font-weight:900;font-size:72px;color:{CARAMEL}">وأول رشفة علينا.</div>
  <div class="abs" style="top:430px;left:50%;transform:translateX(-50%);filter:drop-shadow(0 40px 70px rgba(0,0,0,.6))">{cup(620)}</div>
  <div class="abs" style="bottom:150px;left:50%;transform:translateX(-50%);display:flex;gap:18px">
    <span style="white-space:nowrap;padding:14px 36px;border-radius:99px;background:{CARAMEL};color:{ESPRESSO};font-weight:900;font-size:36px">{DATE_TEXT}</span>
    <span style="white-space:nowrap;padding:14px 36px;border-radius:99px;border:3px solid {CREMA};color:{CREMA};font-weight:700;font-size:36px">{PLACE_TEXT}</span>
  </div>
  <div class="abs" style="bottom:56px;left:50%;transform:translateX(-50%)">{mark(48)}</div>
"""))

# 5 — Story: share your first sip (UGC)
DESIGNS['05-story-first-sip'] = (1080, 1920, page(1080, 1920, f'linear-gradient(180deg, {ROAST} 0%, {ESPRESSO} 100%)', f"""
  <div class="grain"></div>
  <div class="abs" style="top:170px;left:0;right:0;text-align:center;font-weight:900;font-size:130px;line-height:1.15;color:{MILK}">صوّر<br><span style="color:{CARAMEL}">أول رشفة</span></div>
  <div class="abs" style="top:560px;left:50%;transform:translateX(-50%) rotate(8deg);padding:28px 28px 120px;background:{FOAM};box-shadow:0 40px 80px rgba(0,0,0,.5)">
    <div style="width:640px;height:640px;background:{CREMA};display:flex;align-items:center;justify-content:center">{cup(560)}</div>
    <div style="position:absolute;bottom:34px;left:0;right:0;text-align:center;font-weight:900;font-size:52px;color:{ESPRESSO}">#أول_رشفة</div>
  </div>
  <div class="abs" style="bottom:330px;left:0;right:0;text-align:center;font-weight:700;font-size:54px;line-height:1.5;color:{CREMA}">وسوّ لنا منشن<br><span style="font-family:Montserrat;font-weight:800;direction:ltr;display:inline-block;color:{CARAMEL}">{HANDLE}</span></div>
  <div class="abs" style="bottom:110px;left:50%;transform:translateX(-50%)">{mark(60)}</div>
"""))


def render():
    os.makedirs(OUT, exist_ok=True)
    for name, (w, h, html) in DESIGNS.items():
        src = os.path.join(OUT, f'_{name}.html')
        with open(src, 'w') as fh:
            fh.write(html)
        png = os.path.join(OUT, f'{name}.png')
        subprocess.run([CHROME, '--no-sandbox', '--hide-scrollbars', '--allow-file-access-from-files',
                        f'--window-size={w},{h}', '--virtual-time-budget=3000', f'--screenshot={png}', 'file://' + src],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.remove(src)
        print('wrote', png)


if __name__ == '__main__':
    render()
