# SEO, AEO and GEO plan

**Status:** Proposed. Keyword targets and search demand are unverified. No ranking outcome is promised.

## Principles
Create useful, original public pages. Put concise direct answers near the top, then explain evidence, examples and limitations. Attribute claims and keep content current. Structured data must describe visible content. Nobody can guarantee a #1 ranking.

## Page-by-page metadata

Proposed Pages canonical base: https://manayab.github.io/Growvidence/ — verify actual Pages settings before launch. Canonicals include /Growvidence/ until custom domain approval.

| Page | Proposed path | Metadata/content intent | Indexing |
|---|---|---|---|
| Home | / | Growvidence — Evidence-Based Skill Tracker; concise product purpose | Index |
| Product | /product/ | Actual learner workflows and capabilities; don't claim unshipped features | Index |
| How it works | /how-it-works/ | Activity → practice → artifact → independent demonstration | Index |
| Competencies | /competencies/ | Six proposed competency areas and draft rubric status | Index |
| Guides | /guides/ | Original learning/evidence guides | Index |
| Guide detail | /guides/{slug}/ | One distinct question/topic, answer-first summary and sources | Index |
| FAQ | /faq/ | Visible answers to genuine product/data questions | Index |
| About | /about/ | Project purpose, maintainer and limitations | Index |
| Privacy | /privacy/ | Local storage, export, deletion and limitations | Index |
| Security | /security/ | Reporting process and scope | Index |
| App/workspace | /app/ and descendants | Application UI; no private data in URL | noindex, nofollow |
| 404 | /404.html | Helpful navigation | noindex |

Every HTML page: unique title and description, self-referential canonical, Open Graph title/description/type/url/image and Twitter card. Meta keywords are low priority: **Google ignores the meta-keywords tag**, with no indexing or ranking effect. Source: [Google supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags).

## JSON-LD schema plan

| Type | Page | Rule |
|---|---|---|
| Organization | About/site-wide | Only after organization identity/details are established; don't invent legal entity/address. |
| WebSite | Home | Accurate site name and canonical URL. |
| SoftwareApplication | Product | State actual platform/availability and verified pricing only. |
| FAQPage | FAQ | Questions and answers must be visible; Google FAQ display is limited and not guaranteed. |
| HowTo | Genuine procedural guides | Only for visible step-by-step instructions. |
| BreadcrumbList | Nested guides/docs | Match visible breadcrumbs and canonical URLs. |

Google recommends JSON-LD and does not guarantee rich-result display even for valid markup. See [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [FAQ](https://developers.google.com/search/docs/appearance/structured-data/faqpage), [HowTo](https://developers.google.com/search/docs/appearance/structured-data/how-to) and [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

## Crawl/discovery files
- robots.txt: allow public content and reference absolute sitemap. Do not disallow noindex app pages if crawlers need to read their robots meta.
- sitemap.xml: canonical public URLs only; exclude noindex app pages and 404.
- llms.txt: experimental community resource-map convention, not an established Google ranking/indexing signal.
- 404.html: clear not-found state and links using base path.

## AEO/GEO content plan
For each substantial guide: answer the question in 1–3 sentences near the top; define terms and prerequisites; give numbered steps/examples; cite primary sources; add genuine FAQs only when useful; link to related rubrics/product pages; identify author and review date; avoid keyword stuffing, fabricated statistics, fake testimonials and generic filler.

## Candidate keyword topics — unverified
- evidence-based skill tracker
- learning task manager for developers
- track coding skills with projects
- prove programming skills with portfolio evidence
- independent coding practice tracker
- AI-assisted vs independent coding practice
- software developer learning roadmap tracker
- competency-based learning portfolio
- student skill progress tracker

Validate with Search Console after launch, keyword research and learner interviews. No search volumes/difficulty claims are made.

## Verification checklist
- Inspect generated HTML for unique titles/descriptions on all public pages.
- Check canonical URLs and /Growvidence/ base path.
- Validate OG/Twitter tags and image URLs.
- Keep meta keywords low priority.
- Check robots.txt and sitemap; only canonical public routes listed.
- Public pages indexable; app pages emit noindex.
- Validate JSON-LD with Schema Markup Validator and Google Rich Results Test where supported.
- Check semantic landmarks, heading order, links, alt text and keyboard use.
- Lighthouse target 95+ on representative pages; record device/profile.
- Core Web Vitals assessed with field data when available; lab tests are diagnostics only.
- Check links and routes after deploy; verify Search Console and sitemap after publication.

## Measurement targets
Lighthouse 95+ target for Performance, Accessibility, Best Practices and SEO; Core Web Vitals pass at the 75th percentile once sufficient field data exists; no structured-data validation errors for implemented types; Search Console verified and sitemap submitted. Track indexing, impressions and relevant queries, never a #1 position.

## Sources
- [Google supported meta tags](https://developers.google.com/search/docs/crawling-indexing/special-tags)
- [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Search Console](https://search.google.com/search-console/about)
- [GitHub Pages](https://docs.github.com/en/pages)
- [llms.txt proposal](https://llmstxt.org/) — community proposal.
