import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import FigureView from './FigureView.vue'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const FIGURE_ALIGNS = ['', 'left', 'right', 'full'] as const

export type FigureAlign = typeof FIGURE_ALIGNS[number]

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figure: {
      insertFigure: (attrs: { src: string, caption?: string, align?: FigureAlign }) => ReturnType
    }
  }
}

export const Figure = Node.create({
  name: 'figure',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      caption: { default: '' },
      align: { default: '' },
    }
  },

  parseHTML() {
    return [{
      tag: 'img[src]',
      getAttrs: (element) => {
        const title = (element.getAttribute('title') ?? '').trim().toLowerCase()

        return {
          src: element.getAttribute('src') ?? '',
          caption: element.getAttribute('alt') ?? '',
          align: (FIGURE_ALIGNS as readonly string[]).includes(title) ? title : '',
        }
      },
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes({ src: HTMLAttributes.src, alt: HTMLAttributes.caption, title: HTMLAttributes.align || null })]
  },

  addCommands() {
    return {
      insertFigure: attrs => ({ commands }) => commands.insertContent({ type: this.name, attrs }),
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(FigureView)
  },
})
