import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MyGrouponsScreen } from "../MyGrouponsScreen";
import type { AnalyticsClient } from "../../analytics/client";
import type { CheckoutSummary } from "../../types/deal";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

function makeOrder(n: number): CheckoutSummary & { orderId: string } {
  return {
    orderId: `ORDER-00${n}`,
    dealId: `deal-00${n}`,
    deal: {
      title: `Deal ${n}`,
      merchant: {
        merchantId: `m-00${n}`,
        name: `Merchant ${n}`,
        rating: 4.5,
        reviewCount: 100,
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
}

const oneOrder = [makeOrder(1)];
const threeOrders = [makeOrder(1), makeOrder(2), makeOrder(3)];

function renderScreen(overrides: Partial<React.ComponentProps<typeof MyGrouponsScreen>> = {}) {
  const props = {
    orders: oneOrder,
    analytics: makeAnalytics(),
    onActionSelected: vi.fn(),
    ...overrides,
  };
  render(<MyGrouponsScreen {...props} />);
  return props;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("MyGrouponsScreen — rendering", () => {
  it("renders the screen container", () => {
    renderScreen();
    expect(screen.getByTestId("my-groupons-screen")).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderScreen();
    expect(screen.getByRole("heading", { name: /my groupons/i })).toBeInTheDocument();
  });

  it("renders the orders list when orders are provided", () => {
    renderScreen();
    expect(screen.getByTestId("my-groupons-list")).toBeInTheDocument();
  });

  it("renders one order row per order", () => {
    renderScreen({ orders: threeOrders });
    expect(screen.getAllByTestId("order-row")).toHaveLength(3);
  });

  it("shows the empty state when there are no orders", () => {
    renderScreen({ orders: [] });
    expect(screen.getByTestId("my-groupons-empty")).toBeInTheDocument();
  });

  it("does not render list when there are no orders", () => {
    renderScreen({ orders: [] });
    expect(screen.queryByTestId("my-groupons-list")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Order rows
// ---------------------------------------------------------------------------

describe("MyGrouponsScreen — order rows", () => {
  it("shows deal title for each order", () => {
    renderScreen({ orders: threeOrders });
    expect(screen.getByText("Deal 1")).toBeInTheDocument();
    expect(screen.getByText("Deal 2")).toBeInTheDocument();
    expect(screen.getByText("Deal 3")).toBeInTheDocument();
  });

  it("shows merchant name for each order", () => {
    renderScreen({ orders: threeOrders });
    expect(screen.getByText("Merchant 1")).toBeInTheDocument();
    expect(screen.getByText("Merchant 2")).toBeInTheDocument();
    expect(screen.getByText("Merchant 3")).toBeInTheDocument();
  });

  it("shows booking slot when selectedSlotIso is present", () => {
    const orderWithSlot = { ...makeOrder(1), selectedSlotIso: "2026-06-20T10:00:00Z" };
    renderScreen({ orders: [orderWithSlot] });
    expect(screen.getByTestId("order-row-slot")).toHaveTextContent("2026-06-20T10:00:00Z");
  });

  it("does not render slot when selectedSlotIso is absent", () => {
    renderScreen({ orders: oneOrder });
    expect(screen.queryByTestId("order-row-slot")).toBeNull();
  });

  it("each order row has its orderId as data attribute", () => {
    renderScreen({ orders: threeOrders });
    const rows = screen.getAllByTestId("order-row");
    expect(rows[0]).toHaveAttribute("data-order-id", "ORDER-001");
    expect(rows[1]).toHaveAttribute("data-order-id", "ORDER-002");
    expect(rows[2]).toHaveAttribute("data-order-id", "ORDER-003");
  });

  it("each order row contains a PostPurchaseHelpEntry on the my_groupons surface", () => {
    renderScreen({ orders: threeOrders });
    const entries = screen.getAllByTestId("post-purchase-help-entry");
    expect(entries).toHaveLength(3);
    entries.forEach((entry) => {
      expect(entry).toHaveAttribute("data-surface", "my_groupons");
    });
  });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("MyGrouponsScreen — analytics", () => {
  it("fires my_groupons_viewed on mount", () => {
    const analytics = makeAnalytics();
    renderScreen({ analytics });
    expect(analytics.track).toHaveBeenCalledWith({ event: "my_groupons_viewed" });
  });

  it("fires my_groupons_viewed exactly once", () => {
    const analytics = makeAnalytics();
    renderScreen({ analytics });
    const calls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => (args[0] as { event: string }).event === "my_groupons_viewed",
    );
    expect(calls).toHaveLength(1);
  });

  it("fires post_purchase_help_opened with orderId and my_groupons surface when CTA is tapped", () => {
    const analytics = makeAnalytics();
    renderScreen({ analytics, orders: oneOrder });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "post_purchase_help_opened",
      orderId: "ORDER-001",
      surface: "my_groupons",
    });
  });

  it("fires support_action_selected when action is chosen", () => {
    const analytics = makeAnalytics();
    renderScreen({ analytics, orders: oneOrder });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    fireEvent.click(screen.getByTestId("action-contact-support"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "support_action_selected",
      orderId: "ORDER-001",
      action: "contact_support",
    });
  });
});

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

describe("MyGrouponsScreen — callbacks", () => {
  it("calls onActionSelected with orderId and action when action is chosen", () => {
    const onActionSelected = vi.fn();
    renderScreen({ onActionSelected, orders: oneOrder });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(onActionSelected).toHaveBeenCalledWith("ORDER-001", "get_a_refund");
  });

  it("does not throw when onActionSelected is not provided", () => {
    renderScreen({ onActionSelected: undefined });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    expect(() => fireEvent.click(screen.getByTestId("action-report-problem"))).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Settings — notification preferences link
// ---------------------------------------------------------------------------

describe("MyGrouponsScreen — settings link", () => {
  it("does not render the settings section when onOpenNotificationPreferences is omitted", () => {
    renderScreen();
    expect(screen.queryByTestId("my-groupons-settings")).toBeNull();
  });

  it("renders the settings section when onOpenNotificationPreferences is provided", () => {
    renderScreen({ onOpenNotificationPreferences: vi.fn() });
    expect(screen.getByTestId("my-groupons-settings")).toBeInTheDocument();
    expect(screen.getByTestId("open-notification-preferences")).toBeInTheDocument();
  });

  it("calls onOpenNotificationPreferences when the link is tapped", () => {
    const onOpenNotificationPreferences = vi.fn();
    renderScreen({ onOpenNotificationPreferences });
    fireEvent.click(screen.getByTestId("open-notification-preferences"));
    expect(onOpenNotificationPreferences).toHaveBeenCalledTimes(1);
  });

  it("renders the settings link even when the orders list is empty", () => {
    renderScreen({ orders: [], onOpenNotificationPreferences: vi.fn() });
    expect(screen.getByTestId("open-notification-preferences")).toBeInTheDocument();
  });
});
