import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { DealDetailScreen } from "../DealDetailScreen";
import type { Deal } from "../../types/deal";
import type { AnalyticsClient } from "../../analytics/client";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    dealId: "deal-001",
    title: "90-Minute Deep Tissue Massage",
    description: "Full-body deep tissue massage.",
    merchant: {
      merchantId: "m-001",
      name: "Serenity Day Spa",
      rating: 4.8,
      reviewCount: 412,
      isFlagged: false,
    },
    category: "spa_wellness",
    heroImages: ["https://example.com/hero1.jpg", "https://example.com/hero2.jpg"],
    pricing: {
      dealPriceCents: 4999,
      originalPriceCents: 12000,
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
    finePrint: ["Valid Mon–Fri only", "Appointment required"],
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

describe("DealDetailScreen — rendering", () => {
  it("renders the screen container", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("deal-detail-screen")).toBeInTheDocument();
  });

  it("renders the deal title", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("deal-title")).toHaveTextContent("90-Minute Deep Tissue Massage");
  });

  it("renders the merchant name", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("merchant-name")).toHaveTextContent("Serenity Day Spa");
  });

  it("renders the merchant rating", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("merchant-rating")).toHaveTextContent("4.8");
  });

  it("renders the merchant review count", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("merchant-review-count")).toHaveTextContent("412");
  });
});

// ---------------------------------------------------------------------------
// Hero image carousel
// ---------------------------------------------------------------------------

describe("DealDetailScreen — hero carousel", () => {
  it("renders the hero image carousel", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("hero-image-carousel")).toBeInTheDocument();
  });

  it("shows the first hero image on mount", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    const img = screen.getByTestId("hero-carousel-image") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/hero1.jpg");
  });

  it("advances to next hero image when Next is clicked", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    const img = screen.getByTestId("hero-carousel-image") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/hero2.jpg");
  });
});

// ---------------------------------------------------------------------------
// Pricing breakdown — always visible before buy button
// ---------------------------------------------------------------------------

describe("DealDetailScreen — pricing breakdown", () => {
  it("renders the pricing breakdown panel", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("pricing-breakdown-panel")).toBeInTheDocument();
  });

  it("shows all six pricing fields", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("pricing-deal-price")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-original-price")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-service-fee")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-tax")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-shipping")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-total")).toBeInTheDocument();
  });

  it("shows the correct total price in the breakdown", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("pricing-total")).toHaveTextContent("$55.98");
  });

  it("pricing panel appears in DOM before the buy button", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    const panel = screen.getByTestId("pricing-breakdown-panel");
    const buyBtn = screen.getByTestId("buy-now-button");
    expect(
      panel.compareDocumentPosition(buyBtn) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Availability calendar
// ---------------------------------------------------------------------------

describe("DealDetailScreen — availability calendar", () => {
  it("renders the availability calendar when deal.isBookable is true", () => {
    render(<DealDetailScreen deal={makeDeal({ isBookable: true })} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("availability-calendar")).toBeInTheDocument();
  });

  it("does NOT render the calendar when deal.isBookable is false", () => {
    render(<DealDetailScreen deal={makeDeal({ isBookable: false })} analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("availability-calendar")).toBeNull();
  });

  it("passes availableDates to the calendar", () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-15`;
    render(
      <DealDetailScreen
        deal={makeDeal({ isBookable: true })}
        analytics={makeAnalytics()}
        availableDates={[iso]}
      />,
    );
    const btn = screen.getByTestId(`calendar-day-${iso}`) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Refund policy badge — above buy button
// ---------------------------------------------------------------------------

describe("DealDetailScreen — refund policy badge", () => {
  it("renders the RefundPolicyBadge", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("refund-policy-badge")).toBeInTheDocument();
  });

  it("displays the refund policy plain text", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("refund-policy-badge")).toHaveTextContent(
      "Free cancellation up to 24h before your appointment",
    );
  });

  it("refund policy badge appears in DOM before the buy button", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    const badge = screen.getByTestId("refund-policy-badge");
    const buyBtn = screen.getByTestId("buy-now-button");
    expect(
      badge.compareDocumentPosition(buyBtn) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Sticky buy bar
// ---------------------------------------------------------------------------

describe("DealDetailScreen — sticky buy bar", () => {
  it("renders the sticky buy bar", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("sticky-buy-bar")).toBeInTheDocument();
  });

  it("shows the total price in the sticky bar", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("sticky-bar-price")).toHaveTextContent("$55.98");
  });

  it("renders the Buy Now button", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("buy-now-button")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Analytics events
// ---------------------------------------------------------------------------

describe("DealDetailScreen — analytics", () => {
  let analytics: AnalyticsClient;

  beforeEach(() => {
    analytics = makeAnalytics();
  });

  it("fires deal_detail_viewed on mount", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={analytics} />);
    expect(analytics.track).toHaveBeenCalledWith({
      event: "deal_detail_viewed",
      dealId: "deal-001",
      category: "spa_wellness",
    });
  });

  it("fires deal_detail_viewed exactly once on mount", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={analytics} />);
    const calls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([e]: [{ event: string }]) => e.event === "deal_detail_viewed",
    );
    expect(calls).toHaveLength(1);
  });

  it("fires buy_now_tapped with correct payload when Buy Now is clicked", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={analytics} />);
    fireEvent.click(screen.getByTestId("buy-now-button"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "buy_now_tapped",
      dealId: "deal-001",
      totalCents: 5598,
    });
  });

  it("includes selectedDateIso in buy_now_tapped when a date was selected", () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-20`;
    render(
      <DealDetailScreen
        deal={makeDeal({ isBookable: true })}
        analytics={analytics}
        availableDates={[iso]}
      />,
    );
    fireEvent.click(screen.getByTestId(`calendar-day-${iso}`));
    fireEvent.click(screen.getByTestId("buy-now-button"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "buy_now_tapped",
      dealId: "deal-001",
      totalCents: 5598,
      selectedDateIso: iso,
    });
  });

  it("fires date_selected via the AvailabilityCalendar when a date is clicked", () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-10`;
    render(
      <DealDetailScreen
        deal={makeDeal({ isBookable: true })}
        analytics={analytics}
        availableDates={[iso]}
      />,
    );
    fireEvent.click(screen.getByTestId(`calendar-day-${iso}`));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "date_selected",
      dealId: "deal-001",
      dateIso: iso,
    });
  });

  it("fires hero_image_swiped when the carousel is navigated", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "hero_image_swiped",
      dealId: "deal-001",
      imageIndex: 1,
    });
  });
});

// ---------------------------------------------------------------------------
// onBuyNow callback
// ---------------------------------------------------------------------------

describe("DealDetailScreen — onBuyNow callback", () => {
  it("calls onBuyNow with null when no date is selected", () => {
    const onBuyNow = vi.fn();
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} onBuyNow={onBuyNow} />);
    fireEvent.click(screen.getByTestId("buy-now-button"));
    expect(onBuyNow).toHaveBeenCalledOnce();
    expect(onBuyNow).toHaveBeenCalledWith(null);
  });

  it("calls onBuyNow with the selected date ISO string", () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-25`;
    const onBuyNow = vi.fn();
    render(
      <DealDetailScreen
        deal={makeDeal({ isBookable: true })}
        analytics={makeAnalytics()}
        availableDates={[iso]}
        onBuyNow={onBuyNow}
      />,
    );
    fireEvent.click(screen.getByTestId(`calendar-day-${iso}`));
    fireEvent.click(screen.getByTestId("buy-now-button"));
    expect(onBuyNow).toHaveBeenCalledWith(iso);
  });

  it("does not throw when onBuyNow is not provided", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(() => fireEvent.click(screen.getByTestId("buy-now-button"))).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Fine print
// ---------------------------------------------------------------------------

describe("DealDetailScreen — fine print", () => {
  it("renders fine print items", () => {
    render(<DealDetailScreen deal={makeDeal()} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("fine-print-list")).toBeInTheDocument();
    expect(screen.getByTestId("fine-print-list")).toHaveTextContent("Valid Mon–Fri only");
    expect(screen.getByTestId("fine-print-list")).toHaveTextContent("Appointment required");
  });

  it("does not render fine print section when finePrint is empty", () => {
    render(<DealDetailScreen deal={makeDeal({ finePrint: [] })} analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("fine-print-list")).toBeNull();
  });
});
