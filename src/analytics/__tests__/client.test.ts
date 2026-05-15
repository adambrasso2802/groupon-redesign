import { describe, it, expect, vi } from "vitest";
import { createAnalyticsClient } from "../client";
import type { AnalyticsClient } from "../client";
import type { AnalyticsEvent } from "../../types/analytics";

describe("createAnalyticsClient", () => {
  it("returns an object with a track function", () => {
    const client = createAnalyticsClient();
    expect(typeof client.track).toBe("function");
  });

  it("satisfies the AnalyticsClient interface", () => {
    const client: AnalyticsClient = createAnalyticsClient();
    expect(client).toBeDefined();
  });

  it("calls console.log when track is invoked", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const client = createAnalyticsClient();
    const event: AnalyticsEvent = { event: "deal_viewed", dealId: "d1", category: "spa_wellness" };

    client.track(event);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith("[analytics]", "deal_viewed", event);
    spy.mockRestore();
  });

  it("includes the full event payload in the log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const client = createAnalyticsClient();
    const event: AnalyticsEvent = {
      event: "purchase_confirmed",
      dealId: "deal-001",
      orderId: "order-abc",
      totalCents: 5623,
      paymentMethod: "apple_pay",
    };

    client.track(event);

    const [, , loggedPayload] = spy.mock.calls[0] as [string, string, AnalyticsEvent];
    expect(loggedPayload).toEqual(event);
    spy.mockRestore();
  });

  it("accepts every phase-0 onboarding event without throwing", () => {
    const client = createAnalyticsClient();
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    const events: AnalyticsEvent[] = [
      { event: "quiz_started" },
      { event: "lifestyle_preference_selected", preference: "fitness" },
      { event: "quiz_completed", selectedPreferences: ["fitness", "parent"], budgetRange: "25_to_50", locationRadiusMiles: 10 },
      { event: "quiz_skipped" },
    ];

    events.forEach((e) => expect(() => client.track(e)).not.toThrow());
    expect(spy).toHaveBeenCalledTimes(events.length);
    spy.mockRestore();
  });

  it("accepts events from every phase without throwing", () => {
    const client = createAnalyticsClient();
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    const events: AnalyticsEvent[] = [
      { event: "feed_viewed" },
      { event: "search_submitted", query: "spa", mode: "keyword" },
      { event: "deal_card_tapped", dealId: "d1", position: 0, category: "spa_wellness" },
      { event: "checkout_opened", dealId: "d1" },
      { event: "booking_confirmation_viewed", dealId: "d1", orderId: "o1" },
      { event: "post_purchase_help_opened", orderId: "o1", surface: "my_groupons" },
      { event: "support_escalated_to_human", orderId: "o1" },
    ];

    events.forEach((e) => expect(() => client.track(e)).not.toThrow());
    expect(spy).toHaveBeenCalledTimes(events.length);
    spy.mockRestore();
  });
});
