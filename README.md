# IEEE EPS Student Branch Chapter at Penn State 

Website: **https://pennstateeps.github.io/**  
Contact: **psu.ieee.eps@gmail.com**  
LinkedIn: **https://www.linkedin.com/company/psueps**

The website for the IEEE Electronics Packaging Society (EPS) Penn State Student Chapter at The Pennsylvania State University. It brings together chapter information, upcoming technical events, previous activities, leadership, partnership opportunities, and visitor inquiries in one place.

The site is built with React and Vite, hosted on GitHub Pages, and maintained primarily through Storyblok and Google Calendar. Routine content and event updates do not require edits to the GitHub repository.

## Features

- **Chapter information:** introduction, mission, technical focus areas, leadership, and contact details.
- **Visual content editing:** page sections, copy, navigation labels, colors, images, chapter logo, favicon, profiles, sponsor information, highlights, and FAQs through Storyblok.
- **Upcoming events:** Google Calendar-powered listings, event details, and a countdown to the next scheduled event.
- **Chapter calendar:** month, week, and semester views, backed by the public chapter Google Calendar.
- **Event archive:** completed calendar events are listed automatically within the configured retrieval period; editorial highlights and photo galleries are managed separately in Storyblok.
- **Visitor inquiries:** contact, partnership, and chapter-interest forms routed through Formspree, with input validation and Cloudflare Turnstile bot protection.
- **Responsive interface:** desktop and mobile layouts with custom electronics-packaging-themed artwork.

## Technology

| Service | Purpose |
| --- | --- |
| React + Vite | Website interface and frontend build |
| Storyblok | Editable content, reusable sections, and visual publishing |
| Google Calendar API | Public event data, calendar views, and countdown |
| Formspree | Form submissions and email notifications |
| Cloudflare Turnstile | CAPTCHA verification for form submissions |
| GitHub Pages + Actions | Hosting and automated deployment |

The website is a static frontend. Event content and form submissions are delivered through the services listed above; there is no separate application server in this repository.

## Routine updates

### Page content and branding

Open **Storyblok → IEEE EPS Penn State → Content → Home**. Edit the relevant section, then **Save** and **Publish**. Supported sections can be reordered in the page's Body field. The page-level settings include common branding and site text, such as the logo, favicon, navigation, and footer.

Content changes published in Storyblok are fetched by the website without a new GitHub commit. New frontend behaviors, component types, or code-level changes still require a repository update.

### Events

Create and maintain public chapter events in the dedicated **IEEE EPS Penn State — Events** Google Calendar. The same source drives the next-event display, interactive calendar, and completed-event archive. Edits become visible as the website fetches fresh data; the current implementation caches events in the visitor's browser session for approximately five minutes. An already-open page may need refreshing.

The archive is a live view of the Google Calendar data, **not a permanent historical database**. Deleted events disappear, and older events outside the API's retrieval window are not included. Use Storyblok event highlights for curated summaries, photographs, and album links.

### Contact, partnership, and chapter-interest inquiries

Submissions are handled by three independent Formspree forms. Review received messages and notification settings in the Formspree dashboard. Cloudflare Turnstile should remain enabled and server-side verification must stay configured in Formspree. Do not put CAPTCHA secret keys in the repository.

## Local development

Requires Node.js and npm (Node.js 22 or a currently supported compatible version).

```bash
npm install
npm run dev
```

Open the local address shown by Vite. Before submitting changes:

```bash
npm run build
```

For local integration testing, create an untracked `.env.local` file with the required **public** frontend configuration values. Never commit `.env.local` or private service credentials.

## Deployment

The main branch deploys to **https://pennstateeps.github.io/** through `.github/workflows/deploy.yml`.

1. Commit changes to `main`.
2. Open **GitHub → Actions → Deploy IEEE EPS website**.
3. Verify a successful build and deployment, then test the published website.

Changing a GitHub Actions variable requires a new website build. Publishing Storyblok content or updating a Google Calendar event does not.

### GitHub Actions configuration

The following repository **Variables** are used by the deployed frontend:

| Variable | Description |
| --- | --- |
| `VITE_STORYBLOK_PUBLIC_TOKEN` | Read-only Storyblok delivery token for published content |
| `VITE_STORYBLOK_REGION` | Storyblok content region (currently `eu`) |
| `VITE_GOOGLE_CALENDAR_ID` | ID of the dedicated public chapter calendar |
| `VITE_GOOGLE_API_KEY` | Browser API key restricted by Google Cloud HTTP referrer and Google Calendar API |
| `VITE_CALENDAR_PUBLIC_URL` | Complete public Google Calendar link |
| `VITE_FORMSPREE_CONTACT_ID` | General contact form ID |
| `VITE_FORMSPREE_SPONSOR_ID` | Partnership inquiry form ID |
| `VITE_FORMSPREE_JOIN_ID` | Chapter-interest form ID |
| `VITE_TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile site key |

These values are built into the client-side application and must be appropriate for public exposure. The Google API key must be appropriately restricted.

The Storyblok **Management API token** is different from its public delivery token. If a Storyblok schema migration is necessary, supply the management token only through a restricted GitHub Actions **Secret** named `STORYBLOK_MANAGEMENT_TOKEN`. It is not required for ordinary publishing and should not be committed, exposed through a `VITE_` variable, or shared with site visitors.

## Repository structure

```text
.github/workflows/    Website deployment and optional CMS migration workflows
public/              Static assets and fallback favicon
scripts/             Storyblok schema and migration utilities
src/
  main.jsx           React application and Storyblok-driven components
  styles.css         Website styling
  calendar.js        Google Calendar integration and date utilities
  content.js         Default chapter information and fallback content
index.html           HTML entry point
package.json         Application dependencies and npm scripts
vite.config.js       Vite configuration
README.md            Project documentation
```

Some folders also contain optional maintenance or editing documentation. Older setup notes from earlier development versions are not needed for production hosting.

## Maintenance and handover

Access to the GitHub account alone is not sufficient for routine site administration. A future committee should be given the appropriate access to Storyblok, the chapter Google Calendar, Formspree, Cloudflare Turnstile, and Google Cloud as needed. Use individual accounts and role-based permissions where supported; keep recovery methods and two-factor authentication up to date.

Before major schema or code changes, back up the Storyblok content and verify that the previous GitHub deployment works. Test all three forms, event synchronization, mobile layout, and navigation after significant releases.

For errors, check the failing GitHub Actions job first. The website's `?cmsdebug=1` query parameter displays the Storyblok published-content connection status for troubleshooting.

## Chapter

Established September 28, 2026. The chapter supports technical learning, collaboration, and professional development in semiconductor packaging, heterogeneous integration, microelectronics, and related fields.

The website is maintained for the IEEE EPS Student Branch Chapter at Penn State. IEEE and Penn State names and marks belong to their respective owners.

## Developed By

Md Rayid Hasan Mojumder (on Oct 23, 2026), Founding Chair, IEEE EPS Student Branch Chapter at Penn State. For more information about the developer, vist - https://rayidmojumder.github.io/
