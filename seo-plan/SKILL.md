---
name: seo-plan
description: >
  Strategic SEO planning for new or existing websites. Triggers: "SEO plan",
  "SEO strategy", "plan de SEO", "SEO roadmap", "content strategy",
  "keyword research", "site architecture", "SEO para mi negocio",
  "por dónde empezar con SEO", "SEO quick wins", "SEO priorities",
  "content calendar", "link building plan", "SEO for startup/ecommerce/SaaS",
  "aumentar tráfico orgánico", "grow SEO", "SEO desde cero",
  "calendario de contenidos", "keyword strategy", "content marketing plan".
---

# Strategic SEO Planning

Create a complete, actionable SEO strategy tailored to the specific business,
its stage, competitive landscape, and available resources. A generic SEO plan
is worthless — this skill produces a specific, prioritized roadmap that can
be handed to a team and executed immediately.

## Step 1: Business Stage Detection

Identify which stage the business/site is in before planning. Each stage has
different priorities and different expected timelines for results.

### Stage A: New Site (0-6 months old, <1,000 monthly organic visits)
**Key challenges:** No domain authority, no indexed content, no backlinks
**Priority sequence:** Technical foundation → Core pages → Schema → Initial content
**Realistic timeline:** First meaningful organic traffic in 3-6 months; competitive
rankings in 6-12 months. Set expectations accordingly — SEO for new sites requires patience.

### Stage B: Growing Site (6 months-3 years, 1,000-50,000 monthly organic visits)
**Key challenges:** Content gaps, inconsistent internal linking, thin pages
**Priority sequence:** Content audit → Gap analysis → Content expansion → Link building
**Realistic timeline:** Meaningful traffic improvements within 60-90 days with
focused content and technical work

### Stage C: Established Site (3+ years, 50,000+ monthly organic visits)
**Key challenges:** Content decay, cannibalization, index bloat, technical debt
**Priority sequence:** Content consolidation → Cannibalization fix → Authority building
**Realistic timeline:** Traffic recovery from content consolidation in 30-60 days;
authority building compounds over 12+ months

### Stage D: Declining Site (meaningful traffic drop in last 6-12 months)
**Key challenges:** Algorithm penalties, content devaluation, competitive displacement
**Priority sequence:** Penalty diagnosis → Content quality uplift → Recovery plan
**Realistic timeline:** Recovery from Helpful Content/Quality issues takes 6-18 months;
no shortcuts exist for quality-based penalties

Ask the user which stage applies, or infer from available signals (domain age,
traffic data, number of indexed pages).

## Step 2: Resource Reality Check

A plan that requires 10 writers and a dev team to execute is useless for a solo founder.
Adapt the plan to actual resource constraints:

| Resource Level | Description | Monthly Content Volume | Link Building |
|---------------|-------------|----------------------|---------------|
| Bootstrap (1 person, <5hr/week) | Solo founder or small team | 2-4 pieces/month | Relationships only |
| Small team (2-5 people, SEO part-time) | Marketing hire or agency | 4-8 pieces/month | Outreach 1x/week |
| Funded (dedicated SEO budget) | SEO specialist or agency | 8-20 pieces/month | Active link building |
| Scale (SEO as core channel) | SEO team + content team | 20+ pieces/month | Systematic link building |

**Bootstrap-specific adaptations:**
When resources are severely limited, ruthlessly prioritize:
1. Fix the single biggest technical blocker (crawlability, speed, noindex errors)
2. Write the 3-5 highest-value commercial pages (these drive revenue)
3. Publish 1 high-quality blog post per week targeting an achievable keyword
4. Build 1-2 links per month through existing relationships
Avoid: complex programmatic SEO, large content calendars you can't execute, advanced
technical optimizations when basics are broken.

## Step 3: Discovery & Situation Analysis

Collect this information before building the plan:

### Business Information
- **Industry / niche**: What does the business do? Who does it serve?
- **Geography**: Local, national, international? Which countries/languages?
- **Business model**: B2B, B2C, marketplace, SaaS, e-commerce, local service?
- **Primary revenue driver**: What does a conversion look like? (sale, lead, sign-up)
- **Unique differentiator**: What makes this business different from competitors?

### Current Site Assessment (if site exists)
- Total indexed pages (check Google Search Console or `site:domain.com`)
- Monthly organic traffic (Google Search Console or Ahrefs/SEMrush)
- Top performing pages (by traffic and conversions)
- Obvious technical issues (crawl errors, page speed, mobile)
- Existing backlink profile (domain authority, linking domains)

### Keyword Landscape
- Core service/product terms: what do customers search when ready to buy?
- Informational terms: what questions does the audience ask?
- Branded terms: is the brand being searched? Growing?
- Competitor-intent terms: "[Competitor] alternative", "vs [competitor]"

## Step 4: Competitive Analysis

Identify and analyze top 3-5 competitors:

### For Each Competitor, Assess:
1. **Estimated organic traffic** (Ahrefs, SEMrush, SimilarWeb estimates)
2. **Domain authority / domain rating** (backlink strength)
3. **Content strategy**: How many pages? Publishing cadence? Content types?
4. **Top traffic pages**: What pages drive most of their SEO traffic?
5. **Keyword gaps**: Keywords competitors rank for that this site doesn't
6. **Content gaps**: Topics competitors cover that this site doesn't
7. **Technical setup**: Schema usage, site speed, Core Web Vitals
8. **E-E-A-T signals**: Author expertise, trust signals, content depth
9. **Backlink profile**: Who links to competitors but not to this site?

### Competitive Gap Analysis Output
| Keyword | Your Rank | Competitor A | Competitor B | Opportunity |
|---------|-----------|-------------|-------------|-------------|
| [keyword] | None | #3 | #7 | High — strong demand, rankable |
| [keyword] | #8 | #1 | #4 | Medium — improve existing page |

## Step 5: Site Architecture Design

Design or validate the URL hierarchy before creating content.

### Architecture Principles
- Maximum 3 clicks from homepage to any important page
- Clear topical clustering: hub pages link to supporting content
- URL hierarchy reflects content hierarchy (`/services/`, `/services/web-design/`)
- No orphan pages (every page linked from at least 2 other pages)
- Flat structure preferred over deep nesting

### Load Industry Template

Select template from `assets/` directory based on business type:
- `saas.md` — SaaS/software: features, pricing, integrations, comparisons, blog
- `local-service.md` — Local businesses: services, locations, reviews, FAQs
- `ecommerce.md` — E-commerce: categories, products, reviews, brand pages, blog
- `publisher.md` — Content publishers: topic hubs, tag pages, author pages
- `agency.md` — Agencies: services, case studies, team, blog, tools
- `generic.md` — General business: home, about, services, blog, contact

### Site Structure Template (Generic)
```
/ (Homepage)
├── /[primary-service-1]/
│   ├── /[primary-service-1]/[sub-service-a]/
│   └── /[primary-service-1]/[sub-service-b]/
├── /[primary-service-2]/
├── /blog/
│   ├── /blog/[topic-hub-1]/
│   └── /blog/[topic-hub-2]/
├── /about/
├── /contact/
└── /[comparison-or-vs-pages]/ (if relevant)
```

## Step 6: Content Strategy

### Content Priority Tiers

**Tier 1 — Commercial Intent (highest priority):**
Pages targeting users ready to buy or sign up. These pages directly generate revenue.
Prioritize these first — they have the highest ROI per hour of work.
- Service/product pages
- Pricing pages
- Comparison/vs pages
- "Best [category]" pages targeting high-commercial-intent queries

**Tier 2 — Mid-Funnel Intent:**
Pages targeting users evaluating options or researching solutions.
- "How to choose [product/service]" guides
- Case studies and success stories
- Industry/vertical specific landing pages
- Problem-aware content ("Why [pain point] happens and how to fix it")

**Tier 3 — Informational / Awareness (top of funnel):**
Blog posts and guides targeting users at the beginning of their journey.
- "What is X" posts
- Ultimate guides for core topics
- Industry trend analysis and original research
- Comparisons of general strategies (not product-specific)

### Content Calendar Format

| Month | Title | Type | Target Keyword | Estimated Volume | Tier | Owner |
|-------|-------|------|---------------|-----------------|------|-------|
| Month 1 | [Title] | Service page | [keyword] | XX/mo | 1 | [Name] |
| Month 1 | [Title] | Blog post | [keyword] | XX/mo | 3 | [Name] |

### E-E-A-T Building Plan

For YMYL industries or competitive niches, E-E-A-T is a ranking requirement:
- **Author bios**: Every content piece needs an author with credentials listed
- **About page**: Describe team expertise and company history
- **First-person experience**: Use "we tested", "we found", "in our experience"
- **Data and original research**: Cite primary sources; create original studies
- **Expert contributors**: Quote or interview industry experts
- **Trust signals**: Awards, certifications, media mentions, client logos

## Step 7: Technical Foundation

The technical foundation must be solid before content investment pays off.
Prioritize in this order:

### Must-Have (Day 1)
- [ ] Google Search Console set up and verified
- [ ] Google Analytics 4 set up with conversion tracking
- [ ] XML sitemap generated and submitted to GSC
- [ ] robots.txt configured (don't accidentally block Googlebot)
- [ ] HTTPS on all pages
- [ ] Mobile-responsive design
- [ ] Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1

### Should-Have (Month 1)
- [ ] Canonical tags on all pages
- [ ] Schema markup on core page types
- [ ] Open Graph tags for social sharing
- [ ] 301 redirects for any URL changes
- [ ] Compressed images (WebP/AVIF format)
- [ ] Internal linking structure follows site architecture

### Nice-to-Have (Quarter 1)
- [ ] Structured data for rich results on product/service pages
- [ ] Hreflang if multi-language (see seo-hreflang skill)
- [ ] Image sitemap for image-heavy sites
- [ ] Video sitemap for video content
- [ ] Breadcrumbs with BreadcrumbList schema

### AI Search Readiness (GEO)
AI Overviews and AI-powered search now surface content differently:
- Use question-and-answer structure for how-to and FAQ content
- Include clear, quotable definitions and summaries at the top of articles
- Cite authoritative sources throughout content
- Add Organization and Article schema for brand entity recognition
- Use concise, definitive statements that AI systems can extract and cite

## Step 8: Quick Win vs Long Game Framework

Before the full roadmap, categorize all identified opportunities by impact and time:

### Quick Wins (impact within 30 days)
These require minimal effort and produce measurable results fast. Prioritize these
to build momentum and demonstrate SEO value early:

| Action | Effort | Expected Impact | Timeline |
|--------|--------|-----------------|----------|
| Fix noindex on pages meant to rank | 1-2 hours | Immediate ranking eligibility | Days (after crawl) |
| Improve title tags on high-impression / low-CTR pages | 2-4 hours | 10-30% CTR improvement | 1-2 weeks |
| Add fetchpriority="high" to hero images | 1 hour | LCP improvement | Days |
| Fix broken internal links | 2-4 hours | Crawl efficiency | 1-2 weeks |
| Add schema to existing pages | 2-8 hours | Rich result eligibility | 2-4 weeks |
| Update meta descriptions on top 10 pages | 2 hours | CTR improvement | 1-2 weeks |

Quick wins deliver: proof of concept, early traffic gains, and buy-in from stakeholders.

### Medium-Term (impact in 2-4 months)
- Content depth expansion on underperforming pages with ranking potential
- New pillar content pages for Tier 1 keywords
- Core Web Vitals optimization
- Internal linking restructure to distribute equity to target pages
- Outreach for 5-10 quality backlinks per month

### Long Game (impact in 6-12+ months)
- Domain authority building through consistent link acquisition
- Full content cluster implementation (hub + spoke model)
- E-E-A-T signal development (author credibility, original research)
- Programmatic SEO if applicable
- Thought leadership content and original data studies
- Compounding content refresh program for aging top pages

## Step 9: Implementation Roadmap

### 90-Day Quick-Win Plan (for most sites)

**Days 1-14: Foundation**
- Set up GSC, GA4, and tracking
- Fix critical technical issues (crawl errors, slow pages, missing canonicals, noindex errors)
- Write/optimize the top 3-5 most commercially important pages
- Implement schema on core page types

**Days 15-45: Content Foundation**
- Publish 2-4 pillar content pieces targeting Tier 1 keywords
- Launch blog with 4-6 initial posts targeting Tier 3 keywords
- Build out internal linking structure connecting hub pages to supporting content
- Submit sitemap to GSC; monitor indexation

**Days 46-90: Acceleration**
- Produce 8-12 additional content pieces
- Begin link building outreach (guest posts, PR, partnerships)
- Optimize existing pages based on GSC data (queries with impressions but low CTR)
- Launch programmatic pages if applicable (see seo-programmatic skill)

### Full Phased Roadmap (12 months)

#### Phase 1 — Foundation (Weeks 1-4)
- Technical setup: GSC, GA4, sitemap, robots.txt, HTTPS
- Core page creation: homepage, about, main services/products
- Essential schema implementation
- Core Web Vitals baseline measurement and fixes

#### Phase 2 — Content Expansion (Weeks 5-12)
- Publish Tier 1 commercial pages (all major services/products)
- Launch blog with consistent publishing cadence
- Build internal linking connecting all major pages
- Local SEO setup (if applicable): Google Business Profile, local schema

#### Phase 3 — Authority Building (Weeks 13-24)
- Advanced content: comparison pages, case studies, original research
- Link building: guest posts, digital PR, partner mentions
- GEO optimization: AI search readiness for core content
- Performance tuning: Core Web Vitals optimization

#### Phase 4 — Compounding (Months 7-12)
- Thought leadership content and original studies
- Systematic content refresh for aging top pages
- Advanced programmatic SEO if data sources available
- Continuous competitive monitoring and gap filling

## Output Format

### Deliverables

Produce these documents:

**1. SEO-STRATEGY.md** — Complete strategic overview with business context, goals,
competitive position, and strategic priorities for the year.

**2. SITE-STRUCTURE.md** — URL hierarchy with all planned pages, organized by
content tier, with target keywords and word count targets per page.

**3. CONTENT-CALENDAR.md** — 90-day detailed calendar + 12-month overview.
Columns: Publish Date, Title, URL Slug, Target Keyword, Search Volume, Content Type,
Word Count Target, Tier, Owner, Status.

**4. COMPETITOR-ANALYSIS.md** — For each top 5 competitor: estimated traffic,
content strategy assessment, keyword gap table, link building opportunities.

**5. IMPLEMENTATION-ROADMAP.md** — Phased action plan with specific tasks,
owners, timelines, and success metrics per phase.

### KPI Targets

Set realistic targets based on site stage and resource level:

| Metric | Baseline | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|----------|---------|---------|---------|----------|
| Monthly Organic Sessions | XX | XX | XX | XX | XX |
| Keywords in Top 10 | XX | XX | XX | XX | XX |
| Keywords in Top 3 | XX | XX | XX | XX | XX |
| Domain Rating / Authority | XX | XX | XX | XX | XX |
| Indexed Pages | XX | XX | XX | XX | XX |
| LCP Score (75th pct) | XXs | <2.5s | <2.5s | <2.5s | <2.0s |
| Core Web Vitals Pass Rate | XX% | XX% | 75%+ | 80%+ | 90%+ |

**What to measure at each milestone:**
- **Month 1**: Technical health (GSC errors fixed, indexation rate, CWV baseline)
- **Month 3**: Content indexed and ranking (keywords with impressions, CTR trends)
- **Month 6**: Traffic growth vs baseline, first conversions from organic
- **Month 12**: ROI on SEO investment, compound growth rate, keyword velocity

### Success Criteria Per Phase

Each phase must have clear pass/fail criteria before moving to the next:
- Phase 1 pass: GSC verified, sitemap submitted, 0 critical technical errors, core pages live
- Phase 2 pass: Blog launched, 10+ posts published, GSC shows indexation growth
- Phase 3 pass: First backlinks from real domains, Core Web Vitals green, content calendar on track
- Phase 4 pass: Measurable organic traffic growth vs baseline, keyword rankings moving up
