import site from "./src/_data/site.js";

const PLACEHOLDER = "YOUR_FORM_ID";

export default function (eleventyConfig) {
  // Static files are copied to the output unchanged.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // "https://formspree.io/f/abc" -> "https://formspree.io" (used in the Content Security Policy).
  eleventyConfig.addFilter("origin", (url) => {
    try {
      return new URL(url).origin;
    } catch {
      return "";
    }
  });

  eleventyConfig.addGlobalData("formConfigured", !site.form.endpoint.includes(PLACEHOLDER));

  eleventyConfig.on("eleventy.after", () => {
    if (site.form.endpoint.includes(PLACEHOLDER)) {
      console.warn(
        "\n[tynevalleycare] The enquiry form endpoint is still the placeholder.\n" +
          "  The form will tell visitors it isn't connected. See README > Connect the enquiry form.\n"
      );
    }
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
