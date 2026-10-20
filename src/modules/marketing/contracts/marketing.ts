import type { ILeadTrip } from '~/modules/leads/contracts/leads'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const AD_STYLES = ['classic', 'board', 'ticket'] as const

export type AdStyle = typeof AD_STYLES[number] | 'custom'

export const TEMPLATE_OPTIONS = {
  layout: ['stack', 'poster', 'split', 'card'],
  align: ['left', 'center'],
  headline: ['s', 'm', 'l', 'xl'],
  case: ['upper', 'title'],
  kicker: ['pill', 'text', 'none'],
  list: ['rows', 'cards', 'minimal'],
  price: ['inline', 'hero'],
  accent: ['none', 'line', 'frame', 'corner'],
  overlay: ['bottom', 'full', 'top'],
  spacing: ['tight', 'normal', 'airy'],
  cta: ['pill', 'text', 'none'],
} as const

type TemplateOptions = typeof TEMPLATE_OPTIONS

export type IAdTemplate = { name: string, dim: number } & { [K in keyof TemplateOptions]: TemplateOptions[K][number] }

export const DEFAULT_TEMPLATE: IAdTemplate = {
  name: 'TripMe',
  layout: 'stack',
  align: 'left',
  headline: 'l',
  case: 'upper',
  kicker: 'pill',
  list: 'rows',
  price: 'inline',
  accent: 'none',
  overlay: 'bottom',
  dim: 55,
  spacing: 'normal',
  cta: 'pill',
}

export interface ISavedTemplate {
  id: string
  name: string
  spec: IAdTemplate
  author: string
  created_at: string
}

export const AD_LANGUAGES = ['ru', 'uz'] as const

export type AdLanguage = typeof AD_LANGUAGES[number]

export const AD_FORMATS = ['story', 'post', 'square'] as const

export type AdFormat = typeof AD_FORMATS[number]

export const AD_SIZES: Record<AdFormat, { width: number, height: number }> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
}

export const MARKETING_ROLES = ['AGENT', 'MANAGER', 'ADMIN'] as const

export const PICK_MAX = 6

export type CheckState = 'same' | 'changed' | 'gone' | 'unknown'

export const AD_ANGLES = ['compare', 'escape', 'timing', 'care'] as const

export type AdAngle = typeof AD_ANGLES[number]

export interface IAdCopy {
  kicker: string
  headline: string
  intro: string
  cta: string
  hashtags: string[]
  ai: boolean
  angle?: AdAngle
}

export const AD_BACKDROPS = ['photo', 'scene', 'type', 'night'] as const

export type AdBackdrop = typeof AD_BACKDROPS[number]

export const CONTEXT_BACKDROPS = ['scene', 'type', 'night'] as const

export type ContextBackdrop = typeof CONTEXT_BACKDROPS[number]

export interface IAdDesign {
  backdrop: AdBackdrop
  dim: number
  focus: number
  rows: number
  stars: boolean
  meal: boolean
  party: boolean
  cta: boolean
  caps: boolean
  price: 'total' | 'person'
  hotel: string
  footer: boolean
  buttons: AdButtons
  mood: AdMood
  post_style: PostStyle
}

export const AD_MOODS = ['warm', 'drive', 'calm'] as const

export type AdMood = typeof AD_MOODS[number]

export const POST_STYLES = ['plain', 'emoji'] as const

export type PostStyle = typeof POST_STYLES[number]

export const AD_BUTTONS = ['both', 'managers', 'link', 'none'] as const

export type AdButtons = typeof AD_BUTTONS[number]

export const DEFAULT_DESIGN: IAdDesign = {
  backdrop: 'scene',
  dim: 55,
  focus: 40,
  rows: 5,
  stars: true,
  meal: true,
  party: true,
  cta: true,
  caps: true,
  price: 'person',
  hotel: '',
  footer: true,
  buttons: 'both',
  mood: 'warm',
  post_style: 'plain',
}

export interface IAdContact {
  id: string
  name: string
  telegram: string
}

export interface IAdPublication {
  at: string
  channel: string
  message_id: number
  language: AdLanguage
  by: string | null
  kind?: AdMedia
}

export type AdMedia = 'photo' | 'video'

export interface IMarketingSettings {
  visual: string
  default_visual: string
  custom_visual: boolean
  footer: Record<AdLanguage, string>
  default_footer: Record<AdLanguage, string>
  voice: string
  default_voice: string
  custom_voice: boolean
  contacts: IAdContact[]
  telegram: { connected: boolean, channel: string }
  ai: { text: boolean, models: string[], image_model: string }
  updated_at: string | null
}

export const MAX_BUTTONS = 4

export interface IAdTour extends ILeadTrip {
  offer_id: string
  check_in: string
  price_amount: number
  check_state?: CheckState
  check_was?: number | null
  source?: 'search' | 'post' | 'own'
  post_basis?: 'person' | 'total' | 'unknown'
  tier?: boolean
  legs?: IAdLeg[]
  countries?: string[]
}

export interface IAdLeg {
  place: string
  nights: number
  hotel: string
}

export const AD_INCLUDES = ['flight', 'hotel', 'breakfast', 'meals', 'transfer', 'insurance', 'visa', 'excursions', 'guide'] as const

export type AdInclude = typeof AD_INCLUDES[number]

export type SkipReason = 'no_price' | 'no_date' | 'no_nights' | 'limit'

export interface IPostHotel {
  name: string
  stars: number | null
  district: string
  meal: string
  price: number | null
  currency: string
}

export interface IPostFacts {
  country: string
  from: string
  dates: string[]
  nights: number | null
  basis: 'person' | 'total' | ''
  operator: string
  airline: string
  hotels: IPostHotel[]
}

export interface IIntakeReport {
  country: string
  operator: string
  found: number
  kept: number
  skipped: Array<{ hotel: string, reason: SkipReason }>
  own?: boolean
}

export interface IAdIntake {
  via: 'studio' | 'telegram'
  text: string
  origin: string
  facts: IPostFacts
  report: IIntakeReport
  at: string
  by: string | null
}

export interface IIntakeAnswer {
  selection: ISelection | null
  report: IIntakeReport
}

export type IAssistantAnswer =
  | ({ kind: 'selection' } & IIntakeAnswer)
  | { kind: 'reply', reply: string, suggestions: string[] }

export interface IBotStatus {
  available: boolean
  username: string
  linked: { username: string, linked_at: string } | null
}

export interface IBotLink {
  url: string
  expires_at: string
}

export interface IAdBackground {
  url: string
  destination: string
  model: string
  created_at: string
}

export interface ISelection {
  id: string
  code: string
  title: string
  style: AdStyle
  tours: IAdTour[]
  copy: Partial<Record<AdLanguage, IAdCopy>>
  variants: Partial<Record<AdLanguage, IAdCopy[]>>
  design: IAdDesign
  background: IAdBackground | null
  backgrounds: IAdBackground[]
  contacts: string[]
  published: IAdPublication[]
  template: IAdTemplate | null
  template_drafts: IAdTemplate[]
  intake: IAdIntake | null
  includes: AdInclude[]
  checked_at: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
  author: string
  leads: number
  ai: boolean
}

export interface ISelectionRow {
  id: string
  code: string
  title: string
  tours: number
  live: number
  from: { amount: number, currency: string } | null
  dates: { first: string, last: string } | null
  background_url: string | null
  checked_at: string | null
  created_at: string
  archived_at: string | null
  author: string
  leads: number
  published: number
}

export interface IPublicSelection {
  code: string
  title: string
  tours: IAdTour[]
  copy: Partial<Record<AdLanguage, IAdCopy>>
  background_url: string | null
  checked_at: string | null
}

export interface ISelectionPatch {
  title?: string
  style?: AdStyle
  order?: string[]
  copy?: Partial<Record<AdLanguage, Partial<IAdCopy>>>
  pick?: number
  design?: Partial<IAdDesign>
  contacts?: string[]
  template?: IAdTemplate | null
  tours?: Array<Partial<IAdTour>>
  includes?: AdInclude[]
}

export interface IPublishDraft {
  media: Blob
  kind: AdMedia
  caption: string
  language: AdLanguage
  link: string
  cta: string
  width?: number
  height?: number
  duration?: number
}
