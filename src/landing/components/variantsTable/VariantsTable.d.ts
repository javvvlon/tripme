import type { Tour } from '~/search_engine/models/Tour'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IVariantsTableProps {
  tours: Tour[]
}

export interface IVariantsTableEmits {
  (event: 'choose', tour: Tour): void
}
