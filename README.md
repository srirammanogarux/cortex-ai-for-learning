# Cortex AI: a curiosity app

Cortex is a mobile-first place for curious exploration: ask anything, see it explained as a living visual, follow the ideas it connects to, and keep them in your brain.

This repo holds the research, decisions and clickable prototypes made so far.

## Live prototypes (Vercel)

| Prototype | Link | Status |
|---|---|---|
| **Onboarding v3, Part A**: trailer, 3 quick questions, pondering orbs (PM path) | https://cortex-onboarding-v3.vercel.app | Current |
| **Onboarding v3, Part B**: exploration, glowing terms, corner map, save → Today | https://cortex-onboarding-v3.vercel.app/partb/ | Current |
| Onboarding v2: one-minute work path | https://cortex-onboarding-v2.vercel.app | Earlier exploration |
| Idea map: curiosity map for a PM | https://cortex-idea-map.vercel.app | Earlier exploration |
| Onboarding v1: three directions × four personas | https://cortex-onboarding-nine.vercel.app | Earlier exploration |

Best viewed on a laptop: each prototype shows a phone frame with a guide beside it.

## What's where

- `CORTEX_MASTER.md`: the master brief (product, personas, IA, design system, orb).
- `research/`: competitor research, design-system breakdown, decision log (`decisions.md`) and flow docs (`flows/`).
- `prototypes/`: each prototype is plain HTML/CSS/JS with no build step. Open its `index.html`.
  - `onboarding-v3/`: Part A at the root, Part B in `partb/`. `brain.js` is the particle brain engine.

## Key decisions so far
- **Font:** Geist.
- **Brand colour:** cobalt `#1F5BE0`.
- **Look:** light, premium surfaces.
- **The brain is the character.** A particle brain that morphs into whatever you're exploring.
- **Icons:** solid glyphs, each in its own colour gradient.
- **Onboarding is a short film:** the trailer, then three questions, then pondering, then the map, then save.

See `research/decisions.md` for the full log.
