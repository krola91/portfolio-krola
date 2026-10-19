# DESING.md — Design System Overview

> **Project Style:** Neo-Cyberpunk / Sci-Fi UI / Dark Futurist  
> **Mood:** Bold, functional, future-ready. High contrast, tech-driven, immersive.

---

## 1. Design Philosophy

The interface follows a **Neo-Cyberpunk** aesthetic rooted in dark futurism. Visual language emphasizes:

- **High-contrast dark surfaces** against neon accents.
- **Geometric precision** — sharp corners, grid lines, wireframes, and orbital elements.
- **Layered depth** — glowing halos, glass-like overlays, and holographic hints.
- **Motion-ready** — every element feels like it could animate (scanlines, pulsing glows, marquee ticks).

The overall vibe is: *a dashboard from the year 2077*.

---

## 2. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| **Dark** | `#010207` | Primary background, deepest layer |
| **Blue** | `#030763` | Secondary background, card surfaces |
| **Light Blue** | `#02149B` | Hover states, subtle fills, gradients |
| **Super Light Blue** | `#1940F7` | Active accents, glows, links, highlights |
| **Neutral Blue** | `#1631D2` | Mid-tone accents, borders, dividers |
| **Section Surface** | `#171717` | Flat matte charcoal background shared by Process, Work, and The Lab; darker than the former #262626, not pure black |
| **Signal Blue** | `#008BFF` | Secondary technical accent: Home section indices /01, /02, /03 and all formerly cyan accents in Vulnerability Intelligence |
| **Grey** | `#E2E2E4` | Primary text on dark, subtle UI lines |
| **Lime** | `#d2ef28` | Secondary accent, labels, badges |
| **Electric Lime** | `#C1FA0B` | CTAs, primary buttons, highest emphasis |

### Usage Rules
- **Backgrounds:** Use `Section Surface` for grouped content sections; stack `Dark` → `Blue` → `Light Blue` to create depth within focal areas.
- **Text:** `Grey` for body; `Electric Lime` or `Super Light Blue` for headlines / CTAs.
- **Accents:** Use `Electric Lime` sparingly — only for actions and critical highlights.
- **Secondary accent:** Use `--color-signal-blue` for section numbering and informational/technical details. Keep lime dominant for actions; do not recolor alerts or the existing deep-blue hero surfaces. Observatory cyan colors and translucent variants derive from Signal Blue.
- **Glows:** `Super Light Blue` and `Electric Lime` are the only glow sources.

---

## 3. Typography

### Title Font — `Orbitron`
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Lexend:wght@100..900&family=Orbitron:wght@400..900&display=swap" rel="stylesheet">
```
- **Weights:** 400–900
- **Feel:** Geometric, sci-fi, engineered. Perfect for H1–H3 and display text.
- **Styling:** Often used in ALL CAPS with wide letter-spacing for impact.

### Body Font — `Lexend`
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Lexend:wght@100..900&display=swap" rel="stylesheet">
```
- **Weights:** 100–900
- **Feel:** Clean, modern, highly legible. Neutral enough to balance Orbitron’s personality.
- **Styling:** Used for paragraphs, descriptions, labels, and UI micro-copy.

### Accent / Decorative — `Josefin Sans`
- **Weights:** 100–700
- **Feel:** Elegant, slightly retro-futuristic. Useful for quotes, small labels, or decorative numerals.

---

## 4. Visual Effects & Texture

| Effect | Description |
|--------|-------------|
| **Neon Glow** | Soft outer glow using `Super Light Blue` or `Electric Lime` on text and borders. |
| **Wireframe Overlays** | Thin 1px lines in `Neutral Blue` or `Grey` forming grids, corners, and orbital rings. |
| **Glassmorphism** | Semi-transparent dark cards (`#030763` at 80% opacity) with subtle blur. |
| **Holographic Halos** | Circular blue glows behind portraits or focal images. |
| **Corner Brackets** | Small L-shaped brackets at card corners — signature Sci-Fi UI detail. |
| **Scanline / Tick Marks** | Vertical "SCROLL TO DISCOVER" tickers, marquee text strips. |
| **Circular Seals** | Rotating badge elements (e.g., "STRATEGY • DESIGN • EXPERIENCE"). |
| **Marquee Ticker** | Horizontal scrolling text bar at the bottom (e.g., "LET'S BUILD THE FUTURE TOGETHER"). |

---

## 5. Spacing & Layout

- **Grid:** Tight, modular grid. Cards align to a strict column system.
- **Padding:** Generous internal padding on cards (24–32px) to let glows breathe.
- **Gaps:** Tight gaps between cards (12–16px) to maintain a dense, cockpit-like feel.
- **Border Radius:** Minimal to none. Home buttons have sharp corners with no radius; their rear chassis uses the diagonal technical cut defined below.
- **Borders:** 1px solid `Neutral Blue` or `Light Blue` for card outlines.

---

## 6. Iconography & Assets

- **Icons:** Thin-line, monochrome. Stroke weight 1–1.5px. Color: `Grey` or `Super Light Blue`.
- **Decorative:** Planetary / orbital line art, star ratings, QR codes, globe wireframes.
- **No photography filters:** Images should feel raw or have a slight blue/cyan color grade to match the palette.

---

## 7. Home Buttons — Retro Terminal Chassis

All action buttons and button-like links in `src/components/home` use the shared
`terminal-button` / `terminal-button__face` design in `src/styles/global.css`.

- Rectangular flat face in **Lime** (`--color-lime`, `#d2ef28`), black uppercase monospace text.
- Every action begins with the decorative `>_` prompt; hide the prompt from assistive technology.
- Thick 4px black face border and fine 1px white outline; no rounded corners, grid fill, gradients or glow.
- Flat black rear chassis with a fine white outline, offset 10px right and down; its upper-right corner has a diagonal technical cut.
- Hover lifts 2px; pressed state moves 2px into the chassis. Keyboard focus stays clearly visible.
- Minimum 44px touch height, readable wrapped labels and reserved space for the rear layer prevent overflow.
- Reduced motion disables displacement. Keep existing text, links, data attributes and behavior.
- Work project selectors use the same lime/black chassis while retaining their compact title, metadata and selection state.
- This rule applies to Home; do not automatically restyle the Cyber Observatory controls.

## 8. Quick Reference

```css
:root {
  --color-dark: #010207;
  --color-blue: #030763;
  --color-light-blue: #02149B;
  --color-super-light-blue: #1940F7;
  --color-neutral-blue: #1631D2;
  --color-grey: #E2E2E4;
  --color-lime: #d2ef28;
  --color-electric-lime: #C1FA0B;
  --color-section-surface: #171717;
  --color-signal-blue: #008BFF;

  --font-title: 'Orbitron', sans-serif;
  --font-body: 'Lexend', sans-serif;
  --font-accent: 'Josefin Sans', sans-serif;
}
```

---

*Document generated for Neo-Cyberpunk project baseline.*
