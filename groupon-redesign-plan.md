# Groupon Redesign Plan — Home Screen & Checkout

_Companion to `groupon-research-brief.md`. No code yet — architecture and sequencing only._

## 1. New User Flow (Narrative)

### Guiding principles
The flow collapses landing-to-purchase from a category-browse loop into a single intent prompt, and front-loads the trust contract (refund terms, total price, instant booking confirmation, human-support entry) so that anything that today happens *after* the purchase happens *before* "Confirm." Every interactive surface emits a typed analytics event so the same telemetry that personalizes the feed also powers conversion and trust dashboards.

### Landing → Discovery
A user opens the app and lands on a single screen dominated by one element: a unified search/discovery bar that doubles as a natural-language prompt (typed or voice) and a structured filter entry. Below it sits a single-column personalized feed of deal cards. The feed is composed entirely of AI-generated recommendation slots of shape `{dealId, score, reason, category}` — the `reason` string is rendered as a small badge on each card ("Because you booked a thai massage in March," "Top-rated date night near you"), turning recommendations from opaque merchandising into a transparent signal. The legacy category-carousel-of-carousels is gone; categories live behind a single chip row directly under the search bar for users who want to browse rather than ask.

A persistent bottom navigation exposes four surfaces — Discover, Map, My Groupons, Help — and Help is intentionally one tap from everywhere, killing the "hidden chat" complaint that dominates one-star reviews.

### Discovery → Deal Detail
Tapping a card opens a deal detail screen that surfaces the trust contract *above* the buy button. From top to bottom: hero, title and merchant, total price (deal + tax + fees + shipping) computed inline, a refund/cancellation panel rendered in plain English ("Free cancellation until [date]. Refund to your original card within 14 days."), a real-time availability slot picker for bookable services (so the user picks the appointment *before* paying, eliminating the "I paid but can't redeem" failure mode), the "What's Included / What's Not" expandable, and only then the sticky Buy button with BNPL split-price shown ("or 4× $12 with Klarna") at parity with the headline price.

### Deal Detail → Checkout
The Buy button opens a single-sheet checkout — not a multi-page funnel. Returning users see Apple Pay / saved card preselected; guests see a single email field with auto-detection that skips the 6-digit OTP for low-risk purchases. The same refund-and-cancellation panel from the detail page is pinned to the top of the sheet so the contract is visible at the moment of commitment. A total-cost line item is the last thing before Confirm; any recurring charge requires an explicit checkbox.

### Confirm → Post-Purchase
On Confirm, the user sees an instant booking confirmation screen — for bookable services, the appointment slot they chose is already reserved with the merchant via the booking integration, with a confirmation code, an add-to-calendar action, and a "Need help with this purchase?" CTA wired to a real support entry (not a bot gauntlet). The screen also surfaces the refund deadline as a live countdown, so the user leaves the transaction knowing exactly when their flexibility ends rather than discovering it 90 days later in fine print.

### Post-Purchase → Support
My Groupons shows live booking status per voucher (Confirmed / Pending merchant / Redeemed / Refund window open / Expired), and every voucher row has its own "Get help with this" affordance that routes to a Help entry pre-scoped to that purchase. The Help tab itself offers three tiers in plain sight: self-serve refund (one tap if inside the window), live chat with a posted SLA, and an escalation path if the merchant has been flagged before — bypassing the AI loop that reviewers cite repeatedly.

### Analytics instrumentation (cross-cutting)
A single typed event bus wraps every primary interaction: `search_submitted`, `recommendation_impression`, `recommendation_clicked` (carrying `score`, `reason`, `category`), `deal_viewed`, `refund_panel_expanded`, `slot_selected`, `checkout_opened`, `total_revealed`, `purchase_confirmed`, `booking_confirmed`, `help_opened`, `refund_started`. Events flow through a provider at the app root so no component owns its own analytics wiring, and the recommendation feed feeds its `dealId`/`score`/`reason` straight into the impression event for closed-loop ranking quality measurement.

---

## 2. New Components

### Foundation (cross-cutting, no UI of their own)
- **AnalyticsProvider** — React context that injects a typed `track(event, payload)` function and batches events to the backend.
- **AnalyticsEvent (type module)** — discriminated-union type defining every tracked event and its payload shape.
- **useTrack** — hook that returns `track` plus auto-fills surface/session/user context.
- **RecommendationClient** — fetches `{dealId, score, reason, category}[]` slots from the recommender service with pagination and impression-deduplication.
- **DealClient** — fetches deal detail, real-time availability slots, and total-cost computation (deal + tax + fees + shipping).
- **CheckoutClient** — single-sheet checkout state machine (idle → reviewing → confirming → confirmed/failed).
- **BookingClient** — talks to the merchant booking integration; reserves a slot atomically with payment.
- **RefundPolicyResolver** — pure function mapping a deal to plain-English refund/cancellation terms and a deadline timestamp.
- **PriceBreakdown (model)** — typed shape for line-item totals used everywhere price appears.
- **SupportClient** — opens a support session scoped to user, deal, or voucher; exposes SLA and queue depth.
- **DesignTokens** — color, spacing, type, motion tokens shared by every surface.
- **PrimaryButton / SecondaryButton / Sheet / Chip / Badge / Skeleton** — minimal primitive kit, each emitting an interaction event when relevant.

### Discovery layer
- **UnifiedSearchBar** — single-input bar accepting natural-language prompts and structured filters; primary landing-page entry point.
- **SearchSuggestionsPopover** — typeahead + recent + AI-suggested queries below the bar.
- **CategoryChipRow** — secondary, compact category entry for browse-mode users.
- **PersonalizedFeed** — vertical single-column list rendered from recommendation slots, with infinite scroll and impression tracking.
- **RecommendationCard** — single deal card showing image, title, price, BNPL split, and a `ReasonBadge`.
- **ReasonBadge** — small pill rendering the recommender's `reason` string, making the "why" of each rec transparent.
- **FeedEmptyState** — fallback when personalization has no signal yet (e.g., new install).
- **LifestyleOnboarding** — 4–6 question opt-in collected on first launch to seed the recommender.

### Deal detail layer
- **DealDetailScreen** — composes hero, trust panels, slot picker, and sticky buy.
- **DealHero** — image carousel with explicit page indicator and `Save` affordance (fixes Pratt-critique gaps).
- **TotalCostInline** — renders the full `PriceBreakdown` above the fold (no surprise fees).
- **RefundPolicyPanel** — plain-English cancellation/refund terms with live countdown to the deadline.
- **BookingSlotPicker** — real-time availability calendar for bookable services; selection is required before Buy is enabled.
- **WhatsIncludedPanel** — expandable plain-English list of inclusions, exclusions, and any recurring charges.
- **MerchantTrustStrip** — merchant rating, response time, and any "previously-flagged" disclosure.
- **StickyBuyBar** — bottom-anchored Buy CTA with BNPL split-price and total at parity.

### Checkout layer
- **CheckoutSheet** — single bottom sheet hosting the full checkout (no multi-page funnel).
- **PaymentMethodSelector** — Apple Pay, saved card, BNPL (Klarna), guest card; preselects best default.
- **GuestEmailField** — single email input with low-risk OTP skip logic.
- **RefundContractRecap** — pinned restatement of the refund/cancellation terms at the moment of commitment.
- **TotalCostRecap** — final pre-Confirm line-item total, identical to the detail page's `TotalCostInline`.
- **RecurringChargeConsent** — mandatory checkbox surfaced only when the deal has any recurring fee.
- **ConfirmPurchaseButton** — primary CTA wired to `CheckoutClient` and `BookingClient` atomically.

### Post-purchase layer
- **InstantConfirmationScreen** — confirmation code, reserved slot summary, add-to-calendar, and Help entry.
- **RefundCountdown** — live "refund available until" timer reused on confirmation and inside My Groupons.
- **VoucherCard** — single voucher row in My Groupons showing live booking/redemption/refund status.
- **PurchaseHelpButton** — per-voucher Help entry pre-scoped to that purchase.

### Support layer
- **HelpTab** — top-level tab with three visible tiers: self-serve refund, live chat with posted SLA, escalation.
- **SelfServeRefundFlow** — one-tap refund-to-original-card when inside the window.
- **LiveChatLauncher** — opens a real human chat session, bypassing the bot gauntlet when the deal/merchant is pre-flagged.
- **SupportSLABadge** — shows current "we respond in <Nm" SLA, derived from `SupportClient`.

---

## 3. Build Order (Foundation → Surface)

1. **DesignTokens + primitive kit** (PrimaryButton, SecondaryButton, Sheet, Chip, Badge, Skeleton) — everything renders on top of these.
2. **AnalyticsEvent type module → AnalyticsProvider → useTrack** — instrument the foundation before any user-facing surface exists, so nothing ships un-tracked.
3. **PriceBreakdown model + RefundPolicyResolver** — pure types and pure functions; the contract math the trust UI depends on.
4. **DealClient, RecommendationClient, BookingClient, CheckoutClient, SupportClient** — data-access layer; mockable, testable independently.
5. **LifestyleOnboarding** — seeds the recommender before the feed has anything personal to show.
6. **PersonalizedFeed + RecommendationCard + ReasonBadge + FeedEmptyState** — the home surface, consuming `RecommendationClient` slots.
7. **UnifiedSearchBar + SearchSuggestionsPopover + CategoryChipRow** — the primary entry point sits above the feed once the feed renders.
8. **DealHero + TotalCostInline + RefundPolicyPanel + WhatsIncludedPanel + MerchantTrustStrip** — trust-contract pieces of the detail page, each driven by foundation models.
9. **BookingSlotPicker** — depends on `BookingClient`; gates the Buy button.
10. **StickyBuyBar + DealDetailScreen composition** — assembles the detail surface end-to-end.
11. **CheckoutSheet + PaymentMethodSelector + GuestEmailField + RefundContractRecap + TotalCostRecap + RecurringChargeConsent + ConfirmPurchaseButton** — single-sheet checkout sitting atop the existing data clients.
12. **InstantConfirmationScreen + RefundCountdown** — post-purchase trust surface, reusing the refund resolver and booking client.
13. **VoucherCard + PurchaseHelpButton (My Groupons)** — live status per purchase.
14. **HelpTab + SelfServeRefundFlow + LiveChatLauncher + SupportSLABadge** — top-level support surface; built last because it depends on voucher state, refund resolver, and a fully instrumented event stream to route escalations correctly.

Each step is shippable on its own behind a flag; analytics is in place from step 2 so every subsequent surface lands already measured.
