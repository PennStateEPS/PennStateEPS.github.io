# IEEE EPS Storyblok v2 — Diagnostic Fix

**Purpose:** show why Storyblok is not updating and load published content reliably.

## Upload just ONE file

Replace `src/main.jsx` in the GitHub repository with `src/main.jsx` from this package. Do not change `src/content.js`, the CSS, the workflow or the calendar code.

**GitHub browser:** Code → src → main.jsx → pencil (Edit) → replace the file content → Commit changes. If using GitHub Upload files, drag the `src` folder (not the whole archive) onto your repository's Add file → Upload files area and confirm it replaces `src/main.jsx` in place.

## Test

1. Wait for GitHub Actions to show a successful **Deploy IEEE EPS website** run.
2. Open `https://pennstateeps.github.io/?cmsdebug=1` and hard-refresh.
3. A small panel at the top right reports the actual connection status. No token is printed.
4. If **Public token: MISSING**: the GitHub Actions build is not receiving `VITE_STORYBLOK_PUBLIC_TOKEN`; verify repository Actions Variables and the workflow's build step env.
5. If **HTTP 401**: incorrect token; use the Public Content Delivery API token. If **HTTP 404**: publish the Home story or verify slug `home`.
6. If **No block with technical name hero**: verify the block technical name in Storyblok, not its display label.
7. If **CONNECTED**: the website is loading Storyblok! Publish a changed description; refresh the website. Storyblok's visual editor should update via its Bridge when available.

When everything works, open the normal site URL without `?cmsdebug=1` to hide the panel.

## Important

The page remains visible with its original Hero while any API issue persists. This is a debugging feature, not proof of a successful CMS connection. Draft content remains private because the public website uses the Public token.
