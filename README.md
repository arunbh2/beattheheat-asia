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

“Plan a response” has a page of its own, `/plan/` (`plan/index.html`, with `<body data-page="plan">`). It runs the same `script.js`: on that page the map’s parts are absent, so `need()` gives the shared code stand-ins and `bootPlanPage()` renders only the plan. On the map, the section is a launcher with a one-line summary of the plan so far. Links into the plan (`#plan-step-3` and the like, “Draft a plan for…”, worked examples, “Start your plan”) open `/plan/` in one named tab (`bth-plan`), so repeated clicks reuse it; links from the plan back to the map open in the map’s tab (`bth-map`). Both pages keep the plan in this browser, and a `storage` event keeps them in step. Old links such as `/#plan-step-4` redirect to `/plan/#plan-step-4`. A prefilled link starts a plan: `/plan/?place=Dhaka, Bangladesh&group=workers&actions=heatrules,coolingcentres` (with only a group, its suggested actions are added); if a plan is already started, the page asks before replacing it. “Copy a link to start this plan” makes such a link from the current plan, carrying only the place, group and actions, never notes, owners or money. “Draft a plan for…” in Your city opens the plan with that city filled in. The site menu still goes to the launcher. Part 34 of `data.js` adds to the plan page, several ideas adapted (in our own words, with page references) from the MCR2030 Urban Heat Risk Management Resource Package (2025), which is evidence of institutional practice from interviews in late 2024, not an impact evaluation: in step 3, **where each action stands** on the same ladder as Make it work together (Proposed → Reviewed; Agreed or beyond counts only with evidence), a bar showing where the whole plan stands, and `PLAN_CAPACITY` (what existing capability or budget can help, and what support to request, from whom, for which decision); in step 1, `PLAN_POINTS`, **where people can go** (each place listed, operation confirmed or status unknown, with who may not reach them); in step 4, `PLAN_COUPLING`, **advice paired with what makes it possible**, with a live preview of the alert message that uses only confirmed provisions; in step 5, `PLAN_CONTINUITY`, **when the power goes**, a stress test of essential services under chosen disruptions that lists unresolved dependencies and gives no score; and `PLAN_MECHANISMS`, **adapt the mechanism, not the city**, five city cards (Amadora, Incheon, Cape Town, Quito, Nairobi), also on the worked-plans text page. All of it is saved with the plan, copied as text and printed. “Plan a response” runs in six steps. Part 19 holds what steps 3, 4 and 6 use:
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

`LIVE_LEVELS` holds each national weather service’s published warning bands (PAGASA, the Thai Meteorological Department and Sri Lanka’s Department of Meteorology by heat index; Bangladesh, Vietnam and India by the day’s high; Singapore by measured WBGT). The ticker and city cards name the band a city is in, as our estimate (heat index from the US National Weather Service formula), never as an official warning; Nepal, Indonesia and Cambodia are not flagged, because no published bands were found. Under the city cards, “Heat in the news, and new research” lists headlines from `feeds/news.json` (refreshed every six hours by `.github/workflows/heat-news.yml`, which runs `tools/fetch-news.js` against the GDELT Project and leaves out headlines framed around politics or conflict; the page reads it from raw.githubusercontent.com so new headlines need no rebuild) and papers searched live in Europe PMC (heat in the title, an Asian setting, the last 120 days, cached for six hours). A thin ticker above the header scrolls the same live readings (temperature and feels-like, the hottest city flagged); each city opens its view in Your city. It pauses on hover, on keyboard focus and with its Pause button, stands still for people who prefer reduced motion, and stays hidden if the readings cannot be loaded. Because of the ticker, the live reading is now fetched when the page opens, then cached for 30 minutes as before. “Heat right now” shows live readings for twelve cities: Singapore, Bangkok, Hanoi, Manila, Jakarta, Delhi, Dhaka, Kathmandu, Mumbai, Ahmedabad, Colombo and Phnom Penh, so every country in “A week in the heat” has a city. Each card links to that country’s workers in the exercise. It shows the current temperature, the feels-like temperature, today’s high and humidity, plus Singapore’s measured wet-bulb globe temperature.
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

`CITY_PROFILES` gives each of the twelve live cities a view of its own: a line about the city, whether it has a heat action plan (`hap.status`: `plan`, `building` or `none`, with sources), the vicious cycles the evidence ties to it (each with a one-line reason drawn from evidence already on the site), the groups hit hardest, worked plans and organisations already at work. The section draws a map of the cities on `images/asia-map.svg`: land in one colour with no national boundaries (Natural Earth land, public domain), so the map takes no position on any border with each dot coloured by today’s feels-like temperature. Links like `beattheheat.asia/#city-dhaka` open a city directly, and `/cities/` has a text page for each one. To add a city, add it to `LIVE_CITIES` and `CITY_PROFILES`, then run `node tools/build-static.js`.

## Heatwaves that shaped Asia (part 26 of `data.js`)

`HEATWAVES` lists major heatwaves in South and Southeast Asia, oldest first: when and where, the peak, the recorded toll, what happened, what changed afterwards, the map nodes involved and sources. `deaths` sizes each circle on the timeline and is the recorded toll only (a floor, never a total); leave it `null` where no solid count exists. Add an event, then run `node tools/build-static.js` to update `/heatwaves/`.

## Four heats in a home (part 27 of `data.js`)

`HOME_HEATS` drives the interactive drawing in Cooling options: outdoor air, the roof, radiant heat and indoor air, a night view, sourced facts, the daytime nuance and a line for heat plans. Heat right now links to it with a note that warnings track the street, not the room. The film `media/films/four-heats-in-a-home.mp4` is registered in `SECTION_FILMS`.

## Find practical actions (part 29 of `data.js`)

The title has one front door, **Find your way in** (to the guide below it), and two quieter side doors: **Find practical actions** and **Explore the system**. `ACTION_SETTINGS` drives the action finder: six settings (outdoor and hot workplaces, homes, schools and childcare, health facilities, markets and neighbourhoods, and before summer for municipalities), each with short cards. Every card answers the eight questions in `ACTION_LINES`: what to do, who it protects, where it suits, who must act, running and upkeep, evidence, what could stop it, and what it only works with. A card links to its action on the map (`lever`), can be added to the plan in one tap, and pulls a rough cost from Cooling options when it names one (`cost`). `ACTION_JOURNEYS` lists the questions people arrive with; “Why are our interventions failing?” opens the seven reasons action stalls. Links such as `/#practical-clinics` open a setting. Each setting has a printable card sheet (`/print/actions-<id>/`) and all cards are on the text page `/practical-actions/`. Start here now puts “Find practical actions” first. The section sits under **Act on it**, directly before Cooling options, and the two link to each other: a setting with a matching place (`cool`) links to its options, costs and traps, and Cooling options points back to the practical actions.

## Evidence labels, time horizons and delivery

`EVIDENCE_STATUS` gives every practical action card, example and finance case a label for the kind of evidence it cites: design concept, simulation or test, reported but not evaluated, official guidance or data, measured in a study, or independently evaluated. It describes the evidence, not the action, and the key sits in How this map works. `ACTION_HORIZONS` tags each card as during the heat, before the season or over years, with a filter. Cards can carry `examples` (each with its own label and source) and `delivery` details. The Workplaces setting opens with six problems workers raised in People’s Courage International’s study, each linking to a card. In the plan, step 3 asks “Can we deliver this?” for each action (`PLAN_DELIVER`), step 4 has warnings that work both ways (`PLAN_TWOWAY`), and the after-season review records what changed (`PLAN_REVIEWLOG`). Settings with more than six cards print as several sheets of five. The Extreme Heat Risk Governance Framework and Toolkit (GHHIN, UNDRR and WMO, 2025) is linked, not reproduced, as the self-assessment to run in a workshop.

## Make it work together (part 33 of `data.js`)

`PLACE_SIM` drives a coordinator’s simulation on its own page, `/together/` (code in `together.js`), opened in a new tab from a card under the Plan a response launcher. It is for NGOs, volunteer groups and anyone helping one place get ready for heat. Three hypothetical places (a wholesale market, a cluster of garment workshops, a village at harvest), each with three composite people, the bodies whose agreement protection depends on, and measures broken into requirements. Six steps follow six capabilities: understand local risk; understand who decides what (marking a role as confirmed locally only with a note of how you know, and who is not yet at the table); help agreements form (each requirement has an owner and a status on the ladder Proposed → Discussed → Agreed → Funded → Operating → Reviewed; naming an owner is not agreement, and Agreed or beyond counts only with evidence); prepare money (set-up and season running costs, who pays); support the season (run a five-day alert week: each measure works only on the days all its requirements hold, so a strip shows each person’s hours in dangerous heat and days’ pay lost, and a list says what broke and who can resolve it, plus a simple routine); and learn and make it last (protection questions after the season, signs it will outlast the project, and a printable place protection plan listing the decisions partners still need to make together). Names, places and bodies can be renamed to match a real place; everything stays in the browser. Six principles frame it as a tool for cooperation through existing mandates, never for campaigning or assigning blame. It adds up hours and pay; it never scores and never predicts illness.

## A week in the heat (part 32 of `data.js`)

`HEAT_WEEK` drives an exercise for funders, officials and NGOs. It runs on its own page, `/a-week-in-the-heat/` (code in `heatweek.js`), which opens in a new tab; `?c=bd` opens a country and `?p=rahim` a worker. At the start of Act on it, the map shows a launcher card for each worker, and every city in Heat right now and Your city links to its country’s workers. The page links back to each country’s cities on the map. Actions added to a plan from the page are saved to the same plan in the browser. “Send to a colleague” gives a link to the worker (copy, email or the device’s share sheet); with the box ticked, the link also carries the numbers, package and tests as base64url JSON in `?k=`, read back with every field checked against the data. Choose a country, then a composite worker: in India a vendor, a construction worker at a labour naka and a home-based garment worker; a rickshaw puller in Dhaka; a brick-kiln worker in Nepal’s Terai; a fish seller in Negombo, Sri Lanka; a garment worker in Phnom Penh; an app-based motorbike rider in Jakarta; a street food vendor in Metro Manila; a home-based garment worker in Bangkok; a rice farmer in the Mekong Delta; a migrant construction worker in Singapore. Effects include `sickpay` (paid on a day of illness), alongside hours, water, rest, money, free care, rent-free hot days and keeping a bonus. Each country (`countries`) sets the currency, the hot week’s temperatures, local costs and a sourced “what is known” panel. A worker can carry a protected share of pay (a monthly wage that heat cannot cut), a bonus lost if ill, local payment sizes, measures already required by law (`defaults`) and local wording for a measure (`mtext`). Set their ordinary day and the hot days, and watch their cash fall day by day. Build a package across four layers: cut the heat they face, make it possible to stop, protect what they spend, make it reach them. A measure counts only when every condition for using it holds (a cooling station far from the naka does not count). Then break it: money arriving late, insurance not triggering, falling ill without being admitted, water or power failing, missing ID, donor money ending. Agree who pays and who keeps each part running, open a printable worker protection plan, or add the actions to Plan a response. The tool only adds up cash; it never predicts illness, productivity or payouts and gives no score. Its classes use the `wk-` prefix, separate from the heatwave timeline’s `hw-`.

## Paying for protection (part 30 of `data.js`)

`FINANCE` drives a section in Act on it, between Cooling options and Plan a response: what needs paying for and when the money must arrive, three kinds of trigger (warning, action, payout), basis risk in heat terms, the path from trigger to protection, questions on whether it will survive the next season, and three cases (heat income cover in India; Lao PDR’s sovereign cover; Philippine fishers’ cover for unsafe days), each saying who paid, who received it, what it left out and whether it continued. It draws on two Global Asia Insurance Partnership reports (2026), checked page by page; the parametric report did not evaluate consumer outcomes, pricing, contracts or trigger performance, and the section says so. In the plan, step 3 records a route and an arrival date for each need and the path money takes to people; step 4 keeps any payout trigger separate from the action triggers. One-pager: `/print/paying-for-protection/`; text page: `/paying-for-protection/`.

## Weather, work and the person (part 28 of `data.js`)

`STRAIN` drives a three-circle explainer in Who heat hits hardest: heat strain is where the weather, the work and the person meet. Each part carries sourced facts, including a counterpoint where the evidence finds no harm at modest strain. Three groups heat plans often miss follow: people on long-term medicines (explained as a mechanism, with a reminder never to change a medicine without a clinician), health workers in protective gear, and workers in hot factories. It has a one-pager (`/print/weather-work-person/`) and a film (`media/films/weather-work-and-the-person.mp4`, registered in `SECTION_FILMS`). It is never a risk score.

## Evidence cards

Each `EVIDENCE` entry can carry `type`, `where`, `scale` and `limit`, shown under its finding in the evidence drawer, the loops text page and the exports. An optional `reading` holds an interpretation the source does not state, and is labelled “Our reading” so it is never mistaken for the finding.

## Plan a response: exposure and warning-to-action

`PLAN_EXPOSURE` adds questions to step 1; each one ticked adds a prompt to discuss, never a score. `PLAN_W2A` adds a warning-to-action table to step 4: for each alert level, who decides, who acts, who pays, by when, the fallback and how you confirm it happened. Both are saved with the plan and appear in the copied and printable plan.

## Cooling cards: questions before you choose

`COOL_ASK` adds questions to every cooling place panel and sheet: the three goals of avoid, improve and expand access, the running needs of each option (power, power cuts, water, servicing, who pays each year, who can use it), and a reminder to keep outcomes apart. The Homes place carries a `kitchen` prompt on kitchen heat.

## Printable one-pagers (`/print/`)

`tools/build-print.js` makes single-page A4 sheets from `data.js`: Four heats in a home, Dry heat and humid heat, a brief for each city, Lessons from Asia’s heatwaves, and a cooling-options sheet for each place, plus an index at `/print/`. Each carries the brand, the beta disclaimer, the CC BY 4.0 licence, its sources and a QR code to the live page, and shrinks itself to fit one page when printed. They are rebuilt with everything else by `node tools/build-static.js`. For QR codes, run `npm install` once (it installs the `qrcode` package); without it, sheets print the web address instead. The site links to them from Cooling options, Four heats in a home, Your city, Heatwaves and the footer.

## Visit counting (part 22 of `data.js`)

Visits are counted with [GoatCounter](https://www.goatcounter.com/), which uses no cookies and collects no personal data. `SITE_ANALYTICS.goatcounter` holds the counter’s code; leave it empty (`""`) to switch counting off, and nothing is loaded. As well as page views, `track()` in `script.js` records a few anonymous events, each named for what it counts: films and explainers watched (`watch-…`), plan buttons (`plan-print`, `plan-copy`, `plan-map`), worked examples loaded, forecast checks by city, cooling options added to a plan, and briefs opened. The privacy note in “How this map works” describes this.

## The title (hero)

The hero has one job: get a first-time visitor to the right place. In order, it shows:
- An eyebrow linking to the UN Secretary-General's Call to Action on Extreme Heat (July 2024), so the opening claim carries its source.
- The headline. "Wicked problem" never breaks across lines.
- A subheadline that says what the site is, where and for whom.
- A proof line: consequences and cycles counted from the data (`data-stat`), every consequence sourced.
- One primary button, **Find your way in**, with a trust line: free, no sign up, what you type stays in the browser.
- Two quieter side doors for visitors who already know what they want.

Sizes and spacing follow a fixed scale: 12, 14, 16, 18, 20, 24, 36, 48, 72 and 96px type; 4 to 64px spacing.

The three tool pages follow the same pattern (`.tool-h1`, `.tool-lede`, `.tool-cta`). Each shows a short introduction, one primary button that scrolls to the first step, and a trust line next to it:
- **Make it work together:** "Start with a place".
- **A week in the heat:** "Start the exercise", which lands on a "Start here: choose a country, then a worker" prompt.
- **Plan a response:** "Start your plan", which lands on step 1. The worked examples sit underneath as quieter choices ("Or start from a worked example"). The five-cities mechanisms (`#plan-mech`) now follow the plan, as the toolkit's "learn from others" step.

## Find your way in (part 35 of `data.js`, `guide.js`)

The site is large, so first-time visitors get one guide instead of several competing entry points. `GUIDE` in part 35 holds it all; `guide.js` draws it.

- **Find your way in** sits just below the title (`#start`, drawn into `#wayin`). Two questions: *What brings you here?* (Understand heat · Help people this season · Build a plan with others · Fund or support this work · Protect my community or workplace, for community groups and workers’ organisations) and *How much time do you have?* (5 minutes · half an hour · a workshop). Each of the fifteen answers maps to a short path in `GUIDE.paths`: an ordered list of stops from `GUIDE.stops`, each with what it does, how long it takes, which tool it is, what you leave with, and one button. Stops tick off as they are used; the answers are remembered in this browser (`bth-guide-v1`). The film, the guided tour and the first five minutes are now stops on these paths rather than separate buttons.
- **Your toolkit** (`GUIDE.toolkit`, drawn into `#toolkit`) shows the five tools in the order they build on each other: Feel it (A week in the heat), Find what works (Practical actions and Cooling options), Plan it (`/plan/`), Make it work together (`/together/`), Learn from others (the five city mechanisms). Each tool's own page carries a slim **signpost** bar (`#signpost`, step N of 5, and what comes next) and a box saying who it is for, how long it takes and what you leave with (`#signpost-box`).
- **`/guide/`** is the same guide on its own page, with the site in four parts, a 90-minute workshop running order (`GUIDE.workshop`, `GUIDE.workshopTips`) and a few things good to know. Its stops reach the map through `/?go=film|tour|five`, which `goFromQuery()` in `script.js` reads and then removes from the address.
- **A printable facilitator's guide**, `/print/workshop-guide/`, has the running order, the five tools, tips and a pre-session checklist.
- **A community version**, `/print/community-workshop-guide/` (`GUIDE.workshopCommunity`, `workshopCommunityTips`, `workshopCommunityBefore`), is for community groups and workers’ organisations. It is in plain language: start from what people know, follow one worker’s week, find what the group can do itself, and see who else needs to say yes. A blank table records what the group will do and what it will ask of whom, with each request written as an invitation to work together. It is the first stop on the community workshop path, and is linked from the guide.
- **A welcome card** appears once, bottom left, on a first visit to the home page (not when arriving on a link to a section). It goes away when closed, when the visitor answers a question, or when they scroll to the guide.

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

## The 20-second social reel (`tools/reel/`)

`media/social/beattheheat-reel-20s.mp4` is a 20-second motion piece for LinkedIn: 1080×1350 (4:5), 60 fps, H.264 with an AAC soundtrack at −16 LUFS. `beattheheat-reel-20s-cover.jpg` is its thumbnail.

It is drawn frame by frame in `tools/reel/reel.html` from the map's own data: the ten systems, the consequences, the vicious cycles, the actions, the poverty–heat trap and the five tools. It runs in seven scenes:
1. Extreme heat.
2. A wicked problem.
3. The web of consequences.
4. A vicious cycle, and where it breaks.
5. Protection that reaches people.
6. The five tools.
7. The closing lockup.

**Watching and re-rendering.** Open `reel.html` in a browser to watch it play. Run `node tools/reel/render.js` to render it again; this needs Playwright with Chromium, ffmpeg and python3. `tools/reel/sound.py` synthesises the soundtrack and times it to the cuts. The fonts are kept in `tools/reel/fonts/` under the SIL Open Font License. If the data changes, render it again and the numbers follow.

## The Living Heat Planet (`apps/living-heat-planet/`, served at `/living-heat-planet/`)

A separate application: a particle Earth of 207 capitals, lit by their modelled current air temperature from Open-Meteo, with city dossiers (now and the next 72 hours). Later layers (patterns, people, preparedness, solutions, investment) have typed contracts and show honest "not integrated" states.
- **Source and documentation:** `apps/living-heat-planet/`, with its own README, `docs/` and tests.
- **Built copy:** `living-heat-planet/` is the copy the site serves. Rebuild it with `npx vite build --mode static` from the app folder. On GitHub Pages it calls Open-Meteo from the visitor's browser, with a 20-minute cache on the device.
- **Test page:** `hero-planet-test.html` is the home page with the planet embedded in the hero. It is noindex, outside the sitemap and linked from nowhere. Regenerate it with `python3 tools/build-hero-planet-test.py` after changing the home page.

## The menu at the top

The bar at the top has a few quick links and an **All sections** button. The button opens with “New here? Find your way in”, then every section in four groups: **Understand**, **Act**, **Tools** (the exercise, the plan, the coordinator's simulation and the guide; pages that open in a new tab are marked ↗) and **Reference**. Both live in the `<header class="site-header">` at the top of `index.html`. If you add a new section, give it an `id` and add a line for it in the `site-menu` list, in page order. The bar and the menu mark the section on screen as “You are here” by themselves.

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
