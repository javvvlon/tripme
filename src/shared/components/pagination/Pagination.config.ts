import type { PaginationSlot } from './Pagination.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export function paginationSlots(page: number, pages: number): PaginationSlot[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1)

  const around = [page - 1, page, page + 1].filter(value => value > 1 && value < pages)
  const slots: PaginationSlot[] = [1]

  if (around[0]! > 2) slots.push('gap')
  slots.push(...around)
  if (around[around.length - 1]! < pages - 1) slots.push('gap')
  slots.push(pages)

  return slots
}
