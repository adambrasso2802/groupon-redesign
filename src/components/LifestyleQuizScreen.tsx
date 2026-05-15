import React, { useState, useEffect } from "react";
import type { AnalyticsClient } from "../analytics/client";
import type { BudgetRange, LifestylePreference, LocationRadiusMiles } from "../types/analytics";
import type { GrouponPreferences } from "../types/preferences";

export const STORAGE_KEY = "groupon_preferences";

export interface LifestyleQuizScreenProps {
  analytics: AnalyticsClient;
  onComplete: () => void;
}

const LIFESTYLE_OPTIONS: { value: LifestylePreference; label: string }[] = [
  { value: "foodie", label: "Foodie" },
  { value: "fitness", label: "Fitness" },
  { value: "parent", label: "Parent" },
  { value: "pet_owner", label: "Pet Owner" },
  { value: "wellness_spa", label: "Wellness & Spa" },
  { value: "nightlife_daytrip", label: "Nightlife & Day Trips" },
];

const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: "under_25", label: "Under $25" },
  { value: "25_to_50", label: "$25 – $50" },
  { value: "50_to_100", label: "$50 – $100" },
  { value: "over_100", label: "Over $100" },
];

const RADIUS_OPTIONS: { value: LocationRadiusMiles; label: string }[] = [
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 25, label: "25 miles" },
  { value: 50, label: "50 miles" },
];

export function LifestyleQuizScreen({ analytics, onComplete }: LifestyleQuizScreenProps) {
  const [shouldSkip] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  const [step, setStep] = useState(0);
  const [selectedPreferences, setSelectedPreferences] = useState<LifestylePreference[]>([]);
  const [budgetRange, setBudgetRange] = useState<BudgetRange | null>(null);
  const [locationRadiusMiles, setLocationRadiusMiles] = useState<LocationRadiusMiles | null>(null);

  useEffect(() => {
    if (shouldSkip) {
      onComplete();
      return;
    }
    analytics.track({ event: "quiz_started" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shouldSkip) return null;

  function saveAndComplete(prefs: GrouponPreferences) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // localStorage unavailable — continue without saving
    }
  }

  function handleSkip() {
    analytics.track({ event: "quiz_skipped" });
    saveAndComplete({ selectedPreferences: [], budgetRange: null, locationRadiusMiles: null });
    onComplete();
  }

  function handlePreferenceToggle(pref: LifestylePreference) {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
    } else {
      analytics.track({ event: "lifestyle_preference_selected", preference: pref });
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  }

  function handleFinish(radius: LocationRadiusMiles) {
    const prefs: GrouponPreferences = {
      selectedPreferences,
      budgetRange,
      locationRadiusMiles: radius,
    };
    saveAndComplete(prefs);
    analytics.track({
      event: "quiz_completed",
      selectedPreferences,
      budgetRange: budgetRange!,
      locationRadiusMiles: radius,
    });
    onComplete();
  }

  const TOTAL_STEPS = 3;

  return (
    <div data-testid="lifestyle-quiz-screen" style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <div
        data-testid="quiz-progress"
        style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}
        aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
      >
        {step + 1} of {TOTAL_STEPS}
      </div>

      {step === 0 && (
        <div data-testid="step-interests">
          <h2 data-testid="quiz-question">What are you into?</h2>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>Select everything that fits — we'll personalize your deals.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {LIFESTYLE_OPTIONS.map(({ value, label }) => {
              const selected = selectedPreferences.includes(value);
              return (
                <button
                  key={value}
                  data-testid={`preference-option-${value}`}
                  aria-pressed={selected}
                  onClick={() => handlePreferenceToggle(value)}
                  style={{
                    padding: "14px 10px",
                    borderRadius: 8,
                    border: selected ? "2px solid #16a34a" : "2px solid #e5e7eb",
                    background: selected ? "#f0fdf4" : "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            data-testid="quiz-continue"
            onClick={() => setStep(1)}
            style={{ width: "100%", padding: "14px 0", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}
          >
            Continue
          </button>
        </div>
      )}

      {step === 1 && (
        <div data-testid="step-budget">
          <h2 data-testid="quiz-question">What's your typical deal budget?</h2>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>We'll surface deals in your sweet spot.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {BUDGET_OPTIONS.map(({ value, label }) => {
              const selected = budgetRange === value;
              return (
                <button
                  key={value}
                  data-testid={`budget-option-${value}`}
                  aria-pressed={selected}
                  onClick={() => setBudgetRange(value)}
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderRadius: 8,
                    border: selected ? "2px solid #16a34a" : "2px solid #e5e7eb",
                    background: selected ? "#f0fdf4" : "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            data-testid="quiz-back"
            onClick={() => setStep(0)}
            style={{ width: "100%", padding: "14px 0", background: "transparent", border: "2px solid #e5e7eb", borderRadius: 8, fontWeight: 500, cursor: "pointer", marginBottom: 12 }}
          >
            Back
          </button>
          <button
            data-testid="quiz-continue"
            disabled={budgetRange === null}
            onClick={() => setStep(2)}
            style={{ width: "100%", padding: "14px 0", background: budgetRange ? "#16a34a" : "#d1fae5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: budgetRange ? "pointer" : "default", marginBottom: 12 }}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div data-testid="step-radius">
          <h2 data-testid="quiz-question">How far will you travel for a deal?</h2>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>We'll show deals near you within this distance.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {RADIUS_OPTIONS.map(({ value, label }) => {
              const selected = locationRadiusMiles === value;
              return (
                <button
                  key={value}
                  data-testid={`radius-option-${value}`}
                  aria-pressed={selected}
                  onClick={() => setLocationRadiusMiles(value)}
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    borderRadius: 8,
                    border: selected ? "2px solid #16a34a" : "2px solid #e5e7eb",
                    background: selected ? "#f0fdf4" : "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            data-testid="quiz-back"
            onClick={() => setStep(1)}
            style={{ width: "100%", padding: "14px 0", background: "transparent", border: "2px solid #e5e7eb", borderRadius: 8, fontWeight: 500, cursor: "pointer", marginBottom: 12 }}
          >
            Back
          </button>
          <button
            data-testid="quiz-finish"
            disabled={locationRadiusMiles === null}
            onClick={() => locationRadiusMiles !== null && handleFinish(locationRadiusMiles)}
            style={{ width: "100%", padding: "14px 0", background: locationRadiusMiles ? "#16a34a" : "#d1fae5", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: locationRadiusMiles ? "pointer" : "default", marginBottom: 12 }}
          >
            Finish
          </button>
        </div>
      )}

      <button
        data-testid="quiz-skip"
        onClick={handleSkip}
        style={{ width: "100%", padding: "12px 0", background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", textDecoration: "underline" }}
      >
        Skip for now
      </button>
    </div>
  );
}
