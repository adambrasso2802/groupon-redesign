import type { AnalyticsEvent } from "../types/analytics";

export interface AnalyticsClient {
  track(event: AnalyticsEvent): void;
}

export function createAnalyticsClient(): AnalyticsClient {
  return {
    track(event: AnalyticsEvent): void {
      console.log("[analytics]", event.event, event);
    },
  };
}
