import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IEsimPickerProps {
  initialCountry?: string
}

export interface IEsimPickerEmits {
  pick: [trip: ILeadTrip]
}
