# IEEE EPS Penn State — Storyblok Hero Connection (v1)

Live website: https://pennstateeps.github.io/
Repository: https://github.com/PennStateEPS/PennStateEPS.github.io

## What this update changes

- Connects the existing **Homepage Hero** to the `Home` Storyblok story (`home` slug) and its `hero` block.
- Uses Storyblok's React SDK and Visual Editor bridge.
- Keeps the About, Events, Calendar, Archive, Partners, Team, Contact, and forms sections unchanged.
- Uses only the **Public** read-only Delivery API token. A not-yet-published Home story leaves the existing hero unchanged.
- Removes the older Builder.io dependency.

## Step A — Upload four replacement files

Extract the ZIP. On your existing GitHub repository, replace these four paths exactly (do not put everything in a new parent folder):

1. `src/main.jsx`
2. `package.json`
3. `.github/workflows/deploy.yml`
4. `.env.example` (documentation only, no credentials)

To avoid accidental duplicates, delete the originals and upload the replacements, or edit each existing file using GitHub's pencil button and paste the supplied contents. Keep all other existing files unchanged. Commit to `main`.

## Step B — Storyblok: get the correct token

Storyblok Space > Settings > Access Tokens. Copy/create a **Public** Delivery API token, NOT the Preview token, CLI token, personal token, or Management API token.

Confirm your Space's region (EU, US, CA, AP or CN).

## Step C — GitHub Actions variables

Repository > Settings > Secrets and variables > Actions > **Variables**. Create:

- `VITE_STORYBLOK_PUBLIC_TOKEN` = your **Public** read-only Delivery API token
- `VITE_STORYBLOK_REGION` = `us`, `eu`, `ca`, `ap`, or `cn` as appropriate

These VITE variables are **public in the website bundle**. Never put administrative or Preview tokens there.

Run the existing Deploy IEEE EPS website workflow once more after setting the variables.

## Step D — Publish the Home story and test

In Storyblok > Content > Home, leave only the already-created `Homepage Hero` block inside the Page's `body` field. Fill the eight fields, then **Publish** Home. Publishing this one Hero does NOT delete other website sections; they stay in React.

After GitHub Pages deployment finishes, refresh https://pennstateeps.github.io/ . The Hero should now use the Storyblok text. To verify, edit the Hero headline and Publish again; the live site should update without a GitHub commit (the Content Delivery CDN may cache briefly).

## Step E — Visual Editor URL

In Storyblok > Settings > Visual Editor, set the preview environment URL to `https://pennstateeps.github.io/` (HTTPS). In the Home story's Config, set the **Real path** to `/` if Storyblok tries `https://pennstateeps.github.io/home`. GitHub Pages does not serve `/home` as a frontend route.

Because this static public site uses a Public token, a standalone iframe loads the last **published** version. Once the saved, published story is loaded in the iframe, Storyblok Bridge should receive live editing events. For a fully private unpublished-draft preview, a separate backend preview environment is required; do not put a Preview token in the GitHub Pages frontend.

## If the site breaks or goes blank

Open GitHub > Actions > latest workflow and check the build error. To immediately roll back, use GitHub History to revert the change to the four paths. No Storyblok settings or content changes will delete the existing About/Events/Team/Contact section code.

Note: Package installation/build could not be run in the artifact environment because npm registry access was unavailable. The React SDK integration follows official Storyblok documentation, but the first GitHub Actions run must confirm the build.
