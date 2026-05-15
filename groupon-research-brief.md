# Groupon Consumer Product Research Brief
_Compiled 2026-05-15_

## Executive Summary

- **A "two-star company with a four-star app store rating."** The Groupon iOS app holds a 4.8-star App Store rating across roughly 557K ratings ([AppsHunter](https://appshunter.io/ios/app/352683833/reviews)), but every other review surface — Trustpilot 1-star reviews, SmartCustomer (1.8/5 from 5,284 reviews), Reviews.io (1.5/5 from 9,686 reviewers, only 7% would recommend), BBB, ConsumerAffairs, PissedConsumer (28.1K reviews) — paints a portrait of deep post-purchase frustration ([SmartCustomer](https://www.smartcustomer.com/reviews/groupon.com), [PissedConsumer](https://groupon.pissedconsumer.com/review.html)). The gap means in-app sentiment is dominated by happy first-time buyers; the bitter long-tail experience lives elsewhere.
- **Groupon knows it.** CEO Dusan Senkypl's stated North Star is to make Groupon "the ultimate destination for local services and experiences" ([Groupon press release](https://investor.groupon.com/press-releases/press-release-details/2024/Groupon-Announces-Dusan-Senkypl-as-Permanent-CEO/default.aspx)). On the Q4 2025 call management reported deal-page conversion was up 13% YoY and 50% of iOS North America users were on the rebuilt app, with those users monetizing better ([GuruFocus Q4 2025 highlights](https://www.gurufocus.com/news/8699083/groupon-inc-grpn-q4-2025-earnings-call-highlights-a-year-of-growth-and-strategic-shifts)). A board-level AI committee was formed for 2026 ([Seeking Alpha](https://seekingalpha.com/news/4563489-groupon-outlines-3-5-percent-growth-targets-for-2026-as-ai-strategy-accelerates-board-forms)). The redesign is half-shipped — there is real room to lean into.
- **The top four user complaints are not about deal quality.** They are (1) refund/voucher rigidity and the "Groupon Bucks trap," (2) opaque, hard-to-reach customer service, (3) push/email spam (one user counted 235 emails in a single November; Groupon engineering boasts ~500M notifications/day), and (4) merchant scheduling that breaks at the booking step ([Mouse Print*](https://www.mouseprint.org/2026/01/05/groupons-excessive-emails-amount-to-spam/), [Groupon Engineering on Medium](https://medium.com/groupon-eng/groupon-push-marketing-how-we-send-almost-half-a-billion-notifications-a-day-4d77a160694a)).
- **Competitors out-execute Groupon on the things that matter most for local discovery.** Yelp shipped 35+ AI features in Fall 2025 including a conversational Yelp Assistant that books reservations end-to-end ([Yelp Fall 2025 blog](https://blog.yelp.com/news/fall-product-release-2025/)). Fever runs an "Instagram-like" personalized feed of curated experiences ([Programming Insider](https://programminginsider.com/%EF%B8%8F-discover-feverup-the-global-platform-redefining-how-we-experience-events-in-2025/)). Viator offers instant confirmation, reserve-now-pay-later, Klarna installments, and 24-hour free cancellation as standard ([Viator partner docs](https://partnerresources.viator.com/)). Groupon trails on personalization, conversational discovery, and post-purchase flexibility.
- **The redesign opportunity is not "make it pretty."** It is to fix the trust contract: clearer fine print at the moment of purchase, real refund flexibility (not Bucks-only), tamer notifications, faster human support, and a discovery feed that respects intent rather than blasting category carousels.

## Current State

### App store metrics & sentiment

| Surface | Rating | Sample size | Notes |
|---|---|---|---|
| iOS App Store (US) | 4.8 / 5 | ~557K ratings | "Most reviewed Groupon iOS app." ([AppsHunter](https://appshunter.io/ios/app/352683833/reviews)) |
| Google Play | ~4.5 / 5 (typical) | Millions of installs | [Play listing](https://play.google.com/store/apps/details?id=com.groupon&hl=en_US) |
| Trustpilot | 4.0 / 5 | 67,000+ reviews | Two-thirds 5-star, but heavy 1-star cluster on refunds ([Trustpilot](https://www.trustpilot.com/review/www.groupon.com)) |
| SmartCustomer | 1.8 / 5 | 5,284 reviews | [SmartCustomer](https://www.smartcustomer.com/reviews/groupon.com) |
| Reviews.io | 1.5 / 5 | 9,686 reviews | 7% would recommend ([Reviews.io](https://www.reviews.io/company-reviews/store/groupon)) |
| PissedConsumer | ~1.5 / 5 | 28,100 reviews | [PissedConsumer](https://groupon.pissedconsumer.com/review.html) |
| BBB | ~1.0 / 5 | Thousands of complaints | [BBB profile](https://www.bbb.org/us/il/chicago/profile/ecommerce/groupon-inc-0654-88367005/complaints) |

**Praise themes** (App Store, Trustpilot 5-star): easy savings, breadth of inventory, ability to track vouchers in-app, app surfaces expiring-deal alerts that are "much easier than digging through email threads weeks later" (paraphrased praise theme cited across [JustUseApp](https://justuseapp.com/en/app/352683833/groupon/reviews) summaries).

**Complaint themes** (recent 1-star clusters):
- "_If I could give them a 0 star, I would. They offer no phone support. They say go here to chat, but it ends up being in an endless loop going nowhere._" (Trustpilot 1-star, paraphrased in [search-result aggregation](https://www.smartcustomer.com/reviews/groupon.com))
- "_Not even worth the 1 star!! Horrible customer service!! Website crashed multiple times and got charged multiple times and will not cancel the transactions!!_"
- "_It took me nearly an hour to finally chat with a real person because this app hides the chat feature._"
- One Trustpilot reviewer in early 2026 reported buying a voucher labeled "Hassle-free refund until January 6, 2026" — and being denied a full refund anyway ([Trustpilot search summary](https://www.trustpilot.com/review/www.groupon.com)).

### Current UX flows (home → discovery → detail → checkout)

**Home.** Groupon's CX90 redesign moved the home from a "plain deal feed and deal carousels" to "bigger and bolder modules with engaging text and images" highlighting categories ([Groupon Engineering — CX90](https://medium.com/groupon-eng/cx90-rethinking-redesigning-and-reimplementing-the-groupon-user-experience-59a03b6c306c)). The further 2024–25 redesign added personalized recommendations, an improved search, and a "buy-it-again" rail ([Retail Dive](https://www.retaildive.com/news/groupon-redesigns-mobile-app-site-with-personalized-features/599609/)). The newest North America iOS build (rolled out to roughly 50% of iOS NA users by Q4 2025) "delivers a more intuitive, engaging experience to amplify new inventory offerings."

**Discovery / search.** Filters include radius, category, sort by distance/rating, and a map view. Groupon's own engineering blog describes the search relevance model as logistic regression over impression/click data with distance as a strong signal for food and restaurants and a weaker signal for adventure or travel ([Groupon Engineering search post](https://engineering.groupon.com/2013/misc/how-groupons-search-ranking-works/)). The 2025 strategy explicitly calls out a rebuilt map: "zoom into your neighborhood, find experiences within walking distance, visualize travel times, and book instantly" ([Groupon AI strategy summary](https://www.retail-insight-network.com/data-insights/groupon-in-artificial-intelligence-theme-innovation-strategy/)).

**Deal detail.** Hero image (swipeable carousel without a visible scroll indicator — flagged as a discoverability problem in the Pratt design critique), price, "What You'll Get," merchant section, location map, reviews, and a sticky "Buy" button. Pratt's critique flagged duplicate live-chat affordances and missing "Save for later" iconography that obligates users to long-press or scroll to find favorites ([IXD @ Pratt critique](https://ixd.prattsi.org/2023/02/design-critique-grouponapp/)).

**Checkout.** Per Groupon's own help center the mobile flow is:
1. Tap **Buy!**
2. Sign in (or use guest email; guest still requires a 6-digit email-code verification)
3. Select payment method (card, Apple Pay, Google Pay, PayPal for selected accounts, Klarna ≥ $100 web-only)
4. Tap **Confirm Purchase**
5. EMV 3-D Secure step where the bank may require an OTP or password ([Groupon mobile FAQ](https://www.groupon.com/pages/mobilepurchase-faq), [Groupon payment guide](https://www.groupon.com/faq/payments-billing/groupon-payment-methods-guide))

In best case this is two taps for a returning logged-in user. The 3DS challenge is the documented friction point: reviewers describe PayPal "looping for hours" and being charged twice when the loop fails ([JustUseApp summary](https://justuseapp.com/en/app/352683833/groupon/reviews)).

### Public teardowns & critiques

- **Groupon Engineering — "CX90: Rethinking, Redesigning and Reimplementing the Groupon User Experience"** — internal 90-day cross-team redesign. Reduced bounce rate ~3% on web; +7% engagement on Browse; +1% conversion lift ([Medium](https://medium.com/groupon-eng/cx90-rethinking-redesigning-and-reimplementing-the-groupon-user-experience-59a03b6c306c)).
- **Groupon Design Union — "Groupon User Research"** — case study on the Deal Details Page redesign ([Medium](https://medium.com/groupon-design-union/groupon-user-research-informing-design-driving-strategy-and-facilitating-collaboration-eb6113c5470e)).
- **"Designing Groupon Go"** (Rahul Gonsalves, India market) — emphasized ditching the map, simplifying icons, and adopting cleaner typography ([Medium](https://medium.com/@gonsalves_r/designing-groupon-go-great-experiences-around-you-e230cd5c4a99)).
- **IXD @ Pratt design critique (2023)** — flagged missing scroll indicators, duplicate chat links, ambiguous swipe affordances, and absent "Save for later" buttons ([Pratt](https://ixd.prattsi.org/2023/02/design-critique-grouponapp/)).
- **App Comrade review** — summarized as: "Groupon's app still earns its keep, but only if you read the fine print." ([App Comrade](https://appcomrade.com/apple/groupon-local-deals-near-me-352683833/)).
- **Product-Led Alliance — "Inside Groupon's product-led comeback strategy"** — outside coverage of Senkypl's mobile-first turnaround ([PLA](https://www.productledalliance.com/how-groupon-is-engineering-its-comeback/)).

## Key Friction Points

### Checkout & purchase

- **Guest checkout exists but is not frictionless.** Guests must still enter their email and validate via a 6-digit one-time code ([Groupon guest FAQ](https://www.groupon.com/faq/guest/how-to-access-guest-order)). For a returning iPhone user, however, the path is short — 2 taps with Apple Pay.
- **PayPal failures and double-charges.** Multiple recent reviews describe PayPal "looping for hours" and the user being charged twice when the loop drops ([JustUseApp summary](https://justuseapp.com/en/app/352683833/groupon/reviews)). Customers complain refunds are then pushed back to Groupon Bucks rather than the original card.
- **EMV 3-D Secure dropouts.** The bank-issued OTP step is documented as required for purchase completion ([Groupon payment guide](https://www.groupon.com/faq/payments-billing/groupon-payment-methods-guide)); App Store one-star reviews complain it kicks them out of the app entirely on some devices.
- **Hidden fine print revealed only after purchase.** Customers report markups of "about 500%" on the intended item plus undisclosed surcharges for tax, shipping, engraving, and gift messages — discovered after checkout ([ConsumerAffairs synthesis](https://www.consumeraffairs.com/online/groupon.html)). One Mouse Print* example: "ordered medication with stated free shipping but was charged $25, and later discovered a $38 per month membership fee in fine print."
- **No native BNPL parity.** Klarna installments are web-only and require a $100+ basket ([Zip listing](https://zip.co/us/store/groupon)); Viator offers Klarna across the board, in-app.

### Redemption & post-purchase

- **Three-day refund window is the single most-cited grievance.** Local Deals can be refunded only within 3 days; Goods within 2 hours; "all sales are final" otherwise unless the Fine Print says otherwise ([Groupon refund policy](https://www.groupon.com/legal/grouponrefundpolicy)).
- **Refunds default to Groupon Bucks, not original payment method** — repeatedly described as "a way to trap customers into spending more" ([PissedConsumer aggregation](https://groupon.pissedconsumer.com/review.html)).
- **Booking-step breakage.** Customers paid, then "the circle just keeps spinning" when trying to book the appointment with the merchant — both on web and in-app ([JustAnswer thread](https://www.justanswer.com/software/spftg-groupon-appointment-booking-stuck-loading.html)). When the merchant has no availability or has closed, the customer is told vouchers are still valid (forever for paid value, until expiry for promo value).
- **Merchant closures and "quietly stopped honoring."** A frequently cited App Store one-star pattern: "we paid over $100 for services that weren't provided…the salon required additional payment, and Groupon refused refunds due to the 30-day policy" ([JustUseApp summary](https://justuseapp.com/en/app/352683833/groupon/reviews), [Elliott Report](https://www.elliott.org/problem-solved/why-wont-groupon-refund-me-the-restaurant-closed/)).
- **Voucher expiry confusion.** Paid value never expires; promo value does — but many users do not understand the distinction. Groupon's 2012 $8.5M class-action settlement was about exactly this issue and the policy is still confusing today ([Top Class Actions](https://topclassactions.com/lawsuit-settlements/closed-settlements/groupon-voucher-class-action-lawsuit-settlement/)).
- **Tipping based on the inflated "original" price.** Customers report explicit merchant pressure to tip on the pre-Groupon price, eroding the perceived discount ([ConsumerAffairs](https://www.consumeraffairs.com/online/groupon.html)).

### Discovery & search

- **Category carousels still dominate** the home over personalized intent. The CX90 redesign called this out and replaced "plain deal feed" with category modules, but the modules themselves are still merchandised, not personalized to a user's behavior ([Groupon Engineering Medium](https://medium.com/groupon-eng/cx90-rethinking-redesigning-and-reimplementing-the-groupon-user-experience-59a03b6c306c)).
- **Search is keyword-based and filter-driven** — Yelp by contrast launched a natural-language conversational assistant in 2025 that resolves "birthday dinner spots with vegan options and heated outdoor seating" in one query ([Yelp Fall 2025](https://blog.yelp.com/news/fall-product-release-2025/)).
- **Map is faster than competitors when price is the primary filter** but lacks travel-time visualization — exactly the gap the 2025 strategy promises to close ([Retail Insight Network](https://www.retail-insight-network.com/data-insights/groupon-in-artificial-intelligence-theme-innovation-strategy/)).
- **Pratt critique points** at affordance issues: no scroll indicator on swipe-image carousels; "Save for later" is hidden behind less-than-discoverable interactions ([Pratt](https://ixd.prattsi.org/2023/02/design-critique-grouponapp/)).

### Trust & content quality

- **Inflated "original" prices.** "Just because something is listed on Groupon at a substantial discount doesn't make it a good deal" — a refrain across consumer-protection write-ups ([US News](https://money.usnews.com/money/personal-finance/saving-and-budgeting/articles/things-you-should-know-about-groupon)).
- **Stale deals listed.** Customers describe buying deals "that were no longer viable, having expired months ago" or where the merchant had quietly stopped honoring them ([Spocket synthesis](https://www.spocket.co/blogs/is-groupon-legit)).
- **Fine print buried.** Surcharges, shipping, monthly membership fees, blackout dates all appear in fine print but not above the fold during checkout.
- **Review quality.** Groupon's first-party reviews are policy-controlled ([Groupon review policy](https://www.groupon.com/legal/review-policy)) but users still trust off-platform sources more.

### Customer service

- **Hidden chat, no phone.** "Customer support is near non-existent — no phone #, no email, and chat only pops up if you get the correct combo of answers in their Help Center" (recurring 1-star Trustpilot pattern).
- **AI chat loops.** Reviewers describe a "useless AI" gatekeeper that has to be defeated before a human is reachable.
- **The Groupon Promise is real but slow.** Per Groupon's own merchant docs the Promise is "a refund or credit if your experience doesn't match what you was sold…It's not instant, and support can feel slow or scripted at times, but it exists" ([Groupon refund policy & promise](https://www.groupon.com/merchant/working-with-groupon/how-it-works/groupon-refund-policy)).
- **Push and email spam.** Groupon Engineering openly states it sends "almost half a billion notifications a day" ([Medium](https://medium.com/groupon-eng/groupon-push-marketing-how-we-send-almost-half-a-billion-notifications-a-day-4d77a160694a)). Mouse Print* counted 235 emails from Groupon/LivingSocial in a single month for one subscriber and noted unsubscribe links did not stop them ([Mouse Print*](https://www.mouseprint.org/2026/01/05/groupons-excessive-emails-amount-to-spam/)).

## Competitor Gaps

### Yelp

- **Conversational AI is now the entire front door.** "Yelp Assistant" is an agentic chatbot with its own iOS/Android tab that answers questions, recommends businesses, and completes the next action — booking a reservation, placing an order, scheduling an appointment via Vagaro / ZocDoc / Calendly integrations ([Yelp Fall 2025](https://blog.yelp.com/news/fall-product-release-2025/), [MacRumors](https://www.macrumors.com/2026/04/21/yelp-ai-assistant/)).
- **Personalization based on lifestyle, diet, accessibility.** Users explicitly opt in to dietary (vegan / halal / keto / gluten-free), lifestyle (parent / pet-owner), interests, and accessibility preferences — and the search homescreen reorganizes per user ([Yelp blog](https://blog.yelp.com/news/yelp-is-releasing-a-new-personalized-app-experience/)).
- **Visual discovery.** "Popular Offerings" uses LLMs to pair review mentions with photos across 100+ categories. Menu Vision surfaces dish photos in real time via the camera.
- **Reach.** ~28–29M monthly active devices ([Electroiq Yelp stats](https://electroiq.com/stats/yelp-statistics/)).
- **Yelp's weaknesses.** Trustpilot rates Yelp itself 1.5/5 from businesses (a different audience than consumers). Yelp is reviews-first, not commerce-first — the actual transaction is handed off to partners.

### Fever

- **Curated, "Instagram-feed" discovery.** "Unlike traditional ticket sites that just list shows, Fever's interface feels like an Instagram feed of experiences" ([The Infinite Trips](https://theinfinitetrips.com/fever-review/), [Programming Insider](https://programminginsider.com/%EF%B8%8F-discover-feverup-the-global-platform-redefining-how-we-experience-events-in-2025/)).
- **Aggressive personalization.** "Fever's proprietary recommendation engine ingests billions of data points — preferences, location, engagement, and spend — to deliver a hyper-personalized feed that minimizes search friction and enables discovery-to-purchase in a few taps."
- **Demand-creation flywheel.** Fever uses behavioral data to commission new experiences (Secret Cinema, Candlelight Concerts), so the feed is not just curating supply, it is generating it.
- **300M+ users in 40+ countries** ([Fever business model summary](https://vizologi.com/business-strategy-canvas/fever-business-model-canvas/)).
- **Where Fever loses.** Refund rigidity (voucher-only) and "no transfers, refunds or exchanges" even in emergencies ([Trustpilot Fever](https://www.trustpilot.com/review/feverup.com)). Some users report "no confirmation screen" before charge. So Fever is _not_ a model for post-purchase trust; it _is_ a model for top-of-funnel discovery.

### Viator

- **Booking flexibility as a default.** Standard policy: free cancellation up to 24 hours before the experience, refunded to the original payment method, processed within 48 hours (up to 7 days max) ([Viator help](https://www.viator.com/help)).
- **Instant Confirmation** is a first-class feature, and Viator publicly says reducing the booking cut-off to less than 12 hours "could increase your bookings by 16%" ([Viator partner resources](https://partnerresources.viator.com/)).
- **Payment flexibility.** Reserve-now-pay-later, Klarna installments, Apple Pay, PayPal, credit card — all available in-app, not gated by basket size.
- **Trip management on the day.** Offline access to tickets, same-day notifications with directions, direct messaging with the operator.
- **Rewards.** "Viator Rewards" earns points convertible to real dollars off future trips — Groupon has no comparable feature.
- **Where Viator loses.** 2.0/5 on PissedConsumer, 34% recommend ([PissedConsumer Viator](https://viator.pissedconsumer.com/review.html)). Customer service complaints when the third-party operator no-shows. Groupon's local-services breadth is broader.

### Summary table — where Groupon trails

| Capability | Groupon | Yelp | Fever | Viator |
|---|---|---|---|---|
| Conversational / NLP search | Keyword + filters | **Yelp Assistant (2025)** | Curated feed | Filter-based |
| Personalized home feed | Category modules; early personalization | **Lifestyle/diet/interest opt-ins** | **Behavioral ML feed** | Wishlist + history |
| Map / hyperlocal | Fast, but no travel-time viz | Yes | Yes | Yes |
| Guest checkout in 2 taps | Yes (+OTP) | N/A | Yes | Yes |
| BNPL in-app | Klarna web only, $100+ | N/A | Limited | **Klarna, Apple Pay, reserve-now-pay-later** |
| Free cancellation as standard | 3 days only | N/A | Voucher-only | **24h free cancel** |
| Refund to original payment | Often Bucks | N/A | Voucher-only | **Yes** |
| Instant confirmation | Variable | Yes (via partners) | Yes | **Standard feature** |
| Reachable human support | Hidden chat | Chat | Email-only | Email/chat |
| Notification load | ~500M/day platform-wide | Low | Moderate | Low |

## Redesign Priorities

1. **Make refund policy a feature, not a fight.**
   - _Problem:_ The 3-day refund window plus Bucks-only refunds is the single biggest one-star driver across every off-app review surface.
   - _Evidence:_ Reviews.io 1.5/5 from 9,686 customers; PissedConsumer 28.1K reviews dominated by refund complaints; Trustpilot 1-star reviews quoting "Hassle-free refund until January 6, 2026" then denied; widespread "refunded to Bucks not card" reports ([Reviews.io](https://www.reviews.io/company-reviews/store/groupon), [PissedConsumer](https://groupon.pissedconsumer.com/review.html)).
   - _Direction:_ Adopt a Viator-style 24-hour-before free cancellation for bookable services and 14-day refund-to-card window for unredeemed Local Deals. Surface refund terms above the **Buy** button, not in the Fine Print.
   - _Expected impact:_ Recover the long-tail "burnt customer" cohort; reduce ~30%+ of CS contacts that are refund disputes; improve Trustpilot/SmartCustomer ratings (a brand-trust moat against Yelp Assistant taking the consideration set).

2. **Replace category carousels with a Fever-style personalized feed and Yelp-style lifestyle opt-ins.**
   - _Problem:_ Home page is still merchandised by category, not by intent. The new redesign added "buy-it-again" but discovery is still passive.
   - _Evidence:_ Retail Dive on Groupon redesign; Yelp 2025 lifestyle preferences; Fever recommendation engine ingesting "billions of data points" ([Retail Dive](https://www.retaildive.com/news/groupon-redesigns-mobile-app-site-with-personalized-features/599609/), [Yelp blog](https://blog.yelp.com/news/yelp-is-releasing-a-new-personalized-app-experience/), [Programming Insider](https://programminginsider.com/%EF%B8%8F-discover-feverup-the-global-platform-redefining-how-we-experience-events-in-2025/)).
   - _Direction:_ On first launch, ask 4–6 lifestyle questions (foodie / fitness / parent / pet / wellness / spa / nightlife / day-trip). Build a single-column visual feed of curated experiences with hero imagery — not a carousel-of-carousels.
   - _Expected impact:_ Deal-page conversion is already +13% YoY post-redesign; an additional 5–10% lift seems achievable based on Fever's "discovery-to-purchase in a few taps" model.

3. **Ship a conversational discovery assistant.**
   - _Problem:_ Yelp now resolves complex multi-attribute queries in one prompt; Groupon's filters can't.
   - _Evidence:_ Yelp Fall 2025 release ([Yelp blog](https://blog.yelp.com/news/fall-product-release-2025/)); Groupon's own board-level AI committee for 2026 ([Seeking Alpha](https://seekingalpha.com/news/4563489-groupon-outlines-3-5-percent-growth-targets-for-2026-as-ai-strategy-accelerates-board-forms)).
   - _Direction:_ A "Groupon Assistant" entry on the home tab that accepts "date-night under $80 within 15 minutes" and returns 5 bookable deals, plus next-action buttons (book, save, share).
   - _Expected impact:_ Closes the perception gap with Yelp; reduces zero-result search rates; differentiates Groupon's price-led inventory in a category Yelp can't match.

4. **Re-engineer the booking-step from "voucher then go elsewhere" to instant confirmation.**
   - _Problem:_ Customer pays Groupon, then has to schedule on a separate system that frequently fails ("the circle just keeps spinning"). When the merchant has no slot the customer is stuck.
   - _Evidence:_ JustAnswer threads on stuck booking loaders; PissedConsumer complaints; Q4 2025 strategy explicitly cites instant booking as a goal.
   - _Direction:_ Mandate Groupon Booking Tool integration on all bookable local services; show real availability on the deal page before purchase; treat the slot as part of the transaction (Viator-style instant confirmation).
   - _Expected impact:_ Sharp reduction in "I paid but can't redeem" tickets, the largest category of post-purchase escalations.

5. **Rebuild post-purchase trust: bring the Groupon Promise out of hiding.**
   - _Problem:_ The Groupon Promise exists but is opaque; the chat support is hidden; phone support doesn't exist.
   - _Evidence:_ Multiple App Store and Trustpilot one-star reviews specifically about hidden chat and looping AI agents.
   - _Direction:_ Persistent "Need help with this purchase?" CTA inside the My Groupons page; SLA commitments shown to the user ("we respond in <2h"); skip-the-bot escalation if the merchant has been flagged repeatedly.
   - _Expected impact:_ Lowers cost-per-contact and directly addresses BBB-level complaints (Groupon's BBB rating is ~1.0).

6. **Dial down notifications and respect opt-out.**
   - _Problem:_ 500M notifications/day at the platform level; 235 emails counted in a single month for one user; unsubscribe links that don't fully unsubscribe.
   - _Evidence:_ [Groupon Engineering Medium](https://medium.com/groupon-eng/groupon-push-marketing-how-we-send-almost-half-a-billion-notifications-a-day-4d77a160694a), [Mouse Print*](https://www.mouseprint.org/2026/01/05/groupons-excessive-emails-amount-to-spam/).
   - _Direction:_ In-app notification preference center with granular sliders ("once/day, once/week, off"); honor the OS-level email unsubscribe in <24h; cap pushes at 1/day by default for new users.
   - _Expected impact:_ Reduces uninstalls (a key reason cited for app deletion); aligns with the "respectful" brand Senkypl is trying to build.

7. **Surface fine print, total price, and tax inline before Confirm Purchase.**
   - _Problem:_ Surcharges, shipping fees, gift-message fees, and even monthly memberships are documented only in fine print after purchase.
   - _Evidence:_ ConsumerAffairs and Mouse Print* report 500% markups discovered post-purchase and $38/mo membership fees buried in fine print.
   - _Direction:_ Total-cost line item (deal + tax + service fee + shipping) above the **Confirm Purchase** button; expandable "What's Included" panel listing every restriction in plain English; mandatory checkbox if the deal has a recurring charge.
   - _Expected impact:_ Reduces chargebacks and FTC-style complaints; aligns with consumer protection trends post the 2012 $8.5M expiration-date settlement ([Top Class Actions](https://topclassactions.com/lawsuit-settlements/closed-settlements/groupon-voucher-class-action-lawsuit-settlement/)).

8. **Make BNPL and Apple Pay first-class in-app, not web-only or basket-gated.**
   - _Problem:_ Klarna is web-only and gated at $100+; PayPal "looping for hours" is documented; competitors offer in-app installments universally.
   - _Evidence:_ [Zip listing](https://zip.co/us/store/groupon); JustUseApp PayPal complaint synthesis; [Viator partner resources](https://partnerresources.viator.com/) on Klarna installments in-app.
   - _Direction:_ Surface BNPL options at the deal-page price (e.g., "or 4× $12 with Klarna"), not after checkout begins. Default Apple Pay sheet to a single tap for returning users; aggressively retire the broken PayPal loop.
   - _Expected impact:_ Reduces drop-off at the 3DS step; raises basket size; matches the BNPL experience consumers now get from Amazon, Viator, and StubHub.

## Sources

**App-store, ratings & general sentiment**
- [Groupon iOS app review summary — AppsHunter](https://appshunter.io/ios/app/352683833/reviews)
- [Groupon on Google Play](https://play.google.com/store/apps/details?id=com.groupon&hl=en_US)
- [Groupon on Trustpilot](https://www.trustpilot.com/review/www.groupon.com)
- [Groupon on SmartCustomer](https://www.smartcustomer.com/reviews/groupon.com)
- [Groupon on Reviews.io](https://www.reviews.io/company-reviews/store/groupon)
- [Groupon on PissedConsumer](https://groupon.pissedconsumer.com/review.html)
- [Groupon on BBB](https://www.bbb.org/us/il/chicago/profile/ecommerce/groupon-inc-0654-88367005/complaints)
- [Groupon on ConsumerAffairs](https://www.consumeraffairs.com/online/groupon.html)
- [Groupon on JustUseApp](https://justuseapp.com/en/app/352683833/groupon/reviews)
- [Groupon on App Comrade](https://appcomrade.com/apple/groupon-local-deals-near-me-352683833/)

**Checkout, refunds, and policy**
- [Groupon mobile purchase FAQ](https://www.groupon.com/pages/mobilepurchase-faq)
- [Groupon payment methods guide](https://www.groupon.com/faq/payments-billing/groupon-payment-methods-guide)
- [Groupon refund policy](https://www.groupon.com/legal/grouponrefundpolicy)
- [Groupon refund policy & promise (merchant)](https://www.groupon.com/merchant/working-with-groupon/how-it-works/groupon-refund-policy)
- [Groupon guest checkout FAQ](https://www.groupon.com/faq/guest/how-to-access-guest-order)
- [Groupon BNPL via Zip](https://zip.co/us/store/groupon)
- [Top Class Actions: Groupon expired voucher settlement](https://topclassactions.com/lawsuit-settlements/closed-settlements/groupon-voucher-class-action-lawsuit-settlement/)
- [Elliott Report: Why won't Groupon refund me?](https://www.elliott.org/problem-solved/why-wont-groupon-refund-me-the-restaurant-closed/)
- [JustAnswer: stuck booking loader](https://www.justanswer.com/software/spftg-groupon-appointment-booking-stuck-loading.html)

**Groupon UX teardowns & strategy**
- [Groupon Engineering — CX90 redesign](https://medium.com/groupon-eng/cx90-rethinking-redesigning-and-reimplementing-the-groupon-user-experience-59a03b6c306c)
- [Groupon Design Union — User research case study](https://medium.com/groupon-design-union/groupon-user-research-informing-design-driving-strategy-and-facilitating-collaboration-eb6113c5470e)
- [Designing Groupon Go — Rahul Gonsalves](https://medium.com/@gonsalves_r/designing-groupon-go-great-experiences-around-you-e230cd5c4a99)
- [IXD @ Pratt design critique](https://ixd.prattsi.org/2023/02/design-critique-grouponapp/)
- [Groupon Engineering — Search ranking](https://engineering.groupon.com/2013/misc/how-groupons-search-ranking-works/)
- [Groupon Engineering — push notifications scale](https://medium.com/groupon-eng/groupon-push-marketing-how-we-send-almost-half-a-billion-notifications-a-day-4d77a160694a)
- [Retail Dive — Groupon mobile redesign](https://www.retaildive.com/news/groupon-redesigns-mobile-app-site-with-personalized-features/599609/)
- [Product-Led Alliance — Groupon comeback](https://www.productledalliance.com/how-groupon-is-engineering-its-comeback/)
- [Retail Insight Network — Groupon AI strategy](https://www.retail-insight-network.com/data-insights/groupon-in-artificial-intelligence-theme-innovation-strategy/)
- [Mouse Print* — Groupon emails amount to spam](https://www.mouseprint.org/2026/01/05/groupons-excessive-emails-amount-to-spam/)
- [LBBOnline — Groupon "Turn Life On" AI campaign](https://lbbonline.com/news/Groupon-Flips-the-Switch-on-Boring-with-AI-Fuelled-Turn-Life-On-Campaign)

**Earnings & corporate strategy**
- [Groupon Q3 2025 — GuruFocus](https://www.gurufocus.com/news/3197267/groupon-inc-grpn-q3-2025-earnings-call-highlights-strong-local-growth-and-strategic-expansion)
- [Groupon Q4 2025 — GuruFocus](https://www.gurufocus.com/news/8699083/groupon-inc-grpn-q4-2025-earnings-call-highlights-a-year-of-growth-and-strategic-shifts)
- [Groupon Q3 2025 press release](https://investor.groupon.com/press-releases/press-release-details/2025/Groupon-Reports-Third-Quarter-2025-Results/default.aspx)
- [Seeking Alpha — 2026 outlook and AI committee](https://seekingalpha.com/news/4563489-groupon-outlines-3-5-percent-growth-targets-for-2026-as-ai-strategy-accelerates-board-forms)
- [Groupon — Senkypl as permanent CEO](https://investor.groupon.com/press-releases/press-release-details/2024/Groupon-Announces-Dusan-Senkypl-as-Permanent-CEO/default.aspx)

**Competitor — Yelp**
- [Yelp Fall 2025 product release](https://blog.yelp.com/news/fall-product-release-2025/)
- [Yelp — personalized app experience](https://blog.yelp.com/news/yelp-is-releasing-a-new-personalized-app-experience/)
- [Yelp Assistant — MacRumors](https://www.macrumors.com/2026/04/21/yelp-ai-assistant/)
- [Yelp Assistant — Engadget](https://www.engadget.com/apps/yelps-ai-chatbot-can-now-make-your-dinner-reservation-110000661.html)
- [Yelp Statistics — Electroiq](https://electroiq.com/stats/yelp-statistics/)

**Competitor — Fever**
- [Fever on Trustpilot](https://www.trustpilot.com/review/feverup.com)
- [Fever — Programming Insider 2025 profile](https://programminginsider.com/%EF%B8%8F-discover-feverup-the-global-platform-redefining-how-we-experience-events-in-2025/)
- [Fever — The Infinite Trips review](https://theinfinitetrips.com/fever-review/)
- [Fever case study — Itamar Gilad](https://itamargilad.com/case-study-how-fever-uses-a-b-experiments-and-data-analysis-to-double-customer-lifetime-value/)
- [Fever business model — Vizologi](https://vizologi.com/business-strategy-canvas/fever-business-model-canvas/)

**Competitor — Viator**
- [Viator on Trustpilot](https://www.trustpilot.com/review/www.viator.com)
- [Viator partner resources](https://partnerresources.viator.com/)
- [Viator help center](https://www.viator.com/help)
- [Viator on PissedConsumer](https://viator.pissedconsumer.com/review.html)
- [Viator review — TheCompletePortal](https://thecompleteportal.com/blog/viator-uk-review-worth-booking/)
- [Viator review — GaiaGazer](https://gaiagazer.com/viator-review/)

**Consumer protection & trust context**
- [US News — Things You Should Know About Groupon](https://money.usnews.com/money/personal-finance/saving-and-budgeting/articles/things-you-should-know-about-groupon)
- [Spocket — Is Groupon Legit?](https://www.spocket.co/blogs/is-groupon-legit)
- [Groupon official "Is Groupon Legit"](https://www.groupon.com/articles/is-groupon-legit)
- [Groupon customer review policy](https://www.groupon.com/legal/review-policy)
