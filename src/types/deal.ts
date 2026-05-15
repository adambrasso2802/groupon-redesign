export type DealCategory =
  | "food_drink"
  | "fitness"
  | "spa_wellness"
  | "activities"
  | "travel"
  | "shopping"
  | "nightlife"
  | "family_kids"
  | "pets"
  | "beauty"
  | "home_services"
  | "other";

export type RefundWindowUnit = "hours" | "days";

export interface RefundPolicy {
  isRefundable: boolean;
  windowAmount: number;
  windowUnit: RefundWindowUnit;
  /** Plain-English summary rendered on badge and checkout, e.g. "Free cancellation up to 24h before your appointment" */
  plainTextSummary: string;
  /** Unix timestamp (ms) of the deadline, set post-purchase */
  deadlineMs?: number | undefined;
}

export type BNPLProvider = "klarna" | "afterpay" | "affirm";

export interface BNPLOption {
  provider: BNPLProvider;
  installments: number;
  installmentAmountCents: number;
}

export interface PriceBreakdown {
  dealPriceCents: number;
  originalPriceCents: number;
  serviceFeeCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
}

export interface MerchantInfo {
  merchantId: string;
  name: string;
  rating: number;
  reviewCount: number;
  /** Whether this merchant has been previously flagged for support issues */
  isFlagged: boolean;
}

/** Shape returned by the recommendation engine for each slot in the personalized feed */
export interface AIRecommendationSlot {
  dealId: string;
  score: number;
  reason: string;
  category: DealCategory;
}

/**
 * Full typed interface for a deal — covers every field a DealCard and
 * DealDetailScreen will need across all phases of the user flow.
 */
export interface Deal {
  dealId: string;
  title: string;
  description: string;
  merchant: MerchantInfo;

  category: DealCategory;
  heroImages: [string, ...string[]]; // at least one image required

  pricing: PriceBreakdown;
  bnplOptions: BNPLOption[];

  refundPolicy: RefundPolicy;
  /** True when the booking is confirmed immediately at purchase */
  supportsInstantConfirmation: boolean;
  /** True when the deal has a bookable slot (requires AvailabilityCalendar) */
  isBookable: boolean;
  /** True when the deal carries any recurring / subscription charge */
  hasRecurringCharge: boolean;
  recurringChargeSummary?: string;

  /** Restriction, surcharge, and blackout text rendered in FinePrintExpander */
  finePrint: string[];

  /** Present only when deal is delivered via the AI recommendation feed */
  recommendation?: Pick<AIRecommendationSlot, "score" | "reason">;

  /** ISO 8601 expiry date of the voucher after purchase */
  voucherExpiryDate: string;
  isActive: boolean;
}

/** Typed shape for the order review screen (CheckoutSummary) */
export interface CheckoutSummary {
  dealId: string;
  orderId?: string; // set after purchase
  deal: Pick<Deal, "title" | "merchant" | "heroImages" | "category">;
  pricing: PriceBreakdown;
  selectedSlotIso?: string | undefined; // set when deal.isBookable
  refundPolicy: RefundPolicy;
  hasRecurringCharge: boolean;
  recurringChargeAcknowledged: boolean;
  paymentMethod?: PaymentMethod;
}

export type PaymentMethod = "apple_pay" | "klarna" | "saved_card" | "new_card";

/** Typed request shape for initiating support contact from a specific order */
export interface SupportTicket {
  orderId: string;
  dealId: string;
  userId: string;
  /** Surface from which help was opened */
  surface: "confirmation_screen" | "my_groupons" | "voucher_card";
  /** ISO 8601 timestamp of ticket creation */
  createdAt: string;
  issueCategory?: SupportIssueCategory;
  description?: string;
}

export type SupportIssueCategory =
  | "cant_book"
  | "refund_request"
  | "voucher_issue"
  | "merchant_no_show"
  | "billing_dispute"
  | "other";
