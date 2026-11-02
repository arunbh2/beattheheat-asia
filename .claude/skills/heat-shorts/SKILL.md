---
name: heat-shorts
description: Make a short animated explainer film (about 30 to 90 s, vertical 9:16 and wide 16:9) about extreme heat for Common Shade, with drawn faceless figures, a calm narrated voice, burned-in captions and checked sources. Use when the user says "make a heat short about ...", "a short film explaining ...", "a video like the map guide", or asks for a social video about a heat harm, cycle or lever.
---

# Heat shorts (Common Shade)

Short films that explain one idea about extreme heat in South and Southeast Asia: a harm, a vicious cycle, a lever, or how to use part of the site.
- **Worked example:** the map guide film (`tools/mapguide/`, `media/mapguide/`). A drawn guide walks through real captures of the heat map.
- **Origin:** this skill adapts the MIT-licensed `claude-animated-shorts` skill (see "Licence and origin" at the end). The upstream method is kept in `references/` for study. The rules below come first.

## Common Shade rules (these override everything else here and in `references/`)

1. **Faceless figures only.**
   - Draw people as simple line figures, never with eyes, brows, mouths or skin-tone stereotypes. In the upstream character code, `FACELESS = true` in `templates/bridge/toon.ts` switches face drawing off. Never switch it back on.
   - Show feeling through posture, gesture, pace, colour and light, not faces.
   - Name no individuals or journalists, and use no photographs of people. Organisations and places are fine.
2. **Humble, diplomatic voice.**
   - Never "should" or "must" in the film's own words. Describe what helps, what it depends on, and who could act.
   - No blame, no ranking of countries, cities or organisations, no political positions.
   - Avoid words that suggest wrongdoing, even in denial.
   - No jokes about harm, illness or death. Warmth and gentle wit are welcome where nobody is hurt. The upstream "deadpan double line" device is not used for harms.
   - Where the evidence is thin or the map is illustrative, say so ("a guide for thinking, not a forecast").
3. **Every fact has a checked source.**
   - Before scripting, list each fact with its source at the top of `SCRIPT.md`. Prefer a figure the site already cites, from `data/core/*.json`.
   - Verify any new source on GitHub with `verify-urls.yml` or `verify-sources.yml`. This session has no open web.
   - Never invent a number, study, quote or URL. Label illustrative numbers "illustrative".
   - Read counts (harms, cycles, levers, plans) from the data at build time. Never type them (see `tools/mapguide/build.js`).
4. **No em dashes** in the script, captions, descriptions, file names or notes. Use a plain hyphen or a full stop. Run `node tools/check-voice.js` after placing a film on a page.
5. **Readable for everyone.** This overrides upstream's "no captions" rule.
   - Captions are burned into the picture and also written as a `.vtt` file.
   - No more than three flashes a second. Offer a gentle cut if the motion is strong.
   - Plain English, short sentences. The voice reads a web address as words (for example "beat the heat dot Asia") while the captions show it as written.
6. **Zero budget, no new dependencies without asking.**
   - Route A (below) is the default and uses only what the repo already has.
   - Route B (Remotion and three.js) adds dependencies and 3D assets, so ask the user first, check Remotion's current licence terms for a non-commercial organisation, and keep it out of `package.json` unless they agree.
7. **Sound.** The Piper voice `en-us-libritts-high`, speaker 599 (CC BY 4.0), at about 3 words a second. The music is synthesised (`tools/films/music.py`), so there is nothing to license. Loudness about −16 LUFS, peak −1.5 dBTP.
8. **Repo hygiene.**
   - Never run git stash or pull while a render is writing files.
   - Keep voice and music `.wav` files out of git (`.gitignore`).
   - Keep no model names or IDs in files.
   - Never add the upstream reference frames or anyone else's videos: they were left out on purpose.

## The story (adapted for heat)

About 3 words a second, 30 to 90 s. One idea per film.
1. **Hook:** one surprising true fact, in one line, with no setup. For example: "A hot night can be more dangerous than a hot day."
2. **Place:** a real setting in the region (a ward, a market, a clinic, a field), with its source.
3. **Mechanism:** how heat causes the harm, through one everyday analogy.
4. **The cycle:** what it sets in motion, and whether it feeds itself. Use the map's own links (`data/core/LINKS.json`).
5. **What helps:** one lever from `data/core/LEVERS.json`: who can act, how soon, and a real example with its source.
6. **Close:** an invitation, not an instruction ("Find the lever within reach"), then the site address.

Never describe on screen what the viewer can already see. Every reaction lands just before its word.

## Route A: the repo's own renderer (default)

These tools render drawn scenes in Playwright and ffmpeg. Start from whichever fits:
- `tools/mapguide/`: real captures of the site plus a drawn guide, with `window.tick(ms)` seeking. Good for "how to use" films.
- `tools/shorts/` (25 s films, drawings in `art.js`, which are faceless already) and `tools/films/` (longer drawn films): good for one harm or lever.
- `tools/launch/`: a fast, music-led film with counts read from data.

Steps:
1. **Facts and sources** into `SCRIPT.md` (rule 3).
2. **Words:** a `build.js` that writes `<name>.narration.json` (one line per scene, `|` between beats, counts read from data).
3. **Voice and timing:**
   ```
   FILM_DIR=<dir> FILM_OUT=<media folder> PIPER_VOICE=<path>/en-us-libritts-high.onnx python3 tools/films/narrate.py <name>
   ```
4. **Scene:** an HTML page driven by `window.tick(ms)`. Use the site's fonts (`tools/films/fonts/`) and colours (`--ink #16202B`, `--cream #FAF7F2`, `--orange #F26430`, `--ember #B8401A`, green for what helps). Lay it out for both 9:16 and 16:9.
5. **Stills first:** render 6 to 10 frames from both formats and look at them. Check the layering, the guide's arm, caption fit and anything cut off.
6. **Render:** both formats, a poster and the `.vtt` captions. Keep each MP4 under about 8 MB if you can.
7. **QA:** check the length and loudness, and sample frames for black, frozen or popping frames. `templates/scripts/short_qa.py` shows a fuller frame-by-frame check that can be adapted.
8. **On the site:** add the film to `data/core/SECTION_FILMS.json` (or to the shorts on its page) with a watch button. Then rebuild, run every check in CLAUDE.md, bump `?v=` if a script changed, and ship.
9. **Tell the user** where the files are, for the site and for social channels.

## Route B: Remotion and three.js (only with the user's agreement)

For richer 3D story shorts ("2D figures in a painted 3D world"), follow `references/UPSTREAM_SKILL.md` and `templates/`, with these changes:
- Rules 1 to 8 above override it. In particular: faces stay off, captions are on, there are no jokes about harm, and loudness is −16 LUFS (not −14).
- Upstream's verification uses "Opus max". Use a fresh verifier agent with no model named in any file.
- The Kenney 3D kits upstream mentions are CC0 but not included. Download them only if the user agrees, and record where they came from.
- Without the reference frames, the look-match loop compares against our own earlier films and the measured numbers in `references/reports/`, not another channel's pictures.
- Remotion copies `public/` into a temporary folder on every bundle (over 1 GB each), so watch the session's disk allowance.

## Licence and origin

- **Upstream:** `templates/`, `references/STYLE_BIBLE.md`, `references/reports/`, `references/UPSTREAM_SKILL.md` and `references/UPSTREAM_README.md` come from [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) (commit e3b817b), under the MIT licence in `LICENSE`.
- **Changes made here:**
  - this SKILL.md, written for Common Shade
  - the `FACELESS` switch in `templates/bridge/toon.ts`
  - em dashes replaced with hyphens in the Markdown files
  - the reference frames and contact sheets left out
- **Upstream text:** where it mentions a private reference channel, captions being off, or jokes, the rules above apply instead.
