import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { RefundPolicyBadge, getRefundBadgeColor } from "../RefundPolicyBadge";
import type { RefundPolicy } from "../../types/deal";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makePolicy(overrides: Partial<RefundPolicy>): RefundPolicy {
  return {
    isRefundable: true,
    windowAmount: 24,
    windowUnit: "hours",
    plainTextSummary: "Free cancellation up to 24h before your appointment",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getRefundBadgeColor — pure logic unit tests (no render needed)
// ---------------------------------------------------------------------------

describe("getRefundBadgeColor", () => {
  it("returns green for a 24-hour window", () => {
    expect(getRefundBadgeColor(makePolicy({ windowAmount: 24, windowUnit: "hours" }))).toBe("green");
  });

  it("returns green for a window greater than 24 hours", () => {
    expect(getRefundBadgeColor(makePolicy({ windowAmount: 48, windowUnit: "hours" }))).toBe("green");
  });

  it("returns green for a 1-day window (24 hours equivalent)", () => {
    expect(getRefundBadgeColor(makePolicy({ windowAmount: 1, windowUnit: "days" }))).toBe("green");
  });

  it("returns green for a 7-day window", () => {
    expect(getRefundBadgeColor(makePolicy({ windowAmount: 7, windowUnit: "days" }))).toBe("green");
  });

  it("returns amber for a window between 1 and 23 hours", () => {
    expect(getRefundBadgeColor(makePolicy({ windowAmount: 12, windowUnit: "hours" }))).toBe("amber");
  });

  it("returns amber for a 1-hour window", () => {
    expect(getRefundBadgeColor(makePolicy({ windowAmount: 1, windowUnit: "hours" }))).toBe("amber");
  });

  it("returns red when isRefundable is false, regardless of window", () => {
    expect(
      getRefundBadgeColor(makePolicy({ isRefundable: false, windowAmount: 48, windowUnit: "hours" })),
    ).toBe("red");
  });

  it("returns red when window is 0 hours", () => {
    expect(getRefundBadgeColor(makePolicy({ windowAmount: 0, windowUnit: "hours" }))).toBe("red");
  });

  it("returns red when window is 0 days", () => {
    expect(getRefundBadgeColor(makePolicy({ windowAmount: 0, windowUnit: "days" }))).toBe("red");
  });
});

// ---------------------------------------------------------------------------
// RefundPolicyBadge — render tests
// ---------------------------------------------------------------------------

describe("RefundPolicyBadge", () => {
  it("renders the plainTextSummary", () => {
    render(<RefundPolicyBadge refundPolicy={makePolicy({ plainTextSummary: "Free cancellation" })} />);
    expect(screen.getByTestId("refund-policy-badge")).toHaveTextContent("Free cancellation");
  });

  it("sets data-color to green for a 24-hour refundable window", () => {
    render(<RefundPolicyBadge refundPolicy={makePolicy({ windowAmount: 24, windowUnit: "hours" })} />);
    expect(screen.getByTestId("refund-policy-badge")).toHaveAttribute("data-color", "green");
  });

  it("sets data-color to green for a 2-day refundable window", () => {
    render(<RefundPolicyBadge refundPolicy={makePolicy({ windowAmount: 2, windowUnit: "days" })} />);
    expect(screen.getByTestId("refund-policy-badge")).toHaveAttribute("data-color", "green");
  });

  it("sets data-color to amber for a 6-hour refundable window", () => {
    render(<RefundPolicyBadge refundPolicy={makePolicy({ windowAmount: 6, windowUnit: "hours" })} />);
    expect(screen.getByTestId("refund-policy-badge")).toHaveAttribute("data-color", "amber");
  });

  it("sets data-color to red when isRefundable is false", () => {
    render(<RefundPolicyBadge refundPolicy={makePolicy({ isRefundable: false, windowAmount: 0, windowUnit: "hours" })} />);
    expect(screen.getByTestId("refund-policy-badge")).toHaveAttribute("data-color", "red");
  });

  it("sets data-color to red for a 0-hour refundable window", () => {
    render(<RefundPolicyBadge refundPolicy={makePolicy({ windowAmount: 0, windowUnit: "hours" })} />);
    expect(screen.getByTestId("refund-policy-badge")).toHaveAttribute("data-color", "red");
  });

  it("renders as an inline element (span)", () => {
    render(<RefundPolicyBadge refundPolicy={makePolicy({})} />);
    const badge = screen.getByTestId("refund-policy-badge");
    expect(badge.tagName.toLowerCase()).toBe("span");
  });
});
