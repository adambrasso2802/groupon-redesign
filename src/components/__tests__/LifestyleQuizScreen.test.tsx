import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LifestyleQuizScreen, STORAGE_KEY } from "../LifestyleQuizScreen";
import type { AnalyticsClient } from "../../analytics/client";
import type { BudgetRange, LifestylePreference, LocationRadiusMiles } from "../../types/analytics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAnalytics(): AnalyticsClient {
  return { track: vi.fn() };
}

function makeOnComplete() {
  return vi.fn();
}

function renderQuiz(analytics = makeAnalytics(), onComplete = makeOnComplete()) {
  const result = render(<LifestyleQuizScreen analytics={analytics} onComplete={onComplete} />);
  return { ...result, analytics, onComplete };
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Early-exit when preferences already exist
// ---------------------------------------------------------------------------

describe("LifestyleQuizScreen — existing preferences", () => {
  it("renders nothing when preferences already exist in localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedPreferences: [], budgetRange: null, locationRadiusMiles: null }));
    const { container } = renderQuiz();
    expect(container.firstChild).toBeNull();
  });

  it("calls onComplete immediately when preferences already exist", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedPreferences: ["foodie"], budgetRange: "under_25", locationRadiusMiles: 10 }));
    const onComplete = makeOnComplete();
    render(<LifestyleQuizScreen analytics={makeAnalytics()} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("does NOT fire quiz_started when preferences already exist", () => {
    localStorage.setItem(STORAGE_KEY, "{}");
    const analytics = makeAnalytics();
    render(<LifestyleQuizScreen analytics={analytics} onComplete={makeOnComplete()} />);
    expect(analytics.track).not.toHaveBeenCalledWith(expect.objectContaining({ event: "quiz_started" }));
  });
});

// ---------------------------------------------------------------------------
// Initial render — step 1 (interests)
// ---------------------------------------------------------------------------

describe("LifestyleQuizScreen — initial render", () => {
  it("renders the quiz screen", () => {
    renderQuiz();
    expect(screen.getByTestId("lifestyle-quiz-screen")).toBeInTheDocument();
  });

  it("shows progress as '1 of 3' on first step", () => {
    renderQuiz();
    expect(screen.getByTestId("quiz-progress")).toHaveTextContent("1 of 3");
  });

  it("shows the interests step", () => {
    renderQuiz();
    expect(screen.getByTestId("step-interests")).toBeInTheDocument();
  });

  it("renders all 6 lifestyle preference options", () => {
    renderQuiz();
    expect(screen.getByTestId("preference-option-foodie")).toBeInTheDocument();
    expect(screen.getByTestId("preference-option-fitness")).toBeInTheDocument();
    expect(screen.getByTestId("preference-option-parent")).toBeInTheDocument();
    expect(screen.getByTestId("preference-option-pet_owner")).toBeInTheDocument();
    expect(screen.getByTestId("preference-option-wellness_spa")).toBeInTheDocument();
    expect(screen.getByTestId("preference-option-nightlife_daytrip")).toBeInTheDocument();
  });

  it("renders the 'Skip for now' button", () => {
    renderQuiz();
    expect(screen.getByTestId("quiz-skip")).toBeInTheDocument();
  });

  it("renders the 'Continue' button on step 1", () => {
    renderQuiz();
    expect(screen.getByTestId("quiz-continue")).toBeInTheDocument();
  });

  it("fires quiz_started on mount", () => {
    const analytics = makeAnalytics();
    render(<LifestyleQuizScreen analytics={analytics} onComplete={makeOnComplete()} />);
    expect(analytics.track).toHaveBeenCalledWith({ event: "quiz_started" });
  });

  it("does NOT call onComplete on initial render when no preferences exist", () => {
    const onComplete = makeOnComplete();
    render(<LifestyleQuizScreen analytics={makeAnalytics()} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Step 1 — lifestyle preference selection
// ---------------------------------------------------------------------------

describe("LifestyleQuizScreen — preference selection", () => {
  it("marks an option as selected when clicked", () => {
    renderQuiz();
    const btn = screen.getByTestId("preference-option-foodie");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("deselects an option when clicked a second time", () => {
    renderQuiz();
    const btn = screen.getByTestId("preference-option-foodie");
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("fires lifestyle_preference_selected when a preference is selected", () => {
    const analytics = makeAnalytics();
    render(<LifestyleQuizScreen analytics={analytics} onComplete={makeOnComplete()} />);
    fireEvent.click(screen.getByTestId("preference-option-fitness"));
    expect(analytics.track).toHaveBeenCalledWith({ event: "lifestyle_preference_selected", preference: "fitness" });
  });

  it("does NOT fire lifestyle_preference_selected when a preference is deselected", () => {
    const analytics = makeAnalytics();
    render(<LifestyleQuizScreen analytics={analytics} onComplete={makeOnComplete()} />);
    fireEvent.click(screen.getByTestId("preference-option-fitness"));
    const callCountAfterSelect = (analytics.track as ReturnType<typeof vi.fn>).mock.calls.length;
    fireEvent.click(screen.getByTestId("preference-option-fitness"));
    expect((analytics.track as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCountAfterSelect);
  });

  it("allows selecting multiple preferences", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("preference-option-foodie"));
    fireEvent.click(screen.getByTestId("preference-option-wellness_spa"));
    expect(screen.getByTestId("preference-option-foodie")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("preference-option-wellness_spa")).toHaveAttribute("aria-pressed", "true");
  });
});

// ---------------------------------------------------------------------------
// Step navigation
// ---------------------------------------------------------------------------

describe("LifestyleQuizScreen — step navigation", () => {
  it("advances to step 2 (budget) when Continue is clicked on step 1", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    expect(screen.getByTestId("step-budget")).toBeInTheDocument();
    expect(screen.queryByTestId("step-interests")).not.toBeInTheDocument();
  });

  it("shows progress as '2 of 3' on step 2", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    expect(screen.getByTestId("quiz-progress")).toHaveTextContent("2 of 3");
  });

  it("advances to step 3 (radius) after selecting a budget and clicking Continue", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("budget-option-25_to_50"));
    fireEvent.click(screen.getByTestId("quiz-continue"));
    expect(screen.getByTestId("step-radius")).toBeInTheDocument();
    expect(screen.queryByTestId("step-budget")).not.toBeInTheDocument();
  });

  it("shows progress as '3 of 3' on step 3", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("budget-option-50_to_100"));
    fireEvent.click(screen.getByTestId("quiz-continue"));
    expect(screen.getByTestId("quiz-progress")).toHaveTextContent("3 of 3");
  });

  it("goes back from step 2 to step 1 when Back is clicked", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("quiz-back"));
    expect(screen.getByTestId("step-interests")).toBeInTheDocument();
  });

  it("goes back from step 3 to step 2 when Back is clicked", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("budget-option-under_25"));
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("quiz-back"));
    expect(screen.getByTestId("step-budget")).toBeInTheDocument();
  });

  it("Continue is disabled on step 2 when no budget is selected", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    expect(screen.getByTestId("quiz-continue")).toBeDisabled();
  });

  it("Continue is enabled on step 2 after selecting a budget", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("budget-option-over_100"));
    expect(screen.getByTestId("quiz-continue")).not.toBeDisabled();
  });

  it("Finish is disabled on step 3 when no radius is selected", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("budget-option-25_to_50"));
    fireEvent.click(screen.getByTestId("quiz-continue"));
    expect(screen.getByTestId("quiz-finish")).toBeDisabled();
  });

  it("Finish is enabled on step 3 after selecting a radius", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("budget-option-25_to_50"));
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("radius-option-10"));
    expect(screen.getByTestId("quiz-finish")).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Budget step
// ---------------------------------------------------------------------------

describe("LifestyleQuizScreen — budget step", () => {
  function goToBudgetStep() {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
  }

  it("renders all 4 budget options", () => {
    goToBudgetStep();
    expect(screen.getByTestId("budget-option-under_25")).toBeInTheDocument();
    expect(screen.getByTestId("budget-option-25_to_50")).toBeInTheDocument();
    expect(screen.getByTestId("budget-option-50_to_100")).toBeInTheDocument();
    expect(screen.getByTestId("budget-option-over_100")).toBeInTheDocument();
  });

  it("marks a budget option as selected when clicked", () => {
    goToBudgetStep();
    fireEvent.click(screen.getByTestId("budget-option-25_to_50"));
    expect(screen.getByTestId("budget-option-25_to_50")).toHaveAttribute("aria-pressed", "true");
  });

  it("deselects a previously selected budget when another is chosen", () => {
    goToBudgetStep();
    fireEvent.click(screen.getByTestId("budget-option-under_25"));
    fireEvent.click(screen.getByTestId("budget-option-50_to_100"));
    expect(screen.getByTestId("budget-option-under_25")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("budget-option-50_to_100")).toHaveAttribute("aria-pressed", "true");
  });
});

// ---------------------------------------------------------------------------
// Radius step
// ---------------------------------------------------------------------------

describe("LifestyleQuizScreen — radius step", () => {
  function goToRadiusStep(analytics = makeAnalytics(), onComplete = makeOnComplete()) {
    render(<LifestyleQuizScreen analytics={analytics} onComplete={onComplete} />);
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("budget-option-25_to_50"));
    fireEvent.click(screen.getByTestId("quiz-continue"));
    return { analytics, onComplete };
  }

  it("renders all 4 radius options", () => {
    goToRadiusStep();
    expect(screen.getByTestId("radius-option-5")).toBeInTheDocument();
    expect(screen.getByTestId("radius-option-10")).toBeInTheDocument();
    expect(screen.getByTestId("radius-option-25")).toBeInTheDocument();
    expect(screen.getByTestId("radius-option-50")).toBeInTheDocument();
  });

  it("marks a radius option as selected when clicked", () => {
    goToRadiusStep();
    fireEvent.click(screen.getByTestId("radius-option-25"));
    expect(screen.getByTestId("radius-option-25")).toHaveAttribute("aria-pressed", "true");
  });

  it("deselects a previously selected radius when another is chosen", () => {
    goToRadiusStep();
    fireEvent.click(screen.getByTestId("radius-option-5"));
    fireEvent.click(screen.getByTestId("radius-option-50"));
    expect(screen.getByTestId("radius-option-5")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("radius-option-50")).toHaveAttribute("aria-pressed", "true");
  });
});

// ---------------------------------------------------------------------------
// Completion — analytics + localStorage + callback
// ---------------------------------------------------------------------------

describe("LifestyleQuizScreen — completion", () => {
  function completeQuiz({
    preferences = ["foodie", "fitness"] as LifestylePreference[],
    budget = "25_to_50" as BudgetRange,
    radius = 10 as LocationRadiusMiles,
    analytics = makeAnalytics(),
    onComplete = makeOnComplete(),
  }: {
    preferences?: LifestylePreference[];
    budget?: BudgetRange;
    radius?: LocationRadiusMiles;
    analytics?: AnalyticsClient;
    onComplete?: ReturnType<typeof makeOnComplete>;
  } = {}) {
    render(<LifestyleQuizScreen analytics={analytics} onComplete={onComplete} />);
    for (const pref of preferences) {
      fireEvent.click(screen.getByTestId(`preference-option-${pref}`));
    }
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId(`budget-option-${budget}`));
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId(`radius-option-${radius}`));
    fireEvent.click(screen.getByTestId("quiz-finish"));
    return { analytics, onComplete };
  }

  it("fires quiz_completed with all three answers", () => {
    const { analytics } = completeQuiz({ preferences: ["foodie", "parent"], budget: "50_to_100", radius: 25 });
    expect(analytics.track).toHaveBeenCalledWith({
      event: "quiz_completed",
      selectedPreferences: ["foodie", "parent"],
      budgetRange: "50_to_100",
      locationRadiusMiles: 25,
    });
  });

  it("fires quiz_completed with empty preferences when none were selected", () => {
    const { analytics } = completeQuiz({ preferences: [], budget: "under_25", radius: 5 });
    expect(analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({ event: "quiz_completed", selectedPreferences: [] }),
    );
  });

  it("calls onComplete after finishing", () => {
    const { onComplete } = completeQuiz();
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("saves preferences to localStorage under the correct key", () => {
    completeQuiz({ preferences: ["wellness_spa"], budget: "over_100", radius: 50 });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual({
      selectedPreferences: ["wellness_spa"],
      budgetRange: "over_100",
      locationRadiusMiles: 50,
    });
  });

  it("persists all selected preferences to localStorage", () => {
    completeQuiz({ preferences: ["foodie", "fitness", "pet_owner"], budget: "25_to_50", radius: 10 });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.selectedPreferences).toEqual(["foodie", "fitness", "pet_owner"]);
  });

  it("does NOT fire quiz_skipped on completion", () => {
    const { analytics } = completeQuiz();
    expect(analytics.track).not.toHaveBeenCalledWith(expect.objectContaining({ event: "quiz_skipped" }));
  });
});

// ---------------------------------------------------------------------------
// Skip — analytics + localStorage + callback
// ---------------------------------------------------------------------------

describe("LifestyleQuizScreen — skip", () => {
  it("fires quiz_skipped when 'Skip for now' is clicked", () => {
    const analytics = makeAnalytics();
    render(<LifestyleQuizScreen analytics={analytics} onComplete={makeOnComplete()} />);
    fireEvent.click(screen.getByTestId("quiz-skip"));
    expect(analytics.track).toHaveBeenCalledWith({ event: "quiz_skipped" });
  });

  it("calls onComplete after skipping", () => {
    const onComplete = makeOnComplete();
    render(<LifestyleQuizScreen analytics={makeAnalytics()} onComplete={onComplete} />);
    fireEvent.click(screen.getByTestId("quiz-skip"));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("saves an empty preferences marker to localStorage on skip (so quiz is not shown again)", () => {
    render(<LifestyleQuizScreen analytics={makeAnalytics()} onComplete={makeOnComplete()} />);
    fireEvent.click(screen.getByTestId("quiz-skip"));
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("does NOT fire quiz_completed when skipped", () => {
    const analytics = makeAnalytics();
    render(<LifestyleQuizScreen analytics={makeAnalytics()} onComplete={makeOnComplete()} />);
    fireEvent.click(screen.getByTestId("quiz-skip"));
    expect(analytics.track).not.toHaveBeenCalledWith(expect.objectContaining({ event: "quiz_completed" }));
  });

  it("'Skip for now' is visible on step 2", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    expect(screen.getByTestId("quiz-skip")).toBeInTheDocument();
  });

  it("'Skip for now' is visible on step 3", () => {
    renderQuiz();
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("budget-option-under_25"));
    fireEvent.click(screen.getByTestId("quiz-continue"));
    expect(screen.getByTestId("quiz-skip")).toBeInTheDocument();
  });

  it("skipping mid-quiz does not fire quiz_completed", () => {
    const analytics = makeAnalytics();
    render(<LifestyleQuizScreen analytics={analytics} onComplete={makeOnComplete()} />);
    fireEvent.click(screen.getByTestId("preference-option-foodie"));
    fireEvent.click(screen.getByTestId("quiz-continue"));
    fireEvent.click(screen.getByTestId("quiz-skip"));
    expect(analytics.track).not.toHaveBeenCalledWith(expect.objectContaining({ event: "quiz_completed" }));
    expect(analytics.track).toHaveBeenCalledWith({ event: "quiz_skipped" });
  });
});
