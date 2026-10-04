/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const LEGAL_DOCS = ['offer', 'privacy', 'terms'] as const

export type LegalDoc = typeof LEGAL_DOCS[number]

export const LEGAL_SLUG_PREFIX = 'legal-'
