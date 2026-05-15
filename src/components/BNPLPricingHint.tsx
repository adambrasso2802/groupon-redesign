import React from "react";
import type { BNPLOption } from "../types/deal";
import type { AnalyticsClient } from "../analytics/client";

export interface BNPLPricingHintProps {
  bnplOption: BNPLOption;
  dealId: string;
  analytics: AnalyticsClient;
}

function fmtAmount(cents: number, currency = "£"): string {
  return `${currency}${(cents / 100).toFixed(2)}`;
}

export function BNPLPricingHint({ bnplOption, dealId, analytics }: BNPLPricingHintProps) {
  function handleTap() {
    analytics.track({
      event: "bnpl_hint_tapped",
      dealId,
      provider: bnplOption.provider,
      installments: bnplOption.installments,
      installmentAmountCents: bnplOption.installmentAmountCents,
    });
  }

  return (
    <button
      data-testid="bnpl-pricing-hint"
      onClick={handleTap}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: 12,
        color: "#6b7280",
        textDecoration: "underline",
        textDecorationStyle: "dotted",
      }}
    >
      or {bnplOption.installments} payments of {fmtAmount(bnplOption.installmentAmountCents)}
    </button>
  );
}
