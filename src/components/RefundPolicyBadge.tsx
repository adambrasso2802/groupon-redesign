import React from "react";
import type { RefundPolicy } from "../types/deal";

export interface RefundPolicyBadgeProps {
  refundPolicy: RefundPolicy;
}

type BadgeColor = "green" | "amber" | "red";

function windowToHours(refundPolicy: RefundPolicy): number {
  if (refundPolicy.windowUnit === "hours") return refundPolicy.windowAmount;
  return refundPolicy.windowAmount * 24;
}

export function getRefundBadgeColor(refundPolicy: RefundPolicy): BadgeColor {
  if (!refundPolicy.isRefundable) return "red";
  const hours = windowToHours(refundPolicy);
  if (hours >= 24) return "green";
  if (hours > 0) return "amber";
  return "red";
}

const COLOR_HEX: Record<BadgeColor, string> = {
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
};

export function RefundPolicyBadge({ refundPolicy }: RefundPolicyBadgeProps) {
  const color = getRefundBadgeColor(refundPolicy);

  return (
    <span
      data-testid="refund-policy-badge"
      data-color={color}
      style={{
        backgroundColor: COLOR_HEX[color],
        color: "#fff",
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {refundPolicy.plainTextSummary}
    </span>
  );
}
