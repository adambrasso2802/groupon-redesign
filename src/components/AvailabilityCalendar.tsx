import React, { useState } from "react";
import type { AnalyticsClient } from "../analytics/client";

export interface AvailabilityCalendarProps {
  /** ISO 8601 date strings (YYYY-MM-DD) that are available for booking */
  availableDates: string[];
  dealId: string;
  analytics: AnalyticsClient;
  onDateSelected?: (dateIso: string) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function AvailabilityCalendar({
  availableDates,
  dealId,
  analytics,
  onDateSelected,
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const availableSet = new Set(availableDates);
  const totalDays = daysInMonth(viewYear, viewMonth);
  const leadingEmpties = firstWeekdayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleDayClick(day: number) {
    const iso = toIso(viewYear, viewMonth, day);
    if (!availableSet.has(iso)) return;
    setSelectedDate(iso);
    analytics.track({ event: "date_selected", dealId, dateIso: iso });
    onDateSelected?.(iso);
  }

  return (
    <div data-testid="availability-calendar" style={{ padding: "0 0 8px" }}>
      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <button
          data-testid="calendar-prev-month"
          onClick={prevMonth}
          aria-label="Previous month"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "4px 8px" }}
        >
          ‹
        </button>
        <span data-testid="calendar-month-label" style={{ fontWeight: 600, fontSize: 15 }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          data-testid="calendar-next-month"
          onClick={nextMonth}
          aria-label="Next month"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "4px 8px" }}
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: 4 }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
        {/* Leading empty cells for first-week offset */}
        {Array.from({ length: leadingEmpties }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const iso = toIso(viewYear, viewMonth, day);
          const isAvailable = availableSet.has(iso);
          const isSelected = iso === selectedDate;

          return (
            <button
              key={iso}
              data-testid={`calendar-day-${iso}`}
              onClick={() => handleDayClick(day)}
              disabled={!isAvailable}
              aria-label={`${iso}${isAvailable ? "" : ", unavailable"}${isSelected ? ", selected" : ""}`}
              aria-pressed={isSelected}
              style={{
                padding: "6px 2px",
                border: "none",
                borderRadius: 4,
                cursor: isAvailable ? "pointer" : "default",
                background: isSelected ? "#22c55e" : "transparent",
                color: isSelected ? "#fff" : isAvailable ? "#111827" : "#d1d5db",
                fontWeight: isSelected ? 700 : 400,
                fontSize: 14,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDate !== null && (
        <p
          data-testid="calendar-selected-date"
          style={{ marginTop: 8, fontSize: 13, color: "#22c55e", fontWeight: 600, margin: "8px 0 0" }}
        >
          Selected: {selectedDate}
        </p>
      )}
    </div>
  );
}
