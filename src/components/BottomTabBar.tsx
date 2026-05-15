import React from "react";

export type BottomTab = "home" | "search" | "my_groupons" | "support";

export interface BottomTabBarProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

const TABS: { id: BottomTab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "search", label: "Search" },
  { id: "my_groupons", label: "My Groupons" },
  { id: "support", label: "Support" },
];

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <nav
      data-testid="bottom-tab-bar"
      aria-label="Main navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        borderTop: "1px solid #e5e7eb",
        background: "#fff",
        zIndex: 100,
      }}
    >
      {TABS.map(({ id, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            data-testid={`tab-${id}`}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange(id)}
            style={{
              flex: 1,
              padding: "12px 4px 8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isActive ? "#16a34a" : "#6b7280",
              fontWeight: isActive ? 600 : 400,
              fontSize: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <TabIcon id={id} isActive={isActive} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function TabIcon({ id, isActive }: { id: BottomTab; isActive: boolean }) {
  const color = isActive ? "#16a34a" : "#6b7280";
  const size = 22;

  if (id === "home") {
    return (
      <svg data-testid={`tab-icon-${id}`} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12L12 3l9 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v11h14V10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === "search") {
    return (
      <svg data-testid={`tab-icon-${id}`} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} />
        <path d="M16.5 16.5L21 21" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "my_groupons") {
    return (
      <svg data-testid={`tab-icon-${id}`} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth={2} />
        <path d="M3 9h18" stroke={color} strokeWidth={2} />
        <path d="M9 13h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </svg>
    );
  }
  // support
  return (
    <svg data-testid={`tab-icon-${id}`} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
      <path d="M12 8v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill={color} />
    </svg>
  );
}
