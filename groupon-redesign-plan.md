# Groupon Redesign — Component Architecture Plan
_Based on groupon-research-brief.md · Compiled 2026-05-15_

---

## Highest-Leverage Component for Off-Platform Complaints

> **`PostPurchaseHelpEntry`** — the persistent "Need help with this order?" CTA surfaced directly inside My Groupons.

The research brief is unambiguous: every off-platform review surface (Trustpilot, PissedConsumer, BBB, Reviews.io) is dominated by users who completed a purchase, hit a problem, could not find help inside the app, and escalated to a third-party site to be heard. The complaint is not primarily about deal quality — it is about the absence of a visible, trustworthy path back to Groupon after something goes wrong. A persistent, impossible-to-miss support entry at the order level — with a visible SLA commitment and a skip-to-human escalation path — closes the off-platform escape valve before it opens. Nothing else in this architecture has a higher expected impact on the review-site rating gap between the App Store (4.8) and every other surface (1.5–1.8).

---

## Part 1 — New User Flow (Words Only)

### Phase 0 — First-Launch Onboarding (one-time)
On first open, before the home screen renders, the user is shown a six-card lifestyle quiz: foodie, fitness, parent, pet-owner, wellness/spa, nightlife/day-trip. Selections are saved locally and sent to the recommendation engine. The quiz is skippable and re-accessible from profile settings. This seeds the AI feed so that the home screen is already personalized on the first real visit rather than defaulting to generic category carousels.

### Phase 1 — Home Screen
The home screen has a single dominant entry point at the top: the unified search/discovery bar. Below it, a vertically scrolling, single-column feed renders AI-generated recommendation slots in visual card format — hero image, deal name, price, an AI-authored reason line ("because you've booked spa days before"), and a category tag. Each slot carries the shape `{dealId, score, reason, category}` from the recommendation engine. A sticky tab bar allows switching between the AI feed, a map view, and My Groupons (order history + support). There are no horizontal carousel-of-carousels. Every scroll event, card impression, and card tap fires an analytics event.

### Phase 2 — Search and Conversational Discovery
Tapping the unified search bar expands a full-screen discovery panel. The user can type a keyword, apply filters (radius, category, price, rating), or switch to the Groupon Assistant tab and type a natural-language query such as "date night under $80 within 15 minutes." The assistant returns up to five bookable results with next-action buttons: Book, Save, Share. Each query, filter change, result tap, and assistant response fires an analytics event.

### Phase 3 — Deal Detail
The deal detail page opens from any card tap. At the top: hero image carousel with a visible scroll indicator (fixing the Pratt critique). Below: deal name, merchant name, price with inline BNPL hint ("or 4× $X with Klarna"). Then — critically, above the Buy button and not in fine print — a RefundPolicyBadge showing the applicable refund window in plain English ("Free cancellation up to 24h before your appointment — refunded to your original card"). If the deal supports real-time booking, an availability calendar shows open slots before purchase is initiated. An expandable "What's Included" panel lists every restriction, surcharge, blackout date, and recurring charge in plain English. An InstantConfirmationBadge signals whether the booking will be confirmed immediately. A Save button is visible and reachable without long-press. Every section scroll, image swipe, fine-print expansion, and Buy tap fires an analytics event.

### Phase 4 — Checkout (Reduced to Two Confirmed Steps)
Step 1 — Slot selection (if applicable): for bookable services, the user selects their availability slot from the inline calendar. This is part of the transaction, not a post-purchase step, eliminating the "paid but can't book" failure mode. Step 2 — Review and confirm: a single screen shows the total cost breakdown — deal price, service fee, tax, shipping if applicable — above the Confirm Purchase button. Refund terms are repeated here as a one-line reminder. If the deal carries a recurring charge, a mandatory checkbox requires explicit acknowledgment. Payment options (Apple Pay, Klarna, card) are presented as equal first-class choices. For returning users with Apple Pay, a single authenticated tap completes the purchase. The 3DS challenge, if triggered by the bank, renders inside the app rather than ejecting the user. Every payment method selection, checkbox state change, and confirmation tap fires an analytics event.

### Phase 5 — Instant Booking Confirmation
Immediately after Confirm Purchase, a full-screen confirmation screen appears. It shows: confirmation number, deal summary, booking slot (if applicable), voucher barcode, a plain-English recap of the refund window, and a single "Add to Calendar" button. The screen is available offline. A "Need help with this order?" link is visible on this screen — it is the first appearance of the persistent post-purchase support entry, and it appears before the user has left the confirmation context.

### Phase 6 — My Groupons (Ongoing Post-Purchase)
Every order in My Groupons displays the voucher, its expiry (with clear distinction between paid value and promo value), the booking slot if applicable, and a "Need help with this order?" button anchored to that specific deal. Tapping support opens a chat panel that surfaces the Groupon Promise upfront, states a response SLA, and offers a direct skip-to-human option when the merchant has been flagged or when the order is past its expected redemption date.

---

## Part 2 — Component List

### Analytics Infrastructure

| Component | Description |
|---|---|
| `AnalyticsProvider` | Root context that initializes the analytics client and provides a tracking interface to the entire component tree. |
| `useAnalytics` | Hook that returns a typed `track(eventName, properties)` function; all components call this rather than calling the analytics SDK directly. |
| `AnalyticsEventSchema` | Typed constant map of every trackable event name and its required property shape; enforces instrumentation consistency at the type level. |

### Data Contracts

| Component | Description |
|---|---|
| `AIRecommendationSlot` (type) | TypeScript interface for the recommendation engine payload: `{ dealId: string; score: number; reason: string; category: string }`. |
| `CheckoutSummary` (type) | Typed shape for the order review screen: deal price, service fee, tax, shipping, total, refund window, and recurring-charge flag. |
| `SupportTicket` (type) | Typed request shape for initiating a support contact from a specific orderId. |

### Foundation / Shared UI Primitives

| Component | Description |
|---|---|
| `DealCard` | Reusable card displaying hero image, deal name, merchant, price, category badge, and AI reason line; used in the feed, search results, and assistant output. |
| `RefundPolicyBadge` | Compact, prominently styled badge that renders the applicable refund window in plain English from a deal's policy object; appears on deal detail and checkout screens. |
| `InstantConfirmationBadge` | Small badge indicating whether a deal supports immediate booking confirmation; appears on DealCard and DealDetailPage. |
| `BNPLPricingHint` | Inline text rendering "or N× $X with [provider]" next to a deal price; fires an analytics event on tap. |
| `SaveDealButton` | Visible, icon-labeled button for saving a deal to favorites; no long-press required. |

### Onboarding

| Component | Description |
|---|---|
| `LifestyleQuizScreen` | Full-screen, six-card first-launch quiz that collects lifestyle preferences; skippable; results seed the recommendation feed. |

### Home Screen

| Component | Description |
|---|---|
| `HomeScreen` | Top-level screen orchestrator; renders the UnifiedSearchBar, PersonalizedFeedList, and BottomTabBar. |
| `PersonalizedFeedList` | Vertically scrolling list that consumes an array of `AIRecommendationSlot` objects from the recommendation API and renders DealCard instances; tracks impression events per slot. |
| `BottomTabBar` | Persistent navigation bar with tabs for Feed, Map, Groupon Assistant, and My Groupons. |

### Search and Conversational Discovery

| Component | Description |
|---|---|
| `UnifiedSearchBar` | Primary entry point on the home screen; expands to full-screen discovery on tap; supports keyword, filter, and assistant modes; tracks every query and mode switch. |
| `SearchResultsList` | Renders filtered deal results from keyword or filter queries; tracks result impressions and taps. |
| `SearchFilterPanel` | Slide-up panel for radius, category, price range, rating, and sort controls; each filter change fires an analytics event. |
| `AssistantChatPanel` | Conversational Groupon Assistant panel accepting natural-language queries and returning up to five bookable DealCard results with Book/Save/Share actions; tracks every query and result action. |
| `AssistantSuggestionChips` | Pre-built prompt chips ("dinner under $50," "spa day this weekend") displayed below the assistant input to reduce blank-state friction. |

### Deal Detail

| Component | Description |
|---|---|
| `DealDetailScreen` | Full-screen orchestrator for deal detail; composes all sub-components and fires a `deal_viewed` analytics event on mount. |
| `HeroImageCarousel` | Swipeable image carousel with a visible page indicator; fires a `hero_swiped` event per image change. |
| `PricingBreakdownPanel` | Expandable panel listing every cost component (deal price, service fee, tax, shipping) before the Buy button; expansion fires an analytics event. |
| `AvailabilityCalendar` | Real-time slot picker that queries merchant availability; integrated into the deal page before purchase so slot selection is part of the transaction. |
| `FinePrintExpander` | Expandable "What's Included & Restrictions" section rendering blackout dates, surcharges, and recurring-charge disclosures in plain English; expansion tracked. |
| `RecurringChargeDisclosure` | Dedicated, visually distinct panel for deals with subscription components; requires explicit acknowledgment before the Buy button becomes active. |

### Checkout Flow

| Component | Description |
|---|---|
| `CheckoutScreen` | Two-step checkout orchestrator: slot confirmation (if applicable) then order review; tracks each step transition. |
| `OrderReviewSummary` | Full cost breakdown (mirroring PricingBreakdownPanel) plus refund-window reminder, shown above the Confirm Purchase button; displayed before any payment action. |
| `RefundTermsReminder` | One-line refund policy reminder rendered directly above the Confirm Purchase button; not in fine print. |
| `RecurringChargeCheckbox` | Mandatory acknowledgment checkbox for deals with a recurring charge; Confirm Purchase button is disabled until checked. |
| `PaymentMethodSelector` | Renders Apple Pay, Klarna, and card as equal first-class options; tracks payment method selection; Klarna available at any basket size. |
| `InAppThreeDSChallenge` | Renders the bank's 3DS authentication challenge inside a WebView within the app rather than ejecting the user; tracks challenge start, success, and failure. |

### Post-Purchase and Order Management

| Component | Description |
|---|---|
| `BookingConfirmationScreen` | Full-screen instant confirmation showing confirmation number, deal summary, booked slot, voucher barcode, refund window, and "Add to Calendar"; available offline. |
| `VoucherCard` | Renders voucher barcode, expiry date with explicit paid-value vs. promo-value distinction, and redemption instructions. |
| `MyGrouponsScreen` | Order history screen; each order row renders VoucherCard, booking slot if applicable, and PostPurchaseHelpEntry. |
| `PostPurchaseHelpEntry` | Persistent "Need help with this order?" CTA anchored to a specific order; visible on BookingConfirmationScreen, MyGrouponsScreen, and VoucherCard; the primary lever for reducing off-platform complaints. |

### Customer Support

| Component | Description |
|---|---|
| `SupportChatPanel` | In-app chat panel surfaced from PostPurchaseHelpEntry; displays Groupon Promise upfront, shows response SLA, offers skip-to-human escalation; tracks escalation events. |
| `GrouponPromiseBanner` | Persistent banner inside SupportChatPanel explaining the Groupon Promise in plain English before the user has to ask. |

### Notification Preferences

| Component | Description |
|---|---|
| `NotificationPreferenceCenter` | In-app notification settings screen with per-category frequency sliders (daily / weekly / off) and a master email unsubscribe; accessible from profile; tracks every preference change. |

---

## Part 3 — Build Order (Foundation to Surface)

### Tier 1 — Analytics and Data Contracts (build first; nothing else ships without these)
1. `AnalyticsEventSchema`
2. `AnalyticsProvider`
3. `useAnalytics`
4. `AIRecommendationSlot` type
5. `CheckoutSummary` type
6. `SupportTicket` type

### Tier 2 — Shared UI Primitives (used across all screens)
7. `DealCard`
8. `RefundPolicyBadge`
9. `InstantConfirmationBadge`
10. `BNPLPricingHint`
11. `SaveDealButton`

### Tier 3 — Onboarding (gates the first personalized home render)
12. `LifestyleQuizScreen`

### Tier 4 — Home and Navigation Shell
13. `BottomTabBar`
14. `PersonalizedFeedList`
15. `HomeScreen`

### Tier 5 — Search and Discovery (core acquisition path)
16. `SearchFilterPanel`
17. `SearchResultsList`
18. `AssistantSuggestionChips`
19. `AssistantChatPanel`
20. `UnifiedSearchBar`

### Tier 6 — Deal Detail (conversion gate)
21. `HeroImageCarousel`
22. `FinePrintExpander`
23. `RecurringChargeDisclosure`
24. `AvailabilityCalendar`
25. `PricingBreakdownPanel`
26. `DealDetailScreen`

### Tier 7 — Checkout (revenue path; build after detail is stable)
27. `RecurringChargeCheckbox`
28. `PaymentMethodSelector`
29. `InAppThreeDSChallenge`
30. `RefundTermsReminder`
31. `OrderReviewSummary`
32. `CheckoutScreen`

### Tier 8 — Post-Purchase and Trust Layer (this is the highest-leverage tier for the complaint pattern)
33. `VoucherCard`
34. `BookingConfirmationScreen`
35. `GrouponPromiseBanner`
36. `SupportChatPanel`
37. `PostPurchaseHelpEntry`
38. `MyGrouponsScreen`

### Tier 9 — Notification Preferences (reduces uninstall rate; lower urgency than trust layer)
39. `NotificationPreferenceCenter`

---

## Rationale Notes

**Why `PostPurchaseHelpEntry` is highest leverage:** The research brief shows a 4.8-star App Store rating alongside 1.5-star ratings on every off-platform review surface. That gap exists because in-app users who are happy complete their journey inside the app; frustrated users who cannot find help leave to complain publicly. The off-platform complaint is not the complaint itself — it is proof that the in-app resolution path failed. Making support visible, order-specific, and present at the exact moment of post-purchase friction (confirmation screen, voucher view, order history) intercepts that exit before it happens. No amount of home-screen personalization or search improvement changes the behavior of a user who already bought something and feels stuck.

**Why refund terms appear in Tier 6 (deal detail) rather than only at checkout:** The research brief documents users who report being surprised by refund terms _after_ purchase. Surfacing `RefundPolicyBadge` on the deal detail page means the user sees the policy before they ever tap Buy — it reframes the refund window as a feature (like Viator's 24h free cancellation) rather than as adversarial fine print revealed too late.

**Why slot selection is inside checkout rather than post-purchase:** The "circle just keeps spinning" booking failure documented in the brief happens because the current flow separates payment from booking. Moving `AvailabilityCalendar` into the deal detail and making slot selection part of the transaction — so Groupon confirms both payment and slot atomically — eliminates the class of "I paid but can't book" tickets that represent the largest volume of post-purchase escalations.
