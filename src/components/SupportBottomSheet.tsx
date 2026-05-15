import React, { useEffect, useRef, useState } from "react";
import type { RefundPolicy, SupportIssueCategory } from "../types/deal";
import type { AnalyticsClient } from "../analytics/client";
import type { SupportAction } from "../types/analytics";

export interface SupportBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  refundPolicy: RefundPolicy;
  analytics: AnalyticsClient;
  onActionSelected?: (action: SupportAction) => void;
}

type SheetView = "menu" | "refund" | "chat" | "report";

const ISSUE_LABELS: Record<SupportIssueCategory, string> = {
  cant_book: "Can't book",
  refund_request: "Refund request",
  voucher_issue: "Voucher issue",
  merchant_no_show: "Merchant no-show",
  billing_dispute: "Billing dispute",
  other: "Other",
};

const ISSUE_CATEGORIES = Object.keys(ISSUE_LABELS) as SupportIssueCategory[];

export function formatRefundDeadline(deadlineMs: number): string {
  const date = new Date(deadlineMs);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

export function SupportBottomSheet({
  isOpen,
  onClose,
  orderId,
  refundPolicy,
  analytics,
  onActionSelected,
}: SupportBottomSheetProps) {
  const [view, setView] = useState<SheetView>("menu");
  const [issueCategory, setIssueCategory] = useState<SupportIssueCategory>("other");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { from: "support" as const, text: "Hi! A support agent will be with you shortly. What do you need help with?" },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setView("menu");
      setReportDescription("");
      setReportSubmitted(false);
      setChatInput("");
    }
  }, [isOpen]);

  useEffect(() => {
    const el = chatEndRef.current;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  if (!isOpen) return null;

  function handleAction(action: SupportAction) {
    analytics.track({ event: "support_action_selected", orderId, action });
    onActionSelected?.(action);
    if (action === "get_a_refund") setView("refund");
    else if (action === "contact_support") setView("chat");
    else setView("report");
  }

  function handleSendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [...prev, { from: "user" as const, text }]);
    setChatInput("");
  }

  function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReportSubmitted(true);
  }

  const deadlineLabel =
    refundPolicy.deadlineMs != null
      ? `You can refund this until ${formatRefundDeadline(refundPolicy.deadlineMs)}`
      : refundPolicy.plainTextSummary;

  return (
    <div
      data-testid="support-bottom-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Support options"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        data-testid="support-bottom-sheet-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: "#fff",
          borderRadius: "16px 16px 0 0",
          padding: "20px",
          maxHeight: "80vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {view !== "menu" ? (
            <button
              data-testid="sheet-back-button"
              onClick={() => setView("menu")}
              style={ghostButtonStyle}
              aria-label="Back"
            >
              ← Back
            </button>
          ) : (
            <span style={{ fontSize: 16, fontWeight: 700 }}>How can we help?</span>
          )}
          <button
            data-testid="sheet-close-button"
            onClick={onClose}
            style={ghostButtonStyle}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Menu view */}
        {view === "menu" && (
          <div data-testid="sheet-menu" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <MenuOption
              testId="action-get-refund"
              icon="💰"
              title="Get a refund"
              description="Check your eligibility and request a refund"
              onClick={() => handleAction("get_a_refund")}
            />
            <MenuOption
              testId="action-contact-support"
              icon="💬"
              title="Contact support"
              description="Chat with a real support agent — no bots"
              onClick={() => handleAction("contact_support")}
            />
            <MenuOption
              testId="action-report-problem"
              icon="⚠️"
              title="Report a problem"
              description="Tell us what went wrong with your order"
              onClick={() => handleAction("report_a_problem")}
            />
          </div>
        )}

        {/* Refund view */}
        {view === "refund" && (
          <div data-testid="sheet-refund-view">
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Refund policy</h2>
            {refundPolicy.isRefundable ? (
              <>
                <p
                  data-testid="refund-deadline-label"
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#16a34a",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    padding: "12px 14px",
                    margin: "0 0 12px",
                  }}
                >
                  {deadlineLabel}
                </p>
                <p style={{ fontSize: 14, color: "#374151", margin: "0 0 16px" }}>
                  {refundPolicy.plainTextSummary}
                </p>
                <button
                  data-testid="request-refund-button"
                  style={primaryButtonStyle}
                >
                  Request refund
                </button>
              </>
            ) : (
              <p data-testid="no-refund-label" style={{ fontSize: 14, color: "#6b7280" }}>
                This order is not eligible for a refund. {refundPolicy.plainTextSummary}
              </p>
            )}
          </div>
        )}

        {/* Chat view */}
        {view === "chat" && (
          <div data-testid="sheet-chat-view" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Contact support</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
              You are chatting directly with the Groupon support team.
            </p>
            <div
              data-testid="chat-message-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 260,
                overflowY: "auto",
                padding: "8px 0",
              }}
            >
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  data-testid={msg.from === "user" ? "chat-message-user" : "chat-message-support"}
                  style={{
                    alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                    background: msg.from === "user" ? "#2563eb" : "#f3f4f6",
                    color: msg.from === "user" ? "#fff" : "#111827",
                    borderRadius: msg.from === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0",
                    padding: "8px 12px",
                    fontSize: 14,
                    maxWidth: "80%",
                  }}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                data-testid="chat-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Type your message…"
                style={{
                  flex: 1,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 14,
                }}
              />
              <button
                data-testid="chat-send-button"
                onClick={handleSendChat}
                disabled={!chatInput.trim()}
                style={{
                  ...primaryButtonStyle,
                  padding: "10px 16px",
                  width: "auto",
                  opacity: chatInput.trim() ? 1 : 0.4,
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Report view */}
        {view === "report" && (
          <div data-testid="sheet-report-view">
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Report a problem</h2>
            {reportSubmitted ? (
              <p data-testid="report-submitted-confirmation" style={{ fontSize: 14, color: "#16a34a" }}>
                Your report has been submitted. We'll follow up within 24 hours.
              </p>
            ) : (
              <form onSubmit={handleReportSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label htmlFor="issue-category" style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    Issue type
                  </label>
                  <select
                    id="issue-category"
                    data-testid="issue-category-select"
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value as SupportIssueCategory)}
                    style={{
                      width: "100%",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 14,
                      background: "#fff",
                    }}
                  >
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {ISSUE_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="report-description" style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                    Description
                  </label>
                  <textarea
                    id="report-description"
                    data-testid="report-description-textarea"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please describe the problem…"
                    rows={4}
                    style={{
                      width: "100%",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 14,
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  data-testid="report-submit-button"
                  style={primaryButtonStyle}
                >
                  Submit report
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface MenuOptionProps {
  testId: string;
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

function MenuOption({ testId, icon, title, description, onClick }: MenuOptionProps) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        width: "100%",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <div>
        <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 600, color: "#111827" }}>{title}</p>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{description}</p>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const ghostButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  color: "#6b7280",
  padding: "4px 8px",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "14px 24px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
