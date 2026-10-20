/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IAiInputProps {
  placeholder: string
  busy?: boolean
  images?: boolean
  autofocus?: boolean
}

export interface IAiInputExpose {
  focus: () => void
  attach: () => void
}
