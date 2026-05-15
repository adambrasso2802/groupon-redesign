import React, { useState, useEffect, useRef } from "react";
import type { AnalyticsClient } from "../analytics/client";
import { AssistantChatPanel } from "./AssistantChatPanel";

export const RECENT_SEARCHES_KEY = "groupon_recent_searches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;

// Placeholder per spec — no implementation
function searchDeals(_query: string): void {}

function isNaturalLanguage(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes("?") ||
    q.includes("what") ||
    q.includes("where") ||
    q.includes("find me") ||
    q.includes("show me")
  );
}

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  try {
    const current = loadRecentSearches().filter((s) => s !== query);
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify([query, ...current].slice(0, MAX_RECENT)),
    );
  } catch {}
}

export interface UnifiedSearchBarProps {
  analytics: AnalyticsClient;
  /** Called when a keyword search is submitted. */
  onSearch?: ((query: string) => void) | undefined;
  /** Called when an NL/assistant query is submitted. */
  onAssistantQuery?: ((query: string) => void) | undefined;
}

export function UnifiedSearchBar({
  analytics,
  onSearch,
  onAssistantQuery,
}: UnifiedSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [assistantQuery, setAssistantQuery] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFiredInitiated = useRef(false);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleFocus() {
    setIsFocused(true);
    setRecentSearches(loadRecentSearches());
    if (!hasFiredInitiated.current) {
      hasFiredInitiated.current = true;
      analytics.track({ event: "search_initiated" });
    }
  }

  function handleBlur() {
    // Delay so clicks on recent-search items still fire before the list closes.
    setTimeout(() => setIsFocused(false), 150);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchDeals(value);
    }, DEBOUNCE_MS);
  }

  function submitQuery(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const mode = isNaturalLanguage(trimmed) ? "assistant" : "keyword";
    analytics.track({ event: "search_submitted", query: trimmed, mode });
    saveRecentSearch(trimmed);
    setRecentSearches(loadRecentSearches());
    setIsFocused(false);

    if (mode === "assistant") {
      setAssistantQuery(trimmed);
      onAssistantQuery?.(trimmed);
    } else {
      onSearch?.(trimmed);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitQuery(query);
  }

  function handleRecentTap(s: string) {
    setQuery(s);
    submitQuery(s);
  }

  function handleAssistantClose() {
    setAssistantQuery(null);
    hasFiredInitiated.current = false;
  }

  return (
    <div data-testid="unified-search-bar" style={{ position: "relative" }}>
      <form
        data-testid="search-form"
        role="search"
        onSubmit={handleSubmit}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f3f4f6",
            borderRadius: 12,
            padding: "10px 14px",
            gap: 8,
          }}
        >
          {/* Search icon */}
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0, color: "#6b7280" }}
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={2} />
            <path
              d="M16.5 16.5L21 21"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>

          <input
            data-testid="search-input"
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search deals or ask a question…"
            aria-label="Search deals"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 15,
            }}
          />

          {/* Microphone — UI placeholder only, no voice implementation */}
          <button
            type="button"
            data-testid="mic-button"
            aria-label="Voice search"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              color: "#6b7280",
              flexShrink: 0,
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth={2} />
              <path
                d="M5 10a7 7 0 0014 0"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1="12" y1="21" x2="12" y2="17"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Recent searches — visible only while focused */}
      {isFocused && recentSearches.length > 0 && (
        <div
          data-testid="recent-searches"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            marginTop: 4,
            zIndex: 200,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              padding: "10px 14px 4px",
              fontSize: 12,
              color: "#6b7280",
              margin: 0,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Recent
          </p>
          {recentSearches.map((s, i) => (
            <button
              key={i}
              data-testid="recent-search-item"
              onMouseDown={() => handleRecentTap(s)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* AssistantChatPanel — bottom sheet for NL queries */}
      {assistantQuery !== null && (
        <AssistantChatPanel
          analytics={analytics}
          initialQuery={assistantQuery}
          onClose={handleAssistantClose}
        />
      )}
    </div>
  );
}
