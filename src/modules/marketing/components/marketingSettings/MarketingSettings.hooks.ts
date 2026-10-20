import { useAuthSession } from '~/modules/auth/hooks/use-auth-session'
import { useMarketingRepository } from '../../repositories'
import type { AdLanguage, IAdContact, IMarketingSettings } from '../../contracts/marketing'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const MAX_CONTACTS = 12

const EDITORS = ['MANAGER', 'ADMIN']

export const useMarketingSettings = (
  props: { settings: IMarketingSettings | null, tab?: 'voice' | 'managers' },
  open: Ref<boolean>,
  onSaved: (next: IMarketingSettings) => void,
) => {
  const { t } = useI18n()
  const { user } = useAuthSession()
  const { failed, saved } = useToast()
  const { saveSettings } = useMarketingRepository()

  const tab = ref<'voice' | 'managers'>(props.tab ?? 'voice')
  const voice = ref('')
  const footer = reactive<Record<AdLanguage, string>>({ ru: '', uz: '' })
  const contacts = ref<IAdContact[]>([])
  const busy = ref(false)

  const canEdit = computed(() => EDITORS.includes(user.value?.get('role') ?? ''))

  const tabs = computed(() => [
    { value: 'voice', label: t('cms.marketing.settings.voice') },
    { value: 'managers', label: t('cms.marketing.settings.managers'), count: contacts.value.length },
  ])

  watch(open, (next) => {
    if (!next || !props.settings) return

    tab.value = props.tab ?? 'voice'
    voice.value = props.settings.voice
    Object.assign(footer, props.settings.footer)
    contacts.value = props.settings.contacts.map(contact => ({ ...contact, telegram: contact.telegram ? `@${contact.telegram}` : '' }))
  }, { immediate: true })

  const isDefault = computed(() => voice.value.trim() === (props.settings?.default_voice ?? '').trim())

  const resetVoice = () => { voice.value = props.settings?.default_voice ?? '' }

  const addContact = () => {
    if (contacts.value.length >= MAX_CONTACTS) return

    contacts.value = [...contacts.value, { id: '', name: '', telegram: '' }]
  }

  const removeContact = (index: number) => {
    contacts.value = contacts.value.filter((_, at) => at !== index)
  }

  async function save() {
    if (!canEdit.value) {
      open.value = false
      return
    }

    busy.value = true

    try {
      const next = await saveSettings({
        voice: voice.value,
        footer: { ...footer },
        contacts: contacts.value.filter(contact => contact.name.trim() || contact.telegram.trim()),
      })

      onSaved(next)
      saved(t('cms.marketing.settings.saved'))
      open.value = false
    }
    catch (error) {
      failed(error)
    }
    finally {
      busy.value = false
    }
  }

  return { tab, tabs, voice, footer, contacts, busy, canEdit, isDefault, resetVoice, addContact, removeContact, save, max: MAX_CONTACTS }
}
