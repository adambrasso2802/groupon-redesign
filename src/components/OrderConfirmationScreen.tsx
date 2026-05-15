import React, { useEffect } from "react";
import type { Deal } from "../types/deal";
import type { AnalyticsClient } from "../analytics/client";

export interface BookingConfirmationScreenProps {
  orderId: string;
  dealId: string;
  deal: Pick<Deal, "title" | "merchant">;
  selectedDate: string | null;
  analytics: AnalyticsClient;
  /** Tier 8 PostPurchaseHelpEntry hook — wired up when Tier 8 ships */
  onNeedHelp?: () => void;
}

export function BookingConfirmationScreen({
  orderId,
  dealId,
  deal,
  selectedDate,
  analytics,
  onNeedHelp,
}: BookingConfirmationScreenProps) {
  useEffect(() => {
    analytics.track({ event: "booking_confirmation_viewed", dealId, orderId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-testid="order-confirmation-screen">
      <div style={{ textAlign: "center", padding: "32px 16px 20px" }}>
        <div aria-hidden="true" style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
          Purchase Confirmed!
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
          Your order has been placed successfully.
        </p>
      </div>

      <div
        data-testid="confirmation-order-details"
        style={{
          margin: "0 16px",
          background: "#f9fafb",
          borderRadius: 12,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Order ID
          </p>
          <p
            data-testid="confirmation-order-id"
            style={{ margin: 0, fontWeight: 700, fontSize: 14, fontFamily: "monospace", color: "#111827" }}
          >
            {orderId}
          </p>
        </div>

        <div>
          <p style={{ margin: "0 0 2px", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Deal
          </p>
          <p
            data-testid="confirmation-deal-title"
            style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827" }}
          >
            {deal.title}
          </p>
          <p
            data-testid="confirmation-merchant"
            style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}
          >
            {deal.merchant.name}
          </p>
        </div>

        {selectedDate && (
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Booking Date
            </p>
            <p
              data-testid="confirmation-date"
              style={{ margin: 0, fontSize: 14, color: "#374151" }}
            >
              {selectedDate}
            </p>
          </div>
        )}
      </div>

      {/* PostPurchaseHelpEntry hook — Tier 8 wires this to full support flow */}
      <div style={{ padding: "24px 16px 0" }}>
        <button
          data-testid="need-help-button"
          onClick={onNeedHelp}
          style={{
            width: "100%",
            background: "transparent",
            color: "#2563eb",
            border: "2px solid #2563eb",
            borderRadius: 8,
            padding: "14px 24px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Need help? Contact Support
        </button>
      </div>
    </div>
  );
}
