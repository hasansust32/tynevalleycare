/**
 * SITE CONFIGURATION
 * ------------------
 * Business details, domain and enquiry-form settings live here and nowhere else.
 * The header, footer, contact blocks, SEO tags, sitemap and enquiry form all read from this file.
 *
 * Nothing in this file is secret. A Formspree endpoint URL is designed to sit in public HTML.
 */

export default {
  name: "Newcastle Tyne Valley Domiciliary Care",

  // How the name is split across two lines in the logo (header and footer).
  logoLines: ["Newcastle Tyne Valley", "Domiciliary Care"],

  // Live domain, with no trailing slash. Used for canonical links, social previews and the sitemap.
  url: "https://tynevalleycare.co.uk",

  email: "admin@tynevalleycare.co.uk",

  // Office address, shown exactly as supplied. Each line is printed on its own row.
  address: [
    "Suite 11, John Buddle Work Village",
    "Buddle Road",
    "Newcastle Upon Tyne",
    "England",
    "NE4 8AW",
  ],

  // No telephone number is shown anywhere on the site, by design. Do not add one here.

  areaServed: "Newcastle upon Tyne and the Tyne Valley",

  locale: "en_GB",

  form: {
    /**
     * Enquiry form endpoint (Formspree, or any service that accepts a standard form POST).
     * Option 1: replace the placeholder below with your endpoint, e.g. "https://formspree.io/f/abcdwxyz".
     * Option 2: leave the placeholder and set a repository variable called FORM_ENDPOINT
     *           (GitHub > Settings > Secrets and variables > Actions > Variables). The deploy workflow passes it in.
     * Until a real endpoint is set, the form tells visitors it isn't connected yet and never pretends to send.
     */
    endpoint: process.env.FORM_ENDPOINT || "https://formspree.io/f/xaeeaywz",

    // Subject line of the email you receive. The visitor's name and postcode are added after it.
    subject: "New care enquiry",

    // Submissions made faster than this after the page loads are treated as bots (basic spam protection).
    minFillSeconds: 3,

    // Abandon a submission that gets no response within this many seconds, then show an error.
    timeoutSeconds: 20,
  },
};
