import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PricingBreakdownPanel } from "../PricingBreakdownPanel";
import type { PriceBreakdown } from "../../types/deal";

const PRICING: PriceBreakdown = {
  dealPriceCents: 4999,
  originalPriceCents: 12000,
  serviceFeeCents: 199,
  taxCents: 400,
  shippingCents: 0,
  totalCents: 5598,
};

describe("PricingBreakdownPanel — rendering", () => {
  it("renders the panel container", () => {
    render(<PricingBreakdownPanel pricing={PRICING} />);
    expect(screen.getByTestId("pricing-breakdown-panel")).toBeInTheDocument();
  });

  it("renders the deal price", () => {
    render(<PricingBreakdownPanel pricing={PRICING} />);
    expect(screen.getByTestId("pricing-deal-price")).toHaveTextContent("$49.99");
  });

  it("renders the original price", () => {
    render(<PricingBreakdownPanel pricing={PRICING} />);
    expect(screen.getByTestId("pricing-original-price")).toHaveTextContent("$120.00");
  });

  it("renders the service fee", () => {
    render(<PricingBreakdownPanel pricing={PRICING} />);
    expect(screen.getByTestId("pricing-service-fee")).toHaveTextContent("$1.99");
  });

  it("renders tax", () => {
    render(<PricingBreakdownPanel pricing={PRICING} />);
    expect(screen.getByTestId("pricing-tax")).toHaveTextContent("$4.00");
  });

  it("renders shipping (zero)", () => {
    render(<PricingBreakdownPanel pricing={PRICING} />);
    expect(screen.getByTestId("pricing-shipping")).toHaveTextContent("$0.00");
  });

  it("renders the total", () => {
    render(<PricingBreakdownPanel pricing={PRICING} />);
    expect(screen.getByTestId("pricing-total")).toHaveTextContent("$55.98");
  });

  it("renders non-zero shipping amount", () => {
    const p: PriceBreakdown = { ...PRICING, shippingCents: 599 };
    render(<PricingBreakdownPanel pricing={p} />);
    expect(screen.getByTestId("pricing-shipping")).toHaveTextContent("$5.99");
  });

  it("formats cents correctly for whole dollar amounts", () => {
    const p: PriceBreakdown = { ...PRICING, dealPriceCents: 5000 };
    render(<PricingBreakdownPanel pricing={p} />);
    expect(screen.getByTestId("pricing-deal-price")).toHaveTextContent("$50.00");
  });

  it("renders all six fields in a single render", () => {
    render(<PricingBreakdownPanel pricing={PRICING} />);
    const fields = [
      "pricing-deal-price",
      "pricing-original-price",
      "pricing-service-fee",
      "pricing-tax",
      "pricing-shipping",
      "pricing-total",
    ];
    for (const testId of fields) {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
  });
});
