# Explore a market: maintainer guide and editorial review

**What it is.** An illustrative market on `/practical/`: "What could a heat-resilient market look like?". Visitors choose one of six features (stall canopy, drinking-water point, resting place, nearby building roof, tree and vendor). Each opens short notes: what could help, what makes it work, people to involve, links to existing guidance, and the evidence behind it. It introduces action. It is not a planner, a risk assessment or a simulation.

**Where it appears**
- `/practical/`, between the introduction and the existing question buttons and setting tabs. It is closed until someone chooses **Explore a market**. **Go straight to the action cards** skips it.
- The home page's **Find practical actions** section has a small card linking to `/practical/#market`. It opens in a new tab, like the existing practical-actions link beside it.
- In Cooling options, the **Markets and street vending** panel links to it with **See it in a market**.
- `/practical-actions/#market` has the same notes as plain text, for readers without JavaScript and for search.

## The three parts, kept apart

| Part | File | What to edit there |
|---|---|---|
| Words and sources | `data.js`, `MARKET_EXPLORER` (part 29b) | Titles, panel text, roles, links, evidence and limits |
| Drawing | `tools/build-market-scene.py`, which writes `media/market/market.svg` | Shapes, positions and the six selectable groups |
| Behaviour | `market.js`, with styles under "Explore a market" in `styles.css` | Selection, the tour, links in the URL, fallbacks |

### To change a panel
Edit that hotspot in `MARKET_EXPLORER.hotspots`. Keep "What could help" to about 30 to 50 words and "What makes it work" to about 25 to 40. "People to involve" lists suggested roles; never name organisations as if they had committed.

A link in `look` that starts with `#` follows the site's own routing:
- `#practical-…` opens a setting on the practical page.
- `#cool-…` opens cooling options on the map.
- `#plan` opens the planner.
- `#finance` opens Paying for protection.

Then run `node tools/build-static.js` so the text version and `/sources/` update.

### To change or add a source
Each `evidence` item needs a `status` (an `EVIDENCE_STATUS` key), its `text` and `source: { label, url }`. Reuse a reviewed action record and keep its label: the label describes the kind of evidence, not how good the action is. Write an honest `limit` for each hotspot. Do not add temperature reductions, health effects, wage gains or costs unless a source supports them for this kind of place.

### To change the drawing
1. Edit `tools/build-market-scene.py` and run `python3 tools/build-market-scene.py`.
2. Each feature is a `<g class="mx-feat" id="mx-ID">` whose `ID` matches a hotspot `id` in `data.js`. Inside it is a hidden `.mx-halo`: the dashed outline and name tag shown when the feature is chosen.
3. If a feature moves, update its `pin` (in the drawing's 1000 × 640 units) in `data.js`.
4. Raise `?v=` on `market.svg` in `market.js`, `practical/index.html` and `index.html`.

Figures stay drawn and faceless, in the site's stroke. The scene is illustrative and its caption says so.

## How it behaves
- It opens on request. Nothing moves on its own: no autoplay, sound, endless animation or camera travel. Choosing a feature outlines and labels it, dims the others and opens its notes.
- The tour (**Show me around**) shows "2 of 6", with Previous, Next or Finish, and Stop the tour. It never advances by itself.
- The six list buttons are the keyboard path. The numbered pins on the drawing do the same for pointer users, and so does clicking a feature, but they are not tab stops, so keyboard users do not meet each control twice.
- Choosing a feature writes `#market-ID` to the address with `replaceState`, so links like `/practical/#market-water` open on that feature and the Back button is not flooded.
- If the drawing fails to load, a message says so and the list and notes still work. Without JavaScript the button stays hidden and the text version is offered.
- It writes nothing to browser storage and does not touch the saved plan. It adds no trackers.

Layout:
- Wide screens: features, drawing, notes.
- Middle widths: the notes sit below.
- Phones: drawing, then features, then notes.
- Every control is at least 44 × 44 CSS pixels.

## Checks run at release (27 October 2026)
An automated browser script (Playwright) checked:
- the explorer stays closed until asked;
- each of the six features opens the right notes, outline and address;
- the pins select their features;
- the tour: Previous and Next, Finish, no automatic advance, and where focus goes;
- a "Look closer" link opens the markets setting;
- Close returns focus to the button;
- the saved plan and storage are unchanged;
- direct entry by `#market-water`;
- a failed drawing load;
- the page with JavaScript off;
- phone order and no sideways scroll, with reduced motion on;
- targets of at least 44 px;
- the home card link.

The site-wide audit also ran: accessibility (axe), overflow, page errors and links on 68 pages.

**Not done.** No screen-reader session with a person (the checks were automated), and no user testing.

## Editorial review: open items before wider promotion
1. **Formative review with intended users** (brief, section 10): for example a vendor or worker representative, a practitioner and a first-time visitor. Ask what possibilities they noticed, what one depends on, and where they would go next.
2. **Water point evidence** is from household connections in Dhaka, not a market. A market-specific example of a public water point (who runs it, and whether it lasts) would be better.
3. **Resting place evidence** is from worker cooling stations, not market benches. A market rest-point example would be better.
4. **Roof evidence** is from homes (Burkina Faso; Ahmedabad). Look for an example of a roof over shops or storage.
5. **Tree evidence** is from a park in Berlin, used only to show why water and care decide survival. Replace it with an Asian example of street or market trees and their care.
6. **Vendor examples** are individual accounts gathered by one organisation (AIDMI). Look for an evaluated vendor-support scheme.
7. The panel copy is written in plain language from existing reviewed records. It should be read by someone who works with vendors before the explorer is promoted beyond the practical page.

Nothing in the public copy depends on an unverified claim. The items above are about stronger, closer-fitting evidence.
