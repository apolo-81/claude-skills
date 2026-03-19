# GEO (Generative Engine Optimization) Reference

## Key Stats (2026)
- AI Overviews: 50%+ of Google queries, 1.5B users/month
- AI-referred sessions grew 527% (Jan-May 2025)
- Only 11% of domains cited by both ChatGPT and Google AIO for same query
- 92% of AIO citations from top-10 pages; 47% from ranks 6-10+

## Brand Mentions > Backlinks
Brand mentions correlate 3x more strongly with AI visibility than backlinks.

| Signal | Correlation |
|--------|-------------|
| YouTube mentions | ~0.737 (strongest) |
| Reddit mentions | High |
| Wikipedia presence | High |
| Domain Rating (backlinks) | ~0.266 (weak) |

## AI Crawler Configuration
Allow search-facing crawlers; evaluate training crawlers per IP policy.
- OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot: Allow (drives citation)
- GPTBot, Google-Extended, CCBot: Block if IP concern (training only)
- Never block Googlebot

## llms.txt Standard
Machine-readable guide at `/llms.txt` for AI systems (analogous to robots.txt).
Sections: site description, main content pages, products/services, about/authority,
key facts. Update within 6 months.

## RSL 1.0 (Really Simple Licensing)
Machine-readable AI content licensing via `<link rel="license">` or
`/.well-known/rsl.json`. Terms: Allow, Restrict, or License.
Backed by Reddit, Yahoo, Medium, Quora, Cloudflare, Akamai, Creative Commons.

## Platform-Specific Optimization

**Google AI Overviews:** Maintain top-10 ranking, question-based headings,
definition patterns, Article/Organization schema, content in raw HTML.

**ChatGPT:** Build Wikipedia presence, publish on Reddit authentically,
allow OAI-SearchBot, add dates and author credentials.

**Perplexity:** Reddit presence, cite primary sources, academic citation format,
publish original research/data.

**Claude:** Factual accuracy, clear attribution, Organization/Person schema,
direct prose without hedging.

**Bing Copilot:** Submit sitemap to Bing Webmaster Tools, implement IndexNow,
optimize Open Graph tags.
