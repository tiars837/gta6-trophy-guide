# GTA VI Trophy Guide — Leonida Checklist

[![Bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/tiars837/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/tiars837/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, single-purpose web app that guides you to the GTA VI platinum on PlayStation 5: all 55 official trophies, a checklist that saves in your browser, a six-stage roadmap, and the one missable step flagged in red.

## What it does

- **All 55 trophies** — official names, descriptions and grades, with guides written for this entry. Six trophies have no confirmed unlock method at launch; those guides say so honestly instead of guessing.
- **Checklist** — tick trophies off as they pop; progress is stored in localStorage, with export/import as JSON.
- **Filters** — by type, grade, missable only, or hide earned; full-text search across names, descriptions and guides.
- **Spoiler mode** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap** — six stages in play order, from the Chapter 1 balcony meditation (the one missable step — GTA VI has no mission replay) through 100% completion to the platinum.

## Run it

```sh
# Build the output directory (writes dossier.json)
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts

# Serve the app locally
python3 -m http.server 8080 --directory app
# open http://localhost:8080
```

## Files

- `main.ts` — entrypoint: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` via the vendor helper.
- `app/index.html`, `app/app.js`, `app/style.css` — the static offline app.
- `app/data/trophies.json` — the 55 trophies (official name/description/grade, own-words guide, sources, missable flag, kind, roadmap stage).
- `vendor/makefun-frontend.ts` — make.fun vendor helper, used unmodified.
- `screenshots/` — renders of this guide.

## Sources

Names, descriptions and grades are the official PlayStation list, as published by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/grand-theft-auto-vi); roadmap research also draws on [PowerPyx](https://www.powerpyx.com/grand-theft-auto-6-vi-trophy-guide-roadmap/) and [Output Lag](https://www.outputlag.com/gta-6-trophy-list/).

Unofficial fan guide — not affiliated with Rockstar Games, and it uses no Rockstar artwork or logos.

## License

MIT — see [LICENSE](LICENSE).
