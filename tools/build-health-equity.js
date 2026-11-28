// Common Shade: the health and gender equity pages. One central question: what has to change around a person before
// the protection we recommend becomes a real option?
//   /heat-health-and-equity/        "Heat, health and the ability to act": the curated route, framework, shared
//                                   provisions (#taxonomy), map pathways, evidence gaps and routes for four audiences
//   /home-is-also-the-workplace/    flagship 1, with "A day in one home"
//   /care-through-heat/             flagship 2, with "When a service closes", pregnancy, schools and childcare, ageing
//                                   and disability
//   /rest-without-losing-income/    flagship 3, with "Can this worker use the protection?", water, toilets and dignity,
//                                   journeys, agriculture and cotton
// Words and evidence: tools/health-equity-text.js; a claim shows only if its source passed (tools/source-gate.js).
// Interactions work without JavaScript (all content in the HTML); health-equity/he.js adds the choices.
// Called by build-pages.js; tools/check-health-equity.js checks it.
"use strict";
const H = require("./health-equity-text.js"), G = require("./source-gate.js"), EQ = require("./equity-taxonomy.js");
const HS = require("./heat-interactives-sources.js");

module.exports = function healthEquity({ page, write, esc, hero, V }) {
  const ext = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const ev = key => { const c = H.CLAIMS[key]; if (!c || !G.passed(c.src)) return ""; const s = G.get(c.src); return `<li class="he-ev"><span class="he-kind">${esc(H.KIND[c.kind])}</span> ${esc(c.text)} <span class="he-src">${ext(s.url, esc(s.publisher.split(";")[0]))}${s.year ? `, ${esc(String(s.year))}` : ""}</span></li>`; };
  const evList = (keys, h = "What the evidence says") => { const items = keys.map(ev).filter(Boolean); return items.length ? `<div class="he-evbox"><h3 class="he-h3">${h}</h3><ul class="he-evs">${items.join("")}</ul><p class="he-meta">Each line says what kind of evidence it is. Guidance recommends; a study observes; a report describes what an organisation did. None of them alone shows that a measure improved health.</p></div>` : ""; };
  const gaps = g => `<section class="he-gaps" aria-label="Evidence gaps"><h3 class="he-h3">What we know, and what we do not</h3><dl>
      <div><dt>What we know</dt><dd><ul>${g.know.map(x => `<li>${esc(x)}</li>`).join("")}</ul></dd></div>
      <div><dt>What has been tested</dt><dd><ul>${g.tested.map(x => `<li>${esc(x)}</li>`).join("")}</ul></dd></div>
      <div><dt>What remains uncertain</dt><dd><ul>${g.unsure.map(x => `<li>${esc(x)}</li>`).join("")}</ul></dd></div>
      <div><dt>What a useful next study would ask</dt><dd>${esc(g.next)}</dd></div>
      <div><dt>What needs measuring</dt><dd>${esc(g.measure)}</dd></div></dl>
      <p class="he-meta">Not the same thing: a cooler room and better health; a service being open and people being able to use it; a warning sent and protective action taken; a committee seat and a say in decisions; reported symptoms and a diagnosis; an association and a cause.</p></section>`;
  const lever = (id, why) => { const l = HS.levers([id])[0]; return l ? `<li><a href="/actions/#${esc(id)}"><b>${esc(l.title)}</b></a> <span>${esc(why || l.text)}</span>${(l.watch || [])[0] ? `<span class="he-watch"><b>Watch for:</b> ${esc(l.watch[0].text || l.watch[0].risk || "")}</span>` : ""}</li>` : ""; };
  const sol = (id, label) => `<a href="/solutions/?eq=${id}&amp;eqs=any#passive">${esc(label)}</a>`;
  const shell = (slug, title, desc, kicker, h1, lede, body) => write(slug, page(slug, title, desc, `${hero(kicker, h1, lede)}\n  <div class="container he">${body}</div>`, `\n  <link rel="stylesheet" href="/health-equity/he.css?v=${V}"><script src="/health-equity/he.js?v=${V}" defer></script>`));
  const route = `<nav class="he-route" aria-label="Heat, health and the ability to act"><a href="/heat-health-and-equity/">Heat, health and the ability to act</a><a href="/home-is-also-the-workplace/">When home is also the workplace</a><a href="/care-through-heat/">Care that continues through heat</a><a href="/rest-without-losing-income/">Rest without losing income</a></nav>`;
  const illus = "Illustrative situation, a composite rather than a real person or household. No temperatures or health outcomes are predicted.";

  // ---- flagship 1: home is also the workplace ----
  const day = `<section class="he-int" id="a-day" aria-labelledby="day-h"><h2 class="hub-h" id="day-h">A day in one home</h2>
    <p class="he-tag">${illus}</p>
    <p class="hub-p">A two-room rented home with a metal roof. One adult does garment piecework here for a contractor; another works outside; a school-age child and an older relative share the rooms. Choose a part of the day.</p>
    <div class="he-tabs" role="tablist" aria-label="Part of the day" hidden>${H.DAY.map((d, i) => `<button type="button" role="tab" id="tab-${d.id}" aria-controls="day-${d.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(d.h)}</button>`).join("")}</div>
    ${H.DAY.map(d => `<article class="he-panel" id="day-${d.id}" role="tabpanel" aria-labelledby="tab-${d.id}"><h3 class="he-h3">${esc(d.h)}</h3><dl>
      <div><dt>Where the heat comes from</dt><dd>${esc(d.exp)}</dd></div><div><dt>What people are doing, and what limits them</dt><dd>${esc(d.act)}</dd></div>
      <div><dt>What could protect them</dt><dd>${esc(d.prot)}</dd></div><div><dt>Who can make it happen</dt><dd>${esc(d.who)}</dd></div><div><dt>What needs measuring</dt><dd>${esc(d.measure)}</dd></div></dl></article>`).join("")}
  </section>`;
  shell("home-is-also-the-workplace", "When home is also the workplace", "Where do you recover when the place you earn, cook, care and sleep stays hot? Home-based work, housing, tenure, electricity and night-time recovery, with what could change and who decides.", "Heat, health and the ability to act", "When home is also the workplace",
    "Where do you recover when the place you earn, cook, care and sleep remains hot?", `${route}
    <p class="hub-p">For many home-based workers, the room is also the workshop, the kitchen and the bedroom. Heat from the roof, the walls, a stove and machines builds through the day and is still there at night, when the body would normally recover. Weather forecasts describe the air outside; the heat that matters here is indoors.</p>
    ${evList(["hnsa", "wiegoBkk", "cookIndoors", "housing", "fans"])}
    ${day}
    <section class="he-sec" id="what-could-change" aria-labelledby="hw-ch"><h2 class="hub-h" id="hw-ch">What could change, and on what it depends</h2>
      <ul class="he-acts">${lever("coolhousing", "Roof and ceiling improvements, external shading and ventilation lower indoor heat; they work differently by climate, building and season.")}${lever("affordablecool", "Suitable cooling and electricity people can afford to run, with reliable supply.")}${lever("coolnights", "Support for cooler nights, so recovery is possible.")}${lever("heatcash")}</ul>
      <div class="cs-note cs-note--limit"><p class="cs-note__label">Trade-offs to plan for</p><ul><li>Opening a window may not be possible for security, privacy, noise or pollution.</li><li>A better roof can bring a higher rent or a threat to tenure, unless tenants are protected.</li><li>Moving work out of the hottest hours can push it into the evening, eating into rest.</li><li>A fan helps only below humidity-dependent temperature limits, and electricity has to be there and affordable.</li><li>Contractors and buyers set delivery dates and piece rates; changing them changes whether rest is possible.</li></ul></div>
      <p class="hub-p">Tenant–landlord agreements on improvements and rent, buyer and contractor arrangements on dates and rates, and finance that covers upkeep as well as installation all decide whether a physical fix reaches the people inside. Solutions that name tenant protections: ${sol("v-tenure", "Solutions library, filtered")}.</p>
    </section>
    ${gaps(H.GAPS.home)}
    <p class="he-meta">Related: <a href="/factory-heat/">Heat inside factories</a> · <a href="/care-through-heat/">Care that continues through heat</a> · <a href="/loops/#sleep">The sleepless-nights loop</a></p>`);

  // ---- flagship 2: care through heat ----
  const closes = `<section class="he-int" id="when-a-service-closes" aria-labelledby="cl-h"><h2 class="hub-h" id="cl-h">When a service closes</h2>
    <p class="he-tag">Illustrative disruptions. No times or costs are estimated.</p>
    <div class="he-tabs" role="tablist" aria-label="Disruption" hidden>${H.CLOSES.map((d, i) => `<button type="button" role="tab" id="tab-${d.id}" aria-controls="cl-${d.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(d.h)}</button>`).join("")}</div>
    ${H.CLOSES.map(d => `<article class="he-panel" id="cl-${d.id}" role="tabpanel" aria-labelledby="tab-${d.id}"><h3 class="he-h3">${esc(d.h)}</h3><dl>
      <div><dt>Who needs care</dt><dd>${esc(d.need)}</dd></div><div><dt>Who provides it now</dt><dd>${esc(d.now)}</dd></div><div><dt>What extra work arises</dt><dd>${esc(d.extra)}</dd></div>
      <div><dt>Public or employer arrangements that could reduce the burden</dt><dd><ul>${d.fix.map(x => `<li>${esc(x)}</li>`).join("")}</ul></dd></div><div><dt>What trade-offs remain</dt><dd>${esc(d.trade)}</dd></div></dl></article>`).join("")}
  </section>`;
  shell("care-through-heat", "Care that continues through heat", "Who takes on the work when someone becomes ill or a service closes? Childcare, eldercare, disability support, care workers, pregnancy and newborn care, schools, and what keeps care going in heat.", "Heat, health and the ability to act", "Care that continues through heat",
    "Who takes on the work when someone becomes ill or a service closes?", `${route}
    <p class="hub-p">Heat adds care: a child home from a closed school, an older relative who needs checking, a clinic visit that takes half a day. Who absorbs it depends on the household and on the services around it. Where services close or cannot be reached, the work does not disappear; it moves, often onto women and girls, but not always and not only.</p>
    ${evList(["serviceLoss", "disability", "olderFamily", "fansOlder"])}
    ${closes}
    <section class="he-sec" id="pregnancy" aria-labelledby="pr-h"><h2 class="hub-h" id="pr-h">Pregnancy, postpartum, newborns and access to care</h2>
      <p class="hub-p">Home, work, the journey and the clinic all matter together. This page gives no personal medical advice and asks nothing about anyone’s pregnancy; people who are pregnant follow their health worker’s advice.</p>
      ${evList(["indicators", "metaMaternal", "mohfw", "unicefBd", "unicefNote", "ccohsPreg"], "Guidance and evidence")}
      <ul class="he-list"><li><b>Appointments:</b> whether antenatal and postnatal visits can be reached in heat, at cooler times, with fewer repeat trips.</li><li><b>Transport and waiting:</b> shade, seating, water and toilets on the way and at the clinic.</li><li><b>Facility readiness:</b> cooling, backup power and staff who know heat illness in pregnancy and in newborns.</li><li><b>At work:</b> confidential adjustments, such as lighter duties or extra rest, without dismissal or loss of income.</li><li><b>What to monitor:</b> the shared indicators above, rather than new measures for each project.</li></ul>
      <ul class="he-acts">${lever("maternalheat")}${lever("readyclinics")}</ul>
    </section>
    <section class="he-sec" id="schools" aria-labelledby="sc-h"><h2 class="hub-h" id="sc-h">Schools and childcare</h2>
      <p class="hub-p">Classrooms under hot roofs, water and toilets, shade in the yard, the journey, school meals and the staff who work there all shape heat at school. Closing protects children from a hot building but moves care home and can cost meals and learning; staying open needs cooling, water and adjusted hours that work. Building improvements, adjusted schedules and continuity arrangements can be compared; none is right everywhere.</p>
      <ul class="he-acts">${lever("keepinschool")}${lever("childwater")}</ul>
    </section>
    <section class="he-sec" id="ageing-disability" aria-labelledby="ad-h"><h2 class="hub-h" id="ad-h">Ageing, disability and depending on services</h2>
      <p class="hub-p">Accessible cooling, transport and assisted mobility, reliable power for devices, information in formats people can use, and supported care decide whether protection reaches older and disabled people. They are also the people best placed to say what works: plans that involve them from the start are more likely to fit.</p>
      <ul class="he-acts">${lever("coolingcentres")}${lever("freecare")}</ul>
    </section>
    ${gaps(H.GAPS.care)}
    <p class="he-meta">Related: <a href="/who-is-at-risk/">Who heat hits hardest</a> · <a href="/intersections/">Intersections</a> · <a href="/social-protection/">Who could help a household through a hot season</a></p>`);

  // ---- flagship 3: rest without losing income ----
  const use = `<section class="he-int" id="can-they-use-it" aria-labelledby="use-h"><h2 class="hub-h" id="use-h">Can this worker use the protection?</h2>
    <p class="he-tag">Illustrative comparison. It does not calculate safe working time or set medical limits.</p>
    <p class="hub-p">The physical measure stays the same: <b>${esc(H.USE.measure)}</b>. Change the arrangements around one worker and see what changes.</p>
    <form class="he-use" data-he-use onsubmit="return false">${H.USE.factors.map(f => `<fieldset><legend>${esc(f.h)}</legend>${f.opts.map(([k, l], i) => `<label><input type="radio" name="use-${f.id}" value="${k}"${i === 0 ? " checked" : ""}> ${esc(l)}</label>`).join("")}</fieldset>`).join("")}</form>
    <div class="he-useout" aria-live="polite" data-he-useout><ul>${H.USE.factors.map(f => `<li data-f="${f.id}"><b>${esc(f.h)}:</b> ${f.opts.map(([k, l, says, fix]) => `<span data-o="${k}">${esc(says)}${fix ? ` <em>What would change it: ${esc(fix)}.</em>` : ""}</span>`).join(" ")}</li>`).join("")}</ul></div>
    <noscript><p class="he-meta">Without JavaScript, every option and its effect is listed above.</p></noscript>
  </section>`;
  shell("rest-without-losing-income", "Rest without losing income", "What would make advice to stop working possible to follow? Pay, permission, targets, care and travel for vendors, day-wage, home-based and agricultural workers, with water, toilets and dignity at work.", "Heat, health and the ability to act", "Rest without losing income",
    "What would make advice to stop working possible to follow?", `${route}
    <p class="hub-p">“Take a break in the shade” is good advice that many people cannot follow. Street vendors, day-wage and contract workers, home-based pieceworkers and agricultural labourers often lose earnings for every hour they stop. Whether rest is possible depends on how people are paid, who sets the schedule and the targets, whether breaks are paid, and whether reporting feeling unwell is safe.</p>
    ${evList(["whoWork", "heatIsOnRest", "heatIsOnCare", "eis", "bils", "sewa"])}
    ${use}
    <section class="he-sec" id="what-could-change" aria-labelledby="rw-ch"><h2 class="hub-h" id="rw-ch">Arrangements that make rest possible</h2>
      <ul class="he-acts">${lever("heatrules", "Paid rest, adjusted targets and schedules negotiated with workers, with shade, water and sanitation.")}${lever("heatcash", "Income support or cash when heat stops work; forecast-triggered help arrives before the heat.")}${lever("socialprotection")}${lever("anticipatory")}</ul>
      <div class="cs-note cs-note--limit"><p class="cs-note__label">Read carefully</p><ul><li>Insurance can help, but payouts depend on triggers that may not match a worker’s loss (basis risk) and on exclusions; it does not guarantee timely or adequate protection.</li><li>Proposed payment schemes are not entitlements until they exist in law or contract.</li><li>Employers and, in supply chains, buyers carry responsibilities that community solidarity does not replace.</li></ul></div>
      <p class="hub-p">Solutions that include earnings protection: ${sol("v-earnings", "Solutions library, filtered")}. Confidential reporting: ${sol("v-reporting", "filtered")}.</p>
    </section>
    <section class="he-sec" id="water-toilets" aria-labelledby="wt-h"><h2 class="hub-h" id="wt-h">Water, toilets and dignity</h2>
      <p class="hub-p">“Drink water often” is hard to follow when water is far, costly or unreliable, when toilets are unsafe, unclean, inaccessible or offer no privacy, when breaks need permission, or when schedules leave no time. Menstruation adds to the need for clean, private facilities with water and disposal. People may drink less to avoid a toilet they cannot use.</p>
      <div class="he-audit"><h3 class="he-h3">A practical check for a worksite, market or public space</h3><table class="he-table"><thead><tr><th scope="col">Check</th><th scope="col">What to look for</th></tr></thead><tbody>
        <tr><th scope="row">Provision</th><td>Drinking water and toilets close to where people work, enough for the number of people, separate and private where needed.</td></tr>
        <tr><th scope="row">Opening hours</th><td>Open whenever people are working, including early and late shifts.</td></tr>
        <tr><th scope="row">Access</th><td>Free or affordable, step-free, safe to reach, usable without asking permission each time.</td></tr>
        <tr><th scope="row">Maintenance</th><td>Cleaned and refilled on a schedule, with someone paid and responsible, and supplies for menstrual needs.</td></tr>
        <tr><th scope="row">User feedback</th><td>A way for users, including women and disabled people, to report problems and see them fixed.</td></tr></tbody></table></div>
    </section>
    <section class="he-sec" id="journeys" aria-labelledby="jr-h"><h2 class="hub-h" id="jr-h">Journeys to work and care</h2>
      <p class="hub-p">Walking, waiting at stops, queues and crowded transport, often with children or an older relative, add heat before and after work. Moving work to cooler hours can create new barriers: travelling in the dark, no transport at those times, or safety worries that fall differently on women, gender-diverse people and disabled people. Routes need assessing locally before anyone calls them safe.</p>
    </section>
    <section class="he-sec" id="agriculture" aria-labelledby="ag-h"><h2 class="hub-h" id="ag-h">Agricultural work and the cotton value chain</h2>
      <p class="hub-p">From growing and harvesting to sorting, loading, ginning and processing, tasks are shared out unevenly, and so is control over pay. Taking part in the work is not the same as owning or controlling the income from it. <a href="/cotton-and-heat/">Heat from field to factory</a> follows cotton task by task, and <a href="/factory-heat/">Heat inside factories</a> picks up the story indoors.</p>
    </section>
    ${gaps(H.GAPS.rest)}`);

  // ---- the curated route ----
  const T = EQ.T;
  const tax = `<section class="he-sec" id="taxonomy" aria-labelledby="tx-h"><h2 class="hub-h" id="tx-h">The shared provisions</h2>
    <p class="hub-p">The plan workbook, the Solutions library, the heat action plan review, funding records and Signals use the same words. Three things are kept apart: <b>who and where</b>, <b>what is provided</b>, and <b>how far it is shown</b>. A record that mentions a group does not provide anything for it; a provision on paper is not delivery; a service open to everyone is not equal access.</p>
    <details class="he-det" open><summary>What is provided (${T.provisions.length})</summary><dl class="he-tax">${T.provisions.map(v => `<div id="${v.id}"><dt>${esc(v.label)}</dt><dd>${esc(v.definition)} <span class="he-meta">Counts when: ${esc(v.include)} Does not count: ${esc(v.exclude)}</span></dd></div>`).join("")}</dl></details>
    <details class="he-det"><summary>Who and where (${T.people.length})</summary><dl class="he-tax">${T.people.map(v => `<div id="${v.id}"><dt>${esc(v.label)}</dt><dd>${esc(v.definition)}</dd></div>`).join("")}</dl></details>
    <details class="he-det"><summary>How far it is shown (${T.status.length})</summary><dl class="he-tax">${T.status.map(v => `<div id="${v.id}"><dt>${esc(v.label)}</dt><dd>${esc(v.definition)}</dd></div>`).join("")}</dl></details>
  </section>`;
  const loopName = id => (HS.loops([id])[0] || {}).name || id;
  const paths = `<section class="he-sec" id="map" aria-labelledby="mp-h"><h2 class="hub-h" id="mp-h">How it connects on the systems map</h2>
    <p class="hub-p">Explanatory pathways, each with how well it is established. They point to the map and to the actions that can change them.</p>
    <ol class="he-paths">${H.PATHWAYS.map(p => `<li><p class="he-chain">${p.chain.map(esc).join(' <span aria-hidden="true">→</span><span class="visually-hidden">, leading to</span> ')}</p><p><span class="he-st he-st--${p.status}">${H.PSTATUS[p.status]}</span> ${esc(p.note)}${p.loop ? ` <a href="/loops/#${p.loop}">${esc(loopName(p.loop))}</a>.` : ""}</p><p class="he-meta">Where it can be changed: ${p.act.map(([t, u]) => `<a href="${u}">${esc(t)}</a>`).join(" · ")}</p></li>`).join("")}</ol>
  </section>`;
  shell("heat-health-and-equity", "Heat, health and the ability to act", "A route through Common Shade on heat, health and gender equity: who can use protection, what makes it possible, who decides, what the evidence shows and what remains unknown.", "A route through the site", "Heat, health and the ability to act",
    "Not only what reduces heat exposure, but who can use that protection, what makes it possible, and who remains excluded.", `${route}
    <section class="he-sec" id="questions" aria-labelledby="q-h"><h2 class="hub-h" id="q-h">Start with a question</h2><ul class="he-qs">
      <li><a href="/rest-without-losing-income/"><b>Can I rest without losing income?</b><span>Pay, permission, targets and who decides</span></a></li>
      <li><a href="/home-is-also-the-workplace/"><b>Can my home support work and recovery?</b><span>Heat indoors, tenure, electricity and night-time recovery</span></a></li>
      <li><a href="/care-through-heat/"><b>Who provides care when services are disrupted?</b><span>Childcare, eldercare, disability support, clinics</span></a></li>
      <li><a href="/rest-without-losing-income/#water-toilets"><b>Can I reach and use water, cooling or healthcare?</b><span>Water, toilets, journeys and access</span></a></li>
      <li><a href="#taxonomy"><b>Who gets to decide what protection looks like?</b><span>Participation, reporting and accountability</span></a></li></ul></section>
    <section class="he-sec" id="frame" aria-labelledby="fr-h"><h2 class="hub-h" id="fr-h">How this route reads heat risk</h2>
      <p class="hub-p">Risk comes from several things at once. Some belong to the body; most belong to the conditions people live and work in, and those can change.</p>
      <ul class="he-frame">${H.FRAME.map(([t, k]) => `<li class="he-frame--${k}"><b>${esc(t)}</b><span>${k === "body" ? "The body" : k === "both" ? "The body and conditions" : "Social and working conditions"}</span></li>`).join("")}</ul>
      <p class="hub-p">Women are not one group, and nobody is helpless. Gender shapes who cooks, who cares, who controls spending and who is listened to, and it does so differently by place, class, caste, age, disability, migration, tenure and work. Some risks fall harder on men in some jobs. Transgender and gender-diverse people can face particular barriers to services and toilets. Situations on these pages are illustrative unless a source documents them, and none assigns anyone a risk score.</p>
    </section>
    ${paths}
    ${tax}
    <section class="he-sec" id="audiences" aria-labelledby="au-h"><h2 class="hub-h" id="au-h">Routes for different readers</h2><div class="he-aud">
      <article class="cs-card"><h3 class="he-h3">Community and worker organisations</h3><p>Use the “Can this worker use the protection?” comparison and the water and toilet check to ask employers and authorities for specific changes. <a href="/rest-without-losing-income/#can-they-use-it">Start here</a> · <a href="/join/">Share what works</a></p></article>
      <article class="cs-card"><h3 class="he-h3">Local authorities and service providers</h3><p>Add the equity and accommodation check to your heat plan, and plan for service continuity. <a href="/plan/#plan-step-6">Plan a response, step 6</a> · <a href="/care-through-heat/#when-a-service-closes">When a service closes</a></p></article>
      <article class="cs-card"><h3 class="he-h3">Researchers</h3><p>Each flagship page ends with what is known, tested and uncertain, and the next useful question. <a href="/resources/heat-action-plans/india/#provisions">Documented provisions in heat plans</a> · <a href="/evidence-map/">Evidence map</a></p></article>
      <article class="cs-card"><h3 class="he-h3">Funders</h3><p>Ask of any proposal: what practical change it supports, which institution delivers it, what recurring spending it needs, what evidence it will generate, and who among the intended users shapes the decision. <a href="/heat-economy/money/#equity-reach">Health and equity reach in tracked funding</a></p></article>
    </div></section>
    <section class="he-sec" id="research-questions" aria-labelledby="rq-h"><h2 class="hub-h" id="rq-h">Questions worth studying</h2><ul class="he-list">
      <li>Do paid breaks improve uptake of heat protection without reducing earnings?</li><li>Do housing improvements support recovery as well as reduce indoor temperature?</li><li>Do service-continuity arrangements reduce care burdens without transferring unpaid work?</li><li>Does participation change budgets and operating rules?</li><li>Which groups remain excluded after nominal coverage expands?</li></ul></section>`);
  console.log(`health and equity: 4 pages, ${Object.values(H.CLAIMS).filter(c => G.passed(c.src)).length} of ${Object.keys(H.CLAIMS).length} evidence statements shown (sources passed)`);
};
