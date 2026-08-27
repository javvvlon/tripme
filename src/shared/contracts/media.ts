/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type PhotoTint = 'a' | 'b' | 'c' | 'd'

export interface IPhoto {
  src: string | null
  alt: string
  tint?: PhotoTint
}
