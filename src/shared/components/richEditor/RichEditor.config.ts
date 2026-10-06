import type { IRichTool } from './RichEditor.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const ACCEPTED_IMAGES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif']

export const RICH_TOOL_GROUPS: IRichTool[][] = [
  [
    { key: 'h2', text: 'H2' },
    { key: 'h3', text: 'H3' },
  ],
  [
    { key: 'bold', icon: 'bold', compact: true },
    { key: 'italic', icon: 'italic', compact: true },
    { key: 'strike', icon: 'strike' },
    { key: 'link', icon: 'link', compact: true },
  ],
  [
    { key: 'bullet', icon: 'list', compact: true },
    { key: 'ordered', icon: 'list-ordered', compact: true },
    { key: 'quote', icon: 'quote' },
    { key: 'divider', icon: 'divider' },
  ],
  [
    { key: 'image', icon: 'image' },
    { key: 'video', icon: 'play' },
  ],
]
