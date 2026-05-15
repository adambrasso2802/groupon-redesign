import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AssistantChatPanel } from "../AssistantChatPanel";
import type { AnalyticsClient } from "../../analytics/client";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

function renderPanel(
  overrides: Partial<{ initialQuery: string; onClose: () => void; analytics: AnalyticsClient }> = {},
) {
  const props = {
    analytics: makeAnalytics(),
    initialQuery: "find me a spa deal",
    onClose: vi.fn(),
    ...overrides,
  };
  return { ...render(<AssistantChatPanel {...props} />), analytics: props.analytics, onClose: props.onClose };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("AssistantChatPanel — rendering", () => {
  it("renders the panel", () => {
    renderPanel();
    expect(screen.getByTestId("assistant-chat-panel")).toBeInTheDocument();
  });

  it("renders the panel title", () => {
    renderPanel();
    expect(screen.getByTestId("assistant-panel-title")).toHaveTextContent("Groupon Assistant");
  });

  it("renders the close button", () => {
    renderPanel();
    expect(screen.getByTestId("assistant-close-button")).toBeInTheDocument();
  });

  it("close button has aria-label 'Close assistant'", () => {
    renderPanel();
    expect(screen.getByTestId("assistant-close-button")).toHaveAttribute("aria-label", "Close assistant");
  });

  it("renders the messages container", () => {
    renderPanel();
    expect(screen.getByTestId("assistant-messages")).toBeInTheDocument();
  });

  it("renders the send input and button", () => {
    renderPanel();
    expect(screen.getByTestId("assistant-input")).toBeInTheDocument();
    expect(screen.getByTestId("assistant-send-button")).toBeInTheDocument();
  });

  it("renders a backdrop overlay", () => {
    renderPanel();
    expect(screen.getByTestId("assistant-backdrop")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Initial query display
// ---------------------------------------------------------------------------

describe("AssistantChatPanel — initial query", () => {
  it("shows the initial query as a user message", () => {
    renderPanel({ initialQuery: "find me a yoga class" });
    const userMsgs = screen.getAllByTestId("assistant-user-message");
    expect(userMsgs[0]).toHaveTextContent("find me a yoga class");
  });

  it("shows a placeholder assistant response after the initial query", () => {
    renderPanel();
    expect(screen.getByTestId("assistant-response-message")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("AssistantChatPanel — analytics", () => {
  it("fires assistant_opened on mount", () => {
    const analytics = makeAnalytics();
    renderPanel({ analytics });
    const events = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(events.find((e) => e.event === "assistant_opened")).toBeDefined();
  });

  it("fires assistant_opened exactly once even if re-rendered", () => {
    const analytics = makeAnalytics();
    const { rerender } = render(
      <AssistantChatPanel
        analytics={analytics}
        initialQuery="find me yoga"
        onClose={vi.fn()}
      />,
    );
    rerender(
      <AssistantChatPanel
        analytics={analytics}
        initialQuery="find me yoga"
        onClose={vi.fn()}
      />,
    );
    const events = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(events.filter((e) => e.event === "assistant_opened")).toHaveLength(1);
  });

  it("fires assistant_message_sent with the query when a message is submitted", () => {
    const analytics = makeAnalytics();
    renderPanel({ analytics });
    fireEvent.change(screen.getByTestId("assistant-input"), { target: { value: "something cheaper?" } });
    fireEvent.submit(screen.getByTestId("assistant-input-form"));
    const events = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    const sent = events.find((e) => e.event === "assistant_message_sent");
    expect(sent).toBeDefined();
    expect(sent?.query).toBe("something cheaper?");
  });

  it("does not fire assistant_message_sent for empty input", () => {
    const analytics = makeAnalytics();
    renderPanel({ analytics });
    fireEvent.submit(screen.getByTestId("assistant-input-form"));
    const events = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(events.filter((e) => e.event === "assistant_message_sent")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Chat interaction
// ---------------------------------------------------------------------------

describe("AssistantChatPanel — chat interaction", () => {
  it("adds the new user message to the chat after submit", () => {
    renderPanel();
    fireEvent.change(screen.getByTestId("assistant-input"), { target: { value: "any discounts?" } });
    fireEvent.submit(screen.getByTestId("assistant-input-form"));
    const userMsgs = screen.getAllByTestId("assistant-user-message");
    expect(userMsgs.some((el) => el.textContent === "any discounts?")).toBe(true);
  });

  it("adds a placeholder assistant response after each user message", () => {
    renderPanel();
    fireEvent.change(screen.getByTestId("assistant-input"), { target: { value: "any discounts?" } });
    fireEvent.submit(screen.getByTestId("assistant-input-form"));
    expect(screen.getAllByTestId("assistant-response-message")).toHaveLength(2);
  });

  it("clears the input after submit", () => {
    renderPanel();
    fireEvent.change(screen.getByTestId("assistant-input"), { target: { value: "any discounts?" } });
    fireEvent.submit(screen.getByTestId("assistant-input-form"));
    expect(screen.getByTestId("assistant-input")).toHaveValue("");
  });

  it("does not add a message for whitespace-only input", () => {
    renderPanel();
    const before = screen.getAllByTestId("assistant-user-message").length;
    fireEvent.change(screen.getByTestId("assistant-input"), { target: { value: "   " } });
    fireEvent.submit(screen.getByTestId("assistant-input-form"));
    expect(screen.getAllByTestId("assistant-user-message")).toHaveLength(before);
  });
});

// ---------------------------------------------------------------------------
// Close behavior
// ---------------------------------------------------------------------------

describe("AssistantChatPanel — close behavior", () => {
  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    renderPanel({ onClose });
    fireEvent.click(screen.getByTestId("assistant-close-button"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", () => {
    const onClose = vi.fn();
    renderPanel({ onClose });
    fireEvent.click(screen.getByTestId("assistant-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
