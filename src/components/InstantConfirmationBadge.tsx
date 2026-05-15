import React from "react";

export interface InstantConfirmationBadgeProps {
  supportsInstantConfirmation: boolean;
}

export function InstantConfirmationBadge({ supportsInstantConfirmation }: InstantConfirmationBadgeProps) {
  if (supportsInstantConfirmation) {
    return (
      <span
        data-testid="instant-confirmation-badge"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "#f0fdf4",
          color: "#16a34a",
          border: "1px solid #bbf7d0",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        ✓ Confirmed
      </span>
    );
  }
  return (
    <span
      data-testid="instant-confirmation-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "#fffbeb",
        color: "#b45309",
        border: "1px solid #fde68a",
        borderRadius: 6,
        padding: "4px 10px",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      ⏳ Pending
    </span>
  );
}
