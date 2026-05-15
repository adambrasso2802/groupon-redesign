import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { InAppThreeDChallenge } from "../InAppThreeDChallenge";
import type { AnalyticsClient } from "../../analytics/client";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

function renderChallenge(overrides: Partial<React.ComponentProps<typeof InAppThreeDChallenge>> = {}) {
  const props = {
    dealId: "deal-001",
    analytics: makeAnalytics(),
    onSuccess: vi.fn(),
    onDismiss: vi.fn(),
    ...overrides,
  };
  render(<InAppThreeDChallenge {...props} />);
  return props;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("InAppThreeDChallenge — rendering", () => {
  it("renders the modal overlay", () => {
    renderChallenge();
    expect(screen.getByTestId("three-ds-overlay")).toBeInTheDocument();
  });

  it("has dialog role and aria-modal", () => {
    renderChallenge();
    const overlay = screen.getByTestId("three-ds-overlay");
    expect(overlay).toHaveAttribute("role", "dialog");
    expect(overlay).toHaveAttribute("aria-modal", "true");
  });

  it("renders the bank frame placeholder", () => {
    renderChallenge();
    expect(screen.getByTestId("three-ds-bank-frame")).toBeInTheDocument();
  });

  it("renders the OTP input", () => {
    renderChallenge();
    expect(screen.getByTestId("three-ds-otp-input")).toBeInTheDocument();
  });

  it("renders the Authenticate button", () => {
    renderChallenge();
    expect(screen.getByTestId("three-ds-authenticate-btn")).toBeInTheDocument();
  });

  it("renders the Cancel button", () => {
    renderChallenge();
    expect(screen.getByTestId("three-ds-cancel-btn")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("InAppThreeDChallenge — analytics", () => {
  it("fires three_ds_challenge_started on mount", () => {
    const analytics = makeAnalytics();
    renderChallenge({ analytics, dealId: "deal-xyz" });
    expect(analytics.track).toHaveBeenCalledWith({
      event: "three_ds_challenge_started",
      dealId: "deal-xyz",
    });
  });

  it("fires three_ds_challenge_started exactly once", () => {
    const analytics = makeAnalytics();
    renderChallenge({ analytics });
    const calls = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.filter(
      (args: unknown[]) => (args[0] as { event: string }).event === "three_ds_challenge_started",
    );
    expect(calls).toHaveLength(1);
  });

  it("fires three_ds_challenge_succeeded when Authenticate is clicked", () => {
    const analytics = makeAnalytics();
    renderChallenge({ analytics, dealId: "deal-001" });
    fireEvent.click(screen.getByTestId("three-ds-authenticate-btn"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "three_ds_challenge_succeeded",
      dealId: "deal-001",
    });
  });

  it("fires three_ds_challenge_failed when Cancel is clicked", () => {
    const analytics = makeAnalytics();
    renderChallenge({ analytics, dealId: "deal-001" });
    fireEvent.click(screen.getByTestId("three-ds-cancel-btn"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "three_ds_challenge_failed",
      dealId: "deal-001",
    });
  });
});

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

describe("InAppThreeDChallenge — callbacks", () => {
  it("calls onSuccess when Authenticate is clicked", () => {
    const onSuccess = vi.fn();
    renderChallenge({ onSuccess });
    fireEvent.click(screen.getByTestId("three-ds-authenticate-btn"));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("does not call onDismiss when Authenticate is clicked", () => {
    const onDismiss = vi.fn();
    renderChallenge({ onDismiss });
    fireEvent.click(screen.getByTestId("three-ds-authenticate-btn"));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("calls onDismiss when Cancel is clicked", () => {
    const onDismiss = vi.fn();
    renderChallenge({ onDismiss });
    fireEvent.click(screen.getByTestId("three-ds-cancel-btn"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("does not call onSuccess when Cancel is clicked", () => {
    const onSuccess = vi.fn();
    renderChallenge({ onSuccess });
    fireEvent.click(screen.getByTestId("three-ds-cancel-btn"));
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
