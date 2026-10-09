/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type MessageAuthor = 'client' | 'staff' | 'system'

export interface IMessage {
  id: string
  author: MessageAuthor
  author_name: string
  body: string
  created_at: string
}

export interface IThread {
  client: { id: string, name: string, email: string, phone: string }
  messages: IMessage[]
  unread: number
}

export interface IInboxRow {
  client_id: string
  name: string
  email: string
  last_body: string
  last_author: MessageAuthor | ''
  last_message_at: string | null
  unread: number
}
