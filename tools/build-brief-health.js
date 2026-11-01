// A citable evidence brief: heat and the health of mothers, newborns, children and minds, and violence against women,
// in South and Southeast Asia. Known, inferred and uncertain are kept apart; every figure is one the map already cites,
// checked as recorded in research/2026-11/health-deepening/. The research questions come from data/site/learning.json,
// so the brief and the Evidence map stay in step. Called by tools/build-pages.js.
"use strict";
const fs = require("fs"), path = require("path");

module.exports = function brief({ page, write, esc, D, ROOT }) {
  const SLUG = "briefs/heat-mothers-children-minds", DATE = "November 2026";
  const C = id => D.CONSEQUENCES.find(c => c.id === id) || { sources: [] };
  const LQ = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "learning.json"), "utf8")).questions;
  const Q = ["q-pregnancy-heat", "q-newborn-units", "q-child-diarrhoea", "q-heat-suicide", "q-heat-ipv"].map(id => LQ.find(q => q.id === id)).filter(Boolean);
  const LV = id => D.LEVERS.find(l => l.id === id) || {};
  // the sources, numbered once, in the order they are first cited
  const REF = [], ref = s => { let i = REF.findIndex(r => r.url === s.url); if (i < 0) { REF.push(s); i = REF.length - 1; } return `<sup><a href="#ref-${i + 1}">${i + 1}</a></sup>`; };
  const S = {
    cher: C("pregnancy").sources.find(s => /Chersich/.test(s.label)), rekha: C("pregnancy").sources.find(s => /Rekha/.test(s.label)),
    bdpre: C("pregnancy").sources.find(s => /Preprint/.test(s.label)), mnch: C("pregnancy").sources.find(s => /UNFPA/.test(s.label)),
    lcinf: C("newborns").sources.find(s => /Lancet Countdown/.test(s.label)), carlton: C("childdiarrhoea").sources[0],
    carleton: C("suicide").sources[0], mhbrief: C("mental").sources.find(s => /policy brief/.test(s.label)), thompson: C("mental").sources.find(s => /Thompson/.test(s.label)),
    zhu: C("gbv").sources[0], venu: C("womenwater").sources[0],
    whofs: { label: "WHO, 2026: Heat and health, fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health" } };
  const missing = Object.entries(S).filter(([, v]) => !v || !v.url).map(([k]) => k);
  if (missing.length) throw new Error("brief: missing sources " + missing.join(", "));

  const K = (cls, label, items) => `<div class="br-k br-k--${cls}"><p class="br-kl">${label}</p><ul>${items.map(x => `<li>${x}</li>`).join("")}</ul></div>`;
  const section = (id, h, lede, known, inferred, uncertain, more = "") => `<section class="br-s" id="${id}"><h2>${h}</h2>${lede ? `<p class="br-lede">${lede}</p>` : ""}
    <div class="br-kiu">${K("k", "Known", known)}${K("i", "Inferred", inferred)}${K("u", "Uncertain", uncertain)}</div>${more}</section>`;

  const body = `
  <article class="container br">
    <header class="br-head"><p class="eyebrow">Evidence brief · ${DATE}</p>
      <h1 class="pg-h1">Heat and the health of mothers, children and minds</h1>
      <p class="pg-lede">What the evidence shows about extreme heat and pregnancy, newborns and young children, mental health, and violence against women in South and Southeast Asia: what is known, what is inferred, what is still uncertain, and five questions that research could answer.</p>
      <p class="br-meta">Common Shade · beattheheat.asia · Free to use under CC BY 4.0 · <button type="button" class="br-print" onclick="window.print()">Print or save as PDF</button></p></header>

    <section class="br-s br-sum" id="summary"><h2>In brief</h2><ul>
      <li>Heat in pregnancy is linked to more preterm births and stillbirths${ref(S.cher)}, and the largest risks fall on poorer women. Women doing heavy work in the heat may carry the most risk${ref(S.rekha)}.</li>
      <li>Young children face more heatwave days than in the past${ref(S.lcinf)}, and warmer weather is linked to more diarrhoea${ref(S.carlton)}, a leading cause of death in young children.</li>
      <li>Heat is linked to distress, worse outcomes for people living with mental illness${ref(S.thompson)}, and, in India, to more suicides in the growing season${ref(S.carleton)}.</li>
      <li>Across India, Nepal and Pakistan, hotter years are linked to more violence against women by their partners${ref(S.zhu)}.</li>
      <li>Most of the strongest evidence comes from outside the region, or from one place within it. What protects people is the least studied part.</li></ul></section>

    ${section("pregnancy", "Pregnancy and birth", "", [
      `Across 70 studies in 27 countries, the odds of a preterm birth rose about 5% for each 1 °C rise in temperature, and about 16% during heatwaves; stillbirths rose about 5% for each 1 °C${ref(S.cher)}.`,
      `The associations were largest among women in lower socioeconomic groups and at the youngest and oldest ages${ref(S.cher)}.`,
      `In Tamil Nadu, among 800 pregnant women doing moderate to heavy physical work, those with high workplace heat had about twice the risk of miscarriage${ref(S.rekha)}.`,
      `A call to action by three UN agencies names heat among the hazards linked to gestational diabetes, hypertensive disorders, preterm birth, low birth weight and stillbirth, and to stress and anxiety in pregnancy${ref(S.mnch)}.`],
      [`Rest, lighter work and cooler places during pregnancy could reduce these risks; this follows from the evidence, but has not been tested in the region.`,
        `Women who keep working outdoors or fetching water while pregnant are likely to carry the most risk.`],
      [`Only seven of the 27 countries in the main review were low- or middle-income${ref(S.cher)}; effect sizes in South and Southeast Asia may differ.`,
        `The Tamil Nadu finding comes from one cohort, and its range is wide${ref(S.rekha)}.`,
        `A preprint, not yet peer reviewed, estimates that the extreme-heat days a pregnancy passes through in Bangladesh rose from about 4 for births in 2018 to about 30 for births in 2024${ref(S.bdpre)}.`])}

    ${section("children", "Newborns and young children", "", [
      `In 2014–2023, each infant in India faced an average of 7.7 heatwave days a year, 47% more than in the 1990s${ref(S.lcinf)}.`,
      `Across 26 studies, each 1 °C rise in temperature was linked to about 7% more diarrhoea, a leading cause of death in young children${ref(S.carlton)}.`],
      [`Repeated diarrhoea in hot months is likely to add to undernutrition, and to the load on clinics.`,
        `Safe water, handwashing and oral rehydration in place before the hot months could offset part of the risk.`],
      [`The diarrhoea review found signs of publication bias and an uneven spread of studies across regions${ref(S.carlton)}.`,
        `We found no measurements of how hot labour wards and newborn units get during heatwaves in the region.`])}

    ${section("minds", "Mental health and suicide", "", [
      `Heat is linked to more anxiety, distress and suicide, and to worse outcomes for people living with mental illness${ref(S.thompson)}.`,
      `Heat can worsen underlying illness, including mental health conditions${ref(S.whofs)}.`,
      `In India, a 1 °C rise in a day’s temperature above 20 °C in the growing season was linked to about 70 more suicides, as the same heat cut crop yields; warming over 30 years is estimated to account for 59,300 suicides${ref(S.carleton)}.`,
      `In many countries, mental health services are far from meeting the need${ref(S.mhbrief)}.`],
      [`Lost farm income is the likely route between heat and suicide in rural India; support after crop losses could weaken the link.`],
      [`The India suicide findings have been debated.`,
        `Little is known about heat and self-harm in cities, or in other countries of the region.`])}

    ${section("violence", "Violence against women", "", [
      `Across 194,871 women in India, Nepal and Pakistan, each 1 °C rise in yearly temperature was linked to about 4.5% more intimate partner violence, with physical and sexual violence rising most${ref(S.zhu)}.`,
      `Under very high emissions, it could rise about 21% by the 2090s, against about 6% if warming is held lowest${ref(S.zhu)}.`],
      [`Lost income, stress and crowded, hot homes may all play a part.`,
        `Longer trips to fetch water in the heat may expose women and girls to harassment.`],
      [`The study is cross-sectional and uses yearly temperatures: it shows an association, not its causes${ref(S.zhu)}.`,
        `Whether income support, cooler homes or women’s groups weaken the link has not been studied.`])}

    ${section("work", "Women at work", "", [
      `Among 312 women workers in India, heat exceeded safe limits for 71%; of those with poor or no toilets, 87% reported genitourinary problems, and about 1 in 10 showed heat strain and moderate dehydration${ref(S.venu)}.`],
      [`Safe toilets, water and rest at hot workplaces are likely to protect women’s health, including in pregnancy.`],
      [`The study covers three sectors in one country.`])}

    <section class="br-s" id="what-could-help"><h2>What could help</h2><p class="br-lede">Possibilities the evidence points to. Each is described on the map, with who could act.</p>
      <ul class="br-acts">${["maternalheat", "childwater", "mindheat", "safeathome", "readyclinics", "coolingcentres"].map(id => LV(id)).filter(v => v.id).map(v => `<li><a href="/#break-${v.id}"><b>${esc(v.title)}</b></a> ${esc(v.text)}</li>`).join("")}</ul></section>

    <section class="br-s" id="questions"><h2>Five questions research could answer</h2><p class="br-lede">From the learning agenda on the <a href="/evidence-map/#questions">Evidence map</a>. What could answer each one, and at what scale, are our suggestions.</p>
      <ol class="br-qs">${Q.map(q => `<li><p class="br-q">${esc(q.q)}</p><dl><dt>What we have</dt><dd>${esc(q.have)}</dd><dt>What could answer it</dt><dd>${esc(q.could)}</dd><dt>Scale</dt><dd>${esc(q.scale)}</dd></dl></li>`).join("")}</ol></section>

    <section class="br-s" id="method"><h2>How this brief was made</h2>
      <p>Every figure is one the Common Shade map already cites. Each source was opened and archived, and the terms we rely on were found in its text; for journal articles, in the abstract. Known means measured, official or peer-reviewed; inferred means a reasonable step from the evidence, or a projection; uncertain means a gap, a preprint, or a finding that has been debated. If something here is wrong, or a better source exists, we would be grateful to <a href="/corrections/">hear it</a>.</p></section>

    <section class="br-s" id="cite"><h2>How to cite</h2><blockquote class="cite-box">Common Shade. <i>Heat and the health of mothers, children and minds: what the evidence shows in South and Southeast Asia.</i> Evidence brief, ${DATE}. beattheheat.asia/${SLUG}/. CC BY 4.0.</blockquote></section>

    <section class="br-s br-refs" id="sources"><h2>Sources</h2><ol>${REF.map((r, i) => `<li id="ref-${i + 1}"><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}<span class="visually-hidden"> (opens in a new tab)</span></a></li>`).join("")}</ol></section>
  </article>`;
  // the index of evidence briefs, so /briefs/ (the brief's breadcrumb) is a real page
  write("briefs", page("briefs", "Evidence briefs", "Short, citable evidence briefs from Common Shade: what is known, inferred and uncertain on one question, with the research that could answer it.",
    `<header class="pg-hero"><div class="container"><p class="eyebrow">News and evidence</p><h1 class="pg-h1">Evidence briefs</h1><p class="pg-lede">Short, citable briefs on one question at a time: what is known, what is inferred, what is still uncertain, and the research that could answer it. Free to use under CC BY 4.0.</p></div></header>
    <section class="container hub"><ul class="hub-grid hub-grid--plain"><li><a class="hub-card" href="/${SLUG}/"><b>Heat and the health of mothers, children and minds</b><span>Pregnancy, newborns and young children, mental health and suicide, violence against women, and women at work in South and Southeast Asia. ${DATE}.</span></a></li></ul>
      <p class="hub-p">More briefs will follow. For a whole-site summary each month, see <a href="/whats-new/">State of the field</a>; for printable one-pagers, see <a href="/print/">Printable one-pagers</a>.</p></section>`));
  write(SLUG, page(SLUG, "Heat and the health of mothers, children and minds", "An evidence brief on extreme heat and pregnancy, newborns and young children, mental health and violence against women in South and Southeast Asia: what is known, inferred and uncertain, and five questions research could answer.", body));
};
