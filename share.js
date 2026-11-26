/* Common Shade: "Share this page". One panel for every page, opened from either share button (near the title, and at the
   end of the page). The page's own words come from the build (tools/build-nav.js writes <script id="cs-share-data"> into
   the head from data/site/share.json and tools/share-text.js); this file only builds links and copies text.
   - Nothing is posted: WhatsApp and LinkedIn open in a new tab and the visitor chooses who sees it and presses send.
   - Nothing about the message is stored or sent to Common Shade. If the site's cookieless counter is on, it records
     which button was pressed and on which page, never the message, the recipient or the clipboard.
   - The first half (core) is pure and also runs under Node, so tools/check-share.js tests the same code the page uses.
   Loaded by the small loader in tools/site-nav.js on the first press of a share button. */
(function (root) {
  "use strict";
  var SITE = "https://beattheheat.asia";

  /* ---------- core: pure functions, shared with tools/check-share.js ---------- */
  // the link to share: always the production address of this page (never localhost or a preview host), with only the
  // query parameters this page chooses to keep (a deliberate view, never a visitor's own inputs), and a #section only
  // when the visitor asks for it
  function shareUrl(base, here, opts) {
    opts = opts || {};
    var b = new URL(base, SITE), h;
    try { h = new URL(here || base, SITE); } catch (e) { h = b; }
    var out = new URL(b.pathname, SITE);
    (opts.keep || []).forEach(function (k) { var v = h.searchParams.get(k); if (v != null && v !== "") out.searchParams.set(k, v); });
    if (opts.hash && /^#[A-Za-z][\w:.-]*$/.test(opts.hash)) out.hash = opts.hash;
    return out.toString();
  }
  // the message: the visitor's text, a blank line, then the link (the link is never repeated if they pasted it in)
  function message(text, url) {
    var t = String(text || "").replace(/\r\n?/g, "\n").trim();
    if (!t) return url;
    return t.indexOf(url) > -1 ? t : t + "\n\n" + url;
  }
  // WhatsApp's click-to-chat link with no phone number: the visitor picks the contact or group (faq.whatsapp.com/5913398998672934)
  function whatsapp(text, url) { return "https://wa.me/?text=" + encodeURIComponent(message(text, url)); }
  // LinkedIn reads only the page address; the preview (title, description, image) comes from the page's Open Graph tags
  function linkedin(url) { return "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url); }
  function words(s) { return String(s || "").trim().split(/\s+/).filter(Boolean).length; }
  var core = { SITE: SITE, shareUrl: shareUrl, message: message, whatsapp: whatsapp, linkedin: linkedin, words: words };
  if (typeof module === "object" && module.exports) { module.exports = core; return; }

  /* ---------- the panel ---------- */
  var doc = root.document, D = {}, dlg, from, edited = false;
  try { D = JSON.parse(doc.getElementById("cs-share-data").textContent); } catch (e) {}
  D.url = D.url || SITE + root.location.pathname;
  D.title = D.title || doc.title;
  D.text = D.text || D.title;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var track = function (what) { try { if (root.goatcounter && root.goatcounter.count) root.goatcounter.count({ path: "share-" + what, title: root.location.pathname, event: true }); } catch (e) {} };
  var I = {
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 7.8c-.4 0-.9.4-.9 1.3 0 2.6 3.3 6 6.1 6.1.9 0 1.4-.6 1.4-1.1l-1.7-1-1 .8c-1-.4-2.1-1.5-2.5-2.5l.8-1-.9-1.6Z" fill="currentColor"/></svg>',
    li: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7.5 10.2v6.3M7.5 7.4v.1M11 16.5v-6.3m0 2.8c0-1.6 1-2.9 2.6-2.9 1.4 0 2.2 1 2.2 2.6v3.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  var CSS = ".cs-shd{width:min(520px,calc(100% - 32px));max-height:calc(100dvh - 32px);overflow:auto;padding:0;border:1px solid var(--line,#E2DCD2);border-radius:14px;background:#fff;color:#16202B;font-family:'Hanken Grotesk','Segoe UI',Roboto,Arial,sans-serif;line-height:1.4;box-shadow:0 18px 48px rgba(22,32,43,.22);overscroll-behavior:contain}" +
    ".cs-shd::backdrop{background:rgba(22,32,43,.45)}.cs-shd__in{padding:20px}" +
    ".cs-shd__top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.cs-shd__h{font-family:inherit;font-size:1.375rem;font-weight:700;line-height:1.15;margin:0;text-transform:none;letter-spacing:normal;color:#16202B;border:0;padding:0}.cs-shd__h:focus{outline:none}.cs-shd__h:focus-visible{outline:3px solid #F26430;outline-offset:2px}.cs-shd p{max-width:none}.cs-shd a:not(.cs-shd__b){color:inherit;text-decoration:underline;text-decoration-color:#F26430;text-decoration-thickness:2px;text-underline-offset:3px}" +
    ".cs-shd__t{font-size:.875rem;color:#3F4650;margin:4px 0 0;line-height:1.5}" +
    ".cs-shd__x{font:inherit;font-weight:700;font-size:.875rem;min-height:40px;padding:0 14px;border:1px solid #CFC7BB;border-radius:999px;background:#fff;color:#16202B;cursor:pointer;flex:none}" +
    ".cs-shd label{display:block;font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#3F4650;margin:16px 0 6px}" +
    ".cs-shd textarea,.cs-shd input[type=text]{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:16px;line-height:1.5;color:#16202B;background:#FAF7F2;border:1px solid #CFC7BB;border-radius:8px;padding:10px 12px}" +
    ".cs-shd textarea{min-height:7.5em;resize:vertical}.cs-shd input[type=text]{font-size:16px;color:#3F4650}" +
    ".cs-shd__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 12px;margin-top:6px;font-size:.875rem;color:#3F4650}" +
    ".cs-shd__reset{font:inherit;font-size:.875rem;font-weight:700;background:none;border:0;padding:8px 0;color:#16202B;text-decoration:underline;text-decoration-color:#F26430;text-decoration-thickness:2px;text-underline-offset:3px;cursor:pointer}" +
    ".cs-shd__sec{display:flex!important;align-items:center;gap:8px;text-transform:none!important;letter-spacing:0!important;font-size:.875rem!important;font-weight:400!important;color:#16202B!important}.cs-shd__sec input{width:20px;height:20px;margin:0}" +
    ".cs-shd__acts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:18px 0 0}" +
    ".cs-shd__b{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:8px 12px;box-sizing:border-box;font:inherit;font-weight:700;font-size:.95rem;text-align:center;text-decoration:none;border-radius:999px;border:1px solid #16202B;background:#fff;color:#16202B;cursor:pointer}" +
    ".cs-shd__b svg{width:20px;height:20px;flex:none}.cs-shd__b--main{background:#16202B;color:#FAF7F2}" +
    ".cs-shd__li{grid-column:1/-1;border:1px solid var(--line,#E2DCD2);border-radius:10px;padding:12px;margin:4px 0}.cs-shd__li p{margin:0 0 8px;font-size:.875rem;color:#3F4650;line-height:1.5}.cs-shd__li div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}" +
    ".cs-shd__say{min-height:1.5em;margin:14px 0 0;font-size:.875rem;color:#16202B;line-height:1.5}.cs-shd__note{margin:12px 0 0;font-size:.875rem;color:#3F4650;line-height:1.5}" +
    ".cs-shd :focus-visible{outline:3px solid #F26430;outline-offset:2px}" +
    "@media (max-width:420px){.cs-shd__acts,.cs-shd__li div{grid-template-columns:minmax(0,1fr)}.cs-shd__in{padding:16px}}" +
    "@media (hover:hover) and (pointer:fine){.cs-shd__b:hover{background:#F3EEE7}.cs-shd__b--main:hover{background:#2A3644}}" +
    "@media (prefers-reduced-motion:no-preference){.cs-shd[open]{animation:cs-shd-in .16s ease-out}@keyframes cs-shd-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}}" +
    "@media print{.cs-shd{display:none!important}}";

  function hashNow() { var h = root.location.hash; try { return h && doc.getElementById(decodeURIComponent(h.slice(1))) ? h : ""; } catch (e) { return ""; } }
  function q(s) { return dlg.querySelector(s); }
  function url() { var c = q("[data-sh-sec]"); return shareUrl(D.url, root.location.href, { keep: D.keep, hash: c && c.checked ? hashNow() : "" }); }
  function text() { return q("[data-sh-text]").value; }
  function say(t) { var s = q("[data-sh-say]"); s.textContent = ""; setTimeout(function () { s.textContent = t; }, 30); }
  function refresh() {
    var u = url();
    q("[data-sh-url]").value = u;
    q("[data-sh-wa]").href = whatsapp(text(), u);
    q("[data-sh-li]").href = linkedin(u);
    q("[data-sh-reset]").hidden = !edited;
  }
  // copy: success is reported only after the browser confirms the write; otherwise the text is left selected to copy by hand
  function copy(str, field, done) {
    var fail = function () { field.focus(); field.select(); say("Copying was blocked by this browser. The text is selected: press Ctrl+C (or Cmd+C), or press and hold, then choose Copy."); };
    if (!root.navigator.clipboard || !root.navigator.clipboard.writeText) return fail();
    root.navigator.clipboard.writeText(str).then(function () { say(done); }, fail);
  }

  function build() {
    var st = doc.createElement("style"); st.id = "cs-share-css"; st.textContent = CSS; doc.head.appendChild(st);
    dlg = doc.createElement("dialog"); dlg.className = "cs-shd"; dlg.setAttribute("aria-labelledby", "cs-shd-h");
    var sec = hashNow();
    dlg.innerHTML = '<div class="cs-shd__in">' +
      '<div class="cs-shd__top"><div><h2 class="cs-shd__h" id="cs-shd-h" tabindex="-1">Share this page</h2><p class="cs-shd__t">' + esc(D.title) + '</p></div>' +
      '<button type="button" class="cs-shd__x" data-sh-close>Close</button></div>' +
      '<label for="cs-shd-text">Your message</label>' +
      '<textarea id="cs-shd-text" data-sh-text aria-describedby="cs-shd-help"></textarea>' +
      '<div class="cs-shd__row"><span id="cs-shd-help">A suggestion. Change it as you like; the link goes underneath.</span><button type="button" class="cs-shd__reset" data-sh-reset hidden>Use the suggested text again</button></div>' +
      '<label for="cs-shd-url">Link</label><input id="cs-shd-url" type="text" readonly data-sh-url>' +
      (sec ? '<label class="cs-shd__sec"><input type="checkbox" data-sh-sec> Link to this section (' + esc(sec) + '). The preview still shows the whole page.</label>' : "") +
      '<div class="cs-shd__acts">' +
      '<a class="cs-shd__b cs-shd__b--main" data-sh-wa target="_blank" rel="noopener" href="#">' + I.wa + 'WhatsApp<span class="csn-vh"> (opens in a new tab)</span></a>' +
      '<button type="button" class="cs-shd__b" data-sh-copy-all>' + I.copy + 'Copy message and link</button>' +
      '<div class="cs-shd__li"><p>LinkedIn takes only the link. Copy this text, then paste it into your LinkedIn post.</p><div>' +
      '<button type="button" class="cs-shd__b" data-sh-copy-text>' + I.copy + 'Copy suggested text</button>' +
      '<a class="cs-shd__b" data-sh-li target="_blank" rel="noopener" href="#">' + I.li + 'Open LinkedIn<span class="csn-vh"> (opens in a new tab)</span></a></div></div>' +
      '<button type="button" class="cs-shd__b" data-sh-copy-url>' + I.link + 'Copy link</button>' +
      (root.navigator.share ? '<button type="button" class="cs-shd__b" data-sh-more>' + I.more + 'More options</button>' : "") +
      '</div>' +
      '<p class="cs-shd__say" role="status" aria-live="polite" data-sh-say></p>' +
      (D.print ? '<p class="cs-shd__note">This shares the printable one-page version.' + (D.parent ? ' <a href="' + esc(D.parent) + '">Go to the full page</a> to share that instead.' : "") + '</p>' : "") +
      '<p class="cs-shd__note">Nothing is posted for you: you choose who sees it, and you press send.</p>' +
      '</div>';
    doc.body.appendChild(dlg);
    q("[data-sh-text]").value = D.text;
    q("[data-sh-text]").addEventListener("input", function () { edited = text().trim() !== D.text; refresh(); });
    q("[data-sh-reset]").addEventListener("click", function () { q("[data-sh-text]").value = D.text; edited = false; refresh(); q("[data-sh-text]").focus(); say("The suggested text is back."); });
    var c = q("[data-sh-sec]"); if (c) c.addEventListener("change", refresh);
    q("[data-sh-close]").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });       // a press on the backdrop closes it
    dlg.addEventListener("close", function () { if (from && from.focus) from.focus(); });
    q("[data-sh-wa]").addEventListener("click", function () { refresh(); track("whatsapp"); say("WhatsApp opened in a new tab. Choose a contact or group there; nothing is sent until you press send. If it did not open, use Copy message and link."); });
    q("[data-sh-li]").addEventListener("click", function () { refresh(); track("linkedin"); say("LinkedIn opened in a new tab with the link. Paste your copied text into the post; nothing is posted until you choose to."); });
    q("[data-sh-copy-all]").addEventListener("click", function () { track("copy-message"); copy(message(text(), url()), q("[data-sh-text]"), "Message and link copied. Paste them wherever you like."); });
    q("[data-sh-copy-text]").addEventListener("click", function () { track("copy-text"); copy(text().trim(), q("[data-sh-text]"), "Text copied. Open LinkedIn, then paste it into your post."); });
    q("[data-sh-copy-url]").addEventListener("click", function () { track("copy-link"); copy(url(), q("[data-sh-url]"), "Link copied."); });
    var m = q("[data-sh-more]");
    if (m) m.addEventListener("click", function () {
      track("more");
      // the link goes in the url field only, so apps do not show it twice
      root.navigator.share({ title: D.title, text: text().trim(), url: url() }).then(function () { say("Passed to your device's share options."); },
        function (e) { say(e && e.name === "AbortError" ? "" : "Your device's share options did not open. Use one of the buttons above."); });
    });
  }

  function open(btn) {
    from = btn || doc.activeElement;
    if (!dlg) build();
    refresh(); q("[data-sh-say]").textContent = "";
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    q("#cs-shd-h").focus();         // the heading, so a phone keyboard does not open over the panel
  }
  root.CS_SHARE = { open: open, core: core };
})(typeof window !== "undefined" ? window : this);
