# IEEE EPS Penn State – Forms v6.2

This update modifies only `src/main.jsx` in the website. It preserves the rest of the page layout, Storyblok schema/content, GitHub calendar, and styles. Based on v6.1 form-fix source.

## Improvements
- Professional success message on **all three forms**: “Thank you for your submission. We will reach out to you using the email address you provided.”
- Required name, email and inquiry type on Contact, Partnership and Join the Chapter. Each form's dropdown has an unselected placeholder, so visitors must choose. Existing other fields remain.
- Browser validation and trimming for names/emails.
- Cloudflare Turnstile widget (when configured) with AJAX token passed to Formspree for server verification, plus a Formspree `_gotcha` spam honeypot.
- Form submit remains working when Turnstile isn't yet set up, but **the visible Turnstile verification is not active until both Cloudflare and Formspree settings are completed.** Enable Formspree's built-in spam protection at minimum.

## Connect Turnstile (free)
1. Open https://dash.cloudflare.com/turnstile . Create a widget `IEEE EPS Website`, hostname `pennstateeps.github.io`, Managed mode. Cloudflare provides a **Site Key** and **Secret Key**.
2. In Formspree, open *each* form → Settings → CAPTCHA / Spam protection → Enable → Cloudflare Turnstile → paste the **Secret Key** into Formspree (not GitHub). Repeat for Contact, Sponsorship and Join forms. See https://help.formspree.io/articles/form-and-project-settings/protecting-your-forms-with-cloudflare-turnstile .
3. In GitHub repository Settings → Secrets and variables → Actions → **Variables**, create `VITE_TURNSTILE_SITE_KEY` with the Cloudflare **Site Key** (public).
4. Edit `.github/workflows/deploy.yml` in the existing Build website step, under its `env:` block. Add just this line (preserving your other variables):
   `VITE_TURNSTILE_SITE_KEY: ${{ vars.VITE_TURNSTILE_SITE_KEY }}`
5. Replace ONLY `src/main.jsx` with the version provided in this package. Commit. Run the existing Deploy IEEE EPS website workflow.
6. Visit the public website, open all three modals, verify the Turnstile widget appears, submit a test record, and confirm it appears in the correct Formspree inbox. A Cloudflare verification token is sent with the form and verified by Formspree.

**Security:** Never put the Cloudflare **Secret Key**, Storyblok management key, or Google Cloud privileged credentials in any `VITE_` variable or public GitHub source. Public Site Keys are designed to be included in the website. Client-side `required` inputs do not stop direct bot requests; effective protection depends on enabling Formspree's server-side CAPTCHA verification.

**No paid service necessary:** Cloudflare Turnstile has a free plan, and Formspree lists custom reCAPTCHA/CAPTCHA under its free plan. Check your account's exact limits.

## Quality checks
- React/JSX source updated; full compilation is **not verified** in this environment. GitHub Actions will perform the build check after upload.
- No live Formspree submissions were sent by this build script; test the public site after deployment.
- Existing Storyblok content is untouched.
