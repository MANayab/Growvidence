import { describe, expect, it } from "vitest";

import { buildPageMetadata, buildStructuredData } from "./seo";

describe("buildPageMetadata", () => {
  it("creates an absolute canonical and indexable robots directive", () => {
    const metadata = buildPageMetadata({
      title: "Growvidence — Evidence-Based Skill Tracker",
      description:
        "Track practice and demonstrate skills with reviewable evidence.",
      pathname: "/Growvidence/",
      siteUrl: "https://manayab.github.io",
    });

    expect(metadata.canonical).toBe("https://manayab.github.io/Growvidence/");
    expect(metadata.robots).toBe("index, follow");
    expect(metadata.title).toContain("Evidence-Based");
    expect(metadata.description.length).toBeGreaterThan(30);
  });

  it("marks private application routes as non-indexable", () => {
    const metadata = buildPageMetadata({
      title: "Workspace",
      description: "Private learner workspace.",
      pathname: "/Growvidence/app/",
      siteUrl: "https://manayab.github.io",
      indexable: false,
    });

    expect(metadata.robots).toBe("noindex, nofollow");
  });
});

describe("buildStructuredData", () => {
  it("returns Organization and WebSite data using the canonical site URL", () => {
    const data = buildStructuredData("https://manayab.github.io/Growvidence/");

    expect(data.organization["@type"]).toBe("Organization");
    expect(data.website["@type"]).toBe("WebSite");
    expect(data.organization.url).toBe(
      "https://manayab.github.io/Growvidence/",
    );
    expect(data.website.url).toBe("https://manayab.github.io/Growvidence/");
  });
});
