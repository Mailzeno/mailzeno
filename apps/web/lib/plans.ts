export type PlanType = "free" | "pro";

export interface PlanConfig {
  dailyLimit: number;
  perMinuteLimit: number;
  retentionDays: number;
  maxHtmlSize: number;
  bulkEnabled: boolean;
}

export const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
  free: {
    dailyLimit: 100,
    perMinuteLimit: 5,
    retentionDays: 7,
    maxHtmlSize: 100_000,
    bulkEnabled: false,
  },

  pro: {
    dailyLimit: 2000,
    perMinuteLimit: 30,
    retentionDays: 30,
    maxHtmlSize: 100_000,
    bulkEnabled: true,
  },
};
