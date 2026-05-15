import type { BudgetRange, LifestylePreference, LocationRadiusMiles } from "./analytics";

export interface GrouponPreferences {
  selectedPreferences: LifestylePreference[];
  /** null when the user skipped the budget question */
  budgetRange: BudgetRange | null;
  /** null when the user skipped the location question */
  locationRadiusMiles: LocationRadiusMiles | null;
}

export type NotificationCategory =
  | "deal_alerts"
  | "booking_reminders"
  | "promotional_emails"
  | "app_push";

export interface NotificationPreferences {
  /** Master "Pause all" — when true, overrides every per-category toggle */
  allPaused: boolean;
  categories: Record<NotificationCategory, boolean>;
}
