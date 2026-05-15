import React from "react";
import type { PriceBreakdown } from "../types/deal";

export interface PricingBreakdownPanelProps {
  pricing: PriceBreakdown;
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface Row {
  label: string;
  testId: string;
  value: number;
  isTotal?: boolean;
}

const ROWS: Array<Omit<Row, "value">> = [
  { label: "Deal price", testId: "pricing-deal-price" },
  { label: "Original price", testId: "pricing-original-price" },
  { label: "Service fee", testId: "pricing-service-fee" },
  { label: "Tax", testId: "pricing-tax" },
  { label: "Shipping", testId: "pricing-shipping" },
  { label: "Total", testId: "pricing-total", isTotal: true },
];

export function PricingBreakdownPanel({ pricing }: PricingBreakdownPanelProps) {
  const values: Record<string, number> = {
    "pricing-deal-price": pricing.dealPriceCents,
    "pricing-original-price": pricing.originalPriceCents,
    "pricing-service-fee": pricing.serviceFeeCents,
    "pricing-tax": pricing.taxCents,
    "pricing-shipping": pricing.shippingCents,
    "pricing-total": pricing.totalCents,
  };

  return (
    <div
      data-testid="pricing-breakdown-panel"
      style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px" }}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#374151" }}>
        Price Breakdown
      </h3>
      <dl style={{ margin: 0 }}>
        {ROWS.map(({ label, testId, isTotal }) => {
          const value = values[testId] ?? 0;
          return (
            <div
              key={testId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: isTotal ? 0 : 6,
                paddingTop: isTotal ? 8 : 0,
                borderTop: isTotal ? "1px solid #e5e7eb" : undefined,
              }}
            >
              <dt style={{ color: isTotal ? "#111827" : "#6b7280", fontWeight: isTotal ? 700 : 400 }}>
                {label}
              </dt>
              <dd
                data-testid={testId}
                style={{ margin: 0, fontWeight: isTotal ? 700 : 400, color: isTotal ? "#111827" : "#374151" }}
              >
                {fmt(value)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
