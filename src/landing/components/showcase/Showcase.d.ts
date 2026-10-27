import type { IShowcaseCard } from '~/search_engine/contracts/showcase'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IShowcaseView extends IShowcaseCard {
  link: string
  price: string
  priceUzs: string
  when: string
  saving: string
}
