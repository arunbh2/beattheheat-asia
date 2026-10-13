# BeatTheHeat.Asia: Extreme heat is a wicked problem

This website is an **interactive map** of how extreme heat spreads through four connected systems: nature and land, health and wellbeing, cities and systems, and work and the economy.

Visitors can:

- **tap any bubble** to see what it sets in motion and what drives it;
- **follow the ripple** to watch one consequence spread across the whole web;
- **walk through 12 vicious cycles**, grouped into loops that feed the heat itself, loops that trap people and loops that break the systems we rely on;
- **see where each loop can be broken**: 19 breaking points, each tied to the link it cuts;
- **find the pressure points** where several loops meet, and the levers that break more than one loop at once;
- **reveal hidden cross-system links** that the simplified map leaves out;
- **filter** the map to one system, or switch link types on and off.

It is a plain website. There is nothing to install and nothing to "build". GitHub shows these files to visitors exactly as they are.

---

## What is in this folder

| File | What it does | Do you need to edit it? |
|---|---|---|
| `index.html` | The page: the title, the "Why wicked?" section and the closing | Only to change those words |
| `script.js` | **The map's content** (every bubble, description, link and guided path) and the code that draws it | Only the **DATA** section at the top |
| `styles.css` | Colours, fonts and layout | No |
| `images/SOCIAL_SHARE_IMAGE.jpg` | The preview picture shown when the link is shared on WhatsApp, LinkedIn and similar apps | Only if you want a new preview |
| `CNAME` | Connects the site to the address beattheheat.asia | **No. Never delete this file.** |

---

## How to change words on the map

All the map's words are near the top of `script.js`, in the section marked `DATA`.

1. On GitHub, open `script.js` and click the **pencil icon** (✏️) to edit it.
2. Press **Ctrl + F** (Windows) or **Cmd + F** (Mac) and search for the words you want to change. For example, search for `Wildfires`.
3. Change **only the text inside the quote marks**. For example:

   ```js
   desc: "Hot, dry vegetation ignites more easily and burns longer, ..."
   ```

   - `label:` is the text inside the bubble. `\n` starts a new line inside the bubble.
   - `desc:` is the description shown when someone taps the bubble.
   - In the `EDGES` list, the sentence after a link explains *why* one thing leads to the other.
   - In `LOOPS`, each vicious cycle has a `name:`, a `summary:` and an `evidence:` level (`"established"` or `"emerging"`).
   - In `LEVERS`, each breaking point has a `title:`, a `text:` and sometimes an `example:`.
   - In `STORIES`, each step of the *From field to family* path has a `title:` and a `text:`.
4. Keep every quote mark `"` and comma `,` exactly where it was. If one goes missing, the map won't appear. You can always undo by restoring the previous version of the file from its **History** on GitHub.
5. Scroll down and click **Commit changes** (GitHub's word for *save*).

> **Tip:** If you want to type a quote mark inside a sentence, use the curly kind (’ or “ ”), not the straight `"`.

---

## The colours

The site uses a "heat-risk" palette. Each colour has one job, so readers learn what it means:

| Colour | Used for |
|---|---|
| Deep charcoal navy `#16202B` | Text and structure |
| Heat orange `#F26430` | The heat itself, headline highlights and main buttons |
| Emergency red `#D7263D` | Vicious cycles and urgent numbers only |
| Resilient teal `#1F7A70` | Where loops can be broken |
| Cool blue `#2E6F95` | Hidden cross-system links |
| Amber warning `#F5A623` | "You are here" highlights and keyboard focus |
| Warm sand `#F6E7D7` and off-white `#FAF7F2` | Calm backgrounds |

The four systems use quiet, muted tones so the meaningful colours stand out. All colours are set at the top of `styles.css` and `script.js`.

---

## How to upload files to GitHub

1. Go to github.com, sign in, and open the repository for beattheheat.asia.
2. Click **Add file → Upload files**, then drag in `index.html`, `styles.css`, `script.js` and `README.md`. For the preview image, open the `images` folder first and upload it there.
3. Files with the same name are replaced, which is what you want.
4. Click the green **Commit changes** button.
5. Wait 1–3 minutes. To watch progress, open the **Actions** tab: a green tick means the site has updated.
6. Open https://beattheheat.asia in a **private or incognito window** so you don't see an old saved copy.

**Do not delete the `CNAME` file.**

---

## Checked on

Android and iPhone screen sizes, tablets and laptops. On phones the map opens zoomed in so the words can be read; drag to move around and use **−** to see the whole web. The full map is also written out as a list at the bottom of the page, for screen readers and anyone who prefers reading it that way.
