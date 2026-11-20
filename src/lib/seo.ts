export interface PageMetadataInput {
  title: string;
  description: string;
  pathname: string;
  siteUrl: string;
  indexable?: boolean;
}

export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  keywords: string;
}

const keywords =
  "evidence-based skill tracker, learning task manager, independent coding practice, competency evidence";

export function buildPageMetadata(input: PageMetadataInput): PageMetadata {
  const canonical = new URL(input.pathname, input.siteUrl).toString();

  return {
    title: input.title,
    description: input.description,
    canonical,
    robots: input.indexable === false ? "noindex, nofollow" : "index, follow",
    keywords,
  };
}

export function buildStructuredData(siteUrl: string): {
  organization: Record<string, string>;
  website: Record<string, unknown>;
} {
  const normalizedSiteUrl = new URL(siteUrl).toString();

  return {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Growvidence",
      url: normalizedSiteUrl,
    },
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Growvidence",
      url: normalizedSiteUrl,
      description:
        "An evidence-based skill tracker concept for learners who want to demonstrate independent capability.",
    },
  };
}
