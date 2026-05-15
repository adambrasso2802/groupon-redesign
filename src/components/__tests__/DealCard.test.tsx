import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DealCard } from "../DealCard";
import type { Deal } from "../../types/deal";
import type { AnalyticsClient } from "../../analytics/client";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    dealId: "deal-001",
    title: "90-Minute Spa Package",
    description: "Full-body massage and facial.",
    merchant: {
      merchantId: "merchant-01",
      name: "Serenity Spa",
      rating: 4.7,
      reviewCount: 312,
      isFlagged: false,
    },
    category: "spa_wellness",
    heroImages: ["https://example.com/hero.jpg"],
    pricing: {
      dealPriceCents: 4999,
      originalPriceCents: 9999,
      serviceFeeCents: 199,
      taxCents: 400,
      shippingCents: 0,
      totalCents: 5598,
    },
    bnplOptions: [],
    refundPolicy: {
      isRefundable: true,
      windowAmount: 24,
      windowUnit: "hours",
      plainTextSummary: "Free cancellation up to 24h before your appointment",
    },
    supportsInstantConfirmation: true,
    isBookable: true,
    hasRecurringCharge: false,
    finePrint: [],
    voucherExpiryDate: "2026-12-31",
    isActive: true,
    ...overrides,
  };
}

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("DealCard — rendering", () => {
  it("renders the deal title", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.getByTestId("deal-card-title")).toHaveTextContent("90-Minute Spa Package");
  });

  it("renders the merchant name", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.getByTestId("deal-card-merchant")).toHaveTextContent("Serenity Spa");
  });

  it("renders the deal price in dollar format", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.getByTestId("deal-card-price")).toHaveTextContent("$49.99");
  });

  it("renders the original price with strikethrough", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.getByTestId("deal-card-original-price")).toHaveTextContent("$99.99");
  });

  it("renders the category label", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.getByTestId("deal-card-category")).toHaveTextContent("spa wellness");
  });

  it("renders the hero image with the correct src", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    const img = screen.getByTestId("deal-card-image") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/hero.jpg");
  });

  it("renders the first image when multiple hero images are present", () => {
    const deal = makeDeal({ heroImages: ["https://example.com/first.jpg", "https://example.com/second.jpg"] });
    render(<DealCard deal={deal} analytics={makeAnalytics()} position={0} />);
    const img = screen.getByTestId("deal-card-image") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/first.jpg");
  });

  it("renders the RefundPolicyBadge", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.getByTestId("refund-policy-badge")).toBeInTheDocument();
  });

  it("renders the discount percentage", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.getByTestId("deal-card-discount")).toHaveTextContent("50% off");
  });
});

// ---------------------------------------------------------------------------
// Recommendation reason line
// ---------------------------------------------------------------------------

describe("DealCard — recommendation reason line", () => {
  it("renders the reason line when recommendation is present", () => {
    const deal = makeDeal({ recommendation: { score: 0.95, reason: "Because you booked spa days before" } });
    render(<DealCard deal={deal} analytics={makeAnalytics()} position={2} />);
    expect(screen.getByTestId("deal-card-reason")).toHaveTextContent(
      "Because you booked spa days before",
    );
  });

  it("does NOT render the reason line when recommendation is absent", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.queryByTestId("deal-card-reason")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Analytics — deal_card_tapped event
// ---------------------------------------------------------------------------

describe("DealCard — analytics", () => {
  let analytics: AnalyticsClient;

  beforeEach(() => {
    analytics = makeAnalytics();
  });

  it("fires deal_card_tapped on click with correct base payload", () => {
    const deal = makeDeal();
    render(<DealCard deal={deal} analytics={analytics} position={3} />);
    fireEvent.click(screen.getByTestId("deal-card"));
    expect(analytics.track).toHaveBeenCalledOnce();
    expect(analytics.track).toHaveBeenCalledWith({
      event: "deal_card_tapped",
      dealId: "deal-001",
      position: 3,
      category: "spa_wellness",
    });
  });

  it("includes score and reason in the event when recommendation is present", () => {
    const deal = makeDeal({ recommendation: { score: 0.87, reason: "Top-rated near you" } });
    render(<DealCard deal={deal} analytics={analytics} position={1} />);
    fireEvent.click(screen.getByTestId("deal-card"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "deal_card_tapped",
      dealId: "deal-001",
      position: 1,
      category: "spa_wellness",
      score: 0.87,
      reason: "Top-rated near you",
    });
  });

  it("does NOT include score or reason when recommendation is absent", () => {
    const deal = makeDeal();
    render(<DealCard deal={deal} analytics={analytics} position={0} />);
    fireEvent.click(screen.getByTestId("deal-card"));
    const payload = (analytics.track as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(payload).not.toHaveProperty("score");
    expect(payload).not.toHaveProperty("reason");
  });

  it("fires event with the correct position for each card in a list", () => {
    const deals = [makeDeal({ dealId: "d1" }), makeDeal({ dealId: "d2" }), makeDeal({ dealId: "d3" })];
    const { rerender } = render(<DealCard deal={deals[0]!} analytics={analytics} position={0} />);
    fireEvent.click(screen.getByTestId("deal-card"));
    expect((analytics.track as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toMatchObject({ position: 0 });

    rerender(<DealCard deal={deals[2]!} analytics={analytics} position={2} />);
    fireEvent.click(screen.getByTestId("deal-card"));
    expect((analytics.track as ReturnType<typeof vi.fn>).mock.calls[1]?.[0]).toMatchObject({ position: 2 });
  });

  it("fires exactly one analytics event per tap", () => {
    render(<DealCard deal={makeDeal()} analytics={analytics} position={0} />);
    fireEvent.click(screen.getByTestId("deal-card"));
    expect(analytics.track).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// onTap callback
// ---------------------------------------------------------------------------

describe("DealCard — onTap callback", () => {
  it("calls onTap with the deal when clicked", () => {
    const deal = makeDeal();
    const onTap = vi.fn();
    render(<DealCard deal={deal} analytics={makeAnalytics()} position={0} onTap={onTap} />);
    fireEvent.click(screen.getByTestId("deal-card"));
    expect(onTap).toHaveBeenCalledOnce();
    expect(onTap).toHaveBeenCalledWith(deal);
  });

  it("does not throw when onTap is not provided", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(() => fireEvent.click(screen.getByTestId("deal-card"))).not.toThrow();
  });

  it("fires analytics before calling onTap", () => {
    const callOrder: string[] = [];
    const analytics: AnalyticsClient = {
      track: vi.fn(() => { callOrder.push("analytics"); }),
    };
    const onTap = vi.fn(() => { callOrder.push("onTap"); });
    render(<DealCard deal={makeDeal()} analytics={analytics} position={0} onTap={onTap} />);
    fireEvent.click(screen.getByTestId("deal-card"));
    expect(callOrder).toEqual(["analytics", "onTap"]);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe("DealCard — accessibility", () => {
  it("has role=button", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has aria-label set to the deal title", () => {
    render(<DealCard deal={makeDeal()} analytics={makeAnalytics()} position={0} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "90-Minute Spa Package");
  });

  it("fires analytics on Enter key press", () => {
    const analytics = makeAnalytics();
    render(<DealCard deal={makeDeal()} analytics={analytics} position={0} />);
    fireEvent.keyDown(screen.getByTestId("deal-card"), { key: "Enter" });
    expect(analytics.track).toHaveBeenCalledOnce();
  });

  it("fires analytics on Space key press", () => {
    const analytics = makeAnalytics();
    render(<DealCard deal={makeDeal()} analytics={analytics} position={0} />);
    fireEvent.keyDown(screen.getByTestId("deal-card"), { key: " " });
    expect(analytics.track).toHaveBeenCalledOnce();
  });
});
