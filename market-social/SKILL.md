---
name: market-social
description: >
  30-day social media content calendar with ready-to-publish posts. Triggers:
  "social media strategy", "content calendar", "calendario de redes sociales",
  "posts para Instagram", "LinkedIn content", "TikTok ideas", "hashtags",
  "social media marketing", "quiero publicar en redes", "contenido social",
  "content creation", "cómo crecer en redes sociales", "content repurposing".
---

# Social Media Content Calendar & Generation

Generate a complete 30-day content calendar with platform-specific posts, hooks, hashtags, and repurposing strategy. Output to `SOCIAL-CALENDAR.md`.

## Invocation

Run as `/market social <topic/url>`. If URL, fetch to understand brand/audience/themes. If topic, build strategy around it.

---

## Phase 1: Brand and Audience Discovery

### 1.1 Brand Context

Establish before generating content:

| Context Element | Source |
|----------------|--------|
| Brand name | URL or user input |
| Industry | Site analysis |
| Target audience | About page, copy, user input |
| Brand voice | Existing social/site copy |
| Key products/services | Product/pricing pages |
| Unique selling points | Homepage, feature pages |
| Competitors | Industry analysis |

### 1.2 Platform Selection

Select 2-3 primary platforms. Platform specs and content type mixes: `references/social-platform-specs.md`.

| Platform | Best For |
|----------|---------|
| LinkedIn | B2B, SaaS, agencies, consultants |
| Twitter/X | Tech, media, real-time commentary |
| Instagram | E-commerce, lifestyle, creators |
| TikTok | Consumer brands, education, creators |
| YouTube | Long-form education, SaaS demos |
| Facebook | Local business, communities, older demographics |

---

## Phase 2: Content Strategy Framework

### 2.1 Content Pillars

Define 4-5 pillars:

| Pillar | Type | % of Content |
|--------|------|-------------|
| 1 | Educational | 40% |
| 2 | Behind-the-Scenes | 20% |
| 3 | Social Proof | 15% |
| 4 | Engagement | 15% |
| 5 | Promotional | 10% |

### 2.2 Content Types by Platform

Detailed content type mixes and technical specs: `references/social-platform-specs.md`. Use formats each platform's algorithm rewards.

---

## Phase 3: Hooks and Opening Lines

The first line/3 seconds determines read vs scroll. Full hook formula libraries: `references/social-platform-specs.md`.

Core hook categories: Curiosity gap, Contrarian, Specific result, Audience call-out, Story setup, Number promise.

Write at least 2 hook variants for each anchor post.

---

## Phase 4: Hashtag Strategy

Tiered approach per post:

| Tier | Post Count Range | Count |
|------|-----------------|-------|
| Niche | Under 100K | 3-5 |
| Mid-size | 100K-1M | 3-5 |
| Broad | 1M+ | 2-3 |
| Branded | Custom | 1 |

Platform-specific counts and research process: `references/social-platform-specs.md`.

For each pillar, build: 5 niche + 5 mid-size + 3 broad + 1 branded hashtags.

---

## Phase 5: Content Repurposing

### 5.1 The 1-to-10 Framework

Create one anchor piece, extract 10+ derivative posts. Full repurposing map and schedule: `references/social-platform-specs.md`.

Include a repurposing plan for at least 2 anchor pieces in the calendar.

### 5.2 Repurposing Schedule

| Day | Action |
|-----|--------|
| 1 | Publish anchor content |
| 1-2 | LinkedIn insight + Tweet thread |
| 3 | Instagram carousel + Reel |
| 5 | TikTok + YouTube Short |
| 7 | Different angle post |
| 10 | Engagement question |
| 14 | Reshare with new framing |

---

## Phase 6: Engagement Tactics

Include throughout calendar:
- **Questions** (end 30% of posts): "What's your biggest challenge with [topic]?", "Agree or disagree?", "Which one are you? A/B/C"
- **Polls** (1-2x/week): preference questions, behavior frequency, either/or
- **Contrarian posts** (1-2x/week): challenge common advice, declare something "dead", share honest truths
- **Storytelling** (1-2x/week): transformation journeys, lessons from failures

---

## Phase 7: 30-Day Content Calendar

### 7.1 Calendar Format

```
DAY 1 (Monday):
  [Platform 1]: [Pillar - Type]
    Hook: "[Opening line]"
    Post: [Full post text — ready to copy-paste]
    Visual: [Image/video/carousel description]
    Hashtags: #tag1 #tag2 #tag3
    Time: [recommended send time]
    Type: [text post / carousel / reel / thread / etc.]

  [Platform 2]: [Pillar - Type]
    [Same structure]
```

### 7.2 Calendar Distribution Rules

- Each pillar appears at least 6 times across the month
- Promotional content never on two consecutive days
- Engagement posts every 2-3 days
- Mix of content types — avoid same-format runs
- Leave 4-6 "trend response" slots with adaptation guidance

### 7.3 Weekly Themes

- Week 1: Awareness / problem identification
- Week 2: Education / authority building
- Week 3: Social proof / results
- Week 4: Consideration / calls to action

---

## Phase 8: Trending Formats

Evergreen formats and algorithm notes: `references/social-platform-specs.md`. Include at least 4 proven formats: Listicle thread, This vs That, Day in the Life, Tutorial Reel, Hot Take, Before/After, Myth vs Reality, Fill in the Blank, POV, Reaction, Tutorial Carousel, Data Reveal.

**Trend adaptation:** Identify format -> find brand angle -> adapt within 24-48h -> add unique value.

---

## Output Format

Formato de salida: ver `references/output-template.md`.

---

## Cross-Skill Integration

- If `BRAND-VOICE.md` exists, match all copy to documented voice
- If `COPY-SUGGESTIONS.md` exists, reuse value propositions
- If `COMPETITOR-REPORT.md` exists, use for differentiation content
- If `EMAIL-SEQUENCES.md` exists, align with email campaign themes
- Suggest follow-up: `/market copy` for website messaging, `/market ads` for paid amplification of top organic content
