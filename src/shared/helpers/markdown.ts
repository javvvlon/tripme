import { marked } from 'marked'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
}

function escapeHtml(source: string): string {
  return source.replace(/[&<]/g, character => ESCAPES[character]!)
}

export function renderMarkdown(source: string | null | undefined): string {
  if (!source?.trim()) return ''

  return marked.parse(escapeHtml(source), { async: false, gfm: true, breaks: true })
}

export function excerptFrom(source: string | null | undefined, limit = 200): string {
  if (!source?.trim()) return ''

  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text
}
