# IEEE EPS Penn State — Final Visual Editor v5

**Goal:** Finish the extensive drag-and-drop Storyblok CMS upgrade with exactly two user-facing phases. Live site: https://pennstateeps.github.io/. Existing Storyblok Space and Home page are reused.

## Step 1 — Upload one update and let the workflows run

1. Unzip `IEEE_EPS_Visual_Editor_v5_Final.zip` on your Windows PC.
2. At https://github.com/PennStateEPS/PennStateEPS.github.io choose **Add file → Upload files**.
3. Drag **the contents** of this extracted folder (not the ZIP, not a new outer folder). The paths must be exactly:

   ```
   src/main.jsx                        (replace)
   src/styles.css                       (replace)
   scripts/storyblok-schema.mjs         (replace)
   scripts/setup-storyblok.mjs          (replace — retains the already-working manual setup workflow)
   scripts/setup-storyblok-v5.mjs       (new)
   .github/workflows/storyblok-v5.yml   (new — automation)
   START_HERE_TWO_STEPS.md              (new)
   EDITOR_HANDBOOK.md                   (new)
   ```

4. Commit to `main`. Do **not** replace `src/content.js`, `src/calendar.js`, `package.json`, `.github/workflows/deploy.yml`, or your environment variables. This update depends on those existing working files.
5. Under **GitHub → Actions**, wait for **both** green workflows:
   - `Deploy IEEE EPS website`
   - `IEEE EPS CMS v5 – Expand visual editor`

   **If the new CMS workflow is missing** because GitHub skipped the hidden `.github` folder, don't add a third process: go to the existing **Configure Storyblok CMS (one time)** workflow and click **Run workflow**. We intentionally also updated `scripts/setup-storyblok.mjs`, so this existing workflow runs the same safe v5 migration. It requires the previously configured `STORYBLOK_MANAGEMENT_TOKEN` repository secret.

   **If the CMS job is red**, open `Actions → [failed run] → migrate` and read the first error. Typical cause: `STORYBLOK_MANAGEMENT_TOKEN` was deleted or isn't available in GitHub Repository Secrets. Don't publish a Storyblok draft until both the website deployment and schema setup are green.

**What the script actually does:** Adds new fields to the existing Storyblok component schemas, fills missing optional fields, and saves a **draft** of the existing Home story. It preserves prior Hero text, cards, committee entries, images, logos, FAQs, and the existing section order. It **does not publish**.

## Step 2 — Verify, publish, and hand over

1. Open https://app.storyblok.com/ → **IEEE EPS Penn State → Content → Home**. You should have the existing nine page sections. Select **Homepage Hero** to see new Media and Appearance options; select **About the Chapter** to see editable mission cards and focus tags; select **Leadership & Committee** to see names, roles, photos, biography, and program fields.
2. On the **Page** block (top level), edit global palette, density, width, contact email, and LinkedIn URL if desired. Edit other blocks and drag their order. Avoid inventing chapter events or sponsors.
3. Click **Save → Publish**. Open https://pennstateeps.github.io/?cmsdebug=1 in a new tab. Verify `CONNECTED`, then remove `?cmsdebug=1` for the public URL. Test one content edit and one layout/section order edit, publish again and refresh.
4. For maintenance security, you may delete the one-time `STORYBLOK_MANAGEMENT_TOKEN` GitHub Repository Secret *after* the migration succeeds. It is **not required** for normal Storyblok visual editing. Keep the existing **public, read-only** Content Delivery token in GitHub Variables because the website needs it at build time.

### What v5 makes editable

- **17 Storyblok block types and 153 fields**, including nine rearrangeable webpage sections
- Hero copy, buttons, location, established badge, optional image or technical artwork, next-event visibility
- About intro, quote, technical focus tags, reorderable icon mission cards
- Events section titles, visible components, number of upcoming cards, default Week/Month/Semester selection
- Highlights: real photos, dates, categories, featured labels, gallery links and card ordering
- Archives: titles, maximum entries, search visibility
- Partners: verified logos, labels, web links, collaboration opportunities
- Faculty advisor and full committee member names, portraits, biographies, roles, and LinkedIn links
- Join section CTA and contact details, FAQs and forms' visible labels
- Section background colors, alignment, grids, spacing and visibility; site-wide palette, density and width

### Important boundaries

- This update **does not provision Google Calendar** or **Formspree**. Those services remain functional only if their own `VITE_GOOGLE_CALENDAR_ID`, `VITE_GOOGLE_API_KEY` and Formspree ID variables have already been configured. Your previous website components for both are preserved; without credentials, the calendar has a graceful empty state and the form displays the chapter email instead of submitting.
- The site stays on GitHub Pages. Storyblok changes to **published content** will appear without GitHub commits. New software features still require programming.
- In-editor preview of **unpublished** drafts may be limited by the existing read-only public-delivery integration; never expose an admin/preview token in a public `VITE_*` build variable.
- A full npm/Vite build could not run in the packaging environment because registry access was unavailable. JSX and JavaScript syntax checks and an offline CMS migration test passed. GitHub Actions is the definitive full build test.

### If the site breaks

Revert the most recent website commit using GitHub's commit history. The Storyblok schema upgrade is additive, so previous published content should remain readable by the old site code; Storyblok's Versions panel retains story revisions.
