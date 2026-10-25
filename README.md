# DevTools Journal — GitHub Pages scheduled-publishing demo

This package applies a **server-side build/deploy scheduler** to the existing static demo. It removes the browser countdown/reset UI and does not rely on localStorage to decide what is published.

## Files added/changed
- `schedule.csv`: one row per demo article (exported from the provided schedule workbook).
- `scripts/build_site.py`: marks due rows as Published, builds `dist/`, and excludes scheduled article HTML from the deployed artifact until its scheduled time.
- `.github/workflows/publish.yml`: runs every 15 minutes and deploys the generated `dist/` to GitHub Pages.
- The old `assets/kutukdev/js/demo-schedule.js` and countdown strip were removed.

## Install in your repository
1. Extract this ZIP locally.
2. Upload/commit **the contents of this folder** to the root of the `devtoolforge/devtoolforge.github.io` repository (not the ZIP itself).
3. In repository Settings → Pages, select **GitHub Actions** as the Build and deployment source.
4. In Settings → Actions → General, allow GitHub Actions to create and approve pull requests is not required; the workflow needs repository `contents: write` permission, which is declared in the workflow. If repository/org policy blocks it, schedule status commits will fail.
5. Run Actions → `Scheduled demo publisher` → Run workflow once to test. Future scheduled runs occur every 15 minutes (UTC cron, which also means every :00/:15/:30/:45 minute in Bangladesh time).
6. Confirm the deployed site only includes articles marked Published in `schedule.csv`.

## Schedule CSV
Columns:
`PostID,Slug,PublishDateTime,Timezone,BatchID,Status,HTMLPath`

- `Published` rows are included on the site immediately.
- `Scheduled` rows become Published when `PublishDateTime <= current time` in their listed timezone.
- Use a unique `PostID` and a correct, existing `HTMLPath` for each article.
- The workflow commits the updated CSV back to `main`.

## Important behavior and constraints
- This is a demo implementation for the current 21-article site. It is not yet the production 21,000-post system.
- GitHub Pages deployments are serialized with a concurrency group. Due batch selection can proceed on each run, but publishing artifacts to the same Pages site must not run in parallel; parallel deployments can overwrite each other.
- If a workflow fails before schedule.csv is committed, the next 15-minute run will re-evaluate due posts and try again. This demo does not yet implement the requested special policy of waiting one hour before the first retry and then retrying every 15 minutes; that needs durable per-batch retry state and a separate worker/queue.
- The current schedule workbook's 21 demo rows were copied to CSV. Keep demo dates for testing; replace them with the production schedule only after the test works.
- The existing HTML has its own paths and category pages. Always test direct article URLs, homepage cards, category pages, sitemap, and browser refresh after deployment.
- Do not enable indexing for the 21-post demo until you deliberately remove noindex directives and create a valid production sitemap/robots.txt.
