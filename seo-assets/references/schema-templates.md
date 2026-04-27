# Schema JSON-LD Templates

## Product (e-commerce, SaaS pricing pages)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Product Name]",
  "description": "[Product description]",
  "image": "https://[domain].com/product-image.jpg",
  "brand": { "@type": "Brand", "name": "[Brand Name]" },
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

## Article / BlogPosting
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Article Title — max 110 chars]",
  "description": "[Article summary — 150-160 chars]",
  "image": { "@type": "ImageObject", "url": "https://[domain].com/image.jpg", "width": 1200, "height": 630 },
  "author": { "@type": "Person", "name": "[Author]", "url": "https://[domain].com/author/[slug]" },
  "publisher": { "@type": "Organization", "name": "[Publisher]", "logo": { "@type": "ImageObject", "url": "https://[domain].com/logo.png" } },
  "datePublished": "[YYYY-MM-DD]",
  "dateModified": "[YYYY-MM-DD]",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://[domain].com/article-url" }
}
```

## LocalBusiness
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[Business Name]",
  "description": "[One-sentence description]",
  "url": "https://[domain].com",
  "telephone": "[+1-XXX-XXX-XXXX]",
  "priceRange": "$$",
  "address": { "@type": "PostalAddress", "streetAddress": "[Street]", "addressLocality": "[City]", "addressRegion": "[State]", "postalCode": "[ZIP]", "addressCountry": "US" },
  "geo": { "@type": "GeoCoordinates", "latitude": "[Lat]", "longitude": "[Lon]" },
  "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "17:00" }],
  "image": "https://[domain].com/photo.jpg",
  "sameAs": ["https://www.google.com/maps/place/[url]", "https://www.yelp.com/biz/[slug]"]
}
```

## Organization (homepage, about page)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Company Name]",
  "url": "https://[domain].com",
  "logo": { "@type": "ImageObject", "url": "https://[domain].com/logo.png", "width": 300, "height": 60 },
  "contactPoint": { "@type": "ContactPoint", "telephone": "[+1-XXX-XXX-XXXX]", "contactType": "customer service", "availableLanguage": ["English"] },
  "sameAs": ["https://www.facebook.com/[handle]", "https://www.linkedin.com/company/[handle]", "https://twitter.com/[handle]"]
}
```

## BreadcrumbList
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://[domain].com" },
    { "@type": "ListItem", "position": 2, "name": "[Category]", "item": "https://[domain].com/[category]" },
    { "@type": "ListItem", "position": 3, "name": "[Page Title]", "item": "https://[domain].com/[category]/[page]" }
  ]
}
```

## WebSite (homepage — enables Sitelinks Searchbox)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "[Site Name]",
  "url": "https://[domain].com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://[domain].com/search?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}
```

## SoftwareApplication (for software comparisons)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[Software Name]",
  "applicationCategory": "[Category]",
  "operatingSystem": "[OS]",
  "offers": { "@type": "Offer", "price": "[Price]", "priceCurrency": "USD" }
}
```

## ItemList (for roundup/alternatives pages)
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Best [Category] Tools [Year]",
  "itemListOrder": "https://schema.org/ItemListOrderDescending",
  "numberOfItems": "[Count]",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "[Product Name]", "url": "[Product URL]" }
  ]
}
```
