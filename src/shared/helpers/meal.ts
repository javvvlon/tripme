/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const MEAL_PLAN_CODES = ['RO', 'BB', 'HB', 'FB', 'AI', 'UAI', 'PROGRAM'] as const

export const isMealPlan = (value: string | null | undefined): boolean =>
  Boolean(value) && (MEAL_PLAN_CODES as readonly string[]).includes(value as string)

export const mealText = (t: (key: string) => string, plan: string | null | undefined, fallback: string | null | undefined): string =>
  isMealPlan(plan) ? t(`filters.mealPlans.${plan}`) : (fallback ?? '')
