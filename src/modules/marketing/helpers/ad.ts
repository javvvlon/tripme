import { mealText } from '~/shared/helpers/meal'
import { tourFromTrip } from '~/modules/leads/helpers/quote'
import { daysUntil, isHotDeparture, tashkentToday } from '~/shared/helpers/hot'
import { sceneOf } from './banner/scenes'
import { flagsOf } from './flags'
import type { SceneKind } from './banner/scenes'
import type { Translate } from '~/modules/leads/helpers/quote'
import { AD_INCLUDES, DEFAULT_DESIGN } from '../contracts/marketing'
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
  value: number
  unit: string
  offer: string
  legs: Array<{ place: string, nights: string, hotel: string }>
}

export type ToUzs = (money: { amount: number, currency: string }) => number | null

const MEAL_SHORT: Record<string, string> = {
  RO: 'RO', BB: 'BB', HB: 'HB', FB: 'FB', AI: 'All Inclusive', UAI: 'Ultra All Inclusive',
}

export interface IAdText {
  language: AdLanguage
  design: IAdDesign
  hotBadge: string
  departureHero: string
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
  flags: string
  includes: string
}

const UZ_MONTHS = {
  long: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  short: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
}

const CURRENCY_SIGNS: Record<string, string> = { USD: '$', EUR: '€', RUB: '₽' }

const at = (iso: string): Date => new Date(`${iso.slice(0, 10)}T00:00:00`)

export const live = (tours: IAdTour[]): IAdTour[] => tours.filter(tour => tour.check_state !== 'gone')

const groupOf = (amount: number): string =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(amount)).replace(/\s/g, '\u00a0')

export const unitOf = (currency: string, t: Translate): string =>
  currency === 'UZS' ? t('marketing.sum') : CURRENCY_SIGNS[currency] ?? currency

export const groupedAmount = (amount: number, unit: string): string => `${groupOf(amount)}\u00a0${unit}`

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

export function isHot(tours: IAdTour[], today = tashkentToday()): boolean {
  return tours.length > 0 && tours.every(tour =>
    isHotDeparture(tour.check_in, tour.check_state === 'gone' || tour.availability === 'stopped', today))
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
    const perPerson = design.price === 'person'
    const shownUzs = uzsTotal ? Math.round((perPerson ? uzsTotal / people : uzsTotal) / 10_000) * 10_000 : null
    const shownForeign = perPerson ? each : tour.price_amount
    const sign = CURRENCY_SIGNS[tour.price_currency]
    const foreign = sign ? `${sign}${groupOf(shownForeign)}` : `${groupOf(shownForeign)}\u00a0${tour.price_currency}`

    return {
      hotel: tour.tier ? t('marketing.banner.tier', { stars: Number(tour.hotel_stars) || '' }) : model.displayName(),
      stars: tour.tier ? 0 : model.stars() ?? 0,
      legs: (tour.legs ?? []).map(leg => ({ place: leg.place, hotel: leg.hotel, nights: leg.nights ? t('marketing.nights', { n: leg.nights }, leg.nights) : '' })),
      mealShort: MEAL_SHORT[plan] ?? String(tour.meal_name ?? ''),
      district: String(tour.district ?? ''),
      offer: shownUzs
        ? t(perPerson ? 'marketing.post.price' : 'marketing.post.priceTotal', { uzs: `${groupOf(shownUzs)}\u00a0${t('marketing.sum')}`, money: foreign })
        : t(perPerson ? 'marketing.post.priceForeign' : 'marketing.post.priceTotalForeign', { money: foreign }),
      meal: mealText(t, plan, tour.meal_name as string | null),
      date: dayOf(tour.check_in, language),
      nights: t('marketing.nights', { n: tour.nights }, tour.nights),
      price: design.price === 'person' ? t('marketing.perPerson', { price: amount }) : t('marketing.from', { price: amount }),
      amount,
      value: Math.round(design.price === 'person' ? tour.price_amount / people : tour.price_amount),
      unit: unitOf(tour.price_currency, t),
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

  const known = AD_INCLUDES.filter(key => (selection.includes ?? []).includes(key))

  const left = firstDay ? daysUntil(firstDay, tashkentToday()) : -1
  const hot = isHot(tours)
  const departureHero = !hot ? '' : left === 0
    ? t('marketing.hot.today')
    : left === 1 ? t('marketing.hot.tomorrow') : t('marketing.hot.inDays', { n: left }, left)
  const soon = !hot ? '' : left === 0
    ? t('marketing.hot.soonToday')
    : left === 1 ? t('marketing.hot.soonTomorrow') : t('marketing.hot.soonIn', { n: left }, left)

  return {
    language,
    design,
    hotBadge: hot ? t('marketing.hot.badge') : '',
    departureHero,
    scene: sceneOf([
      place,
      selection.title,
      ...pool.map(tour => String(tour.route_to ?? '')),
      ...pool.map(tour => String(tour.district ?? '')),
      ...pool.map(tour => tour.hotel_name),
    ]),
    place,
    departure: soon
      ? t(fromTashkent ? 'marketing.post.departureHot' : 'marketing.post.departureHotAny', { soon, when, stay })
      : t(fromTashkent ? 'marketing.post.departure' : 'marketing.post.departureAny', { when, stay }),
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
    hot,
    flags: flagsOf(pool.flatMap(tour => [String(tour.route_to ?? ''), ...(tour.countries ?? [])])),
    includes: known.length ? `${t('marketing.includes.label')}: ${known.map(key => t(`marketing.includes.${key}`)).join(' — ')}` : '',
  }
}

export interface IPostOptions {
  link: boolean
  contacts: IAdContact[]
  managersLabel: string
  footer: string
}

const INCLUDED_LINE = /^\s*(в стоимость|включено|tur narxiga|narxga kiradi|tarkibi|included)/i

const footerOf = (footer: string, ownIncludes: boolean): string =>
  ownIncludes ? footer.split('\n').filter(line => !INCLUDED_LINE.test(line)).join('\n') : footer

export function telegramPost(text: IAdText, options: IPostOptions = { link: true, contacts: [], managersLabel: '', footer: '' }): string {
  const emoji = text.design.post_style === 'emoji'
  const headline = text.copy.headline.toLocaleUpperCase(text.language)
  const label = text.hotBadge || text.copy.kicker
  const title = label ? `${headline}: ${label.toLocaleUpperCase(text.language)}` : headline
  const head = emoji && text.flags ? `${text.flags} ${title}` : title
  const hotels = text.lines.slice(0, text.design.rows).map((line, index) => {
    const name = [line.hotel, text.design.stars && line.stars ? `${line.stars}*` : ''].filter(Boolean).join(' ')
    const place = line.district ? ` (${line.district})` : ''
    const meal = text.design.meal && line.mealShort ? ` — ${line.mealShort}` : ''

    const legs = line.legs.map(leg => emoji
      ? `📍 ${[leg.place, leg.nights].filter(Boolean).join(' — ')}${leg.hotel ? ` · ${leg.hotel}` : ''}`
      : `— ${[leg.place, leg.nights].filter(Boolean).join(', ')}${leg.hotel ? `: ${leg.hotel}` : ''}`)

    return [`${emoji ? '👉' : `${index + 1}.`} ${name}${place}${meal}`, ...legs, line.offer].join('\n')
  })
  const tags = text.copy.hashtags.map(tag => `#${tag}`).join(' ')
  const managers = options.contacts.map(contact => `${contact.name} — t.me/${contact.telegram}`)

  const blocks = [
    [head, emoji ? `✈️ ${text.departure}` : text.departure].join('\n'),
    text.copy.intro,
    hotels.join('\n\n'),
    text.includes ? `${emoji ? '🏨 ' : ''}${text.includes}` : '',
    text.design.footer ? footerOf(options.footer, Boolean(text.includes)) : '',
    managers.length ? [emoji ? `☎️ ${options.managersLabel}` : options.managersLabel, ...managers].join('\n') : '',
    options.link ? `${emoji ? '🔗 ' : ''}${text.copy.cta}: ${text.link}` : '',
    tags,
  ]

  return blocks.map(block => block.trim()).filter(Boolean).join('\n\n')
}
