// Common Shade: /privacy/, "Privacy and terms". What the site does and does not do with a visitor's data, in plain words,
// and the terms of reuse. Facts here restate what the code does: choices stay in the browser (localStorage, the URL),
// cookieless counts (GoatCounter), live temperature from Open-Meteo and data.gov.sg, fonts from Google Fonts, and the
// Microsoft Forms embed on /join/. If any of those change, change this page in the same pull request.
// The same terms are written as /terms-of-use.md by tools/build-agent-files.js. Called by build-pages.js.
"use strict";
module.exports = function privacy({ page, write, esc, hero }) {
  const row = (a, b) => `<div><dt>${a}</dt><dd>${b}</dd></div>`;
  const body = `${hero("About this site", "Privacy and terms", "Common Shade is free to read, and it asks nothing of you. Here is what it keeps, what it asks other services for, and how its words and data can be reused.")}
  <div class="container">
    <h2 class="hub-h">What stays with you</h2>
    <p class="hub-p">There are no accounts and no sign-up. What you choose on the site, such as a map view, a workbook draft or an answer to a pop-up, stays in your own browser (local storage or the address bar) and is never sent to us. Clearing your browser data removes it. The site sets no cookies of its own.</p>
    <h2 class="hub-h">What the site asks other services for</h2>
    <dl class="hub-p">
      ${row("Page counts", "A cookieless counter (GoatCounter) records that a page was opened and, in broad terms, the kind of screen and where the visit came from. It uses no cookies, builds no profile and does not follow people between sites.")}
      ${row("Live temperature", "The live temperature strip asks Open-Meteo, and for Singapore data.gov.sg, for the current weather of a city. Those services see the request, as any website does.")}
      ${row("Fonts", "Fonts load from Google Fonts. Google sees the request for them.")}
      ${row("The join form", "The form on the Help build Common Shade page is a Microsoft Forms embed. Anything typed into it goes to Microsoft Forms under its own terms, and nowhere else.")}
    </dl>
    <p class="hub-p">Nothing else is sent anywhere. The site has no advertising, no social-media widgets and no tracking pixels.</p>
    <h2 class="hub-h">Terms of reuse</h2>
    <p class="hub-p">Text, data and films are shared under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0<span class="visually-hidden"> (opens in a new tab)</span></a>: reuse them freely and credit Common Shade with a link. Code is under the MIT licence. When you quote a figure, cite its original source as well; each is linked where it appears and listed at <a href="/sources/">/sources/</a>. See <a href="/cite/">Cite and reuse</a> for ready citations.</p>
    <p class="hub-p">Common Shade offers evidence to help people think and plan. It is not medical, legal or financial advice, and it is not an emergency service. Where it points to an organisation, that implies no partnership or endorsement. Illustrative numbers are labelled illustrative. The same terms are in plain text at <a href="/terms-of-use.md">/terms-of-use.md</a>.</p>
    <h2 class="hub-h">For AI agents and automated readers</h2>
    <p class="hub-p">Everything on the site may be read, quoted and used for search, answers and training. No key or login is needed, and none is asked for. Please keep to a gentle pace of requests so the site stays quick for the people who rely on it. The files made for machines are listed on <a href="/for-ai/">For AI agents</a>.</p>
    <h2 class="hub-h">Questions, corrections and security</h2>
    <p class="hub-p">If something here is wrong or unclear, or you have found a problem with the site itself, tell us on <a href="/corrections/">Corrections</a> or through <a href="/join/">Help build Common Shade</a>. We will say sorry and put it right in the open.</p>
  </div>`;
  write("privacy", page("privacy", "Privacy and terms", "What Common Shade keeps, what it asks other services for, and the terms for reusing its text, data and films.", body));
};
