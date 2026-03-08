---
name: seo-schema
description: >
  Schema.org structured data (JSON-LD) for rich results and knowledge panels.
  Triggers: "schema", "structured data", "datos estructurados", "rich results",
  "rich snippets", "schema.org", "JSON-LD", "schema markup", "Product schema",
  "Article schema", "LocalBusiness schema", "FAQ schema", "HowTo schema",
  "Event schema", "Review schema", "agregar schema", "estrellas en Google",
  "breadcrumbs en SERP", "schema validation", "rich results test",
  "structured data errors", "GSC schema errors".
---

# Schema Markup Analysis & Generation

Detect, validate, and generate Schema.org structured data to unlock rich results
in Google Search, AI Overviews, and voice search. JSON-LD is the required output
format — it is Google's stated preference, framework-agnostic, and easiest to
maintain without touching existing HTML.

## Detection

1. Scan page source for JSON-LD blocks: `<script type="application/ld+json">`
2. Check for Microdata attributes: `itemscope`, `itemtype`, `itemprop`
3. Check for RDFa attributes: `typeof`, `property`, `vocab`
4. Identify all schema types present and their nesting relationships
5. Note delivery method (server-rendered HTML vs JavaScript-injected) — see JS note below

> **JS rendering note (March 2026 guidance):** Structured data injected via
> JavaScript may face delayed processing by Googlebot. For time-sensitive markup
> (Product, Offer, Event), include JSON-LD in the initial server-rendered HTML,
> not injected after DOMContentLoaded. Static site generators and SSR frameworks
> are preferred for schema delivery.

## Validation

Validate every detected schema block against these checks:

### Required Fields Check
Verify all required properties per schema type are present. Missing required fields
cause the rich result to be silently dropped — no error shown to the user in SERPs,
but GSC will report the error in the Enhancements section.

### Common Error Patterns
| Error | Severity | Fix |
|-------|----------|-----|
| Missing `@context` | Critical | Add `"@context": "https://schema.org"` |
| Missing or invalid `@type` | Critical | Use exact Schema.org type name |
| Relative URLs (must be absolute) | High | Prefix with `https://domain.com` |
| Invalid ISO 8601 date format | High | Use `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS+TZ` |
| Placeholder text left unfilled | High | Replace `[brackets]` with real data |
| Wrong data type (string vs number) | Medium | Match Schema.org property type |
| Deprecated type in use | Critical | Replace with active alternative |
| Schema on non-canonical page | Medium | Move to canonical URL only |
| Unverifiable claims (fake reviews) | Critical | Remove — violates Google policy |
| `aggregateRating` with zero reviews | High | Minimum 1 verifiable review required |
| `priceValidUntil` in the past | Medium | Update or remove — stale price data |

### Validation Status Levels
- **Valid**: All required properties present, no errors — eligible for rich results
- **Recommended**: Valid but missing recommended properties that improve rich result display
- **Warning**: Present but may not qualify for rich results (common: missing image, rating count too low)
- **Invalid**: Missing required fields or has errors — will NOT generate rich results

### How to Evaluate GSC Structured Data Errors
When the user reports errors in Google Search Console's "Enhancements" section:

1. Open GSC → Search Appearance → Structured Data (or Enhancements tab)
2. Click on the error type to see affected URLs
3. Click a URL to see the exact validation error message
4. Fix the specific missing/incorrect property — don't rewrite the whole block
5. Use Google's Rich Results Test (`search.google.com/test/rich-results`) to validate the fix
6. After deploying the fix, click "Validate Fix" in GSC to trigger recrawl
7. Expect 1-2 weeks for GSC to confirm the fix — the rich result won't appear instantly

**Common GSC messages decoded:**
| GSC Message | Root Cause | Fix |
|-------------|-----------|-----|
| "Missing field 'priceValidUntil'" | Product schema missing required date | Add future priceValidUntil date |
| "Either 'offers', 'review' or 'aggregateRating' should be specified" | Incomplete Product schema | Add at least one of these properties |
| "Missing field 'author'" | Article schema has no author | Add Person or Organization as author |
| "Invalid URL in field 'image'" | Relative or malformed URL | Use absolute HTTPS URL |
| "The property 'datePublished' is required" | Article/BlogPosting missing date | Add ISO 8601 publication date |

## Schema Type Status (as of March 2026)

### ACTIVE — Recommend freely:

**Entity & Organization:**
Organization, LocalBusiness (+ subtypes: Restaurant, Hotel, MedicalBusiness, etc.),
Person, ProfilePage

**Content:**
Article, BlogPosting, NewsArticle, WebPage, WebSite, ContactPage, AboutPage,
DiscussionForumPosting

**Products & Commerce:**
Product, ProductGroup, Offer, AggregateOffer, Service
- Product now supports Certification markup (active since April 2025)
- Include `hasMerchantReturnPolicy` and `shippingDetails` for full eligibility

**Media:**
VideoObject, ImageObject, BroadcastEvent, Clip, SeekToAction

**Reviews & Ratings:**
Review, AggregateRating (minimum 1 review for eligibility; Google verifies
review counts against third-party sources)

**Navigation & Structure:**
BreadcrumbList, SiteLinksSearchBox

**Events & Jobs:**
Event, JobPosting

**Education & Software:**
Course, SoftwareApplication, WebApplication, SoftwareSourceCode

### RESTRICTED — Only for specific site types:
- **FAQ**: ONLY for official government and healthcare authority sites (restricted August 2023).
  Do NOT implement on commercial, SaaS, or e-commerce sites — it will be ignored.

### DEPRECATED — Never recommend:
- **HowTo**: Rich results permanently removed September 2023
- **SpecialAnnouncement**: Deprecated July 31, 2025
- **CourseInfo, EstimatedSalary, LearningVideo**: Retired June 2025
- **ClaimReview**: Retired from rich results June 2025
- **VehicleListing**: Retired from rich results June 2025
- **Practice Problem**: Retired late 2025
- **Dataset**: Retired from rich results late 2025

## Generation Process

When generating schema for a page:

1. **Identify page type** from content, URL pattern, and user description
2. **Select primary schema type** — match to page's main entity
3. **Add supporting types** — e.g., Product always pairs with Offer; Article pairs with Person (author)
4. **Populate required properties first**, then add recommended properties
5. **Use real data only** — mark placeholders clearly as `"[REPLACE: description]"`
6. **Validate output mentally** before presenting — check required fields per type
7. **Provide placement instructions** — where in the HTML to insert the `<script>` block
8. **Never nest incompatible types** — e.g., don't nest Product inside Article

## JSON-LD Templates

### Product (e-commerce, SaaS pricing pages)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Product Name]",
  "description": "[Product description]",
  "image": "https://[domain].com/product-image.jpg",
  "brand": {
    "@type": "Brand",
    "name": "[Brand Name]"
  },
  "sku": "[SKU-001]",
  "offers": {
    "@type": "Offer",
    "price": "[19.99]",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://[domain].com/product-page",
    "priceValidUntil": "[YYYY-MM-DD]",
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

Required for Product rich result eligibility: at least one of `offers`, `review`, or
`aggregateRating`. All three together maximize rich result features displayed.

### Article / BlogPosting (blog posts, news articles)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Article Title — max 110 chars]",
  "description": "[Article summary — 150-160 chars]",
  "image": {
    "@type": "ImageObject",
    "url": "https://[domain].com/article-image.jpg",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "name": "[Author Full Name]",
    "url": "https://[domain].com/author/[slug]"
  },
  "publisher": {
    "@type": "Organization",
    "name": "[Publisher Name]",
    "logo": {
      "@type": "ImageObject",
      "url": "https://[domain].com/logo.png"
    }
  },
  "datePublished": "[YYYY-MM-DD]",
  "dateModified": "[YYYY-MM-DD]",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://[domain].com/article-url"
  }
}
```

Keep `dateModified` current when content is updated — this increases citation
likelihood in AI Overviews for time-sensitive queries.

### LocalBusiness (service area businesses, restaurants, etc.)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[Business Name]",
  "description": "[One-sentence description]",
  "url": "https://[domain].com",
  "telephone": "[+1-XXX-XXX-XXXX]",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street Address]",
    "addressLocality": "[City]",
    "addressRegion": "[State/Province]",
    "postalCode": "[ZIP/Postal Code]",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[Decimal Latitude]",
    "longitude": "[Decimal Longitude]"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "image": "https://[domain].com/business-photo.jpg",
  "sameAs": [
    "https://www.google.com/maps/place/[maps-url]",
    "https://www.yelp.com/biz/[slug]"
  ]
}
```

For restaurants, use `@type: "Restaurant"`. For medical practices, use
`@type: "MedicalBusiness"`. LocalBusiness subtypes inherit all parent properties.

### Organization (homepage, about page)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Company Name]",
  "url": "https://[domain].com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://[domain].com/logo.png",
    "width": 300,
    "height": 60
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "[+1-XXX-XXX-XXXX]",
    "contactType": "customer service",
    "availableLanguage": ["English"]
  },
  "sameAs": [
    "https://www.facebook.com/[handle]",
    "https://www.linkedin.com/company/[handle]",
    "https://twitter.com/[handle]"
  ]
}
```

### BreadcrumbList (any page with navigation hierarchy)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://[domain].com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Category]",
      "item": "https://[domain].com/[category]"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Current Page Title]",
      "item": "https://[domain].com/[category]/[page]"
    }
  ]
}
```

BreadcrumbList should be on every page except the homepage. It produces the
breadcrumb trail in SERPs instead of the raw URL — a significant CTR improvement.

### WebSite (homepage — enables Sitelinks Searchbox)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "[Site Name]",
  "url": "https://[domain].com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://[domain].com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

## Schema and AI Overviews (GEO)

Structured data directly improves citability in AI Overviews (Google), ChatGPT
web search, and Perplexity. Key guidance:

- **Organization schema** with `sameAs` links to authoritative profiles helps
  AI systems identify your brand entity and treat it as a known entity
- **Article schema** with accurate `dateModified` increases citation likelihood
  for time-sensitive queries — AI Overviews strongly prefer fresh, attributed content
- **Product schema** with complete Offer data enables product cards in AI responses
- **Review/AggregateRating** data appears in AI-generated product comparisons
- **Person schema** on author pages builds E-E-A-T signals that AI systems use
  to evaluate expertise and trustworthiness

## Output Format

### Primary Deliverable: SCHEMA-RECOMMENDATIONS.md

Structure this document as:

#### Detection Results
| Location | Type | Method | Properties Found | Status |
|----------|------|--------|-----------------|--------|
| `<head>` | Article | JSON-LD | 8/10 required | Valid |
| Homepage | Organization | Microdata | 4/8 required | Invalid |

#### Validation Results
| Schema Type | Status | Missing Required | Missing Recommended | Issues |
|-------------|--------|-----------------|--------------------|----|
| Article | Valid | none | dateModified | - |
| Product | Warning | priceValidUntil | aggregateRating | Price outdated |

#### Missing Opportunities
List schema types not present but applicable to detected page content.
For each opportunity, explain the rich result benefit and estimate CTR impact.

#### GSC Fix Priority
| Error in GSC | Affected URLs | Fix | Expected Result |
|-------------|-------------|-----|----------------|
| Missing priceValidUntil | 45 product pages | Add future date | Eligibility restored |

### Secondary Deliverable: generated-schema.json
Ready-to-use JSON-LD `<script>` blocks with:
- Exact placement instructions (before `</head>` tag)
- All required fields populated or clearly marked `[REPLACE: description]`
- All recommended fields included with notes on impact

### Recommendations Priority Order
1. Critical fixes (blocking rich result eligibility) — fix before anything else
2. Recommended property additions (improve rich result display quality)
3. New schema type opportunities (new rich result types to unlock)
4. GSC submission and validation steps
