import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CheckoutScreen } from "../CheckoutScreen";
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
    heroImages: ["https://example.com/hero1.jpg"],
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
    isBookable: false,
    hasRecurringCharge: false,
    finePrint: [],
    voucherExpiryDate: "2026-12-31",
    isActive: true,
    ...overrides,
  };
}

function makeDealWithBNPL(overrides: Partial<Deal> = {}): Deal {
  return makeDeal({
    bnplOptions: [
      { provider: "klarna", installments: 4, installmentAmountCents: 1400 },
    ],
    ...overrides,
  });
}

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

// ---------------------------------------------------------------------------
// Rendering — structure
// ---------------------------------------------------------------------------

describe("CheckoutScreen — rendering", () => {
  it("renders the checkout screen container", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("checkout-screen")).toBeInTheDocument();
  });

  it("renders the PricingBreakdownPanel", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("pricing-breakdown-panel")).toBeInTheDocument();
  });

  it("pricing breakdown appears before the confirm button in the DOM", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    const panel = screen.getByTestId("pricing-breakdown-panel");
    const btn = screen.getByTestId("confirm-pay-button");
    expect(
      panel.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows all six pricing line items", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("pricing-deal-price")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-original-price")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-service-fee")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-tax")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-shipping")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-total")).toBeInTheDocument();
  });

  it("renders the payment method selector", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("payment-method-selector")).toBeInTheDocument();
  });

  it("renders the order summary", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("order-summary")).toBeInTheDocument();
  });

  it("renders the confirm-pay button", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("confirm-pay-button")).toBeInTheDocument();
  });

  it("renders the refund terms reminder", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("refund-terms-reminder")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Payment method selector
// ---------------------------------------------------------------------------

describe("CheckoutScreen — payment method selector", () => {
  it("renders the credit card option", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("payment-option-new-card")).toBeInTheDocument();
  });

  it("credit card is selected by default", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    const radio = screen.getByTestId("payment-option-new-card").querySelector("input[type=radio]")!;
    expect((radio as HTMLInputElement).checked).toBe(true);
  });

  it("renders BNPL option when deal has a klarna bnplOption", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("payment-option-klarna")).toBeInTheDocument();
  });

  it("does not render BNPL option when deal has no bnplOptions", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("payment-option-klarna")).toBeNull();
  });

  it("shows installment summary text on the BNPL option label", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("bnpl-installment-summary")).toHaveTextContent("4×");
    expect(screen.getByTestId("bnpl-installment-summary")).toHaveTextContent("£14.00");
  });

  it("selecting BNPL shows the instalment breakdown panel", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("bnpl-installment-breakdown")).toBeNull();
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    expect(screen.getByTestId("bnpl-installment-breakdown")).toBeInTheDocument();
  });

  it("shows installment amount in the breakdown panel", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    expect(screen.getByTestId("bnpl-installment-amount")).toHaveTextContent("£14.00");
  });

  it("BNPL breakdown panel disappears when switching back to card", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("payment-option-new-card").querySelector("input")!);
    expect(screen.queryByTestId("bnpl-installment-breakdown")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Recurring charge checkbox
// ---------------------------------------------------------------------------

describe("CheckoutScreen — recurring charge", () => {
  it("renders recurring charge section when hasRecurringCharge is true", () => {
    render(
      <CheckoutScreen
        deal={makeDeal({ hasRecurringCharge: true, recurringChargeSummary: "Monthly: £9.99/month" })}
        selectedDate={null}
        analytics={makeAnalytics()}
      />,
    );
    expect(screen.getByTestId("recurring-charge-section")).toBeInTheDocument();
  });

  it("does not render recurring charge section when hasRecurringCharge is false", () => {
    render(<CheckoutScreen deal={makeDeal({ hasRecurringCharge: false })} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("recurring-charge-section")).toBeNull();
  });

  it("confirm button is disabled when recurring charge is unacknowledged", () => {
    render(
      <CheckoutScreen
        deal={makeDeal({ hasRecurringCharge: true })}
        selectedDate={null}
        analytics={makeAnalytics()}
      />,
    );
    expect(screen.getByTestId("confirm-pay-button")).toBeDisabled();
  });

  it("confirm button is enabled after acknowledging the recurring charge", () => {
    render(
      <CheckoutScreen
        deal={makeDeal({ hasRecurringCharge: true })}
        selectedDate={null}
        analytics={makeAnalytics()}
      />,
    );
    fireEvent.click(screen.getByTestId("recurring-charge-checkbox"));
    expect(screen.getByTestId("confirm-pay-button")).not.toBeDisabled();
  });

  it("shows the recurringChargeSummary text when provided", () => {
    render(
      <CheckoutScreen
        deal={makeDeal({ hasRecurringCharge: true, recurringChargeSummary: "Monthly: £9.99/month" })}
        selectedDate={null}
        analytics={makeAnalytics()}
      />,
    );
    expect(screen.getByTestId("recurring-charge-section")).toHaveTextContent("Monthly: £9.99/month");
  });
});

// ---------------------------------------------------------------------------
// Order summary
// ---------------------------------------------------------------------------

describe("CheckoutScreen — order summary", () => {
  it("shows the deal title in the order summary", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("order-summary-deal-title")).toHaveTextContent(
      "90-Minute Deep Tissue Massage",
    );
  });

  it("shows the merchant name in the order summary", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("order-summary-merchant")).toHaveTextContent("Serenity Day Spa");
  });

  it("shows the selected date when provided", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate="2026-07-15" analytics={makeAnalytics()} />);
    expect(screen.getByTestId("order-summary-date")).toHaveTextContent("2026-07-15");
  });

  it("does not render date row when selectedDate is null", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("order-summary-date")).toBeNull();
  });

  it("shows the total in the order summary", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("order-summary-total")).toHaveTextContent("£55.98");
  });
});

// ---------------------------------------------------------------------------
// Confirm & Pay button label
// ---------------------------------------------------------------------------

describe("CheckoutScreen — confirm button", () => {
  it("confirm button contains the exact total pre-populated", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("confirm-pay-button")).toHaveTextContent("Confirm & Pay £55.98");
  });

  it("confirm button is enabled by default when no recurring charge", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.getByTestId("confirm-pay-button")).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// 3DS flow — credit card
// ---------------------------------------------------------------------------

describe("CheckoutScreen — 3DS challenge (credit card)", () => {
  it("does not show the 3DS modal on initial render", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("three-ds-overlay")).toBeNull();
  });

  it("shows the 3DS modal after clicking confirm with credit card selected", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    expect(screen.getByTestId("three-ds-overlay")).toBeInTheDocument();
  });

  it("dismisses the 3DS modal when Cancel is clicked", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    fireEvent.click(screen.getByTestId("three-ds-cancel-btn"));
    expect(screen.queryByTestId("three-ds-overlay")).toBeNull();
  });

  it("remains on checkout screen after 3DS cancel", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    fireEvent.click(screen.getByTestId("three-ds-cancel-btn"));
    expect(screen.getByTestId("checkout-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("order-confirmation-screen")).toBeNull();
  });

  it("transitions to confirmation screen after 3DS authenticate succeeds", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    fireEvent.click(screen.getByTestId("three-ds-authenticate-btn"));
    expect(screen.getByTestId("order-confirmation-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("checkout-screen")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// BNPL flow — no 3DS
// ---------------------------------------------------------------------------

describe("CheckoutScreen — BNPL payment flow", () => {
  it("transitions directly to confirmation screen without 3DS when Klarna is selected", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    expect(screen.queryByTestId("three-ds-overlay")).toBeNull();
    expect(screen.getByTestId("order-confirmation-screen")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Confirmation screen content after purchase
// ---------------------------------------------------------------------------

describe("CheckoutScreen — post-purchase confirmation", () => {
  it("shows the deal title on the confirmation screen", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    expect(screen.getByTestId("confirmation-deal-title")).toHaveTextContent(
      "90-Minute Deep Tissue Massage",
    );
  });

  it("shows the merchant name on the confirmation screen", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    expect(screen.getByTestId("confirmation-merchant")).toHaveTextContent("Serenity Day Spa");
  });

  it("shows the selected date on the confirmation screen when provided", () => {
    render(
      <CheckoutScreen
        deal={makeDealWithBNPL()}
        selectedDate="2026-08-20"
        analytics={makeAnalytics()}
      />,
    );
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    expect(screen.getByTestId("confirmation-date")).toHaveTextContent("2026-08-20");
  });

  it("shows an order ID on the confirmation screen", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    expect(screen.getByTestId("confirmation-order-id").textContent).toMatch(/^ORDER-/);
  });

  it("shows the Need help button on the confirmation screen", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    expect(screen.getByTestId("need-help-button")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Analytics events
// ---------------------------------------------------------------------------

describe("CheckoutScreen — analytics", () => {
  let analytics: AnalyticsClient;

  beforeEach(() => {
    analytics = makeAnalytics();
  });

  it("fires checkout_opened on mount", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={analytics} />);
    expect(analytics.track).toHaveBeenCalledWith({
      event: "checkout_opened",
      dealId: "deal-001",
    });
  });

  it("fires checkout_opened exactly once", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={analytics} />);
    const calls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => (args[0] as { event: string }).event === "checkout_opened",
    );
    expect(calls).toHaveLength(1);
  });

  it("fires payment_method_selected when switching to Klarna", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={analytics} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    expect(analytics.track).toHaveBeenCalledWith({
      event: "payment_method_selected",
      method: "klarna",
    });
  });

  it("fires payment_method_selected when switching back to card", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={analytics} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("payment-option-new-card").querySelector("input")!);
    expect(analytics.track).toHaveBeenCalledWith({
      event: "payment_method_selected",
      method: "new_card",
    });
  });

  it("fires purchase_confirmed after 3DS authenticate succeeds", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={analytics} />);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    fireEvent.click(screen.getByTestId("three-ds-authenticate-btn"));
    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "purchase_confirmed",
        dealId: "deal-001",
        totalCents: 5598,
        paymentMethod: "new_card",
      }),
    );
  });

  it("purchase_confirmed orderId starts with ORDER-", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={analytics} />);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    fireEvent.click(screen.getByTestId("three-ds-authenticate-btn"));
    const call = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.find(
      (args: unknown[]) => (args[0] as { event: string }).event === "purchase_confirmed",
    );
    expect((call![0] as { orderId: string }).orderId).toMatch(/^ORDER-/);
  });

  it("fires purchase_confirmed with klarna paymentMethod for BNPL flow", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={analytics} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "purchase_confirmed",
        paymentMethod: "klarna",
      }),
    );
  });

  it("does not fire purchase_confirmed after 3DS cancel", () => {
    render(<CheckoutScreen deal={makeDeal()} selectedDate={null} analytics={analytics} />);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    fireEvent.click(screen.getByTestId("three-ds-cancel-btn"));
    const call = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.find(
      (args: unknown[]) => (args[0] as { event: string }).event === "purchase_confirmed",
    );
    expect(call).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// onComplete callback
// ---------------------------------------------------------------------------

describe("CheckoutScreen — onComplete callback", () => {
  it("calls onComplete with orderId after 3DS success", () => {
    const onComplete = vi.fn();
    render(
      <CheckoutScreen
        deal={makeDeal()}
        selectedDate={null}
        analytics={makeAnalytics()}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    fireEvent.click(screen.getByTestId("three-ds-authenticate-btn"));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0]).toMatch(/^ORDER-/);
  });

  it("calls onComplete with orderId for BNPL flow", () => {
    const onComplete = vi.fn();
    render(
      <CheckoutScreen
        deal={makeDealWithBNPL()}
        selectedDate={null}
        analytics={makeAnalytics()}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    fireEvent.click(screen.getByTestId("confirm-pay-button"));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("does not call onComplete when onComplete is not provided", () => {
    render(<CheckoutScreen deal={makeDealWithBNPL()} selectedDate={null} analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("payment-option-klarna").querySelector("input")!);
    expect(() => fireEvent.click(screen.getByTestId("confirm-pay-button"))).not.toThrow();
  });
});
