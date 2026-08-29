/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IGridColumn {
  span: number
  cells: number
  row: number
}

export interface IGrid {
  columns: IGridColumn[]
  capacity: number
  rows: number
}

const COLUMNS = 12

export function parseGrid(grid: string | null | undefined): IGrid | null {
  if (!grid?.trim()) return null

  const columns: IGridColumn[] = []

  let row = 0
  let filled = 0

  for (const part of grid.trim().split('_')) {
    const cells = part.split('.')
    const spans = cells.map(Number)

    if (!spans.length || spans.some(span => !Number.isInteger(span) || span < 1 || span > COLUMNS)) {
      return null
    }

    if (spans.some(span => span !== spans[0])) return null

    const span = spans[0]!

    if (filled + span > COLUMNS) {
      row += 1
      filled = 0
    }

    columns.push({ span, cells: cells.length, row })
    filled += span
  }

  if (!columns.length) return null

  return {
    columns,
    rows: row + 1,
    capacity: columns.reduce((sum, column) => sum + column.cells, 0),
  }
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
