#!/usr/bin/env python3
# Common Shade: draws images/common-shade-banner.svg, the full-bleed banner at the top of the exit card (tools/build-everything.js):
# dusk heat over a city, a sun radiating heat rings, and drawn, faceless figures holding up one canopy over a pool of cool shade.
# Run: python3 tools/build-banner.py > images/common-shade-banner.svg  (the seed keeps the skyline the same each run)
import random, sys
random.seed(7)
W, H = 1200, 300
out = []
a = out.append
a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">')
a('<defs>'
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1119"/><stop offset=".42" stop-color="#2A1B22"/><stop offset=".72" stop-color="#8E3418"/><stop offset=".9" stop-color="#E2582A"/><stop offset="1" stop-color="#F6A27C"/></linearGradient>'
  '<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4DE"/><stop offset=".35" stop-color="#FFD9A8"/><stop offset=".7" stop-color="#F6A27C" stop-opacity=".55"/><stop offset="1" stop-color="#F26430" stop-opacity="0"/></radialGradient>'
  '<radialGradient id="shade" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3DBFAE" stop-opacity=".55"/><stop offset="1" stop-color="#3DBFAE" stop-opacity="0"/></radialGradient>'
  '<linearGradient id="canopy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A55"/><stop offset="1" stop-color="#D9481C"/></linearGradient>'
  '</defs>')
a(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
# stars in the cool upper sky
for _ in range(46):
    x, y = random.uniform(0, W), random.uniform(6, 110)
    a(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{random.choice([0.8,1,1.3]):.1f}" fill="#F6E7D7" opacity="{random.uniform(.25,.7):.2f}"/>')
# the sun and its heat rings
sx, sy = 900, 214
a(f'<circle cx="{sx}" cy="{sy}" r="190" fill="url(#sun)"/>')
for i, r in enumerate([92, 122, 156, 194, 238, 290]):
    a(f'<circle cx="{sx}" cy="{sy}" r="{r}" fill="none" stroke="#FFE3B8" stroke-width="{2.2 - i*0.3:.1f}" stroke-dasharray="{3+i*2} {7+i*3}" opacity="{0.55 - i*0.08:.2f}"/>')
a(f'<circle cx="{sx}" cy="{sy}" r="62" fill="#FFF1D6"/>')
# heat shimmer across the sky
for k in range(7):
    y = 150 + k * 16
    d = f'M0 {y}' + ''.join(f' q 30 {-7 if j%2==0 else 7} 60 0' for j in range(20))
    a(f'<path d="{d}" fill="none" stroke="#FFE3B8" stroke-width="1.4" opacity="{0.16 - k*0.015:.3f}"/>')
# the city, two layers
def skyline(base, hmin, hmax, color, op, lit):
    x = -10
    while x < W + 10:
        w = random.randint(34, 78); h = random.randint(hmin, hmax)
        a(f'<rect x="{x}" y="{base-h}" width="{w}" height="{h+2}" fill="{color}" opacity="{op}"/>')
        if lit:
            for wy in range(base - h + 10, base - 8, 14):
                for wx in range(x + 7, x + w - 8, 12):
                    if random.random() < 0.16:
                        a(f'<rect x="{wx}" y="{wy}" width="5" height="6" fill="#FFD9A8" opacity="{random.uniform(.5,.9):.2f}"/>')
        if random.random() < 0.18:
            a(f'<rect x="{x + w//2 - 2}" y="{base-h-18}" width="3" height="18" fill="{color}" opacity="{op}"/>')
        x += w + random.randint(0, 6)
skyline(268, 40, 120, "#4A2020", ".55", False)
skyline(282, 26, 92, "#16202B", "1", True)
a(f'<rect x="0" y="280" width="{W}" height="{H-280}" fill="#0E161F"/>')
# the common shade: cool pool beneath the canopy
cx = 400
a(f'<ellipse cx="{cx}" cy="284" rx="330" ry="26" fill="url(#shade)"/>')
a(f'<path d="M150 176 Q {cx} 118 650 176 L 700 284 L 100 284 Z" fill="#3DBFAE" opacity=".07"/>')   # the cooler air under the sail
# canopy: one wide sail, held up together
a(f'<path d="M96 154 Q {cx} 46 704 154 L 704 172 Q {cx} 100 96 172 Z" fill="url(#canopy)"/>')
hem = "M96 172" + "".join(f" q 19 14 38 0" for _ in range(16))
a(f'<path d="{hem} L 704 172 Q {cx} 100 96 172 Z" fill="#C43E16" opacity=".0"/>')
for j in range(16):   # a scalloped hem, following the underside
    t0 = j / 16; tm = (j + .5) / 16
    x0 = 96 + 608 * t0; xm = 96 + 608 * tm
    y0 = 172 - 144 * t0 * (1 - t0); ym = 172 - 144 * tm * (1 - tm)
    a(f'<path d="M{x0:.0f} {y0:.0f} Q {xm:.0f} {ym+16:.0f} {x0+38:.0f} {172 - 144 * (t0+1/16) * (1 - t0 - 1/16):.0f}" fill="#D9481C"/>')
a(f'<path d="M96 154 Q {cx} 46 704 154" fill="none" stroke="#FFE3B8" stroke-width="2.4" opacity=".8"/>')
for k in range(1, 6):   # seams in the sail
    x = 96 + 608 * k / 6
    a(f'<path d="M{x:.0f} {154 - 216*(k/6)*(1-k/6):.0f} L {x:.0f} {172 - 144*(k/6)*(1-k/6):.0f}" stroke="#FFE3B8" stroke-width="1.2" opacity=".35"/>')
# faceless figures, arms up to the canopy; poles at the ends
a('<g fill="none" stroke="#F6E7D7" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">')
a('<path d="M100 166 V282 M700 166 V282"/>')
xs = [170, 240, 310, 372, 430, 492, 560, 628]
for i, x in enumerate(xs):
    t = (x - 96) / 608
    under = 172 - 144 * t * (1 - t) + 10            # the underside of the canopy above this figure
    small = i in (3, 5)                        # two children, standing in the shade
    head, body, leg = (9, 30, 28) if small else (11, 46, 42)
    hy = 282 - leg - body - head               # feet on the ground
    sh = hy + head + 8                         # shoulders
    a(f'<circle cx="{x}" cy="{hy:.0f}" r="{head}"/>')
    a(f'<path d="M{x} {hy+head:.0f} V{hy+head+body:.0f} M{x} {hy+head+body:.0f} L{x-11} 282 M{x} {hy+head+body:.0f} L{x+11} 282"/>')
    if small:
        a(f'<path d="M{x} {sh:.0f} L{x-12} {sh+16:.0f} M{x} {sh:.0f} L{x+12} {sh+16:.0f}"/>')
    else:
        a(f'<path d="M{x} {sh:.0f} L{x-13} {under+3:.0f} M{x} {sh:.0f} L{x+13} {under+3:.0f}"/>')
a('</g>')
a(f'<path d="M0 282 H{W}" stroke="#F6E7D7" stroke-width="2" opacity=".35"/>')
a('</svg>')
sys.stdout.write("".join(out))
