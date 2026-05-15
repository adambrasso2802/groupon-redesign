import React, { useState } from "react";
import type { AnalyticsClient } from "../analytics/client";

export interface HeroImageCarouselProps {
  images: [string, ...string[]];
  dealId: string;
  analytics: AnalyticsClient;
}

export function HeroImageCarousel({ images, dealId, analytics }: HeroImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  function goTo(index: number) {
    if (index === activeIndex) return;
    setActiveIndex(index);
    analytics.track({ event: "hero_image_swiped", dealId, imageIndex: index });
  }

  function prev() {
    goTo((activeIndex - 1 + images.length) % images.length);
  }

  function next() {
    goTo((activeIndex + 1) % images.length);
  }

  const currentImage = images[activeIndex] ?? images[0];

  return (
    <div data-testid="hero-image-carousel" style={{ position: "relative" }}>
      <img
        src={currentImage}
        alt={`Hero image ${activeIndex + 1} of ${images.length}`}
        data-testid="hero-carousel-image"
        style={{ width: "100%", display: "block" }}
      />

      <span
        data-testid="hero-carousel-counter"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          borderRadius: 4,
          padding: "2px 6px",
          fontSize: 12,
        }}
      >
        {activeIndex + 1} / {images.length}
      </span>

      {images.length > 1 && (
        <>
          <button
            data-testid="hero-carousel-prev"
            onClick={prev}
            aria-label="Previous image"
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.4)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ‹
          </button>
          <button
            data-testid="hero-carousel-next"
            onClick={next}
            aria-label="Next image"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.4)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ›
          </button>

          <div
            data-testid="hero-carousel-indicators"
            style={{ display: "flex", justifyContent: "center", gap: 6, padding: "8px 0" }}
          >
            {images.map((_, i) => (
              <button
                key={i}
                data-testid={`hero-carousel-dot-${i}`}
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === activeIndex ? "true" : undefined}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: i === activeIndex ? "#1a1a1a" : "#d1d5db",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
