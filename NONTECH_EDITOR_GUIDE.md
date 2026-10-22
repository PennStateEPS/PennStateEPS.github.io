# How to edit the IEEE EPS website (no coding required)

**You do not need to learn GitHub, HTML, or programming.** Keep this quick reference with every new committee.

## Update website text, photos, or layout

1. Sign into your chapter's **Builder Content** workspace.
2. Open **Content → Home page**.
3. Click an existing text/image block and edit the text, picture, or link in the right-hand settings panel.
4. To rearrange sections, drag them into a different order. To add an approved design element, use **Insert → Custom Components**.
5. Switch to mobile preview and make sure it still looks good.
6. Click **Publish**. Content updates on the live site without touching the source code.

**Important:** Don't delete the `EPS / Events & Calendar` block unless you intend to remove the calendar from the site. Don't publish a partially rebuilt page; first confirm all major blocks are present.

## Announce a new seminar or workshop

1. Open the **IEEE EPS Penn State events calendar** in Google Calendar.
2. Add the event and specify title, date, time, location, and public description.
3. Make sure it is saved to the public **chapter events calendar** (not your personal calendar).
4. Save. The website will load the event into the next-event banner, event list, and interactive calendar, generally within a few minutes for existing visitors.

To postpone or cancel an event, update or cancel the same Google Calendar event. Do not create a duplicate entry elsewhere.

## Add an event highlight or photo album

1. Open Builder Content → Home page.
2. Click the `EPS / Highlights` block.
3. Add a verified event record with a title, event date, one-paragraph description, cover picture, and link to the *publicly shared* album.
4. Check that photos and attendees can be publicly shared, then Publish.

## Update leadership after an election

1. Open Builder Content → Home page → `EPS / Leadership`.
2. Update each name, position, and optional photo/LinkedIn URL.
3. Remove outgoing officers and add incoming ones; change the interim status text through a developer if the chapter's governance status changes.
4. Publish after another committee member checks the list.

## Add a confirmed sponsor

1. Verify permission to publicly display the organization's name and logo.
2. Open Builder Content → `EPS / Partners`.
3. Add the organization's name, logo, and website URL.
4. Publish. Never add potential or unconfirmed sponsors.

## Read inquiries and membership interest

1. Sign into the chapter's **Formspree** workspace.
2. Open Contact, Partnership, or Join.
3. Review submissions and respond from the designated chapter inbox.
4. Do not publish students' personal contact information on the public website.

## What to do when something looks broken

- **Event not visible:** Confirm it is on the public chapter Google Calendar, wait five minutes, reload. If still missing, ask the technical site maintainer to check calendar API configuration.
- **Contact form won't send:** Ask the site maintainer to check the appropriate Formspree form endpoint and dashboard.
- **Builder preview blank:** Verify the Builder page preview URL and whether the page has the necessary EPS blocks.
- **A section vanished:** Check the Builder revision history and whether someone removed its block.
- **Brand new feature needed:** Ask the technical maintainer; this requires a code change, not a drag-and-drop edit.

## Handover checklist

- [ ] At least two incoming officers have access to Builder Content.
- [ ] At least two officers manage the chapter Google Calendar.
- [ ] At least two officers receive Formspree form notifications.
- [ ] The GitHub account has two-factor authentication and a documented officer-only access/recovery handoff; plan a transition to organization ownership with separate approved owners.
- [ ] Outgoing administrators transfer credentials/permissions securely.
- [ ] All public content and partner permissions have been checked.
