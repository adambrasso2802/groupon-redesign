# Groupon Redesign Prototype

## 1. The Problem

Groupon has a rating split that should not exist. Its iOS app holds a near-perfect 4.8 stars from more than half a million ratings. Every other review surface tells a different story: Trustpilot at 4.0 but with a heavy cluster of one-star complaints, Reviews.io at 1.5 stars from nearly ten thousand customers, PissedConsumer at roughly 1.5 stars from over 28,000 reviews, and the Better Business Bureau at around 1.0. Only seven percent of Reviews.io respondents would recommend Groupon to a friend.

The gap exists because people who have a good experience finish their journey inside the app. People who hit a problem and cannot find help inside the app leave to complain publicly. The complaint is not that the deals are bad. The same four problems surface again and again across every off-platform review site:

1. **The refund trap.** Local deals can only be refunded within three days of purchase. When a refund is eventually granted, it typically lands as Groupon Bucks — credit locked to the platform — rather than back on the original card. Reviewers describe this as a deliberate trap. One customer quoted a deal labeled "Hassle-free refund until January 6" and was then denied a full refund.

2. **Invisible customer support.** Groupon has no phone line. The chat function only appears after a specific sequence of help-center clicks, and even then it routes through an automated system that reviewers consistently describe as "an endless loop going nowhere." One reviewer counted nearly an hour before reaching a human.

3. **Notification overload.** Groupon's own engineering team has written publicly about sending almost 500 million push notifications per day across its platform. One subscriber counted 235 emails from Groupon in a single month and found that clicking unsubscribe did not stop them.

4. **Booking that breaks after payment.** For services that require an appointment — spa visits, fitness classes, experiences — customers pay Groupon and are then sent to a separate scheduling system that frequently fails to load. The voucher is valid but the slot cannot be booked, and there is no clear path to a refund because the policy window has often closed by the time the customer realizes there is a problem.

Against this backdrop, Groupon's three main competitors are pulling ahead in the areas that matter most for local discovery. Yelp shipped a conversational assistant in late 2025 that can resolve a query like "birthday dinner with vegan options and heated outdoor seating" in a single typed sentence and complete the booking without leaving the app. Fever runs a personalized, visually rich feed of experiences that feels closer to scrolling Instagram than browsing a deal site, and its recommendation engine learns from every tap. Viator treats flexible cancellation as a standard feature — free cancellation up to 24 hours before any experience, refunded to the original card — and offers buy-now-pay-later installments inside the app without any minimum spend. Groupon offers none of these things by default.

---

## 2. What This Prototype Fixes

The prototype is organized into nine layers, each built on top of the last. Here is what each layer addresses and which complaint it is designed to fix.

**Tier 1 — Analytics Foundation**
Before any screen is shown to a user, every interaction in the app is wired to a consistent event-tracking system. This layer exists so that every design decision from Tier 2 onward can be measured — conversion rates, drop-off points, and which recommendations actually lead to purchases. Without it, there is no way to know whether the other fixes are working.

**Tier 2 — Shared Building Blocks**
This layer creates the small visual pieces used on every screen: the deal card, the refund policy badge (a green, amber, or red label showing the cancellation window in plain English), the "instant confirmation" indicator, the buy-now-pay-later pricing hint, and a clearly labeled save button. The refund badge and the BNPL hint directly address complaints 1 (the refund trap) and the competitor gap with Viator, which surfaces payment flexibility at the point of browsing.

**Tier 3 — Onboarding Quiz**
On first launch, before anything is shown, the app asks six short questions about the user's interests — food, fitness, wellness, nightlife, family activities, day trips. The answers seed the personalized feed so it is relevant from the very first scroll. This directly addresses the competitor gap with Fever, whose "Instagram-like" feed converts so well precisely because it shows people things they actually want rather than a generic grid of category tiles.

**Tier 4 — Home Screen and Navigation**
The home screen replaces the existing carousel-of-carousels layout with a single scrolling column of personally relevant deal cards, each carrying a short explanation of why it was recommended ("because you booked a spa day in March"). A bottom navigation bar keeps the support tab one tap away from every screen — a direct fix for complaint 2, the hidden customer service problem.

**Tier 5 — Search and the Groupon Assistant**
Tapping the search bar opens a full-screen panel with a conversational mode where a user can type "date night under $80 within 15 minutes" and receive bookable results. This closes the most visible gap with Yelp, which launched its conversational assistant in 2025, and reduces the zero-result dead ends that come from keyword-only search.

**Tier 6 — Deal Detail Page**
The deal page now shows the full cost — deal price, service fee, tax, and shipping — above the Buy button, not after. The refund terms appear in plain English above the Buy button as well, not buried in fine print. For bookable services, the appointment calendar appears here too, so the customer picks their slot before paying rather than after. These changes directly address complaints 1 (the refund trap) and 4 (booking that breaks after payment), and fix the specific problem documented in the research of customers discovering surcharges and restrictive cancellation terms only after their money had left their account.

**Tier 7 — Checkout**
The checkout is a single screen rather than a multi-step funnel. It shows the total cost again at the top, repeats the refund terms immediately above the confirm button, and requires an explicit checkbox acknowledgment if the deal carries any recurring charge — fixing the documented case of a customer unknowingly signing up for a $38-per-month membership. Apple Pay, a standard card, and Klarna installments are presented as equal options with no minimum spend threshold for installments, matching Viator's payment flexibility.

**Tier 8 — Booking Confirmation and Post-Purchase Support**
Immediately after a purchase, the confirmation screen shows the booked slot, a voucher barcode, a live countdown to the refund deadline, and a "Need help with this order?" link. That same link appears on every voucher in the order history. Tapping it opens a support panel that states the Groupon Promise in plain English, shows how long a response will take, and offers a direct path to a human when the merchant has been flagged or the expected redemption date has passed. This is the single highest-leverage fix in the entire prototype: it intercepts the frustrated customer before they go to Trustpilot or PissedConsumer, which is where the rating gap lives.

**Tier 9 — Notification Preferences**
A settings screen lets users set per-category notification frequency — deal alerts, booking reminders, and promotional messages can each be set to daily, weekly, or off. A single master toggle pauses everything. This directly addresses complaint 3: the 235-emails-in-a-month experience that drives uninstalls.

---

## 3. What Still Needs to Be Done

### Gaps in the current prototype

The prototype is a working interactive preview, not a shippable product. Every data connection is simulated — deal cards show placeholder content, the Groupon Assistant returns scripted responses, payment processing is mocked, and booking confirmations do not contact any real merchant system. The following things do not yet exist and would need to be built before this could go to real users.

### Things that need an engineering team

- **Live deals data.** The prototype shows static sample deals. Connecting to Groupon's actual inventory, search index, and real-time pricing requires API integration with the existing backend.
- **Real user authentication.** Sign-in, account management, saved payment methods, and guest checkout with OTP verification are all mocked. A real implementation needs to connect to Groupon's identity system.
- **Payment processing.** The checkout screen simulates a completed payment. Actual card charging, Apple Pay authorization, and Klarna installment agreements require integration with payment providers and compliance with card-network security requirements.
- **AI recommendation engine.** The personalized feed and the Groupon Assistant return placeholder content. A real version requires a machine-learning model trained on user behavior data, a serving layer that can respond in under a second, and a feedback loop that improves recommendations based on what users tap and buy.
- **Merchant booking integration.** The availability calendar shows placeholder dates. Real-time slot availability requires a connection to each merchant's scheduling system, and the atomic "pay and reserve simultaneously" behavior described in the design plan requires a booking API that can hold a slot during payment processing.
- **3D Secure authentication.** The in-app 3DS modal is a simulation. The real version requires integration with the card networks' authentication protocols.

### Things that need a design team

- **Consistent color tokens.** The prototype uses a working set of colors defined in the preview file, but they have not been validated as a coherent brand system. A design team needs to reconcile these with Groupon's current brand guidelines, test them against accessibility contrast standards, and export them as a proper design token library.
- **Real photography.** Deal cards use placeholder images. The visual quality of the feed — particularly the Fever-style "Instagram-like" experience the research calls for — depends entirely on high-quality, consistent hero photography. This requires either a photography brief for merchant assets or an image curation system.
- **Accessibility audit.** No screen in the prototype has been tested with a screen reader, checked for keyboard navigability, or reviewed for minimum touch target sizes. Before any public release, all 24 components need to pass WCAG 2.1 AA standards at minimum.

### Things that need product decisions

- **Whether to keep the lifestyle quiz.** The `LifestyleQuizScreen` that runs on first launch is the mechanism that seeds personalized recommendations. The design plan marks it as skippable, but the team needs to decide: Is it shown to every new user? Does skipping it affect what the user sees on the home screen and, if so, how? Should it be re-surfaced if the user skips it the first time?
- **Notification defaults for new users.** The prototype's `NotificationPreferenceCenter` lets users adjust their preferences, but someone needs to decide what the default settings are before the preference center is ever opened. The research brief recommends capping push notifications at one per day for new users as a starting point, but the specific defaults — which categories are on, which are off, what counts as "promotional" versus "booking-related" — are product decisions with revenue implications that need deliberate sign-off.
- **BNPL provider choice.** The checkout screen shows Klarna as the buy-now-pay-later option, consistent with Groupon's existing web-only Klarna integration. But Viator also supports Zip, and the research brief notes that the current Klarna integration is gated at a $100 minimum basket. The product team needs to decide which provider or providers to support in the app, whether to remove the minimum basket threshold, and how to handle markets where Klarna is not available.

---

## 4. How to Run the Preview

The prototype is a single self-contained file called `preview.html` in the root of this project. To see the full user journey, open that file in any modern web browser — Chrome, Firefox, Safari, or Edge all work. There is nothing to install and no internet connection is required.

Once open, you will see a page laid out as a series of phone-screen mockups showing the complete flow from first launch through purchase confirmation and post-purchase support. Each screen is clickable and interactive: you can tap through the lifestyle quiz, browse the personalized deal feed, open a deal detail page, complete a simulated checkout, and access the support panel. The Groupon Assistant chat accepts typed input and returns a scripted response to give a sense of the conversational experience. All of the nine layers described above are represented in sequence, so the page functions as a narrative walkthrough of the entire redesign — a useful starting point for a stakeholder demo or an investor review session.

To share it with someone who does not have access to this repository, send them the `preview.html` file directly. It has no external dependencies and will run identically on any machine.
