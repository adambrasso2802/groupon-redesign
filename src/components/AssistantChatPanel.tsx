import React, { useState, useEffect, useRef } from "react";
import type { AnalyticsClient } from "../analytics/client";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const PLACEHOLDER_RESPONSE =
  "I'm searching for deals that match your request. Results will appear here once the assistant is connected.";

export interface AssistantChatPanelProps {
  analytics: AnalyticsClient;
  initialQuery: string;
  onClose: () => void;
}

export function AssistantChatPanel({
  analytics,
  initialQuery,
  onClose,
}: AssistantChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const hasFiredOpen = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFiredOpen.current) {
      hasFiredOpen.current = true;
      analytics.track({ event: "assistant_opened" });
      setMessages([
        { role: "user", text: initialQuery },
        { role: "assistant", text: PLACEHOLDER_RESPONSE },
      ]);
    }
  }, [analytics, initialQuery]);

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    analytics.track({ event: "assistant_message_sent", query: trimmed });
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "assistant", text: PLACEHOLDER_RESPONSE },
    ]);
    setInputValue("");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="assistant-backdrop"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 300,
        }}
      />

      {/* Bottom sheet */}
      <div
        data-testid="assistant-chat-panel"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 301,
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "70vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 16px 12px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <span
            data-testid="assistant-panel-title"
            style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}
          >
            Groupon Assistant
          </span>
          <button
            data-testid="assistant-close-button"
            aria-label="Close assistant"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: "#6b7280",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          data-testid="assistant-messages"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              data-testid={msg.role === "user" ? "assistant-user-message" : "assistant-response-message"}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user" ? "#16a34a" : "#f3f4f6",
                color: msg.role === "user" ? "#fff" : "#111827",
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          data-testid="assistant-input-form"
          style={{
            display: "flex",
            gap: 8,
            padding: "12px 16px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <input
            data-testid="assistant-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow-up question…"
            aria-label="Send a message to the assistant"
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              borderRadius: 20,
              padding: "8px 14px",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            data-testid="assistant-send-button"
            aria-label="Send message"
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "8px 16px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}
