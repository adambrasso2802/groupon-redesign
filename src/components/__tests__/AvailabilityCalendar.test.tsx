import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AvailabilityCalendar } from "../AvailabilityCalendar";
import type { AnalyticsClient } from "../../analytics/client";

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

// The calendar initialises to today's date. To make assertions deterministic we
// use a fixed set of available dates that spans a known month.
// new Date() will return the real "today" — these tests avoid depending on the
// starting month by navigating if needed, or by constructing dates relative to
// today's year/month.

function todayYearMonth(): { year: number; month: number } {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("AvailabilityCalendar — rendering", () => {
  it("renders the calendar container", () => {
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={makeAnalytics()} />);
    expect(screen.getByTestId("availability-calendar")).toBeInTheDocument();
  });

  it("shows a month label on mount", () => {
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={makeAnalytics()} />);
    expect(screen.getByTestId("calendar-month-label")).toBeInTheDocument();
  });

  it("renders prev and next month buttons", () => {
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={makeAnalytics()} />);
    expect(screen.getByTestId("calendar-prev-month")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-next-month")).toBeInTheDocument();
  });

  it("does not show a selected date message on mount", () => {
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={makeAnalytics()} />);
    expect(screen.queryByTestId("calendar-selected-date")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Available vs unavailable dates
// ---------------------------------------------------------------------------

describe("AvailabilityCalendar — available/unavailable dates", () => {
  it("renders an available day as an enabled button", () => {
    const { year, month } = todayYearMonth();
    const iso = isoDate(year, month, 15);
    render(<AvailabilityCalendar availableDates={[iso]} dealId="d1" analytics={makeAnalytics()} />);
    const btn = screen.getByTestId(`calendar-day-${iso}`) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it("renders an unavailable day as a disabled button", () => {
    const { year, month } = todayYearMonth();
    const iso = isoDate(year, month, 10);
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={makeAnalytics()} />);
    const btn = screen.getByTestId(`calendar-day-${iso}`) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("clicking an unavailable date does nothing", () => {
    const { year, month } = todayYearMonth();
    const iso = isoDate(year, month, 5);
    const analytics = makeAnalytics();
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId(`calendar-day-${iso}`));
    expect(analytics.track).not.toHaveBeenCalled();
    expect(screen.queryByTestId("calendar-selected-date")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Date selection
// ---------------------------------------------------------------------------

describe("AvailabilityCalendar — date selection", () => {
  let analytics: AnalyticsClient;

  beforeEach(() => {
    analytics = makeAnalytics();
  });

  it("shows the selected date label after clicking an available date", () => {
    const { year, month } = todayYearMonth();
    const iso = isoDate(year, month, 20);
    render(<AvailabilityCalendar availableDates={[iso]} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId(`calendar-day-${iso}`));
    expect(screen.getByTestId("calendar-selected-date")).toHaveTextContent(`Selected: ${iso}`);
  });

  it("marks the selected day button as pressed", () => {
    const { year, month } = todayYearMonth();
    const iso = isoDate(year, month, 20);
    render(<AvailabilityCalendar availableDates={[iso]} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId(`calendar-day-${iso}`));
    expect(screen.getByTestId(`calendar-day-${iso}`)).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onDateSelected with the ISO string", () => {
    const { year, month } = todayYearMonth();
    const iso = isoDate(year, month, 12);
    const onDateSelected = vi.fn();
    render(
      <AvailabilityCalendar
        availableDates={[iso]}
        dealId="d1"
        analytics={analytics}
        onDateSelected={onDateSelected}
      />,
    );
    fireEvent.click(screen.getByTestId(`calendar-day-${iso}`));
    expect(onDateSelected).toHaveBeenCalledOnce();
    expect(onDateSelected).toHaveBeenCalledWith(iso);
  });

  it("updates the selected date when a different available date is clicked", () => {
    const { year, month } = todayYearMonth();
    const iso1 = isoDate(year, month, 10);
    const iso2 = isoDate(year, month, 20);
    render(<AvailabilityCalendar availableDates={[iso1, iso2]} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId(`calendar-day-${iso1}`));
    fireEvent.click(screen.getByTestId(`calendar-day-${iso2}`));
    expect(screen.getByTestId("calendar-selected-date")).toHaveTextContent(`Selected: ${iso2}`);
  });
});

// ---------------------------------------------------------------------------
// Analytics — date_selected event
// ---------------------------------------------------------------------------

describe("AvailabilityCalendar — analytics", () => {
  let analytics: AnalyticsClient;

  beforeEach(() => {
    analytics = makeAnalytics();
  });

  it("fires date_selected with correct payload when an available date is clicked", () => {
    const { year, month } = todayYearMonth();
    const iso = isoDate(year, month, 15);
    render(<AvailabilityCalendar availableDates={[iso]} dealId="deal-xyz" analytics={analytics} />);
    fireEvent.click(screen.getByTestId(`calendar-day-${iso}`));
    expect(analytics.track).toHaveBeenCalledOnce();
    expect(analytics.track).toHaveBeenCalledWith({
      event: "date_selected",
      dealId: "deal-xyz",
      dateIso: iso,
    });
  });

  it("fires a separate event for each distinct date selection", () => {
    const { year, month } = todayYearMonth();
    const iso1 = isoDate(year, month, 8);
    const iso2 = isoDate(year, month, 22);
    render(<AvailabilityCalendar availableDates={[iso1, iso2]} dealId="d1" analytics={analytics} />);
    fireEvent.click(screen.getByTestId(`calendar-day-${iso1}`));
    fireEvent.click(screen.getByTestId(`calendar-day-${iso2}`));
    expect(analytics.track).toHaveBeenCalledTimes(2);
  });

  it("does not fire on mount", () => {
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={analytics} />);
    expect(analytics.track).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Month navigation
// ---------------------------------------------------------------------------

describe("AvailabilityCalendar — month navigation", () => {
  it("advances to the next month on Next click", () => {
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={makeAnalytics()} />);
    const label = screen.getByTestId("calendar-month-label").textContent ?? "";
    fireEvent.click(screen.getByTestId("calendar-next-month"));
    const newLabel = screen.getByTestId("calendar-month-label").textContent ?? "";
    expect(newLabel).not.toBe(label);
  });

  it("goes back to the previous month on Prev click", () => {
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={makeAnalytics()} />);
    const label = screen.getByTestId("calendar-month-label").textContent ?? "";
    fireEvent.click(screen.getByTestId("calendar-prev-month"));
    const newLabel = screen.getByTestId("calendar-month-label").textContent ?? "";
    expect(newLabel).not.toBe(label);
  });

  it("shows dates from the navigated month", () => {
    render(<AvailabilityCalendar availableDates={[]} dealId="d1" analytics={makeAnalytics()} />);
    // Navigate to next month and confirm day 1 exists for that month
    fireEvent.click(screen.getByTestId("calendar-next-month"));
    const { year, month } = (() => {
      const d = new Date();
      const nextMonth = d.getMonth() === 11 ? 0 : d.getMonth() + 1;
      const nextYear = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
      return { year: nextYear, month: nextMonth };
    })();
    const iso = isoDate(year, month, 1);
    expect(screen.getByTestId(`calendar-day-${iso}`)).toBeInTheDocument();
  });
});
