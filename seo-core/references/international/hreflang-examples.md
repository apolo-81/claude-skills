# Hreflang Implementation Examples

## HTML Link Tags (best for <50 variants)
```html
<link rel="alternate" hreflang="en-US" href="https://example.com/en/page" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
```

## HTTP Headers (best for non-HTML files like PDFs)

## XML Sitemap (best for large sites, cross-domain)
```xml
<url>
  <loc>https://example.com/en/page</loc>
  <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/en/page" />
  <xhtml:link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
</url>
```

## Cross-Domain Support
Works across different domains (example.com, example.de). Requires return tags on
both domains, separate GSC verification. Prefer sitemap-based implementation.

## Hreflang Generation Process
1. Detect languages from URL path, subdomain, ccTLD, HTML `lang` attribute
2. Map page equivalents across all variants
3. Validate codes against ISO 639-1 + ISO 3166-1
4. Generate tags with self-reference for each page
5. Verify bidirectional return tags (full mesh)
6. Add x-default; choose implementation method
7. Output implementation-ready code
