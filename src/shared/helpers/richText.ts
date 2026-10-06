import { MarkdownSerializer, defaultMarkdownSerializer } from 'prosemirror-markdown'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import type { Mark, Node as ProseNode } from '@tiptap/pm/model'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const base = defaultMarkdownSerializer.nodes

const URL_ESCAPES: Record<string, string> = { '(': '%28', ')': '%29' }

const destination = (url: string) => url.trim().replace(/[()\s]/g, character => URL_ESCAPES[character] ?? '%20')

const serializer = new MarkdownSerializer({
  doc: (state, node) => state.renderContent(node),
  text: base.text!,
  paragraph: base.paragraph!,
  heading: base.heading!,
  blockquote: base.blockquote!,
  listItem: base.list_item!,
  bulletList: (state, node) => state.renderList(node, '  ', () => '- '),
  orderedList: (state, node) => {
    const start = Number(node.attrs.start ?? 1)
    const width = String(start + node.childCount - 1).length
    const space = state.repeat(' ', width + 2)

    state.renderList(node, space, (index) => {
      const number = String(start + index)

      return `${state.repeat(' ', width - number.length)}${number}. `
    })
  },
  codeBlock: (state, node) => {
    const ticks = node.textContent.match(/`{3,}/gm)
    const fence = ticks ? `${ticks.sort().slice(-1)[0]}\`` : '```'

    state.write(`${fence}${node.attrs.language ?? ''}\n`)
    state.text(node.textContent, false)
    state.write('\n')
    state.write(fence)
    state.closeBlock(node)
  },
  horizontalRule: (state, node) => {
    state.write('---')
    state.closeBlock(node)
  },
  hardBreak: (state, node, parent, index) => base.hard_break!(state, node, parent, index),
  figure: (state: MarkdownSerializerState, node: ProseNode) => {
    const caption = String(node.attrs.caption ?? '').replace(/[[\]\\]/g, '\\$&').replace(/\s+/g, ' ').trim()
    const align = node.attrs.align ? ` "${node.attrs.align}"` : ''

    state.write(`![${caption}](${destination(String(node.attrs.src ?? ''))}${align})`)
    state.closeBlock(node)
  },
  video: (state: MarkdownSerializerState, node: ProseNode) => {
    state.write(`@[video](${destination(String(node.attrs.src ?? ''))})`)
    state.closeBlock(node)
  },
}, {
  italic: { open: '*', close: '*', mixable: true, expelEnclosingWhitespace: true },
  bold: { open: '**', close: '**', mixable: true, expelEnclosingWhitespace: true },
  strike: { open: '~~', close: '~~', mixable: true, expelEnclosingWhitespace: true },
  code: { open: '`', close: '`', escape: false },
  link: {
    open: () => '[',
    close: (_state: MarkdownSerializerState, mark: Mark) => `](${destination(String(mark.attrs.href ?? ''))})`,
    mixable: true,
  },
}, { hardBreakNodeName: 'hardBreak', strict: false })

export function editorToMarkdown(doc: ProseNode): string {
  return serializer.serialize(doc, { tightLists: true }).replace(/\n{3,}/g, '\n\n').trim()
}
