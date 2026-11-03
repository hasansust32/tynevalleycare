# Newcastle Tyne Valley Domiciliary Care website

Production website for **Newcastle Tyne Valley Domiciliary Care**.

**Live site:** https://tynevalleycare.co.uk
**Contact:** admin@tynevalleycare.co.uk

The site is two static pages: a homepage and an **Enquire now** page. Visitors send enquiries through a form that emails the business. There is no server, no database and no login. That keeps hosting free, fast and low-maintenance.

| | |
|---|---|
| Hosting | GitHub Pages (built and published by GitHub Actions on every push to `main`) |
| Domain and DNS | Namecheap (`tynevalleycare.co.uk`) |
| HTTPS | GitHub Pages certificate, **Enforce HTTPS** on |
| Business email | Zoho Mail (UK data centre), mailbox `admin@tynevalleycare.co.uk` |
| Enquiry form | Formspree (free plan), delivers to `admin@tynevalleycare.co.uk` |
| Build tool | Eleventy 3 (build time only; the published site is plain HTML/CSS/JS) |

---

## Contents

1. [How it fits together](#1-how-it-fits-together)
2. [Accounts and renewals](#2-accounts-and-renewals)
3. [Run it locally](#3-run-it-locally)
4. [Edit the content](#4-edit-the-content)
5. [Deploy](#5-deploy)
6. [Enquiry form (Formspree)](#6-enquiry-form-formspree)
7. [Email (Zoho Mail)](#7-email-zoho-mail)
8. [Domain and DNS (Namecheap)](#8-domain-and-dns-namecheap)
9. [Security and privacy](#9-security-and-privacy)
10. [Testing](#10-testing)
11. [Routine checks](#11-routine-checks)
12. [Troubleshooting](#12-troubleshooting)
13. [Project structure](#13-project-structure)

---

## 1. How it fits together

```
 Visitor ──HTTPS──▶ tynevalleycare.co.uk  (GitHub Pages, static files)
                           │
                           │ enquiry form (fetch POST, JSON)
                           ▼
                     Formspree  ──email──▶  admin@tynevalleycare.co.uk  (Zoho Mail)
                                                     │
                                         reply by email to the visitor

 Developer ──git push main──▶ GitHub Actions ──build (Eleventy)──▶ GitHub Pages
```

- DNS for the domain is at **Namecheap**. Website records point to GitHub Pages and mail records point to Zoho. The two sets don't interfere with each other.
- The site stores nothing itself. Formspree keeps a copy of each submission in its dashboard, and Zoho keeps the email.

---

## 2. Accounts and renewals

Keep the login details for these services in a password manager. **Never commit passwords, recovery codes or card details to this repository**, because it is public.

| Service | Used for | Plan | Renewal |
|---|---|---|---|
| GitHub (`hasansust32`) | Code, hosting (Pages), deploys (Actions) | Free | none |
| Namecheap | Domain registration and DNS | Paid yearly | **1 Nov 2027**, auto-renew on |
| Zoho Mail | `admin@tynevalleycare.co.uk` mailbox | Mail Lite 5 GB, 1 user, yearly | **3 Nov 2027**, auto-renews unless turned off with Zoho |
| Formspree | Enquiry form delivery | Free (about 50 submissions/month; check Formspree's pricing page) | none |

> **Renewal decisions:** if the domain lapses, the website **and** the email stop working. If Zoho lapses, email stops but the website stays up, though enquiries would have nowhere to go. Put both renewal dates in a calendar about a month ahead.

---

## 3. Run it locally

Requires **Node.js 18+** (22 recommended, see `.nvmrc`).

```bash
npm ci             # install exact dependency versions from package-lock.json
npm start          # dev server at http://localhost:8080 with live reload
npm run build      # production build into _site/
npm run clean      # delete _site/
```

- `_site/` is generated. It is git-ignored and never edited by hand.
- The Content Security Policy is added **only in production builds** (`npm run build`), so the dev server's live reload keeps working.
- To try the form locally without sending real enquiries, build with a dummy endpoint: `FORM_ENDPOINT=https://formspree.io/f/test npm run build`. With a dummy endpoint, submissions fail with a clear error message.

---

## 4. Edit the content

Almost every edit lives in one of these files:

| To change… | Edit |
|---|---|
| Business name, email, address, domain, form endpoint | `src/_data/site.js` |
| Homepage wording, services, steps, who we support | `src/_data/home.js` |
| Enquiry page wording, form labels and options | `src/_data/enquire.js` |
| Privacy notice | `src/_includes/content/privacy-notice.njk` |
| Order of homepage sections | `src/index.njk` (one `include` line per section) |
| Colours, fonts, spacing | Design tokens at the top of `src/assets/css/site.css` |

**Content rules for this site.** Don't break these without a deliberate decision:
- **No telephone number** anywhere.
- **No partner logos, third-party branding or external links.** The only outward link is the business `mailto:`.
- **No reviews, testimonials, awards, ratings or CQC claims** unless they are real and can be checked. If you later have a CQC registration and rating, add the verified details then.
- Images are original illustrations. Only add photos you own or have licensed, and get written consent from anyone pictured.

**Adding a homepage section:** copy an existing file in `src/_includes/sections/`, add its text to `home.js`, then add an `include` line in `src/index.njk`.

**Swapping an illustration for a photo:**
1. Export a `.jpg` or `.webp` at roughly twice its display size and compress it.
2. Put it in `src/assets/images/`.
3. Update `src`, `width`, `height` and `alt` for that image in `src/_data/home.js`.

The hero arch is drawn for a 640 × 660 image.

---

## 5. Deploy

Deployment is automatic.

1. Commit to `main` and push.
2. The **Deploy to GitHub Pages** workflow (`.github/workflows/deploy.yml`) runs `npm ci` and `npm run build`, then publishes `_site/`.
3. The site is live about a minute later. Check progress in the repository's **Actions** tab, or start a run by hand with **Run workflow**.

Repository settings this depends on (already configured):
- **Settings → Pages → Build and deployment → Source:** `GitHub Actions`
- **Settings → Pages → Custom domain:** `tynevalleycare.co.uk` (verified), **Enforce HTTPS** ticked

Notes:
- With Actions-based Pages, GitHub takes the custom domain from **Settings → Pages**. `src/CNAME` is kept as a record of the domain only.
- **Rolling back:** `git revert <commit>` then push. The previous version redeploys.
- **Changing domain:** update **Settings → Pages**, `src/CNAME`, and `url` in `src/_data/site.js`. The `url` value drives canonical links, `sitemap.xml` and social previews.

---

## 6. Enquiry form (Formspree)

**Status: connected and tested.** A real test enquiry from the live site was delivered to `admin@tynevalleycare.co.uk`.

| Setting | Value |
|---|---|
| Endpoint | `https://formspree.io/f/xaeeaywz` (set in `src/_data/site.js`) |
| Delivers to | `admin@tynevalleycare.co.uk` (verified in Formspree) |
| Formspree CAPTCHA | **Off.** It must stay off, because the form submits in the background and can't show Formspree's CAPTCHA page. |
| Formspree account | Signed up with `admin@tynevalleycare.co.uk` |

The endpoint is **not a secret**. Formspree endpoints are designed to sit in public HTML.

**Overriding the endpoint without a code change:** set a repository variable named `FORM_ENDPOINT` under **Settings → Secrets and variables → Actions → Variables**. The workflow passes it to the build, and it takes priority over `site.js`. Redeploy afterwards.

**How the form behaves** (`src/assets/js/enquiry-form.js`):
- **Validation in the browser:** required fields, email format, UK postcode, start date not in the past, message length and consent. Errors appear inline with a linked error summary.
- **Spam defences:**
  - a hidden honeypot field `_gotcha`, which Formspree silently discards;
  - submissions made within 3 seconds of page load are blocked;
  - Formspree's Formshield spam filtering, if it's turned on in the form settings.
- **Submission:** sent with `fetch` and `Accept: application/json`, with a 20-second timeout and a guard against double-clicks.
- **Messages to the visitor:** the "Thank you, your enquiry has been sent" message appears **only** when Formspree confirms acceptance. Any error, timeout or offline state shows a clear message, keeps the visitor's answers and offers the email address instead.
- **No browser storage:** nothing goes into cookies, localStorage or sessionStorage.

**Each enquiry email** has the subject `New care enquiry: <name> (<postcode>)`. It lists:
- name, email and postcode;
- who requires care and the type of care;
- preferred start date and additional information;
- privacy consent.

Formspree sets **Reply-To** to the visitor's address, so pressing **Reply** in Zoho answers the visitor directly. Past submissions can be viewed or exported at formspree.io → the form → **Submissions**.

**If spam increases:**
- First tighten Formshield in the Formspree form settings.
- Formspree also supports your own reCAPTCHA v3, hCaptcha or Turnstile key. That needs a code change and the provider's domain adding to the CSP (see section 9).

**After any change to the form or endpoint**, submit one clearly-labelled test enquiry on the live site and confirm it arrives. Delete the test from the inbox afterwards.

---

## 7. Email (Zoho Mail)

- **Webmail:** https://mail.zoho.uk
- **Apps:** Zoho Mail for iOS and Android (choose the UK region if asked)
- **Mailbox:** `admin@tynevalleycare.co.uk`. This is the Zoho organisation's **Super Administrator**. Admin console: https://mailadmin.zoho.uk
- **Desktop mail apps (Outlook, Apple Mail, Thunderbird):** IMAP is included in Mail Lite.
  1. Turn it on in Zoho Mail → Settings → Mail Accounts → IMAP Access.
  2. Use the server names shown on that page.
  3. If two-factor sign-in is on, generate an application-specific password for the app.

**Folder note:** Zoho's automatic *Notification* sorting has been **turned off**, so Formspree enquiries land in the Inbox. If an enquiry seems missing, also check *Notification*, *Newsletter* and *Spam*.

**Giving someone else access:** don't share the Super Administrator login, because it controls billing and every mail setting. Add a separate Zoho user instead (an extra paid licence), or forward a copy of mail to them.

**Security:**
- Turn on two-factor sign-in for the Zoho account.
- Use a unique password stored in a password manager.

---

## 8. Domain and DNS (Namecheap)

Namecheap → Domain List → `tynevalleycare.co.uk` → **Advanced DNS**. **Mail Settings** must stay on **Custom MX**. Switching it to Email Forwarding deletes the Zoho MX records and breaks email.

Current records (all required):

| Type | Host | Value | Purpose |
|---|---|---|---|
| A | `@` | `185.199.108.153` | GitHub Pages |
| A | `@` | `185.199.109.153` | GitHub Pages |
| A | `@` | `185.199.110.153` | GitHub Pages |
| A | `@` | `185.199.111.153` | GitHub Pages |
| AAAA | `@` | `2606:50c0:8000::153` | GitHub Pages (IPv6) |
| AAAA | `@` | `2606:50c0:8001::153` | GitHub Pages (IPv6) |
| AAAA | `@` | `2606:50c0:8002::153` | GitHub Pages (IPv6) |
| AAAA | `@` | `2606:50c0:8003::153` | GitHub Pages (IPv6) |
| CNAME | `www` | `hasansust32.github.io.` | `www` redirects to the bare domain |
| TXT | `_github-pages-challenge-hasansust32` | *(value from GitHub)* | GitHub domain verification (prevents takeover) |
| MX | `@` | `mx.zoho.uk` (priority 10) | Zoho incoming mail |
| MX | `@` | `mx2.zoho.uk` (priority 20) | Zoho incoming mail |
| MX | `@` | `mx3.zoho.uk` (priority 50) | Zoho incoming mail |
| TXT | `@` | `v=spf1 include:zohomailcloud.co.uk ~all` | SPF: Zoho may send for the domain |
| TXT | `zmail._domainkey` | `v=DKIM1; k=rsa; p=…` *(key from Zoho admin console)* | DKIM signing |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@tynevalleycare.co.uk` | DMARC (monitoring mode) |
| TXT | `@` | `zoho-verification=…` | Zoho domain verification (keep) |

**Rules:**
- Keep **exactly one** SPF record (`v=spf1 …`) on `@`. If another sending service is added later, merge its `include:` into that same record.
- Don't add wildcard (`*`) records. GitHub warns that they allow subdomain takeover.
- The GitHub Pages IP addresses come from GitHub's custom-domain guide. Re-check that guide before changing them: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- **DMARC** is in monitoring mode (`p=none`). After a few weeks of normal sending with no failures in the reports, you can move to `p=quarantine`.

**Checking DNS:**

```bash
dig tynevalleycare.co.uk A +short
dig tynevalleycare.co.uk MX +short
dig tynevalleycare.co.uk TXT +short
dig www.tynevalleycare.co.uk CNAME +short
```

On Windows: `Resolve-DnsName tynevalleycare.co.uk -Type MX`.

---

## 9. Security and privacy

- **Content Security Policy** (production builds, in `src/_includes/layouts/base.njk`):
  - scripts, styles, fonts and images load from the site itself only;
  - network requests and form posts may go to the site and to the Formspree origin only;
  - `object-src 'none'` and `base-uri 'self'`.
- **Adding a third-party service** (analytics, maps, video, CAPTCHA) needs three things:
  1. allow it in the CSP;
  2. describe it in the privacy notice;
  3. add a cookie consent banner if it sets non-essential cookies.
- **No third-party requests on page load:** fonts (Literata and Atkinson Hyperlegible Next, SIL Open Font Licence) are self-hosted, and there are no trackers or analytics.
- **No secrets in the repository:** the Formspree endpoint is public by design, and there are no API keys.
- **Privacy notice:** it's at `enquire.html#privacy`. It explains that enquiries are processed by Formspree and delivered by email. Review it against the ICO's guidance for small organisations, and keep its retention wording true to practice (for example, how long enquiry emails and Formspree submissions are kept).
- **ICO:** check whether the business must pay the ICO data protection fee.
- **Formspree retention:** enquiries may contain health information. Periodically delete old submissions from the Formspree dashboard if you don't need them there. You can also turn off Formspree's *Submission Archive* in the form settings so it keeps no copy.

---

## 10. Testing

The production build was tested in Chromium with Playwright before each release, using a simulated Formspree:

- **Layouts:** 1440, 820, 390 and 320 px, with no horizontal scrolling.
- **Links:** every internal link and anchor resolves; the only outward link is the `mailto:`; no phone numbers appear.
- **Navigation:** the mobile menu opens and closes, including with Escape. The skip link is the first Tab stop, and focus is visible everywhere.
- **Form outcomes:**
  - validation errors;
  - success;
  - a Formspree 422 error with its message;
  - a 500 error;
  - network failure and timeout;
  - double-submit protection;
  - the 3-second bot check.
- **Payload:** the fields sent match what Formspree expects, including `_subject` and `_gotcha`.
- **Clean run:** no cookies or browser storage, no console errors, no CSP violations.
- **Accessibility:** axe-core reports 0 WCAG 2.1 A/AA violations on both pages, at desktop and mobile sizes.
- **Real delivery:** a live end-to-end test from https://tynevalleycare.co.uk/enquire.html was delivered to `admin@tynevalleycare.co.uk`.

**Before releasing changes**, at minimum:
1. Run `npm run build` and check there are no errors.
2. Preview `_site/` locally.
3. Tab through both pages.
4. After deploying, send one test enquiry.

---

## 11. Routine checks

| When | Check |
|---|---|
| After every deploy | Both pages load over HTTPS. If the form or `site.js` changed, send a test enquiry. |
| Monthly | Formspree usage against the free limit. Look in Zoho *Spam* for missed enquiries. |
| Every 6 months | Run `npm outdated` / `npm update`, rebuild and redeploy. Review the privacy notice. |
| October 2027 | Decide on the Namecheap (1 Nov) and Zoho (3 Nov) renewals. |

`npm audit` warnings in build-only tools don't affect the published site, which contains no npm code. Still, keep dependencies reasonably current.

---

## 12. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Whole site shows a GitHub 404 | **Settings → Pages → Source** isn't **GitHub Actions**, or the last workflow failed. Check **Actions**. |
| Workflow fails at "Install dependencies" | `package-lock.json` is missing or out of sync. Run `npm install`, commit the lock file and push. |
| "Enforce HTTPS" unavailable, or certificate warning | The certificate is being reissued, often after DNS or custom-domain changes. Wait up to 24 hours. Don't repeatedly remove and re-add the domain. |
| Form says "not connected yet" | The endpoint is the placeholder or empty. Check `src/_data/site.js` and the `FORM_ENDPOINT` variable, then redeploy. |
| Form says "The form service said: …" | Formspree rejected the submission. Check the form is enabled, CAPTCHA is off, the email is verified and the monthly limit isn't used up. |
| Form shows success but no email arrives | Check Zoho *Spam*, *Notification* and *Newsletter*, and the Formspree **Submissions** tab. Confirm the MX records (section 8). |
| Can't receive any email | Namecheap **Mail Settings** isn't **Custom MX**, or the MX records were changed. Restore the records in section 8. |
| Sent mail lands in recipients' spam | Check there is exactly one SPF record, and that Zoho admin console → Domains → Email configuration shows SPF and DKIM verified. |
| Old styles after an update | Browser cache. Hard refresh. Each build also versions the CSS/JS URLs. |

---

## 13. Project structure

```
tynevalleycare/
├── .github/workflows/deploy.yml   Build with Eleventy and publish to GitHub Pages
├── eleventy.config.js             Build settings (input src/, output _site/)
├── package.json / package-lock.json
├── .nvmrc                         Node.js version for builds (22)
└── src/
    ├── _data/
    │   ├── site.js                ★ Business details, domain, form endpoint
    │   ├── home.js                ★ Homepage text
    │   ├── enquire.js             ★ Enquiry page text and form options
    │   └── build.js               Build date and asset versioning
    ├── _includes/
    │   ├── layouts/base.njk       Page shell, SEO and social tags, JSON-LD, CSP
    │   ├── partials/              Header, footer, logo mark, form field macros
    │   ├── sections/              One file per homepage section
    │   ├── content/privacy-notice.njk   ★ Privacy notice
    │   └── icons/                 Service icons (SVG)
    ├── assets/
    │   ├── css/site.css           All styles (design tokens at the top)
    │   ├── js/site.js             Mobile menu
    │   ├── js/enquiry-form.js     Form validation and submission
    │   ├── images/                Original illustrations, logo, favicons, social image
    │   └── fonts/                 Self-hosted fonts and OFL licences
    ├── index.njk                  Homepage
    ├── enquire.njk                Enquire now page (includes the privacy notice)
    ├── sitemap.njk / robots.njk   sitemap.xml and robots.txt
    ├── favicon.ico
    └── CNAME                      tynevalleycare.co.uk
```

★ = the files edited most often.
