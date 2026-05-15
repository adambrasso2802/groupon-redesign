import React, { useState } from "react";
import type { AnalyticsClient } from "../analytics/client";
import type { DealCategory } from "../types/deal";

export interface SearchFilterPanelProps {
  analytics: AnalyticsClient;
  onFilterChange?: (filterKey: string, filterValue: string | number) => void;
}

type PriceRange = "under_25" | "25_to_50" | "50_to_100" | "over_100";
type DistanceMiles = 5 | 10 | 25 | 50;
type RatingMin = 3 | 4 | 4.5;

const CATEGORY_OPTIONS: { label: string; value: DealCategory }[] = [
  { label: "Food & Drink", value: "food_drink" },
  { label: "Fitness", value: "fitness" },
  { label: "Spa", value: "spa_wellness" },
  { label: "Activities", value: "activities" },
  { label: "Travel", value: "travel" },
  { label: "Shopping", value: "shopping" },
  { label: "Beauty", value: "beauty" },
];

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: "Under £25", value: "under_25" },
  { label: "£25–£50", value: "25_to_50" },
  { label: "£50–£100", value: "50_to_100" },
  { label: "£100+", value: "over_100" },
];

const DISTANCE_OPTIONS: { label: string; value: DistanceMiles }[] = [
  { label: "5 mi", value: 5 },
  { label: "10 mi", value: 10 },
  { label: "25 mi", value: 25 },
  { label: "50 mi", value: 50 },
];

const RATING_OPTIONS: { label: string; value: RatingMin }[] = [
  { label: "3★+", value: 3 },
  { label: "4★+", value: 4 },
  { label: "4.5★+", value: 4.5 },
];

type ActiveFilters = {
  category: DealCategory | null;
  price_range: PriceRange | null;
  distance: DistanceMiles | null;
  rating: RatingMin | null;
};

export function SearchFilterPanel({ analytics, onFilterChange }: SearchFilterPanelProps) {
  const [active, setActive] = useState<ActiveFilters>({
    category: null,
    price_range: null,
    distance: null,
    rating: null,
  });

  function applyFilter<K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) {
    const next = value === active[key] ? null : value;
    setActive((prev) => ({ ...prev, [key]: next }));
    if (next !== null) {
      analytics.track({
        event: "search_filter_changed",
        filterKey: key as "category" | "price_range" | "distance" | "rating",
        filterValue: next as string | number,
      });
      onFilterChange?.(key, next as string | number);
    }
  }

  return (
    <div
      data-testid="search-filter-panel"
      style={{
        overflowX: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "8px 0",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Category row */}
      <div style={{ display: "flex", gap: 6, paddingLeft: 2 }}>
        {CATEGORY_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            isActive={active.category === opt.value}
            testId={`filter-category-${opt.value}`}
            onClick={() => applyFilter("category", opt.value)}
          />
        ))}
      </div>

      {/* Price / distance / rating row */}
      <div style={{ display: "flex", gap: 6, paddingLeft: 2 }}>
        {PRICE_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            isActive={active.price_range === opt.value}
            testId={`filter-price-${opt.value}`}
            onClick={() => applyFilter("price_range", opt.value)}
          />
        ))}
        {DISTANCE_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            isActive={active.distance === opt.value}
            testId={`filter-distance-${opt.value}`}
            onClick={() => applyFilter("distance", opt.value)}
          />
        ))}
        {RATING_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            isActive={active.rating === opt.value}
            testId={`filter-rating-${opt.value}`}
            onClick={() => applyFilter("rating", opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

interface ChipProps {
  label: string;
  isActive: boolean;
  testId: string;
  onClick: () => void;
}

function Chip({ label, isActive, testId, onClick }: ChipProps) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      aria-pressed={isActive}
      style={{
        flexShrink: 0,
        background: isActive ? "#16a34a" : "#f3f4f6",
        color: isActive ? "#fff" : "#374151",
        border: isActive ? "1px solid #16a34a" : "1px solid #e5e7eb",
        borderRadius: 20,
        padding: "6px 12px",
        fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
