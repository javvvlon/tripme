import { HOME_DEPARTURE } from '~/shared/composables/useSearchCriteria'
import { addDays } from '~/shared/helpers/dates'
import { tashkentToday } from '~/shared/helpers/hot'
import type { ShowcaseTheme } from '~/search_engine/contracts/showcase'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const PRESET_LEAD_DAYS = 7

export const PRESET_SPAN_DAYS = 5

export const KIDS_PRESET = { adults: 2, kidAges: [6], meals: ['AI', 'UAI', 'FB'] }

export function presetQuery(theme: ShowcaseTheme, from: string, today: string): Record<string, string> {
  const date = addDays(today, PRESET_LEAD_DAYS)
  const query: Record<string, string> = { from: from || HOME_DEPARTURE, date, dateTo: addDays(date, PRESET_SPAN_DAYS) }

  if (theme !== 'all') query.theme = theme

  if (theme === 'kids') {
    query.adults = String(KIDS_PRESET.adults)
    query.kids = KIDS_PRESET.kidAges.join(',')
    query.meals = KIDS_PRESET.meals.join(',')
  }

  return query
}

export const useDeparture = () => useState<string>('search:departure', () => HOME_DEPARTURE)

export function useArenaPresets() {
  const departure = useDeparture()

  const presetLink = (theme: ShowcaseTheme): string =>
    `/search?${new URLSearchParams(presetQuery(theme, departure.value, tashkentToday())).toString()}`

  return { departure, presetLink }
}
