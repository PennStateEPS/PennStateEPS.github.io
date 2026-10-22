# START HERE — IEEE EPS Penn State website

**Chapter contact address:** psu.ieee.eps@gmail.com

This repository contains a React/Vite website ready for an initial GitHub Pages deployment. It also has optional integration points for Builder Content (visual editing), Google Calendar (events), and Formspree (submissions). The source files have been prepared but the live build and integrations are **not yet verified**; use the first GitHub Actions build to check deployment.

## Phase 1 — Publish to the existing PennStateEPS GitHub repository

Your dedicated GitHub account is **`PennStateEPS`**, and your newly created public repository should be **`PennStateEPS.github.io`**. Your planned site URL is **https://pennstateeps.github.io/**.

1. Download and extract `IEEE_EPS_Penn_State_Website_Starter.zip` to a normal folder on your computer.
2. Open **https://github.com/PennStateEPS/PennStateEPS.github.io** and verify that you are signed in to the correct account.
3. On the empty repository page click **uploading an existing file**. If it is not shown, click **Add file → Upload files**.
4. Drag the **contents of the extracted project folder**, not the ZIP and not the enclosing folder, onto GitHub. It is important that the `.github/workflows/deploy.yml`, `src/`, `public/`, `package.json`, and `index.html` paths are preserved.
5. Scroll down, choose **Commit directly to the main branch**, and click **Commit changes**.
6. Open repository **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**.
7. Go to the **Actions** tab, open **Deploy IEEE EPS website**, and confirm the build and deploy jobs succeed. If the workflow has not started, choose **Run workflow** if available.
8. Visit **https://pennstateeps.github.io/** in a browser and verify the homepage loads.

If deployment fails, open the failed job and copy its error log. Do not add random configuration changes before identifying the failure. The starter dependencies have not yet been installed or built in this preparation environment.

**Important:** This GitHub login is a personal account named for the chapter, not a GitHub organization. Later we should add trusted recovery contacts, enable 2FA, and consider transferring the repository to a chapter-controlled GitHub organization to avoid shared credentials.

## Phase 2 — Make the site editable visually

1. Create a Builder **Content / Visual CMS** space at https://builder.io (not a different AI coding-only product).
2. Copy the space's **public API key**.
3. In GitHub repo **Settings > Secrets and variables > Actions > Variables**, create `VITE_BUILDER_API_KEY` with that public key. (It is designed to be public; never place a private API token here.)
4. Re-run the deployment workflow.
5. In Builder Content create a `page` entry targeted to `/`, and set its preview URL to the **live GitHub Pages address**.
6. Drag in the chapter components: Hero; About; Events & Calendar; Highlights; Event Archive; Partners; Leadership; Join Callout; Contact & FAQ.
7. Publish the page. Visual edits and section reorderings can now be published inside Builder without Git commits. If only one block is published, the site will only show that block; assemble the page before publishing.

## Phase 3 — Live data and forms

1. Sign in to Google Calendar with **psu.ieee.eps@gmail.com**. Create a **separate, public-events-only** calendar, not a public copy of private chapter meetings.
2. In Google Cloud enable Google Calendar API, create a browser API key, restrict it to the production site's HTTP referrer and the Google Calendar API.
3. In GitHub Actions Variables add `VITE_GOOGLE_CALENDAR_ID` and `VITE_GOOGLE_API_KEY` (and optionally `VITE_CALENDAR_PUBLIC_URL`). Deploy once.
4. Create three Formspree forms: **Contact**, **Partnership**, **Join**. Assign the notification recipient **psu.ieee.eps@gmail.com**.
5. Add variables `VITE_FORMSPREE_CONTACT_ID`, `VITE_FORMSPREE_SPONSOR_ID`, `VITE_FORMSPREE_JOIN_ID` with the IDs only (not the full endpoints). Deploy once.
6. Submit test forms, add a test Calendar event, and confirm the countdown and Week / Month / Semester controls update correctly.

## Phase 4 — Committee handoff

Arrange access and account recovery with at least two approved chapter officers; consider moving the website to a chapter-controlled GitHub organization with two separate owners. Add future committee editors to Builder with the minimum needed editing permissions. Let committee members manage Google Calendar, Builder content, and Formspree without touching repository code. Record account recovery and role-transfer procedures in the private chapter handover documentation.

See `README.md` for technical details and `NONTECH_EDITOR_GUIDE.md` for instructions suitable for nontechnical editors.
