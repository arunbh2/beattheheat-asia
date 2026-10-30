/* Common Shade: the plain-language layer for "The heat economy" (tools/build-economy.js).
   The research in research/2026-10/economy/ is written for specialists; this file holds the everyday wording readers see
   first: names, what each part of the heat economy is, questions to ask, and short descriptions of rules, ways of paying,
   obstacles, roles and ideas. Edit the words here; the research stays as published, behind "More detail" links. */
module.exports = {
  // the 19 parts of the heat economy: an everyday name, what it is, who usually pays, and three things to check
  segments: {
    "cool-roofs": { name: "Cool roofs", what: "Paints, coatings and sheets that reflect sunlight, so less heat gets into the building.", pays: "Building owners, employers, housing programmes, and city or NGO schemes for low-income homes.", check: ["Does the roof belong to the people who live there, or will the owner agree?", "Who recoats or repairs it when it wears, and who pays?", "Has the product been tested for how much sunlight it reflects?"] },
    "passive-buildings": { name: "Cooler building design", what: "Shading, insulation, false ceilings, ventilation and layouts that keep buildings cool with little or no power.", pays: "Developers, building owners, schools, clinics and public housing budgets.", check: ["Is it designed for this climate, including humid weather and hot nights?", "Will it work in existing homes, not only new buildings?", "Who checks that it was built as designed?"] },
    "shade-greening": { name: "Shade and greenery", what: "Shade structures, trees and planting in streets, markets, bus stops and schoolyards, and the care that keeps them alive.", pays: "Cities, market and transport managers, landowners and employers.", check: ["Is there water and a paid caretaker for the dry season?", "Could the improvement push up rents or move vendors out?", "Is the shade where people actually wait, walk and work?"] },
    "efficient-fans": { name: "Efficient fans", what: "Fans that move air using much less electricity, and the people who install and repair them.", pays: "Households, employers, and governments or utilities buying in bulk.", check: ["Is it affordable to buy and to run?", "Can it be repaired locally?", "Fans help less in extreme heat: what else is in place on the hottest days?"] },
    "evaporative-cooling": { name: "Evaporative coolers", what: "Coolers that use water to cool the air. They work well in dry heat, but much less well in humid heat.", pays: "Households, workshops and factories in dry climates.", check: ["Is the air dry enough where it will be used?", "Is there enough clean water, and who cleans the pads?", "Could it make a humid room feel worse?"] },
    "efficient-ac": { name: "Efficient air conditioning", what: "Air conditioners that use less electricity, sized and installed correctly, and serviced regularly.", pays: "Households, building owners, employers and public institutions.", check: ["Can the people using it afford the electricity?", "What happens in a power cut?", "Does it push heat into the street or next door?"] },
    "refrigerant-services": { name: "Safe servicing of cooling gases", what: "Trained technicians who service cooling equipment safely and collect old cooling gases (refrigerants), which warm the planet if they leak.", pays: "Equipment owners, manufacturers and public training programmes.", check: ["Are the technicians trained and certified?", "Where do the old gases go?", "Is the gas used safe for this setting?"] },
    "district-cooling": { name: "Shared cooling networks", what: "Central plants that cool many buildings through pipes, and companies that sell cooling as a service instead of selling machines.", pays: "Developers, building owners and large public buildings.", check: ["Who can connect, and at what price?", "Does it serve buildings people rely on in a heatwave?", "What does the contract say if the service fails?"] },
    "cold-chains": { name: "Cold storage for food and medicine", what: "Cold rooms, milk chillers, fridges and transport that stop food and medicines spoiling in the heat.", pays: "Farmers’ groups, traders, food companies and health systems.", check: ["Are there enough users nearby to keep it running?", "Who sets the fees, and can small farmers afford them?", "Is there backup power?"] },
    "personal-cooling": { name: "Cooling for workers", what: "Cooling vests, shaded and cooled rest areas, and similar protection for people working in the heat.", pays: "Employers and public bodies.", check: ["Do workers also get paid rest, not just equipment?", "Is it practical for the real work?", "Who cleans, recharges and replaces it?"] },
    "heat-sensing": { name: "Heat sensors", what: "Instruments that measure how hot a workplace, classroom or home really is, combining heat, humidity, sun and wind (often reported as WBGT, the wet-bulb globe temperature).", pays: "Employers, cities, schools and research programmes.", check: ["What will people do when the reading is high?", "Who checks the sensors are accurate?", "Have workers agreed how the data is used?"] },
    "heat-data-warnings": { name: "Heat warnings and data", what: "Forecasts, alerts and risk maps that help people and organisations prepare for heat.", pays: "Businesses and insurers by subscription; public budgets for public warnings.", check: ["Do warnings reach people without smartphones, in local languages?", "Is there a plan for what happens after the alert?", "Can the public see the data?"] },
    "heat-insurance": { name: "Heat insurance", what: "Insurance that pays out automatically when heat passes a set level, often to replace lost income. It is sometimes called parametric insurance.", pays: "Policyholders, employers, worker organisations, and premium support from governments or donors.", check: ["Could someone lose income on a hot day and still get no payout?", "Who pays the premium next year?", "How fast is the money paid, and how?"] },
    "cooling-access-finance": { name: "Ways to pay for cooling", what: "Loans, pay-as-you-go plans, repayment through the electricity bill, and group buying that spread the cost of cooling.", pays: "Borrowers and buyers, with lenders, utilities and sometimes subsidies.", check: ["What is the total cost, including fees?", "What happens after a missed payment?", "Who can’t qualify, for example tenants or people without a bank account?"] },
    "heat-water-services": { name: "Drinking water in the heat", what: "Safe drinking-water points, refills and reliable supply during heatwaves.", pays: "Cities, water utilities, employers, schools and clinics.", check: ["Is the water free and safe to drink?", "Does it keep working in a heatwave or power cut?", "Are there toilets nearby?"] },
    "workplace-heat-services": { name: "Workplace heat safety", what: "Help for employers to assess heat risk, plan rest breaks, train staff and follow heat rules.", pays: "Employers, brands that buy from them, and labour departments.", check: ["Do all workers, including contract workers, get paid rest?", "Can workers raise concerns safely?", "Who checks that the plan is followed?"] },
    "heat-resilient-agriculture": { name: "Heat-tolerant farming", what: "Seeds that cope with heat, and advice that helps farmers and farm workers through hot seasons.", pays: "Farmers and farmers’ groups, seed companies and agriculture departments.", check: ["Can women farmers and tenant farmers get it?", "Does it protect farm workers as well as crops?", "Is local advice available?"] },
    "heat-ready-healthcare": { name: "Heat-ready health care", what: "Training, cooling and equipment that keep clinics working in a heatwave and help staff treat heat illness early.", pays: "Health departments, hospitals and donors.", check: ["Is the clinic itself cool enough for patients and staff?", "Is care for heat illness free or affordable?", "Who maintains the equipment after the first year?"] },
    "cooling-power-flexibility": { name: "Power for cooling", what: "Controls, storage and backup that keep essential cooling running and ease pressure on the grid at peak times.", pays: "Utilities, building owners and facility managers.", check: ["Are clinics, water pumps and shelters protected first in a power cut?", "Who pays for backup that is rarely used?", "Does it shift costs onto households?"] }
  },
  shelves: [["Cooling and safer places", ["cool-roofs", "passive-buildings", "shade-greening", "efficient-fans", "evaporative-cooling", "efficient-ac", "refrigerant-services", "district-cooling", "cold-chains", "personal-cooling"]],
    ["Services, data and care", ["heat-sensing", "heat-data-warnings", "heat-water-services", "workplace-heat-services", "heat-resilient-agriculture", "heat-ready-healthcare", "cooling-power-flexibility"]],
    ["Paying and sharing risk", ["heat-insurance", "cooling-access-finance"]]],

  // the 24 questions to ask before buying, funding or backing anything, grouped
  questions: [
    ["Does it really protect people here?", [
      ["g6-check-purpose", "Who exactly will this protect, and from what kind of heat?", "Ask for the people, the place and the evidence. Selling a product is not the same as protecting someone."],
      ["g6-check-climate", "Will it work here, in our dry heat, humid heat and hot nights?", "Ask for tests in conditions like yours, with people inside the building."],
      ["g6-check-others", "Will it make someone else hotter?", "Air conditioners and some roofs push heat into streets and neighbouring homes."],
      ["g6-check-baseline", "Are the claims measured, estimated or marketing?", "Ask how a result was measured, and what it was compared with."],
      ["g6-check-future", "Will it still work as heat, floods and water shortages grow?", "Ask how long it lasts and what it needs to keep working."]]],
    ["Is it fair?", [
      ["g6-check-affordability", "Can families on the lowest incomes use it without giving up food, school or medicine?", "Count the full cost: buying, running, repairs and travel. If they can’t, what is the free or subsidised option?"],
      ["g6-check-excluded", "Who is left out because they rent, or lack a meter, ID, bank account or phone?", "Make sure there is another way in for them."],
      ["g6-check-wages", "Can workers stop to rest without losing pay or their job?", "Equipment helps only if rest is paid and safe to take, including for contract workers."],
      ["g6-check-rent", "Could it push up rents or move residents and vendors out?", "Involve tenants and vendors early, and agree protections in writing."],
      ["g6-check-gender", "Does it add unpaid work, often for women?", "Pay for upkeep roles, and check opening hours, safety and toilets."],
      ["g6-check-disability", "Can older and disabled people reach it, use it and have a say?", "Check access, transport, communication and help on site, with them."],
      ["g6-check-privacy", "Who sees people’s health, location or repayment data?", "Collect only what is needed, and keep a way to use the service without sharing data."]]],
    ["Who keeps it working?", [
      ["g6-check-maintenance", "Who looks after it after the pilot, and with what budget?", "Name the owner, the repair plan and who pays each year."],
      ["g6-check-outage", "What happens when the power or phone network fails?", "Plan a backup for the hottest days, and keep essential services running first."],
      ["g6-check-peak", "What happens to electricity demand at the hottest hour?", "Start with shade and design, which need no power, before adding machines."],
      ["g6-check-water", "Does it compete with drinking water?", "Check where the water comes from in a drought."],
      ["g6-check-refrigerant", "Which cooling gas does it use, and who handles leaks and disposal?", "Use trained technicians and safe gases."],
      ["g6-check-waste", "Where do old fans, batteries and gases go?", "Agree safe collection and recycling from the start."],
      ["g6-check-quality", "Can the product, the installer and the claims be checked independently?", "Look for official tests or registration, a warranty, and a way to get faults fixed."],
      ["g6-check-accountability", "Who can people complain to, and who decides to fix, change or stop it?", "Agree this before starting, and review it after each hot season."]]],
    ["Who pays, and who carries the risk?", [
      ["g6-check-debt", "What happens after a missed payment or a bad season?", "Check the total cost, what happens to the equipment, and the options in hard times."],
      ["g6-check-insurance", "Could people lose income and still get no payout, or get it too late?", "Ask how payouts are triggered, and what help exists if they don’t come."],
      ["g6-check-subsidy", "Who receives the subsidy, and what extra protection does it buy?", "Make sure the benefit reaches the people using it."],
      ["g6-check-outcomes", "If payment depends on results, could it reward the wrong thing?", "Pay for working services people can reach, not for units shipped or longer hours."]]]
  ],

  // what each kind of institution could do (suggestions, not commitments)
  roles: {
    nat: ["Set clear rules for products, buildings and heat at work, and check they are followed.", "Fund public protection, and make clear which budgets can pay for heat work, including upkeep."],
    city: ["Bundle needs across homes, schools, markets and clinics into larger, costed purchases that suppliers can bid for.", "Approve the upkeep budget, and protections for tenants and vendors, before installing anything."],
    health: ["Set out what a heat-ready clinic needs: cooling, staff, supplies and referral.", "Track heat illness while protecting patient data, and check what actually helps."],
    met: ["Give local warnings people can act on, through radio, SMS and other offline channels too.", "Help others tell apart a weather warning, a trigger to act at work and an insurance payout trigger."],
    employers: ["Buy protection as a package: shade, water, cooling, safe schedules and paid rest.", "Stay responsible for all workers, including contract workers, and pay for upkeep."],
    workers: ["Shape protection with workers: rest, pay, benefit rules and how to complain.", "Buy together or run shared funds, without taking on duties that belong to employers or government."],
    utilities: ["Help households use efficient cooling, and keep power to clinics, water pumps and shelters first.", "Make sure repayment through bills doesn’t leave anyone cut off or shut out."],
    water: ["Plan enough clean water for drinking, cooling, trees and public facilities.", "Coordinate backup pumping and drought rules with health services and communities."],
    agri: ["Design crop, livestock, farm-worker and cold-storage services with farmers.", "Keep fees and finance fair, and protect water rights and tenant farmers."],
    schools: ["Buy together for safe classrooms, drinking water, shade and equipment that can be maintained.", "Keep children learning and safe when schools change hours or close."],
    insurers: ["Keep loans, public help and insurance clearly separate, and protect borrowers.", "Be open about payout triggers, timing, data use and what subsidies really cover."],
    funders: ["Fund preparation, local skills, evidence and public access, as well as projects that can repay.", "Link support to fair delivery and a real upkeep plan, and be open about terms."],
    community: ["Make sure tenants, women, migrants, older and disabled people help design services.", "Run trusted outreach and feedback, and paid maintenance where the community chooses it."],
    intl: ["Share guidance, technical help and lessons across countries, adapted to each place.", "Support open evidence and trained servicing, without assuming one standard fits everywhere."]
  },

  // rules that create demand, ways of paying, and common obstacles: one plain line each
  policies: {
    "g6-in-labels": "India: fans and many air conditioners must carry an energy label, which helps buyers choose efficient models.",
    "g6-sg-meps": "Singapore: air conditioners must meet a higher minimum efficiency from April 2025.",
    "g6-in-roofs": "Telangana, India: a cool-roof policy that applies to certain new buildings.",
    "g6-in-code": "India: a building code for homes on keeping heat out and letting air through, where states adopt it.",
    "g6-sg-work": "Singapore: rules for outdoor work in the heat, with four more practices becoming mandatory on 1 December 2026.",
    "g6-in-procurement": "India: a public company bought efficient fans and air conditioners in bulk and worked with private energy-service firms.",
    "g6-in-icap": "India: a national cooling plan covering buildings, cold storage, servicing and cooling gases.",
    "g6-kh-ncap": "Cambodia: a national cooling plan.",
    "g6-in-heat-finance": "India: national disaster-mitigation funds can now pay for heatwave projects; upkeep needs its own budget.",
    "g6-th-hap": "Bangkok: heat planning and public warnings.",
    "g6-asean-adaptation": "ASEAN: guidance that helps lenders and investors recognise projects that protect people from climate risks, including heat."
  },
  finance: {
    "g6-fin-payg": ["Pay as you go", "Pay in small instalments, and own the equipment at the end."],
    "g6-fin-onbill": ["Repay through the electricity bill", "The cost of an efficient fan is added, in small amounts, to monthly bills."],
    "g6-fin-caas": ["Pay for cooling, not the machine", "A provider owns and maintains the equipment and charges for the cooling or storage used."],
    "g6-fin-micro": ["Small loans for roofs", "Microfinance loans for roof improvements that keep homes cooler."],
    "g6-fin-layered": ["Insurance with a safety net", "Insurance combined with savings and emergency support, so people aren’t left with nothing if the insurance doesn’t pay."],
    "g6-fin-guarantee": ["Loan guarantees", "A guarantee makes banks more willing to lend to cooling suppliers or their customers."],
    "g6-fin-firstloss": ["Investors who take the first loss", "Patient investors agree to absorb the first losses, which makes it easier for others to invest."],
    "g6-fin-rbf": ["Paying for results", "Suppliers are paid for each efficient appliance that reaches a user and works."]
  },
  barriers: {
    "g6-bar-affordability": "Many families can’t afford the upfront cost, or the running costs.",
    "g6-bar-split": "The person who pays is often not the one who benefits: landlords and tenants, employers and workers.",
    "g6-bar-tenure": "Renters, and people without a meter or documents, often can’t qualify.",
    "g6-bar-enforcement": "Rules only work with enough inspectors and follow-up.",
    "g6-bar-quality": "Poor-quality or counterfeit products and cooling gases are hard to spot.",
    "g6-bar-service": "Too few trained installers, spare parts and repair services.",
    "g6-bar-data": "Little shared information on who is exposed, what heat costs and what works.",
    "g6-bar-fx": "Loans in foreign currency are risky when customers pay in local currency.",
    "g6-bar-scale": "Contracts are small, and many pilots stop when the first grant ends.",
    "g6-bar-utilities": "Unreliable power or water, or a product that doesn’t suit the climate.",
    "g6-bar-upkeep": "Money to install is easier to find than money to run and repair.",
    "g6-bar-risk-layer": "Insurance payouts, loans and support don’t always arrive together, when they are needed."
  },


  // names for funding recipients that the research records by an id rather than a name
  recipients: {
    "fp194-peebcool": "PEEB Cool: cooler public buildings programme", "fp177-cooling-facility": "Cooling Facility (Green Climate Fund programme)",
    "gef11960": "Nature for Cooling Challenge", "gef10370": "Cooler buildings project (Global Environment Facility)",
    "keep-it-cool": "Keep IT Cool", "blackfrog": "Blackfrog Technologies", "ampotech": "Ampotech", "komunidad": "Komunidad",
    "sewa-heat-cover": "SEWA heat income cover", "enterprise-project-ventures": "Enterprise Project Ventures",
    "becool-india": "BeCool India (Swiss development project)", "commercial-cold-holdings": "Commercial Cold Holdings",
    "tabreed-asia-central-cooling": "Tabreed Asia Central Cooling", "gradient": "Gradient", "clean-cooling-grantees": "Clean Cooling Collaborative grantees",
    "promethean-power": "Promethean Power Systems"
  },
  // everyday words for terms that appear inside the researchers' descriptions
  words: [[/\bprocurement\b/gi, "purchasing"], [/\bcontractually eligible policy beneficiaries\b/gi, "eligible policyholders"], [/\bpolicy beneficiaries\b/gi, "policyholders"],
    [/\bbeneficiaries\b/gi, "people covered"], [/\baggregators\b/gi, "collectors"], [/\baggregation\b/gi, "collection"], [/\banalytics\b/gi, "analysis"],
    [/\bverified\b/gi, "checked"], [/\bHVAC\b/g, "heating, ventilation and air conditioning"]],

  // the 32 ideas, one per line: everyday name, the idea, who could pay
  ideas: {
    "g5-global-service": ["Co-operatives of trained cooling technicians", "Local technicians team up to install and service air conditioners properly, so they use less power and leak less gas.", "Building owners and businesses pay for servicing; training grants help smaller technicians join."],
    "g5-global-recovery": ["Shared collection of old cooling gases", "Small contractors share a service that collects, stores and safely disposes of old cooling gases.", "Contractors, equipment makers and owners pay per collection."],
    "g5-soil-service": ["Soil-cover services for farmers’ groups", "Groups help farmers keep soil covered and moist, so land stays cooler and crops cope better.", "Farmers and crop buyers contribute; public farm budgets help include smaller farmers."],
    "g5-ice-boundary": ["Glaciers need global action, not a local business", "Slowing the melting-ice cycle depends on cutting emissions worldwide and on public research. Monitoring glacier risks for nearby communities is a separate public task.", "Public budgets and international climate funds."],
    "g5-fire-stewards": ["Paid community fire-prevention teams", "Local teams are paid to clear fuel, watch for fires and prepare before the dry season, with community rights respected.", "Governments, forest agencies and landholders, for a yearly fee."],
    "g5-cooling-aggregation": ["Group buying to cool many small buildings", "A city or agency bundles many schools, clinics or homes into one contract, starting with shade and design, so suppliers can offer better prices.", "Public building budgets and building owners."],
    "g5-cooling-outcomes": ["Cooling sold as a service, with safeguards", "A provider owns, runs and maintains a building’s cooling and is paid for reliable comfort, within limits on power and water use.", "Hospitals, offices and other organisations that can sign service contracts."],
    "g5-energywater-uptime": ["Keeping clinics and water pumps powered", "A contractor keeps backup power working for clinics and water supply through the hot season, and is paid for being ready.", "Health and water departments."],
    "g5-energywater-flex": ["Easing pressure on the grid at peak times", "Buildings agree to reduce non-essential cooling briefly at peak hours, for a payment. Essential services are never cut.", "Electricity companies pay for the flexibility."],
    "g5-pumping-governance": ["Solar irrigation with fair water rules", "A co-operative runs solar pumps within agreed water limits, so cheap power doesn’t drain groundwater.", "Farmer co-operatives and utilities, with public water management."],
    "g5-deadgreen-care": ["Paying to keep trees alive, not just planted", "Caretakers are paid over several years for trees that survive and give shade, not for the number planted.", "Cities, market and transport managers, and landowners."],
    "g5-deadgreen-water": ["Inspecting and repairing shade", "A service checks and fixes shade structures, trees and watering within an agreed water budget.", "Cities and estate managers, from maintenance budgets."],
    "g5-greendisplace-tenure": ["Neighbourhood upgrades that let residents stay", "Cooling upgrades such as trees and cooler roofs come with agreed protections for tenants and vendors.", "Public and community-controlled upgrading funds."],
    "g5-clinic-assets": ["Keeping clinic cooling and power working", "A provider keeps a clinic’s cooling, power, water and medicine fridges running through the hot season.", "Health departments."],
    "g5-clinic-readiness": ["Getting clinics ready before summer", "A team prepares staff, supplies and referral plans before each hot season, and helps manage busy days.", "Health departments."],
    "g5-sleep-care": ["Cooler nights for people at risk", "Cooler homes, plus regular check-ins on older or isolated people during hot nights.", "Housing and social-care budgets."],
    "g5-school-protection": ["Cooler schools, so children stay in school", "Groups of schools are improved together, with water, shade and repairs funded, and free for pupils.", "Education departments."],
    "g5-school-continuity": ["Learning that continues when schools close", "Offline lessons and safe childcare ready for days when heat closes schools.", "Education budgets."],
    "g5-invisible-data": ["Counting heat illness and heat at work", "Public services that record heat illness and measure heat at workplaces, with open data.", "Health, labour and research budgets."],
    "g5-poverty-paidrest": ["Paid rest, shade and water at work", "A service sets up shade, water and paid rest breaks for employers, and helps them follow heat rules.", "Employers, who are responsible for their workers."],
    "g5-poverty-income": ["Worker-run support for lost income", "Worker organisations help run support that replaces income lost on dangerous days.", "Public funds and pooled worker funds, with outside support."],
    "g5-debt-care": ["Free heat care, and help with claims", "People get treatment for heat illness without paying upfront, and help to claim the benefits they are entitled to.", "Public health insurance and care funds."],
    "g5-energypoverty-fans": ["Affordable, repairable fans, with power kept on", "Efficient fans supplied and repaired locally, and households not cut off in a heatwave.", "Subsidies and utility programmes."],
    "g5-energypoverty-rooms": ["Shared cool rooms", "Staffed, accessible cool rooms open in neighbourhoods on the hottest days.", "City budgets, including staff and running costs."],
    "g5-displacement-upgrade": ["Cooler shelters for displaced people", "Reusable shelters made cooler, with support for residents’ rights.", "Housing and humanitarian budgets."],
    "g5-farmdebt-microclimate": ["Protecting crops and farm workers from heat", "Shade nets, mulch and safe working hours that protect both harvests and workers.", "Crop buyers and co-operatives, with public support to include smaller farmers."],
    "g5-farmdebt-restart": ["Help to restart after a heat-hit harvest", "Support arranged in advance, and insurance where suitable, so farmers can buy seed again without heavy debt.", "Public assistance funds, with insurance for part of the risk."],
    "g5-squeeze-forbearance": ["Lenders acting early in a heatwave", "Lenders offer payment breaks and support to small businesses when heat hits, before loans go bad.", "Lenders, from their own budgets."],
    "g5-squeeze-markets": ["Heat-safe markets", "Market managers and traders share the cost of shade, water and cooling upkeep.", "Cities and traders’ groups, on shared contracts."],
    "g5-reactive-preparation": ["Help preparing heat projects", "A service helps cities turn heat plans into costed projects that are ready for funding.", "Technical-assistance funds and city budgets."],
    "g5-reactive-readiness": ["Ready-to-go summer contracts", "Contracts agreed in advance, so action starts as soon as a heatwave is forecast.", "City and district budgets set aside each year."],
    "g5-protection-pool": ["Shared risk pools, with prevention first", "Several places pool money to cover severe heat years, alongside prevention and cash support.", "Public funds and worker funds, with help to pay premiums."]
  }
};
