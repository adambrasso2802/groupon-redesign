import type { DealCategory, PaymentMethod, SupportIssueCategory } from "./deal";

export type LifestylePreference =
  | "foodie"
  | "fitness"
  | "parent"
  | "pet_owner"
  | "wellness_spa"
  | "nightlife_daytrip";

export type BudgetRange = "under_25" | "25_to_50" | "50_to_100" | "over_100";

export type LocationRadiusMiles = 5 | 10 | 25 | 50;

export type SearchMode = "keyword" | "assistant";

export type AssistantResultAction = "book" | "save" | "share";

export type HelpSurface =
  | "confirmation_screen"
  | "my_groupons"
  | "voucher_card";

// ---------------------------------------------------------------------------
// Phase 0 — First-Launch Onboarding
// ---------------------------------------------------------------------------

export interface QuizStartedEvent {
  event: "quiz_started";
}

export interface LifestylePreferenceSelectedEvent {
  event: "lifestyle_preference_selected";
  preference: LifestylePreference;
}

export interface QuizCompletedEvent {
  event: "quiz_completed";
  selectedPreferences: LifestylePreference[];
  budgetRange: BudgetRange;
  locationRadiusMiles: LocationRadiusMiles;
}

export interface QuizSkippedEvent {
  event: "quiz_skipped";
}

// ---------------------------------------------------------------------------
// Phase 1 — Home Screen
// ---------------------------------------------------------------------------

export interface HomeScreenViewedEvent {
  event: "home_screen_viewed";
  /** Number of recommendation slots rendered in the feed */
  slotCount: number;
}

export interface FeedViewedEvent {
  event: "feed_viewed";
}

export interface DealCardImpressionEvent {
  event: "deal_card_impression";
  dealId: string;
  position: number;
  category: DealCategory;
  /** Present when card is from the AI recommendation feed */
  score?: number;
  reason?: string;
}

export interface DealCardTappedEvent {
  event: "deal_card_tapped";
  dealId: string;
  position: number;
  category: DealCategory;
  score?: number;
  reason?: string;
}

export interface FeedScrolledEvent {
  event: "feed_scrolled";
  /** Number of cards scrolled past */
  depth: number;
}

// ---------------------------------------------------------------------------
// Phase 2 — Search and Conversational Discovery
// ---------------------------------------------------------------------------

export interface SearchBarOpenedEvent {
  event: "search_bar_opened";
}

export interface SearchInitiatedEvent {
  event: "search_initiated";
}

export interface SearchSubmittedEvent {
  event: "search_submitted";
  query: string;
  mode: SearchMode;
}

export interface AssistantOpenedEvent {
  event: "assistant_opened";
}

export interface AssistantMessageSentEvent {
  event: "assistant_message_sent";
  query: string;
}

export interface SearchFilterChangedEvent {
  event: "search_filter_changed";
  filterKey: "radius" | "category" | "price_range" | "rating" | "sort";
  filterValue: string | number;
}

export interface SearchResultTappedEvent {
  event: "search_result_tapped";
  dealId: string;
  position: number;
  query: string;
}

export interface AssistantQuerySubmittedEvent {
  event: "assistant_query_submitted";
  query: string;
  resultCount: number;
}

export interface AssistantResultActionTakenEvent {
  event: "assistant_result_action_taken";
  dealId: string;
  action: AssistantResultAction;
  position: number;
}

// ---------------------------------------------------------------------------
// Phase 3 — Deal Detail
// ---------------------------------------------------------------------------

export interface DealViewedEvent {
  event: "deal_viewed";
  dealId: string;
  category: DealCategory;
}

export interface HeroImageSwipedEvent {
  event: "hero_image_swiped";
  dealId: string;
  imageIndex: number;
}

export interface FinePrintExpandedEvent {
  event: "fine_print_expanded";
  dealId: string;
}

export interface PricingBreakdownExpandedEvent {
  event: "pricing_breakdown_expanded";
  dealId: string;
}

export interface RefundPolicyExpandedEvent {
  event: "refund_policy_expanded";
  dealId: string;
}

export interface DealSavedEvent {
  event: "deal_saved";
  dealId: string;
}

export interface BuyTappedEvent {
  event: "buy_tapped";
  dealId: string;
  totalCents: number;
}

export interface DealDetailViewedEvent {
  event: "deal_detail_viewed";
  dealId: string;
  category: DealCategory;
}

export interface DateSelectedEvent {
  event: "date_selected";
  dealId: string;
  dateIso: string;
}

export interface BuyNowTappedEvent {
  event: "buy_now_tapped";
  dealId: string;
  totalCents: number;
  selectedDateIso?: string;
}

export interface BnplHintTappedEvent {
  event: "bnpl_hint_tapped";
  dealId: string;
  provider: string;
  installments: number;
  installmentAmountCents: number;
}

// ---------------------------------------------------------------------------
// Phase 4 — Checkout
// ---------------------------------------------------------------------------

export interface CheckoutOpenedEvent {
  event: "checkout_opened";
  dealId: string;
}

export interface SlotSelectedEvent {
  event: "slot_selected";
  dealId: string;
  slotIso: string;
}

export interface PaymentMethodSelectedEvent {
  event: "payment_method_selected";
  method: PaymentMethod;
}

export interface RecurringChargeAcknowledgedEvent {
  event: "recurring_charge_acknowledged";
  dealId: string;
}

export interface PurchaseConfirmedEvent {
  event: "purchase_confirmed";
  dealId: string;
  orderId: string;
  totalCents: number;
  paymentMethod: PaymentMethod;
}

export interface ThreeDsChallengeStartedEvent {
  event: "three_ds_challenge_started";
  dealId: string;
}

export interface ThreeDsChallengeSucceededEvent {
  event: "three_ds_challenge_succeeded";
  dealId: string;
}

export interface ThreeDsChallengeFailedEvent {
  event: "three_ds_challenge_failed";
  dealId: string;
}

// ---------------------------------------------------------------------------
// Phase 5 — Booking Confirmation
// ---------------------------------------------------------------------------

export interface BookingConfirmationViewedEvent {
  event: "booking_confirmation_viewed";
  dealId: string;
  orderId: string;
}

export interface AddToCalendarTappedEvent {
  event: "add_to_calendar_tapped";
  orderId: string;
}

// ---------------------------------------------------------------------------
// Phase 6 — My Groupons and Post-Purchase Support
// ---------------------------------------------------------------------------

export interface MyGrouponsViewedEvent {
  event: "my_groupons_viewed";
}

export interface VoucherViewedEvent {
  event: "voucher_viewed";
  orderId: string;
  dealId: string;
}

export interface PostPurchaseHelpOpenedEvent {
  event: "post_purchase_help_opened";
  orderId: string;
  surface: HelpSurface;
}

export interface SupportChatOpenedEvent {
  event: "support_chat_opened";
  orderId: string;
}

export interface SupportEscalatedToHumanEvent {
  event: "support_escalated_to_human";
  orderId: string;
  issueCategory?: SupportIssueCategory;
}

export interface SelfServeRefundStartedEvent {
  event: "self_serve_refund_started";
  orderId: string;
  dealId: string;
}

export interface SelfServeRefundCompletedEvent {
  event: "self_serve_refund_completed";
  orderId: string;
  refundAmountCents: number;
}

export type SupportAction = "get_a_refund" | "contact_support" | "report_a_problem";

export interface SupportActionSelectedEvent {
  event: "support_action_selected";
  orderId: string;
  action: SupportAction;
}

// ---------------------------------------------------------------------------
// Union — every trackable event across all six phases
// ---------------------------------------------------------------------------

export type AnalyticsEvent =
  // Phase 0
  | QuizStartedEvent
  | LifestylePreferenceSelectedEvent
  | QuizCompletedEvent
  | QuizSkippedEvent
  // Phase 1
  | HomeScreenViewedEvent
  | FeedViewedEvent
  | DealCardImpressionEvent
  | DealCardTappedEvent
  | FeedScrolledEvent
  // Phase 2
  | SearchBarOpenedEvent
  | SearchInitiatedEvent
  | SearchSubmittedEvent
  | SearchFilterChangedEvent
  | SearchResultTappedEvent
  | AssistantQuerySubmittedEvent
  | AssistantResultActionTakenEvent
  | AssistantOpenedEvent
  | AssistantMessageSentEvent
  // Phase 3
  | DealViewedEvent
  | HeroImageSwipedEvent
  | FinePrintExpandedEvent
  | PricingBreakdownExpandedEvent
  | RefundPolicyExpandedEvent
  | DealSavedEvent
  | BuyTappedEvent
  | BnplHintTappedEvent
  | DealDetailViewedEvent
  | DateSelectedEvent
  | BuyNowTappedEvent
  // Phase 4
  | CheckoutOpenedEvent
  | SlotSelectedEvent
  | PaymentMethodSelectedEvent
  | RecurringChargeAcknowledgedEvent
  | PurchaseConfirmedEvent
  | ThreeDsChallengeStartedEvent
  | ThreeDsChallengeSucceededEvent
  | ThreeDsChallengeFailedEvent
  // Phase 5
  | BookingConfirmationViewedEvent
  | AddToCalendarTappedEvent
  // Phase 6
  | MyGrouponsViewedEvent
  | VoucherViewedEvent
  | PostPurchaseHelpOpenedEvent
  | SupportChatOpenedEvent
  | SupportEscalatedToHumanEvent
  | SelfServeRefundStartedEvent
  | SelfServeRefundCompletedEvent
  | SupportActionSelectedEvent;

/** Narrow the union to the event payload type for a given event name */
export type EventByName<T extends AnalyticsEvent["event"]> = Extract<
  AnalyticsEvent,
  { event: T }
>;
