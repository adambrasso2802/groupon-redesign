import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { HeroImageCarousel } from "../HeroImageCarousel";
import type { AnalyticsClient } from "../../analytics/client";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

const ONE_IMAGE: [string, ...string[]] = ["https://example.com/img1.jpg"];
const THREE_IMAGES: [string, ...string[]] = [
  "https://example.com/img1.jpg",
  "https://example.com/img2.jpg",
  "https://example.com/img3.jpg",
];

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("HeroImageCarousel — rendering", () => {
  it("renders the first image on mount", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={makeAnalytics()} />);
    const img = screen.getByTestId("hero-carousel-image") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/img1.jpg");
  });

  it("shows 1 / N counter", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={makeAnalytics()} />);
    expect(screen.getByTestId("hero-carousel-counter")).toHaveTextContent("1 / 3");
  });

  it("renders prev/next buttons when more than one image", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={makeAnalytics()} />);
    expect(screen.getByTestId("hero-carousel-prev")).toBeInTheDocument();
    expect(screen.getByTestId("hero-carousel-next")).toBeInTheDocument();
  });

  it("does NOT render prev/next buttons for a single image", () => {
    render(<HeroImageCarousel images={ONE_IMAGE} dealId="d1" analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("hero-carousel-prev")).toBeNull();
    expect(screen.queryByTestId("hero-carousel-next")).toBeNull();
  });

  it("renders dot indicators equal to image count", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={makeAnalytics()} />);
    expect(screen.getByTestId("hero-carousel-dot-0")).toBeInTheDocument();
    expect(screen.getByTestId("hero-carousel-dot-1")).toBeInTheDocument();
    expect(screen.getByTestId("hero-carousel-dot-2")).toBeInTheDocument();
  });

  it("marks the first dot as active on mount", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={makeAnalytics()} />);
    expect(screen.getByTestId("hero-carousel-dot-0")).toHaveAttribute("aria-current", "true");
    expect(screen.getByTestId("hero-carousel-dot-1")).not.toHaveAttribute("aria-current");
  });
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

describe("HeroImageCarousel — navigation", () => {
  let analytics: AnalyticsClient;

  beforeEach(() => {
    analytics = makeAnalytics();
  });

  it("advances to the next image on Next click", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    const img = screen.getByTestId("hero-carousel-image") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/img2.jpg");
    expect(screen.getByTestId("hero-carousel-counter")).toHaveTextContent("2 / 3");
  });

  it("wraps from last image to first on Next click", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    const img = screen.getByTestId("hero-carousel-image") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/img1.jpg");
  });

  it("wraps from first image to last on Prev click", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-prev"));
    const img = screen.getByTestId("hero-carousel-image") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/img3.jpg");
  });

  it("jumps to the correct image when a dot is clicked", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-dot-2"));
    const img = screen.getByTestId("hero-carousel-image") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/img3.jpg");
  });

  it("updates the active dot after navigation", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    expect(screen.getByTestId("hero-carousel-dot-1")).toHaveAttribute("aria-current", "true");
    expect(screen.getByTestId("hero-carousel-dot-0")).not.toHaveAttribute("aria-current");
  });
});

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

describe("HeroImageCarousel — analytics", () => {
  let analytics: AnalyticsClient;

  beforeEach(() => {
    analytics = makeAnalytics();
  });

  it("fires hero_image_swiped with correct imageIndex on Next click", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="deal-abc" analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    expect(analytics.track).toHaveBeenCalledOnce();
    expect(analytics.track).toHaveBeenCalledWith({
      event: "hero_image_swiped",
      dealId: "deal-abc",
      imageIndex: 1,
    });
  });

  it("fires hero_image_swiped when a dot is clicked", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="deal-abc" analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-dot-2"));
    expect(analytics.track).toHaveBeenCalledWith({
      event: "hero_image_swiped",
      dealId: "deal-abc",
      imageIndex: 2,
    });
  });

  it("does NOT fire an event when clicking the already-active dot", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="deal-abc" analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-dot-0"));
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it("does NOT fire an event on mount", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="deal-abc" analytics={analytics} />);
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it("fires one event per navigation action", () => {
    render(<HeroImageCarousel images={THREE_IMAGES} dealId="deal-abc" analytics={analytics} />);
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    fireEvent.click(screen.getByTestId("hero-carousel-next"));
    expect(analytics.track).toHaveBeenCalledTimes(2);
  });
});
