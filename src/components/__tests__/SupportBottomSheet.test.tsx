import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SupportBottomSheet, formatRefundDeadline } from "../SupportBottomSheet";
import type { AnalyticsClient } from "../../analytics/client";
import type { RefundPolicy } from "../../types/deal";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

const refundablePolicy: RefundPolicy = {
  isRefundable: true,
  windowAmount: 7,
  windowUnit: "days",
  plainTextSummary: "Free cancellation within 7 days of purchase",
  deadlineMs: new Date("2026-05-18").getTime(),
};

const nonRefundablePolicy: RefundPolicy = {
  isRefundable: false,
  windowAmount: 0,
  windowUnit: "days",
  plainTextSummary: "Non-refundable",
};

function renderSheet(overrides: Partial<React.ComponentProps<typeof SupportBottomSheet>> = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    orderId: "ORDER-001",
    refundPolicy: refundablePolicy,
    analytics: makeAnalytics(),
    onActionSelected: vi.fn(),
    ...overrides,
  };
  render(<SupportBottomSheet {...props} />);
  return props;
}

// ---------------------------------------------------------------------------
// formatRefundDeadline utility
// ---------------------------------------------------------------------------

describe("formatRefundDeadline", () => {
  it("formats a known date to readable form", () => {
    const ms = new Date("2026-05-18").getTime();
    expect(formatRefundDeadline(ms)).toBe("18 May");
  });

  it("formats a different date correctly", () => {
    const ms = new Date("2026-12-25").getTime();
    expect(formatRefundDeadline(ms)).toBe("25 December");
  });
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("SupportBottomSheet — rendering", () => {
  it("renders when isOpen is true", () => {
    renderSheet();
    expect(screen.getByTestId("support-bottom-sheet")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderSheet({ isOpen: false });
    expect(screen.queryByTestId("support-bottom-sheet")).toBeNull();
  });

  it("shows the menu by default", () => {
    renderSheet();
    expect(screen.getByTestId("sheet-menu")).toBeInTheDocument();
  });

  it("shows all three action options in menu", () => {
    renderSheet();
    expect(screen.getByTestId("action-get-refund")).toBeInTheDocument();
    expect(screen.getByTestId("action-contact-support")).toBeInTheDocument();
    expect(screen.getByTestId("action-report-problem")).toBeInTheDocument();
  });

  it("has accessible role=dialog", () => {
    renderSheet();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders close button", () => {
    renderSheet();
    expect(screen.getByTestId("sheet-close-button")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Navigation — refund view
// ---------------------------------------------------------------------------

describe("SupportBottomSheet — refund view", () => {
  it("shows refund view when Get a refund is tapped", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(screen.getByTestId("sheet-refund-view")).toBeInTheDocument();
  });

  it("displays the exact deadline date", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(screen.getByTestId("refund-deadline-label")).toHaveTextContent("You can refund this until 18 May");
  });

  it("shows plain text summary when no deadlineMs is set", () => {
    const policy: RefundPolicy = { ...refundablePolicy, deadlineMs: undefined };
    renderSheet({ refundPolicy: policy });
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(screen.getByTestId("refund-deadline-label")).toHaveTextContent(policy.plainTextSummary);
  });

  it("shows non-refundable message for non-refundable policy", () => {
    renderSheet({ refundPolicy: nonRefundablePolicy });
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(screen.getByTestId("no-refund-label")).toBeInTheDocument();
    expect(screen.queryByTestId("refund-deadline-label")).toBeNull();
  });

  it("shows the request refund button for refundable orders", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(screen.getByTestId("request-refund-button")).toBeInTheDocument();
  });

  it("back button returns to menu", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-get-refund"));
    fireEvent.click(screen.getByTestId("sheet-back-button"));
    expect(screen.getByTestId("sheet-menu")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Navigation — chat view
// ---------------------------------------------------------------------------

describe("SupportBottomSheet — chat view", () => {
  it("shows chat view when Contact support is tapped", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-contact-support"));
    expect(screen.getByTestId("sheet-chat-view")).toBeInTheDocument();
  });

  it("shows initial support message", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-contact-support"));
    expect(screen.getByTestId("chat-message-support")).toBeInTheDocument();
  });

  it("renders chat input and send button", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-contact-support"));
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    expect(screen.getByTestId("chat-send-button")).toBeInTheDocument();
  });

  it("sends a message when send button is clicked", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-contact-support"));
    const input = screen.getByTestId("chat-input");
    fireEvent.change(input, { target: { value: "I need help with my order" } });
    fireEvent.click(screen.getByTestId("chat-send-button"));
    expect(screen.getByTestId("chat-message-user")).toHaveTextContent("I need help with my order");
  });

  it("clears input after sending", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-contact-support"));
    const input = screen.getByTestId("chat-input");
    fireEvent.change(input, { target: { value: "Help!" } });
    fireEvent.click(screen.getByTestId("chat-send-button"));
    expect(input).toHaveValue("");
  });

  it("sends message on Enter key", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-contact-support"));
    const input = screen.getByTestId("chat-input");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByTestId("chat-message-user")).toHaveTextContent("Hello");
  });

  it("back button returns to menu from chat", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-contact-support"));
    fireEvent.click(screen.getByTestId("sheet-back-button"));
    expect(screen.getByTestId("sheet-menu")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Navigation — report view
// ---------------------------------------------------------------------------

describe("SupportBottomSheet — report view", () => {
  it("shows report view when Report a problem is tapped", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-report-problem"));
    expect(screen.getByTestId("sheet-report-view")).toBeInTheDocument();
  });

  it("renders issue category dropdown", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-report-problem"));
    expect(screen.getByTestId("issue-category-select")).toBeInTheDocument();
  });

  it("dropdown contains all SupportIssueCategory values", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-report-problem"));
    const select = screen.getByTestId("issue-category-select") as HTMLSelectElement;
    const optionValues = Array.from(select.options).map((o) => o.value);
    expect(optionValues).toContain("cant_book");
    expect(optionValues).toContain("refund_request");
    expect(optionValues).toContain("voucher_issue");
    expect(optionValues).toContain("merchant_no_show");
    expect(optionValues).toContain("billing_dispute");
    expect(optionValues).toContain("other");
  });

  it("renders description textarea", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-report-problem"));
    expect(screen.getByTestId("report-description-textarea")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-report-problem"));
    expect(screen.getByTestId("report-submit-button")).toBeInTheDocument();
  });

  it("shows confirmation after form is submitted", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-report-problem"));
    fireEvent.submit(screen.getByTestId("report-submit-button").closest("form")!);
    expect(screen.getByTestId("report-submitted-confirmation")).toBeInTheDocument();
  });

  it("back button returns to menu from report view", () => {
    renderSheet();
    fireEvent.click(screen.getByTestId("action-report-problem"));
    fireEvent.click(screen.getByTestId("sheet-back-button"));
    expect(screen.getByTestId("sheet-menu")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("SupportBottomSheet — analytics", () => {
  it("fires support_action_selected with get_a_refund when Get a refund is tapped", () => {
    const analytics = makeAnalytics();
    renderSheet({ analytics });
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "support_action_selected",
      orderId: "ORDER-001",
      action: "get_a_refund",
    });
  });

  it("fires support_action_selected with contact_support when Contact support is tapped", () => {
    const analytics = makeAnalytics();
    renderSheet({ analytics });
    fireEvent.click(screen.getByTestId("action-contact-support"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "support_action_selected",
      orderId: "ORDER-001",
      action: "contact_support",
    });
  });

  it("fires support_action_selected with report_a_problem when Report a problem is tapped", () => {
    const analytics = makeAnalytics();
    renderSheet({ analytics });
    fireEvent.click(screen.getByTestId("action-report-problem"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "support_action_selected",
      orderId: "ORDER-001",
      action: "report_a_problem",
    });
  });

  it("calls onActionSelected callback with the chosen action", () => {
    const onActionSelected = vi.fn();
    renderSheet({ onActionSelected });
    fireEvent.click(screen.getByTestId("action-contact-support"));
    expect(onActionSelected).toHaveBeenCalledWith("contact_support");
  });
});

// ---------------------------------------------------------------------------
// Close behaviour
// ---------------------------------------------------------------------------

describe("SupportBottomSheet — close", () => {
  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    renderSheet({ onClose });
    fireEvent.click(screen.getByTestId("sheet-close-button"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("resets to menu view when reopened", () => {
    const { rerender } = render(
      <SupportBottomSheet
        isOpen={true}
        onClose={vi.fn()}
        orderId="ORDER-001"
        refundPolicy={refundablePolicy}
        analytics={makeAnalytics()}
      />,
    );
    fireEvent.click(screen.getByTestId("action-get-refund"));
    expect(screen.getByTestId("sheet-refund-view")).toBeInTheDocument();

    rerender(
      <SupportBottomSheet
        isOpen={false}
        onClose={vi.fn()}
        orderId="ORDER-001"
        refundPolicy={refundablePolicy}
        analytics={makeAnalytics()}
      />,
    );
    rerender(
      <SupportBottomSheet
        isOpen={true}
        onClose={vi.fn()}
        orderId="ORDER-001"
        refundPolicy={refundablePolicy}
        analytics={makeAnalytics()}
      />,
    );
    expect(screen.getByTestId("sheet-menu")).toBeInTheDocument();
  });
});
