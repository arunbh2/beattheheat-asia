// Intersections (/intersections/): a note on intersectionality, a game about who protection from heat reaches, and
// resources. The people in the game are drawn composites, never real individuals, and each carries a strength as well
// as barriers. The rules are a simplification of the barriers set out on Who heat hits hardest (AT_RISK_BARRIERS in
// data/core), and the page says so. Called by tools/build-pages.js. Client: /intersections/game.js.
"use strict";
module.exports = function intersections({ page, write, esc, V, D }) {
  // barriers a protection can stumble on; each person carries some of them
  const TAGS = {
    nophone: "has no phone", lang: "does not speak the language the notices are in", deaf: "is deaf", mobility: "cannot walk far",
    care: "cannot leave the people in their care", nightwork: "works at night and sleeps by day", far: "lives far from the services",
    unsafe: "has been harassed in crowded public places", nobank: "has no bank account", unregistered: "is not on the local lists, or has papers that do not match",
    informal: "works where no rules are inspected", renter: "rents a room and cannot change the roof", alone: "lives alone" };
  const PEOPLE = [
    { id: "widow", who: "An older widow who lives alone", tags: ["alone", "mobility", "nophone"], needs: ["older"], strength: "Knows everyone on her lane, and they know her." },
    { id: "garment", who: "A pregnant garment worker on night shifts, new to the city", tags: ["nightwork", "unregistered", "nobank", "renter"], needs: ["pregnant", "work"], strength: "Has a close friend on the same shift." },
    { id: "vendor", who: "A street vendor who is deaf", tags: ["deaf", "informal"], needs: ["work"], strength: "Reads fast, and is in the vendors’ phone group." },
    { id: "girl", who: "A girl of fourteen who looks after her younger brothers", tags: ["care", "nophone"], needs: ["child"], strength: "Her school has started a heat club." },
    { id: "builder", who: "A construction worker from another state", tags: ["lang", "unregistered", "nobank", "renter"], needs: ["work"], strength: "A workmate from his village translates for him." },
    { id: "seller", who: "A transgender woman who sells snacks near the station", tags: ["unsafe", "informal", "unregistered"], needs: ["work"], strength: "Belongs to a community group that looks out for its members." },
    { id: "heart", who: "A man with a heart condition, in a tin-roofed room with his family", tags: ["renter"], needs: ["illness", "homeheat"], strength: "His daughter works as a nurse’s aide." },
    { id: "farm", who: "A farmworker with a baby, in a village far from the clinic", tags: ["far", "care", "informal", "nophone"], needs: ["infant", "work"], strength: "Her women’s savings group meets every week." }];
  const PROTECT = [
    { id: "sms", name: "Heat warnings by text message", blocks: ["nophone", "lang"], fix: { name: "Voice messages in several languages, passed on by neighbours", removes: ["nophone", "lang"] } },
    { id: "loud", name: "Warnings by loudspeaker and radio", blocks: ["deaf", "lang", "nightwork"], fix: { name: "Flags and signs at markets, in several languages, repeated by day", removes: ["deaf", "lang", "nightwork"] } },
    { id: "centre", name: "A cooling centre in the community hall", blocks: ["mobility", "care", "unsafe", "nightwork", "far"], fix: { name: "Transport, a corner for children, a safe room for women and transgender people, open at night", removes: ["mobility", "care", "unsafe", "nightwork"] } },
    { id: "cash", name: "A cash top-up for workers who lose pay, paid to bank accounts on local lists", only: ["work"], blocks: ["nobank", "unregistered"], fix: { name: "Cash at the door or by mobile money, with no local address needed", removes: ["nobank", "unregistered"] } },
    { id: "rules", name: "Rest breaks enforced on registered building sites", only: ["work"], blocks: ["informal", "nightwork"], fix: { name: "Rest rules extended to markets, farms, factories at night and street vending", removes: ["informal", "nightwork"] } },
    { id: "visits", name: "Home visits by community health workers", blocks: ["unregistered", "nightwork"], fix: { name: "Health workers add newcomers and people without papers to their lists, and visit at changing hours", removes: ["unregistered", "nightwork"] } },
    { id: "clinic", name: "A heat ward at the clinic, open into the evening", blocks: ["far"], fix: { name: "Mobile clinic days in villages on the hottest days", removes: ["far"] } },
    { id: "roofs", name: "Cool roofs for low-income homeowners", only: ["older", "illness", "homeheat", "infant", "pregnant", "child"], blocks: ["renter"], fix: { name: "Cool roofs for rented rooms too, with help for landlords", removes: ["renter"] } }];
  const G = { tags: TAGS, people: PEOPLE, protect: PROTECT };
  const barriers = (D.AT_RISK_BARRIERS || []).map(b => b.q);
  const FIG = `<svg viewBox="0 0 56 56" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14 Q28 2 50 14" stroke="#F26430" stroke-width="3.4"/><circle cx="28" cy="22" r="5.5"/><path d="M28 27.5 V40 M28 40 L22 52 M28 40 L34 52 M28 31 L20 37 M28 31 L36 37"/></g></svg>`;

  write("intersections", page("intersections", "Intersections: same heat, different lives", "Why the same heatwave reaches people so differently, and a game about who protection reaches: eight composite people on one street, a limited set of protections, and the chance to redesign them.",
    `<header class="ix-hero"><div class="container ix-hero__in"><div><p class="eyebrow">Intersections</p><h1 class="pg-h1">Same heat, <br>different lives</h1>
      <p class="pg-lede">A heatwave falls on a whole street at once. Who it harms, and who protection reaches, depends on where the parts of each life meet: age, gender, body, work, home, language, papers and place.</p>
      <nav class="rf-jump" aria-label="On this page"><a href="#note">A note on intersectionality</a><a href="#game">The game</a><a href="#resources">Resources</a></nav></div>
      <svg class="ix-art" viewBox="0 0 360 300" aria-hidden="true" focusable="false"><circle cx="140" cy="120" r="88" fill="#F26430" fill-opacity=".18" stroke="#F26430" stroke-width="3"/><circle cx="220" cy="120" r="88" fill="#2E6F95" fill-opacity=".16" stroke="#2E6F95" stroke-width="3"/><circle cx="180" cy="190" r="88" fill="#1F7A70" fill-opacity=".16" stroke="#1F7A70" stroke-width="3"/>
      <g font-family="Hanken Grotesk, sans-serif" font-size="15" font-weight="700" fill="#16202B"><text x="78" y="92">age</text><text x="248" y="92">work</text><text x="160" y="262">home</text></g>
      <g fill="none" stroke="#16202B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="180" cy="128" r="9"/><path d="M180 137 V168 M180 168 L170 192 M180 168 L190 192 M180 146 L166 156 M180 146 L194 156"/></g></svg></div></header>

    <section class="container ix-sec" id="note" aria-labelledby="note-h">
      <h2 class="hub-h" id="note-h">A note on intersectionality</h2>
      <div class="ix-note">
        <p>Intersectionality is a way of seeing how the parts of a person’s life combine. It began in legal scholarship in the late 1980s, to describe discrimination that no single category could explain, and it is now used widely in public health.</p>
        <p>In a heatwave, the parts of a life do not simply add up. They meet. An older woman is at risk; an older woman who lives alone, cannot walk far and has no phone may be reached by nothing at all. A warning, a cooling centre and a cash payment can each work well for most people, and still miss the same person, for different reasons, at the same time.</p>
        <p>This is why protection designed for an average person tends to miss people at the crossings. The barriers set out on <a href="/who-is-at-risk/">Who heat hits hardest</a> rarely come alone${barriers.length ? `: ${barriers.slice(0, 3).map(q => esc(q.replace(/\?$/, "").toLowerCase())).join("; ")}` : ""}.</p>
        <p>Seeing the crossings is not about ranking people by how much they suffer. Everyone on this page also has strengths, and the people closest to a barrier usually know best how to get round it.</p>
      </div>
    </section>

    <section class="ix-band" id="game" aria-labelledby="game-h"><div class="container ix-sec">
      <p class="eyebrow">A game</p><h2 class="hub-h" id="game-h">Who does protection reach?</h2>
      <p class="hub-p">Eight people live on one street. A heatwave is coming. You can put three protections in place. Then look closely at who they reach, and redesign.</p>
      <div class="ix-game" data-ix>
        <ol class="lv-steps" aria-label="Three rounds"><li class="is-on" data-ix-step="1">Choose three</li><li data-ix-step="2">Look closer</li><li data-ix-step="3">Redesign</li></ol>
        <ul class="ix-people" data-ix-people>${PEOPLE.map(p => `<li class="ix-p" data-person="${p.id}">${FIG}<div><b>${esc(p.who)}</b><span class="ix-str">${esc(p.strength)}</span><span class="ix-res" data-res="${p.id}" aria-live="polite"></span></div></li>`).join("")}</ul>
        <div class="ix-board">
          <h3 class="ix-h3" data-ix-title>Choose three protections</h3>
          <ul class="ix-cards" data-ix-cards>${PROTECT.map(x => `<li><label class="ix-card"><input type="checkbox" data-pr="${x.id}"><span><b>${esc(x.name)}</b><small class="ix-fix" data-fix="${x.id}" hidden>Redesign: ${esc(x.fix.name)}</small></span></label><button type="button" class="ix-adapt" data-adapt="${x.id}" hidden aria-pressed="false">Redesign it</button></li>`).join("")}</ul>
          <p class="ix-count" data-ix-count aria-live="polite">0 of 3 chosen</p>
          <p class="lv-ctrl"><button type="button" class="lv-next" data-ix-go disabled>The heatwave arrives <span aria-hidden="true">→</span></button> <button type="button" class="lv-back" data-ix-reset>Start again</button></p>
        </div>
        <div class="ix-out" data-ix-out aria-live="polite"></div>
      </div>
      <noscript><p class="hub-p">This game needs JavaScript. The same ideas are on <a href="/who-is-at-risk/">Who heat hits hardest</a>.</p></noscript>
      <p class="rf-note">A thinking exercise. The people are composites, not real individuals, and the rules simplify the barriers described in the evidence on this site. It is not a model of any real street.</p>
    </div></section>

    <section class="container ix-sec" id="resources" aria-labelledby="res-h">
      <h2 class="hub-h" id="res-h">Resources</h2>
      <ul class="ix-resources">
        <li class="std"><b><a href="https://onebillionresilient.org/project/minecraft-extreme-heat-series/" target="_blank" rel="noopener">Minecraft: Extreme Heat Series<span class="visually-hidden"> (opens in a new tab)</span></a></b>
          <span>From the Climate Resilience Center (Arsht-Rock’s One Billion Resilient), with Minecraft Education and Rewrite Edu: two games, Heat Wave Survival and Power Grid Hero, and a Build Challenge. Students learn to recognise heat exhaustion and heatstroke and respond with simple steps such as fans and water, and see how parks, reflective surfaces and shade can cool a city.</span></li>
        <li class="std"><b><a href="/a-night-in-the-heat/">A night in the heat</a></b><span>Stay with an older woman living alone, a pregnant woman or a family with a baby through a hot night and a clinic visit.</span></li>
        <li class="std"><b><a href="/who-is-at-risk/">Who heat hits hardest</a></b><span>Ten groups, the barriers between them and safety, and what helps.</span></li>
      </ul>
      <p class="ix-more">We will be adding many more resources. If you know one that belongs here, we would be glad to <a href="/join/#join-form">hear about it</a>.</p>
    </section>
    <script>window.IX=${JSON.stringify(G).replace(/</g, "\\u003c")};</script><script src="/intersections/game.js?v=${V}" defer></script>`));
};
