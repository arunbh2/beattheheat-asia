# Design

An original identity: near-black space, a dotted silver Earth, warm-to-cold temperature lights and quiet editorial type. Nothing is copied from the reference screenshot or any brand.

## Colour
| Token | Value | Use |
|---|---|---|
| `--bg` | `#05070A` | Page background, with a faint radial lift behind the globe |
| `--ink` | `#E6E8EF` | Text, land particles |
| `--ink-2` / `--muted` | `#B5BCC9` / `#8E97A6` | Secondary text |
| `--panel` | `rgba(12,16,23,.86)` + blur | Dossier, menus |
| `--line` | `rgba(230,232,239,.12)` | Hairlines |
| `--accent` | `#F7C765` | Focus rings, active tab, link underline |
| Status | fresh `#8FE3B0`, stale `#F7C765`, unavailable `#8E97A6` | Data status dots |

**Temperature key (air temperature only):** below 0 `#83C9FF` · 0–15 `#4ED9E8` · 15–25 `#E9EAF0` · 25–32 `#F7C765` · 32–38 `#FF853E` · above 38 `#FF5267`, blended over 1.5°C at each edge (`BLEND_C`). Missing values `#7C8496`. Configured in `src/lib/temperatureScale.ts`. Comparison charts use neutral line styles (solid, dashed, dotted), never the temperature colours.

## Type
Fraunces (300/400) for titles and large numbers; Inter (400/500/600) for interface text. Both SIL OFL, self-hosted through Fontsource.

## Motion (`src/lib/motion.ts`)
| Token | Value |
|---|---|
| Idle spin | 0.025 rad/s, off when a dossier is open, when paused, or with reduced motion |
| Inertia | `v *= exp(−3.2·dt)`; flings capped at 4.5 rad/s; stops below 0.002 rad/s |
| Focus | quaternion slerp, cubic ease in-out, 0.9–1.8 s by angle (0.2 s with reduced motion) |
| Zoom | eased to target over ~0.18 s; 0.6–1.35 × the fitted distance |
| Layout offset | globe glides aside for the dossier over ~0.35 s |
| UI | 280 ms panels and drawers; removed with reduced motion |
| Pulse and sparkle | capital lights pulse ±10% at 1.2 rad/s; 1.6% of land points twinkle; both off with reduced motion |

## Layout
- **Desktop (≥ 900 px):** title top left; search and controls top right; legend, status and attribution bottom left; dossier as a 440 px right panel, with the globe and controls moving clear of it.
- **Phone:** one-line toolbar (icon buttons for pause, reset and list), compact legend, dossier as a bottom drawer (max 64 vh) with safe-area padding. The globe fits just wider than the screen.
- **Embed (`?embed=hero`):** no title, compact controls, a link to the full planet.

## States
Hover shows a small tip (name, value, unavailable or stale). Focus rings are 2 px accent. Tabs move with the arrow keys. Escape closes panels and the dossier; focus returns to where it was.
