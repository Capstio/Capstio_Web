// Prices set by the owner, in USD. The pricing section and the structured data
// both read them from here so the page and search engines never disagree.
// `period` is an ISO 8601 duration: one year for Personal, one month per
// person for Team.
export const plans = {
  personal: { price: 29, period: "P1Y" },
  team: { price: 8, period: "P1M" },
} as const;

export type PlanId = keyof typeof plans;

export const planIds = Object.keys(plans) as PlanId[];

export const trialDays = 14;

export const currency = "USD";
