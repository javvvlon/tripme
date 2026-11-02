import type { Ref } from 'vue'
import { PHONE_COUNTRIES, PINNED_PHONE_COUNTRIES } from '~/shared/config/phone-countries'
import type { IPhoneCountry } from '~/shared/config/phone-countries'
import { countryName } from '~/shared/helpers/country'
import { PHONE_COUNTRY_CODE, formatNational, formatPhone, joinPhone, phoneDigits, splitPhone } from '~/shared/helpers/phone'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IPhoneOption extends IPhoneCountry {
  name: string
  pinned: boolean
}

interface IPhoneElements {
  field: Readonly<Ref<HTMLInputElement | null>>
  search: Readonly<Ref<HTMLInputElement | null>>
  list: Readonly<Ref<HTMLElement | null>>
  root: Readonly<Ref<HTMLElement | null>>
}

const INTERNATIONAL = /^\s*(\+|00)/

const digitsOf = (value: string): string => value.replace(/\D/g, '')

export const usePhoneInput = (model: Ref<string>, elements: IPhoneElements) => {
  const { locale } = useI18n()

  const country = ref<IPhoneCountry>(splitPhone(model.value).country)
  let emitted = model.value

  watch(model, (value) => {
    if (value === emitted) return

    emitted = value

    if (value) country.value = splitPhone(value).country
  })

  const isHome = computed(() => country.value.code === PHONE_COUNTRY_CODE)

  const national = computed(() => splitPhone(model.value).national)

  const display = computed(() => (isHome.value ? formatPhone(national.value) : formatNational(national.value)))

  const placeholder = computed(() => (isHome.value ? '(90) 123-45-67' : ''))

  const nameOf = (option: IPhoneCountry): string => countryName(option.iso, locale.value)

  function emit(value: string) {
    emitted = value
    model.value = value
  }

  async function commit(digits: string, digitsBeforeCaret: number) {
    emit(joinPhone(country.value, digits))

    await nextTick()

    const element = elements.field.value

    if (!element || document.activeElement !== element) return

    const formatted = display.value
    let seen = 0
    let position = formatted.length

    for (let index = 0; index < formatted.length; index += 1) {
      if (/\d/.test(formatted[index]!)) seen += 1

      if (seen === digitsBeforeCaret) {
        position = index + 1
        break
      }
    }

    element.setSelectionRange(position, position)
  }

  function accept(text: string, digitsBeforeCaret: number) {
    if (INTERNATIONAL.test(text)) {
      const parts = splitPhone(`+${digitsOf(text.replace(/^\s*00/, ''))}`)

      country.value = parts.country

      void commit(parts.national, parts.national.length)

      return
    }

    void commit(isHome.value ? phoneDigits(text) : digitsOf(text), digitsBeforeCaret)
  }

  function onInput(event: Event) {
    const element = event.target as HTMLInputElement
    const caret = element.selectionStart ?? element.value.length

    accept(element.value, digitsOf(element.value.slice(0, caret)).length)
  }

  function onPaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text')

    if (!pasted) return

    event.preventDefault()

    accept(pasted, digitsOf(pasted).length)
  }

  const open = ref(false)
  const query = ref('')
  const active = ref(0)

  const collator = computed(() => new Intl.Collator(locale.value))

  const options = computed<IPhoneOption[]>(() => {
    if (!open.value) return []

    const all = PHONE_COUNTRIES.map(option => ({ ...option, name: nameOf(option), pinned: PINNED_PHONE_COUNTRIES.includes(option.iso) }))
    const needle = query.value.trim().toLowerCase()
    const byName = (a: IPhoneOption, b: IPhoneOption) => collator.value.compare(a.name, b.name)

    if (needle) {
      const digits = digitsOf(needle)

      return all
        .filter(option => option.name.toLowerCase().includes(needle) || option.iso.toLowerCase() === needle || (digits && option.code.startsWith(digits)))
        .sort(byName)
    }

    const pinned = PINNED_PHONE_COUNTRIES.flatMap(iso => all.filter(option => option.iso === iso))

    return [...pinned, ...all.filter(option => !option.pinned).sort(byName)]
  })

  watch(query, () => { active.value = 0 })

  function reveal() {
    nextTick(() => elements.list.value?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' }))
  }

  function show() {
    query.value = ''
    open.value = true
    active.value = Math.max(0, options.value.findIndex(option => option.iso === country.value.iso))

    nextTick(() => {
      elements.search.value?.focus()
      reveal()
    })
  }

  function close() {
    open.value = false
  }

  const toggle = () => (open.value ? close() : show())

  function move(delta: number) {
    const count = options.value.length

    if (!count) return

    active.value = (active.value + delta + count) % count

    reveal()
  }

  function choose(option: IPhoneOption | undefined) {
    if (!option) return

    country.value = { iso: option.iso, code: option.code }

    emit(joinPhone(country.value, national.value))
    close()

    nextTick(() => elements.field.value?.focus())
  }

  function onEscape(event: KeyboardEvent) {
    if (!open.value) return

    event.stopPropagation()
    close()
  }

  function onFocusOut(event: FocusEvent) {
    if (!elements.root.value?.contains(event.relatedTarget as Node | null)) close()
  }

  return {
    country, display, placeholder, nameOf, onInput, onPaste,
    open, query, active, options, toggle, move, choose, onEscape, onFocusOut,
  }
}
