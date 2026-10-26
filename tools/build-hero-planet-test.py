"""Builds hero-planet-test.html: the home page with the Living Heat Planet embedded in the hero.
A test page only: noindex, not in the sitemap, linked from nowhere. Re-run after the home page changes:
    python3 tools/build-hero-planet-test.py
"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
s = (root / "index.html").read_text()

def once(old, new):
    global s
    assert s.count(old) == 1, old[:60]
    s = s.replace(old, new)

once('<title>Extreme heat is a wicked problem | BeatTheHeat.Asia</title>', '<title>Test: live planet in the hero | BeatTheHeat.Asia</title>\n  <meta name="robots" content="noindex, nofollow">')
s = re.sub(r'\s*<link rel="canonical"[^>]*>', '', s)
once('</head>', '''<style>
  /* test layout: the hero copy on the left, the live planet in a dark window on the right */
  .hp-grid { display: grid; gap: 32px; }
  .hp-grid > * { min-width: 0; }
  .hp-planet { position: relative; margin: 0; }
  .hp-frame { position: relative; height: 520px; border-radius: 28px; overflow: hidden; background: #05070A; box-shadow: 0 30px 80px rgba(22, 32, 43, .28), inset 0 0 0 1px rgba(230, 232, 239, .08); }
  .hp-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  .hp-cap { margin-top: 12px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 16px; font-size: .875rem; line-height: 1.25rem; color: var(--grey-700); text-align: left; }
  .hp-cap a { font-weight: 600; color: var(--ink); }
  .hp-badge { display: inline-block; margin-bottom: 10px; padding: 3px 10px; border-radius: 999px; background: var(--ink); color: var(--canvas); font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  @media (min-width: 1024px) {
    .hp-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr); gap: 48px; align-items: center; text-align: left; }
    .hp-grid .intro__title { font-size: 4.5rem; }
    .hp-grid .intro__lede, .hp-grid .intro__proof, .hp-grid .intro__trust { margin-left: 0; margin-right: 0; }
    .hp-grid .intro__cta { align-items: flex-start; }
    .hp-grid .intro__side { margin-left: 0; }
    .hp-grid .intro__side-k { text-align: left; }
    .hp-frame { height: auto; aspect-ratio: 1 / 1; }
  }
</style>
</head>''')
once('        <p class="intro__flag">', '        <div class="hp-grid"><div class="hp-copy">\n        <p class="intro__flag">')
once('''        </nav>
        <dl class="stats">''', '''        </nav>
        </div>
        <figure class="hp-planet">
          <span class="hp-badge">Test · live data</span>
          <div class="hp-frame"><iframe src="/living-heat-planet/?embed=hero" title="The Living Heat Planet: capital cities lit by modelled current air temperature from Open-Meteo" loading="eager" allow="fullscreen"></iframe></div>
          <figcaption class="hp-cap"><span>Modelled air temperature in 207 capitals, from Open-Meteo. Not a risk map.</span><a href="/living-heat-planet/" target="_blank" rel="noopener">Open the full planet<span class="visually-hidden"> (opens in a new tab)</span> ↗</a></figcaption>
        </figure>
        </div>
        <dl class="stats">''')
(root / "hero-planet-test.html").write_text(s)
print("wrote hero-planet-test.html")
