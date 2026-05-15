import { describe, it, expect } from "vitest";
import type { AnalyticsEvent, EventByName } from "../analytics";

// ---------------------------------------------------------------------------
// Compile-time narrowing helpers — these are type-only assertions.
// The assignability checks confirm that each event member is a valid
// AnalyticsEvent and that EventByName correctly narrows the union.
// ---------------------------------------------------------------------------

function asEvent(e: AnalyticsEvent): AnalyticsEvent {
  return e;
}

describe("AnalyticsEvent union — Phase 0 (Onboarding)", () => {
  it("accepts quiz_started", () => {
    const e = asEvent({ event: "quiz_started" });
    expect(e.event).toBe("quiz_started");
  });

  it("accepts lifestyle_preference_selected", () => {
    const e = asEvent({ event: "lifestyle_preference_selected", preference: "wellness_spa" });
    expect(e.event).toBe("lifestyle_preference_selected");
    if (e.event === "lifestyle_preference_selected") {
      expect(e.preference).toBe("wellness_spa");
    }
  });

  it("accepts quiz_completed with all required fields", () => {
    const e = asEvent({
      event: "quiz_completed",
      selectedPreferences: ["foodie", "fitness"],
      budgetRange: "25_to_50",
      locationRadiusMiles: 10,
    });
    if (e.event === "quiz_completed") {
      expect(e.selectedPreferences).toContain("foodie");
      expect(e.budgetRange).toBe("25_to_50");
      expect(e.locationRadiusMiles).toBe(10);
    }
  });

  it("accepts quiz_skipped", () => {
    const e = asEvent({ event: "quiz_skipped" });
    expect(e.event).toBe("quiz_skipped");
  });
});

describe("AnalyticsEvent union — Phase 1 (Home Screen)", () => {
  it("accepts feed_viewed", () => {
    expect(asEvent({ event: "feed_viewed" }).event).toBe("feed_viewed");
  });

  it("accepts deal_card_impression with required fields", () => {
    const e = asEvent({
      event: "deal_card_impression",
      dealId: "deal-001",
      position: 0,
      category: "spa_wellness",
    });
    if (e.event === "deal_card_impression") {
      expect(e.dealId).toBe("deal-001");
      expect(e.position).toBe(0);
      expect(e.score).toBeUndefined();
    }
  });

  it("accepts deal_card_impression with optional AI fields", () => {
    const e = asEvent({
      event: "deal_card_impression",
      dealId: "deal-001",
      position: 2,
      category: "fitness",
      score: 0.91,
      reason: "You booked a gym day last month",
    });
    if (e.event === "deal_card_impression") {
      expect(e.score).toBe(0.91);
      expect(e.reason).toBeDefined();
    }
  });

  it("accepts deal_card_tapped", () => {
    const e = asEvent({ event: "deal_card_tapped", dealId: "d1", position: 1, category: "food_drink" });
    expect(e.event).toBe("deal_card_tapped");
  });

  it("accepts feed_scrolled", () => {
    const e = asEvent({ event: "feed_scrolled", depth: 10 });
    if (e.event === "feed_scrolled") expect(e.depth).toBe(10);
  });
});

describe("AnalyticsEvent union — Phase 2 (Search & Discovery)", () => {
  it("accepts search_bar_opened", () => {
    expect(asEvent({ event: "search_bar_opened" }).event).toBe("search_bar_opened");
  });

  it("accepts search_submitted with mode=keyword", () => {
    const e = asEvent({ event: "search_submitted", query: "spa day", mode: "keyword" });
    if (e.event === "search_submitted") {
      expect(e.mode).toBe("keyword");
    }
  });

  it("accepts search_filter_changed", () => {
    const e = asEvent({ event: "search_filter_changed", filterKey: "radius", filterValue: 10 });
    if (e.event === "search_filter_changed") {
      expect(e.filterKey).toBe("radius");
    }
  });

  it("accepts assistant_query_submitted", () => {
    const e = asEvent({ event: "assistant_query_submitted", query: "date night under $80", resultCount: 5 });
    if (e.event === "assistant_query_submitted") {
      expect(e.resultCount).toBe(5);
    }
  });

  it("accepts assistant_result_action_taken", () => {
    const e = asEvent({ event: "assistant_result_action_taken", dealId: "d1", action: "book", position: 0 });
    if (e.event === "assistant_result_action_taken") {
      expect(e.action).toBe("book");
    }
  });
});

describe("AnalyticsEvent union — Phase 3 (Deal Detail)", () => {
  it("accepts deal_viewed", () => {
    const e = asEvent({ event: "deal_viewed", dealId: "d1", category: "activities" });
    expect(e.event).toBe("deal_viewed");
  });

  it("accepts hero_image_swiped", () => {
    const e = asEvent({ event: "hero_image_swiped", dealId: "d1", imageIndex: 2 });
    if (e.event === "hero_image_swiped") expect(e.imageIndex).toBe(2);
  });

  it("accepts fine_print_expanded", () => {
    expect(asEvent({ event: "fine_print_expanded", dealId: "d1" }).event).toBe("fine_print_expanded");
  });

  it("accepts pricing_breakdown_expanded", () => {
    expect(asEvent({ event: "pricing_breakdown_expanded", dealId: "d1" }).event).toBe("pricing_breakdown_expanded");
  });

  it("accepts refund_policy_expanded", () => {
    expect(asEvent({ event: "refund_policy_expanded", dealId: "d1" }).event).toBe("refund_policy_expanded");
  });

  it("accepts deal_saved", () => {
    expect(asEvent({ event: "deal_saved", dealId: "d1" }).event).toBe("deal_saved");
  });

  it("accepts buy_tapped", () => {
    const e = asEvent({ event: "buy_tapped", dealId: "d1", totalCents: 5623 });
    if (e.event === "buy_tapped") expect(e.totalCents).toBe(5623);
  });

  it("accepts bnpl_hint_tapped", () => {
    const e = asEvent({ event: "bnpl_hint_tapped", dealId: "d1", provider: "klarna", installments: 4, installmentAmountCents: 1406 });
    if (e.event === "bnpl_hint_tapped") expect(e.provider).toBe("klarna");
  });
});

describe("AnalyticsEvent union — Phase 4 (Checkout)", () => {
  it("accepts checkout_opened", () => {
    expect(asEvent({ event: "checkout_opened", dealId: "d1" }).event).toBe("checkout_opened");
  });

  it("accepts slot_selected", () => {
    const e = asEvent({ event: "slot_selected", dealId: "d1", slotIso: "2026-06-15T14:00:00Z" });
    if (e.event === "slot_selected") expect(e.slotIso).toContain("2026");
  });

  it("accepts payment_method_selected", () => {
    const e = asEvent({ event: "payment_method_selected", method: "apple_pay" });
    if (e.event === "payment_method_selected") expect(e.method).toBe("apple_pay");
  });

  it("accepts recurring_charge_acknowledged", () => {
    expect(asEvent({ event: "recurring_charge_acknowledged", dealId: "d1" }).event).toBe("recurring_charge_acknowledged");
  });

  it("accepts purchase_confirmed with all fields", () => {
    const e = asEvent({
      event: "purchase_confirmed",
      dealId: "d1",
      orderId: "order-abc",
      totalCents: 5623,
      paymentMethod: "klarna",
    });
    if (e.event === "purchase_confirmed") {
      expect(e.orderId).toBe("order-abc");
      expect(e.paymentMethod).toBe("klarna");
    }
  });

  it("accepts three_ds_challenge_started", () => {
    expect(asEvent({ event: "three_ds_challenge_started", dealId: "d1" }).event).toBe("three_ds_challenge_started");
  });

  it("accepts three_ds_challenge_succeeded", () => {
    expect(asEvent({ event: "three_ds_challenge_succeeded", dealId: "d1" }).event).toBe("three_ds_challenge_succeeded");
  });

  it("accepts three_ds_challenge_failed", () => {
    expect(asEvent({ event: "three_ds_challenge_failed", dealId: "d1" }).event).toBe("three_ds_challenge_failed");
  });
});

describe("AnalyticsEvent union — Phase 5 (Booking Confirmation)", () => {
  it("accepts booking_confirmation_viewed", () => {
    const e = asEvent({ event: "booking_confirmation_viewed", dealId: "d1", orderId: "order-abc" });
    if (e.event === "booking_confirmation_viewed") expect(e.orderId).toBe("order-abc");
  });

  it("accepts add_to_calendar_tapped", () => {
    const e = asEvent({ event: "add_to_calendar_tapped", orderId: "order-abc" });
    if (e.event === "add_to_calendar_tapped") expect(e.orderId).toBe("order-abc");
  });
});

describe("AnalyticsEvent union — Phase 6 (My Groupons / Post-Purchase)", () => {
  it("accepts my_groupons_viewed", () => {
    expect(asEvent({ event: "my_groupons_viewed" }).event).toBe("my_groupons_viewed");
  });

  it("accepts voucher_viewed", () => {
    const e = asEvent({ event: "voucher_viewed", orderId: "order-abc", dealId: "d1" });
    if (e.event === "voucher_viewed") expect(e.orderId).toBe("order-abc");
  });

  it("accepts post_purchase_help_opened from confirmation screen", () => {
    const e = asEvent({ event: "post_purchase_help_opened", orderId: "o1", surface: "confirmation_screen" });
    if (e.event === "post_purchase_help_opened") expect(e.surface).toBe("confirmation_screen");
  });

  it("accepts post_purchase_help_opened from my_groupons", () => {
    const e = asEvent({ event: "post_purchase_help_opened", orderId: "o1", surface: "my_groupons" });
    if (e.event === "post_purchase_help_opened") expect(e.surface).toBe("my_groupons");
  });

  it("accepts post_purchase_help_opened from voucher_card", () => {
    const e = asEvent({ event: "post_purchase_help_opened", orderId: "o1", surface: "voucher_card" });
    if (e.event === "post_purchase_help_opened") expect(e.surface).toBe("voucher_card");
  });

  it("accepts support_chat_opened", () => {
    expect(asEvent({ event: "support_chat_opened", orderId: "o1" }).event).toBe("support_chat_opened");
  });

  it("accepts support_escalated_to_human without issueCategory", () => {
    const e = asEvent({ event: "support_escalated_to_human", orderId: "o1" });
    if (e.event === "support_escalated_to_human") expect(e.issueCategory).toBeUndefined();
  });

  it("accepts support_escalated_to_human with issueCategory", () => {
    const e = asEvent({ event: "support_escalated_to_human", orderId: "o1", issueCategory: "refund_request" });
    if (e.event === "support_escalated_to_human") expect(e.issueCategory).toBe("refund_request");
  });

  it("accepts self_serve_refund_started", () => {
    const e = asEvent({ event: "self_serve_refund_started", orderId: "o1", dealId: "d1" });
    expect(e.event).toBe("self_serve_refund_started");
  });

  it("accepts self_serve_refund_completed", () => {
    const e = asEvent({ event: "self_serve_refund_completed", orderId: "o1", refundAmountCents: 4999 });
    if (e.event === "self_serve_refund_completed") expect(e.refundAmountCents).toBe(4999);
  });
});

describe("EventByName utility type", () => {
  it("narrows to the correct payload shape", () => {
    type PurchaseEvent = EventByName<"purchase_confirmed">;
    const e: PurchaseEvent = {
      event: "purchase_confirmed",
      dealId: "d1",
      orderId: "order-abc",
      totalCents: 5000,
      paymentMethod: "apple_pay",
    };
    expect(e.event).toBe("purchase_confirmed");
    expect(e.paymentMethod).toBe("apple_pay");
  });
});
