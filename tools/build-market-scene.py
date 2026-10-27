#!/usr/bin/env python3
"""Draws the illustrative market for "Explore a market" and writes media/market/market.svg.

Scene geometry lives here; the words live in data.js (MARKET_EXPLORER); the behaviour lives in market.js.
Each selectable feature is a <g class="mx-feat" id="mx-ID"> with a hidden halo (.mx-halo) the script shows on selection.
PINS below are the pin positions (in viewBox units) that market.js reads from data-pin attributes.
Faceless stick figures only, in the site's line, colour and evidence-free illustration language.
Run:  python3 tools/build-market-scene.py
"""
import os
W, H = 1000, 640
INK, ORANGE, SAND, SAND2, CANVAS, CREAM = "#16202B", "#F26430", "#F3EADF", "#E9DCCB", "#FAF7F2", "#FBF6EE"
GROUND = "#F4ECE1"

def fig(x, g, s=1.0, arms=None, legs=None):
    """A faceless stick figure standing on ground line g, scaled by s."""
    hy = g - 82 * s; r = 10 * s; neck = hy + r; hip = g - 38 * s; sh = neck + 8 * s
    d = f"M{x:.1f} {neck:.1f} V{hip:.1f} "
    d += legs(x, hip, s) if legs else f"M{x:.1f} {hip:.1f} L{x-11*s:.1f} {g:.1f} M{x:.1f} {hip:.1f} L{x+11*s:.1f} {g:.1f} "
    d += arms(x, sh, s) if arms else f"M{x:.1f} {sh:.1f} L{x-15*s:.1f} {sh+26*s:.1f} M{x:.1f} {sh:.1f} L{x+15*s:.1f} {sh+26*s:.1f}"
    return f'<circle cx="{x:.1f}" cy="{hy:.1f}" r="{r:.1f}" fill="{CANVAS}"/><path d="{d}" fill="none"/>'

def shadow(x, y, rx, ry=None):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry or rx*0.16:.1f}" fill="{INK}" opacity=".07" stroke="none"/>'

def halo(d, lx, ly, label):
    """Selection outline and label, hidden until the feature is chosen."""
    return (f'<g class="mx-halo" aria-hidden="true" display="none"><path d="{d}" fill="none" stroke="{ORANGE}" stroke-width="3.5" stroke-dasharray="10 7"/>'
            f'<g class="mx-tag"><rect x="{lx-4}" y="{ly-21}" width="{len(label)*9.4+24}" height="30" rx="15" fill="{INK}" stroke="none"/>'
            f'<text x="{lx+8}" y="{ly}" fill="{CANVAS}" stroke="none" font-family="Hanken Grotesk, Segoe UI, Arial, sans-serif" font-size="16" font-weight="700">{label}</text></g></g>')

parts = []
# ---- sky and ground --------------------------------------------------------------------------
parts.append(f'<rect width="{W}" height="{H}" fill="{CANVAS}" stroke="none"/>')
parts.append(f'<circle cx="905" cy="74" r="30" fill="{ORANGE}" stroke="none" opacity=".85"/>')
parts.append(f'<path d="M0 330 H{W} V{H} H0 Z" fill="{GROUND}" stroke="none"/>')
# the lane, narrowing towards the back so the market has depth
parts.append(f'<path d="M300 {H} L455 330 H575 L760 {H}" fill="#EFE3D3" stroke="none"/>')
parts.append('<g stroke="#16202B" opacity=".14" stroke-width="2">' + "".join(
    f'<path d="M{300+(455-300)*t:.0f} {H-(H-330)*t:.0f} H{760-(760-575)*t:.0f}"/>' for t in (0.18, 0.38, 0.55, 0.7, 0.82, 0.91)) + '</g>')

# ---- back row of shophouses (one is the "nearby building" with a roof to explore) -------------
back = [(270, 120, 168), (390, 70, 196), (460, 110, 150), (570, 80, 204), (650, 130, 170), (900, 100, 200)]
for x, w, h in back:
    top = 330 - h
    parts.append(f'<path d="M{x} 330 V{top} H{x+w} V330" fill="{SAND}"/>')
    for wy in range(top + 22, 300, 44):
        for wx in range(x + 14, x + w - 24, 34):
            parts.append(f'<rect x="{wx}" y="{wy}" width="18" height="22" fill="{CREAM}" opacity=".9"/>')
# the nearby building: a low block on the left whose flat roof we look down onto
roof = f"M40 168 L250 168 L268 150 L58 150 Z"
parts.append('<g class="mx-feat" id="mx-roof">'
             f'<path d="M40 330 V168 H250 V330" fill="{SAND}"/><path d="M250 330 V168 L268 150 V312 Z" fill="{SAND2}"/>'
             f'<path class="mx-roof-top" d="{roof}" fill="#FFFFFF"/>'
             f'<path d="M78 158 h40 M150 158 h52" opacity=".35"/>'
             f'<path d="M190 150 V134 H222 V150 M190 134 Q206 126 222 134" fill="{CREAM}"/>'
             + "".join(f'<rect x="{wx}" y="{wy}" width="26" height="30" fill="{CREAM}"/>' for wx in (64, 112, 160, 208) for wy in (194, 246))
             + f'<path d="M110 330 V292 H150 V330" fill="{CREAM}"/>'
             + halo("M30 176 L30 140 L276 140 L276 176 Z", 34, 120, "Nearby roof") + '</g>')

# ---- the tree, and the resting place in its shade (back right) ----------------------------------
crown = "M880 296 C826 296 806 252 828 224 C810 188 844 156 878 165 C896 132 950 138 958 174 C996 176 1008 222 984 246 C1000 280 960 304 928 294 Z"
parts.append('<g class="mx-feat" id="mx-tree">'
             + shadow(920, 446, 96, 14) +
             f'<path d="M904 446 V296 M904 346 L882 316 M904 328 L930 304" fill="none" stroke-width="5"/>'
             f'<path d="{crown}" fill="#F7EFE2"/><path d="M850 248 q12 -9 24 0 M916 198 q12 -9 24 0 M930 258 q12 -9 24 0 M864 200 q10 -8 20 0" fill="none" opacity=".45"/>'
             + halo("M800 412 L800 120 L1000 120 L1000 412 Z", 806, 102, "Tree") + '</g>')
parts.append('<g class="mx-feat" id="mx-rest">'
             f'<path d="M846 430 H990 M856 430 V458 M980 430 V458 M846 420 H990" fill="none"/>'
             + fig(874, 458, .74, arms=lambda x, y, s: f"M{x} {y} L{x+14} {y+20}",
                   legs=lambda x, h, s: f"M{x} {h:.1f} H{x+20} V458 ")
             + fig(948, 458, .66, arms=lambda x, y, s: f"M{x} {y} L{x-12} {y+18} M{x} {y} L{x+10} {y+12}",
                   legs=lambda x, h, s: f"M{x} {h:.1f} H{x-18} V458 ")
             + halo("M836 378 L836 468 L1000 468 L1000 378 Z", 806, 492, "Resting place") + '</g>')

# ---- far stalls along the lane ----------------------------------------------------------------
for x, y, w in [(330, 372, 90), (600, 372, 90), (250, 408, 120), (640, 408, 110)]:
    hgt = w * 0.55
    parts.append(f'<path d="M{x} {y} V{y-hgt:.0f} H{x+w} V{y}" fill="none" opacity=".6"/>'
                 f'<path d="M{x-6} {y-hgt:.0f} L{x+w/2:.0f} {y-hgt-14:.0f} L{x+w+6} {y-hgt:.0f} Z" fill="#F7D5C4" opacity=".9"/>'
                 f'<path d="M{x} {y-hgt*0.45:.0f} H{x+w}" fill="none" opacity=".6"/>')
parts.append(fig(498, 418, .46))

# ---- the drinking-water point (left) -------------------------------------------------------------
parts.append('<g class="mx-feat" id="mx-water">'
             + shadow(140, 520, 80) +
             f'<path d="M66 410 Q120 388 174 410 L174 418 Q120 396 66 418 Z" fill="{SAND2}"/>'
             f'<path d="M72 416 V520 M168 416 V520" fill="none"/>'
             f'<path d="M100 520 V452 H118 V520 M118 462 H140 V472" fill="{CREAM}"/>'
             f'<path d="M126 520 V500 H158 V520" fill="{CREAM}"/>'
             f'<path d="M140 478 v12" fill="none" stroke="#2E6F95" stroke-width="2.5"/>'
             + fig(196, 520, .82, arms=lambda x, y, s: f"M{x} {y} L{x-36} {y+24} M{x} {y} L{x-26} {y+32}")
             + f'<path d="M154 486 h10 v16 h-10 Z" fill="{CREAM}"/>'
             + halo("M54 374 L54 532 L222 532 L222 374 Z", 58, 356, "Water point") + '</g>')

# ---- the vendor and their cart (front left) --------------------------------------------------------
parts.append('<g class="mx-feat" id="mx-vendor">'
             + shadow(260, 612, 120) +
             f'<path d="M170 560 H310 V586 H170 Z" fill="{CREAM}"/>'
             f'<path d="M176 560 q14 -16 28 0 q14 -16 28 0 q14 -16 28 0 q14 -16 28 0 q14 -16 18 -2" fill="#F7D5C4"/>'
             f'<circle cx="190" cy="600" r="12" fill="{CANVAS}"/><circle cx="290" cy="600" r="12" fill="{CANVAS}"/>'
             f'<path d="M310 570 L336 556" fill="none"/>'
             + fig(356, 612, 1.0, arms=lambda x, y, s: f"M{x} {y} L{x-22} {y+16} M{x} {y} L{x+20} {y+24}")
             + f'<path d="M372 560 l10 0 l0 22 l-14 0 Z" fill="{CREAM}"/>'
             + halo("M158 470 L158 626 L392 626 L392 470 Z", 162, 452, "Vendor") + '</g>')

# ---- the stall canopy (front right) -----------------------------------------------------------------
cloth_w = 300; x0 = 580
parts.append('<g class="mx-feat" id="mx-canopy">'
             + shadow(730, 626, 160, 18) +
             f'<path d="M604 626 V476 M856 626 V476" fill="none"/>'
             f'<path class="mx-canopy-cloth" d="M{x0} 482 Q730 418 {x0+cloth_w} 482 L{x0+cloth_w} 496 Q730 434 {x0} 496 Z" fill="{ORANGE}"/>'
             f'<path d="M{x0} 496 ' + " ".join("q12.5 13 25 0" for _ in range(12)) + f'" fill="none" stroke="{ORANGE}" stroke-width="3"/>'
             f'<path d="M632 626 V562 H828 V626 M632 574 H828" fill="{CREAM}"/>'
             + "".join(f'<circle cx="{cx}" cy="554" r="9" fill="{c}"/>' for cx, c in [(652, "#F5A623"), (672, "#F5A623"), (692, "#F7D5C4"), (770, "#F7D5C4"), (790, "#F5A623"), (810, "#F7D5C4")])
             + fig(730, 562, .78, arms=lambda x, y, s: f"M{x} {y} L{x-18} {y+16} M{x} {y} L{x+16} {y+16}", legs=lambda x, h, s: "")
             + halo("M568 406 L568 636 L892 636 L892 406 Z", 572, 390, "Stall canopy") + '</g>')

# ---- people in the lane, including someone using a wheelchair and someone walking with a stick ----------
parts.append(fig(440, 604, .9, arms=lambda x, y, s: f"M{x} {y} L{x+22} {y+28} M{x} {y} L{x-14} {y+26}") +
             fig(470, 604, .56, arms=lambda x, y, s: f"M{x} {y} L{x-10} {y+6} M{x} {y} L{x+10} {y+16}") + shadow(454, 606, 36))
parts.append(f'<circle cx="478" cy="500" r="16" fill="{CANVAS}"/><circle cx="508" cy="506" r="7" fill="{CANVAS}"/>'
             f'<path d="M470 460 V484 H502 M470 484 L466 498 M502 484 L508 506 M470 444 V460 M470 464 L492 476" fill="none"/>'
             f'<circle cx="470" cy="434" r="9" fill="{CANVAS}"/>' + shadow(488, 516, 30))
parts.append(fig(556, 470, .66, arms=lambda x, y, s: f"M{x} {y} L{x+14} {y+20} M{x} {y} L{x-12} {y+22}") + f'<path d="M570 430 V470" fill="none"/>' + shadow(560, 472, 22))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="mx-scene-t">'
       f'<title id="mx-scene-t">An illustrative market: stalls under a canopy, a drinking-water point, a bench in the shade of a tree, a nearby building with a flat roof, and a vendor with a cart, with customers walking through. Not a real place.</title>'
       f'<g fill="none" stroke="{INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">{"".join(parts)}</g></svg>\n')
out = os.path.join(os.path.dirname(__file__), "..", "media", "market", "market.svg")
open(out, "w", encoding="utf-8").write(svg)
print("wrote", os.path.relpath(out), len(svg), "bytes")
