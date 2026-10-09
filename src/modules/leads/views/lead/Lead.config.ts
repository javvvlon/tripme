/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const LEAD_TABS = ['tour', 'request', 'orders', 'history'] as const

export type LeadTab = typeof LEAD_TABS[number]
