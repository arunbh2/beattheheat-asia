# Bangkok heat financing strategy, November 2026

The batch takes the insights in *Bangkok's Financing Strategy for Tackling Urban Heat Challenges*, published by UNDP with the Bangkok Metropolitan Administration in October 2026, and ties each one to the strategy's exact words. Only the claims the check confirms reach the site.

Before this batch, the site linked the strategy only as a finance route on the Thailand snapshot. The batch also corrects Bangkok's city page, which described the city's heat plan as "developed with the World Bank". The strategy says the city developed its own Urban Heat Management Action Plan for 2026. The World Bank's *Shaping a Cooler Bangkok* stays among the page's sources as background.

What participants said in the strategy's consultations is written as what they said, not as a measured finding. No individual is named, and no government is ranked.

## Steps

| Step | File | What it does |
|---|---|---|
| 1 | `claims.json` | Lists each insight with the wording the site would use, where it goes, and the exact terms the strategy has to hold. |
| 2 | `stage.js` | Writes `data/inbox/2026-11-bangkok-heat-finance/sources.json`. |
| 3 | `.github/workflows/verify-sources.yml` (`month: 2026-11-bangkok-heat-finance`) | Opens each source, reads the PDF with pdftotext and looks for each term. It fills `link-check.json` and `_excerpts.json`. |
| 4 | `gate.js` | Passes a claim only when every term it rests on was found. It writes `confirmed.json` and `dropped-after-check.json`. |
| 5 | `apply.js` | Makes exact, formatting-preserving edits, each tied to confirmed claims. An edit for an unconfirmed claim is refused. |

The Government of Thailand page on the 304 cooling centres was staged too. It was checked for "World Bank", to see whether it ties the bank to the plan. It opened and holds "304", but not "World Bank", so the old wording had no support there. No claim rests on that page. The UNDP publication page blocked the checker; every claim rests on the PDF, which opened and held all its terms.

## Result

All 13 claims were confirmed, and none was set aside (`dropped-after-check.json` is empty).

## Where the claims go

| Claim | Where it went |
|---|---|
| The plan is the city's own, with 22 indicators and a committee chaired by a deputy governor | Bangkok's city page (replacing "developed with the World Bank") and the city government's record |
| The plan's targets for cooling rooms, cooling points and home visits | Bangkok's city page |
| Its cost: about THB 146 million to set up and THB 10.8 million a year, mostly from existing budgets | Bangkok's city page, the dedicated heat budgets example and the learning agenda |
| Money to build is generally available, but running costs are not always covered | Bangkok's city page, a new watch-out on cooling centres and the Thailand snapshot |
| Most projects are public goods; no investment-ready pipeline yet; climate budgeting proposed | The Thailand snapshot and the dedicated heat budgets example |
| Bonds possible with Cabinet approval but never issued; the credit rating discontinued in 2022 | The Thailand snapshot |
| Districts have no fiscal authority; dedicated district allocations and equity criteria proposed | The Thailand snapshot |
| The Environmental Fund's grant limits, and the share that reaches local governments | The Thailand snapshot |
| Bundling cooling facilities for sponsors, with maintenance in the agreement | The Thailand snapshot |
| Consultation: childcare centres and electricity costs | The cooling centres watch-out |
| Consultation: older and bedridden people in metal-roofed homes | Older people on /who-is-at-risk/ |
| Consultation: residents not registered in Bangkok | Informal settlements on /who-is-at-risk/ |

The planning workbook was left as it is. Its "Paying for protection" step already asks who pays to run what is built, which is the strategy's main finding, and its examples are of money that has been spent, not planned.
