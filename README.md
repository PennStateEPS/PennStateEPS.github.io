# IEEE EPS Penn State — custom website

A fast, responsive IEEE EPS Penn State Student Chapter website with a real event calendar, live event countdown, searchable event archive, member/partner/contact forms, custom leadership and sponsor sections, and **Builder.io visual drag-and-drop editing**.

## What is genuinely implemented?

| Feature | Works after GitHub deploy? | External setup needed? |
|---|---|---|
| Full responsive website and navigation | Yes | No |
| Semester / Month / Week calendar controls | Yes | Google Calendar for real events |
| Upcoming event cards, dynamic event modal, event archive | Yes | Google Calendar for real events |
| Live next-event countdown | Yes | Starts when a future event is available |
| Join / sponsor / contact forms and confirmation | Yes | Configure Formspree IDs |
| Leadership and current chapter identity | Yes | Optional portraits |
| Highlights and confirmed partners | Yes | Populate verified items through Builder |
| Drag, drop, reorder, and edit website components | Yes, after integration | Builder.io Content account and public API key |
| GitHub Pages publishing | Prepared | Upload repository and enable Pages |

**Important:** No user accounts or third-party accounts have been connected in this package. The code and deployment workflow are supplied, but the live connections must be authorized by their owners. There are deliberately no fictional events or partner logos.

## Architecture

- **GitHub Pages:** static hosting and source code.
- **React + Vite:** custom site, navigation, events UI, and functional widgets.
- **Builder Content:** third-party visual drag/drop editor. All core site blocks are registered as custom components. Once configured, the Builder page can replace the built-in homepage without any new Git commits for ordinary content changes.
- **Google Calendar:** the only scheduling source. The site reads public calendar events with the read-only Calendar API.
- **Formspree:** submissions and email notifications; administrators manage inboxes and notifications in Formspree.

## 1. Run locally

Install Node.js 22+ and open a terminal at this repository root.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit the local address printed by Vite (typically `http://localhost:5173`). This package was created without installing remote npm packages in the creation environment; run `npm install` in an internet-enabled environment and verify the resulting build with `npm run build`.

## 2. Deploy to GitHub Pages

1. Use the existing **PennStateEPS** GitHub account and its public repository named exactly **PennStateEPS.github.io**, publishing at **https://pennstateeps.github.io/**. See `START_HERE.md` for upload instructions.
2. Upload **the contents** of this folder, including `.github/workflows/deploy.yml`, to the main branch. Hidden files must be included.
3. In the repo, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Push to `main`, or run the workflow from the Actions tab. The workflow installs dependencies, builds Vite, and publishes `dist`.
5. Test the live URL on desktop and mobile.

The relative asset paths in `vite.config.js` allow this build to run on both root and project GitHub Pages URLs. Keep Builder's home page model targeted at `/`, and set its visual editor preview URL to the **actual published URL** (including the GitHub repository subpath if applicable).

## 3. Connect Builder.io to enable true visual editing

1. Open [Builder.io](https://builder.io) and create a **Builder Content / Visual CMS** space, not merely a code-generation project.
2. Copy its **public API key** (not a private key).
3. In GitHub repository **Settings → Secrets and variables → Actions → Variables**, add `VITE_BUILDER_API_KEY` with that public key. For local development, add it to `.env.local` instead.
4. Run GitHub Pages deploy again once, to compile this public configuration into the static app.
5. Open Builder Content → create/open the standard **Page** model → create an entry targeting URL `/`.
6. Set the page's **Preview URL** to the deployed GitHub Pages URL. When hosted under a `/repository/` prefix, preview that exact URL. If Builder tries to navigate to a URL unavailable on the static site, turn off **Reload preview on URL path change** in Builder's advanced settings and use the fixed preview URL. See the [official preview URL guide](https://www.builder.io/c/docs/guides/preview-url).
7. Under **Insert → Custom Components**, these blocks should appear:
   - EPS / Hero
   - EPS / About
   - EPS / Events & Calendar
   - EPS / Highlights
   - EPS / Event Archive
   - EPS / Partners
   - EPS / Leadership
   - EPS / Join Callout
   - EPS / Contact & FAQ
8. Drag all the blocks onto the page **in that order**. Select any block to change its editable fields and rearrange blocks visually. Preview at desktop, tablet, and mobile widths.
9. Publish the Builder page. The live site will then use the Builder-managed blocks, preserving working event and form behaviors.

**Publishing rule:** The site shows its prebuilt fallback homepage until a Builder `page` entry is published. Once Builder publishes a page targeted to `/`, that page becomes the primary body between the fixed header and footer. If a Builder page contains only the hero, only the hero will show. Add all required blocks before publishing.

**Live changes without Git:** After the Builder key is installed once, authorized editors update text, pictures, links, block ordering, and list content inside Builder. Builder publishes through its CDN; no committee member needs to push code to GitHub for those changes.

**What still needs code:** New kinds of complex widgets, custom behavior changes, changes to the global header/footer, or adding new Builder component fields require a developer. Visual editors make content/approved layouts editable; they do not magically eliminate all programming.

## 4. Connect Google Calendar

1. Create a **separate chapter events Google Calendar**. Avoid using a personal/private calendar.
2. Make only the chapter events calendar publicly viewable. Never place private meeting information in this calendar.
3. From its settings, copy the **Calendar ID**.
4. In Google Cloud Console, create a Google Cloud project, enable **Google Calendar API**, and create a browser API key.
5. Restrict that API key by **HTTP referrer** to the production site (and localhost for local testing as appropriate), and restrict APIs to **Google Calendar API**.
6. In GitHub Actions **Variables** set:
   - `VITE_GOOGLE_CALENDAR_ID` = public Calendar ID.
   - `VITE_GOOGLE_API_KEY` = browser key (public, with restrictions).
   - `VITE_CALENDAR_PUBLIC_URL` = optional publicly accessible calendar URL for subscriptions.
7. Run GitHub deployment once to include these settings.
8. Add a test event in Google Calendar, verify it appears in Month / Week / Semester views, then check the automatic upcoming-event card and countdown.

The site requests public event data using the Calendar Events API, expands recurring instances, filters cancelled events, and caches results in the visitor's browser session for five minutes. Calendar changes may therefore take up to five minutes to appear for an existing visitor; fresh visitors get fresh data. Individual Google event descriptions are displayed as plain text, not injected HTML.

**Timezone:** all displayed event times use `America/New_York`.

## 5. Connect the forms

1. Create three forms in [Formspree](https://formspree.io): **Contact**, **Partnership**, and **Join**.
2. Copy each form's endpoint ID (the string after `https://formspree.io/f/`).
3. In GitHub Actions Variables, add:
   - `VITE_FORMSPREE_CONTACT_ID`
   - `VITE_FORMSPREE_SPONSOR_ID`
   - `VITE_FORMSPREE_JOIN_ID`
4. Configure Formspree's notification inbox to `psu.ieee.eps@gmail.com` and set up any acknowledgment emails you want.
5. Deploy GitHub Pages again and test all three forms. Formspree's dashboard stores the submissions. Do not store personal form submissions in a public GitHub repository.

Until an endpoint is configured, the site clearly states that submissions are not connected and shows a direct chapter email alternative. It does **not** falsely claim to have sent a message.

## 6. Visual editing by the next committee

See **[NONTECH_EDITOR_GUIDE.md](./NONTECH_EDITOR_GUIDE.md)**. The guide is written for people who do not know GitHub, HTML, CSS, or React.

## 7. Operations and security

- Keep login access for Github, Builder, Google, and Formspree with chapter-controlled accounts, not one individual's personal credentials.
- Configure at least two approved chapter administrators, and transfer access during each committee election.
- Only verified chapter events, photos, partners, and sponsors should be published.
- Form submissions and email addresses must remain in restricted dashboards; publish a privacy notice before collecting data at scale.
- `VITE_` variables are **not secret**: their values are visible in the site's JavaScript bundle. Never place private API credentials in them.
- Review privacy and cookie implications of third-party editors and forms.
- The site is designed to be accessible, but a full browser/device/assistive-technology audit remains necessary before claiming WCAG compliance.

## Relevant official documentation

- [Builder custom components](https://www.builder.io/c/docs/custom-components-setup)
- [Builder preview URLs](https://www.builder.io/c/docs/guides/preview-url)
- [Vite GitHub Pages deployment](https://vite.dev/guide/static-deploy.html)
- [Google Calendar events.list](https://developers.google.com/calendar/api/v3/reference/events/list)
- [Formspree JavaScript forms](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax)

## Legal / branding note

This is an independent website for an IEEE student chapter. Use the official IEEE, IEEE EPS, and Penn State logo assets only under the applicable brand policies and with necessary authorization. The default site uses an original abstract electronic-interconnect emblem rather than a copied logo.
