import type { BudgetRange, LifestylePreference, LocationRadiusMiles } from "./analytics";

export interface GrouponPreferences {
  selectedPreferences: LifestylePreference[];
  /** null when the user skipped the budget question */
  budgetRange: BudgetRange | null;
  /** null when the user skipped the location question */
  locationRadiusMiles: LocationRadiusMiles | null;
}
