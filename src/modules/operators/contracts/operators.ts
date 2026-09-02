/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const OPERATOR_CONNECTIONS = ['mirror', 'api'] as const

export type OperatorConnection = typeof OPERATOR_CONNECTIONS[number]

export interface IOperatorRaw {
  uuid: string
  slug: string
  name: string
  is_enabled: boolean
  connection: OperatorConnection
  site_url: string
  api_base_url: string
  api_login: string
  has_api_key: boolean
  has_api_secret: boolean
  note: string
  position: number
  updated_at: string
}

export interface IOperatorDraft {
  name: string
  connection: OperatorConnection
  siteUrl: string
  apiBaseUrl: string
  apiLogin: string
  apiKey: string
  apiSecret: string
  note: string
}
