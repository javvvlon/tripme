/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const ModalSize = {
  Small: 'sm',
  Medium: 'md',
} as const

export type ModalSizeValue = typeof ModalSize[keyof typeof ModalSize]
