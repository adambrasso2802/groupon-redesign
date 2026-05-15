import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BottomTabBar, type BottomTab } from "../BottomTabBar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderBar(activeTab: BottomTab = "home", onTabChange = vi.fn()) {
  return render(<BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("BottomTabBar — rendering", () => {
  it("renders all four tabs", () => {
    renderBar();
    expect(screen.getByTestId("tab-home")).toBeInTheDocument();
    expect(screen.getByTestId("tab-search")).toBeInTheDocument();
    expect(screen.getByTestId("tab-my_groupons")).toBeInTheDocument();
    expect(screen.getByTestId("tab-support")).toBeInTheDocument();
  });

  it("renders each tab with its correct label", () => {
    renderBar();
    expect(screen.getByTestId("tab-home")).toHaveTextContent("Home");
    expect(screen.getByTestId("tab-search")).toHaveTextContent("Search");
    expect(screen.getByTestId("tab-my_groupons")).toHaveTextContent("My Groupons");
    expect(screen.getByTestId("tab-support")).toHaveTextContent("Support");
  });

  it("has role=navigation with aria-label", () => {
    renderBar();
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Main navigation");
  });
});

// ---------------------------------------------------------------------------
// Active tab state
// ---------------------------------------------------------------------------

describe("BottomTabBar — active tab", () => {
  it("marks the active tab with aria-current=page", () => {
    renderBar("home");
    expect(screen.getByTestId("tab-home")).toHaveAttribute("aria-current", "page");
  });

  it("does not mark inactive tabs with aria-current", () => {
    renderBar("home");
    expect(screen.getByTestId("tab-search")).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("tab-my_groupons")).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("tab-support")).not.toHaveAttribute("aria-current");
  });

  it("marks the search tab active when activeTab=search", () => {
    renderBar("search");
    expect(screen.getByTestId("tab-search")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("tab-home")).not.toHaveAttribute("aria-current");
  });

  it("marks the my_groupons tab active when activeTab=my_groupons", () => {
    renderBar("my_groupons");
    expect(screen.getByTestId("tab-my_groupons")).toHaveAttribute("aria-current", "page");
  });

  it("marks the support tab active when activeTab=support", () => {
    renderBar("support");
    expect(screen.getByTestId("tab-support")).toHaveAttribute("aria-current", "page");
  });
});

// ---------------------------------------------------------------------------
// onTabChange callback
// ---------------------------------------------------------------------------

describe("BottomTabBar — onTabChange callback", () => {
  it("calls onTabChange with 'home' when Home is clicked", () => {
    const onTabChange = vi.fn();
    renderBar("search", onTabChange);
    fireEvent.click(screen.getByTestId("tab-home"));
    expect(onTabChange).toHaveBeenCalledOnce();
    expect(onTabChange).toHaveBeenCalledWith("home");
  });

  it("calls onTabChange with 'search' when Search is clicked", () => {
    const onTabChange = vi.fn();
    renderBar("home", onTabChange);
    fireEvent.click(screen.getByTestId("tab-search"));
    expect(onTabChange).toHaveBeenCalledWith("search");
  });

  it("calls onTabChange with 'my_groupons' when My Groupons is clicked", () => {
    const onTabChange = vi.fn();
    renderBar("home", onTabChange);
    fireEvent.click(screen.getByTestId("tab-my_groupons"));
    expect(onTabChange).toHaveBeenCalledWith("my_groupons");
  });

  it("calls onTabChange with 'support' when Support is clicked", () => {
    const onTabChange = vi.fn();
    renderBar("home", onTabChange);
    fireEvent.click(screen.getByTestId("tab-support"));
    expect(onTabChange).toHaveBeenCalledWith("support");
  });

  it("fires exactly once per click", () => {
    const onTabChange = vi.fn();
    renderBar("home", onTabChange);
    fireEvent.click(screen.getByTestId("tab-search"));
    expect(onTabChange).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

describe("BottomTabBar — icons", () => {
  it("renders an icon for each tab", () => {
    renderBar();
    expect(screen.getByTestId("tab-icon-home")).toBeInTheDocument();
    expect(screen.getByTestId("tab-icon-search")).toBeInTheDocument();
    expect(screen.getByTestId("tab-icon-my_groupons")).toBeInTheDocument();
    expect(screen.getByTestId("tab-icon-support")).toBeInTheDocument();
  });
});
