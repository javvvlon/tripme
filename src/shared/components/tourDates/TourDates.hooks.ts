import { addMonths, fromIso, monthLength, monthOffset, startOfMonth, today } from '~/shared/helpers/dates'
import type { ICalendarMask } from '~/search_engine/contracts/references'
import type { ICalendarMonth } from './TourDates.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const MONTHS_SHOWN = 2

export const useCalendar = (
  calendar: () => ICalendarMask | null | undefined,
  selected: () => string,
) => {
  const { locale } = useI18n()

  const earliest = computed(() => {
    const start = calendar()?.start

    return start && start > today() ? start : today()
  })

  const latest = computed(() => calendar()?.horizon ?? addMonths(today(), 12))

  const blocked = computed(() => new Set(calendar()?.blocked ?? []))

  const cursor = ref(startOfMonth(selected() || earliest.value))

  watch([() => selected(), earliest], ([date]) => {
    cursor.value = startOfMonth(date || earliest.value)
  })

  const monthName = (iso: string) =>
    new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(fromIso(iso))

  const weekdays = computed(() => {
    const format = new Intl.DateTimeFormat(locale.value, { weekday: 'short' })

    return Array.from({ length: 7 }, (_, i) => format.format(new Date(Date.UTC(2024, 0, 1 + i))))
  })

  const months = computed<ICalendarMonth[]>(() =>
    Array.from({ length: MONTHS_SHOWN }, (_, offset) => {
      const iso = addMonths(cursor.value, offset)

      return {
        iso,
        label: monthName(iso),
        blanks: monthOffset(iso),
        days: Array.from({ length: monthLength(iso) }, (_, i) => {
          const day = `${iso.slice(0, 7)}-${String(i + 1).padStart(2, '0')}`

          return {
            iso: day,
            day: i + 1,
            disabled: day < earliest.value || day > latest.value || blocked.value.has(day),
          }
        }),
      }
    }))

  const canGoBack = computed(() => cursor.value > startOfMonth(earliest.value))
  const canGoOn = computed(() => addMonths(cursor.value, MONTHS_SHOWN) <= latest.value)

  const shift = (by: number) => {
    const next = addMonths(cursor.value, by)

    if (by < 0 && next < startOfMonth(earliest.value)) return
    if (by > 0 && next > startOfMonth(latest.value)) return

    cursor.value = next
  }

  return { months, weekdays, canGoBack, canGoOn, shift }
}
