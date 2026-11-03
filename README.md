# Newcastle Tyne Valley Domiciliary Care website

This is a two-page static website: a **homepage** and an **Enquire now** page with a working enquiry form. It is built for **GitHub Pages** with the custom domain **tynevalleycare.co.uk**.

- **No server, no database.** The live site is plain HTML, CSS, JavaScript and images.
- Enquiries go to **Formspree**, a third-party form service, which emails them to `admin@tynevalleycare.co.uk`.
- **Eleventy** (a static site generator) runs only at build time. It lets the header, footer and content live in one place each. GitHub Actions rebuilds and publishes the site every time you push.

---

## Contents

1. [Project structure](#1-project-structure)
2. [Run it on your computer](#2-run-it-on-your-computer)
3. [Edit the content](#3-edit-the-content)
4. [Connect the enquiry form (Formspree)](#4-connect-the-enquiry-form-formspree)
5. [Publish on GitHub Pages](#5-publish-on-github-pages)
6. [Connect the custom domain](#6-connect-the-custom-domain)
7. [Images](#7-images)
8. [Before you launch](#8-before-you-launch-checklist)
9. [How the site was tested](#9-how-the-site-was-tested)
10. [Maintenance rules](#10-maintenance-rules)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Project structure

```
tynevalleycare/
├── .github/workflows/deploy.yml   GitHub Actions: build + publish to GitHub Pages
├── eleventy.config.js             Build settings (input src/, output _site/)
├── package.json / package-lock.json
├── .nvmrc                         Node.js version used by the build (22)
└── src/
    ├── _data/
    │   ├── site.js                ★ Business details, domain, form endpoint (the config file)
    │   ├── home.js                ★ All homepage text
    │   ├── enquire.js             ★ Enquiry page text, form labels and options
    │   └── build.js               Build date / cache-busting (no need to edit)
    ├── _includes/
    │   ├── layouts/base.njk       Page shell: <head>, SEO tags, security policy
    │   ├── partials/              Reusable header, footer, logo mark, form fields
    │   ├── sections/              One file per homepage section
    │   ├── content/privacy-notice.njk   ★ Privacy notice text
    │   └── icons/                 Service icons (SVG)
    ├── assets/
    │   ├── css/site.css           All styles; colours and sizes are tokens at the top
    │   ├── js/site.js             Mobile menu, footer year
    │   ├── js/enquiry-form.js     Form validation and submission
    │   ├── images/                Illustrations, logo, favicons, social image
    │   └── fonts/                 Self-hosted fonts (SIL Open Font Licence)
    ├── index.njk                  Homepage: the list of sections, in order
    ├── enquire.njk                Enquire now page
    ├── sitemap.njk / robots.njk   Generate sitemap.xml and robots.txt
    ├── favicon.ico
    └── CNAME                      tynevalleycare.co.uk
```

★ = the files you will edit most.

The site has **two pages only**: `index.html` and `enquire.html`. The privacy notice is a section of the enquiry page (`enquire.html#privacy`), so no third page is needed.

---

## 2. Run it on your computer

You need **Node.js 18 or newer** (22 recommended): https://nodejs.org

```bash
npm install        # first time only
npm start          # preview at http://localhost:8080 with live reload
npm run build      # produce the finished site in _site/
```

`_site/` is what gets published. You never edit it by hand, and it is not committed to Git.

---

## 3. Edit the content

| To change… | Edit |
|---|---|
| Business name, email, address, domain | `src/_data/site.js` |
| Homepage wording, services, steps, who we support | `src/_data/home.js` |
| Enquiry page wording, form labels and options | `src/_data/enquire.js` |
| Privacy notice | `src/_includes/content/privacy-notice.njk` |
| Section order, or add/remove a homepage section | `src/index.njk` (one line per section) |
| Colours, fonts, spacing | Tokens at the top of `src/assets/css/site.css` |

**Adding a new homepage section:** create `src/_includes/sections/my-section.njk`, add its text to `home.js`, and add `{% include "sections/my-section.njk" %}` to `src/index.njk`. Copy an existing section as a starting point.

**No telephone number** appears anywhere, by design. Please keep it that way unless you decide otherwise.

---

## 4. Connect the enquiry form (Formspree)

Until you do this, the form **will not send anything**. A visitor who submits it is told the form isn't connected yet and is given the email address instead. It never shows a false "sent" message.

### 4.1 Make sure the mailbox exists

Buying a domain does **not** give you an email inbox. Set up email hosting for `admin@tynevalleycare.co.uk` with your domain registrar or an email provider, and add the MX records they give you. Email (MX) records and the GitHub Pages records in section 6 don't conflict.

### 4.2 Create the Formspree form

1. Go to https://formspree.io and create an account (sign up with `admin@tynevalleycare.co.uk` if you can).
2. Create a **new form**, for example "Website enquiries".
3. Set the form's **target email** to `admin@tynevalleycare.co.uk`. Formspree sends a verification email to that address. Open it and confirm, or submissions won't be forwarded.
4. Copy the form's **endpoint**. It looks like `https://formspree.io/f/abcdwxyz`.
5. In the form's **Settings**, find the spam-protection section and **turn off reCAPTCHA** for this form. Formspree's built-in reCAPTCHA works by sending visitors to a Formspree page, which can't happen when the form submits in the background as this one does. The site keeps two other spam defences:
   - a hidden honeypot field (`_gotcha`), which Formspree uses to silently discard bot submissions;
   - a timing check that blocks submissions made within 3 seconds of the page loading.

   If spam becomes a problem later, Formspree supports adding your own reCAPTCHA, hCaptcha or Turnstile key (see Formspree's "Spam filtering" help pages and their plan details).
6. Check Formspree's current plan limits (monthly submissions) on its pricing page, and choose a plan that fits.

### 4.3 Put the endpoint into the site (choose one)

**Option A: edit the config file (simplest).** Open `src/_data/site.js` and replace the placeholder:

```js
endpoint: process.env.FORM_ENDPOINT || "https://formspree.io/f/abcdwxyz",
```

**Option B: keep it out of the code.** In GitHub, go to **Settings → Secrets and variables → Actions → Variables → New repository variable**. Set the name to `FORM_ENDPOINT` and the value to your endpoint. The deploy workflow passes it to the build.

The endpoint is **not a secret**. Formspree endpoints are meant to appear in public HTML, and the site contains no API keys. Option B simply keeps configuration separate from code.

After either option, push to `main` (or re-run the workflow) so the site rebuilds.

### 4.4 What each enquiry email contains

The subject line reads `New care enquiry: <name> (<postcode>)`. The email lists: name, email, postcode, who requires care, type of care, preferred start date, additional information and privacy consent. Formspree sets **Reply-To** to the visitor's email, so you can reply directly.

### 4.5 Test it for real

After the site is live, submit a real test enquiry from the live website. Then confirm:

- the email arrives at `admin@tynevalleycare.co.uk` (check spam/junk too);
- the submission appears in the Formspree dashboard;
- the website showed "Thank you, your enquiry has been sent".

**Only treat the form as working once this real test has been delivered.**

---

## 5. Publish on GitHub Pages

1. **Create a repository** on GitHub, for example `tynevalleycare-website`. Free accounts need a **public** repository for GitHub Pages; private repositories need a paid plan.
2. **Upload the code.** From this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/tynevalleycare-website.git
   git push -u origin main
   ```
   Don't upload `node_modules/` or `_site/`; `.gitignore` already excludes them.
3. **Turn on Pages:** repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab. The "Deploy to GitHub Pages" workflow runs on every push to `main` and takes a minute or two. You can also run it by hand there (**Run workflow**).
5. When it finishes, the site is live at `https://<your-username>.github.io/tynevalleycare-website/`. All links are relative, so the site works at this address too, before the domain is connected.

---

## 6. Connect the custom domain

GitHub's official guide is the source of truth for DNS values. Keep it open while you do this:
**https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site**

### 6.1 Verify the domain with GitHub (recommended, prevents takeover)

Your GitHub profile **Settings → Pages → Add a domain** → enter `tynevalleycare.co.uk`. GitHub shows a **TXT record**. Add it at your DNS provider exactly as shown, then click **Verify**.

### 6.2 Add the domain to the repository first

Repository **Settings → Pages → Custom domain** → enter `tynevalleycare.co.uk` → **Save**. GitHub recommends doing this **before** changing DNS.

### 6.3 Create the DNS records at your registrar

Copy the values from the GitHub guide above. Don't use values from anywhere else.

| Purpose | Record type | Host / name | Value |
|---|---|---|---|
| Main domain `tynevalleycare.co.uk` | **A** (four records) | `@` (the apex/root) | The four GitHub Pages IPv4 addresses listed in the guide's apex-domain section |
| Optional IPv6 | **AAAA** (four records) | `@` | The four IPv6 addresses listed in the same section |
| `www.tynevalleycare.co.uk` | **CNAME** | `www` | `<your-username>.github.io` (your GitHub username, **without** the repository name) |

Also:
- **Delete** any default "parking" A or CNAME records your registrar created for `@` or `www`.
- **Don't** create wildcard records (`*.tynevalleycare.co.uk`). GitHub warns these allow takeover.
- Leave MX (email) and TXT records alone.

With both the apex and `www` records in place, GitHub Pages redirects `www.tynevalleycare.co.uk` to `tynevalleycare.co.uk` automatically.

### 6.4 Check DNS

DNS changes can take up to 24 hours. On macOS or Linux:

```bash
dig tynevalleycare.co.uk +noall +answer -t A
dig tynevalleycare.co.uk +noall +answer -t AAAA
dig www.tynevalleycare.co.uk +nostats +nocomments +nocmd
```

On Windows (PowerShell):

```powershell
Resolve-DnsName tynevalleycare.co.uk -Type A
Resolve-DnsName www.tynevalleycare.co.uk
```

The A/AAAA answers should match the addresses in GitHub's guide. The `www` answer should point at `<your-username>.github.io`. In **Settings → Pages**, the DNS check should show as successful.

### 6.5 Turn on HTTPS

Once the DNS check passes, tick **Enforce HTTPS** in **Settings → Pages**. GitHub issues a free certificate, which can take up to 24 hours to become available. Afterwards, check that `http://`, `https://`, `www.` and the bare domain all end up at `https://tynevalleycare.co.uk/`.

### 6.6 About the CNAME file

`src/CNAME` contains `tynevalleycare.co.uk` and is copied into the published site. When you publish **with GitHub Actions** (as this project does), GitHub takes the domain from **Settings → Pages** and ignores the CNAME file. The file stays in the repository as a record of the domain.

**Changing domain later:** update all three:
- **Settings → Pages**;
- `src/CNAME`;
- `url` in `src/_data/site.js`, which is used for canonical links, the sitemap and social previews.

### 6.7 Final connectivity check

- `https://tynevalleycare.co.uk/` loads with a padlock.
- `https://tynevalleycare.co.uk/enquire.html` loads. Refresh it: there is no 404, because it is a real file.
- `https://tynevalleycare.co.uk/sitemap.xml` and `/robots.txt` load.
- Paste the homepage link into a messaging app; the preview shows the social image.

---

## 7. Images

All artwork is **original**, drawn for this site as SVG illustrations. No stock photos or images from other websites are used, so there is nothing to license.

| File (in `src/assets/images/`) | Used in | Notes |
|---|---|---|
| `hero-tyne-valley-home.svg` | Hero | Shown inside an arch shape; 640 × 660 ratio |
| `kitchen-table.svg` | What is domiciliary care? | 560 × 460 |
| `front-door.svg` | Why choose us? | 480 × 600 |
| `armchair-window.svg` | Who we support | 520 × 520 |
| `letter-heather.svg` | Enquiry page header | 360 × 360 |
| `skyline.svg` | Top edge of the final call-to-action band | Decorative |
| `logo.svg`, `logo.png`, `logo-mark.svg` | Logo files for use elsewhere (email signature, documents) | |
| `favicon.svg`, `../favicon.ico`, `apple-touch-icon.png` | Browser tab and phone home-screen icons | |
| `og-image.png` | Preview image when the site is shared (1200 × 630) | |

**To swap an illustration for a photo:**
1. Use a photo you have the rights to: your own (with written consent from anyone pictured), or properly licensed stock.
2. Export it as `.jpg` or `.webp` at about twice its display size (for example 1200 px wide) and compress it (for example with https://squoosh.app).
3. Put it in `src/assets/images/`.
4. Update `src` and `width`/`height` for that image in `src/_data/home.js`.
5. Write a new `alt` description of what the photo shows.

Keep a similar aspect ratio, or adjust the image rules in `site.css`. The hero's arch is calculated for a 640 × 660 image.

---

## 8. Before you launch (checklist)

- [ ] Formspree endpoint set, reCAPTCHA setting reviewed, **real test enquiry received** (section 4).
- [ ] `admin@tynevalleycare.co.uk` mailbox exists and is checked regularly.
- [ ] **Privacy notice reviewed** against the ICO's guidance for small organisations. Confirm the retention wording matches what you actually do, and check whether you need to pay the ICO data protection fee. The notice describes how this site works; it is not legal advice.
- [ ] **Wording matches how you work.** For example, the site says you visit to plan care and review plans regularly. Edit `home.js` if anything differs.
- [ ] **Regulation:** the site makes no claims about CQC registration, ratings, awards or reviews. When you have verified details to show (for example a CQC registration and its current rating), add them. Don't add anything that can't be checked.
- [ ] Domain connected and **Enforce HTTPS** ticked (section 6).
- [ ] Check the site on a phone, a tablet and a desktop.

---

## 9. How the site was tested

Before handover, the production build was served locally and checked in Chromium with Playwright.

- **Layouts:** desktop (1440 px), tablet (820 px) and mobile (390 px and 320 px). No horizontal scrolling at any size.
- **Links and navigation:** every internal link and section anchor resolves; the logo returns to the homepage; every "Make an enquiry" button opens `enquire.html`; there are no external links apart from the business `mailto:`; no phone numbers appear.
- **Mobile menu:** opens and closes, closes on Escape and after choosing a link.
- **Keyboard:** the skip link is the first Tab stop, and focus is visible on every control.
- **Form validation:** required fields, email format, UK postcode format, start date not in the past, error summary with links to each field, and `aria-invalid` on fields with errors.
- **Submission handling, with Formspree simulated:**
  - success shows the confirmation and hides the form;
  - a Formspree error shows its message and keeps the visitor's answers;
  - server errors, network failures and timeouts show clear messages;
  - double-clicking sends only one request;
  - a submission within 3 seconds of page load is blocked;
  - with the placeholder endpoint, the form shows an honest "not connected" message and sends nothing.
- **Payload:** the fields sent match what Formspree expects, including `_subject` and `_gotcha`.
- **Storage and console:** nothing is stored in cookies or browser storage; there are no JavaScript errors and no Content Security Policy violations.
- **Accessibility:** axe-core reports no WCAG 2.1 A/AA violations on either page, at desktop or mobile size.

**Not tested:** delivery of a real email. That needs your Formspree account and the live site (section 4.5).

---

## 10. Maintenance rules

- Keep the site **static**. Don't add a database, a server or server-side code; GitHub Pages can't run them. If you ever need one, treat it as a deliberate change of hosting.
- The build output must stay plain HTML/CSS/JS. Eleventy is a build-time tool only.
- Fonts are self-hosted (Literata and Atkinson Hyperlegible Next, both under the SIL Open Font Licence; licence files are in `src/assets/fonts/`). The site makes no requests to Google or other third parties, except to Formspree when someone submits the form.
- `src/_includes/layouts/base.njk` sets a **Content Security Policy** in production builds. If you add a third-party service (analytics, maps, video), you must allow it there. You must also update the privacy notice, and add a cookie banner if the service sets cookies.
- `npm audit` may report advisories in build-time tools. These don't affect the published site, but keep dependencies updated with `npm update` from time to time.

---

## 11. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| GitHub shows a 404 for the whole site | **Settings → Pages → Source** isn't set to **GitHub Actions**, or the workflow failed. Check the **Actions** tab. |
| Workflow fails at "Install dependencies" | `package-lock.json` is missing from the repository. Commit it. |
| Form says "not connected yet" | The endpoint is still the placeholder. See section 4.3, then redeploy. |
| Form says "The form service said: …" | Formspree rejected the submission. Read the message, check the form's settings in Formspree (verified email, reCAPTCHA off) and the plan limits. |
| No email arrives | Check spam/junk, check the Formspree dashboard, and confirm the target email was verified. |
| "Domain does not resolve" or "improperly configured" in Pages settings | DNS records are missing, wrong, or still propagating. Re-check section 6.3 against GitHub's guide and wait up to 24 hours. |
| "Enforce HTTPS" is greyed out | The certificate is still being issued. It can take up to 24 hours after the DNS check passes. |
| Old styles still showing after a change | Browser cache. Do a hard refresh. Each build also changes the CSS/JS version string automatically. |
