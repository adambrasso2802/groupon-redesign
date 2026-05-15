import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PersonalizedFeedList } from "../PersonalizedFeedList";
import type { Deal } from "../../types/deal";
import type { AnalyticsClient } from "../../analytics/client";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    dealId: "deal-001",
    title: "Spa Package",
    description: "Relaxing spa day.",
    merchant: { merchantId: "m-01", name: "Serenity Spa", rating: 4.7, reviewCount: 200, isFlagged: false },
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
    refundPolicy: { isRefundable: true, windowAmount: 24, windowUnit: "hours", plainTextSummary: "Free cancellation up to 24h" },
    supportsInstantConfirmation: true,
    isBookable: true,
    hasRecurringCharge: false,
    finePrint: [],
    voucherExpiryDate: "2026-12-31",
    isActive: true,
    recommendation: { score: 0.9, reason: "Because you booked spa days before" },
    ...overrides,
  };
}

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("PersonalizedFeedList — rendering", () => {
  it("renders a DealCard for each deal", () => {
    const deals = [makeDeal({ dealId: "d1" }), makeDeal({ dealId: "d2" }), makeDeal({ dealId: "d3" })];
    render(<PersonalizedFeedList deals={deals} analytics={makeAnalytics()} />);
    expect(screen.getAllByTestId("deal-card")).toHaveLength(3);
  });

  it("renders the empty state when deals array is empty", () => {
    render(<PersonalizedFeedList deals={[]} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("feed-empty-state")).toBeInTheDocument();
    expect(screen.queryByTestId("deal-card")).toBeNull();
  });

  it("renders each deal wrapped in a feed-slot", () => {
    const deals = [makeDeal({ dealId: "d1" }), makeDeal({ dealId: "d2" })];
    render(<PersonalizedFeedList deals={deals} analytics={makeAnalytics()} />);
    expect(screen.getAllByTestId("feed-slot")).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Impression analytics
// ---------------------------------------------------------------------------

describe("PersonalizedFeedList — impression events", () => {
  it("fires deal_card_impression for each deal on mount", () => {
    const deals = [makeDeal({ dealId: "d1" }), makeDeal({ dealId: "d2" })];
    const analytics = makeAnalytics();
    render(<PersonalizedFeedList deals={deals} analytics={analytics} />);
    const impressions = (analytics.track as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0])
      .filter((e) => e.event === "deal_card_impression");
    expect(impressions).toHaveLength(2);
  });

  it("includes position in each impression event", () => {
    const deals = [makeDeal({ dealId: "d1" }), makeDeal({ dealId: "d2" })];
    const analytics = makeAnalytics();
    render(<PersonalizedFeedList deals={deals} analytics={analytics} />);
    const impressions = (analytics.track as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0])
      .filter((e) => e.event === "deal_card_impression");
    expect(impressions[0]?.position).toBe(0);
    expect(impressions[1]?.position).toBe(1);
  });

  it("includes score and reason when deal has a recommendation", () => {
    const deal = makeDeal({ dealId: "d1", recommendation: { score: 0.88, reason: "Top-rated near you" } });
    const analytics = makeAnalytics();
    render(<PersonalizedFeedList deals={[deal]} analytics={analytics} />);
    const impression = (analytics.track as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0])
      .find((e) => e.event === "deal_card_impression");
    expect(impression?.score).toBe(0.88);
    expect(impression?.reason).toBe("Top-rated near you");
  });

  it("does not include score or reason when deal has no recommendation", () => {
    const { recommendation: _r, ...rest } = makeDeal({ dealId: "d1" });
    const deal: Deal = { ...rest };
    const analytics = makeAnalytics();
    render(<PersonalizedFeedList deals={[deal]} analytics={analytics} />);
    const impression = (analytics.track as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0])
      .find((e) => e.event === "deal_card_impression");
    expect(impression).not.toHaveProperty("score");
    expect(impression).not.toHaveProperty("reason");
  });

  it("does not fire duplicate impressions when the same deal appears and re-renders", () => {
    const deal = makeDeal({ dealId: "d1" });
    const analytics = makeAnalytics();
    const { rerender } = render(<PersonalizedFeedList deals={[deal]} analytics={analytics} />);
    rerender(<PersonalizedFeedList deals={[deal]} analytics={analytics} />);
    const impressions = (analytics.track as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0])
      .filter((e) => e.event === "deal_card_impression" && e.dealId === "d1");
    expect(impressions).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// onDealTap callback
// ---------------------------------------------------------------------------

describe("PersonalizedFeedList — onDealTap callback", () => {
  it("calls onDealTap when a card is tapped", () => {
    const deal = makeDeal({ dealId: "d1" });
    const onDealTap = vi.fn();
    render(<PersonalizedFeedList deals={[deal]} analytics={makeAnalytics()} onDealTap={onDealTap} />);
    fireEvent.click(screen.getByTestId("deal-card"));
    expect(onDealTap).toHaveBeenCalledOnce();
    expect(onDealTap).toHaveBeenCalledWith(deal);
  });

  it("does not throw when onDealTap is not provided", () => {
    const deal = makeDeal({ dealId: "d1" });
    render(<PersonalizedFeedList deals={[deal]} analytics={makeAnalytics()} />);
    expect(() => fireEvent.click(screen.getByTestId("deal-card"))).not.toThrow();
  });
});
