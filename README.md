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
- **a plain-language glossary**: technical terms are underlined with dots, and tapping one explains it.

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
| `images/SOCIAL_SHARE_IMAGE.jpg` | The preview picture shown when the link is shared | Only if you want a new preview |
| `CNAME` | Connects the site to the address beattheheat.asia | **No. Never delete this file.** |

The numbers at the top of the page (systems, consequences, cycles and so on) are counted automatically from `data.js`, so they stay correct when you add things.

---

## How to change or add content (in `data.js`)

Open `data.js` on GitHub and click the **pencil icon** (✏️). The file has fourteen numbered parts:

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
13. **ORGANISATIONS**: the heat network. Each organisation has a `role` (one of `ORG_ROLES`), a `name`, a `url` showing its heat work, a one-line `does`, and the `levers` its work pulls on. It then appears in the network section (which has a search box and shows 12 at a time) and in those levers' panels, and the "Where the gaps may be" list updates itself. Write \"not confirmed\" in `does` when an organisation's heat work has not been documented.
14. **GLOSSARY**: plain-language explanations. `match` is the word or phrase to look for; the first time it appears in a piece of text, it becomes tappable.

**To add a new consequence**, copy an existing line in part 2, give it a new `id`, then add at least one link to or from it in part 3.

Rules that keep the map working:

- Change only the text inside the quote marks, and keep every comma and quote mark where it is.
- Inside a sentence, use curly quotes (’ “ ”), never the straight `"`.
- If the map stops appearing after an edit, a comma or quote mark has probably gone missing. Open the file's **History** on GitHub to restore the last working version.

---

## Your LinkedIn link on the site

Your name and title appear only in the hidden author details at the top of `index.html` (for search engines and AI assistants). The footer says the site is independent of UNEP's Beat the Heat initiative. Visitors see "Tell us →" links and an "Explore working together →" button in the footer; all of them open your LinkedIn. To change the link, open `index.html`, press **Ctrl/Cmd + F** and search for `arunabhabhattacharya`.

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

The ten systems use quiet, muted tones (set in part 1 of `data.js`), so the meaningful colours stand out.

---

## How to upload files to GitHub

1. Go to github.com, sign in, and open the repository for beattheheat.asia.
2. Click **Add file → Upload files**, then drag in the files you changed. For the preview image, open the `images` folder first.
3. Files with the same name are replaced, which is what you want.
4. Click the green **Commit changes** button.
5. Wait 1–3 minutes. The **Actions** tab shows a green tick when the site has updated.
6. Open https://beattheheat.asia in a **private or incognito window** so you don't see an old saved copy.

**Do not delete the `CNAME` file.**
