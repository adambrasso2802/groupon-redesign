import React, { useEffect, useMemo, useState } from "react";
import type { AnalyticsClient } from "../analytics/client";
import type {
  NotificationCategory,
  NotificationPreferences,
} from "../types/preferences";

export const NOTIFICATION_PREFS_STORAGE_KEY = "groupon_notification_prefs";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  allPaused: false,
  categories: {
    deal_alerts: false,
    booking_reminders: true,
    promotional_emails: false,
    app_push: true,
  },
};

interface CategoryMeta {
  id: NotificationCategory;
  label: string;
  description: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: "deal_alerts",
    label: "Deal alerts",
    description: "New nearby deals matching your interests",
  },
  {
    id: "booking_reminders",
    label: "Booking reminders",
    description: "Reminders for upcoming appointments and redemptions",
  },
  {
    id: "promotional_emails",
    label: "Promotional emails",
    description: "Weekly digests and limited-time offers",
  },
  {
    id: "app_push",
    label: "App push notifications",
    description: "Real-time updates on your device",
  },
];

/** Mock last-sent timestamps per category — replaced by real data in production. */
const DEFAULT_LAST_SENT: Record<NotificationCategory, string> = {
  deal_alerts: "2026-05-14T09:00:00Z",
  booking_reminders: "2026-05-13T17:30:00Z",
  promotional_emails: "2026-05-12T08:00:00Z",
  app_push: "2026-05-15T07:15:00Z",
};

function loadPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      allPaused: parsed.allPaused ?? DEFAULT_NOTIFICATION_PREFERENCES.allPaused,
      categories: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.categories,
        ...(parsed.categories ?? {}),
      },
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

function savePreferences(prefs: NotificationPreferences): void {
  try {
    localStorage.setItem(NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* swallow storage errors — UI state remains authoritative */
  }
}

function formatRelative(iso: string, now: Date): string {
  const ms = now.getTime() - new Date(iso).getTime();
  if (ms < 0) return "scheduled";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export interface NotificationPreferenceCenterProps {
  analytics: AnalyticsClient;
  /** Override the mock last-sent map (useful in tests / production) */
  lastSentByCategory?: Record<NotificationCategory, string>;
  onClose?: () => void;
}

export function NotificationPreferenceCenter({
  analytics,
  lastSentByCategory,
  onClose,
}: NotificationPreferenceCenterProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => loadPreferences());

  useEffect(() => {
    analytics.track({ event: "notification_preferences_viewed" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastSent = lastSentByCategory ?? DEFAULT_LAST_SENT;
  const now = useMemo(() => new Date(), []);

  function handleCategoryToggle(category: NotificationCategory) {
    const next: NotificationPreferences = {
      ...prefs,
      categories: {
        ...prefs.categories,
        [category]: !prefs.categories[category],
      },
    };
    setPrefs(next);
    savePreferences(next);
    analytics.track({
      event: "notification_preference_changed",
      category,
      enabled: next.categories[category],
    });
  }

  function handlePauseAllToggle() {
    const nextPaused = !prefs.allPaused;
    const next: NotificationPreferences = { ...prefs, allPaused: nextPaused };
    setPrefs(next);
    savePreferences(next);
    analytics.track({ event: "all_notifications_paused", paused: nextPaused });
  }

  return (
    <section
      data-testid="notification-preference-center"
      aria-label="Notification preferences"
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: "20px 16px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <header
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <h1
          data-testid="notification-prefs-heading"
          style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}
        >
          Notification preferences
        </h1>
        {onClose && (
          <button
            data-testid="notification-prefs-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </header>

      <div
        data-testid="pause-all-row"
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
            Pause all notifications
          </p>
          <p
            data-testid="pause-all-description"
            style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}
          >
            {prefs.allPaused
              ? "All notifications are paused. Individual settings are ignored."
              : "Override every category below with a single switch."}
          </p>
        </div>
        <Toggle
          testId="pause-all-toggle"
          ariaLabel="Pause all notifications"
          checked={prefs.allPaused}
          onChange={handlePauseAllToggle}
        />
      </div>

      <ul
        data-testid="notification-category-list"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          opacity: prefs.allPaused ? 0.55 : 1,
        }}
      >
        {CATEGORIES.map((cat) => {
          const enabled = prefs.categories[cat.id];
          const effectivelyOn = enabled && !prefs.allPaused;
          return (
            <li
              key={cat.id}
              data-testid={`category-row-${cat.id}`}
              data-enabled={enabled ? "true" : "false"}
              data-effective={effectivelyOn ? "on" : "off"}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>
                  {cat.label}
                </p>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}>
                  {cat.description}
                </p>
                <p
                  data-testid={`category-last-sent-${cat.id}`}
                  style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}
                >
                  Last sent {formatRelative(lastSent[cat.id], now)}
                </p>
              </div>
              <Toggle
                testId={`category-toggle-${cat.id}`}
                ariaLabel={`Toggle ${cat.label}`}
                checked={enabled}
                disabled={prefs.allPaused}
                onChange={() => handleCategoryToggle(cat.id)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface ToggleProps {
  testId: string;
  ariaLabel: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

function Toggle({ testId, ariaLabel, checked, disabled = false, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-testid={testId}
      data-checked={checked ? "true" : "false"}
      onClick={() => {
        if (disabled) return;
        onChange();
      }}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        border: "none",
        padding: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "#16a34a" : "#d1d5db",
        position: "relative",
        flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
        transition: "background 0.15s ease",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "block",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          transform: checked ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.15s ease",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}
