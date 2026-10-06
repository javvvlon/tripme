/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type PostSort = 'title' | 'author' | 'status' | 'published' | 'updated'

export type PostFilter = 'all' | 'published' | 'draft'

export const POST_COLUMNS: Array<{ key: PostSort, class?: string }> = [
  { key: 'title', class: 'is-title' },
  { key: 'author', class: 'is-author' },
  { key: 'status', class: 'is-status' },
  { key: 'published', class: 'is-date' },
  { key: 'updated', class: 'is-date' },
]

export const TEXT_SORTS: PostSort[] = ['title', 'author', 'status']

export const POST_FILTERS: PostFilter[] = ['all', 'published', 'draft']

export const LEGAL_PREFIX = 'legal-'
