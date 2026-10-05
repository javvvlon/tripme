import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useLeadsRepository } from '~/modules/leads/repositories'
import { LEAD_TRANSITIONS } from '~/modules/leads/contracts/leads'
import { buildQuote, byPrice, quotePassportIssues } from '~/modules/leads/helpers/quote'
import type { ILeadRaw } from '~/modules/leads/contracts/leads'
import type { IQuoteModalProps, QuoteLanguage } from './QuoteModal.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useQuoteModal = (props: IQuoteModalProps, opened: Ref<boolean>) => {
  const { t, locale } = useI18n()
  const { $i18n } = useNuxtApp()
  const { user } = useAuthSession()
  const tours = computed(() => props.tours)
  const { one, setStatus } = useLeadsRepository()
  const { rates } = useUzsRates()
  const toast = useToast()

  const language = ref<QuoteLanguage>((['ru', 'uz', 'en'].includes(locale.value) ? locale.value : 'ru') as QuoteLanguage)
  const ready = ref(true)
  const client = ref('')
  const passport = ref('')
  const includes = ref('')
  const text = ref('')
  const lead = ref<ILeadRaw | null>(null)
  const markLead = ref(true)

  const translate = (key: string, params: Record<string, unknown> = {}, plural?: number) =>
    plural === undefined
      ? t(key, params, { locale: language.value })
      : t(key, params, { locale: language.value, plural })

  watch(language, async (next) => {
    ready.value = false
    await $i18n.loadLocaleMessages(next).catch(() => undefined)
    includes.value = translate('quote.includesDefault')
    ready.value = true
  }, { immediate: true })

  watch(opened, async (open) => {
    if (!open) return

    lead.value = null
    client.value = ''
    passport.value = props.passport ?? ''

    if (props.leadId) {
      lead.value = await one(props.leadId).catch(() => null)
      client.value = lead.value ? [lead.value.first_name, lead.value.last_name].filter(Boolean).join(' ') : ''
    }
  }, { immediate: true })

  const manager = computed(() =>
    [user.value?.get('firstName'), user.value?.get('lastName')].filter(Boolean).join(' '))

  const generated = computed(() => {
    if (!ready.value || !tours.value.length) return ''

    return buildQuote({
      tours: tours.value,
      locale: language.value,
      t: translate,
      client: client.value,
      destination: props.destination,
      departure: props.departure,
      includes: includes.value,
      manager: manager.value,
      uzsRate: rates.value?.rates?.USD ?? null,
      today: new Date().toISOString(),
    })
  })

  watch(generated, (next) => { text.value = next }, { immediate: true })

  const passportIssues = computed(() => quotePassportIssues(byPrice(tours.value), passport.value))

  const canMarkLead = computed(() =>
    Boolean(lead.value) && (LEAD_TRANSITIONS[lead.value!.status] ?? []).includes('quote_sent'))

  async function afterSend() {
    if (!markLead.value || !canMarkLead.value || !lead.value) return

    try {
      lead.value = await setStatus(lead.value.uuid, 'quote_sent')
      toast.success(t('quote.leadMarked', { ref: lead.value.ref }))
    }
    catch {
      toast.error(t('quote.leadMarkFailed'))
    }
  }

  const copyBySelection = (): boolean => {
    const area = document.createElement('textarea')

    area.value = text.value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()

    const done = document.execCommand('copy')

    area.remove()

    return done
  }

  async function copy() {
    let copied = false

    try {
      await navigator.clipboard.writeText(text.value)
      copied = true
    }
    catch {
      copied = copyBySelection()
    }

    if (!copied) {
      toast.error(t('quote.copyFailed'))
      return
    }

    toast.success(t('quote.copied'))
    await afterSend()
  }

  async function share(channel: 'telegram' | 'whatsapp') {
    const encoded = encodeURIComponent(text.value)
    const url = channel === 'telegram'
      ? `https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encoded}`
      : `https://wa.me/?text=${encoded}`

    window.open(url, '_blank', 'noopener')
    await afterSend()
  }

  return {
    language, client, passport, includes, text, lead, markLead, canMarkLead,
    passportIssues, tours, copy, share,
  }
}
