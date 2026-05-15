import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BookingConfirmationScreen } from "../OrderConfirmationScreen";
import type { AnalyticsClient } from "../../analytics/client";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

const baseDeal = {
  title: "90-Minute Deep Tissue Massage",
  merchant: {
    merchantId: "m-001",
    name: "Serenity Day Spa",
    rating: 4.8,
    reviewCount: 412,
    isFlagged: false,
  },
};

function renderScreen(overrides: Partial<React.ComponentProps<typeof BookingConfirmationScreen>> = {}) {
  const props = {
    orderId: "ORDER-1234567890-00001",
    dealId: "deal-001",
    deal: baseDeal,
    selectedDate: null,
    analytics: makeAnalytics(),
    onNeedHelp: vi.fn(),
    ...overrides,
  };
  render(<BookingConfirmationScreen {...props} />);
  return props;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("OrderConfirmationScreen — rendering", () => {
  it("renders the confirmation screen", () => {
    renderScreen();
    expect(screen.getByTestId("order-confirmation-screen")).toBeInTheDocument();
  });

  it("shows the order ID", () => {
    renderScreen({ orderId: "ORDER-1234567890-00001" });
    expect(screen.getByTestId("confirmation-order-id")).toHaveTextContent("ORDER-1234567890-00001");
  });

  it("shows the deal title", () => {
    renderScreen();
    expect(screen.getByTestId("confirmation-deal-title")).toHaveTextContent(
      "90-Minute Deep Tissue Massage",
    );
  });

  it("shows the merchant name", () => {
    renderScreen();
    expect(screen.getByTestId("confirmation-merchant")).toHaveTextContent("Serenity Day Spa");
  });

  it("shows the booking date when selectedDate is provided", () => {
    renderScreen({ selectedDate: "2026-07-15" });
    expect(screen.getByTestId("confirmation-date")).toHaveTextContent("2026-07-15");
  });

  it("does not render date section when selectedDate is null", () => {
    renderScreen({ selectedDate: null });
    expect(screen.queryByTestId("confirmation-date")).toBeNull();
  });

  it("renders the order details card", () => {
    renderScreen();
    expect(screen.getByTestId("confirmation-order-details")).toBeInTheDocument();
  });

  it("renders the Need help button", () => {
    renderScreen();
    expect(screen.getByTestId("need-help-button")).toBeInTheDocument();
  });

  it("Need help button has accessible text", () => {
    renderScreen();
    expect(screen.getByTestId("need-help-button")).toHaveTextContent(/need help/i);
  });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("OrderConfirmationScreen — analytics", () => {
  it("fires booking_confirmation_viewed on mount", () => {
    const analytics = makeAnalytics();
    renderScreen({ analytics, dealId: "deal-001", orderId: "ORDER-123" });
    expect(analytics.track).toHaveBeenCalledWith({
      event: "booking_confirmation_viewed",
      dealId: "deal-001",
      orderId: "ORDER-123",
    });
  });

  it("fires booking_confirmation_viewed exactly once", () => {
    const analytics = makeAnalytics();
    renderScreen({ analytics });
    const calls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => (args[0] as { event: string }).event === "booking_confirmation_viewed",
    );
    expect(calls).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

describe("OrderConfirmationScreen — callbacks", () => {
  it("calls onNeedHelp when the help button is clicked", () => {
    const onNeedHelp = vi.fn();
    renderScreen({ onNeedHelp });
    fireEvent.click(screen.getByTestId("need-help-button"));
    expect(onNeedHelp).toHaveBeenCalledOnce();
  });

  it("does not throw when onNeedHelp is not provided", () => {
    render(
      <BookingConfirmationScreen
        orderId="ORDER-123"
        dealId="deal-001"
        deal={baseDeal}
        selectedDate={null}
        analytics={makeAnalytics()}
      />,
    );
    expect(() => fireEvent.click(screen.getByTestId("need-help-button"))).not.toThrow();
  });
});
