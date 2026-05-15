import React, { useEffect } from "react";
import type { CheckoutSummary } from "../types/deal";
import type { AnalyticsClient } from "../analytics/client";
import type { SupportAction } from "../types/analytics";
import { PostPurchaseHelpEntry } from "./PostPurchaseHelpEntry";

export interface VoucherCardProps {
  order: CheckoutSummary & { orderId: string };
  voucherCode: string;
  analytics: AnalyticsClient;
  onActionSelected?: (action: SupportAction) => void;
}

export function VoucherCard({ order, voucherCode, analytics, onActionSelected }: VoucherCardProps) {
  useEffect(() => {
    analytics.track({ event: "voucher_viewed", orderId: order.orderId, dealId: order.dealId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bookingDate = order.selectedSlotIso
    ? formatBookingDate(order.selectedSlotIso)
    : null;

  return (
    <div
      data-testid="voucher-card"
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Deal info */}
      <div style={{ marginBottom: 16 }}>
        <h3
          data-testid="voucher-deal-title"
          style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}
        >
          {order.deal.title}
        </h3>
        <p
          data-testid="voucher-merchant-name"
          style={{ fontSize: 14, color: "#6b7280", margin: "0 0 2px" }}
        >
          {order.deal.merchant.name}
        </p>

        {bookingDate && (
          <p
            data-testid="voucher-booking-date"
            style={{ fontSize: 13, color: "#374151", margin: "6px 0 0" }}
          >
            Booking: {bookingDate}
          </p>
        )}
      </div>

      {/* Voucher code */}
      <div
        data-testid="voucher-code-section"
        style={{
          background: "#f9fafb",
          border: "1px dashed #d1d5db",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Voucher code
        </span>
        <span
          data-testid="voucher-code"
          style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.15em", color: "#111827" }}
        >
          {voucherCode}
        </span>
      </div>

      {/* Help entry */}
      <PostPurchaseHelpEntry
        orderId={order.orderId}
        dealId={order.dealId}
        refundPolicy={order.refundPolicy}
        surface="voucher_card"
        analytics={analytics}
        onActionSelected={onActionSelected}
      />
    </div>
  );
}

function formatBookingDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
