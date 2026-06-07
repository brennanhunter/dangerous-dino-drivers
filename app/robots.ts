import type { MetadataRoute } from "next";

const siteUrl = "https://dangerousdinodrivers.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Post-purchase + API surfaces shouldn't be crawled.
      disallow: ["/success", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
