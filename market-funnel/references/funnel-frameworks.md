# Funnel Analysis Reference: Frameworks, Benchmarks & Optimization Patterns

## Funnel Type Identification

| Funnel Type | Business Model | Typical Steps | Primary Metric |
|-------------|---------------|---------------|----------------|
| Lead Gen | Services, agencies, B2B | Landing → Form → Thank you → Nurture → Sales call | Lead-to-close rate |
| SaaS Free Trial | SaaS products | Homepage → Pricing → Signup → Onboarding → Upgrade | Trial-to-paid rate |
| SaaS Demo | Enterprise SaaS | Homepage → Features → Demo request → Sales call → Close | Demo-to-close rate |
| E-commerce | Online stores | Product page → Cart → Checkout → Upsell → Thank you | Cart-to-purchase rate |
| Webinar | Courses, coaches, SaaS | Opt-in → Confirmation → Reminder → Live → Offer → Checkout | Webinar-to-sale rate |
| Application | Premium services, programs | Info page → Application → Review → Interview → Accept | Application-to-accept rate |
| Community | Memberships | Landing → Free trial → Engage → Paid membership | Free-to-paid rate |
| Content | Media, publishers | Blog → Email capture → Nurture → Premium → Subscribe | Reader-to-subscriber rate |

---

## Conversion Benchmarks by Funnel Type

| Funnel Stage | Baseline | Good | Great | Elite |
|-------------|---------|------|-------|-------|
| Lead Gen (visitor → form) | 1-2% | 3-5% | 5-10% | 10-20% |
| SaaS Free Trial signup | 1-2% | 2-5% | 5-10% | 10-15% |
| Trial to Paid | 5-10% | 10-15% | 15-25% | 25-40% |
| E-commerce browse to buy | 0.5-1% | 1-3% | 3-5% | 5-8% |
| Cart to Purchase | 35-50% | 50-60% | 60-70% | 70-80% |
| Webinar Registration | 10-20% | 20-40% | 40-55% | 55-70% |
| Webinar Attendance | 20-30% | 30-40% | 40-55% | 55-65% |
| Webinar to Sale | 1-2% | 2-5% | 5-10% | 10-20% |
| Demo to Close | 10-15% | 15-25% | 25-40% | 40-60% |
| Cold Email Reply | 1-3% | 3-5% | 5-10% | 10-20% |
| Application Acceptance | 20-30% | 30-50% | 50-70% | 70-90% |

---

## Page Scoring Framework

For each page in the funnel, score these 5 dimensions (0-10 each):

| Dimension | Score | What to Evaluate |
|-----------|-------|-----------------|
| Clarity | 0-10 | Is the page's purpose immediately obvious? Can a stranger explain it in 5 seconds? |
| Continuity | 0-10 | Does this page logically flow from the previous step? Is there message match? |
| Motivation | 0-10 | Does it provide sufficient reason to take the next action? |
| Friction | 0-10 | How easy is it to complete the desired action? (10 = frictionless, zero obstacles) |
| Trust | 0-10 | Are trust signals appropriate for this stage of commitment? |

**Page Score = Average of 5 dimensions**
- 8-10: Optimized — maintain and iterate
- 6-7: Functional — targeted improvements
- 4-5: Problematic — priority redesign
- 0-3: Critical — immediate fix required

---

## Drop-Off Diagnosis by Stage

### Homepage → Next Step

| Drop-Off Cause | Signal | Fix |
|----------------|--------|-----|
| Unclear value proposition | Vague headline, no specificity, jargon | Rewrite headline with specific, measurable outcome |
| No clear CTA | Multiple equal-weight CTAs, CTA below fold | Single primary CTA above fold |
| Slow load time | >3 seconds load, large images, render-blocking JS | Compress images, defer non-critical scripts |
| Poor mobile experience | Text too small, buttons too close, horizontal scroll | Mobile-first redesign |
| No trust signals | No social proof above fold | Add customer count, logos, or testimonial above fold |

### Pricing Page

| Drop-Off Cause | Signal | Fix |
|----------------|--------|-----|
| Price shock | No value framing before showing numbers | Add value summary before pricing section |
| Too many options | 4+ plans, feature matrix overload | Reduce to 3 plans (or 3 + enterprise), highlight one |
| Hidden costs | Fees only visible at checkout | Show total cost transparently on pricing page |
| No social proof | No testimonials near CTAs | Add 1-2 customer quotes adjacent to each plan |
| Unanswered objections | High bounce, low scroll depth | FAQ section addressing top 5 purchase objections |
| Weak plan names | "Basic / Standard / Premium" | Aspirational names ("Starter / Growth / Scale") |

### Signup/Registration

| Drop-Off Cause | Signal | Fix |
|----------------|--------|-----|
| Too many fields | 5+ required fields | Reduce to 3 or fewer for initial signup |
| Premature account requirement | Must register to see content | Allow preview or trial without account creation |
| Multi-step with no progress | Long form, no indicators | Step counter: "Step 1 of 3" |
| No social login | Only email/password | Add Google, GitHub, or Apple SSO |
| Missing trust signals | No privacy note, no security indicators | "We never spam" note, SSL badge, privacy link |

### Checkout/Purchase

| Drop-Off Cause | Signal | Fix |
|----------------|--------|-----|
| Surprise shipping | Shipping cost only at final step | Show shipping estimate early, offer free threshold |
| Forced account creation | Must register to complete purchase | Guest checkout option |
| Limited payment methods | Credit card only | Add PayPal, Apple Pay, Google Pay, BNPL |
| No urgency | No reason to buy today vs tomorrow | Low stock indicator, time-limited bonus, countdown |
| No guarantee | Return policy buried or absent | Money-back guarantee badge near CTA |
| Long form | 20+ fields in checkout | Autofill, address lookup, saved payment methods |

---

## Revenue Impact Calculation Framework

### Why Revenue Per Visitor (RPV) Is the Master Metric

RPV collapses all funnel variables into a single number that answers: "What is each visitor worth to my business?" This makes it the definitive way to measure and communicate the value of any optimization.

**Formula:**
```
RPV = Monthly Revenue / Monthly Visitors

Expanded:
RPV = Conversion Rate × Average Order Value
```

**Why this matters for prioritization:**
Every optimization recommendation should be translated into RPV impact. A 1% improvement in conversion on a site with $2 RPV adds $0.02 per visitor — which sounds small until you multiply by 50,000 monthly visitors ($1,000/month = $12,000/year). This reframing helps stakeholders understand why CRO investment pays off.

### Improvement Scenario Template

```
Current State:
  Monthly Visitors:     [X]
  Conversion Rate:      [X]%
  Average Order Value:  $[X]
  Monthly Revenue:      $[X]
  RPV:                  $[X]

Scenario A: Improve conversion rate by [X]%
  New Conversion Rate:  [X]%
  New Monthly Revenue:  $[X]
  Monthly Lift:         $[X]
  Annual Lift:          $[X]

Scenario B: Improve AOV by [X]%
  New AOV:              $[X]
  New Monthly Revenue:  $[X]
  Monthly Lift:         $[X]
  Annual Lift:          $[X]

Scenario C: Combined improvement
  New Conversion:       [X]%
  New AOV:              $[X]
  New Monthly Revenue:  $[X]
  Monthly Lift:         $[X]
  Annual Lift:          $[X]
```

### How to Estimate Lift Percentages

Use these conservative estimates when no A/B test data is available:

| Optimization | Conservative Lift | Aggressive Lift | Source |
|-------------|-----------------|-----------------|--------|
| Headline rewrite | 10-20% | 20-40% | CXL Institute |
| CTA text change | 5-15% | 15-30% | VWO studies |
| Social proof addition | 5-15% | 15-25% | Nielsen Norman |
| Form field reduction | 5-10% per field removed | — | Unbounce |
| Page speed (1s improvement) | 5-10% | 10-20% | Google |
| Pricing page redesign | 10-20% | 20-40% | CRO practitioners |
| Checkout friction reduction | 5-15% | 15-30% | Baymard Institute |
| Money-back guarantee | 10-20% | — | CXL |
| Exit-intent popup | 2-5% of exiting visitors | — | Sumo |
| Cart abandonment email | 5-15% of carts | — | Klaviyo |

Always present the conservative estimate in recommendations and note the upside. Overpromising on lift damages credibility.

---

## Funnel-to-Email Sequence Mapping

| Funnel Stage | Visitor Status | Recommended Email Sequence | Goal |
|-------------|---------------|---------------------------|------|
| Anonymous visitor | No email | Retargeting ads | Bring back for second visit |
| Lead (opted in) | Cold | Welcome sequence (5-7 emails) | Build trust, introduce product |
| Engaged lead | Warm | Nurture sequence (6-8 emails) | Educate, handle objections |
| Trial user | Active | Onboarding sequence (5-7 emails) | Drive activation, show value |
| Inactive trial | At-risk | Re-engagement sequence (3-4 emails) | Win back or clean from list |
| Customer | Retained | Post-purchase / loyalty sequence | Reduce churn, upsell |
| Churned customer | Lost | Win-back sequence (3-4 emails) | Recover or get referral |

---

## Traffic Source Alignment

Different traffic sources arrive with different intent levels and trust. Send each source to the funnel entry point that matches their readiness:

| Source | Intent | Trust Level | Best Entry Point | Funnel Length |
|--------|--------|-------------|-----------------|---------------|
| Branded search | High | High | Pricing or signup page | Short (direct to conversion) |
| Non-branded search | Medium | Low | Blog or educational landing page | Medium (educate then convert) |
| Paid social (cold) | Low | None | Lead magnet or content offer | Long (capture, nurture, convert) |
| Referral traffic | Medium-High | Medium | Homepage or product page | Medium (trust partially built) |
| Direct | High | High | Homepage | Short (they know the brand) |
| Email click | Medium | Medium-High | Specific landing page | Targeted (match email message) |
| Affiliate | Varies | Medium | Dedicated landing page | Medium (tailored to affiliate audience) |

**Why this matters:** Sending high-intent branded searchers to a lead magnet page wastes their buying intent. Sending cold social traffic directly to a pricing page creates confusion and high bounce rates. Matching source to entry point is one of the highest-leverage optimizations with zero design work required.

---

## Pricing Page Audit Checklist

- [ ] Headline frames value, not cost ("Choose your growth plan" vs "Pricing")
- [ ] Plans limited to 3 (or 3 + enterprise contact)
- [ ] One plan highlighted as "Most Popular" or "Best Value"
- [ ] Annual pricing shown first with monthly savings highlighted
- [ ] Features described as benefits, not technical specifications
- [ ] Social proof (testimonials, customer count) appears near pricing
- [ ] FAQ section addresses top 5 purchase objections
- [ ] Money-back guarantee or free trial prominently displayed
- [ ] Plan names are aspirational ("Starter / Growth / Scale" not "Basic / Pro / Enterprise")
- [ ] CTA buttons use action language ("Start Growing" vs "Subscribe")
- [ ] Comparison with the cost of not buying or cost of the alternative
- [ ] "Help me choose" option or recommendation quiz for undecided visitors
- [ ] Mobile-optimized layout (toggle between annual/monthly, horizontal scroll for plans)

---

## Checkout / Signup Friction Audit

Count and document each of the following:

- Total form fields (target: 3-5 for lead gen, 5-8 for checkout)
- Total steps to complete (target: 1-3 maximum)
- Presence of progress indicator on multi-step forms
- Mobile form usability: input types, autocomplete attributes, button tap target size
- Unnecessary required fields that could be optional or collected post-signup
- Inline validation: does the form show errors in real time or only on submit?
- Error message quality: helpful guidance ("Email already in use — sign in instead?") vs generic ("Invalid input")
- Option to save progress and return later (critical for long application funnels)
- Social login options (reduces signup friction by 30-40% for consumer products)
