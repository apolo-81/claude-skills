---
name: market-landing
description: >
  Análisis CRO de landing pages — identifica por qué no convierten y cómo mejorarlas.
  Usar cuando: "analiza mi landing", "por qué no convierte", "auditoría CRO",
  "mejorar tasa de registro", "hero section", "social proof", "A/B test",
  "optimizar CTA", "página de captura", "checkout". Genera LANDING-CRO.md.
---

# Landing Page CRO Analysis

Section-by-section CRO teardown with prioritized, actionable fixes. Uses a 7-Point CRO Framework analyzing in visitor experience order: hero -> value prop -> social proof -> features -> objections -> CTA -> footer.

## When to Use

- User provides a landing page URL for conversion optimization
- Triggered by `/market landing <url>` or `/market cro <url>`

---

## Step 1: Identify the Page Type

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

Score each section 1-10. Provide specific observations, not generic advice.

### Section 1: Hero Section (Weight: 25%)

**Checklist:**
- [ ] Headline visible within 2 seconds, communicates primary benefit, under 10 words
- [ ] Subheadline expands with specificity
- [ ] Primary CTA above fold, contrasting color, action-oriented text
- [ ] Hero image/video supports message (not generic stock)
- [ ] Trust badges or social proof above fold
- [ ] Page loads under 3 seconds
- [ ] No nav menu competing with CTA (dedicated landing pages)

**Scoring:** 9-10 = benefit headline + clear CTA + visual + trust; 7-8 = strong but missing one element; 5-6 = generic headline or weak CTA; 3-4 = feature-focused/vague, CTA below fold; 1-2 = no clear headline or CTA.

### Section 2: Value Proposition (Weight: 20%)

**Checklist:**
- [ ] Clear what product/service does
- [ ] Specific outcomes/results promised
- [ ] Differentiation from alternatives
- [ ] Target audience is clear
- [ ] Benefits quantified where possible
- [ ] Scannable (not buried in paragraphs)

**Evaluate with 4U:** Useful, Urgent, Unique, Ultra-specific.

### Section 3: Social Proof (Weight: 15%)

**Types ranked by persuasion:** (1) Revenue/results metrics, (2) Named testimonials with photos, (3) Client logos, (4) Case studies with results, (5) Star ratings, (6) Media mentions, (7) Certifications, (8) UGC.

**Checklist:**
- [ ] At least 2 types present
- [ ] Testimonials include real names, photos, specific results
- [ ] Placed near decision points (close to CTAs)
- [ ] Numbers are specific (not rounded)
- [ ] Recent and relevant

### Section 4: Features and Benefits (Weight: 15%)

**Checklist:**
- [ ] Features translated into benefits
- [ ] Scannable (icons, bullets, short paragraphs)
- [ ] Visual hierarchy guides eye
- [ ] Most important listed first
- [ ] Screenshots/demos/visuals accompany descriptions
- [ ] 3-7 key features (not overwhelming)

### Section 5: Objection Handling (Weight: 10%)

| Objection | How to Address |
|-----------|---------------|
| "Too expensive" | ROI calculator, guarantee |
| "Not sure it works" | Case studies, free trial, demo |
| "Too complicated" | Setup wizard, "5 minutes" claim |
| "What if I don't like it?" | Free trial, money-back, cancel anytime |
| "Is my data safe?" | Security badges, compliance logos |

**Checklist:**
- [ ] FAQ addresses top 3-5 objections
- [ ] Risk reversals present
- [ ] Pricing transparency
- [ ] Security/privacy indicators

### Section 6: Call-to-Action (Weight: 10%)

**Checklist:**
- [ ] CTA text describes VALUE ("Get My Free Report" not "Submit")
- [ ] Visually dominant (size, color, whitespace)
- [ ] Appears multiple times on long pages
- [ ] Secondary CTA for not-ready visitors
- [ ] Supporting microcopy ("No credit card required")
- [ ] First person ("Start MY trial")
- [ ] Specific to offer

### Section 7: Footer and Secondary Elements (Weight: 5%)

**Checklist:**
- [ ] Final CTA at bottom
- [ ] Contact/support visible
- [ ] Privacy/terms linked
- [ ] Trust badges near final CTA
- [ ] No competing links away from conversion

---

## Step 3: Copy Scoring

Score 1-10 each: **Clarity**, **Urgency**, **Specificity**, **Proof**, **Action Orientation**.

Copy Score = average x 10 (0-100).

---

## Step 4: Form Optimization Audit

If page has a form:

| Element | Best Practice |
|---------|--------------|
| Field count | Lead capture: 3-5 max. Each extra field costs ~7% conversion |
| Labels | Inline or floating. Avoid placeholder-only |
| Button text | Match value prop. "Get My Free Guide" > "Submit" |
| Error handling | Inline validation, specific messages, don't clear form |
| Multi-step | Break long forms into steps with progress indicator |
| Auto-fill | Enable browser auto-fill for standard fields |

---

## Step 5: Mobile Responsiveness Audit

- [ ] CTA thumb-reachable (bottom half)
- [ ] Text readable without zoom (16px min)
- [ ] Forms usable on mobile (large tap targets)
- [ ] Images resize properly
- [ ] No horizontal scroll
- [ ] Loads under 3s on 4G
- [ ] Click-to-call for phone numbers
- [ ] Sticky CTA bar on scroll

---

## Step 6: Page Speed Impact

| Load Time | Conversion Impact |
|-----------|------------------|
| 0-2s | Baseline (optimal) |
| 2-3s | -7% |
| 3-5s | -20% |
| 5-8s | -35% |
| 8+s | -50%+ |

Flag: unoptimized images, render-blocking JS, missing caching, no CDN, excessive third-party scripts.

---

## Step 7: A/B Test Recommendations

Format: "If we [CHANGE], then [METRIC] will [IMPROVE] because [REASON]."

Priority tests: (1) Headline variations, (2) CTA button color/text, (3) Social proof placement, (4) Form field count, (5) Hero image vs video, (6) Long vs short page, (7) Urgency elements, (8) Price presentation, (9) Testimonial format, (10) Chat widget.

---

## Step 8: Heat Map Guidance

Without actual data, provide guidance on:
- Expected attention zones based on layout
- F-pattern vs Z-pattern reading
- Scroll depth predictions
- Click probability zones
- Rage click indicators (elements looking clickable but aren't)
- Dead zones

---

## Output Format

Formato de salida: ver `references/output-template.md`.

---

## Related Skills

- **`landing-page-builder`** — Once CRO analysis identifies fixes, use to implement code (Next.js + Tailwind components).

## Key Principles

- Tie recommendations to revenue impact with specific estimates
- Prioritize by effort-to-impact ratio
- Be specific: not "improve headline" but "change from 'Welcome' to 'Cut Reporting Time by 75%'"
- Reference industry benchmarks
- If `MARKETING-AUDIT.md` exists, incorporate Conversion Optimization score
