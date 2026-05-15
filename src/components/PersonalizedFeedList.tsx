import React, { useEffect, useRef } from "react";
import type { Deal } from "../types/deal";
import type { AnalyticsClient } from "../analytics/client";
import { DealCard } from "./DealCard";

export interface PersonalizedFeedListProps {
  deals: Deal[];
  analytics: AnalyticsClient;
  onDealTap?: (deal: Deal) => void;
}

export function PersonalizedFeedList({ deals, analytics, onDealTap }: PersonalizedFeedListProps) {
  const firedImpressions = useRef<Set<string>>(new Set());

  useEffect(() => {
    deals.forEach((deal, index) => {
      if (!firedImpressions.current.has(deal.dealId)) {
        firedImpressions.current.add(deal.dealId);
        analytics.track({
          event: "deal_card_impression",
          dealId: deal.dealId,
          position: index,
          category: deal.category,
          ...(deal.recommendation !== undefined
            ? { score: deal.recommendation.score, reason: deal.recommendation.reason }
            : {}),
        });
      }
    });
  }, [deals, analytics]);

  if (deals.length === 0) {
    return (
      <div data-testid="feed-empty-state" style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
        <p>No deals match your preferences right now.</p>
        <p style={{ fontSize: 13 }}>Check back soon — new deals land daily.</p>
      </div>
    );
  }

  return (
    <div data-testid="personalized-feed-list" style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 16px 80px" }}>
      {deals.map((deal, index) => (
        <div key={deal.dealId} data-testid="feed-slot" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <DealCard deal={deal} analytics={analytics} position={index} onTap={onDealTap} />
        </div>
      ))}
    </div>
  );
}
