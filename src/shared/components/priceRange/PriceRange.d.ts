/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPriceBucket {
  from: number
  to: number
  count: number
}

export interface IPriceRangeProps {
  buckets: IPriceBucket[]
  min: number
  max: number
  fromLabel: string
  toLabel: string
  format?: (value: number) => string
}
