import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IQuoteModalProps {
  tours: Tour[]
  destination: string
  departure: string
  leadId?: string
  passport?: string | null
  pdf?: boolean
  pdfBusy?: boolean
}

export type QuoteLanguage = 'ru' | 'uz' | 'en'
