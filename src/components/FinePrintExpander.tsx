import React, { useState } from "react";
import type { AnalyticsClient } from "../analytics/client";

export interface FinePrintExpanderProps {
  items: string[];
  dealId: string;
  analytics: AnalyticsClient;
}

export function FinePrintExpander({ items, dealId, analytics }: FinePrintExpanderProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleToggle() {
    if (!isOpen) {
      analytics.track({ event: "fine_print_expanded", dealId });
    }
    setIsOpen((prev) => !prev);
  }

  return (
    <div data-testid="fine-print-expander">
      <button
        data-testid="fine-print-toggle"
        onClick={handleToggle}
        aria-expanded={isOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 600,
          color: "#374151",
        }}
      >
        Terms &amp; conditions
        <span aria-hidden="true" style={{ fontSize: 12, transition: "transform 0.15s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▾
        </span>
      </button>

      {/* Always rendered so existing testid queries work; hidden via CSS when collapsed */}
      <ul
        data-testid="fine-print-list"
        style={{
          display: isOpen ? "block" : "none",
          paddingLeft: 20,
          margin: "8px 0 0",
        }}
      >
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
