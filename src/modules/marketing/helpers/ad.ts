import { mealText } from '~/shared/helpers/meal'
import { tourFromTrip } from '~/modules/leads/helpers/quote'
import { sceneOf } from './banner/scenes'
import type { SceneKind } from './banner/scenes'
import type { Translate } from '~/modules/leads/helpers/quote'
import { DEFAULT_DESIGN } from '../contracts/marketing'
import type { AdLanguage, IAdContact, IAdCopy, IAdDesign, IAdTour, ISelection } from '../contracts/marketing'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IAdLine {
  hotel: string
  stars: number
  meal: string
  mealShort: string
  district: string
  date: string
  nights: string
  price: string
  amount: string
  offer: string
}

export type ToUzs = (money: { amount: number, currency: string }) => number | null

const MEAL_SHORT: Record<string, string> = {
  RO: 'RO', BB: 'BB', HB: 'HB', FB: 'FB', AI: 'All Inclusive', UAI: 'Ultra All Inclusive',
}

export interface IAdText {
  language: AdLanguage
  design: IAdDesign
  scene: SceneKind
  place: string
  departure: string
  priceNote: string
  copy: IAdCopy
  lines: IAdLine[]
  dates: string
  nights: string
  meal: string
  party: string
  from: string
  pricesAt: string
  link: string
  site: string
  hot: boolean
}

const UZ_MONTHS = {
  long: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  short: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
}

const CURRENCY_SIGNS: Record<string, string> = { USD: '$', EUR: '€', RUB: '₽' }

const HOT_DAYS = 10

const at = (iso: string): Date => new Date(`${iso.slice(0, 10)}T00:00:00`)

export const live = (tours: IAdTour[]): IAdTour[] => tours.filter(tour => tour.check_state !== 'gone')

const groupOf = (amount: number): string =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(amount)).replace(/\s/g, '\u00a0')

export function amountOf(amount: number, currency: string, language: AdLanguage, t: Translate): string {
  const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(amount)).replace(/\s/g, '\u00a0')
  const sign = currency === 'UZS' ? t('marketing.sum') : CURRENCY_SIGNS[currency] ?? currency

  return `${number}\u00a0${sign}`
}

export function dayOf(iso: string, language: AdLanguage, style: 'short' | 'long' = 'short'): string {
  const date = at(iso)

  if (language === 'uz') return `${date.getDate()}-${UZ_MONTHS[style][date.getMonth()]}`

  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: style }).format(date).replace('.', '')
}

export function daysOf(isos: string[], language: AdLanguage): string {
  const sorted = [...new Set(isos)].sort()
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  if (!first || !last) return ''
  if (first === last) return dayOf(first, language, 'long')

  if (language === 'uz') {
    const start = at(first)
    const end = at(last)

    return start.getMonth() === end.getMonth()
      ? `${start.getDate()}–${end.getDate()}-${UZ_MONTHS.short[end.getMonth()]}`
      : `${dayOf(first, language)} – ${dayOf(last, language)}`
  }

  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
    .formatRange(at(first), at(last))
    .replace(/\./g, '')
}

export function isHot(tours: IAdTour[], today = new Date().toISOString().slice(0, 10)): boolean {
  const start = at(today).getTime()

  return tours.length > 0 && tours.every((tour) => {
    const days = (at(tour.check_in).getTime() - start) / 86_400_000

    return days >= 0 && days <= HOT_DAYS
  })
}

const sorted = (tours: IAdTour[]): IAdTour[] => [...tours].sort((a, b) => a.price_amount - b.price_amount)

export function adText(selection: ISelection, language: AdLanguage, t: Translate, link: string, site: string, override?: Partial<IAdDesign>, toUzs?: ToUzs): IAdText {
  const design = { ...DEFAULT_DESIGN, ...selection.design, ...override }
  const pool = sorted(live(selection.tours).length ? live(selection.tours) : selection.tours)
  const single = override?.hotel ?? selection.design?.hotel ?? ''
  const tours = single && pool.some(tour => tour.offer_id === single) ? pool.filter(tour => tour.offer_id === single) : pool
  const copy = selection.copy[language] ?? selection.copy.ru ?? { kicker: '', headline: selection.title, intro: '', cta: '', hashtags: [], ai: false }
  const meals = [...new Set(tours.map(tour => mealText(t, String(tour.meal_plan ?? tour.meal_code ?? '').toUpperCase(), tour.meal_name as string | null)).filter(Boolean))]
  const nights = [...new Set(tours.map(tour => tour.nights))].sort((a, b) => a - b)
  const first = tours[0]
  const adults = first?.adults ?? 2
  const children = first?.children ?? 0

  const lines = tours.map((tour): IAdLine => {
    const model = tourFromTrip(tour, tour.offer_id)
    const people = Math.max(1, tour.adults + tour.children)
    const total = amountOf(tour.price_amount, tour.price_currency, language, t)
    const amount = design.price === 'person' ? amountOf(tour.price_amount / people, tour.price_currency, language, t) : total

    const plan = String(tour.meal_plan ?? tour.meal_code ?? '').toUpperCase()
    const each = tour.price_amount / people
    const uzsTotal = Number(tour.price_uzs) > 0 && tour.price_currency !== 'UZS' ? Number(tour.price_uzs) : toUzs?.({ amount: tour.price_amount, currency: tour.price_currency }) ?? null
    const uzsEach = uzsTotal ? Math.round(uzsTotal / people / 10_000) * 10_000 : null
    const sign = CURRENCY_SIGNS[tour.price_currency]
    const foreign = sign ? `${sign}${groupOf(each)}` : `${groupOf(each)}\u00a0${tour.price_currency}`

    return {
      hotel: model.displayName(),
      stars: model.stars() ?? 0,
      mealShort: MEAL_SHORT[plan] ?? String(tour.meal_name ?? ''),
      district: String(tour.district ?? ''),
      offer: uzsEach
        ? t('marketing.post.price', { uzs: `${groupOf(uzsEach)}\u00a0${t('marketing.sum')}`, money: foreign })
        : t('marketing.post.priceForeign', { money: foreign }),
      meal: mealText(t, plan, tour.meal_name as string | null),
      date: dayOf(tour.check_in, language),
      nights: t('marketing.nights', { n: tour.nights }, tour.nights),
      price: design.price === 'person' ? t('marketing.perPerson', { price: amount }) : t('marketing.from', { price: amount }),
      amount,
    }
  })

  const party = children
    ? t('marketing.partyKids', { adults: t('marketing.adults', { n: adults }, adults), kids: t('marketing.kids', { n: children }, children) })
    : t('marketing.party', { adults: t('marketing.adults', { n: adults }, adults) })

  const firstDay = tours.map(tour => tour.check_in).sort()[0] ?? ''
  const fromTashkent = tours.every(tour => !tour.route_from || tour.route_from === 'tashkent')
  const when = new Set(tours.map(tour => tour.check_in)).size > 1
    ? daysOf(tours.map(tour => tour.check_in), language)
    : firstDay ? dayOf(firstDay, language, 'long') : ''
  const stay = nights.length > 1
    ? t('marketing.nightsRange', { from: nights[0], to: nights[nights.length - 1] })
    : t('marketing.nights', { n: nights[0] ?? 0 }, nights[0] ?? 0)

  const place = String(pool.find(tour => tour.route_to_label)?.route_to_label ?? '') || selection.title

  return {
    language,
    design,
    scene: sceneOf([
      place,
      selection.title,
      ...pool.map(tour => String(tour.route_to ?? '')),
      ...pool.map(tour => String(tour.district ?? '')),
      ...pool.map(tour => tour.hotel_name),
    ]),
    place,
    departure: t(fromTashkent ? 'marketing.post.departure' : 'marketing.post.departureAny', { when, stay }),
    priceNote: design.price === 'person' ? t('marketing.banner.perPerson') : t('marketing.banner.from'),
    copy,
    lines,
    dates: daysOf(tours.map(tour => tour.check_in), language),
    nights: nights.length > 1
      ? t('marketing.nightsRange', { from: nights[0], to: nights[nights.length - 1] })
      : t('marketing.nights', { n: nights[0] ?? 0 }, nights[0] ?? 0),
    meal: meals.length === 1 ? meals[0] ?? '' : '',
    party,
    from: lines[0]?.price ?? '',
    pricesAt: t('marketing.pricesAt', { date: dayOf((selection.checked_at ?? selection.created_at).slice(0, 10), language) }),
    link,
    site,
    hot: isHot(tours),
  }
}

export interface IPostOptions {
  link: boolean
  contacts: IAdContact[]
  managersLabel: string
  footer: string
}

export function telegramPost(text: IAdText, options: IPostOptions = { link: true, contacts: [], managersLabel: '', footer: '' }): string {
  const headline = text.copy.headline.toLocaleUpperCase(text.language)
  const head = text.copy.kicker ? `${headline}: ${text.copy.kicker.toLocaleUpperCase(text.language)}` : headline
  const hotels = text.lines.slice(0, text.design.rows).map((line, index) => {
    const name = [line.hotel, text.design.stars && line.stars ? `${line.stars}*` : ''].filter(Boolean).join(' ')
    const place = line.district ? ` (${line.district})` : ''
    const meal = text.design.meal && line.mealShort ? ` — ${line.mealShort}` : ''

    return `${index + 1}. ${name}${place}${meal}\n${line.offer}`
  })
  const tags = text.copy.hashtags.map(tag => `#${tag}`).join(' ')
  const managers = options.contacts.map(contact => `${contact.name} — t.me/${contact.telegram}`)

  const blocks = [
    [head, text.departure].join('\n'),
    text.copy.intro,
    hotels.join('\n\n'),
    text.design.footer ? options.footer : '',
    managers.length ? [options.managersLabel, ...managers].join('\n') : '',
    options.link ? `${text.copy.cta}: ${text.link}` : '',
    tags,
  ]

  return blocks.map(block => block.trim()).filter(Boolean).join('\n\n')
}
