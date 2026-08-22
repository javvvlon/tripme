/**
 * The seam that lets the landing go from static to live without a rewrite.
 *
 * Today: returns fixed sample offers, so `/` can be prerendered (§3.4).
 * Later:  swap the body for `$fetch('/hot-offers', { baseURL: apiBase })`
 *         and change one line in nuxt.config routeRules:
 *              '/': { prerender: true }   →   '/': { swr: 600 }
 *
 * Nothing else in the project changes. Components already await this,
 * so they behave identically whether the data is baked or fetched.
 */
export interface HotOffer {
  id: string
  country: string
  resort: string
  nights: number
  priceFrom: number
  currency: 'USD' | 'EUR' | 'UZS'
  /** true once the number comes from tripme_api rather than this file */
  live: boolean
}

export function useHotOffers() {
  // useAsyncData so the call is deduped and serialised into the payload
  return useAsyncData<HotOffer[]>('hot-offers', async () => {
    // const { apiBase } = useRuntimeConfig().public
    // return await $fetch<HotOffer[]>('/hot-offers', { baseURL: apiBase })
    return [
      { id: 'eg', country: 'Египет',  resort: 'Хургада',   nights: 7, priceFrom: 1180, currency: 'USD', live: false },
      { id: 'tr', country: 'Турция',  resort: 'Стамбул',   nights: 7, priceFrom: 980,  currency: 'USD', live: false },
      { id: 'ae', country: 'ОАЭ',     resort: 'Дубай',     nights: 6, priceFrom: 1340, currency: 'USD', live: false },
      { id: 'vn', country: 'Вьетнам', resort: 'Нячанг',    nights: 10, priceFrom: 1610, currency: 'USD', live: false },
    ]
  }, { default: () => [] })
}
