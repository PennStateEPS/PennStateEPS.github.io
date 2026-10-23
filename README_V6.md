# IEEE EPS branding and fixed-text editor — v6

This small additive update modifies the v5 website without altering its page design, calendars, forms, sponsor/leadership data, existing Storyblok content, or section order.

## 1. Upload to GitHub
Upload everything inside this folder to https://github.com/PennStateEPS/PennStateEPS.github.io, preserving paths. Replace matching files. Commit to `main`.

Updated files:
- `src/main.jsx` (logo, favicon and editable static text bindings)
- `src/styles.css` (logo sizing only; existing styles preserved)
- `scripts/storyblok-schema.mjs` (new global fields and illustration labels)
- `scripts/setup-storyblok-v5.mjs` (additive, non-destructive migration)
- `scripts/setup-storyblok.mjs` (same migration for the existing one-time workflow)
- `.github/workflows/storyblok-v5.yml` (unchanged workflow included for completeness)

**Do not delete** any other files or overwrite your `.github/workflows/deploy.yml`, `src/content.js`, `src/calendar.js`, or environment variables.

Check GitHub Actions for green `Deploy IEEE EPS website` and `IEEE EPS CMS v5 – Expand visual editor` workflows.
If the migration does not trigger automatically, run the **existing** `Configure Storyblok CMS (one time)` manually. It now invokes this additive migration too. The Storyblok migration requires the private GitHub Actions secret `STORYBLOK_MANAGEMENT_TOKEN`; do not place it in code or share it.

## 2. Publish and edit
In Storyblok → Content → Home, select the **Page** root component (not Hero). New global fields include:
- Branding · Chapter logo
- Branding · Logo layout (mark + title / full image)
- Branding · Browser tab favicon
- Top strip, chapter subtitle, navigation labels and join button label
- Event-banner text and no-event messages
- Both footer text lines

For the decorative chip/circuit illustration text, select **Homepage Hero** and open the `Illustration · ...` fields. This preserves its look while allowing all the labels to change.

Upload a logo as a transparent PNG/WebP or SVG (from an authorized chapter asset). For the favicon use a square 64×64 PNG, SVG, or similar image, visually simple enough for a tiny browser tab. Select the uploaded images using Storyblok's image fields. Under `Branding · Logo layout`, choose **Logo mark + chapter name** if it is an icon, or **Complete logo only** if the image itself includes the full name.

Then **Save → Publish** the Home story and reload the website (Ctrl+Shift+R). Favicons sometimes remain cached by browsers; test an incognito window if needed.

No ongoing GitHub commits are needed for ordinary Storyblok edits.

## Troubleshooting
- The two branding assets must have `https://` URLs delivered by Storyblok. Assets from the image field are converted from objects using their `filename` property.
- If global fields are missing, check the migration job log and `STORYBLOK_MANAGEMENT_TOKEN`. The website build alone does not add Storyblok fields.
- Storyblok Home story `page` root owns the global fields; `hero` owns illustration labels. Other v5 blocks stay as they were.
- This package is additive and does not upload changes to your actual GitHub repository by itself.
