/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const FEEDBACK_CATEGORIES = ['BUG', 'INQUIRY', 'IDEA'] as const

export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number]

export const DEFAULT_CATEGORY: FeedbackCategory = 'IDEA'
