/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IBarRow {
  key: string
  label: string
  value: number
  display: string
  hint?: string
}

export interface IBarListProps {
  rows: IBarRow[]
  empty: string
}
