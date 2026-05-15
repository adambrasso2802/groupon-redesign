import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { VoucherCard } from "../VoucherCard";
import type { AnalyticsClient } from "../../analytics/client";
import type { CheckoutSummary } from "../../types/deal";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

const baseOrder: CheckoutSummary & { orderId: string } = {
  orderId: "ORDER-001",
  dealId: "deal-001",
  deal: {
    title: "90-Minute Swedish Massage",
    merchant: {
      merchantId: "m-001",
      name: "Serenity Day Spa",
      rating: 4.8,
      reviewCount: 412,
      isFlagged: false,
    },
    heroImages: ["https://example.com/img.jpg"],
    category: "spa_wellness",
  },
  pricing: {
    dealPriceCents: 4900,
    originalPriceCents: 9800,
    serviceFeeCents: 199,
    taxCents: 412,
    shippingCents: 0,
    totalCents: 5511,
  },
  refundPolicy: {
    isRefundable: true,
    windowAmount: 7,
    windowUnit: "days",
    plainTextSummary: "Free cancellation within 7 days",
    deadlineMs: new Date("2026-05-18").getTime(),
  },
  hasRecurringCharge: false,
  recurringChargeAcknowledged: false,
};

function renderCard(overrides: Partial<React.ComponentProps<typeof VoucherCard>> = {}) {
  const props = {
    order: baseOrder,
    voucherCode: "GRPN-XY9Z-2026",
    analytics: makeAnalytics(),
    onActionSelected: vi.fn(),
    ...overrides,
  };
  render(<VoucherCard {...props} />);
  return props;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("VoucherCard — rendering", () => {
  it("renders the card container", () => {
    renderCard();
    expect(screen.getByTestId("voucher-card")).toBeInTheDocument();
  });

  it("shows the deal title", () => {
    renderCard();
    expect(screen.getByTestId("voucher-deal-title")).toHaveTextContent("90-Minute Swedish Massage");
  });

  it("shows the merchant name", () => {
    renderCard();
    expect(screen.getByTestId("voucher-merchant-name")).toHaveTextContent("Serenity Day Spa");
  });

  it("shows the voucher code", () => {
    renderCard();
    expect(screen.getByTestId("voucher-code")).toHaveTextContent("GRPN-XY9Z-2026");
  });

  it("renders the voucher code section", () => {
    renderCard();
    expect(screen.getByTestId("voucher-code-section")).toBeInTheDocument();
  });

  it("shows booking date when selectedSlotIso is provided", () => {
    renderCard({ order: { ...baseOrder, selectedSlotIso: "2026-06-15T14:00:00Z" } });
    expect(screen.getByTestId("voucher-booking-date")).toBeInTheDocument();
  });

  it("does not show booking date when selectedSlotIso is absent", () => {
    renderCard({ order: { ...baseOrder, selectedSlotIso: undefined } });
    expect(screen.queryByTestId("voucher-booking-date")).toBeNull();
  });

  it("embeds PostPurchaseHelpEntry at the bottom", () => {
    renderCard();
    expect(screen.getByTestId("post-purchase-help-entry")).toBeInTheDocument();
  });

  it("PostPurchaseHelpEntry is wired to the voucher_card surface", () => {
    renderCard();
    expect(screen.getByTestId("post-purchase-help-entry")).toHaveAttribute("data-surface", "voucher_card");
  });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("VoucherCard — analytics", () => {
  it("fires voucher_viewed on mount", () => {
    const analytics = makeAnalytics();
    renderCard({ analytics });
    expect(analytics.track).toHaveBeenCalledWith({
      event: "voucher_viewed",
      orderId: "ORDER-001",
      dealId: "deal-001",
    });
  });

  it("fires voucher_viewed exactly once", () => {
    const analytics = makeAnalytics();
    renderCard({ analytics });
    const calls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => (args[0] as { event: string }).event === "voucher_viewed",
    );
    expect(calls).toHaveLength(1);
  });

  it("fires post_purchase_help_opened when Need help? is tapped", () => {
    const analytics = makeAnalytics();
    renderCard({ analytics });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "post_purchase_help_opened",
      orderId: "ORDER-001",
      surface: "voucher_card",
    });
  });
});

// ---------------------------------------------------------------------------
// Help integration
// ---------------------------------------------------------------------------

describe("VoucherCard — help integration", () => {
  it("opens the SupportBottomSheet when Need help? is tapped", () => {
    renderCard();
    fireEvent.click(screen.getByTestId("need-help-cta"));
    expect(screen.getByTestId("support-bottom-sheet")).toBeInTheDocument();
  });

  it("calls onActionSelected when an action is chosen", () => {
    const onActionSelected = vi.fn();
    renderCard({ onActionSelected });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(onActionSelected).toHaveBeenCalledWith("get_a_refund");
  });
});
