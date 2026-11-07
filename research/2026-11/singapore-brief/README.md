# Singapore heat resilience brief, November 2026

The batch traces the insights in *A Multi-Stakeholder Approach for Urban Heat Resilience: Singapore's Experience* to their sources. The brief was published by the Global Heat Health Information Network Southeast Asia Hub in June 2026.

Each insight is traced to the government or published source behind it, and only what those sources confirm reaches the site. No individual is named, and no government is ranked.

## Steps

| Step | File | What it does |
|---|---|---|
| 1 | `claims.json` | Lists each insight with the wording the site would use, where it goes, and the exact terms its source has to hold. |
| 2 | `stage.js` | Writes `data/inbox/2026-11-singapore-brief/sources.json`. |
| 3 | `.github/workflows/verify-sources.yml` (`month: 2026-11-singapore-brief`) | Opens every source and looks for each term. It fills `link-check.json` and `_excerpts.json`. |
| 4 | `gate.js` | Passes a claim only when every term it rests on was found on its source, or is quoted in the checker's excerpts of that source. It writes `confirmed.json` and `dropped-after-check.json`. |
| 5 | `apply.js` | Makes exact, formatting-preserving edits, each tied to a confirmed claim. An edit for an unconfirmed claim is refused. |

The new hub record also needed a side in `data/core/ORG_SIDE.json` (`ghhinsea`: platform, like the parent network). That edit was made by hand.

## What reached the site

Ten of the 14 claims were confirmed:

| Claim | Where it went |
|---|---|
| Who developed the heat stress advisory | Worked example |
| The September 2024 revision of the outdoor work rules | Worked example, the lever's example and the workbook's WBGT trigger |
| The heatwave definition (35 °C daily maximum and 29 °C daily mean for three days) | Singapore's city page and the workbook's temperature trigger |
| The 37-agency taskforce | Singapore's city page |
| The Heat Resilience Policy Office (2026) | Singapore's city page and the ministry's record |
| The S$40 million research initiative and the RIE2030 programme | The ministry's record |
| The Southeast Asia hub | A new organisation record |
| How little delivery platforms offer riders in hot weather | The workers' profile on /who-is-at-risk/ |
| HEAT-MAP | Work under way on the learning agenda question about clinic load |

## Set aside

Four claims could not be confirmed and were set aside. They are listed in `dropped-after-check.json` with the missing terms.

| Claim | Why it was set aside |
|---|---|
| Changi Airport's 30,000 workers | Not on the page |
| The military history review | The publisher blocked the check |
| The rental-flat household study | The listing page doesn't hold the terms |
| Platforms not penalising riders who turn down orders | The brief's web page is a summary and doesn't say this |

A later run could recheck the military history review through Europe PMC.
