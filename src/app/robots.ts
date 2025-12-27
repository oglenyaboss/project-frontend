import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/private/", "/api/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_API_URL || "https://example.com"}/sitemap.xml`,
  };
}
