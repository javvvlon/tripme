/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ITrendPoint {
  key: string
  label: string
  value: number
  tooltip: string[]
}

export interface ITrendChartProps {
  points: ITrendPoint[]
  caption: string
}
