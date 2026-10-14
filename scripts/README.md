# Profile Maintenance

- `node render-assets.mjs`: regenerate the original SVG artwork from the checked-in brand paths. Run from this directory, or use `node scripts/render-assets.mjs` from the repository root.
- `npm ci --ignore-scripts`: install the pinned HTML parser used for GitHub's public contribution calendar.
- `node scripts/update-profile.mjs`: refresh the contribution graphics, recent public updates and repository index. It reads public endpoints anonymously.
- `node --test scripts/profile.test.mjs`: check public-data filtering, output safety, update boundaries and local image references.

The scheduled workflow refreshes every six hours and only commits changed snapshots. It does not use a personal access token, inspect private repositories or publish event payloads, commit messages or email addresses from GitHub activity. Calendar counts are limited to what GitHub already exposes on the public profile; these may include anonymised private counts when the owner enables that setting. No private repository identity is collected. The contact addresses in the README are intentionally curated public contact information.

The calendar parser validates accessible count labels, dates and completeness. A missing label or changed HTML structure fails the refresh rather than inventing zero contributions. Streaks are measured in UTC calendar days; an unfinished current day with zero contributions does not break yesterday's streak.

The Packet Run calendar animation moves an original pixel spacecraft between up to twelve recent active days in chronological order. Each checkpoint uses an actual calendar cell, date and contribution count. The run total accumulates only these days; it is not the annual contribution total. Reduced-motion preferences show the latest checkpoint without the spacecraft or animation. Empty calendars do not generate a route. This is a self-running SVG animation, not an interactive game. GitHub contribution totals are not labelled as commit-only totals.

Project stories and roadmap status are maintained manually so an activity update cannot silently turn planned features into completed claims. Technology marks are credited in `assets/ICONS.md`.
