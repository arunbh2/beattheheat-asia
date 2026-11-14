# Research prompt: completing the heat network

Paste everything between the two lines below into the research assistant. Attach the two files in this folder:
`existing-organisations.txt` (who is already listed) and `homepage-only.txt` (listings that need a deeper link).
Ask for **one reply per country** (the order is in section 6). Save each reply, unedited, as
`research/2026-11/heat-network/intake/<country-code>.md` (for example `pk.md`), plus `regional.md` for
organisations working across the region. Then tell Claude Code which files are new.

---

## Who you are working for

You are researching for **Common Shade** (beattheheat.asia), a free, non-commercial evidence platform on extreme heat
in South and Southeast Asia. Its readers are city officials, health workers, unions, NGOs, funders and researchers.
One page, "Organisations working on extreme heat", lists organisations already doing published heat work, so a reader
can find who works on a given action in a given place. Every line on the site is checked against its source by a script
that opens the page and looks for the exact words. **Anything you return that cannot be found on the page you cite
will be dropped.** Accuracy matters far more than quantity.

## What to find

1. **New organisations** doing published, heat-specific work in or for South and Southeast Asia (section A).
2. **The coverage grid**: for every country, which body fills each of eight standing roles on heat, or that none was
   found (section C).
3. **Stated ties**: where one source names two organisations working together on heat (section B).
4. **Deeper links** for the listings in `homepage-only.txt` (section E).

## 1. Rules for every item

- **Heat-specific.** The cited page has to describe work on extreme heat, heatwaves, heat stress, heat illness,
  cooling for heat protection or heat finance. General climate or disaster work is not enough. Membership of a
  network alone is not enough.
- **In or for the region.** Afghanistan, Bangladesh, Bhutan, Brunei, Cambodia, India, Indonesia, Laos, Malaysia,
  Maldives, Myanmar, Nepal, Pakistan, Philippines, Singapore, Sri Lanka, Thailand, Timor-Leste, Viet Nam.
  Organisations elsewhere count only if the cited work is in one of these countries.
- **Recent.** Prefer work from 2019 onward. Give the year of the work where the page states it.
- **One page that shows it.** Cite the organisation's own page where one exists (a programme page, plan, report,
  advisory or press release). A news article or a partner's page is acceptable only when the organisation has none;
  mark it `"link": "third"`. No search-result pages, social media, login pages or paywalls. PDFs are fine.
- **Exact words.** For each cited page, copy 2 to 4 short phrases (2 to 8 words each) **exactly as they appear on that
  page**, in `expect`. One phrase includes the organisation's name as the page writes it. One includes a heat word.
  Every number you put in a description has to appear, digit for digit, in one of the phrases.
- **Do not invent.** If you cannot open a page, do not cite it. If you are unsure, leave the item out and list it in
  section D as a lead. Never guess a URL.
- **Not already listed.** Check `existing-organisations.txt`. If an organisation is there, do not return it as new;
  you may still use it in sections B, C and E.
- **Organisations, not people.** Name no individuals. No journalists, no officials by name.

## 2. How to write a description (`does`)

One or two plain sentences: what the organisation did on heat, where, and when, taken from the cited page.

- Factual and modest: no "leading", "pioneering", "best", "first" unless the page itself says "first" and you quote it.
- No "should" or "must". No em dashes; use a plain hyphen or a comma.
- No words that suggest wrongdoing by anyone, even when a source uses them.
- No marketing language for companies; say what the product or service does on heat.
- Under 300 characters. Present or past tense, no future promises unless the page states a dated plan.

Good: `Issues heat index advisories with four danger levels, and in 2024 opened 32 public libraries as cooling centres.`
Not good: `A leading city tackling the heat crisis with innovative solutions.`

## 3. The vocabulary to use

**Countries** (ISO codes): AF Afghanistan, BD Bangladesh, BT Bhutan, BN Brunei, KH Cambodia, IN India, ID Indonesia,
LA Laos, MY Malaysia, MV Maldives, MM Myanmar, NP Nepal, PK Pakistan, PH Philippines, SG Singapore, LK Sri Lanka,
TH Thailand, TL Timor-Leste, VN Viet Nam.

**scale** (of the cited work): `city`, `subnational`, `country`, `multi-country`, `regional`, `global`.

**type**: `government`, `weather`, `health`, `city`, `multilateral`, `network`, `redcross`, `ngo`, `worker`,
`employer`, `research`, `finance`, `funder`, `company`, `standards`, `media`.

**side** (its main part in a heat alliance):
- `demand`: holds the need or the duty to protect people (governments, employers, organisations of affected workers
  and communities).
- `supply`: provides what protection needs (services, technology, delivery, insurance, lending, grants, research).
- `platform`: connects the two (networks, alliances, conveners, standard setters).

**group** (where it sits on the page): `global`, `asia` (governments and regional bodies in Asia), `research`,
`ground` (working on the ground), `cooling`, `finance` (insurance and finance), `lending` (banks, regulators,
microfinance), `funders`.

**levers** (the actions its cited work pulls on; use only ids that the page supports, zero to four):
`hap` heat action plans · `readyclinics` heat-ready health services · `heatrules` heat-safe work · `heatcash` income
protection in heatwaves · `socialprotection` social protection floors · `freecare` free care for heat illness ·
`affordablecool` affordable cooling for the poorest · `coolhousing` cool, affordable housing · `keepinschool` keep
children in school · `coolnights` cool nights and support · `countdeaths` count every heat death · `coolingcentres`
cooling centres and check-ins · `heatbudget` dedicated heat budgets · `anticipatory` anticipatory action ·
`heatlending` heat-smart lending · `riskpools` shared risk pools · `maternalheat` heat-safe pregnancy and newborn
care · `mindheat` mental health in heat plans · `safeathome` violence prevention in heat planning · `childwater` safe
water and rehydration for young children · `cleancool` clean, efficient cooling · `coolbydesign` cool by design ·
`greencity` green, cool cities · `keepgreen` keep city trees alive · `fairgreen` green without pushing people out ·
`farmcredit` crop insurance and fair credit · `irrigate` smart irrigation and groundwater rules · `soilwater` keep
water in the soil · `pumpbackup` backup power for water · `drypower` power that does not need water · `blackcarbon`
cut black carbon · `firesmart` fire-smart landscapes · `emissions` deep emission cuts.

**Grid roles** (section C): `weather` national weather service · `disaster` disaster management authority ·
`health` health ministry or public health agency · `labour` labour ministry or workplace safety body · `education`
education ministry · `capital` capital or largest city government · `redcross` national Red Cross or Red Crescent
society · `workers` main national worker organisation or union federation with heat work.

**Tie kinds** (section B): `funds` (a funds b) · `delivers-with` (a and b carry out the work together) · `member-of`
(a is a member of b) · `hosts` (a hosts b) · `technical-partner` (a gives b technical support).

## 4. What to look for first

The list is strong on research bodies and funders, and thin on the people who live with heat and those who treat it.
Look hardest for:

1. **Worker organisations**: unions and federations, informal worker associations, domestic, construction, garment,
   agricultural, fishing, delivery and street-vendor organisations.
2. **Health bodies**: health ministries and public health agencies, hospital networks, medical and nursing
   associations, emergency medical services.
3. **Employers and industry**: employer federations, industry associations (garment, construction, plantation),
   companies with published heat protection for their own workers.
4. **City and provincial governments** with heat plans, cooling centres or heat officers, especially outside India.
5. **Groups for those most at risk**: women, older people, people with disabilities, children, migrants, people in
   informal settlements, farmers.
6. **National Red Cross and Red Crescent societies** with heat early action.
7. **Education ministries** with heat rules for schools.

## 5. The reply format

Reply with **exactly these five sections**, each a fenced `json` block, in this order, and nothing else except a
one-line heading before each. Use `[]` for an empty section. Keep keys and spelling exactly as shown.

### A. New organisations

```json
[
  {
    "key": "pk-hbww",
    "name": "Home-Based Women Workers Federation",
    "home": "https://example.org",
    "url": "https://example.org/heat-campaign-2024",
    "link": "work",
    "countries": ["PK"],
    "scale": "country",
    "type": "worker",
    "side": "demand",
    "group": "ground",
    "levers": ["heatrules", "heatcash"],
    "does": "Campaigned in 2024 for heat breaks and drinking water for home-based women workers in Sindh and Punjab.",
    "year": 2024,
    "expect": ["Home-Based Women Workers Federation", "heat breaks", "drinking water"],
    "also": "https://example.org/about"
  }
]
```

- `key`: your own short id, lowercase, starting with the country code (`regional-` for regional ones). Used in B and C.
- `home`: the organisation's homepage. `url`: the page that shows the heat work. They differ unless it is the only page.
- `link`: `work` (the organisation's own page about the work) or `third` (someone else's page).
- `also` (optional): a second page that shows the same work, in case the first turns automated checks away.
- The example values are illustrative only. Do not return them.

### B. Ties

```json
[
  {
    "a": "Bangladesh Red Crescent Society",
    "b": "pk-hbww",
    "kind": "delivers-with",
    "what": "Heat early action in Dhaka, 2024",
    "url": "https://example.org/report",
    "expect": ["Bangladesh Red Crescent", "early action", "heat"]
  }
]
```

- `a` and `b`: the exact name from `existing-organisations.txt`, or a `key` from section A.
- One source has to name **both** organisations and the heat work. A tie you infer is not a tie.

### C. The coverage grid (every role, for this country)

```json
[
  {
    "country": "PK",
    "role": "weather",
    "status": "found",
    "org": "Pakistan Meteorological Department",
    "url": "https://example.gov.pk/heatwave-advisory",
    "expect": ["Heatwave", "Pakistan Meteorological Department"],
    "searched": "2026-11-15",
    "note": ""
  },
  {
    "country": "PK",
    "role": "education",
    "status": "not-found",
    "org": "",
    "url": "",
    "expect": [],
    "searched": "2026-11-15",
    "note": "Searched the federal and Sindh education departments for heat or school-closure guidance; none found online."
  }
]
```

- Eight rows per country, one per role, always. `status` is `found` or `not-found`.
- `org`: an exact name from `existing-organisations.txt`, or a `key` from section A, or the name you found.
- `found` means a page shows that body's own heat-specific work. A body that exists but has no published heat work
  is `not-found`, and `note` says what you searched.
- `searched`: the date you looked.

### D. Leads and search log

```json
{
  "leads": [{ "name": "", "why": "", "where_seen": "" }],
  "searched": ["the queries or sites you used, one per line"]
}
```

- Leads: organisations that look relevant but whose heat work you could not confirm on a page you could open.

### E. Deeper links for listed organisations (from `homepage-only.txt`)

```json
[
  {
    "name": "Ministry of Health, Indonesia",
    "url": "https://example.go.id/heat-guidance",
    "link": "work",
    "expect": ["Kementerian Kesehatan", "heat"],
    "does": ""
  }
]
```

- Only for listings in `homepage-only.txt` that belong to this reply's country.
- `url`: a page on the same organisation's site that shows the heat work its listing describes.
- `does`: leave empty unless the page supports clearer words; then give one or two sentences under the rules in
  section 2.

## 6. Order of work

One reply per country, in this order: Pakistan, Viet Nam, Cambodia, Malaysia, Sri Lanka, Philippines, Thailand,
Indonesia, Bangladesh, Nepal, Myanmar, Laos, Timor-Leste, Maldives, Bhutan, Brunei, Afghanistan, Singapore, India.
Then one reply named "regional" for organisations whose heat work spans several of these countries.

For each country, aim for completeness over speed: fill all eight grid rows, then find as many organisations as you
can confirm, worker and health organisations first. If a reply would run too long, end it cleanly after a complete
item and say "continued", then continue in the next reply with the same five sections.

## 7. Before you send each reply, check

- Every `url` opens without a login, and every `expect` phrase is on that page, word for word.
- Every number in `does` is in an `expect` phrase.
- Nothing in section A is in `existing-organisations.txt`.
- Eight grid rows for the country.
- No individuals named; no "should", "must", "leading" or em dashes in `does`.
- The JSON is valid: double quotes, no trailing commas, no comments.

---
