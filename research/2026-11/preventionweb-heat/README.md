# PreventionWeb extreme-heat hub: Phase 0 (access, catalogue, triage)

13 November 2026. A research set, published as files but never linked as a page. Nothing here is on the site yet.

## Access: what was possible

- `www.preventionweb.net` was added to this repository's environment allowlist.
- **Pages answer automated requests with a Cloudflare "managed challenge" (HTTP 403).** This covers the hub, the
  knowledge base, the sitemap, the API path and the terms of use. It is a deliberate barrier, so no attempt was made
  to get around it. It also explains why every PreventionWeb page in past GitHub link checks came back BLOCKED.
- **`robots.txt` is open:** `Crawl-Delay: 10`, hub paths not disallowed.
- **The main RSS feed, `https://www.preventionweb.net/rss.xml`, is open.** It carries the 40 newest items across all
  hazards, with no topic filter and no history. Today's copy is `rss-2026-11-13.xml`, triaged in
  `feed-triage-2026-11-13.json`.
- **Terms of use could not be read.** Until they are, the site uses links and its own short summaries only, and
  credits the original publisher, never "PreventionWeb".

## The catalogue (`catalogue.json`)

Built from web search results restricted to preventionweb.net, plus the feed: 35 items in all.

- **Hubs and collections (6):**
  - the Extreme Heat Portal and its latest additions
  - the heatwave hazard page
  - collections on heat risk assessment, extreme heat and labour, and the South Asia heatwave of 2022
- **Publications and news (29):** on early warning, finance, health, cooling, India, Pakistan, Thailand, Viet Nam and
  Southeast Asia.

What is already on Common Shade:

- One item is already cited by its PreventionWeb address (the global landscape of heat early warning systems).
- Four more titles already appear in the site's records, cited at their original publishers: financing heat
  resilience, the GHHIN global evidence summary, preparing for the heatwaves of the future, and degrees of danger in
  Southeast Asia. Two more possibly do.
- **11 leads are new and highly relevant to South and Southeast Asia:**

| Lead | Why it matters | Where it could go |
|---|---|---|
| Heat waves in Hanoi: anticipatory action (forecast-based financing, from 2017) | A Southeast Asian heat example of anticipatory action, which the site holds mostly for South Asia | Anticipatory action lever, Hanoi city page, Paying when heat strikes |
| ADB: The unfolding heat crisis in Thailand and Southeast Asia | A regional development bank's view, incl. pilot city heat and air plans and a blended finance fund | Thailand country page, funders, Signals (as guidance) |
| NRDC: Extreme heat in India, the evolving policy and practice landscape | State case studies (Tamil Nadu, Maharashtra, Uttar Pradesh, Telangana, Rajasthan, Kerala, Delhi) | India heat action plan archive (leads), India page |
| Universal Service Funds paying for cell-broadcast warnings: Thailand | A financing route for early warning | Signals, early warning guides |
| South Asia: Heatwave 2022 collection | The 2022 event, gathered in one place | Heatwaves page |
| Southeast Asia's 2025 heatwave | Recent regional event coverage | Heatwaves page, Signals |
| Climate change vulnerability mapping for Southeast Asia | Regional vulnerability mapping | Evidence map, atlas |
| India and Pakistan act to save lives; poor neighbourhoods and extended heat; urban heat strategies; climate finance for South Asia's heat | News leads to their underlying studies | Who is at risk, city pages, funders |

Search summaries also named figures and claims, such as deaths averted in Ahmedabad and a city heat-risk ranking.
None is used: each needs its original source, checked.

## Next (Phase 1 and 2, each a normal checked batch)

1. **Find each lead's original publisher page** (ADB, NRDC and the others named in the catalogue once found) and
   stage it with `stage.js` for `verify-sources.yml`. PreventionWeb itself will stay blocked to the checker; the
   originals usually are not.
2. **Apply only confirmed claims, page by page,** in the places named above.
3. **Keep learning:** a weekly job could read `rss.xml` and drop heat items into an inbox for review, never straight
   onto pages. Whether the feed answers GitHub's runners as it answers this session is untested, and it would be
   checked first.

## Possible later step (not done)

PreventionWeb is run by UNDRR. A short note asking whether a feed or export of the Extreme Heat hub is available for a
non-commercial evidence site would open the hub properly. It needs the site owner's decision.
