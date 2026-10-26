import type { ILeadRaw, ILeadSearchDestination } from '~/modules/leads/contracts/leads'
import type { IPlanRoom } from '~/modules/leads/helpers/ai-search'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IAiRequestProps {
  lead: ILeadRaw
}

export interface IAiRequestFact {
  key: string
  icon: string
  lines: string[]
  hints: string[]
}

export interface IAiRequestSearch {
  key: string
  title: string
  lines: string[]
  hints: string[]
  destination: ILeadSearchDestination
  room?: IPlanRoom
}
