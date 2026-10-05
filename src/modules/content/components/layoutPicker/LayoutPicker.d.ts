import type { IGrid } from '~/shared/helpers/grid'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ILayoutOption {
  uuid: string
  name: string
  grid: IGrid
}

export interface ILayoutPickerProps {
  label: string
  options: ILayoutOption[]
  addLabel: string
}
