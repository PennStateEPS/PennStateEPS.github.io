# IEEE EPS Penn State — Full Storyblok CMS upgrade v4

**Website:** https://pennstateeps.github.io/
**GitHub:** https://github.com/PennStateEPS/PennStateEPS.github.io
**Existing Storyblok Space:** IEEE EPS Penn State (EU)

This is an **overlay update**, not a new website. It preserves your published Hero, existing design, CSS, content.js (including your latest committee edits), calendar and forms.

## A. Upload ONE package to GitHub

1. Extract the ZIP archive.
2. Open your GitHub repository → **Add file → Upload files**.
3. Drag **the contents of this package** (the `src`, `scripts`, `.github` folders) into the upload area. Do **not** upload the outer folder or ZIP file.
4. Confirm the upload paths include the exact following files and choose **Commit changes**:

   - `src/main.jsx` (replace the earlier version)
   - `scripts/storyblok-schema.mjs` (new)
   - `scripts/setup-storyblok.mjs` (new)
   - `.github/workflows/storyblok-setup.yml` (new)

**Very important:** Do NOT overwrite `src/content.js`, `src/styles.css`, `package.json`, or `.github/workflows/deploy.yml`. Their current versions are preserved.

> Hidden `.github` folder: If Windows drag-and-drop leaves this out, create the new GitHub file manually at `.github/workflows/storyblok-setup.yml` using the included file's contents.

GitHub Actions will build/deploy the upgraded code automatically. Check the green check at your repo **Actions** tab. The existing public homepage remains intact before the Storyblok story is updated.

## B. Generate a Storyblok Management API token (ONE-TIME ONLY)

Your existing **public delivery token** is for the website and is already working. Do not reuse it here.

1. In Storyblok, open **My account → Account settings → Personal access tokens → Generate New Token**.
2. Name it `IEEE EPS one-time CMS setup`. Set an expiry and scope it to **only the IEEE EPS Penn State Space** with the **Components** and **Stories** read/write permissions. The token must have permission to list, create and update components, plus read and update stories.
3. Copy it ONCE. **Never paste it into a public repository, website file, screenshot, or chat.**
4. On GitHub, open **Settings → Secrets and variables → Actions → Secrets → New repository secret**.
5. Name the secret exactly `STORYBLOK_MANAGEMENT_TOKEN`; paste the token as the secret VALUE; save.

## C. Run the ONE-TIME CMS configuration

1. Open **Actions → Configure Storyblok CMS (one time) → Run workflow** and run against `main`.
2. Wait for a green check. The script will:
   - safely **add** any missing fields to existing `page`, `hero`, and `about_section` blocks,
   - create the remaining nested blocks and section blocks,
   - preserve existing Home Storyblok content (including your already edited Hero),
   - add missing homepage sections in a useful order,
   - seed real committee information from the **current repo `src/content.js`** and FAQs,
   - save the complete `Home` **as a draft** (without publishing).
3. If the workflow fails, open the failed **setup** step to see the error. Check token permissions, selected Space, and secret spelling. The script will NOT print your token.

To reduce risk, the script updates existing block schemas by merging fields rather than replacing them, does not delete blocks, and saves the story as a **draft**. Review before publishing.

## D. Publish full CMS layout

1. In Storyblok open **Content → Home**.
2. Confirm Body contains the nine sections below and that the leadership names/roles reflect the chapter's approved roster.
3. Reorder the sections by dragging their handles, or change any heading, committee card, sponsor list or FAQ.
4. Click **Save → Publish**.
5. Open https://pennstateeps.github.io/?cmsdebug=1 and verify `CONNECTED` and the extended Body block list.
6. Edit any heading in Storyblok, publish it, and reload the plain website URL. You should not need a Git commit for content changes.

### Included Body blocks

1. Homepage Hero (`hero`)
2. About the Chapter (`about_section`) containing editable Mission Cards (`mission_card`)
3. Events & Calendar (`events_section`) **event data from Google Calendar**
4. Highlights & Photos (`highlights_section`) containing image cards (`highlight_item`)
5. Past Events Archive (`archive_section`) **past event data from Google Calendar**
6. Sponsorship & Partners (`partners_section`) containing partner cards (`partner_item`)
7. Leadership & Committee (`team_section`) containing profile cards (`team_member`)
8. Join the Chapter (`join_section`)
9. Contact & FAQ (`contact_section`) containing FAQ cards (`faq_item`)

**Important:** The initial migration sets `full_cms_layout = true` when published, so removing a section from Body then removes it from the website. This is intentional. Keep the Hero in Body so your homepage retains its top banner.

## E. External integrations: configure only when you're ready

Storyblok edits descriptions, cards and section order; it does **not** send emails or host the chapter's Google Calendar.

### Google Calendar (for real upcoming events, countdown, month/week/semester, archive)

1. Create a **separate PUBLIC calendar for chapter events** in Google Calendar. Do not make your personal calendar public.
2. Copy its Calendar ID from **Calendar Settings → Integrate calendar**.
3. In Google Cloud Console enable **Google Calendar API** for a project and create a **browser API key**. Restrict its allowed websites to `https://pennstateeps.github.io/*` (HTTP referrer restriction) and restrict API use to **Google Calendar API**.
4. In GitHub **Settings → Secrets and variables → Actions → Variables**, add:

   - `VITE_GOOGLE_CALENDAR_ID` = public chapter calendar ID
   - `VITE_GOOGLE_API_KEY` = restricted browser API key
   - `VITE_CALENDAR_PUBLIC_URL` = public Google Calendar link (optional)

5. Run **Deploy IEEE EPS website** workflow once to bake these into Vite. Calendar event changes afterward sync without Git commits; the website caches responses briefly in the browser.

**Privacy:** a public Calendar and browser API key are publicly accessible. Never place private meeting information in that public Calendar. Restrict the API key; the browser can always inspect any `VITE_` variable.

### Formspree (real contact, sponsorship, membership forms)

1. In https://formspree.io sign up using `psu.ieee.eps@gmail.com`.
2. Create three forms (Contact, Sponsor, Join). Configure spam protection, confirmation, and notifications to the chapter email in Formspree.
3. Enter their **form endpoint IDs** (not full URLs) in GitHub Actions Variables:

   - `VITE_FORMSPREE_CONTACT_ID`
   - `VITE_FORMSPREE_SPONSOR_ID`
   - `VITE_FORMSPREE_JOIN_ID`

4. Run **Deploy IEEE EPS website** once and submit real TEST inquiries through all three buttons.
5. Configure a privacy notice and consent before collecting visitor information.

**If these are not connected yet**, the website retains its existing elegant empty states. It does not invent events, sponsors, submissions, or registrations.

## F. Handover to future student committees

Open Storyblok → Content → Home:

- Rename/reorder a section: drag the section in Body.
- Edit text: open a section and change its fields.
- Add/change team members: `Leadership & Committee → people → Add Block: Committee Member`.
- Add sponsor: `Sponsorship & Partners → partners → Partner or Sponsor`, upload logo and paste official link.
- Add event photo: `Highlights & Photos → items → Past Event Highlight`, select image and public album URL.
- Schedule an event: add it **only in the public Google Calendar**; do not duplicate in Storyblok.
- Publish: click **Save**, then **Publish**.

After a successful one-time migration, you can delete the `STORYBLOK_MANAGEMENT_TOKEN` GitHub secret. Normal content editors never need it.

## Important release notes

- Only the React source was syntax checked here; the full npm/Vite build and real Storyblok Management API run require your GitHub Actions environment.
- The current repository's newest `src/content.js` was not remotely retrievable in this environment. The one-time migration **reads your actual repository file on GitHub** when it runs to avoid overwriting your most recent committee edits.
- We have NOT modified your GitHub repository or Storyblok account from this chat. The ZIP is ready for you to upload as one commit and run as described above.
