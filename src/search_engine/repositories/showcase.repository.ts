import { Tour } from '~/search_engine/models/Tour'
import type { IShowcaseCard, IShowcaseCardRaw, IShowcasePlace, ShowcaseStreamEvent, ShowcaseTheme } from '~/search_engine/contracts/showcase'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
type ShowcaseStreamRaw =
  | { type: 'start', from: IShowcasePlace, theme: ShowcaseTheme, date: string, dateTo: string, countries: IShowcasePlace[] }
  | { type: 'country', card: IShowcaseCardRaw }
  | { type: 'done', cards: IShowcaseCardRaw[] }

const cardOf = (raw: IShowcaseCardRaw): IShowcaseCard | null =>
  raw.offer
    ? { country: raw.country, tour: Tour.fromRaw(raw.offer), offers: raw.offers, discount: raw.discount, discountKind: raw.discount_kind }
    : null

export const useShowcaseRepository = () => {
  const stream = (
    query: Record<string, string>,
    onEvent: (event: ShowcaseStreamEvent) => void,
    onError: (received: boolean) => void,
  ): (() => void) => {
    const base = String(useRuntimeConfig().public.apiBase).replace(/\/+$/, '')
    const source = new EventSource(`${base}/search/showcase/stream?${new URLSearchParams(query).toString()}`)

    let received = false
    let finished = false

    source.onmessage = (message) => {
      received = true

      const raw = JSON.parse(message.data) as ShowcaseStreamRaw

      if (raw.type === 'country') {
        const card = cardOf(raw.card)

        if (card) onEvent({ type: 'country', card })
      }
      else if (raw.type === 'done') {
        finished = true
        source.close()
        onEvent({ type: 'done', cards: raw.cards.map(cardOf).filter((card): card is IShowcaseCard => Boolean(card)) })
      }
      else {
        onEvent(raw)
      }
    }

    source.onerror = () => {
      if (finished) return

      source.close()
      onError(received)
    }

    return () => source.close()
  }

  return { stream }
}
