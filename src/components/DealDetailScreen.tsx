import React, { useEffect, useState } from "react";
import type { Deal } from "../types/deal";
import type { AnalyticsClient } from "../analytics/client";
import { RefundPolicyBadge } from "./RefundPolicyBadge";
import { HeroImageCarousel } from "./HeroImageCarousel";
import { PricingBreakdownPanel } from "./PricingBreakdownPanel";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { InstantConfirmationBadge } from "./InstantConfirmationBadge";
import { FinePrintExpander } from "./FinePrintExpander";

export interface DealDetailScreenProps {
  deal: Deal;
  analytics: AnalyticsClient;
  /** ISO 8601 date strings available for booking; only used when deal.isBookable */
  availableDates?: string[];
  onBuyNow?: (selectedDate: string | null) => void;
}

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function DealDetailScreen({
  deal,
  analytics,
  availableDates = [],
  onBuyNow,
}: DealDetailScreenProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    analytics.track({
      event: "deal_viewed",
      dealId: deal.dealId,
      category: deal.category,
    });
    analytics.track({
      event: "deal_detail_viewed",
      dealId: deal.dealId,
      category: deal.category,
    });
    // Intentionally run only on mount (dealId/category are stable identifiers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDateSelected(dateIso: string) {
    setSelectedDate(dateIso);
    analytics.track({ event: "slot_selected", dealId: deal.dealId, slotIso: dateIso });
  }

  function handleBuyNow() {
    analytics.track({
      event: "buy_now_tapped",
      dealId: deal.dealId,
      totalCents: deal.pricing.totalCents,
      ...(selectedDate !== null ? { selectedDateIso: selectedDate } : {}),
    });
    onBuyNow?.(selectedDate);
  }

  return (
    <div data-testid="deal-detail-screen" style={{ paddingBottom: 80 }}>
      {/* Hero image carousel */}
      <HeroImageCarousel images={deal.heroImages} dealId={deal.dealId} analytics={analytics} />

      {/* Deal title + merchant info */}
      <div style={{ padding: "16px 16px 0" }}>
        <h1 data-testid="deal-title" style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
          {deal.title}
        </h1>
        <div
          data-testid="merchant-info"
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 4 }}
        >
          <span data-testid="merchant-name" style={{ fontWeight: 600, fontSize: 15 }}>
            {deal.merchant.name}
          </span>
          <span
            data-testid="merchant-rating"
            aria-label={`Rating: ${deal.merchant.rating} out of 5`}
            style={{ color: "#f59e0b", fontWeight: 600 }}
          >
            {deal.merchant.rating.toFixed(1)} ★
          </span>
          <span data-testid="merchant-review-count" style={{ color: "#6b7280", fontSize: 13 }}>
            ({deal.merchant.reviewCount} reviews)
          </span>
        </div>

        {/* Instant confirmation badge — shown directly below merchant info */}
        <div style={{ marginTop: 8 }}>
          <InstantConfirmationBadge supportsInstantConfirmation={deal.supportsInstantConfirmation} />
        </div>
      </div>

      {/* Pricing breakdown — always visible before the buy button */}
      <div style={{ padding: "16px 16px 0" }}>
        <PricingBreakdownPanel pricing={deal.pricing} />
      </div>

      {/* Availability calendar — only for bookable deals */}
      {deal.isBookable && (
        <div style={{ padding: "16px 16px 0" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Choose a Date</h2>
          <AvailabilityCalendar
            availableDates={availableDates}
            dealId={deal.dealId}
            analytics={analytics}
            onDateSelected={handleDateSelected}
          />
        </div>
      )}

      {/* Refund policy badge — prominently above the buy button */}
      <div
        data-testid="refund-policy-section"
        style={{ padding: "16px 16px 0" }}
      >
        <RefundPolicyBadge refundPolicy={deal.refundPolicy} />
      </div>

      {/* Fine print — collapsible expander; when empty nothing is rendered */}
      {deal.finePrint.length > 0 && (
        <div style={{ padding: "16px 16px 0" }}>
          <FinePrintExpander
            items={deal.finePrint}
            dealId={deal.dealId}
            analytics={analytics}
          />
        </div>
      )}

      {/* Sticky bottom bar with final price and Buy Now */}
      <div
        data-testid="sticky-buy-bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 100,
        }}
      >
        <div>
          <span data-testid="sticky-bar-price" style={{ fontSize: 18, fontWeight: 700 }}>
            {formatDollars(deal.pricing.totalCents)}
          </span>
          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 4 }}>total</span>
        </div>
        <button
          data-testid="buy-now-button"
          onClick={handleBuyNow}
          style={{
            background: "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
