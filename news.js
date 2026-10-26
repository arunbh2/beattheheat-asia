/* Common Shade: the "Heat in the news, and new research" page (/news/).
   News: feeds/news.json, refreshed every six hours by .github/workflows/heat-news.yml from the GDELT Project and
   regional news outlets' RSS feeds, read from GitHub so a new headline shows without a site rebuild. Research: Europe PMC, searched live. */
(function () {
  "use strict";
  const FEEDS = {
    news: { url: "https://raw.githubusercontent.com/arunbh2/beattheheat-asia/main/feeds/news.json", local: "/feeds/news.json", staleDays: 2 },
    research: { days: 120,
      title: '(TITLE:"heatwave" OR TITLE:"heatwaves" OR TITLE:"heat wave" OR TITLE:"heat waves" OR TITLE:"extreme heat" OR TITLE:"heat stress" OR TITLE:"heat-related" OR TITLE:"heat exposure" OR TITLE:"heat illness" OR TITLE:"heatstroke" OR TITLE:"heat stroke" OR TITLE:"ambient temperature")',
      place: '(India OR Bangladesh OR Nepal OR "Sri Lanka" OR Pakistan OR Cambodia OR Indonesia OR Philippines OR Singapore OR Thailand OR Vietnam OR Malaysia OR Myanmar OR "South Asia" OR "Southeast Asia")',
      credit: { label: "Europe PMC", url: "https://europepmc.org/" } },
    credits: { "GDELT Project": "https://www.gdeltproject.org/" },
    note: "Headlines and papers come from outside sources and are not reviewed by us. They are listed to help you follow the conversation, not as endorsements."
  };
  const SOUTH = ["India", "Bangladesh", "Nepal", "Sri Lanka", "Pakistan", "Bhutan", "Maldives"];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const strip = t => String(t || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const ago = t => { const h = (Date.now() - t) / 3600000; return h < 1 ? "within the hour" : h < 24 ? `${Math.floor(h)} hour${h < 2 ? "" : "s"} ago` : new Date(t).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }); };
  const show = (list, rows, n) => {
    list.innerHTML = rows.join(""); [...list.children].forEach((li, k) => { li.hidden = k >= n; });
    let b = list.parentElement.querySelector(".feed__more"); const extra = rows.length - n;
    if (extra > 0) { if (!b) { b = document.createElement("button"); b.type = "button"; b.className = "link feed__more"; list.after(b);
      b.addEventListener("click", () => { [...list.children].forEach(li => { li.hidden = false; }); b.remove(); }); } b.textContent = `Show ${extra} more`; }
    else if (b) b.remove();
  };

  function news() {
    const list = document.getElementById("feed-news"), meta = document.getElementById("feed-news-meta"), filter = document.getElementById("feed-news-filter");
    const get = u => fetch(u, { cache: "no-cache" }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
    get(FEEDS.news.url).catch(() => get(FEEDS.news.local)).then(j => {
      const items = (j.items || []).filter(x => x && x.title && /^https?:\/\//.test(x.url));
      const updated = Date.parse(j.updated), stale = !Number.isFinite(updated) || Date.now() - updated > FEEDS.news.staleDays * 86400000;
      const ok = (j.sources || []).filter(s => s.ok).map(s => FEEDS.credits[s.name] ? ext(FEEDS.credits[s.name], s.name) : esc(s.name));
      if (meta) meta.innerHTML = `${stale ? "Last refreshed" : "Updated"} ${esc(Number.isFinite(updated) ? ago(updated) : "unknown")}${ok.length ? `. Headlines found by ${ok.join(" and ")}` : ""}. Refreshed every six hours.`;
      if (!items.length) {
        list.innerHTML = `<li class="feed__wait">${stale ? "The news feed has not refreshed recently, so no headlines are shown." : `No new heat headlines from South and Southeast Asia in the last ${esc(j.keepDays || 14)} days. Across most of the region heat is reported mainly in the hot season, roughly March to June, so the list is often quiet outside it. The feed is checked every six hours.`}</li>`; return;
      }
      const row = x => `<li data-region="${x.place ? (SOUTH.includes(x.place) ? "south" : "southeast") : "other"}"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(strip(x.title))}<span class="visually-hidden"> (opens in a new tab)</span></a>
        <span class="feed__src">${esc(x.domain || "")}${x.place ? ` · ${esc(x.place)}` : ""}${x.date ? ` · ${esc(ago(Date.parse(x.date)))}` : ""}</span></li>`;
      const draw = region => show(list, items.filter(x => region === "all" || (x.place && (SOUTH.includes(x.place) ? "south" : "southeast") === region)).map(row), 12);
      draw("all");
      const counts = { south: items.filter(x => x.place && SOUTH.includes(x.place)).length, southeast: items.filter(x => x.place && !SOUTH.includes(x.place)).length };
      if (filter && counts.south && counts.southeast) {
        filter.hidden = false;
        filter.innerHTML = [["all", `All (${items.length})`], ["south", `South Asia (${counts.south})`], ["southeast", `Southeast Asia (${counts.southeast})`]]
          .map(([id, l], i) => `<button type="button" class="chip" data-region="${id}" aria-pressed="${i === 0}">${esc(l)}</button>`).join("");
        filter.addEventListener("click", e => { const b = e.target.closest("[data-region]"); if (!b) return;
          filter.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); draw(b.dataset.region); });
      }
    }).catch(() => { list.innerHTML = `<li class="feed__wait">The news feed could not be loaded just now.</li>`; });
  }

  function research() {
    const R = FEEDS.research, list = document.getElementById("feed-research"), meta = document.getElementById("feed-research-meta"), KEY = "bth-research-v1";
    const draw = j => {
      const items = ((j.resultList || {}).result || []).filter(x => x.title).slice(0, 40); if (!items.length) throw new Error("empty");
      show(list, items.map(x => { const url = x.doi ? `https://doi.org/${x.doi}` : `https://europepmc.org/article/${x.source}/${x.id}`;
        const where = x.journalTitle || (x.source === "PPR" ? "Preprint" : x.bookOrReportDetails && x.bookOrReportDetails.publisher) || "";
        return `<li><a href="${esc(url)}" target="_blank" rel="noopener">${esc(strip(x.title))}<span class="visually-hidden"> (opens in a new tab)</span></a>
          <span class="feed__src">${esc(where)}${x.firstPublicationDate ? ` · ${esc(new Date(x.firstPublicationDate).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }))}` : ""}</span></li>`; }), 12);
      if (meta) meta.innerHTML = `Papers and preprints from the last ${R.days} days with heat in the title and an Asian setting, newest first, from ${ext(R.credit.url, R.credit.label)}.`;
    };
    try { const c = JSON.parse(localStorage.getItem(KEY) || "null"); if (c && Date.now() - c.at < 6 * 3600000) { draw(c.j); return; } } catch (e) {}
    const from = new Date(Date.now() - R.days * 86400000).toISOString().slice(0, 10);
    const q = `${R.title} AND ${R.place} AND FIRST_PDATE:[${from} TO 3000-01-01]`;
    fetch("https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=lite&pageSize=40&sort=" + encodeURIComponent("FIRST_PDATE_D desc") + "&query=" + encodeURIComponent(q))
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(j => { draw(j); try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), j })); } catch (e) {} })
      .catch(() => { list.innerHTML = `<li class="feed__wait">New research could not be loaded just now.</li>`; });
  }

  const note = document.getElementById("feeds-note"); if (note) note.textContent = FEEDS.note;
  news(); research();
})();
