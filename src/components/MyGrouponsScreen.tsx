import React, { useEffect } from "react";
import type { CheckoutSummary } from "../types/deal";
import type { AnalyticsClient } from "../analytics/client";
import type { SupportAction } from "../types/analytics";
import { PostPurchaseHelpEntry } from "./PostPurchaseHelpEntry";

export interface MyGrouponsScreenProps {
  orders: (CheckoutSummary & { orderId: string })[];
  analytics: AnalyticsClient;
  onActionSelected?: ((orderId: string, action: SupportAction) => void) | undefined;
  /** When provided, renders a settings link to the notification preference center. */
  onOpenNotificationPreferences?: (() => void) | undefined;
}

export function MyGrouponsScreen({
  orders,
  analytics,
  onActionSelected,
  onOpenNotificationPreferences,
}: MyGrouponsScreenProps) {
  useEffect(() => {
    analytics.track({ event: "my_groupons_viewed" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-testid="my-groupons-screen">
      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#111827",
          margin: "0 0 20px",
          padding: "20px 16px 0",
        }}
      >
        My Groupons
      </h1>

      {orders.length === 0 ? (
        <p data-testid="my-groupons-empty" style={{ fontSize: 14, color: "#6b7280", padding: "0 16px" }}>
          No orders yet. Start exploring deals!
        </p>
      ) : (
        <ul
          data-testid="my-groupons-list"
          style={{ listStyle: "none", margin: 0, padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}
        >
          {orders.map((order) => (
            <li key={order.orderId}>
              <OrderRow
                order={order}
                analytics={analytics}
                onActionSelected={onActionSelected ? (action) => onActionSelected(order.orderId, action) : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      {onOpenNotificationPreferences && (
        <section
          data-testid="my-groupons-settings"
          aria-label="Settings"
          style={{ padding: "24px 16px 0" }}
        >
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: 0.4,
              margin: "0 0 8px",
            }}
          >
            Settings
          </h2>
          <button
            data-testid="open-notification-preferences"
            type="button"
            onClick={onOpenNotificationPreferences}
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span>
              <span
                style={{
                  display: "block",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Notification preferences
              </span>
              <span style={{ display: "block", fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                Manage deal alerts, reminders, and emails
              </span>
            </span>
            <span aria-hidden="true" style={{ color: "#9ca3af", fontSize: 18 }}>
              ›
            </span>
          </button>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OrderRow — one entry in the My Groupons list
// ---------------------------------------------------------------------------

interface OrderRowProps {
  order: CheckoutSummary & { orderId: string };
  analytics: AnalyticsClient;
  onActionSelected?: ((action: SupportAction) => void) | undefined;
}

function OrderRow({ order, analytics, onActionSelected }: OrderRowProps) {
  return (
    <div
      data-testid="order-row"
      data-order-id={order.orderId}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "16px",
      }}
    >
      <div style={{ marginBottom: 4 }}>
        <p
          data-testid="order-row-deal-title"
          style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}
        >
          {order.deal.title}
        </p>
        <p
          data-testid="order-row-merchant"
          style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}
        >
          {order.deal.merchant.name}
        </p>
        {order.selectedSlotIso && (
          <p
            data-testid="order-row-slot"
            style={{ fontSize: 13, color: "#374151", margin: "4px 0 0" }}
          >
            Booked: {order.selectedSlotIso}
          </p>
        )}
      </div>

      <PostPurchaseHelpEntry
        orderId={order.orderId}
        dealId={order.dealId}
        refundPolicy={order.refundPolicy}
        surface="my_groupons"
        analytics={analytics}
        onActionSelected={onActionSelected}
      />
    </div>
  );
}
