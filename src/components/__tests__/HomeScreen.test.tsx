import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { HomeScreen } from "../HomeScreen";
import { STORAGE_KEY } from "../LifestyleQuizScreen";
import type { AnalyticsClient } from "../../analytics/client";
import type { GrouponPreferences } from "../../types/preferences";
import { MOCK_RECOMMENDATION_DEALS } from "../../fixtures/recommendations";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

function setPreferences(prefs: GrouponPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function allPreferences(): GrouponPreferences {
  return {
    selectedPreferences: [],
    budgetRange: null,
    locationRadiusMiles: null,
  };
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Quiz gate — no preferences
// ---------------------------------------------------------------------------

describe("HomeScreen — quiz gate", () => {
  it("renders LifestyleQuizScreen when no preferences in localStorage", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("lifestyle-quiz-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("home-screen")).toBeNull();
  });

  it("does NOT render the home screen until quiz completes", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("home-screen")).toBeNull();
  });

  it("transitions to home screen after quiz completes via skip", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("quiz-skip"));
    expect(screen.getByTestId("home-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("lifestyle-quiz-screen")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Home screen structure — preferences exist
// ---------------------------------------------------------------------------

describe("HomeScreen — structure with preferences", () => {
  beforeEach(() => {
    setPreferences(allPreferences());
  });

  it("renders the home screen directly when preferences exist", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("home-screen")).toBeInTheDocument();
  });

  it("renders the sticky header", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("home-header")).toBeInTheDocument();
  });

  it("renders the Groupon logo in the header", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("groupon-logo")).toBeInTheDocument();
    expect(screen.getByTestId("groupon-logo")).toHaveTextContent("Groupon");
  });

  it("renders the search icon button placeholder", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("search-icon-button")).toBeInTheDocument();
  });

  it("renders the bottom tab bar", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("bottom-tab-bar")).toBeInTheDocument();
  });

  it("renders the personalized feed list", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("personalized-feed-list")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Search icon — Tier 5 placeholder
// ---------------------------------------------------------------------------

describe("HomeScreen — search icon placeholder", () => {
  beforeEach(() => {
    setPreferences(allPreferences());
  });

  it("has aria-label 'Open search' on the search icon button", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("search-icon-button")).toHaveAttribute("aria-label", "Open search");
  });

  it("calls onSearchTap when search icon is tapped", () => {
    const onSearchTap = vi.fn();
    render(<HomeScreen analytics={makeAnalytics()} onSearchTap={onSearchTap} />);
    fireEvent.click(screen.getByTestId("search-icon-button"));
    expect(onSearchTap).toHaveBeenCalledOnce();
  });

  it("does not throw when onSearchTap is not provided", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(() => fireEvent.click(screen.getByTestId("search-icon-button"))).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Analytics — home_screen_viewed
// ---------------------------------------------------------------------------

describe("HomeScreen — home_screen_viewed analytics", () => {
  it("fires home_screen_viewed on mount when preferences exist", () => {
    setPreferences(allPreferences());
    const analytics = makeAnalytics();
    render(<HomeScreen analytics={analytics} />);
    const calls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    const viewedEvent = calls.find((e) => e.event === "home_screen_viewed");
    expect(viewedEvent).toBeDefined();
  });

  it("fires home_screen_viewed with slotCount equal to the number of deals shown", () => {
    setPreferences(allPreferences());
    const analytics = makeAnalytics();
    render(<HomeScreen analytics={analytics} />);
    const calls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    const viewedEvent = calls.find((e) => e.event === "home_screen_viewed");
    expect(viewedEvent?.slotCount).toBe(MOCK_RECOMMENDATION_DEALS.length);
  });

  it("fires home_screen_viewed exactly once even if the component re-renders", () => {
    setPreferences(allPreferences());
    const analytics = makeAnalytics();
    const { rerender } = render(<HomeScreen analytics={analytics} />);
    rerender(<HomeScreen analytics={analytics} />);
    const viewedEvents = (analytics.track as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0])
      .filter((e) => e.event === "home_screen_viewed");
    expect(viewedEvents).toHaveLength(1);
  });

  it("fires home_screen_viewed after quiz completes, not before", () => {
    const analytics = makeAnalytics();
    render(<HomeScreen analytics={analytics} />);

    // Before quiz completes, home_screen_viewed should NOT have fired
    const callsBefore = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(callsBefore.find((e) => e.event === "home_screen_viewed")).toBeUndefined();

    fireEvent.click(screen.getByTestId("quiz-skip"));

    const callsAfter = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(callsAfter.find((e) => e.event === "home_screen_viewed")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Feed content — all deals shown with no category preference
// ---------------------------------------------------------------------------

describe("HomeScreen — feed content (no category preference)", () => {
  it("renders DealCard for every mock recommendation", () => {
    setPreferences(allPreferences());
    render(<HomeScreen analytics={makeAnalytics()} />);
    const cards = screen.getAllByTestId("deal-card");
    expect(cards).toHaveLength(MOCK_RECOMMENDATION_DEALS.length);
  });

  it("renders all 6 mock deals", () => {
    setPreferences(allPreferences());
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getAllByTestId("feed-slot")).toHaveLength(6);
  });

  it("deals are sorted by score descending", () => {
    setPreferences(allPreferences());
    render(<HomeScreen analytics={makeAnalytics()} />);
    const titles = screen.getAllByTestId("deal-card-title").map((el) => el.textContent);
    // Highest score deal (mock-001 Spa, score 0.95) should appear first
    expect(titles[0]).toBe("90-Minute Deep Tissue Massage");
    // Lowest score deal (mock-006 Kayak, score 0.70) should appear last
    expect(titles[titles.length - 1]).toBe("Sunset Kayak Tour for Two");
  });
});

// ---------------------------------------------------------------------------
// Feed filtering — category preferences
// ---------------------------------------------------------------------------

describe("HomeScreen — category filtering from preferences", () => {
  it("filters to spa deals when wellness_spa preference is set", () => {
    setPreferences({ selectedPreferences: ["wellness_spa"], budgetRange: null, locationRadiusMiles: null });
    render(<HomeScreen analytics={makeAnalytics()} />);
    const titles = screen.getAllByTestId("deal-card-title").map((el) => el.textContent);
    expect(titles).toContain("90-Minute Deep Tissue Massage");
    expect(titles).not.toContain("3-Course Dinner for Two");
  });

  it("filters to food deals when foodie preference is set", () => {
    setPreferences({ selectedPreferences: ["foodie"], budgetRange: null, locationRadiusMiles: null });
    render(<HomeScreen analytics={makeAnalytics()} />);
    const titles = screen.getAllByTestId("deal-card-title").map((el) => el.textContent);
    expect(titles).toContain("3-Course Dinner for Two");
    expect(titles).not.toContain("90-Minute Deep Tissue Massage");
  });

  it("shows deals matching any of multiple preferences (union)", () => {
    setPreferences({ selectedPreferences: ["foodie", "fitness"], budgetRange: null, locationRadiusMiles: null });
    render(<HomeScreen analytics={makeAnalytics()} />);
    const titles = screen.getAllByTestId("deal-card-title").map((el) => el.textContent);
    expect(titles).toContain("3-Course Dinner for Two");
    expect(titles).toContain("1-Month Unlimited Gym Access");
    expect(titles).not.toContain("90-Minute Deep Tissue Massage");
  });

  it("falls back to all deals when no preferences match any mock category", () => {
    // 'parent' maps to family_kids — if mock had no family deals it would fall back
    // Here we force empty selectedPreferences to confirm fallback to all deals
    setPreferences({ selectedPreferences: [], budgetRange: null, locationRadiusMiles: null });
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getAllByTestId("deal-card")).toHaveLength(MOCK_RECOMMENDATION_DEALS.length);
  });
});

// ---------------------------------------------------------------------------
// Bottom tab bar
// ---------------------------------------------------------------------------

describe("HomeScreen — BottomTabBar", () => {
  beforeEach(() => {
    setPreferences(allPreferences());
  });

  it("renders all four tabs", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("tab-home")).toBeInTheDocument();
    expect(screen.getByTestId("tab-search")).toBeInTheDocument();
    expect(screen.getByTestId("tab-my_groupons")).toBeInTheDocument();
    expect(screen.getByTestId("tab-support")).toBeInTheDocument();
  });

  it("Home tab is active by default", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    expect(screen.getByTestId("tab-home")).toHaveAttribute("aria-current", "page");
  });

  it("switches active tab on tap", () => {
    render(<HomeScreen analytics={makeAnalytics()} />);
    fireEvent.click(screen.getByTestId("tab-search"));
    expect(screen.getByTestId("tab-search")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("tab-home")).not.toHaveAttribute("aria-current");
  });
});

// ---------------------------------------------------------------------------
// onDealTap callback
// ---------------------------------------------------------------------------

describe("HomeScreen — onDealTap callback", () => {
  it("calls onDealTap when a DealCard is tapped", () => {
    setPreferences(allPreferences());
    const onDealTap = vi.fn();
    render(<HomeScreen analytics={makeAnalytics()} onDealTap={onDealTap} />);
    fireEvent.click(screen.getAllByTestId("deal-card")[0]!);
    expect(onDealTap).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// PersonalizedFeedList — impression events
// ---------------------------------------------------------------------------

describe("HomeScreen — deal_card_impression events", () => {
  it("fires deal_card_impression for each deal on mount", () => {
    setPreferences(allPreferences());
    const analytics = makeAnalytics();
    render(<HomeScreen analytics={analytics} />);
    const impressionEvents = (analytics.track as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0])
      .filter((e) => e.event === "deal_card_impression");
    expect(impressionEvents).toHaveLength(MOCK_RECOMMENDATION_DEALS.length);
  });

  it("includes score and reason in impression events for recommendation deals", () => {
    setPreferences(allPreferences());
    const analytics = makeAnalytics();
    render(<HomeScreen analytics={analytics} />);
    const impressionEvents = (analytics.track as ReturnType<typeof vi.fn>).mock.calls
      .map((c) => c[0])
      .filter((e) => e.event === "deal_card_impression");
    impressionEvents.forEach((ev) => {
      expect(ev.score).toBeDefined();
      expect(ev.reason).toBeDefined();
    });
  });
});

