/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IGridColumn {
  span: number
  cells: number
}

export interface IGrid {
  columns: IGridColumn[]
  capacity: number
}

const COLUMNS = 12

export function parseGrid(grid: string | null | undefined): IGrid | null {
  if (!grid?.trim()) return null

  const columns: IGridColumn[] = []

  for (const part of grid.trim().split('_')) {
    const cells = part.split('.')
    const spans = cells.map(Number)

    if (!spans.length || spans.some(span => !Number.isInteger(span) || span < 1 || span > COLUMNS)) {
      return null
    }

    if (spans.some(span => span !== spans[0])) return null

    columns.push({ span: spans[0]!, cells: cells.length })
  }

  const total = columns.reduce((sum, column) => sum + column.span, 0)

  if (!columns.length || total > COLUMNS) return null

  return { columns, capacity: columns.reduce((sum, column) => sum + column.cells, 0) }
}

export function distribute<T>(items: T[], grid: IGrid): T[][] {
  const out: T[][] = []
  let cursor = 0

  for (const column of grid.columns) {
    out.push(items.slice(cursor, cursor + column.cells))
    cursor += column.cells
  }

  return out
}
