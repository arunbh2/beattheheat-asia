// A citable policy brief: heat-ready social security, so that people do not have to choose between their health and
// their income when it is too hot to work. It grew from the site's policy note on social security and heat and from a
// side event at the ninth session of ESCAP's Committee on Social Development (Bangkok, 13 November 2026). Every
// figure comes from a source in data/inbox/2026-11-csd9-heat/ that the checker opened and found all of its terms in;
// the build refuses a source that did not pass, so nothing unchecked can be cited. Examples carry a region label: Asia
// (South Korea, Japan, China and the Gulf included) or Elsewhere. What was held back is in research/2026-11/csd9-heat/ledger.md.
// Called by tools/build-pages.js; listed on /briefs/ and linked from /social-protection/.
"use strict";
const fs = require("fs"), path = require("path");
const SLUG = "briefs/heat-ready-social-security", TITLE = "Heat-ready social security", DATE = "November 2026";
const LEDE = "When it is too hot to work, a day off can mean a day without income. What social security systems in Asia and elsewhere already do to cushion that choice, the traps to avoid, and options a government could take up, step by step.";

function sources(ROOT) {
  const dir = path.join(ROOT, "data", "inbox", "2026-11-csd9-heat");
  const recs = JSON.parse(fs.readFileSync(path.join(dir, "sources.json"), "utf8")), lc = JSON.parse(fs.readFileSync(path.join(dir, "link-check.json"), "utf8"));
  const ok = r => /^(OK|REDIRECT)$/.test(lc[r.url]) && Object.values((lc._terms || {})[r.url] || { x: false }).every(Boolean);
  return id => { const r = recs.find(x => x.id === "csd9-" + id); if (!r) throw new Error(`brief: no staged source ${id}`);
    if (!ok(r)) throw new Error(`brief: source ${id} did not pass the check (${lc[r.url]}); it cannot be cited`); return { label: `${r.publisher}, ${r.year}: ${r.title}`, url: r.url, region: r.region }; };
}

module.exports = function brief({ page, write, esc, ROOT }) {
  const src = sources(ROOT);
  const REF = [], ref = id => { const s = src(id); let i = REF.findIndex(r => r.url === s.url); if (i < 0) { REF.push(s); i = REF.length - 1; } return `<sup><a href="#ref-${i + 1}">${i + 1}</a></sup>`; };
  const tag = r => `<span class="br-reg br-reg--${r}">${r === "asia" ? "Asia" : r === "elsewhere" ? "Elsewhere" : "Global"}</span>`;
  const ex = (region, place, text) => `<li>${tag(region)} <b>${place}.</b> ${text}</li>`;
  const K = (cls, label, items) => items.length ? `<div class="br-k br-k--${cls}"><p class="br-kl">${label}</p><ul>${items.map(x => `<li>${x}</li>`).join("")}</ul></div>` : "";
  const route = (id, n, h, lede, examples, inferred, uncertain) => `<section class="br-s" id="${id}"><h2>${n}. ${h}</h2><p class="br-lede">${lede}</p>
    ${examples.length ? `<ul class="br-ex">${examples.join("")}</ul>` : ""}<div class="br-kiu">${K("i", "Inferred", inferred)}${K("u", "Uncertain", uncertain)}</div></section>`;

  const body = `
  <article class="container br">
    <header class="br-head"><p class="eyebrow">Policy brief · ${DATE}</p>
      <h1 class="pg-h1">${TITLE}</h1>
      <p class="pg-lede">${LEDE}</p>
      <p class="br-meta">Common Shade · beattheheat.asia · Free to use under CC BY 4.0 · Part of <a href="/social-protection/">Who could help a household through a hot season</a> · <button type="button" class="br-print" onclick="window.print()">Print or save as PDF</button></p></header>

    <section class="br-s br-sum" id="summary"><h2>In brief</h2><ul>
      <li>For people paid by the day or by the piece, heat is two shocks at once: less income, as hours, customers and output fall, and more spending, on cooling, water, transport and care. A heat warning that says "rest" can leave them choosing between their health today and food tonight.</li>
      <li>About 2 billion people work informally, and most of them have no social protection${ref("ilo-informal")}; more than 2.4 billion workers are exposed to heat stress at work${ref("un-whowmo-2025")}.</li>
      <li>Many governments in Asia already link heat to work rules or payments: a high-temperature allowance in China${ref("cn-hts")}, mandatory heat measures in Singapore and Japan${ref("sg-mom-2026")}${ref("jp-2025")}, a work warning in Hong Kong${ref("hk-hsww")}, a midday work break in the United Arab Emirates${ref("ae-midday")}, and new labour advisories in the Philippines${ref("ph-dole-guide")}.</li>
      <li>Five routes could make social security heat-ready: wage support when heat stops work, cash that moves with the warning, existing welfare funds and public works, help with cooling and care at home, and prevention.</li>
      <li>The first heat insurance for informal women workers in India paid nothing in its first year because its trigger was set too high${ref("sewa-npr")}; it was redesigned and paid out to about 46,000 women in 2024${ref("mgnregs-nl-2026")}. How triggers are set decides who is protected.</li></ul></section>

    <section class="br-s" id="why"><h2>Why heat strains social security</h2>
      <p>Social security was mostly built for shocks that come with a date: an illness, an injury, a lost job, old age. Heat comes every year, for weeks, and it reaches people through their pay as much as through their bodies.</p>
      <ul class="br-ex">
        ${ex("asia", "Viet Nam", `In a 2026 survey of 734 outdoor workers in Hanoi and Ho Chi Minh City, 94% reported at least one heat-related health problem while working during heatwaves${ref("vn-mae")}.`)}
        ${ex("asia", "Thailand", `In a 2025 study of home-based workers and street vendors in Bangkok, most reported fewer working hours, fewer customers, lower productivity and worse mental health${ref("wiego-pb33")}${ref("wiego-bkk")}. In workshops with women informal workers, many described an "exhaustion trap": working at night to stop products spoiling, then spending the day caring for children and older relatives affected by the heat${ref("hera-th")}.`)}
        ${ex("global", "Worldwide", `By 2030, heat stress is projected to cost 2.2 per cent of working hours, equal to 80 million full-time jobs and an economic loss of US$2,400 billion${ref("ilo-2019")}.`)}
      </ul>
      <p>ESCAP's 2025 report on rising heat names climate-resilient, inclusive social protection among the ways the region could respond${ref("escap-heat-2025")}, and its CRISP initiative works with governments from Cambodia to Fiji on linking social protection with climate risk${ref("escap-crisp")}.</p></section>

    ${route("wage-support", 1, "Wage support when heat stops work", "Construction and outdoor work in colder countries have long had funds that pay part of a wage when frost or storms stop work. The same idea can cover heat, so an employer can halt dangerous work without the worker losing the day.", [
      ex("asia", "China", `Employers pay a high-temperature allowance for outdoor work on days of 35°C or more, and where indoor workplaces cannot be cooled below 33°C; provinces set the amount, for example 300 yuan a month from June to September in Shanghai${ref("cn-hts")}.`),
      ex("elsewhere", "France", `Since Decree 2024-630, heatwaves count as bad weather in the construction sector's scheme that pays workers when sites stop${ref("fr-decree")}${ref("fr-bdt")}.`),
      ex("elsewhere", "Italy", `The national social security institute (INPS) treats heat of about 35°C as a reason for wage support when work is stopped or cut${ref("it-cigo")}.`),
      ex("elsewhere", "Austria", `Heat above 32.5°C can count as bad weather on construction sites; the construction workers' fund (BUAK) refunds the employer the compensation paid${ref("at-buak")}.`)],
      ["These schemes mostly reach workers on a formal payroll. Reaching self-employed, platform and informal workers would need a subsidised or tax-funded route."],
      ["No evaluation in South or Southeast Asia was found in this check of whether such payments reduce heat illness at work."])}

    ${route("cash", 2, "Cash that moves with the warning", "Relief that arrives weeks after a heatwave cannot replace a lost day. Linking a heat threshold, set in advance, to a payment that reaches people as the heat arrives is the idea behind anticipatory and parametric schemes.", [
      ex("asia", "India", `SEWA's heat insurance for informal women workers began in 2023 with 21,000 women and paid nothing that year, because its threshold was too high${ref("sewa-npr")}${ref("sewa-ilo")}. Redesigned, it covered about 50,000 women in Gujarat, Rajasthan and Maharashtra in 2024 and paid out to more than 46,000 of them in May${ref("mgnregs-nl-2026")}; in 2025 it reached about 250,000 women, alongside a Climate Welfare Facility that adds savings and emergency support${ref("sewa-ilo")}${ref("sewa-cgap")}.`),
      ex("global", "Anticipatory action", `In the best-documented cases, each dollar spent ahead of a forecast shock avoided up to about USD 7 in losses${ref("fao-aa-roi")}.`)],
      ["A payment that reaches people before or during the heat could make a warning possible to follow; the warning and the payment would need to use the same threshold.",
        "Social registries and digital payments already in place for other schemes could carry heat top-ups, to people already enrolled or to more people for a while."],
      [`Payouts can take weeks to arrive, which weakens the link between the heat and the help${ref("sewa-cgap")}.`,
        "Evidence for anticipatory cash comes mostly from floods, droughts and food crises; heat is less studied."])}

    ${route("funds", 3, "Welfare funds and public works already in place", "Some countries already collect money for workers' welfare, or run public employment, that could carry heat protection without a new law or a new fund.", [
      ex("asia", "India", `State construction workers' welfare boards collect a cess on building projects; as of 31 March 2024 about ₹64,193 crore had been spent and about ₹47,800 crore was unspent, nearly half of what was collected${ref("bocw-bs")}. Kerala is the only state reported to have used all of its funds${ref("bocw-sabrang")}.`),
      ex("asia", "India", `The rural employment guarantee (MGNREGS) pays wages and builds assets such as water works and trees${ref("mgnregs-iied")}; in 2022 the delays at the start of its financial year in April overlapped with the heatwave, leaving women without work when it was hottest${ref("mgnregs-mongabay")}.`),
      ex("asia", "Punjab, India", `In 2026 the state's construction workers' welfare board directed that rural employment guarantee workers be registered under the construction workers' law, which opens its welfare schemes to them${ref("punjab-bocw")}.`)],
      ["Unspent welfare funds could pay for group heat insurance, shaded rest and water at worksites, or cash on hot days, where the law allows.",
        "Public works could move hours to the early morning and evening, release wages ahead of the hot months, and provide shade, water and crèches at worksites."],
      ["Whether existing welfare laws allow these uses differs by state; this brief does not offer a legal opinion."])}

    ${route("home", 4, "Help with cooling and care at home", "Heat at home is hardest on older people, people with disabilities, infants and home-based workers in small, hot rooms, and electricity bills rise just as earnings fall.", [
      ex("asia", "Bangkok, Thailand", `The city and UNDP prepared a financing strategy for tackling urban heat, to turn its heat plans into funded investments${ref("bkk-strategy")}.`),
      ex("asia", "South Asia", `The World Bank's 2026 report on heat in South Asia's cities sets out how cities can protect jobs and growth from heat${ref("wb-livable")}.`)],
      ["Utility support weighted towards summer cooling, a pause on disconnections during heat alerts, and grants for cool roofs and ventilation could reduce the cost of staying safe.",
        "Households caring for infants, pregnant women, older people or people with disabilities are likely to need help first."],
      ["No evaluation of heat-specific energy support in South or Southeast Asia was found in this check."])}

    ${route("prevention", 5, "Prevention, paid for by those who pay the bills", "Social security institutions pay for injuries and illness, so preventing heat harm also protects their funds. Rules that make protection mandatory, and inspections that check it, reach more workers than advice alone.", [
      ex("asia", "Singapore", `From 1 December 2026, enhanced heat stress measures become mandatory for outdoor work, including drinking water${ref("sg-mom-2026")}${ref("sg-rajah")}.`),
      ex("asia", "Japan", `A 2025 regulatory revision requires employers to put heatstroke prevention measures in place, with WBGT as the measure of heat${ref("jp-2025")}.`),
      ex("asia", "South Korea", `In July 2026 the weather service issued its first emergency heatwave warning, the top level of a new rating system${ref("kr-kma-2026")}; workplaces added longer lunches and more breaks${ref("kr-work-2026")}, and record tropical nights kept the heat on after dark${ref("kr-nights-2026")}.`),
      ex("asia", "Hong Kong", `The Labour Department's Heat Stress at Work Warning, coded amber, red and black, tells employers and workers how serious the heat stress is, for outdoor work and indoor work without air conditioning${ref("hk-hsww")}.`),
      ex("asia", "Philippines", `In October 2026 the labour department issued guidelines requiring employers to protect workers from heat stress${ref("ph-dole-guide")}, and set out how heat illness at work is compensated${ref("ph-dole-comp")}.`),
      ex("asia", "United Arab Emirates", `From 15 June to 15 September, outdoor work under direct sun is banned during the peak afternoon hours${ref("ae-midday")}.`)],
      ["Recognising heatstroke, and longer-term harm such as kidney disease, as work injuries would let workers claim compensation and give insurers a reason to invest in prevention.",
        "Lower contributions for employers and platforms that provide shade, water, rest and cooling could reward prevention."],
      ["How far inspections and penalties are enforced, and whether they reach informal and platform workers, is rarely measured."])}

    <section class="br-s" id="traps"><h2>Five traps to watch for</h2><p class="br-lede">Lessons from pilots and programmes, and questions to ask of any new scheme.</p>
      <ol class="br-traps">
        <li><b>Triggers set too high, or blind to humidity.</b> A threshold that heat rarely crosses pays nothing, as SEWA's first year showed${ref("sewa-npr")}; air temperature alone misses humid heat, which heat index and WBGT capture. Small cash reserves alongside insurance can cover the gap.</li>
        <li><b>Tools that save time, without income security.</b> Some practitioners report that when machines or cooling save time but income stays insecure, workers fill the time with more paid work, so the strain stays the same. No published study was found in this check; it is a question to test.</li>
        <li><b>Rules that shut out the people most exposed.</b> Proof of local residence, an employer's certificate or a bank account can exclude migrant construction workers and street vendors.</li>
        <li><b>Money that ends with the project.</b> Spending spread across health, labour, energy and city budgets can stop when a project ends; cooling centres and shade need running budgets every year.</li>
        <li><b>Advice without the means to follow it.</b> "Drink more water" means little without drinking water and safe toilets nearby, and "rest" means little without income.</li></ol></section>

    <section class="br-s" id="options"><h2>Options, step by step</h2><p class="br-lede">A sequence a government could consider, with who would usually lead. These are options drawn from the examples above, not prescriptions; what fits depends on each country's laws and systems.</p>
      <div class="br-tablewrap" role="region" aria-label="Options by timeframe" tabindex="0"><table class="br-table">
        <thead><tr><th scope="col">When</th><th scope="col">Option</th><th scope="col">Usually led by</th></tr></thead>
        <tbody>
          <tr><td>Within a year</td><td>Link the heat warning thresholds already in use to agreed cash top-ups for people most at risk, and pause utility disconnections during heat alerts.</td><td>Disaster management, social welfare and the weather service</td></tr>
          <tr><td>In one to two years</td><td>Use existing welfare funds for group heat insurance, shade, water and toilets at worksites; extend bad-weather wage support to heat.</td><td>Labour and social security ministries, with trade unions</td></tr>
          <tr><td>In one to two years</td><td>Make rest, shade and drinking water standards mandatory and inspected; recognise heatstroke and longer-term heat harm as work injuries; reward employers who prevent harm.</td><td>Labour inspectorates and social security institutions</td></tr>
          <tr><td>In two to five years</td><td>Tag heat spending in medium-term budgets; weight energy support towards summer cooling; fund cool roofs and ventilation for small, hot homes and for schools for children with disabilities.</td><td>Finance, housing and city governments</td></tr>
        </tbody></table></div></section>

    <section class="br-s" id="held"><h2>What is not here yet</h2>
      <p>The policy note and the session it draws on cited more figures than this brief shows. Several could not be traced to a public source that our checker could open, or the page did not hold the number: among them the results of a 2026 cash pilot in Thailand, South Korea's 2026 season results, workplace accident rates in the heat, heating and cooling support in the United States, and returns on prevention spending. Field stories told at the session are held back until they are published. They can be added when a source is found; the list is in the <a href="/research/2026-11/csd9-heat/ledger.md">claims ledger</a>.</p></section>

    <section class="br-s" id="method"><h2>How this brief was made</h2>
      <p>The brief grew from Common Shade's policy note on social security and heat, and from notes taken at a side event at the ninth session of ESCAP's Committee on Social Development in Bangkok on 13 November 2026, organised by UNDP, ESCAP, UNDRR and IFRC. Each source was opened and archived on GitHub, and every figure used here was found in its text. Examples are labelled Asia (including South Korea, Japan, China and the Gulf) or Elsewhere. Nothing here ranks countries or schemes; inclusion is not endorsement.</p></section>

    <section class="br-s" id="cite"><h2>How to cite</h2><blockquote class="cite-box">Common Shade. <i>Heat-ready social security: protecting income when it is too hot to work.</i> Policy brief, ${DATE}. beattheheat.asia/${SLUG}/</blockquote></section>

    <section class="br-s br-refs" id="sources"><h2>Sources</h2><ol>${REF.map((r, i) => `<li id="ref-${i + 1}">${tag(r.region)} <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}<span class="visually-hidden"> (opens in a new tab)</span></a></li>`).join("")}</ol></section>
  </article>`;
  const html = body.replace(/<\/a><\/sup><sup><a/g, "</a>, <a");   // side-by-side footnotes read "4, 5"
  write(SLUG, page(SLUG, TITLE, "A policy brief on heat-ready social security: wage support when heat stops work, cash that moves with the warning, welfare funds and public works, help with cooling and care, and prevention, with examples from Asia and elsewhere.", html));
  return { slug: SLUG, title: TITLE, lede: LEDE, sources: REF.length };
};
module.exports.SLUG = SLUG; module.exports.TITLE = TITLE; module.exports.LEDE = LEDE;
