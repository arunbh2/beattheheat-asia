// Common Shade: "How AI is used on Common Shade". One record of what AI does in building the site, what it is never
// allowed to do, and who checks. The section on /approach/ (#ai) and the matching section of llms-full.txt both read
// it, so they never differ. Keep it true to what the repository actually does: change it in the same pull request as
// any change to how AI is used.
"use strict";
const TITLE = "How AI is used on Common Shade";
const LEDE = "Common Shade is built with the help of AI. This is what it does here, what it is never allowed to do, and who checks its work.";
const DOES = [
  ["Builds and maintains the site", "An AI coding assistant (Claude Code, made by Anthropic) writes most of the scripts that build the pages, the page code and the checks, working in the site's open repository. Every change to pages and data goes through a pull request that has to pass the site's automated checks. The site owner decides what is worked on and approves what is published; the assistant merges on that approval."],
  ["Researches and drafts", "It searches for sources, reads documents the site owner shares, and drafts page text and data records from them. Drafts are written in the site's own careful voice, and every factual line names its source."],
  ["Prepares the checks, but does not do the checking", "Sources are checked by plain scripts on GitHub, not by AI: they open each page or PDF and look for the exact words a claim rests on. A claim whose words are not found is dropped and listed, never published. Each research set keeps its dropped list."],
  ["Gives the films a voice", "Narration uses a synthetic voice (Piper, with a LibriTTS voice under CC BY 4.0). Films made with the site's own renderer draw every scene in code, with faceless figures. Earlier background footage generated with AI was replaced by drawings made in code."]
];
const NEVER = [
  "Invent a statistic, study, quote, link or source.",
  "Present an illustrative number as measured, or a projection as a fact.",
  "Create a person: no invented names, quotes or faces, and no synthetic people standing in for real ones.",
  "Publish without the source check and the site owner's approval.",
  "Rank countries, cities or organisations.",
  "Run on the site for visitors: there is no chatbot, and nothing a visitor types or chooses is sent to an AI service."
];
const LIMITS = "AI can still be wrong. The source check confirms that a source contains the words a claim rests on, not that the claim is the best reading of it. That is why every claim links to its source, evidence is labelled known, inferred or uncertain, and corrections are made in the open.";
const AGENTS = "AI systems that read the site on someone's behalf have their own page, with how to cite it and what to avoid.";

function md(SITE) {
  return [`## ${TITLE}`, `${SITE}/approach/#ai`, LEDE,
    ...DOES.map(([h, p]) => `- ${h}: ${p}`), "What AI is never allowed to do here:", ...NEVER.map(x => `- ${x}`), LIMITS,
    `${AGENTS} ${SITE}/for-ai/`].join("\n\n");
}
module.exports = { TITLE, LEDE, DOES, NEVER, LIMITS, AGENTS, md };
