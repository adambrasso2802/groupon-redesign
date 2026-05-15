import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Deal, DealCategory } from "../types/deal";
import type { LifestylePreference } from "../types/analytics";
import type { GrouponPreferences } from "../types/preferences";
import type { AnalyticsClient } from "../analytics/client";
import { MOCK_RECOMMENDATION_DEALS } from "../fixtures/recommendations";
import { STORAGE_KEY, LifestyleQuizScreen } from "./LifestyleQuizScreen";
import { PersonalizedFeedList } from "./PersonalizedFeedList";
import { BottomTabBar, type BottomTab } from "./BottomTabBar";

export interface HomeScreenProps {
  analytics: AnalyticsClient;
  onDealTap?: (deal: Deal) => void;
  /** Placeholder tap target — wired to UnifiedSearchBar in Tier 5. */
  onSearchTap?: () => void;
}

const PREFERENCE_CATEGORIES: Record<LifestylePreference, DealCategory[]> = {
  foodie: ["food_drink"],
  fitness: ["fitness"],
  parent: ["family_kids"],
  pet_owner: ["pets"],
  wellness_spa: ["spa_wellness", "beauty"],
  nightlife_daytrip: ["nightlife", "activities", "travel"],
};

function loadPreferences(): GrouponPreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GrouponPreferences;
  } catch {
    return null;
  }
}

function filterAndSort(deals: Deal[], prefs: GrouponPreferences | null): Deal[] {
  const sorted = [...deals].sort((a, b) => {
    const aScore = a.recommendation?.score ?? 0;
    const bScore = b.recommendation?.score ?? 0;
    return bScore - aScore;
  });

  if (!prefs || prefs.selectedPreferences.length === 0) return sorted;

  const allowedCategories = new Set<DealCategory>(
    prefs.selectedPreferences.flatMap((p) => PREFERENCE_CATEGORIES[p]),
  );

  const filtered = sorted.filter((d) => allowedCategories.has(d.category));
  return filtered.length > 0 ? filtered : sorted;
}

export function HomeScreen({ analytics, onDealTap, onSearchTap }: HomeScreenProps) {
  const [hasPreferences, setHasPreferences] = useState<boolean>(() => loadPreferences() !== null);
  const [activeTab, setActiveTab] = useState<BottomTab>("home");
  const hasTrackedView = useRef(false);

  const deals = useMemo(() => {
    if (!hasPreferences) return [];
    return filterAndSort(MOCK_RECOMMENDATION_DEALS, loadPreferences());
  }, [hasPreferences]);

  useEffect(() => {
    if (hasPreferences && !hasTrackedView.current) {
      hasTrackedView.current = true;
      analytics.track({ event: "home_screen_viewed", slotCount: deals.length });
    }
  }, [hasPreferences, deals.length, analytics]);

  function handleQuizComplete() {
    setHasPreferences(true);
  }

  if (!hasPreferences) {
    return (
      <LifestyleQuizScreen
        analytics={analytics}
        onComplete={handleQuizComplete}
      />
    );
  }

  return (
    <div data-testid="home-screen" style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <header
        data-testid="home-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
        }}
      >
        <div data-testid="groupon-logo" aria-label="Groupon" style={{ fontWeight: 800, fontSize: 22, color: "#16a34a", letterSpacing: -0.5 }}>
          Groupon
        </div>

        <button
          data-testid="search-icon-button"
          aria-label="Open search"
          onClick={onSearchTap}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "#111827",
          }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={2} />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <main>
        <PersonalizedFeedList deals={deals} analytics={analytics} onDealTap={onDealTap} />
      </main>

      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
