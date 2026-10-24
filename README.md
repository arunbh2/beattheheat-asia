# BeatTheHeat.Asia: Extreme heat is a wicked problem

This website is an **interactive systems map** of extreme heat. It shows:

- **10 systems** under strain: nature and ecosystems, food and agriculture, water, energy, cities and infrastructure, health, work and economy, education, society and security, and governance and finance;
- **74 consequences**, from heat deaths to under-recorded deaths, from failing harvests to insurers pulling out;
- **the links between them**, including cross-system links that visitors can switch on;
- **18 vicious cycles**, in four groups: loops that feed the heat itself, loops that break the systems we rely on, loops that trap people, and loops inside institutions;
- **26 breaking points**, each tied to the link it cuts;
- **14 institutions** and the levers each one holds, each with a Sense → Decide → Act → Sustain playbook and a printable brief;
- **policy packages** that switch on several levers at once and show which loops break, and who has to act;
- **a path finder** ("How does X lead to Y?") and **a day in a heatwave**;
- **the evidence behind every vicious cycle**, with links to the original sources;
- **how soon each lever works** (this season, 1–3 years, or a decade or more), and a "Before this summer" package;
- **a 60-second tour** for first-time visitors;
- **the heat network**: organisations already working on heat, the levers they pull, and where the gaps may be;
- **Plan a response**: a workshop tool that turns the map into a one-page plan (who leads, who pays, how you will know it works), with Ahmedabad, Thane, Tamil Nadu, Singapore and Dhaka as worked examples;
- **a plain-language glossary**: 40 terms in six groups near the bottom of the page; across the site, these words are underlined with dots and tapping one explains it.

Visitors can drag and zoom the map, tap any dot, follow a ripple, walk through any vicious cycle, and choose an institution to see which loops it can help break.

It is a plain website. There is nothing to install and nothing to "build". GitHub shows these files to visitors exactly as they are.

---

## What is in this folder

| File | What it does | Do you need to edit it? |
|---|---|---|
| `data.js` | **All the content of the map**: systems, consequences, links, vicious cycles, breaking points, institutions | Yes, whenever you want to change or add content |
| `index.html` | The page around the map: the title, the section headings, "Why wicked?" | Only to change those words |
| `script.js` | The code that draws the map and makes it interactive | No |
| `styles.css` | Colours, fonts and layout | No |
| `media/` | The film (MP4), its captions (`.en.vtt`) and its poster image, shown from the “Watch the film” button | Only to replace the film: upload new files with the same names |
| `media/glossary/` | The 30-second glossary explainers: `<term id>.mp4` plus a `.jpg` cover with the same name. Add `video` and `length` to that term in part 14 of `data.js` and a play button appears | To add the next explainers |
| `media/loops/` and `media/films/` | Short films about a vicious cycle (named after the loop's id, e.g. `protection.mp4`) or a section (e.g. `heat-network-gaps.mp4`), each with a `.jpg` cover. Add `video` and `length` to the loop in part 4 of `data.js`, or an entry in part 16 (`SECTION_FILMS`, e.g. `same-heatwave-different-barriers.mp4`) | To add more films |
| `?v=` on `styles.css`, `data.js` and `script.js` in `index.html` | A version number that makes browsers fetch fresh copies instead of old cached ones | Raise the number whenever you change any of those three files |
| `media/day/scene.*` | The AI-generated rooftop footage behind the “A day in a heatwave” heading (`scene.mp4`, `scene.webm`, `scene.jpg` still), with a 1-second crossfade so it loops smoothly. It loads only as visitors approach the section, carries an “AI-generated footage, illustrative” note, and has its own pause button | Keep that note if you replace it with any AI-generated or stock footage |
| `media/loops-break/roofs.*` | AI-generated footage of rooftops being painted white, behind the “Where the loops break” heading, labelled as illustrative | All seven background videos (title, heatwave rooftops, white roofs, dusk street, rainfed field, drinking-water point and closing rooftops) always loop; only a visitor’s own pause stops them, and that choice is remembered |
| `media/wicked/dusk.*` | AI-generated dusk footage behind “Why wicked?” (“it lands unequally”), under a dark gradient so the white text stays readable, labelled as illustrative | Keep the gradient if you swap the footage |
| `media/atrisk/field.*`, `media/network/water.*`, `media/closing/rooftops.*` | AI-generated footage behind “Same heatwave. Different barriers.” (a woman carrying water across a rainfed field), “Who is already pulling the levers” (a public drinking-water point, mirrored so the pot sits away from the text) and the closing line (neem leaves over rooftops), each under a light wash so the text stays readable and labelled as illustrative | Keep the wash and the note if you swap the footage |
| `media/hero/` | The quiet background loop behind the title (`web.webm`, `web.mp4` and a `web.jpg` still), with no sound. It pauses only while scrolled out of view or when a visitor presses its pause button | To replace the loop: keep it under about 1 MB, the same off-white background (#FAF7F2), and the busy parts at the edges |
| `media/day/` | Films for "A day in a heatwave", named after the hour without the colon (e.g. `0200.mp4`), each with a `.jpg` cover. Add `video` and `length` to that hour in part 11 of `data.js` | To add or replace an hour’s film |
| `media/stalls/` | One short film per card in “Why action stalls”, named after the stall’s `id` (e.g. `owner.mp4`), each with a `.jpg` cover. Add `video` and `length` to that stall in part 18 of `data.js` |
| `media/stalls/office.*` | The AI-generated empty-office footage behind the “Why action stalls” heading (`office.mp4`, `office.webm`, `office.jpg` still), trimmed past a paper that blows off the desk and crossfaded into a seamless 6-second loop |
| `images/social-share-2.jpg` | The preview picture shown when the link is shared (1200 × 630). It quotes the counts of systems, vicious cycles and levers | When those counts change. Give the new file a new name and update the two image lines in `index.html`, so LinkedIn and WhatsApp fetch it again |
| `CNAME` | Connects the site to the address beattheheat.asia | **No. Never delete this file.** |

The numbers at the top of the page (systems, consequences, cycles and so on) are counted automatically from `data.js`, so they stay correct when you add things.

---

## How to change or add content (in `data.js`)

Open `data.js` on GitHub and click the **pencil icon** (✏️). The file has eighteen numbered parts:

1. **SYSTEMS**: the ten slices of the wheel.
2. **CONSEQUENCES**: every dot. Each one has an `id` (a short name with no spaces, used by the links), a `sys` (which system it belongs to), a `label` (`\n` starts a new line) and a `desc` (the description shown when someone taps it).
3. **LINKS**: arrows between consequences, written as `["from-id", "to-id", "Why one leads to the other."]`. Add `"loop"` as a fourth item for a link that closes a vicious cycle; it will be drawn in red.
4. **LOOPS**: the vicious cycles. `path` lists the steps in order, and the last step leads back to the first. Every step-to-step link must exist in LINKS.
5. **INSTITUTIONS**: who holds the levers.
6. **LEVERS**: the breaking points. `edge` is the link it cuts, `who` lists the institutions that can pull it, and `when` says how soon it works: `"season"`, `"years"` or `"decade"`. Every `"season"` lever is switched on by the "Before this summer" package automatically.
7. **STORIES**: the guided path "From field to family".
8. **LOOP_PLACES**: for each vicious cycle, places in Asia where it plays out ("Where to look").
9. **PACKAGES**: the policy packages in the "Break the loops" bar. Each lists the levers it switches on.
10. **PLAYBOOKS**: each institution's Sense → Decide → Act → Sustain chain, shown on the map and in its printable brief.
11. **HEATWAVE_DAY**: the six moments of "A day in a heatwave". The people are illustrative composites. A moment can also have a `fact` and a `source` (a label and a link).
12. **EVIDENCE**: the sources behind each vicious cycle, shown under "See the evidence". Each source has `by`, `title`, `url` and `finding`. Only add a source you have opened and checked.
13. **ORGANISATIONS**: the heat network. Each organisation has a `role` (one of `ORG_ROLES`), a `name`, a `url` showing its heat work, a one-line `does`, and the `levers` its work pulls on. It then appears in the network section (which has a search box and shows 12 at a time) and in those levers' panels, and the "Where the gaps may be" list updates itself. Write "not confirmed" in `does` when an organisation's heat work has not been documented.
14. **GLOSSARY**: the plain-language glossary. Each term has a `group` (one of `GLOSSARY_GROUPS`), the `term` as shown, a `match` (the words to look for in the map's text; use `|` between alternatives) and a short `text`. The first time a match appears in a piece of text, it becomes tappable. Add `auto: false` to keep a term in the glossary list only. Terms in the group `"extra"` are tappable but not listed. A term can also carry a `source` (`{ label, url }`), shown under its explanation; the “Nature in the city” terms cite *Nature-Based Solutions for Cities*.
15. **PLAN A RESPONSE**: `PLAN_GROUPS` (who a plan protects, and the actions suggested for each), `PLAN_PAYERS` (the “who pays” choices) and `WORKED_EXAMPLES` (real places, with documented actions, results, sources and a `note` on what is and isn’t documented; each needs a “Load the … example” button in `index.html`), and `PLAN_CHECKLIST` (what strong heat plans include, each with a documented example). Each lever in part 6 also has a `measure`, shown as a hint for “how you will know it is working”.
16. **SECTION_FILMS**: short films that open a section of the page.
17. **AT_RISK**: the “Who heat hits hardest” section. `AT_RISK_BARRIERS` holds the four questions (who receives the warning, who can move, who can earn, who has a say). Each group in `AT_RISK` has a `name`, what it is `exposure`d to, the `barriers` holding it back, the map dots in `nodes` (ids from part 2), the `levers` that help (ids from part 6), and optionally a `fact` with a `source`.
18. **STALLS**: the “Why action stalls” section and step 4 of “Plan a response”. Each condition has a `name`, a `sign` (how you can tell it is happening), three `moves` (what has shifted it elsewhere), the `levers` and `loops` it connects to, and optionally a `fact` with a `source` (add more under `more`). Conditions ticked in a plan appear, with their moves, in the printable plan and the copied text.

**To add a new consequence**, copy an existing line in part 2, give it a new `id`, then add at least one link to or from it in part 3.

Rules that keep the map working:

- Change only the text inside the quote marks, and keep every comma and quote mark where it is.
- Inside a sentence, use curly quotes (’ “ ”), never the straight `"`.
- If the map stops appearing after an edit, a comma or quote mark has probably gone missing. Open the file's **History** on GitHub to restore the last working version.

---

## The planning toolkit (part 19 of `data.js`)

“Plan a response” runs in six steps. Part 19 holds what steps 3, 4 and 6 use:
- `PLAN_PHASES` and `PLAN_PHASE_DEFAULT`: when each action happens (before the season, from a yellow, orange or red alert, after the season, or all year), with a starting point for every action.
- `PLAN_TRIGGER_BASES`, `PLAN_LEVELS` and `PLAN_CHANNELS`: what alerts can be based on (each with documented examples and sources), the three alert levels, and the ways warnings reach people (`offline: true` marks those that need no phone).
- `WHO_ELEMENTS`: WHO/Europe’s eight core elements of a heat-health action plan (2026). The check in step 6 tests the plan against each one; `add` lists actions that fill a gap and `step` points to the step that does.
- `PLAN_REVIEW` (questions for the after-season review) and `PLAN_WORKSHOP` (who to invite and a 90-minute agenda).

## Cooling options by place (part 20 of `data.js`)

The “Cooling options” section, just before “Plan a response”, shows what to build or change in eight places (homes, outdoor work, schools, markets, waiting areas, heat with waterlogging, greening where water is short, and making it last).
- `COOL_PLACES`: each place has what it protects, a key caution, a suggested measure, the actions on the map it relates to (`levers`), its options and sourced facts. Each option says what it does, what keeps it working, what to avoid and a rough cost.
- **Costs** are planning ranges in Indian rupees, taken from a practitioner’s selection workbook and checked against public figures where they exist (`src`). Ranges rated `"low"` confidence are never shown: the card says “get local quotes” instead. Don’t add a cost without a confidence rating.
- `COOL_TRAPS`, `COOL_EVIDENCE` and `COOL_VALUE`: five traps that waste cooling money, four findings that change the result, and the Guangzhou wetland valuation.
- `COOL_ASSET_LEVERS`: actions that build or run cooling assets. For these, step 3 of the plan asks who keeps it working after year one, and the summary flags any with no one named.
- Findings from *Nature-Based Solutions for Cities* (Edward Elgar, 2023, open access, CC BY-NC-ND) are cited, never adapted: quote a fact with its chapter, and don’t copy its tables or figures.
- `COOL_READING`: free books and guides found in the book’s reference lists, each checked as open access, shown at the end of the section.
- “Add these actions to my plan” copies the place’s actions into the plan, with its measure when none has been typed. A link to `#cool-<id>` (for example `#cool-flood`) opens that place.

## Heat right now (part 21 of `data.js`)

“Heat right now” shows live readings for ten cities: Singapore, Bangkok, Hanoi, Manila, Jakarta, Delhi, Dhaka, Kathmandu, Mumbai and Ahmedabad. It shows the current temperature, the feels-like temperature, today’s high and humidity, plus Singapore’s measured wet-bulb globe temperature.
- **Where the data comes from:** the visitor’s browser fetches it directly from [Open-Meteo](https://open-meteo.com/) (model data, free for non-commercial use, CC BY 4.0, credit shown on the page) and from NEA on data.gov.sg. There is no server and no key.
- **Caching:** results are kept in the browser for 30 minutes, so the site stays well within Open-Meteo’s fair-use limit of 10,000 requests a day.
- **When it fails:** if a source can’t be reached, or a reading is more than three hours old, the card says so rather than showing an old number. After a failure the page waits two minutes before trying again.
- **Never an official warning:** every city links to its national weather service (`warn`). Change a city or its warning link in `LIVE_CITIES`.
- **The plan check:** step 4 of “Plan a response” can test the alert levels you typed against a city’s seven-day forecast, and lists what each day would switch on. WBGT levels are not tested, because the feed has no WBGT forecast.
- **If Open-Meteo’s terms change,** or the site becomes commercial, the request in `liveFetch()` in `script.js` is the one place to update.

`LIVE_FINGERPRINT` adds "Is this climate change?" under the city cards: three figures from Climate Central's summer analysis, and a link on each card to its Climate Shift Index map. When Climate Central publishes a new seasonal analysis, update `season`, `facts` and `source`.

## What each cycle costs (part 24 of `data.js`)

`LOOP_STAKES` gives each vicious cycle one headline figure: what it costs while it keeps turning (`kind: "cost"`), or what breaking it has been shown to save (`kind: "saves"`). It appears in the loop's first step on the map, in the Vicious cycles section and on `/loops/`. Each figure must come from a source already listed for that loop in `EVIDENCE`. A loop with no solid figure is left out, and the site says its cost is not yet measured. `where` names the place a figure comes from, and `sea` adds a second figure from Southeast Asia where the first comes from elsewhere. Add any new figure to `EVIDENCE` too.

## Your city (part 25 of `data.js`)

`CITY_PROFILES` gives each of the ten live cities a view of its own: a line about the city, whether it has a heat action plan (`hap.status`: `plan`, `building` or `none`, with sources), the vicious cycles the evidence ties to it (each with a one-line reason drawn from evidence already on the site), the groups hit hardest, worked plans and organisations already at work. The section draws a map of the cities on `images/asia-map.svg`: land in one colour with no national boundaries (Natural Earth land, public domain), so the map takes no position on any border with each dot coloured by today’s feels-like temperature. Links like `beattheheat.asia/#city-dhaka` open a city directly, and `/cities/` has a text page for each one. To add a city, add it to `LIVE_CITIES` and `CITY_PROFILES`, then run `node tools/build-static.js`.

## Visit counting (part 22 of `data.js`)

Visits are counted with [GoatCounter](https://www.goatcounter.com/), which uses no cookies and collects no personal data. `SITE_ANALYTICS.goatcounter` holds the counter’s code; leave it empty (`""`) to switch counting off, and nothing is loaded. As well as page views, `track()` in `script.js` records a few anonymous events, each named for what it counts: films and explainers watched (`watch-…`), plan buttons (`plan-print`, `plan-copy`, `plan-map`), worked examples loaded, forecast checks by city, cooling options added to a plan, and briefs opened. The privacy note in “How this map works” describes this.

## Start here, the first five minutes, and phones (part 23 of `data.js`)

- **Start here** sits just below the title. It asks “What do you want to do?” (`START_INTENTS`), with an optional “Looking at it as” role taken from the institutions in part 5, and shows a three-step path through the site. With a role chosen, the path shows that institution’s actions and cycles, and “Start the plan” adds its actions to “Plan a response” with that institution as the lead. Choices are remembered in the visitor’s browser.
- **The first five minutes** (`FIRST_FIVE`) is a slim guide bar under the header with four stops: one loop, one group at risk, one place it breaks, then the plan. Each stop’s `go` names a loop, an at-risk group, a lever or a plan group.
- **Phones only** (760 px wide or less): each section in `SECTION_SUMMARIES` opens as its heading and introduction with one button, whose label is the text given there. Long lists show the first few with a “Show all” button, and “Heat right now” shows the three cities that feel hottest first. Desktop always shows everything. Any link, guide stop or map action that points inside a collapsed section opens it first.

## Banks, regulators and microfinance

The heat network has a filter for **Banks, regulators and microfinance**: central banks and financial regulators in South and Southeast Asia (Singapore, Thailand, Indonesia, the Philippines, Vietnam, Bangladesh, Nepal and India), the regulators’ network SBFN, and lenders piloting climate-adaptation loans. Each entry says what the rule or programme does today and, where true, that heat is not yet among its triggers. The “Heat-smart lending” lever (part 6) holds the regional examples of disaster-triggered loan relief.

## Search engines and AI systems

The map is drawn with JavaScript, which most AI crawlers (and some search engines) do not run. So the same content is also published as plain pages that anyone, or any crawler, can read:

- `/the-web/`, `/loops/`, `/actions/`, `/who-is-at-risk/`, `/cooling-options/`, `/worked-plans/`, `/glossary/`, `/heat-network/` and `/cities/` (with a page per city), linked from the footer;
- `llms.txt` (a short guide for AI systems) and `llms-full.txt` (the whole map as text);
- `sitemap.xml`, and `robots.txt`, which welcomes search engines and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others).

**These files are generated. After you edit `data.js`, run `node tools/build-static.js`** and upload the changed files with it. Never edit the generated pages by hand.

## Licence

Text, data, films and illustrations: **CC BY 4.0** (see `LICENSE`). Code: **MIT** (see `LICENSE-CODE`). Both name "BeatTheHeat.Asia contributors" as the rights holder. Linked sources, quotations and organisations' names and logos are not covered. The notice appears in the footer, in the home page's structured data, on the text pages and in `llms.txt`.

## The menu at the top

The bar at the top has a few quick links and an **All sections** button. The button opens every section of the page in three chapters (See the system, Act on it, Go deeper), numbered in page order. Both live in the `<header class="site-header">` at the top of `index.html`. If you add a new section, give it an `id` and add a line for it in the `site-menu` list, in page order. The bar and the menu mark the section on screen as “You are here” by themselves.

## Your LinkedIn link on the site

Your name and LinkedIn appear only in the hidden author details at the top of `index.html` (for search engines and AI assistants). There are no visible links to LinkedIn on the page. To change or remove the hidden ones, open `index.html`, press **Ctrl/Cmd + F** and search for `arunabhabhattacharya`.

---

## The colours

The site uses a "heat-risk" palette. Each colour has one job:

| Colour | Used for |
|---|---|
| Deep charcoal navy `#16202B` | Text and structure |
| Heat orange `#F26430` | The heat itself, headline highlights and main buttons |
| Emergency red `#D7263D` | Vicious cycles and urgent numbers only |
| Resilient teal `#1F7A70` | Where loops can be broken, and who holds the levers |
| Cool blue `#2E6F95` | Cross-system links |
| Amber warning `#F5A623` | "You are here" highlights and keyboard focus |
| Warm sand `#F6E7D7` and off-white `#FAF7F2` | Calm backgrounds |

The ten systems use quiet, muted tones (set in part 1 of `data.js`), so the meaningful colours stand out. A crowded system can get more room: `space: 2` widens its slice of the wheel, `rings: 3` spreads its consequences over three rings, and `labelAt: "above"` on a consequence (part 2) puts its name above the dot instead of below.

Evidence links: a consequence (part 2) can carry `sources: [{ label, url }]`, shown as “Evidence” under its description, and a lever (part 6) with an `example` can carry `exampleSources: [{ label, url }]`, shown under the example. Only add sources you have opened and checked.

---

## How to upload files to GitHub

1. Go to github.com, sign in, and open the repository for beattheheat.asia.
2. Click **Add file → Upload files**, then drag in the files you changed. For the preview image, open the `images` folder first.
3. Files with the same name are replaced, which is what you want.
4. Click the green **Commit changes** button.
5. Wait 1–3 minutes. The **Actions** tab shows a green tick when the site has updated.
6. Open https://beattheheat.asia in a **private or incognito window** so you don't see an old saved copy.

**Do not delete the `CNAME` file.**
