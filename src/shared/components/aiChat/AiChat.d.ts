/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IAiCapability {
  key: string
  icon: string
  title: string
  text: string
  prompt?: string
  attach?: boolean
}

export interface IAiTurn {
  role: 'user' | 'assistant'
  text: string
}

export interface IAiAsk {
  text: string
  image: File | null
  history: IAiTurn[]
  context: Record<string, unknown>
}

export interface IAiCard {
  icon: string
  title: string
  sub?: string
  to: string
  label: string
}

export interface IAiPicture {
  url: string
  width: number
  height: number
  format: string
  title: string
}

export interface IAiAnswer {
  text: string
  cards?: IAiCard[]
  pictures?: IAiPicture[]
  suggestions?: string[]
  context?: Record<string, unknown>
  tone?: 'error'
}

export interface IAiMessage extends IAiAnswer {
  id: number
  role: 'user' | 'assistant'
  image?: string
  shown: number
}

export interface IAiChatProps {
  title: string
  sub: string
  placeholder: string
  capabilities: IAiCapability[]
  thinking: string[]
  images?: boolean
  send: (ask: IAiAsk) => Promise<IAiAnswer>
}
