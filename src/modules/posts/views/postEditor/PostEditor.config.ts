/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const POST_IMAGE = {
  accept: ['image/png', 'image/jpeg'],
  maxSize: 4 * 1024 * 1024,
  maxWidth: 4000,
  maxHeight: 3000,
} as const

export const POST_TITLE_MAX = 160

export const POST_EXCERPT_MAX = 320
