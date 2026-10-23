# IEEE EPS Penn State — Form Submission Fix v6.1

This is a surgical correction based on the v6 website release. It modifies **only `src/main.jsx`**.

## Fix

The existing React submit handler used `e.currentTarget.reset()` after `await fetch(...)`. React's event `currentTarget` is no longer guaranteed to be non-null by then. Successful Formspree responses could therefore be displayed as errors despite having been delivered.

The patch captures the form element synchronously (`const form=e.currentTarget`), submits `new FormData(form)`, and calls `form.reset()` only after an OK HTTP response. The existing UI then replaces the form with its success message.

## Apply

1. **Before testing again**, check Formspree → Sponsorship Inquiry → Submissions for the message already sent, so you don't create a duplicate.
2. In GitHub, open `src/main.jsx`, click Edit, replace the file contents using the `src/main.jsx` provided here, and commit to `main`.
3. Wait for the existing `Deploy IEEE EPS website` GitHub Actions workflow to finish successfully.
4. Hard refresh `https://pennstateeps.github.io/`, send a *new test inquiry*, and confirm the website shows a success message AND that exactly one submission is visible in Formspree. Also test Contact and Join the Chapter.

**Do not** replace `src/content.js`, CSS, deployment workflow, any Storyblok schema or tokens. No Formspree settings changes are needed.
