---
name: market-landing
description: >
  Landing page CRO (Conversion Rate Optimization) analysis. Triggers:
  "analyze my landing page", "why isn't my page converting", "CRO audit",
  "improve my signup rate", "optimize my product page", "conversion analysis",
  "review my checkout page", "A/B test", "hero section", "value proposition",
  "social proof", "CTA optimization", "lead capture page". Produces
  LANDING-CRO.md.
---

# Landing Page CRO Analysis

Perform a comprehensive Conversion Rate Optimization (CRO) analysis on any landing page. This skill produces a section-by-section teardown with prioritized, actionable fixes that directly impact conversion rates.

The 7-Point CRO Framework used here is structured around the sequence a visitor experiences: they see the hero first, evaluate the value proposition, look for social proof, explore features, encounter objections, reach the CTA, and finally see the footer. Analyzing in this order mirrors the visitor's decision-making process and ensures recommendations are sequenced by impact.

## When to Use

- User provides a landing page URL and asks for conversion optimization
- User asks for landing page feedback, review, or audit
- User wants to improve signup, lead capture, or purchase rates
- Triggered by `/market landing <url>` or `/market cro <url>`

---

## Step 1: Identify the Page Type

Determine which type of landing page you are analyzing. This affects benchmark expectations and how you weight each section's findings.

| Page Type | Primary Goal | Good CR | Great CR |
|-----------|-------------|---------|---------|
| Lead Capture | Email/form submission | 5-10% | 15%+ |
| SaaS Signup | Free trial or freemium | 3-7% | 10%+ |
| E-commerce Product | Add to cart / Purchase | 2-4% | 5%+ |
| Webinar Registration | Register for event | 20-30% | 40%+ |
| App Download | Install app | 10-15% | 20%+ |
| Waitlist | Join waitlist | 15-25% | 35%+ |
| Consultation Booking | Schedule a call | 5-10% | 15%+ |
| Nonprofit Donation | Make a donation | 2-5% | 8%+ |

---

## Step 2: Run the 7-Point CRO Framework

Analyze each section in order. Score each section 1-10. Provide specific observations, not generic advice.

### Section 1: Hero Section (Weight: 25%)

The first screen a visitor sees. Research consistently shows that 80% of conversion decisions are made or abandoned here — which is why this section carries the highest weight in the framework.

**Checklist:**
- [ ] Headline is visible within 2 seconds of page load
- [ ] Headline communicates the primary benefit (not a feature)
- [ ] Headline is under 10 words
- [ ] Subheadline expands on the headline with specificity
- [ ] Primary CTA is above the fold
- [ ] CTA button color contrasts with the background
- [ ] CTA text is action-oriented (not "Submit" or "Click Here")
- [ ] Hero image or video supports the message (not generic stock)
- [ ] Trust badges or social proof visible above the fold
- [ ] Page loads in under 3 seconds
- [ ] No navigation menu competing with the CTA (for dedicated landing pages)

**Scoring:**
- 9-10: Benefit-driven headline, clear contrasting CTA, visual supports message, trust indicators present
- 7-8: Strong headline and CTA but missing one element
- 5-6: Generic headline or weak CTA, missing multiple above-the-fold elements
- 3-4: Feature-focused or vague headline, CTA below the fold or unclear
- 1-2: No clear headline or CTA; visitor cannot understand the offer in 5 seconds

### Section 2: Value Proposition (Weight: 20%)

How clearly the page communicates WHY someone should convert. A weak value prop is the single most common cause of high bounce rates — visitors leave not because of design, but because they don't immediately see why this solution is for them.

**Checklist:**
- [ ] Clear statement of what the product/service does
- [ ] Specific outcomes or results promised
- [ ] Differentiation from alternatives (why THIS solution)
- [ ] Target audience is clear (visitor knows if this is for them)
- [ ] Benefits are quantified where possible (save X hours, increase Y%)
- [ ] Value proposition is scannable (not buried in paragraphs)

**Evaluate Using the 4U Framework:**
1. **Useful** — Does it solve a real problem the visitor has?
2. **Urgent** — Is there a reason to act now?
3. **Unique** — Is it different from competitors?
4. **Ultra-specific** — Are claims concrete, not vague?

### Section 3: Social Proof (Weight: 15%)

Evidence that others trust and benefit from this product/service. Visitors discount claims made by the company itself — they trust what other people say. Social proof placed near decision points is the fastest way to reduce purchase anxiety.

**Types of Social Proof (ranked by persuasion power):**
1. Revenue/results metrics ("$2.4B processed", "500K users")
2. Named customer testimonials with photos, titles, and companies
3. Recognizable client logos
4. Case studies with specific results
5. Star ratings and review counts
6. Media mentions ("As seen in...")
7. Certifications and awards
8. User-generated content

**Checklist:**
- [ ] At least 2 types of social proof present
- [ ] Testimonials include real names and photos
- [ ] Testimonials mention specific results or outcomes
- [ ] Social proof is placed near decision points (close to CTAs)
- [ ] Numbers are specific (not rounded — "11,847" beats "10,000+")
- [ ] Logos are recognizable to the target audience
- [ ] Social proof is recent and relevant

### Section 4: Features and Benefits (Weight: 15%)

How the page presents what the product/service includes. Features describe capabilities; benefits describe what those capabilities mean for the user. Pages that lead with features instead of benefits consistently underperform.

**Checklist:**
- [ ] Features are translated into benefits (what the feature DOES for the user)
- [ ] Content is scannable (icons, bullet points, short paragraphs)
- [ ] Visual hierarchy guides the eye through features
- [ ] Most important features/benefits are listed first
- [ ] Each feature section has a clear mini-headline
- [ ] Screenshots, demos, or visuals accompany feature descriptions
- [ ] Feature list is comprehensive but not overwhelming (3-7 key features)

**Feature-to-Benefit Translation Check:**

Bad: "AI-powered analytics dashboard"
Good: "See exactly which campaigns drive revenue — AI analyzes your data so you don't have to"

### Section 5: Objection Handling (Weight: 10%)

How the page addresses reasons a visitor might NOT convert. Every visitor who doesn't convert has an objection. If the page doesn't proactively address the top 3-5 objections, those visitors leave.

| Objection | How to Address |
|-----------|---------------|
| "Too expensive" | ROI calculator, price comparison, money-back guarantee |
| "Not sure it works" | Case studies, free trial, demo video |
| "Too complicated" | Setup wizard, onboarding support, "get started in 5 minutes" |
| "Not sure I need it" | Problem agitation, cost of inaction |
| "What if I don't like it?" | Free trial, money-back guarantee, cancel anytime |
| "Is my data safe?" | Security badges, compliance logos, privacy policy link |
| "I need to ask my team" | Shareable comparison page, team trial, ROI one-pager |

**Checklist:**
- [ ] FAQ section addresses top 3-5 objections
- [ ] Risk reversals present (guarantee, free trial, cancel anytime)
- [ ] Pricing transparency (no hidden fees or surprise costs)
- [ ] Security and privacy indicators where relevant
- [ ] Comparison with alternatives (if applicable)

### Section 6: Call-to-Action (Weight: 10%)

The conversion mechanism itself. A well-designed CTA removes the final barrier to action — it makes the next step feel obvious, low-risk, and immediately valuable.

**CTA Button Checklist:**
- [ ] CTA text describes the VALUE, not the action ("Get My Free Report" vs "Submit")
- [ ] CTA button is visually dominant (size, color, whitespace)
- [ ] CTA appears multiple times on long pages
- [ ] Secondary CTA exists for visitors not ready to commit
- [ ] CTA has supporting microcopy (e.g., "No credit card required")
- [ ] Button text uses first person ("Start MY trial" vs "Start YOUR trial")
- [ ] CTA is specific to the offer (not generic)

**CTA Copy Scoring:**
- Weak: "Submit", "Click Here", "Learn More"
- Medium: "Sign Up", "Get Started", "Download Now"
- Strong: "Start My Free Trial", "Get My Custom Report", "Claim Your Discount"

### Section 7: Footer and Secondary Elements (Weight: 5%)

The bottom of the page and supporting elements. Many visitors scroll to the footer before converting — it's where they look for trust signals and legal information.

**Checklist:**
- [ ] Final CTA present at bottom of page
- [ ] Contact information or support options visible
- [ ] Privacy policy and terms of service linked
- [ ] Trust badges repeated near final CTA
- [ ] No competing links that lead away from conversion
- [ ] Copyright and legal information present

---

## Step 3: Copy Scoring

Score the overall page copy on 5 dimensions (1-10 each):

1. **Clarity** — Can a visitor understand the offer in 5 seconds?
2. **Urgency** — Is there a reason to act NOW vs later?
3. **Specificity** — Are claims concrete with numbers, timeframes, outcomes?
4. **Proof** — Are claims backed by evidence, data, or testimonials?
5. **Action Orientation** — Does the copy drive toward a specific next step?

Copy Score = average of all 5 dimensions × 10 (result: 0-100)

---

## Step 4: Form Optimization Audit

If the page has a form, evaluate each element. Forms are the most measurable source of conversion loss — every additional field reduces conversion by approximately 7%.

| Element | Best Practice |
|---------|--------------|
| Field count | Lead capture: 3-5 fields max. Every extra field costs ~7% conversion. |
| Labels | Use inline or floating labels. Avoid placeholder-only labels. |
| Button text | Match the value proposition. "Get My Free Guide" > "Submit". |
| Error handling | Inline validation. Specific error messages. Don't clear the form on error. |
| Multi-step | Break long forms into steps with a progress indicator. |
| Required vs optional | Mark optional fields, not required ones. |
| Auto-fill | Enable browser auto-fill for standard fields. |
| Field types | Use email, tel, url input types for correct mobile keyboards. |

---

## Step 5: Mobile Responsiveness Audit

Mobile accounts for 60%+ of web traffic. A page that converts on desktop but fails on mobile is losing the majority of its potential customers.

- [ ] CTA is thumb-reachable (bottom half of screen)
- [ ] Text is readable without zooming (16px minimum body text)
- [ ] Forms are usable on mobile (large tap targets, appropriate keyboards)
- [ ] Images resize properly and don't break layout
- [ ] No horizontal scrolling required
- [ ] Page loads under 3 seconds on 4G
- [ ] Click-to-call for phone numbers
- [ ] Sticky CTA bar on scroll (if applicable)

---

## Step 6: Page Speed Impact Assessment

Every second of load time costs conversions. Reference these benchmarks when diagnosing speed issues:

| Load Time | Conversion Impact |
|-----------|------------------|
| 0-2 seconds | Baseline (optimal) |
| 2-3 seconds | -7% conversion rate |
| 3-5 seconds | -20% conversion rate |
| 5-8 seconds | -35% conversion rate |
| 8+ seconds | -50%+ conversion rate |

Common speed issues to flag:
- Unoptimized images (use WebP, lazy loading)
- Render-blocking JavaScript
- Missing browser caching
- No CDN
- Excessive third-party scripts

---

## Step 7: A/B Test Recommendations

Format each test as a hypothesis using this template:

"If we [CHANGE], then [METRIC] will [IMPROVE/INCREASE] because [REASON]."

Priority tests to recommend:
1. Headline variations (benefit-focused vs outcome-focused)
2. CTA button color and text
3. Social proof placement (above vs below fold)
4. Form field count (reduce by 1-2 fields)
5. Hero image vs hero video
6. Long-form vs short-form page
7. Adding urgency elements (countdown, limited spots)
8. Price anchoring and presentation
9. Testimonial format (text vs video)
10. Adding a chatbot or live chat widget

---

## Step 8: Heat Map Interpretation Guidance

Even without actual heat map data, provide guidance on:

- **Expected attention zones** based on page layout
- **F-pattern vs Z-pattern** reading based on content density
- **Scroll depth predictions** based on page length and content breaks
- **Click probability zones** based on visual hierarchy
- **Rage click indicators** (elements that look clickable but aren't)
- **Dead zones** where content may be ignored

---

## Output Format: LANDING-CRO.md

```markdown
# Landing Page CRO Analysis
## [Page URL]
### Analysis Date: [date]

---

## Overall CRO Score: [X/100]

**Page Type:** [identified type]
**Current Estimated Conversion Rate:** [estimate based on findings]
**Target Conversion Rate:** [realistic improvement target]

---

## Section-by-Section Analysis

### 1. Hero Section [Score: X/10]
**Findings:**
- [specific observations]

**Fixes (Priority: HIGH/MEDIUM/LOW):**
- [specific, actionable recommendations]

[Repeat for all 7 sections]

---

## Copy Score: [X/100]
| Dimension | Score | Notes |
|-----------|-------|-------|
| Clarity | X/10 | [notes] |
| Urgency | X/10 | [notes] |
| Specificity | X/10 | [notes] |
| Proof | X/10 | [notes] |
| Action Orientation | X/10 | [notes] |

---

## Form Audit
[findings and recommendations]

---

## Mobile Audit
[findings and recommendations]

---

## A/B Test Recommendations
1. [Hypothesis format test]
2. [Hypothesis format test]
3. [Hypothesis format test]

---

## Prioritized Fix List

### Quick Wins (implement this week)
1. [fix with expected impact]

### Medium-Term (implement this month)
1. [fix with expected impact]

### Strategic (implement this quarter)
1. [fix with expected impact]

---

## Before/After Wireframe Suggestions
[Text-based wireframe descriptions of current vs recommended layout]
```

---

## Key Principles

- Always tie recommendations to revenue impact. Don't just say "change the button color" — say "changing the CTA button to a contrasting color typically increases clicks 15-30%, which at your current traffic could mean X more conversions per month."
- Prioritize fixes by effort-to-impact ratio. Quick wins first, then structural changes.
- Be specific. "Improve your headline" is useless. "Change your headline from 'Welcome to Our Platform' to 'Cut Your Reporting Time by 75% — Automated Analytics for Growth Teams' because it adds specificity, a quantified benefit, and targets a specific audience" is actionable.
- Reference industry benchmarks so the client understands where they stand relative to peers.
- If `MARKETING-AUDIT.md` exists in the working directory, incorporate the Conversion Optimization score and findings for a more complete picture.
