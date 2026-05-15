import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PostPurchaseHelpEntry } from "../PostPurchaseHelpEntry";
import type { AnalyticsClient } from "../../analytics/client";
import type { RefundPolicy } from "../../types/deal";
import type { HelpSurface } from "../../types/analytics";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

const refundPolicy: RefundPolicy = {
  isRefundable: true,
  windowAmount: 7,
  windowUnit: "days",
  plainTextSummary: "Free cancellation within 7 days",
  deadlineMs: new Date("2026-05-18").getTime(),
};

function renderEntry(overrides: Partial<React.ComponentProps<typeof PostPurchaseHelpEntry>> = {}) {
  const props = {
    orderId: "ORDER-001",
    dealId: "deal-001",
    refundPolicy,
    surface: "my_groupons" as HelpSurface,
    analytics: makeAnalytics(),
    onActionSelected: vi.fn(),
    ...overrides,
  };
  render(<PostPurchaseHelpEntry {...props} />);
  return props;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("PostPurchaseHelpEntry — rendering", () => {
  it("renders the container", () => {
    renderEntry();
    expect(screen.getByTestId("post-purchase-help-entry")).toBeInTheDocument();
  });

  it("renders the Need help? CTA button", () => {
    renderEntry();
    expect(screen.getByTestId("need-help-cta")).toBeInTheDocument();
  });

  it("CTA contains accessible text", () => {
    renderEntry();
    expect(screen.getByTestId("need-help-cta")).toHaveTextContent(/need help/i);
  });

  it("sets data-surface attribute to the provided surface", () => {
    renderEntry({ surface: "confirmation_screen" });
    expect(screen.getByTestId("post-purchase-help-entry")).toHaveAttribute(
      "data-surface",
      "confirmation_screen",
    );
  });

  it("bottom sheet is not visible before CTA is tapped", () => {
    renderEntry();
    expect(screen.queryByTestId("support-bottom-sheet")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Surface variants
// ---------------------------------------------------------------------------

describe("PostPurchaseHelpEntry — surface variants", () => {
  const surfaces: HelpSurface[] = ["confirmation_screen", "my_groupons", "voucher_card"];

  for (const surface of surfaces) {
    it(`renders on surface: ${surface}`, () => {
      renderEntry({ surface });
      expect(screen.getByTestId("post-purchase-help-entry")).toHaveAttribute("data-surface", surface);
    });
  }
});

// ---------------------------------------------------------------------------
// Interaction — open sheet
// ---------------------------------------------------------------------------

describe("PostPurchaseHelpEntry — opening the sheet", () => {
  it("opens the SupportBottomSheet when CTA is tapped", () => {
    renderEntry();
    fireEvent.click(screen.getByTestId("need-help-cta"));
    expect(screen.getByTestId("support-bottom-sheet")).toBeInTheDocument();
  });

  it("sheet shows the menu on open", () => {
    renderEntry();
    fireEvent.click(screen.getByTestId("need-help-cta"));
    expect(screen.getByTestId("sheet-menu")).toBeInTheDocument();
  });

  it("closes the sheet when close button is tapped", () => {
    renderEntry();
    fireEvent.click(screen.getByTestId("need-help-cta"));
    fireEvent.click(screen.getByTestId("sheet-close-button"));
    expect(screen.queryByTestId("support-bottom-sheet")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("PostPurchaseHelpEntry — analytics", () => {
  it("fires post_purchase_help_opened when CTA is tapped", () => {
    const analytics = makeAnalytics();
    renderEntry({ analytics, surface: "my_groupons" });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "post_purchase_help_opened",
      orderId: "ORDER-001",
      surface: "my_groupons",
    });
  });

  it("fires post_purchase_help_opened with the correct surface for each variant", () => {
    const surfaces: HelpSurface[] = ["confirmation_screen", "my_groupons", "voucher_card"];
    for (const surface of surfaces) {
      const analytics = makeAnalytics();
      const { unmount } = render(
        <PostPurchaseHelpEntry
          orderId="ORDER-001"
          dealId="deal-001"
          refundPolicy={refundPolicy}
          surface={surface}
          analytics={analytics}
        />,
      );
      fireEvent.click(screen.getByTestId("need-help-cta"));
      expect(analytics.track).toHaveBeenCalledWith(
        expect.objectContaining({ event: "post_purchase_help_opened", surface }),
      );
      unmount();
    }
  });

  it("fires post_purchase_help_opened exactly once per tap", () => {
    const analytics = makeAnalytics();
    renderEntry({ analytics });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    const helpOpenedCalls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => (args[0] as { event: string }).event === "post_purchase_help_opened",
    );
    expect(helpOpenedCalls).toHaveLength(1);
  });

  it("fires support_action_selected via sheet when action is chosen", () => {
    const analytics = makeAnalytics();
    renderEntry({ analytics });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    fireEvent.click(screen.getByTestId("action-contact-support"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "support_action_selected",
      orderId: "ORDER-001",
      action: "contact_support",
    });
  });
});

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

describe("PostPurchaseHelpEntry — callbacks", () => {
  it("calls onActionSelected when an action is selected in the sheet", () => {
    const onActionSelected = vi.fn();
    renderEntry({ onActionSelected });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(onActionSelected).toHaveBeenCalledWith("get_a_refund");
  });

  it("does not throw when onActionSelected is not provided", () => {
    renderEntry({ onActionSelected: undefined });
    fireEvent.click(screen.getByTestId("need-help-cta"));
    expect(() => fireEvent.click(screen.getByTestId("action-report-problem"))).not.toThrow();
  });
});
