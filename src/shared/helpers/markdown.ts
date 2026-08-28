import { marked } from 'marked'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
}

const VIDEO_PATTERN = /@\[video\]\(([^)\s]+)\)/g

const FIGURE_ALIGNMENTS = ['left', 'right', 'full'] as const

type FigureAlignment = typeof FIGURE_ALIGNMENTS[number]

function escapeHtml(source: string): string {
  return source.replace(/[&<]/g, character => ESCAPES[character]!)
}

function attribute(value: string): string {
  return value.replace(/"/g, '&quot;')
}

function embedFor(url: string): string {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/)

  if (youtube) {
    return `<div class="tm-md-embed"><iframe src="https://www.youtube-nocookie.com/embed/${youtube[1]}" title="" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)

  if (vimeo) {
    return `<div class="tm-md-embed"><iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`
  }

  return `<div class="tm-md-embed is-file"><video src="${attribute(url)}" controls preload="metadata"></video></div>`
}

function figures(html: string): string {
  return html.replace(
    /<p>\s*<img src="([^"]*)" alt="([^"]*)"(?: title="([^"]*)")?\s*\/?>\s*<\/p>/g,
    (_, src: string, alt: string, title?: string) => {
      const hint = (title ?? '').trim().toLowerCase()
      const alignment = FIGURE_ALIGNMENTS.includes(hint as FigureAlignment) ? hint : ''
      const caption = alt.trim()

      return [
        `<figure class="tm-md-figure${alignment ? ` is-${alignment}` : ''}">`,
        `<img src="${src}" alt="${alt}" loading="lazy">`,
        caption ? `<figcaption>${caption}</figcaption>` : '',
        '</figure>',
      ].join('')
    },
  )
}

export function renderMarkdown(source: string | null | undefined): string {
  if (!source?.trim()) return ''

  const videos: string[] = []

  const withPlaceholders = escapeHtml(source).replace(VIDEO_PATTERN, (_, url: string) => {
    videos.push(url)

    return `%%tm-video-${videos.length - 1}%%`
  })

  const html = marked.parse(withPlaceholders, { async: false, gfm: true, breaks: true })

  return figures(html).replace(
    /<p>\s*%%tm-video-(\d+)%%\s*<\/p>/g,
    (_, index: string) => embedFor(videos[Number(index)] ?? ''),
  )
}

export function excerptFrom(source: string | null | undefined, limit = 200): string {
  if (!source?.trim()) return ''

  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(VIDEO_PATTERN, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text
}
