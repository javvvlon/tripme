import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import VideoView from './VideoView.vue'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      insertVideo: (src: string) => ReturnType
    }
  }
}

export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return { src: { default: '' } }
  },

  parseHTML() {
    return [{ tag: 'div[data-video]', getAttrs: element => ({ src: element.getAttribute('data-video') ?? '' }) }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-video': HTMLAttributes.src }]
  },

  addCommands() {
    return {
      insertVideo: src => ({ commands }) => commands.insertContent({ type: this.name, attrs: { src } }),
    }
  },

  addNodeView() {
    return VueNodeViewRenderer(VideoView)
  },
})
