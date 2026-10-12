/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type MessageAuthor = 'client' | 'staff' | 'system'

export type VariantDecision = 'accepted' | 'declined'

export interface IQuoteVariant {
  n: number
  title: string
  summary: string
  price: string
  trip: Record<string, unknown>
  decision: VariantDecision | null
  decided_at: string | null
}

export interface IQuoteData {
  lead_id: string
  lead_ref: string
  locale: string
  variants: IQuoteVariant[]
}

export interface IQuoteVariantInput {
  title: string
  summary: string
  price: string
  trip: Record<string, unknown>
}

export interface IMessage {
  id: string
  author: MessageAuthor
  author_name: string
  body: string
  kind?: 'text' | 'quote'
  order_id?: string | null
  quote?: IQuoteData | null
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

export type StreamEvent =
  | { type: 'message', clientId: string, message: IMessage }
  | { type: 'read', clientId: string, side: 'client' | 'staff' }
