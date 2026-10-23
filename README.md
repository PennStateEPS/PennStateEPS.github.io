# IEEE EPS Penn State — Storyblok About Integration v3

This **one-file update** builds on the working Storyblok Fix v2 already deployed.

## Required Storyblok schema
- `about_section` — Nestable block with fields `eyebrow` (Text), `heading` (Text), `description` (Textarea), `pillars` (Blocks; optionally restrict to `mission_card`).
- `mission_card` — Nestable block with fields `title` (Text), `description` (Textarea), `icon` (Single-Option or Text, values `bolt`, `people`, `layers`).
- Home story: `hero` followed by `about_section`, with three `mission_card` blocks inside its `pillars` field.

## Deploy
1. Extract this ZIP and copy `src/main.jsx` over the existing file with the same path in the GitHub repository.
2. Commit to `main`; confirm GitHub Actions build success.
3. In Storyblok save and publish Home. The About section now reads the published Storyblok block.
4. Change the About heading, publish, then refresh the live website to test.

Only `src/main.jsx` changes. Deployment workflow and GitHub variables remain as they were when Hero showed CONNECTED.
If the About block or cards are absent, the existing website About section and its original three mission cards remain visible.

## Notes
- Body section order remains fixed for now to preserve site layout; mission cards can be reordered inside the About block.
- Storyblok's public token reads published content only. A Storyblok in-editor bridge helps with live input events but full preview of unpublished drafts might still require a separate secured preview integration.
- No access tokens or credentials are included.
