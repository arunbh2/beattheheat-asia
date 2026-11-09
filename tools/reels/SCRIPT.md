# Two Reels for Common Shade

Two vertical films, 1080 × 1920 at 30 fps.

| Reel | What it does | Who it is for |
|---|---|---|
| 1. The debt story | Makes people feel why someone cannot escape the heat | Anyone |
| 2. The cooling-centre puzzle | Shows why well-meant protection can miss the people it was built for | Planners and funders |

Both follow the same rules:
- **The people are illustrative and faceless:** drawn line figures, nobody real and nobody named.
- **Every fact comes from a record the site already cites**, with its source below.
- **No money figures are invented.** Money only moves (coins leave, a loan slip arrives); it is never counted.
- **Protections are shown as things that could help.** How much they help depends on delivery.

## Facts and sources

| # | Fact as used | Source (already cited on the site) |
|---|---|---|
| F1 | In a 2024 survey of 721 Delhi street vendors, 49% lost income in heatwaves (80% saw fewer customers) | Greenpeace India and National Hawkers Federation, 2024 (`data/core/AT_RISK.json`, workers): https://www.greenpeace.org/india/en/press/16737/new-report-by-greenpeace-india-and-national-hawkers-federation-reveals-harsh-heatwave-toll-on-street-vendors/ |
| F2 | Across five cities in Nepal and Bangladesh, heat harmed health, cut incomes and working hours, and pushed some households towards high-interest loans | American Red Cross, Climate Centre, Nepal Red Cross and Bangladesh Red Crescent, 2026 (`data/core/EVIDENCE.json`, debt): https://www.climatecentre.org/publications/17312/ |
| F3 | The medical-debt trap: treatment costs push families into debt; debt removes any option to rest. The site grades this cycle's evidence as emerging. | `data/core/LOOPS.json` (debt), with the records under `EVIDENCE.debt` |
| F4 | Paid rest that switches on with the heat alert, shade nearby, and income protection in a heatwave are the levers on the site | `data/core/LEVERS.json` (heatrules, heatcash, socialprotection) |
| F5 | Parametric heat insurance has been piloted with women informal workers in India | ICMIF, 2024 (`LEVERS.heatcash` example) |
| F6 | Older people in a Kolkata informal settlement were more likely than those in a nearby village to face dangerous heat, because their homes stayed hotter than outdoors, especially at night | Weitz, Mukhopadhyay and Das, *International Journal of Biometeorology*, 2022 (`AT_RISK.older`) |
| F7 | What keeps older people from protection: living alone, limited mobility, and warnings and help that rely on phones, apps or someone knocking on the door | `AT_RISK.older`, barriers |
| F8 | "An older woman who lives alone, cannot walk far and has no phone may be reached by nothing at all." | /intersections/ (the site's own access exercise) |
| F9 | Cooling spaces and check-ins on older people living alone can offer relief. How much they protect health depends on who can reach them, how long people stay and how hot it is once they leave. A 2025 review found no study that measured health outcomes for people using cooling centres. | `LEVERS.coolingcentres` and its watch-out (Dearman et al., UKHSA, 2025) |

## Reel 1: "The heatwave ends. The debt doesn't."

Scene 5 runs two beats on purpose: the cycle forms first, then the protections enter.

| # | Narration (`\|` marks a new beat) | Headline on screen | Facts |
|---|---|---|---|
| 0 | The heatwave ends. \| The debt doesn't. | THE HEATWAVE ENDS. / THE DEBT DOESN'T. | F2 |
| 1 | A street vendor can't stop to rest. \| Stopping means losing the day's sales. | NO TIME TO REST. / STOPPING COSTS TODAY'S INCOME. | F1 |
| 2 | Then the heat makes him ill. \| Days of work are lost, and treatment costs money. | THEN HE FALLS ILL. / MORE DAYS LOST. COSTS RISE. | F2, F3 |
| 3 | A loan fills the gap. \| Now, on the next hot day, rest costs even more. | A LOAN FILLS THE GAP. / NOW REST COSTS EVEN MORE. | F2, F3 |
| 4 | Heat, lost income, debt, no rest. \| Shade, paid rest and income support could make rest possible, if they reach people in time. | PROTECTION CAN MAKE REST POSSIBLE | F3, F4, F5 |
| 5 | See what could break the cycle. \| Beat the heat dot Asia. | SEE WHAT COULD BREAK THE CYCLE | |

Two alternative openings replace scene 0 only, so the rest stays the same and the openings can be compared:

| Opening | Narration | Note |
|---|---|---|
| B | Why can't this worker just take a break? | |
| C | One hot week. \| How long does it take to pay back? | Asked as a question. "A hot day can cost more than a day's pay" was considered and left out: no record supports it, and the Singapore HeatSafe study found a median loss of about a quarter of a day's pay. |

## Reel 2: "You built a cooling centre. Can she use it?"

| # | Narration (`\|` marks a new beat) | Headline on screen | Facts |
|---|---|---|---|
| 0 | You built a cooling centre. \| Can she use it? | YOU BUILT A COOLING CENTRE. / CAN SHE USE IT? | F8 |
| 1 | It's open in the day. \| But her home stays hottest at night. | OPEN IN THE DAY. HOTTEST AT NIGHT. | F6 |
| 2 | It's close. \| But she can't walk that far in the heat. | CLOSE, BUT TOO FAR TO WALK | F7 |
| 3 | An alert went out. \| But she has no phone. | THE ALERT WENT OUT | F7, F8 |
| 4 | A ride there, \| and a neighbour who checks in, \| can make it reachable. | A RIDE. A KNOCK ON THE DOOR. | F9 |
| 5 | Who can use the protection you planned? \| Try the exercise at beat the heat dot Asia. | WHO CAN ACTUALLY USE IT? | F8 |

## Captions and posting

**On screen:** every film carries "Illustrative story" and a source line for the scene's fact.

**Suggested caption, Reel 1:** An illustrative story. In a 2024 survey of 721 street vendors in Delhi, 49% lost income in heatwaves (Greenpeace India and National Hawkers Federation). Across five cities in Nepal and Bangladesh, heat pushed some households towards high-interest loans (Red Cross and Red Crescent, 2026). How protection could break the cycle: beattheheat.asia

**Suggested caption, Reel 2:** An illustrative story, from Common Shade's access exercise. How much cooling centres protect health depends on who can reach them; a 2025 review found no study yet measuring health outcomes for users (UKHSA). Try the exercise: beattheheat.asia/intersections/

## Reel 3: "Made to measure"

Made with the cinecode kit (Film mode), 45 s, 1080 × 1920 at 30 fps: a tailor cuts each heat plan to the last heatwave's measurements, and the plans work until the heat outgrows the coat. Hand-made paper on a tailor's table in noon light through shutters; faceless paper hands only. The source is in `tools/reels/made-to-measure/` (`film.html`, rendered with cinecode's `make.py`; `SCRIPT.md`, `ROADMAP.md`, `shots.json`, `LICENSES.csv`). The music and every sound are written in code; the narration is the Piper LibriTTS voice (speaker 599), treated as a close voice in a small room.

Only figures already checked on the site appear. The Nature Communications 2026 study on future heatwaves inspired the idea, but none of its figures are used until its source check passes.

| Shot | Fact as used | Source on the site |
|---|---|---|
| 2 | Odisha, 1998: more than two thousand heatstroke deaths in a month | /heatwaves/#odisha1998 (Down To Earth) |
| 3 | Odisha's first plan; recorded deaths fell to 91 the next year | /heatwaves/#odisha1998 |
| 4 | Ahmedabad, 2010; a city plan followed (2013); an estimated 1,190 deaths a year avoided | /heatwaves/#ahmedabad2010 (Hess et al., 2018) |
| 6 | 2022: heat arrived in March; about 30 times more likely with climate change | /heatwaves/#southasia2022 (WMO, 2022) |
| 9 | The worst heatwave you remember isn't the worst to come. | the film's thesis, with no number |

**Suggested caption:** An illustrative story. Every heat plan is cut to the last heatwave people remember. In Odisha, a plan after the 1998 heatwave cut recorded deaths to 91 the next year; Ahmedabad's city plan is estimated to avoid 1,190 deaths a year. But in 2022 the heat came in March, made about 30 times more likely by climate change (WMO). Plans need room to grow. beattheheat.asia/heatwaves/
