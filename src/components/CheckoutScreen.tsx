import React, { useEffect, useState } from "react";
import type { Deal, PaymentMethod } from "../types/deal";
import type { AnalyticsClient } from "../analytics/client";
import { PricingBreakdownPanel } from "./PricingBreakdownPanel";
import { RefundPolicyBadge } from "./RefundPolicyBadge";
import { InAppThreeDChallenge } from "./InAppThreeDChallenge";
import { BookingConfirmationScreen } from "./OrderConfirmationScreen";
import { BNPLPricingHint } from "./BNPLPricingHint";

export interface CheckoutScreenProps {
  deal: Deal;
  selectedDate: string | null;
  analytics: AnalyticsClient;
  onComplete?: (orderId: string) => void;
}

type CheckoutPaymentMethod = "new_card" | "klarna";

function fmt(cents: number): string {
  return `£${(cents / 100).toFixed(2)}`;
}

function generateOrderId(): string {
  return `ORDER-${Date.now()}-${Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")}`;
}

export function CheckoutScreen({
  deal,
  selectedDate,
  analytics,
  onComplete,
}: CheckoutScreenProps) {
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("new_card");
  const [recurringAcknowledged, setRecurringAcknowledged] = useState(false);
  const [showThreeDS, setShowThreeDS] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const klarnaOption = deal.bnplOptions.find((o) => o.provider === "klarna") ?? null;
  const hasBNPL = klarnaOption !== null;

  useEffect(() => {
    analytics.track({ event: "checkout_opened", dealId: deal.dealId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePaymentMethodChange(method: CheckoutPaymentMethod) {
    setPaymentMethod(method);
    const analyticsMethod: PaymentMethod = method === "klarna" ? "klarna" : "new_card";
    analytics.track({ event: "payment_method_selected", method: analyticsMethod });
  }

  function completePurchase() {
    const orderId = generateOrderId();
    const analyticsMethod: PaymentMethod = paymentMethod === "klarna" ? "klarna" : "new_card";
    analytics.track({
      event: "purchase_confirmed",
      dealId: deal.dealId,
      orderId,
      totalCents: deal.pricing.totalCents,
      paymentMethod: analyticsMethod,
    });
    setCompletedOrderId(orderId);
    onComplete?.(orderId);
  }

  function handleConfirm() {
    if (deal.hasRecurringCharge && !recurringAcknowledged) return;
    if (paymentMethod === "new_card") {
      setShowThreeDS(true);
    } else {
      completePurchase();
    }
  }

  const confirmDisabled = deal.hasRecurringCharge && !recurringAcknowledged;

  if (completedOrderId !== null) {
    return (
      <BookingConfirmationScreen
        orderId={completedOrderId}
        dealId={deal.dealId}
        deal={deal}
        selectedDate={selectedDate}
        analytics={analytics}
      />
    );
  }

  const primaryBnpl = deal.bnplOptions.length > 0 ? deal.bnplOptions[0] : null;

  return (
    <div data-testid="checkout-screen">
      <div style={{ padding: "16px 16px 0" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Review Your Order</h1>
        <PricingBreakdownPanel pricing={deal.pricing} />
      </div>

      {/* Payment method selector */}
      <div data-testid="payment-method-selector" style={{ padding: "16px 16px 0" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>Payment Method</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label
            data-testid="payment-option-new-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `2px solid ${paymentMethod === "new_card" ? "#22c55e" : "#e5e7eb"}`,
              borderRadius: 8,
              padding: "12px 14px",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="payment-method"
              value="new_card"
              checked={paymentMethod === "new_card"}
              onChange={() => handlePaymentMethodChange("new_card")}
              style={{ accentColor: "#22c55e" }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Credit / Debit Card</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Pay securely with your card</div>
            </div>
          </label>

          {hasBNPL && klarnaOption && (
            <label
              data-testid="payment-option-klarna"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: `2px solid ${paymentMethod === "klarna" ? "#22c55e" : "#e5e7eb"}`,
                borderRadius: 8,
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="payment-method"
                value="klarna"
                checked={paymentMethod === "klarna"}
                onChange={() => handlePaymentMethodChange("klarna")}
                style={{ accentColor: "#22c55e" }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Pay in instalments (Klarna)</div>
                <div
                  data-testid="bnpl-installment-summary"
                  style={{ fontSize: 12, color: "#6b7280" }}
                >
                  {klarnaOption.installments}× {fmt(klarnaOption.installmentAmountCents)} per payment
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* BNPL installment breakdown when Klarna is selected */}
      {paymentMethod === "klarna" && klarnaOption && (
        <div
          data-testid="bnpl-installment-breakdown"
          style={{
            margin: "12px 16px 0",
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 13, color: "#166534" }}>
            Klarna instalment plan
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#15803d" }}>
            {klarnaOption.installments} payments of{" "}
            <strong data-testid="bnpl-installment-amount">
              {fmt(klarnaOption.installmentAmountCents)}
            </strong>{" "}
            each
          </p>
        </div>
      )}

      {/* Recurring charge mandatory acknowledgment */}
      {deal.hasRecurringCharge && (
        <div
          data-testid="recurring-charge-section"
          style={{
            margin: "12px 16px 0",
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#92400e" }}>
            Recurring Charge
          </p>
          {deal.recurringChargeSummary && (
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#78350f" }}>
              {deal.recurringChargeSummary}
            </p>
          )}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
            <input
              data-testid="recurring-charge-checkbox"
              type="checkbox"
              checked={recurringAcknowledged}
              onChange={(e) => setRecurringAcknowledged(e.target.checked)}
              style={{ marginTop: 2, accentColor: "#f59e0b" }}
            />
            <span style={{ fontSize: 13, color: "#78350f" }}>
              I understand this deal includes a recurring charge and accept the terms.
            </span>
          </label>
        </div>
      )}

      {/* Refund terms reminder — always visible above the confirm button */}
      <div data-testid="refund-terms-reminder" style={{ padding: "12px 16px 0" }}>
        <RefundPolicyBadge refundPolicy={deal.refundPolicy} />
      </div>

      {/* Order summary */}
      <div data-testid="order-summary" style={{ padding: "16px 16px 0" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px" }}>Order Summary</h2>
        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px" }}>
          <p
            data-testid="order-summary-deal-title"
            style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14 }}
          >
            {deal.title}
          </p>
          <p
            data-testid="order-summary-merchant"
            style={{ margin: "0 0 4px", fontSize: 13, color: "#6b7280" }}
          >
            {deal.merchant.name}
          </p>
          {selectedDate && (
            <p
              data-testid="order-summary-date"
              style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}
            >
              Date: {selectedDate}
            </p>
          )}
          <p
            data-testid="order-summary-total"
            style={{ margin: "8px 0 0", fontWeight: 700, fontSize: 15 }}
          >
            Total: {fmt(deal.pricing.totalCents)}
          </p>
          {primaryBnpl && (
            <div style={{ marginTop: 4 }}>
              <BNPLPricingHint
                bnplOption={primaryBnpl}
                dealId={deal.dealId}
                analytics={analytics}
              />
            </div>
          )}
        </div>
      </div>

      {/* Confirm & Pay button */}
      <div style={{ padding: "16px" }}>
        <button
          data-testid="confirm-pay-button"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          aria-disabled={confirmDisabled}
          style={{
            width: "100%",
            background: confirmDisabled ? "#d1d5db" : "#22c55e",
            color: confirmDisabled ? "#6b7280" : "#fff",
            border: "none",
            borderRadius: 8,
            padding: "14px 24px",
            fontSize: 16,
            fontWeight: 700,
            cursor: confirmDisabled ? "not-allowed" : "pointer",
          }}
        >
          Confirm &amp; Pay {fmt(deal.pricing.totalCents)}
        </button>
      </div>

      {/* Inline 3DS challenge modal — shown for card payments */}
      {showThreeDS && (
        <InAppThreeDChallenge
          dealId={deal.dealId}
          analytics={analytics}
          onSuccess={() => {
            setShowThreeDS(false);
            completePurchase();
          }}
          onDismiss={() => setShowThreeDS(false)}
        />
      )}
    </div>
  );
}
