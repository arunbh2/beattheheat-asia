// Common Shade: shared conditions and resilience, one set of words for every page that uses them.
// The phrase "communities of fate" is explained once (INTRO, on the homepage, /approach/ and /shared-heat/); elsewhere the
// site says shared conditions, connected lives, collective protection or dependable services. It is an interpretive lens:
// Common Shade does not attribute it to one thinker or tradition, and nothing here is a measured finding.
// "Resilience" has one working meaning (RESILIENCE): it is spelled out where a page claims it, never used as a slogan.
// Everything in the worked example is fictional and labelled so; its people come from The Heat Assembly's market town.
// Read by: tools/build-static.js (homepage block, /plan/ block, loops, who is at risk, practical actions, paying for
// protection), tools/build-pages.js (/approach/, /shared-heat/, /who-holds-it/), tools/build-signals.js (questions for a
// commitment), tools/el-nino-explainer-text.js (where the pathways meet) and llms-full.txt (md()).
"use strict";
const SLUG = "shared-heat";
const TITLE = "Who shares the heat: one market through one hot season";
const DESC = "A worked example of how a hot day ties lives together through shared places, work and services, why people sharing the heat do not share the same power over it, and what makes protection last beyond one season.";

// the introduction: an everyday scene first, the phrase explained once, then resilience in plain terms
const INTRO = {
  h: "Connected by the heat",
  scene: "On a hot afternoon at a market, whether a porter can rest depends on whether leaving the queue costs a paid load. Whether a vendor has water depends on who orders the refill. Whether a child can learn depends on the classroom, and whether a parent keeps a shift depends on the school's hours. And whether any of them recovers overnight depends on water, electricity and the home they go back to.",
  phrase: "Heat ties these lives together through the places, work, institutions and services they share. Common Shade calls such groups communities of fate: people whose wellbeing becomes connected through shared conditions, even when their exposure, money, rights and say in decisions are far from equal. The connection can run beyond one street, along a commuting route, a labour contract, a supply chain or a public service.",
  resilience: "Building resilience, in this sense, means giving people a greater say in those shared conditions and making protection dependable: something a household can count on, not a project that ends with its funding.",
  lens: "A way of looking, not a measured finding. Common Shade uses the phrase as a lens and does not trace it to a single thinker or theory.",
  go: ["/shared-heat/", "Follow one market through a hot season"]
};

// the working meaning of resilience, and the four times of year it has to hold
const RESILIENCE = {
  meaning: "The ability of people and institutions to see heat coming and reduce the risk, to respond when it arrives, to recover without falling further behind, and to change the arrangements that cause the same harm every year. It rests on a household's own means and skills as well as on shared services, institutions that take responsibility, and public investment.",
  times: [
    { id: "before", t: "Before heat arrives", d: "Preparing and preventing: resources agreed, people named, sites ready and tested." },
    { id: "during", t: "During heat", d: "Protection people can actually use, and essential services such as water, power and clinics that keep running." },
    { id: "after", t: "After heat", d: "Recovery of health, income and services, without new debt, lost work or a lost place in the queue." },
    { id: "between", t: "Between seasons", d: "Learning what failed, maintaining what works, and changing what causes the same harm each year." }
  ],
  ask: "When something is said to build resilience, it helps to ask:",
  questions: [
    "Whose ability improves?",
    "To withstand or respond to which disruption?",
    "Through what service, resource, right or institutional change?",
    "Who is responsible for keeping it going?",
    "Who could still be left out, or end up paying more?"
  ]
};

// shared consequence is not equal power: for who is at risk, intersections and the worked example
const UNEQUAL = {
  h: "Shared heat, unequal ground",
  text: "People in the same street, market or workplace share the same hot afternoon, but not the same exposure, money, rights or say over what changes. Shared consequences do not make responsibility equal, and they do not create agreement on their own. Protection tends to hold better when the people most exposed take a real part in decisions: organising, negotiating, and bringing what they know about their own day."
};

// what makes protection dependable: for practical actions, who holds it up and the worked example
const RELIABLE = {
  h: "What keeps protection working",
  intro: "A shade, a water point or a rest break protects people only while it keeps working. Five things usually decide whether it does:",
  items: [
    { t: "Ownership and authority", d: "Someone holds the site and can say yes, and everyone knows who." },
    { t: "Operating money and maintenance", d: "Money for water, cleaning and repairs through the season, not only to build." },
    { t: "Staffing and access", d: "Someone opens it at the hours people need it, and people can reach it: step-free, close to their work, without losing pay or a place." },
    { t: "A say for workers and residents", d: "The people who use it help decide where it goes and when it opens, and can raise a problem without risk to their work." },
    { t: "Monitoring, and a way to fix failures", d: "A way to report a failure, someone who fixes it, and a record of how long it took." }
  ]
};

// who pays first and who keeps paying: for paying for protection
const COSTS = {
  h: "Who pays first, and who keeps paying",
  intro: "Setting protection up is often paid once, from a budget or a grant. Running it comes back every season, and that cost lands somewhere. Three common ways it moves, as illustrations:",
  shifts: [
    { t: "Onto households", d: "A cooling space open only by day leaves the cost of a hot night (fans, power, water) to each household." },
    { t: "Onto informal workers", d: "A rest break with no pay protection is paid for by the worker, in lost loads or lost sales." },
    { t: "Onto unpaid carers", d: "Shorter school or childcare hours on hot days move care to whoever is at home, and can cost that person paid work." }
  ],
  ask: "For any measure, ask who paid to set it up, who pays to run it each season, and who pays if it stops. Proposed, funded and operating are different states; the cases on this page say which each one is."
};

// questions to bring to a preparedness commitment on Signals (proportionate, and never a verdict)
const COMMITMENT = {
  h: "Questions to bring to a commitment",
  intro: "An announcement is a start, not protection. These questions help read one; the record shows only what its evidence shows.",
  questions: [
    "Which people and services does it cover?",
    "Who can authorise action when heat arrives?",
    "Are money and staff there when they are needed?",
    "Can the people affected shape how it is delivered?",
    "What evidence would show that protection reached people?"
  ]
};

// for the planning workbook: four questions a finished plan answers
const PLAN = {
  h: "Before the plan is finished: four questions",
  intro: "A plan holds up when it names the shared arrangement it depends on. Check that yours answers:",
  questions: [
    { t: "The shared service or arrangement", d: "Which one needs to improve: a water point's refill, a school timetable, a queue rule, a night supply of power?" },
    { t: "Who controls it, and who depends on it", d: "The body that can change it, and the people whose day depends on it, including those with no seat at the table yet." },
    { t: "The next agreement", d: "The one decision or agreement needed next, and who has to say yes." },
    { t: "How to check it works for different people", d: "One observable check, read for people in different circumstances: a porter paid per load, a carer, an older person who cannot walk far." }
  ],
  go: ["/shared-heat/", "See it worked through for one market"]
};

// selected vicious cycles: who depends on whom, where one choice changes another's options, what shared arrangement could
// help, and where costs could move. Our reading, labelled as such; the evidence for each cycle stays where it is.
const LOOPS = {
  label: "Who depends on whom",
  note: "Our reading, an illustration of the connections; the evidence for the cycle is above.",
  items: {
    energywater: { depend: "Households, clinics, water pumps and cooling draw on the same grid on the same hot afternoons.", choice: "When supply is cut in one area to keep another running, the pumps and fans in that area stop first.", arrangement: "Agreed priority supply for water pumping and health facilities, with storage at shared sites.", transfer: "Households that buy diesel, tankers or bottled water to cope." },
    school: { depend: "Pupils, teachers, support staff, and families whose working day follows the school day.", choice: "When a school shortens hours or closes in the heat, care moves to whoever is at home, and that person can lose a shift.", arrangement: "Cooler classrooms, and heat-day timetables agreed with families, so hours change without dropping care.", transfer: "Unpaid carers, and children who lose learning time." },
    sleep: { depend: "Tenants, landlords, power utilities and municipal services each shape how hot a room stays at night.", choice: "A landlord's roof, a night power cut and a street without trees decide whether a tenant can cool the room.", arrangement: "Roof and repair standards for rented homes, reliable night supply, and shaded, ventilated streets.", transfer: "Tenants, if the cost of a cooler roof is added to the rent." },
    poverty: { depend: "Workers paid per piece or per load, the contractors and employers above them, and buyers further along the chain.", choice: "A buyer's deadline sets how hard someone works in the heat, and whether a break costs pay.", arrangement: "Paid rest written into contracts and purchasing terms, so the cost is shared along the chain.", transfer: "The worker, in lost earnings, when a break has no pay protection." },
    reactive: { depend: "Every service waiting on the same emergency budget: health, water and relief.", choice: "Money held until damage is visible arrives after households have already spent their savings.", arrangement: "Budgets agreed before the season that release on a forecast or an alert.", transfer: "Households that borrow or sell what they own to get through." }
  },
  heads: { depend: "Who depends on it", choice: "Where one choice changes another's options", arrangement: "A shared arrangement that could help", transfer: "Where the cost could land" }
};

// the El Niño explainer: where the pathways meet
const ELNINO = "These pathways tend to meet in the same places. A pump that needs power, a clinic that needs water, a worker who cannot afford a break and a school that closes early can all fall on one household in the same week. Which of them matters depends on the local season and on how a town's services are arranged, which is why the outlook alone cannot say.";

// the worked example: The Heat Assembly's fictional market town, followed through one hot season
const EXAMPLE = {
  label: "Fictional",
  labelNote: "The town, the people and every event here are made up, and continue the market town of The Heat Assembly. The relationships they illustrate are drawn from the sources behind that game and the pages linked below; no figure here is a measurement.",
  steps: [
    { id: "shared", h: "Shared exposure",
      text: "A hot season is forecast for the market town. The public hall beside the market is shaded and open, and almost empty. The loading lane, the stalls, the tea stall at the bay and the homes around the square will all take the same heat." },
    { id: "constraints", h: "Different constraints",
      people: [
        ["Tara, a porter paid per load", "loses about two loads by leaving the queue to rest."],
        ["Jeevan, a porter on a day rate", "loses nothing by resting, so is the person others ask to cover the loads."],
        ["Noor, a stitcher paid per piece, caring for a child of three", "can work only while the childcare centre is open; nothing on offer cools Noor's home."],
        ["Kiran, a stall holder", "can leave the stall in the afternoon lull, not at the midday peak."],
        ["Hira, an older tea seller", "cannot walk to the hall in the heat; a rickshaw costs a day's money."]
      ],
      text: "The same heat, five different reasons the hall does not help. The municipal officer controls the hall and a small budget; the market association controls the loading order; the porters have no seat at first." },
    { id: "decision", h: "A collective decision",
      text: "Before the season, the market association calls a meeting with the municipal officer, the neighbourhood services coordinator and a workers' representative, invited after porters raised the queue. Traders object to paying for cover; the association agrees to keep places in the queue only with a day's notice. After two meetings they agree four things: places are kept for anyone who rests, with a paid relief porter on alert days; the hall opens at midday and in the afternoon; a water point and shade go to the loading bay; and childcare keeps its hours on alert days.",
      tension: "They do not agree on everything. The traders accept the cost of relief cover for one season only, and the workers' representative wanted it every hot day, not only on alert days." },
    { id: "resources", h: "Resources and responsibilities",
      rows: [
        ["Queue places kept, with relief cover", "Market association", "Municipal operating budget, this season", "Not yet agreed", "Workers' representative names the relief porter", "Porters tell the association; it replies the same day"],
        ["Hall open midday and afternoon", "Municipal officer", "Already paid for (building)", "Municipal operating budget (staff hours)", "Services coordinator sets the caretaker's timetable", "A number posted on the door; the coordinator logs each closure"],
        ["Water and shade at the loading bay", "Market association, with the municipal officer", "A one-off grant", "Market association (refills)", "A named trader orders refills", "Hira and the tea sellers report a dry tap"],
        ["Childcare keeps its hours on alert days", "Services coordinator", "No new cost", "Relief staff from the operating budget", "Childcare centre", "Parents raise it with the coordinator"]
      ],
      heads: ["Arrangement", "Who authorises it", "Who pays first", "Who pays each season", "Who runs it", "How a failure is raised and fixed"] },
    { id: "access", h: "Who gains access",
      people: [
        ["Tara", "can rest at midday on alert days without losing a place."],
        ["Kiran", "rests in the hall in the afternoon."],
        ["Hira", "gets water and shade at the bay, where the work is, rather than at the hall."],
        ["Noor", "keeps the childcare hours, and the paid work that depends on them."],
        ["Jeevan", "is no longer the unpaid cover, because the relief porter is paid."]
      ] },
    { id: "gaps", h: "What remains",
      list: [
        "Noor's home is still hot at night. Housing sits with another department, which was not at the meeting.",
        "Relief cover is funded for one season. Who pays next year is not agreed.",
        "On hot days without an official alert, Tara still pays for a break in lost loads.",
        "Nobody yet records who used the hall, at what hour, so the next meeting cannot see who it missed."
      ] },
    { id: "learning", h: "Learning for the next season",
      list: [
        "Record use of the hall and the water point by hour, and ask who could not come and why.",
        "Move relief cover from a one-season allocation into the municipal budget, or into the market's own fees.",
        "Invite the housing department, and ask what would cool the homes around the square at night.",
        "Agree in advance what changes on a hot day without an alert, so protection does not wait for the warning."
      ] }
  ],
  times: { before: "The meeting, the agreements and the budget line", during: "The hall, the kept places, the water at the bay and the childcare hours", after: "Checking earnings lost and failures fixed", between: "The four lessons above, before the next forecast" },
  question: "What would need to change here so that protection remains available when the project team leaves?",
  elsewhere: {
    h: "The same lens, three other places",
    intro: "Each is an illustration. The pages linked hold the evidence and the actions.",
    items: [
      { id: "school", t: "A school", who: "Pupils, teachers, support staff and families.", link: "Classroom heat affects all of them at once. If a school shortens its hours on hot days, care moves home and a parent can lose a shift. Opening a school to the neighbourhood in the holidays needs its own permission, staffing and safeguarding.", voice: "Children, meal staff and teachers know where the heat is worst; the School Management Committee can help choose what changes.", links: [["/el-nino-and-cities/#school", "A school at lunchtime"], ["/practical-actions/#schools", "School actions"]] },
      { id: "neighbourhood", t: "A rented neighbourhood", who: "Tenants, landlords, the power utility and the municipality.", link: "Whether a room cools at night depends on a roof the tenant does not own, power the utility supplies and trees the municipality plants. A landlord can pass the cost of a cooler roof into the rent.", voice: "Tenants' groups can say which rooms stay hottest and when the power goes; that knowledge can set priorities for repairs.", links: [["/loops/#sleep", "The sleepless-nights loop"], ["/practical-actions/#homes", "Home actions"]] },
      { id: "work", t: "A workplace and its supply chain", who: "Workers, contractors, employers and the buyers they supply.", link: "A buyer's deadline sets the pace of work in the heat; a contractor decides whether a break costs pay. When protection is not paid for up the chain, the worker pays for it.", voice: "Workers' organisations can negotiate rest, shade and timing, and report what actually happens on site.", links: [["/loops/#poverty", "The poverty and heat trap"], ["/a-week-in-the-heat/", "Live through a worker's week"]] }
    ]
  },
  related: [["/heat-assembly/", "The Heat Assembly", "play the first four rounds of this market town's hot week"], ["/who-holds-it/", "Who holds it up", "who could permit, pay for, deliver and check each action"], ["/paying-for-protection/", "Paying for protection", "who pays first, who keeps paying, and whether it lasts"], ["/practical-actions/#market", "Market actions", "shade, water and rest, with what keeps each working"], ["/together/", "Make it work together", "agree who does what in one place"]]
};

function md(SITE) {
  const E = EXAMPLE;
  return [`## ${TITLE}`, `${SITE}/${SLUG}/`, DESC,
    `### ${INTRO.h}`, INTRO.scene, INTRO.phrase, INTRO.resilience, INTRO.lens,
    "### What resilience means here", RESILIENCE.meaning, ...RESILIENCE.times.map(t => `- ${t.t}: ${t.d}`), RESILIENCE.ask, ...RESILIENCE.questions.map(q => `- ${q}`),
    `### ${UNEQUAL.h}`, UNEQUAL.text,
    `### The worked example (${E.label.toLowerCase()})`, E.labelNote,
    ...E.steps.flatMap(s => [`#### ${s.h}`, s.text || "", ...(s.people || []).map(([a, b]) => `- ${a} ${b}`), s.tension || "",
      ...(s.rows ? s.rows.map(r => `- ${r.map((c, i) => `${s.heads[i]}: ${c}`).join("; ")}`) : []), ...(s.list || []).map(x => `- ${x}`)]).filter(Boolean),
    "#### Through the season", ...RESILIENCE.times.map(t => `- ${t.t}: ${E.times[t.id]}`),
    `The question: ${E.question}`,
    `### ${E.elsewhere.h}`, ...E.elsewhere.items.map(x => `- ${x.t}. Who shares it: ${x.who} ${x.link} ${x.voice}`),
    `### ${RELIABLE.h}`, RELIABLE.intro, ...RELIABLE.items.map(x => `- ${x.t}: ${x.d}`),
    `### ${COSTS.h}`, COSTS.intro, ...COSTS.shifts.map(x => `- ${x.t}: ${x.d}`), COSTS.ask,
    `### ${COMMITMENT.h}`, COMMITMENT.intro, ...COMMITMENT.questions.map(q => `- ${q}`),
    `### ${PLAN.h}`, PLAN.intro, ...PLAN.questions.map(q => `- ${q.t}: ${q.d}`)].join("\n\n");
}

module.exports = { SLUG, TITLE, DESC, INTRO, RESILIENCE, UNEQUAL, RELIABLE, COSTS, COMMITMENT, PLAN, LOOPS, ELNINO, EXAMPLE, md };
