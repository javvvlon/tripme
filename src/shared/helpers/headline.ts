/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IHeadline {
  lead: string
  accent: string
  tail: string
}

const MARKED = /^(.*?)\*([^*]+)\*(.*)$/s

export const splitHeadline = (title: string): IHeadline => {
  const text = title.trim()
  const marked = MARKED.exec(text)

  if (marked) return { lead: marked[1]!, accent: marked[2]!, tail: marked[3]! }

  const cut = text.lastIndexOf(' ')

  if (cut < 0) return { lead: '', accent: text, tail: '' }

  return { lead: text.slice(0, cut + 1), accent: text.slice(cut + 1), tail: '' }
}

export const plainHeadline = (title: string): string => title.replace(/\*([^*]+)\*/g, '$1')
