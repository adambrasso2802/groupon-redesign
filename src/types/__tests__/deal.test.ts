import { describe, it, expect } from "vitest";
import type {
  Deal,
  AIRecommendationSlot,
  CheckoutSummary,
  SupportTicket,
  PriceBreakdown,
  RefundPolicy,
} from "../deal";

// ---------------------------------------------------------------------------
// Helpers: minimal valid objects for each type
// ---------------------------------------------------------------------------

const validPricing: PriceBreakdown = {
  dealPriceCents: 4999,
  originalPriceCents: 9999,
  serviceFeeCents: 199,
  taxCents: 425,
  shippingCents: 0,
  totalCents: 5623,
};

const validRefundPolicy: RefundPolicy = {
  isRefundable: true,
  windowAmount: 24,
  windowUnit: "hours",
  plainTextSummary: "Free cancellation up to 24h before your appointment",
};

const validDeal: Deal = {
  dealId: "deal-001",
  title: "60-Minute Swedish Massage",
  description: "Relaxing full-body massage at downtown spa.",
  merchant: {
    merchantId: "merchant-001",
    name: "Serenity Spa",
    rating: 4.7,
    reviewCount: 312,
    isFlagged: false,
  },
  category: "spa_wellness",
  heroImages: ["https://example.com/image1.jpg"],
  pricing: validPricing,
  bnplOptions: [
    {
      provider: "klarna",
      installments: 4,
      installmentAmountCents: 1406,
    },
  ],
  refundPolicy: validRefundPolicy,
  supportsInstantConfirmation: true,
  isBookable: true,
  hasRecurringCharge: false,
  finePrint: ["Valid Mon–Fri only", "Excludes public holidays"],
  voucherExpiryDate: "2026-12-31",
  isActive: true,
};

describe("Deal interface", () => {
  it("accepts a fully-populated deal object", () => {
    expect(validDeal.dealId).toBe("deal-001");
    expect(validDeal.heroImages.length).toBeGreaterThanOrEqual(1);
  });

  it("requires at least one hero image (tuple constraint)", () => {
    const firstImage: string = validDeal.heroImages[0];
    expect(typeof firstImage).toBe("string");
  });

  it("accepts optional recommendation slot fields", () => {
    const dealWithRec: Deal = {
      ...validDeal,
      recommendation: { score: 0.93, reason: "Because you booked a spa day in March" },
    };
    expect(dealWithRec.recommendation?.score).toBe(0.93);
  });

  it("accepts optional recurringChargeSummary when hasRecurringCharge is true", () => {
    const dealWithRecurring: Deal = {
      ...validDeal,
      hasRecurringCharge: true,
      recurringChargeSummary: "Auto-renews monthly at $29.99",
    };
    expect(dealWithRecurring.recurringChargeSummary).toBeDefined();
  });

  it("serialises and deserialises cleanly", () => {
    const roundTripped = JSON.parse(JSON.stringify(validDeal)) as Deal;
    expect(roundTripped.dealId).toBe(validDeal.dealId);
    expect(roundTripped.pricing.totalCents).toBe(validDeal.pricing.totalCents);
  });
});

describe("PriceBreakdown", () => {
  it("holds all required line-item fields", () => {
    expect(validPricing.dealPriceCents).toBe(4999);
    expect(validPricing.originalPriceCents).toBe(9999);
    expect(validPricing.serviceFeeCents).toBe(199);
    expect(validPricing.taxCents).toBe(425);
    expect(validPricing.shippingCents).toBe(0);
    expect(validPricing.totalCents).toBe(5623);
  });
});

describe("RefundPolicy", () => {
  it("accepts a refundable policy", () => {
    expect(validRefundPolicy.isRefundable).toBe(true);
    expect(validRefundPolicy.windowUnit).toBe("hours");
  });

  it("accepts a non-refundable policy with no window", () => {
    const nonRefundable: RefundPolicy = {
      isRefundable: false,
      windowAmount: 0,
      windowUnit: "days",
      plainTextSummary: "All sales final",
    };
    expect(nonRefundable.isRefundable).toBe(false);
  });

  it("accepts an optional deadline timestamp", () => {
    const withDeadline: RefundPolicy = {
      ...validRefundPolicy,
      deadlineMs: 1_750_000_000_000,
    };
    expect(withDeadline.deadlineMs).toBeDefined();
  });
});

describe("AIRecommendationSlot", () => {
  it("holds all required fields", () => {
    const slot: AIRecommendationSlot = {
      dealId: "deal-001",
      score: 0.87,
      reason: "Top-rated date night near you",
      category: "food_drink",
    };
    expect(slot.score).toBeGreaterThanOrEqual(0);
    expect(slot.score).toBeLessThanOrEqual(1);
    expect(typeof slot.reason).toBe("string");
  });
});

describe("CheckoutSummary", () => {
  it("accepts a pre-purchase summary without orderId or slot", () => {
    const summary: CheckoutSummary = {
      dealId: "deal-001",
      deal: {
        title: validDeal.title,
        merchant: validDeal.merchant,
        heroImages: validDeal.heroImages,
        category: validDeal.category,
      },
      pricing: validPricing,
      refundPolicy: validRefundPolicy,
      hasRecurringCharge: false,
      recurringChargeAcknowledged: false,
    };
    expect(summary.orderId).toBeUndefined();
    expect(summary.selectedSlotIso).toBeUndefined();
  });

  it("accepts a post-purchase summary with orderId and slot", () => {
    const summary: CheckoutSummary = {
      dealId: "deal-001",
      orderId: "order-abc123",
      deal: {
        title: validDeal.title,
        merchant: validDeal.merchant,
        heroImages: validDeal.heroImages,
        category: validDeal.category,
      },
      pricing: validPricing,
      selectedSlotIso: "2026-06-15T14:00:00Z",
      refundPolicy: validRefundPolicy,
      hasRecurringCharge: false,
      recurringChargeAcknowledged: false,
      paymentMethod: "apple_pay",
    };
    expect(summary.orderId).toBe("order-abc123");
    expect(summary.paymentMethod).toBe("apple_pay");
  });
});

describe("SupportTicket", () => {
  it("accepts a minimal support ticket", () => {
    const ticket: SupportTicket = {
      orderId: "order-abc123",
      dealId: "deal-001",
      userId: "user-xyz",
      surface: "confirmation_screen",
      createdAt: "2026-05-15T10:00:00Z",
    };
    expect(ticket.issueCategory).toBeUndefined();
    expect(ticket.surface).toBe("confirmation_screen");
  });

  it("accepts a fully-described support ticket", () => {
    const ticket: SupportTicket = {
      orderId: "order-abc123",
      dealId: "deal-001",
      userId: "user-xyz",
      surface: "my_groupons",
      createdAt: "2026-05-15T10:00:00Z",
      issueCategory: "cant_book",
      description: "Merchant website is returning an error when I try to redeem.",
    };
    expect(ticket.issueCategory).toBe("cant_book");
  });
});
