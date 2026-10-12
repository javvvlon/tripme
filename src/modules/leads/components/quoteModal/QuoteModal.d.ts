import type { Tour } from '~/search_engine/models/Tour'
import type { ITripRoute } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IQuoteModalProps {
  tours: Tour[]
  destination: string
  departure: string
  leadId?: string
  route?: ITripRoute
  passport?: string | null
  pdf?: boolean
  pdfBusy?: boolean
}

export type QuoteLanguage = 'ru' | 'uz' | 'en'
