# DevTools Journal — demo build (noindex)

Static clone of the studentsandparents.com template (see blueprint) for the
"Developer tools and programming" niche.

## What this demo does
- 11 articles are already published (different past dates).
- 10 more articles publish **1 every 15 minutes** after your first visit
  (epoch stored in localStorage). A yellow status strip under the header
  shows the countdown; press "Reset schedule" to watch the cycle again.
- Every page sends `noindex, nofollow`, and robots.txt blocks all crawlers.

## Deploy to GitHub Pages
1. Create a repository (e.g. `devtools-demo`).
2. Copy the **contents of this folder** to the repo root.
3. Ensure `.nojekyll` exists at the root (already included).
4. Repository Settings -> Pages -> Deploy from branch -> main / root.
5. Open `https://<user>.github.io/<repo>/`.

All asset paths are relative, so project-page subpaths work out of the box.

## Production build (after demo approval)
- Remove `demo-schedule.js` include and the `.demo-strip` markup.
- Emit all 21,000 posts with dates baked at build time:
  - 1,101 backdated to different previous dates,
  - 19,899 scheduled 67 per batch every 8 hours from 26 Oct 2026 for 99 days,
    uploaded in matching batches.
- Switch robots meta to `index, follow`, ship real sitemap.xml + robots.txt,
  GSC verification, and the ad-slot code (slots are marked with
  `<!-- ADSLOT:... -->` comments already).
