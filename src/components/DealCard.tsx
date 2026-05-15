import React from "react";
import type { Deal } from "../types/deal";
import type { AnalyticsClient } from "../analytics/client";
import { RefundPolicyBadge } from "./RefundPolicyBadge";
import { BNPLPricingHint } from "./BNPLPricingHint";

export interface DealCardProps {
  deal: Deal;
  analytics: AnalyticsClient;
  /** Zero-based position in the containing list — included in analytics payload. */
  position: number;
  onTap?: ((deal: Deal) => void) | undefined;
}

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function DealCard({ deal, analytics, position, onTap }: DealCardProps) {
  function handleClick() {
    analytics.track({
      event: "deal_card_tapped",
      dealId: deal.dealId,
      position,
      category: deal.category,
      ...(deal.recommendation !== undefined
        ? { score: deal.recommendation.score, reason: deal.recommendation.reason }
        : {}),
    });
    onTap?.(deal);
  }

  const heroSrc = deal.heroImages[0];
  const discountPct = Math.round(
    ((deal.pricing.originalPriceCents - deal.pricing.dealPriceCents) /
      deal.pricing.originalPriceCents) *
      100,
  );

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={deal.title}
      data-testid="deal-card"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      style={{ cursor: "pointer" }}
    >
      <img
        src={heroSrc}
        alt={deal.title}
        data-testid="deal-card-image"
        style={{ width: "100%", display: "block" }}
      />

      <div style={{ padding: 12 }}>
        <span data-testid="deal-card-category" style={{ fontSize: 11, textTransform: "uppercase" }}>
          {deal.category.replace(/_/g, " ")}
        </span>

        <h3 data-testid="deal-card-title" style={{ margin: "4px 0" }}>
          {deal.title}
        </h3>

        <p data-testid="deal-card-merchant" style={{ margin: "0 0 8px" }}>
          {deal.merchant.name}
        </p>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span data-testid="deal-card-price" style={{ fontWeight: 700 }}>
            {formatDollars(deal.pricing.dealPriceCents)}
          </span>
          <span
            data-testid="deal-card-original-price"
            style={{ textDecoration: "line-through", color: "#6b7280" }}
          >
            {formatDollars(deal.pricing.originalPriceCents)}
          </span>
          {discountPct > 0 && (
            <span data-testid="deal-card-discount" style={{ color: "#22c55e", fontWeight: 600 }}>
              {discountPct}% off
            </span>
          )}
        </div>

        {deal.bnplOptions.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <BNPLPricingHint
              bnplOption={deal.bnplOptions[0]}
              dealId={deal.dealId}
              analytics={analytics}
            />
          </div>
        )}

        {deal.recommendation !== undefined && (
          <p data-testid="deal-card-reason" style={{ fontSize: 12, color: "#6b7280", margin: "8px 0 0" }}>
            {deal.recommendation.reason}
          </p>
        )}

        <div style={{ marginTop: 8 }}>
          <RefundPolicyBadge refundPolicy={deal.refundPolicy} />
        </div>
      </div>
    </div>
  );
}
