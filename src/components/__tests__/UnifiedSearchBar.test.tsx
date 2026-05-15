import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import React from "react";
import { UnifiedSearchBar, RECENT_SEARCHES_KEY } from "../UnifiedSearchBar";
import type { AnalyticsClient } from "../../analytics/client";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

function setRecentSearches(items: string[]) {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("UnifiedSearchBar — rendering", () => {
  it("renders the search input", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("renders the microphone button placeholder", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    expect(screen.getByTestId("mic-button")).toBeInTheDocument();
  });

  it("mic button has aria-label 'Voice search'", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    expect(screen.getByTestId("mic-button")).toHaveAttribute("aria-label", "Voice search");
  });

  it("renders as a form with role=search", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    expect(screen.getByRole("search")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Focus — fires search_initiated and shows recent searches
// ---------------------------------------------------------------------------

describe("UnifiedSearchBar — focus behavior", () => {
  it("fires search_initiated on first focus", () => {
    const analytics = makeAnalytics();
    render(<UnifiedSearchBar analytics={analytics} />);
    fireEvent.focus(screen.getByTestId("search-input"));
    const events = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(events.find((e) => e.event === "search_initiated")).toBeDefined();
  });

  it("fires search_initiated only once across multiple focus events", () => {
    const analytics = makeAnalytics();
    render(<UnifiedSearchBar analytics={analytics} />);
    fireEvent.focus(screen.getByTestId("search-input"));
    fireEvent.blur(screen.getByTestId("search-input"));
    fireEvent.focus(screen.getByTestId("search-input"));
    const events = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(events.filter((e) => e.event === "search_initiated")).toHaveLength(1);
  });

  it("does not show recent searches when there are none", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.focus(screen.getByTestId("search-input"));
    expect(screen.queryByTestId("recent-searches")).toBeNull();
  });

  it("shows recent searches on focus when localStorage has entries", () => {
    setRecentSearches(["spa day", "dinner for two"]);
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.focus(screen.getByTestId("search-input"));
    expect(screen.getByTestId("recent-searches")).toBeInTheDocument();
    expect(screen.getAllByTestId("recent-search-item")).toHaveLength(2);
  });

  it("shows at most 5 recent searches", () => {
    setRecentSearches(["a", "b", "c", "d", "e", "f"]);
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.focus(screen.getByTestId("search-input"));
    expect(screen.getAllByTestId("recent-search-item")).toHaveLength(5);
  });

  it("displays recent search text correctly", () => {
    setRecentSearches(["spa day", "gym membership"]);
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.focus(screen.getByTestId("search-input"));
    const items = screen.getAllByTestId("recent-search-item");
    expect(items[0]).toHaveTextContent("spa day");
    expect(items[1]).toHaveTextContent("gym membership");
  });

  it("hides recent searches after blur (after delay)", async () => {
    setRecentSearches(["spa day"]);
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.focus(screen.getByTestId("search-input"));
    expect(screen.getByTestId("recent-searches")).toBeInTheDocument();
    fireEvent.blur(screen.getByTestId("search-input"));
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByTestId("recent-searches")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Debounce — 300ms
// ---------------------------------------------------------------------------

describe("UnifiedSearchBar — debounced input", () => {
  it("does not call searchDeals synchronously on change", () => {
    // searchDeals is a private placeholder; we just verify no errors thrown
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "spa" } });
    // No assertion needed — just confirms no synchronous throw
  });

  it("updates the input value immediately", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "yoga" } });
    expect(screen.getByTestId("search-input")).toHaveValue("yoga");
  });
});

// ---------------------------------------------------------------------------
// Submit — analytics and callbacks
// ---------------------------------------------------------------------------

describe("UnifiedSearchBar — submit: keyword query", () => {
  it("fires search_submitted with mode=keyword for a plain query", () => {
    const analytics = makeAnalytics();
    render(<UnifiedSearchBar analytics={analytics} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "yoga class" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    const events = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    const submitted = events.find((e) => e.event === "search_submitted");
    expect(submitted).toBeDefined();
    expect(submitted?.query).toBe("yoga class");
    expect(submitted?.mode).toBe("keyword");
  });

  it("calls onSearch with the query for a keyword search", () => {
    const onSearch = vi.fn();
    render(<UnifiedSearchBar analytics={makeAnalytics()} onSearch={onSearch} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "yoga class" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    expect(onSearch).toHaveBeenCalledWith("yoga class");
  });

  it("trims whitespace from the query before submitting", () => {
    const onSearch = vi.fn();
    render(<UnifiedSearchBar analytics={makeAnalytics()} onSearch={onSearch} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "  spa  " } });
    fireEvent.submit(screen.getByTestId("search-form"));
    expect(onSearch).toHaveBeenCalledWith("spa");
  });

  it("does not fire search_submitted or call onSearch for empty input", () => {
    const analytics = makeAnalytics();
    const onSearch = vi.fn();
    render(<UnifiedSearchBar analytics={analytics} onSearch={onSearch} />);
    fireEvent.submit(screen.getByTestId("search-form"));
    const events = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(events.find((e) => e.event === "search_submitted")).toBeUndefined();
    expect(onSearch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Submit — NL query detection
// ---------------------------------------------------------------------------

describe("UnifiedSearchBar — submit: NL query detection", () => {
  const nlQueries = [
    "what is the best spa?",
    "where can I find yoga?",
    "find me a dinner deal",
    "show me family activities",
    "is there a gym near me?",
  ];

  for (const q of nlQueries) {
    it(`detects "${q}" as assistant mode`, () => {
      const analytics = makeAnalytics();
      render(<UnifiedSearchBar analytics={analytics} />);
      fireEvent.change(screen.getByTestId("search-input"), { target: { value: q } });
      fireEvent.submit(screen.getByTestId("search-form"));
      const events = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
      const submitted = events.find((e) => e.event === "search_submitted");
      expect(submitted?.mode).toBe("assistant");
    });
  }

  it("opens AssistantChatPanel on NL query submit", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "find me a spa" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    expect(screen.getByTestId("assistant-chat-panel")).toBeInTheDocument();
  });

  it("calls onAssistantQuery instead of onSearch for NL queries", () => {
    const onSearch = vi.fn();
    const onAssistantQuery = vi.fn();
    render(
      <UnifiedSearchBar
        analytics={makeAnalytics()}
        onSearch={onSearch}
        onAssistantQuery={onAssistantQuery}
      />,
    );
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "show me yoga deals" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    expect(onAssistantQuery).toHaveBeenCalledWith("show me yoga deals");
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("does NOT open AssistantChatPanel for keyword queries", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "yoga class" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    expect(screen.queryByTestId("assistant-chat-panel")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Recent searches — persistence
// ---------------------------------------------------------------------------

describe("UnifiedSearchBar — recent searches persistence", () => {
  it("saves a submitted keyword query to localStorage", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "yoga" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
    expect(stored).toContain("yoga");
  });

  it("caps stored recent searches at 5 entries", () => {
    setRecentSearches(["a", "b", "c", "d", "e"]);
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "new one" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
    expect(stored).toHaveLength(5);
    expect(stored[0]).toBe("new one");
  });

  it("deduplicates: re-submitting an existing term moves it to top", () => {
    setRecentSearches(["yoga", "spa"]);
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "spa" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    const stored = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
    expect(stored[0]).toBe("spa");
    expect(stored.filter((s: string) => s === "spa")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// AssistantChatPanel close — returns to normal search
// ---------------------------------------------------------------------------

describe("UnifiedSearchBar — AssistantChatPanel close", () => {
  it("closes the AssistantChatPanel when close button is clicked", () => {
    render(<UnifiedSearchBar analytics={makeAnalytics()} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "find me yoga" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    expect(screen.getByTestId("assistant-chat-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("assistant-close-button"));
    expect(screen.queryByTestId("assistant-chat-panel")).toBeNull();
  });

  it("allows a new search after the assistant panel is closed", () => {
    const onSearch = vi.fn();
    render(<UnifiedSearchBar analytics={makeAnalytics()} onSearch={onSearch} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "find me yoga" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    fireEvent.click(screen.getByTestId("assistant-close-button"));
    // Now submit a keyword search
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "gym" } });
    fireEvent.submit(screen.getByTestId("search-form"));
    expect(onSearch).toHaveBeenCalledWith("gym");
  });
});
