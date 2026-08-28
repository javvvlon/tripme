import type { IMarkdownAction } from './MarkdownEditor.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const ACCEPTED_IMAGES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif']

export const MARKDOWN_ACTIONS: IMarkdownAction[] = [
  { key: 'bold', icon: 'B', before: '**', after: '**' },
  { key: 'italic', icon: 'I', before: '_', after: '_' },
  { key: 'heading', icon: 'H', before: '## ', after: '', block: true },
  { key: 'quote', icon: '❝', before: '> ', after: '', block: true },
  { key: 'bullet', icon: '•', before: '- ', after: '', block: true },
  { key: 'link', icon: '↗', before: '[', after: '](https://)' },
]
