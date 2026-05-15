import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  NotificationPreferenceCenter,
  NOTIFICATION_PREFS_STORAGE_KEY,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "../NotificationPreferenceCenter";
import type { AnalyticsClient } from "../../analytics/client";
import type { NotificationPreferences } from "../../types/preferences";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

function renderCenter(
  overrides: Partial<React.ComponentProps<typeof NotificationPreferenceCenter>> = {},
) {
  const props = {
    analytics: makeAnalytics(),
    ...overrides,
  };
  render(<NotificationPreferenceCenter {...props} />);
  return props;
}

function readStorage(): NotificationPreferences | null {
  const raw = localStorage.getItem(NOTIFICATION_PREFS_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as NotificationPreferences) : null;
}

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("NotificationPreferenceCenter — rendering", () => {
  it("renders the screen container", () => {
    renderCenter();
    expect(screen.getByTestId("notification-preference-center")).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderCenter();
    expect(screen.getByRole("heading", { name: /notification preferences/i })).toBeInTheDocument();
  });

  it("renders the master Pause all row", () => {
    renderCenter();
    expect(screen.getByTestId("pause-all-row")).toBeInTheDocument();
    expect(screen.getByTestId("pause-all-toggle")).toBeInTheDocument();
  });

  it("renders one row per category", () => {
    renderCenter();
    expect(screen.getByTestId("category-row-deal_alerts")).toBeInTheDocument();
    expect(screen.getByTestId("category-row-booking_reminders")).toBeInTheDocument();
    expect(screen.getByTestId("category-row-promotional_emails")).toBeInTheDocument();
    expect(screen.getByTestId("category-row-app_push")).toBeInTheDocument();
  });

  it("renders last-sent timestamp text per category", () => {
    renderCenter();
    expect(screen.getByTestId("category-last-sent-deal_alerts")).toBeInTheDocument();
    expect(screen.getByTestId("category-last-sent-booking_reminders")).toBeInTheDocument();
    expect(screen.getByTestId("category-last-sent-promotional_emails")).toBeInTheDocument();
    expect(screen.getByTestId("category-last-sent-app_push")).toBeInTheDocument();
  });

  it("renders a close button only when onClose is provided", () => {
    const { rerender } = render(
      <NotificationPreferenceCenter analytics={makeAnalytics()} />,
    );
    expect(screen.queryByTestId("notification-prefs-close")).toBeNull();
    rerender(
      <NotificationPreferenceCenter analytics={makeAnalytics()} onClose={vi.fn()} />,
    );
    expect(screen.getByTestId("notification-prefs-close")).toBeInTheDocument();
  });

  it("calls onClose when the close button is tapped", () => {
    const onClose = vi.fn();
    renderCenter({ onClose });
    fireEvent.click(screen.getByTestId("notification-prefs-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

describe("NotificationPreferenceCenter — defaults", () => {
  it("defaults promotional channels off and transactional on", () => {
    renderCenter();
    expect(screen.getByTestId("category-toggle-promotional_emails")).toHaveAttribute(
      "data-checked",
      "false",
    );
    expect(screen.getByTestId("category-toggle-deal_alerts")).toHaveAttribute(
      "data-checked",
      "false",
    );
    expect(screen.getByTestId("category-toggle-booking_reminders")).toHaveAttribute(
      "data-checked",
      "true",
    );
    expect(screen.getByTestId("category-toggle-app_push")).toHaveAttribute(
      "data-checked",
      "true",
    );
  });

  it("defaults the master Pause all toggle to off", () => {
    renderCenter();
    expect(screen.getByTestId("pause-all-toggle")).toHaveAttribute("data-checked", "false");
  });

  it("DEFAULT_NOTIFICATION_PREFERENCES matches the documented defaults", () => {
    expect(DEFAULT_NOTIFICATION_PREFERENCES).toEqual({
      allPaused: false,
      categories: {
        deal_alerts: false,
        booking_reminders: true,
        promotional_emails: false,
        app_push: true,
      },
    });
  });
});

// ---------------------------------------------------------------------------
// Category toggles
// ---------------------------------------------------------------------------

describe("NotificationPreferenceCenter — category toggles", () => {
  it("flips the toggle state when a category is tapped", () => {
    renderCenter();
    const toggle = screen.getByTestId("category-toggle-promotional_emails");
    expect(toggle).toHaveAttribute("data-checked", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-checked", "true");
  });

  it("flips an already-on toggle to off", () => {
    renderCenter();
    const toggle = screen.getByTestId("category-toggle-booking_reminders");
    expect(toggle).toHaveAttribute("data-checked", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-checked", "false");
  });

  it("does not flip categories when the master pause is engaged", () => {
    renderCenter();
    fireEvent.click(screen.getByTestId("pause-all-toggle"));
    const toggle = screen.getByTestId("category-toggle-deal_alerts");
    expect(toggle).toHaveAttribute("data-checked", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-checked", "false");
  });
});

// ---------------------------------------------------------------------------
// Master pause
// ---------------------------------------------------------------------------

describe("NotificationPreferenceCenter — master pause", () => {
  it("flipping pause-all overrides the effective state of every category", () => {
    renderCenter();
    expect(screen.getByTestId("category-row-booking_reminders")).toHaveAttribute(
      "data-effective",
      "on",
    );
    fireEvent.click(screen.getByTestId("pause-all-toggle"));
    expect(screen.getByTestId("category-row-booking_reminders")).toHaveAttribute(
      "data-effective",
      "off",
    );
    expect(screen.getByTestId("category-row-app_push")).toHaveAttribute(
      "data-effective",
      "off",
    );
  });

  it("category enabled state is preserved when master pause is toggled off again", () => {
    renderCenter();
    fireEvent.click(screen.getByTestId("category-toggle-promotional_emails"));
    expect(screen.getByTestId("category-toggle-promotional_emails")).toHaveAttribute(
      "data-checked",
      "true",
    );
    fireEvent.click(screen.getByTestId("pause-all-toggle"));
    fireEvent.click(screen.getByTestId("pause-all-toggle"));
    expect(screen.getByTestId("category-toggle-promotional_emails")).toHaveAttribute(
      "data-checked",
      "true",
    );
  });
});

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

describe("NotificationPreferenceCenter — localStorage", () => {
  it("persists category changes to groupon_notification_prefs", () => {
    renderCenter();
    fireEvent.click(screen.getByTestId("category-toggle-promotional_emails"));
    const saved = readStorage();
    expect(saved).not.toBeNull();
    expect(saved!.categories.promotional_emails).toBe(true);
  });

  it("persists master pause changes to groupon_notification_prefs", () => {
    renderCenter();
    fireEvent.click(screen.getByTestId("pause-all-toggle"));
    expect(readStorage()!.allPaused).toBe(true);
  });

  it("loads previously saved preferences from localStorage on mount", () => {
    const saved: NotificationPreferences = {
      allPaused: true,
      categories: {
        deal_alerts: true,
        booking_reminders: false,
        promotional_emails: true,
        app_push: false,
      },
    };
    localStorage.setItem(NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(saved));
    renderCenter();
    expect(screen.getByTestId("pause-all-toggle")).toHaveAttribute("data-checked", "true");
    expect(screen.getByTestId("category-toggle-deal_alerts")).toHaveAttribute(
      "data-checked",
      "true",
    );
    expect(screen.getByTestId("category-toggle-booking_reminders")).toHaveAttribute(
      "data-checked",
      "false",
    );
  });

  it("falls back to defaults when storage is malformed", () => {
    localStorage.setItem(NOTIFICATION_PREFS_STORAGE_KEY, "{not-json");
    renderCenter();
    expect(screen.getByTestId("pause-all-toggle")).toHaveAttribute("data-checked", "false");
    expect(screen.getByTestId("category-toggle-booking_reminders")).toHaveAttribute(
      "data-checked",
      "true",
    );
  });

  it("merges partial saved data with defaults for missing categories", () => {
    localStorage.setItem(
      NOTIFICATION_PREFS_STORAGE_KEY,
      JSON.stringify({ categories: { promotional_emails: true } }),
    );
    renderCenter();
    expect(screen.getByTestId("category-toggle-promotional_emails")).toHaveAttribute(
      "data-checked",
      "true",
    );
    expect(screen.getByTestId("category-toggle-booking_reminders")).toHaveAttribute(
      "data-checked",
      "true",
    );
  });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("NotificationPreferenceCenter — analytics", () => {
  it("fires notification_preferences_viewed on mount", () => {
    const analytics = makeAnalytics();
    renderCenter({ analytics });
    expect(analytics.track).toHaveBeenCalledWith({ event: "notification_preferences_viewed" });
  });

  it("fires notification_preferences_viewed exactly once", () => {
    const analytics = makeAnalytics();
    renderCenter({ analytics });
    const calls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => (args[0] as { event: string }).event === "notification_preferences_viewed",
    );
    expect(calls).toHaveLength(1);
  });

  it("fires notification_preference_changed with category and new enabled=true on activation", () => {
    const analytics = makeAnalytics();
    renderCenter({ analytics });
    fireEvent.click(screen.getByTestId("category-toggle-promotional_emails"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "notification_preference_changed",
      category: "promotional_emails",
      enabled: true,
    });
  });

  it("fires notification_preference_changed with enabled=false on deactivation", () => {
    const analytics = makeAnalytics();
    renderCenter({ analytics });
    fireEvent.click(screen.getByTestId("category-toggle-booking_reminders"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "notification_preference_changed",
      category: "booking_reminders",
      enabled: false,
    });
  });

  it("fires all_notifications_paused with paused=true when master toggle is engaged", () => {
    const analytics = makeAnalytics();
    renderCenter({ analytics });
    fireEvent.click(screen.getByTestId("pause-all-toggle"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "all_notifications_paused",
      paused: true,
    });
  });

  it("fires all_notifications_paused with paused=false when master toggle is disengaged", () => {
    const analytics = makeAnalytics();
    renderCenter({ analytics });
    fireEvent.click(screen.getByTestId("pause-all-toggle"));
    fireEvent.click(screen.getByTestId("pause-all-toggle"));
    expect(analytics.track).toHaveBeenLastCalledWith({
      event: "all_notifications_paused",
      paused: false,
    });
  });

  it("does not fire notification_preference_changed when toggle is blocked by master pause", () => {
    const analytics = makeAnalytics();
    renderCenter({ analytics });
    fireEvent.click(screen.getByTestId("pause-all-toggle"));
    (analytics.track as ReturnType<typeof vi.fn>).mockClear();
    fireEvent.click(screen.getByTestId("category-toggle-deal_alerts"));
    expect(analytics.track).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Last-sent rendering
// ---------------------------------------------------------------------------

describe("NotificationPreferenceCenter — last sent", () => {
  it("uses provided lastSentByCategory override when supplied", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    renderCenter({
      lastSentByCategory: {
        deal_alerts: fiveMinAgo,
        booking_reminders: fiveMinAgo,
        promotional_emails: fiveMinAgo,
        app_push: fiveMinAgo,
      },
    });
    expect(screen.getByTestId("category-last-sent-deal_alerts")).toHaveTextContent("5m ago");
  });
});
