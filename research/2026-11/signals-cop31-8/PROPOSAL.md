# COP31 closing check-in: proposals for the owner (25 November 2026)

Nothing here is published. Each item waits for the owner's approval. The claims are in `claims.json`, checked by
`verify-sources.yml` (batch `2026-11-signals-cop31-8`) and gated by `gate.js`: 7 of 8 confirmed (`confirmed.json`),
1 dropped (`dropped-after-check.json`). The overtime batch, `signals-cop31-7`, was already gated (1 of 1 confirmed).

## What the check confirmed

| Claim | Confirmed by |
|---|---|
| COP31 closed on Sunday 22 November 2026 without adopting the presidency's proposed cover decision, the Antalya Pact. | CNN; UN News; Carbon Brief |
| Negotiated decisions on separate agenda items, including adaptation, were adopted even though the cover decision was not. | UNFCCC news release |
| Parties agreed to set up a task force to refine the adaptation indicators agreed at COP30. | UNFCCC news release |
| The final text set no figure for tripling adaptation finance: a proposed US$120 billion figure for 2035 was dropped, and countries agreed only to discuss how to triple it. | Carbon Brief |
| Decisions at COP31 enable the Adaptation Fund to receive a share of the proceeds of carbon trading under the Paris Agreement's crediting mechanism. | Carbon Brief |
| The first draft of the cover decision carried a paragraph on climate change and health; with the cover decision not adopted, no health text was agreed in it. | Health Policy Watch (two reports) |
| By the end of COP31, 136 national adaptation plans had been submitted. | Carbon Brief |

Not confirmed, so left out:
- **Indicators guidance date:** reported as October 2027, but not found on the checked pages. The indicators claim was narrowed to the task force.
- **Heat resilience roadmap launch:** reported for next year in Ethiopia, but "Ethiopia" was not found on UNEP's summary. The roadmap stays at its recorded step, "backed".

Sources not used:
- **IISD's statement:** the page turned away the checker.
- **The decision texts:** not read. The step dates below take the closing plenary as the adoption date. Check that date against the decision texts before publishing.

## 1. Proposed rungs

| Item | Record | Rung | Why this rung, and what it does not show |
|---|---|---|---|
| Task force to refine the adaptation indicators | New deliverable on `sig-belem-adaptation-indicators-2025` ("A task force to refine the indicators") | **Adopted**, 22 November 2026 | A decision set it up. It does not show who sits on it, when its guidance is due (not confirmed), or any change in how countries measure heat adaptation. Next step: the task force's guidance, published (delivered). |
| Adaptation Fund and carbon-market proceeds | New commitment record, `sig-cop31-adaptation-fund-2026`. Heat relevance: **interpreted** (adaptation finance that could pay for heat measures; heat is not named) | **Adopted**, 22 November 2026 | A decision lets the fund receive a share of proceeds. It does not show any money received, how much, or any spent on heat. Next step: first proceeds received (funded). |
| Tripling adaptation finance | No record and no rung | None | No target was set; "agrees to discuss" is not an adoption. Noted in the check-in and the synthesis only. |
| Health in the cover decision | No new record (the Antalya health platform is already recorded) | None | A draft paragraph is not an outcome, and the cover decision was not adopted. Noted in the check-in only. |
| 136 national adaptation plans | No record | None | A count of plans, not a heat commitment; the heat content of the plans has not been checked. Kept as context. |

**Proposed check-in 6 (closing), dated 25 November 2026:**
- Records added: the two above.
- Note: "COP31 closed on Sunday 22 November without its cover decision, the Antalya Pact; separate negotiated decisions were adopted. They set up a task force to refine the adaptation indicators and let the Adaptation Fund receive a share of carbon-market proceeds. No figure was set for tripling adaptation finance, and the health paragraph in the draft cover decision was not agreed. No negotiated decision specific to heat was found."

## 2. Proposed closing synthesis

To replace "Closing synthesis: not yet written". The text keeps to the site's voice (no "should" or "must", no em dashes, no blame).

> COP31 closed on 22 November without the presidency's cover decision, the Antalya Pact, though separate negotiated decisions were adopted. For heat, the clearest steps came beside the negotiations rather than in them: governments backed a voluntary roadmap on heat resilience and sustainable cooling, with new support announced for it, and a health platform was launched on Health Day. In the negotiations, parties set up a task force to refine the adaptation indicators and let the Adaptation Fund receive a share of carbon-market proceeds. No figure was set for tripling adaptation finance, and the health paragraph in the draft cover decision was not agreed. We found no negotiated decision specific to heat, and no new heat commitment by India, Bangladesh, the Philippines or Thailand in the coverage we reviewed. Each step is recorded at the rung its source shows: backed is not adopted, a decision is not money received, and announced support is not yet committed or paid. This is a reading of what the watch found, reviewed on [date of approval].

What each part rests on:
- **Close and cover decision:** batch 8, `c-close`.
- **Separate decisions:** `c-separate`.
- **Roadmap and support:** the Cooling Ministerial record.
- **Health platform:** `sig-cop31-air-2026`.
- **Task force:** `c-gga`.
- **Adaptation Fund:** `c-af`.
- **Tripling:** `c-finance`.
- **Health paragraph:** `c-health`.
- **No new heat commitment by the four countries:** check-ins 1 to 5 and this one added none. "Not found in the coverage reviewed" describes the search, not the countries.

## 3. Moving the watch into a folded archive below the El Niño watch

The COP31 section already sits after the El Niño watch on /signals/. The proposal:
- **Fold:** the section becomes a `<details>` block, closed by default, with the summary "COP31 watch, Antalya, 9 to 22 November 2026: closed. Closing synthesis, scope and 6 dated check-ins".
- **Anchor:** the section keeps `id="cop31"`. A few lines in `signals/signals.js` open the fold when the address ends in `#cop31`, so the "COP31 watch" tag on each card and old links still land on it.
- **Jump menu:** "COP31 watch" stays, after "El Niño watch", labelled "COP31 watch (closed)".
- **Records:** the cards stay in the main list with their tag. Only the watch panel folds.
- **llms-full.txt and the Markdown copy:** both keep the full watch text, so nothing is hidden from agents or readers without JavaScript.
- **Check:** `check-signals.js` gains a test that the fold exists, holds the synthesis and keeps the anchor.

## 4. Final sentence of the December State of the field paragraph

In `research/2026-11/signals-cop31-7/sof-december-note.md`, replace:

> The conference ran past its scheduled close, and its negotiated decisions on adaptation and finance had not been adopted when this was written.

with:

> The conference closed on 22 November without its cover decision; the negotiated decisions set up a task force to refine the adaptation indicators and let the Adaptation Fund receive a share of carbon-market proceeds, but set no figure for tripling adaptation finance, and none was specific to heat.

It rests on `c-close`, `c-gga`, `c-af` and `c-finance`. The clause "none was specific to heat" is Common Shade's reading of what the watch found, and is marked as such in the December draft's sources.
