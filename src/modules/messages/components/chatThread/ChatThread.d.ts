import type { IMessage, MessageAuthor } from '~/modules/messages/contracts/messages'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IChatThreadProps {
  messages: IMessage[]
  me: MessageAuthor
  busy?: boolean
  loading?: boolean
  placeholder?: string
  emptyText?: string
}

export interface IChatThreadEmits {
  send: [body: string]
}
