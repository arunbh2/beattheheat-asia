/* ==========================================================
   Builds /lancet-countdown-2026/: the 2026 report of the Lancet Countdown on
   health and climate change, read for extreme heat in South and Southeast Asia,
   in plain language and organised by what each kind of reader might do.

       node tools/build-lancet.js      (build-static.js runs it too)

   Every number below is the report's own (indicator numbers in brackets).
   Its references: research/2026-10/lancet-countdown-2026/references.json
   ========================================================== */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia", SLUG = "lancet-countdown-2026";
const REFS = JSON.parse(fs.readFileSync(path.join(ROOT, "research", "2026-10", SLUG, "references.json"), "utf8"));
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ext = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
const REPORT = "https://doi.org/10.1016/S0140-6736(26)01779-4";
const APPENDIX = REFS.find(r => r.n === 0.5).url;
const ref = n => { const r = REFS.find(x => x.n === n); return r ? `<a class="lc-ref" href="#ref-${n}" title="${esc(r.cite)}">[${n}]</a>` : ""; };
const ind = s => `<span class="lc-ind">indicator ${esc(s)}</span>`;

// ---- the headline numbers on heat ----
const STATS = [
  ["710,000", "deaths linked to heat in 2023", `A record. The report attributes 71.5% of them to climate change. Over 2016–23, an average of 540,800 a year, up 36% on the decade before. ${ind("1.1.5")}`, "#for-health"],
  ["11 of 13.5", "heatwave days per person in 2025 were added by climate change", `Each person on Earth lived through 13.5 heatwave days on average; 11.3 of them would not have been expected without climate change. ${ind("1.1.1")}`, "#asia"],
  ["573 billion", "potential work hours lost to heat in 2025", `The second-highest on record, 35% above the 2006–15 average. Farm workers lose twice as many hours as workers in any other sector. ${ind("1.1.3")}`, "#for-work"],
  ["US$1.07 trillion", "in potential income lost to heat at work in 2025", `Equal to 3.7% of the economy in medium human-development countries, which include Bangladesh, India and Nepal, against 0.5% in the richest. ${ind("4.1.3")}`, "#for-money"],
  ["48 hours", "of sleep lost per person each year to hot nights", `The average over 2016–25. In medium human-development countries the loss is about 62 hours a person a year. ${ind("1.1.4")}`, "#for-community"],
  ["360,000", "deaths a year that air conditioning may have prevented", `In both 2022 and 2023. But only 3% of households in the poorest countries have it, and cooling now drives a growing share of energy emissions. ${ind("2.2.2")}`, "#for-city"],
  ["75 countries", "have a health early-warning system for at least one climate risk", `46 of them warn for heat-related illness and death. Fewer than half of countries run any heat warning at all. ${ind("2.2.1")}`, "#for-national"],
  ["$3.3 bn vs $1.1 bn", "health adaptation needs declared each year, against money committed", `48 countries put a price on what they need to protect health; international funding committed in 2024 covered about a third. ${ind("4.3.3")}`, "#for-money"],
];

// ---- what it means for South and Southeast Asia ----
const ASIA = [
  `<b>Asia has one of the largest rises in heatwave days caused by climate change.</b> Over 2016–25, the rise was about 12.9 days a year in Asia, behind small island developing states (16.9) and ahead of Europe (10.7). ${ind("1.1.1, appendix")}`,
  `<b>Medium human-development countries carry the heaviest share of heat deaths.</b> In the report’s groupings, Bangladesh, Cambodia, India, Lao PDR, Myanmar and Nepal are “medium”; Indonesia, the Philippines, Sri Lanka, Thailand and Viet Nam are “high”. In medium countries, 1.26% of all deaths over 2016–23 were related to heat, the highest share of any group. ${ind("1.1.5")}`,
  `<b>The region has the world’s largest outdoor workforce.</b> About 0.4 billion people work outdoors in each of WHO’s South-East Asia and Western Pacific regions; in South-East Asia that is 26.6% of working-age people. More men than women work outdoors everywhere, and the biggest gaps in numbers are in these two regions. ${ind("1.1.3, appendix")}`,
  `<b>Heat and dirty air hit together.</b> A study of about 3.6 million deaths in ten Indian cities found the effect of fine-particle air pollution on deaths was roughly five times higher on the hottest days than on ordinary warm ones. ${ref(152)}`,
  `<b>Being active outdoors is getting riskier.</b> Medium human-development countries, where India accounts for most people, had the most hours a year in which brisk walking outdoors carried a heat-stress risk: about 2,430 hours a person. ${ind("1.1.2")}`,
  `<b>Humidity matters more here than the headline figures show.</b> The heatwave measure used across the report counts temperature only, not humidity. In our reading, in humid Asian cities, where sweat cools the body less well, the real danger on many days is likely greater than the heatwave count suggests. The report’s work-hours and outdoor-activity measures do include humidity. ${ind("1.1.1, appendix")}`,
];

// ---- by reader: what the report says, what you can do this season, a question to ask ----
const READERS = [
  { id: "for-city", h: "If you work for a city or local government", says: [
      `<b>63.8% of cities</b> that report to the CDP have now assessed their climate risks, up from 44.5% in 2016. Of 6,318 adaptation actions cities reported in 2025, about 9% targeted health; among the health benefits they named, <b>17.5% were protection from extreme heat or cold</b>. ${ind("2.1.3")}`,
      `<b>62.7% of large cities</b> have low or very low greenery. In cities of low human-development countries, green cover fell by 4.1% from the 2015–17 average. Trees, parks and water cool neighbourhoods and support mental health. ${ind("2.2.3")}`,
      `Air conditioning saves lives, but its waste heat warms the street for people without it, and its electricity can add to air pollution. The report calls for <b>low-energy, fair cooling</b>: active cooling where it is essential, with shade, ventilation and passive design first. ${ind("2.2.2")}`],
    act: [["/plan/", "Turn this into a one-page heat plan for your city"], ["/cooling-options/", "Choose cooling that works where people are"], ["/solutions/#passive", "Passive cooling solutions, with their evidence"], ["/cities/", "See what twelve Asian cities already do"]],
    ask: "Which neighbourhoods have the least shade and the most people without cooling, and are they first in our plan?" },
  { id: "for-health", h: "If you work in health", says: [
      `Heat deaths reached a record <b>710,000 in 2023</b>. Risk is highest for babies, people over 65, people with long-term illness, and during pregnancy. ${ind("1.1.5")}`,
      `Only <b>24.2% of WHO member states</b> reported completing a health vulnerability and adaptation assessment since 2020, and <b>28.9%</b> have a health national adaptation plan. Of those with a plan, only 13 report high or very high implementation; money and staff are the main barriers. ${ind("2.1.1, 2.1.2")}`,
      `Only <b>39% of nursing schools</b> surveyed teach anything on climate and health; in low human-development countries the figure is 20%. Nurses are the largest part of the health workforce. ${ind("2.2.5")}`,
      `In low human-development countries, only <b>34.6%</b> report strong capacity to manage health emergencies, against 80.6% in the richest. ${ind("2.2.4")}`],
    act: [["/practical-actions/#clinics", "Practical actions for clinics and hospitals"], ["/loops/#clinic", "The overwhelmed-clinic cycle, and where it breaks"], ["/print/actions-clinics/", "A printable brief for your facility"]],
    ask: "Do our clinics know, before a heatwave, which patients to call first, and does the warning reach them in time?" },
  { id: "for-work", h: "If you employ people, or represent workers", says: [
      `Heat cost <b>573 billion potential work hours</b> in 2025. Farm work loses the most hours; its share is falling as farming mechanises, while the share lost in construction and services is rising. ${ind("1.1.3")}`,
      `The lost hours meant <b>US$1.07 trillion</b> in potential income in 2025, the third year in a row above a trillion. In medium human-development countries, two thirds of the loss falls on farm workers. ${ind("4.1.3")}`,
      `The report’s numbers mostly cover formal jobs, because data on informal work is thin. In much of Asia many outdoor workers are informal, so in our reading the real loss is likely larger. ${ind("1.1.3")}`,
      `The report sets a clear target: <b>rules that reduce at-risk workers’ exposure to heat</b>. ${ind("Panel 7")}`],
    act: [["/practical-actions/#work", "Practical actions at work: water, shade, rest, hours"], ["/a-week-in-the-heat/", "Follow one worker’s week, and test what protects them"], ["/loops/#poverty", "The poverty–heat trap"], ["/heat-economy/opportunities/", "Ideas such as paid rest and worker-run income support"]],
    ask: "When it is too hot to work safely, who decides to stop, and does anyone lose pay for it?" },
  { id: "for-community", h: "If you lead a community group, or look after a household", says: [
      `People lost an average of <b>48 hours of sleep a year</b> to hot nights over 2016–25, and almost every country saw the loss grow. Poor sleep harms health, learning and work the next day. ${ind("1.1.4")}`,
      `Heatwave exposure is rising fastest for <b>older people and babies</b>: older adults averaged 11.5 heatwave days a year over 2016–25, up from 7.2 the decade before; infants 8.8, up from 5.1. ${ind("1.1.1")}`,
      `Warnings save lives only if they reach people and they can act on them. The report names the barriers: <b>poor housing, work that cannot stop, living alone, and language</b>. ${ind("Panel 4")}`],
    act: [["/practical-actions/#homes", "Practical actions for homes"], ["/print/community-workshop-guide/", "Run a community heat workshop"], ["/loops/#sleep", "The sleepless-nights cycle"], ["/who-is-at-risk/", "Who heat hits hardest, and why"]],
    ask: "Who on our street lives alone, and who will check on them on the hottest days?" },
  { id: "for-money", h: "If you fund, invest or run a business", says: [
      `Countries that put a price on protecting health from climate change asked for about <b>US$3.3 billion a year</b>; international funding committed in 2024 covered about a third. The report thinks the real need is higher, because measuring it takes money and staff that many countries lack. ${ind("4.3.3")}`,
      `International development aid is falling: the report projects a drop of <b>more than US$50 billion</b> between 2023 and 2026, about a quarter of the total. It warns this could slow early-warning systems and climate-resilient clinics. ${ind("Panel 5")}`,
      `Only <b>1% of climate-and-health research grants</b> went to researchers in low human-development countries; 88% went to the richest. ${ind("4.3.4")}`,
      `Clean energy investment reached <b>US$2.1 trillion</b> in 2025 and clean energy jobs reached 16.6 million in 2024. The report asks for grant-based and low-cost finance for health, so protection does not add to debt. ${ind("4.3.1, 4.2.1")}`],
    act: [["/finance/", "Paying for protection: who pays, and whether it lasts"], ["/heat-economy/", "The heat economy: businesses, funders and ideas"], ["/heat-economy/conditions/", "Questions to ask before funding anything"], ["/loops/#protection", "The protection-gap cycle"]],
    ask: "Does this money reach the people least able to cope with heat, and who keeps the protection working after the grant ends?" },
  { id: "for-national", h: "If you plan or set policy nationally", says: [
      `<b>77.2% of national weather services</b> provide data to their health sector, but only <b>51.3%</b> offer products tailored to health, such as heat warnings set at health-based thresholds. In low human-development countries the figure is 46.2%. ${ind("2.2.1")}`,
      `Where countries have health early-warning systems, the number of people affected by floods and storms grew <b>8.6% less</b> than elsewhere. ${ind("2.3.2")}`,
      `Warnings work best when they are tied to agreed actions: protected work hours, open cooling spaces, extra hospital staff, checks on people living alone. Where health data is scarce, the report suggests setting warnings using what is known about <b>how bodies cope with heat</b>, for each at-risk group. ${ind("Panel 4")}`,
      `Climate laws that mention health have grown 50-fold since 2000. Of countries’ updated national climate plans (NDCs), 93% mention health, and mentions of heat-related health are rising. ${ind("5.5, 5.4.1")}`],
    act: [["/plan/", "Plan a response, from the map"], ["/worked-plans/", "Worked plans for real places"], ["/countries/", "Seven country snapshots"], ["/loops/#reactive", "The reactive-spending cycle"]],
    ask: "When our heat warning is issued, what does each ministry and city do in the next 24 hours, and who checks it happened?" },
];

// ---- the report's targets for the next decade that bear most on heat (Panel 7) ----
const TARGETS = [
  ["By the end of 2027", "Early warning and response for all major climate health risks in every country, reaching all vulnerable groups and health systems."],
  ["By 2030", "Health adaptation plans, based on evidence of risk, with money and clear responsibilities, in every country and city."],
  ["By 2030", "Climate and health taught in depth in the training of all health professionals."],
  ["By 2030", "Every country able to respond to climate-related health emergencies under the International Health Regulations."],
  ["By 2030", "Cut energy demand by 7%, favouring buildings with healthy indoor temperatures and air."],
  ["By 2030", "Restore 350 million hectares of land and forest, and grow green and blue space in cities."],
  ["By 2035", "Sustainable cooling for all vulnerable people, including every nursing home and health facility: low-carbon, used only where essential, and backed by passive cooling."],
  ["No date set", "Rules that reduce at-risk workers’ exposure to heat."],
];

// ---- its six global recommendations (Panel 1), in brief ----
const RECS = [
  "Recognise climate change as a health emergency, and respond through WHO and UN emergency systems, including with a new WHO instrument.",
  "Make climate and health a top priority in how global institutions are organised and funded.",
  "Treat a fair and rapid cut in greenhouse gases as a health priority, with health professionals helping design the plans.",
  "Make fewer deaths and better health a core goal and measure of success for all climate action.",
  "Build a shared global climate and health data commons, as public infrastructure.",
  "Increase grant-based and low-cost finance for climate and health, in line with international commitments, without adding to debt.",
];

// ---- what the numbers cannot tell you yet ----
const BLIND = [
  ["Humid heat is undercounted.", "The heatwave measure uses temperature, not humidity. In humid places the danger to the body can be greater than the count shows."],
  ["Many heat deaths in South Asia are estimated, not counted.", "The mortality model learns from death records in 129 countries. In the part of the appendix we could read, the Philippines, Sri Lanka and Thailand supplied records; we did not find Bangladesh, India, Indonesia or Nepal. Their figures rest on models built from other places. Better death registration is itself a way to break the invisible-deaths cycle."],
  ["Informal work is mostly missing.", "Lost work hours are counted mainly for formal jobs, so the losses for street vendors, day labourers and home-based workers are likely larger than reported."],
  ["Who is hit hardest is hard to see.", "Data is rarely broken down by gender, income, ethnicity or age, so the report cannot show these differences well."],
  ["Mental health and care costs are not yet tracked.", "The report says both are gaps and has opened funding calls to build indicators."],
  ["Each risk is counted alone.", "Heat, smoke, drought and floods often come together and make each other worse; the report says the combined harm is probably much larger than any single number."],
  ["The research comes mostly from elsewhere.", "Only about 10% of climate-and-health papers have co-authors based in low or medium human-development countries."],
];

// ---- the cycles on the map that the report’s findings speak to ----
const CYCLES = [
  ["invisible", "The invisible-deaths loop", "Heat deaths that are never recorded, so the problem looks smaller than it is (1.1.5)."],
  ["sleep", "The sleepless-nights loop", "48 hours of sleep lost a year to hot nights (1.1.4)."],
  ["poverty", "The poverty–heat trap", "US$1.07 trillion in lost income, most of it in poorer countries (4.1.3)."],
  ["cooling", "The cooling trap", "Air conditioning saves lives and adds heat and emissions (2.2.2)."],
  ["clinic", "The overwhelmed-clinic loop", "Health emergency capacity is weakest where risk is highest (2.2.4)."],
  ["deadgreen", "The dying-green loop", "Most large cities have little greenery, and it is falling in the poorest (2.2.3)."],
  ["energypoverty", "The energy-poverty trap", "2.1 billion people still rely on polluting fuels at home (3.1.2)."],
  ["farmdebt", "The farm-debt loop", "Heat and drought added 127.9 million people to food insecurity in 2024 (1.4)."],
  ["protection", "The protection-gap loop", "Health adaptation money covers about a third of declared needs (4.3.3)."],
  ["reactive", "The reactive-spending loop", "Early warning reduces how many people are affected (2.3.2)."],
  ["fire", "The wildfire loop", "Most countries saw more days of very high wildfire risk (1.2.1)."],
  ["global", "The global cooling loop", "Higher demand for cooling drove about 80% of the rise in energy emissions in 2024 (3.1.1)."],
];

const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2316202B'/%3E%3Cpath d='M5 14 Q16 4 27 14' fill='none' stroke='%23F26430' stroke-width='4.5' stroke-linecap='round'/%3E%3Cpath d='M9 13 V27 M23 13 V27' stroke='%23F6E7D7' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E";
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
const FOOT_CLOSE = (fs.readFileSync(path.join(ROOT, "practical", "index.html"), "utf8").match(/  <aside class="foot-close"[\s\S]*?<\/aside>\n/) || [""])[0];
const TITLE = "The Lancet Countdown 2026, for extreme heat in Asia";
const DESC = "The 2026 Lancet Countdown on health and climate change, read for extreme heat in South and Southeast Asia: the key numbers, what they mean for cities, health workers, employers, communities, funders and governments, the gaps in the evidence, and all 397 references.";
const go = (href, t) => `<a href="${href}">${esc(t)}&nbsp;<span aria-hidden="true">→</span></a>`;
const nums = REFS.filter(r => r.n >= 1);

const body = `
    <section class="sol-page lc">
      <div class="container">
        <p class="eyebrow">New evidence · October 2026</p>
        <h1 class="h2 tool-h1">Ten years of health evidence on heat, <br>and what to do with it.</h1>
        <p class="tool-lede">The <b>Lancet Countdown on health and climate change</b> is a yearly report by more than 300 researchers in over 100 institutions, working with the World Health Organization. Its tenth report, published in October 2026, tracks 54 measures of how climate change affects health. Here is what it says about extreme heat, read for South and Southeast Asia and organised by what you can do about it.</p>
        <p class="sol-caveat"><b>About this summary.</b> Every number here is the report’s own, with the measure it comes from (“indicator 1.1.5”), so you can check it in the ${ext(REPORT, "full report")} or its ${ext(APPENDIX, "technical appendix")}. The words and the choice of what matters for heat are ours. Most figures are global; we say when they are about Asia. The report also covers energy, food, finance and politics in depth; we cover those only where they bear on heat. We do not take positions on the policies of particular countries.</p>
        <nav class="sol-jump lc-jump" aria-label="On this page"><b>Jump to:</b> <a href="#glance">The numbers</a> · <a href="#asia">What it means for Asia</a> · <a href="#for-you">What you can do</a> · <a href="#targets">Targets to 2035</a> · <a href="#blind-spots">What the numbers miss</a> · <a href="#cycles">Cycles on the map</a> · <a href="#references">All ${nums.length} references</a></nav>

        <h2 class="he-shelf he-shelf--big" id="glance">Eight numbers on heat</h2>
        <div class="he-stats lc-stats">
          ${STATS.map(([n, l, t, href]) => `<a class="he-stat" href="${href}"><span class="he-stat__n">${esc(n)}</span><span class="he-stat__l">${esc(l)}</span><span class="he-stat__t">${t}</span></a>`).join("\n          ")}
        </div>
        <blockquote class="he-quote"><p>“Delivering these actions and meeting these targets is no longer just the greatest public health opportunity of the century—it may be the only hope for a safe future.”</p><cite>The 2026 report of the Lancet Countdown, conclusion</cite></blockquote>

        <h2 class="he-shelf he-shelf--big" id="asia">What it means for South and Southeast Asia</h2>
        <ul class="lc-list">
          ${ASIA.map(x => `<li>${x}</li>`).join("\n          ")}
        </ul>
        <p class="he-note">Some news coverage of the report: ${ext("https://www.thehindu.com/sci-tech/energy-and-environment/india-among-top-countries-with-highest-heatwave-exposure-for-infants-older-adults-report/article71634194.ece", "India among top countries with highest heatwave exposure for infants, older adults")} (The Hindu) and ${ext("https://www.hindustantimes.com/india-news/climatelinked-heat-deaths-rise-36-since-paris-agreement-india-also-affected-lancet-101793153952423.html", "Climate-linked heat deaths rise 36% since Paris Agreement")} (Hindustan Times). More in ${go("/news/", "Heat in the news")}</p>

        <h2 class="he-shelf he-shelf--big" id="for-you">What it means for you, and what you can do this season</h2>
        <p class="he-intro">Pick the role closest to yours. Each shows what the report found, where to start on this site, and one question worth asking.</p>
        <nav class="he-sub lc-roles" aria-label="Choose your role">${READERS.map(r => `<a href="#${r.id}">${esc(r.h.replace(/^If you /, "").replace(/^work for a /, "").replace(/^work in /, "").replace(/, or .*$/, "").replace(/^./, c => c.toUpperCase()))}</a>`).join("")}</nav>
        <div class="lc-readers">
          ${READERS.map(r => `<section class="lc-reader" id="${r.id}" aria-labelledby="${r.id}-h">
            <h3 id="${r.id}-h">${esc(r.h)}</h3>
            <p class="lc-k">What the report found</p>
            <ul>${r.says.map(s => `<li>${s}</li>`).join("")}</ul>
            <p class="lc-k lc-k--act">Where to start</p>
            <ul class="lc-go">${r.act.map(([h, t]) => `<li>${go(h, t)}</li>`).join("")}</ul>
            <p class="lc-ask"><b>A question to ask:</b> ${esc(r.ask)}</p>
          </section>`).join("\n          ")}
        </div>

        <h2 class="he-shelf he-shelf--big" id="targets">The report’s targets for the next decade</h2>
        <p class="he-intro">For the first time, the report sets targets it will track each year. These are the ones that matter most for heat.</p>
        <ol class="lc-targets">
          ${TARGETS.map(([w, t]) => `<li><span class="lc-when">${esc(w)}</span>${esc(t)}</li>`).join("\n          ")}
        </ol>
        <details class="he-more lc-more"><summary>The report’s six recommendations to governments and global institutions</summary>
          <ol>${RECS.map(r => `<li>${esc(r)}</li>`).join("")}</ol>
        </details>

        <h2 class="he-shelf he-shelf--big" id="blind-spots">What the numbers cannot show yet</h2>
        <p class="he-intro">The report is open about its limits. These matter most for heat in Asia. They are not reasons to wait; they are places where better data would make protection fairer.</p>
        <ul class="lc-blind">
          ${BLIND.map(([h, t]) => `<li><b>${esc(h)}</b> ${esc(t)}</li>`).join("\n          ")}
        </ul>

        <h2 class="he-shelf he-shelf--big" id="cycles">The cycles on the map these findings speak to</h2>
        <p class="he-intro">The map shows how heat’s harms feed each other. Each finding below adds evidence to one of its vicious cycles, and each cycle links to <span class="lc-green">solutions that can break it</span>.</p>
        <ul class="lc-cycles">
          ${CYCLES.map(([id, n, t]) => `<li><a href="/loops/#${id}">${esc(n)}</a><span>${esc(t)}</span></li>`).join("\n          ")}
        </ul>

        <h2 class="he-shelf he-shelf--big" id="references">The report and all ${nums.length} of its references</h2>
        <p class="he-intro">Romanello M, Walawender M, Israelsson J, Hasan MM, et al. ${ext(REPORT, "The 2026 report of the Lancet Countdown on health and climate change: a decade of escalating health harms and a decisive moment for all")}. <i>The Lancet</i>, 2026. ${ext(APPENDIX, "Technical appendix (PDF)")}. Numbered as in the report. Where a reference has no web address, its link searches for it on Google Scholar. All of them are also in ${go("/sources/#lancet", "Sources and references")}</p>
        <div class="refs__bar lc-bar">
          <label for="lc-q">Search the references</label>
          <input id="lc-q" type="search" autocomplete="off" placeholder="For example: sleep, WHO, India, early warning">
          <p class="refs__count" id="lc-count" role="status" aria-live="polite">${nums.length} references</p>
        </div>
        <ol class="lc-refs" id="lc-refs">
          ${nums.map(r => `<li id="ref-${r.n}" value="${r.n}" data-q="${esc(r.cite.toLowerCase())}">${ext(r.link, esc(r.cite))}${r.url ? "" : ' <span class="lc-sch">search</span>'}</li>`).join("\n          ")}
        </ol>
      </div>
    </section>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(TITLE)} · Common Shade</title>
  <meta name="description" content="${esc(DESC)}">
  <meta name="theme-color" content="#16202B">
  <link rel="canonical" href="${SITE}/${SLUG}/">
  <link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
  <meta property="og:type" content="article"><meta property="og:site_name" content="Common Shade">
  <meta property="og:url" content="${SITE}/${SLUG}/"><meta property="og:title" content="${esc(TITLE)}"><meta property="og:description" content="${esc(DESC)}">
  <meta property="og:image" content="${SITE}/images/social-share-cs.jpg"><meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${ICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap">
  <link rel="stylesheet" href="/styles.css?v=${V}">
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: `${SITE}/${SLUG}/`, isBasedOn: REPORT, inLanguage: "en", license: "https://creativecommons.org/licenses/by/4.0/", publisher: { "@type": "Organization", name: "Common Shade", url: SITE + "/" } })}</script>
</head>
<body data-page="lancet">
  <a class="skip-link" href="#main">Skip to the content</a>
  <main id="main" tabindex="-1">${body}</main>
${FOOT_CLOSE}  <footer class="wkp-foot"><div class="container">
    <p>A plain-language reading of the 2026 report of the Lancet Countdown on health and climate change, published in <i>The Lancet</i>. The report, its figures and its references belong to their authors and publishers; we summarise them to help people act, not to replace the original. Spotted an error? <a href="/join/">Tell us</a>. Text: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0<span class="visually-hidden"> (opens in a new tab)</span></a>. <a href="/sources/">All sources</a></p>
  </div></footer>
  <script>
  (function(){var q=document.getElementById("lc-q"),items=[].slice.call(document.querySelectorAll("#lc-refs li")),c=document.getElementById("lc-count");
  q.addEventListener("input",function(){var w=q.value.toLowerCase().split(/\\s+/).filter(Boolean),n=0;items.forEach(function(li){var ok=w.every(function(x){return li.dataset.q.indexOf(x)>-1;});li.hidden=!ok;if(ok)n++;});c.textContent=w.length?n+" of ${nums.length} references":"${nums.length} references";});})();
  </script>
</body>
</html>
`;
fs.mkdirSync(path.join(ROOT, SLUG), { recursive: true });
fs.writeFileSync(path.join(ROOT, SLUG, "index.html"), html);
console.log(`lancet countdown 2026: ${READERS.length} reader guides, ${nums.length} references (${nums.filter(r => !r.url).length} via Scholar search)`);
