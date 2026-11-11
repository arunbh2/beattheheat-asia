/* Common Shade: /for-ai/. Reveals the "Copy this message" button (hidden without JavaScript, so there is never a dead
   button) and copies the suggested message. Nothing is sent anywhere. */
(function () {
  "use strict";
  var btn = document.querySelector("[data-fa-copy]"), msg = document.getElementById("fa-msg"), out = document.querySelector(".fa-copied");
  if (!btn || !msg) return;
  btn.hidden = false;
  function done(ok) { if (out) out.textContent = ok ? "Copied." : "Select the text above and copy it."; setTimeout(function () { if (out) out.textContent = ""; }, 2600); }
  btn.addEventListener("click", function () {
    var text = msg.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); }); return; }
    try { var r = document.createRange(); r.selectNodeContents(msg); var s = getSelection(); s.removeAllRanges(); s.addRange(r); done(document.execCommand("copy")); } catch (e) { done(false); }
  });
})();
