import { useContentRepository } from '~/modules/content/repositories'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { BadgeType } from '~/modules/content/contracts/blocks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IDraftItem {
  key: string
  imageUrl: string
  link: string
  badgeType: BadgeType | ''
  translations: Record<ContentLocale, { title: string, description: string, badgeLabel: string }>
}

const blankTranslations = () => Object.fromEntries(
  CONTENT_LOCALES.map(locale => [locale, { title: '', description: '', badgeLabel: '' }]),
) as IDraftItem['translations']

let counter = 0
const nextKey = () => `draft-${++counter}`

export const useListEditor = (id: string) => {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const { list, updateList, upload, removeUpload } = useContentRepository()

  const locale = ref<ContentLocale>('en')
  const name = ref('')
  const items = ref<IDraftItem[]>([])

  const uploading = ref<string | null>(null)

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const loaded = ref(false)

  const { status } = useAsyncData(`cms:list:${id}`, async () => {
    const raw = await list(id)

    if (loaded.value) return true

    loaded.value = true

    name.value = raw.name
    items.value = raw.items.map(item => ({
      key: item.uuid,
      imageUrl: item.image_url ?? '',
      link: item.link ?? '',
      badgeType: item.badge_type ?? '',
      translations: {
        ...blankTranslations(),
        ...Object.fromEntries(item.translations.map(translation => [
          translation.locale,
          {
            title: translation.title,
            description: translation.description ?? '',
            badgeLabel: translation.badge_label ?? '',
          },
        ])),
      },
    }))

    return true
  })

  const add = () => {
    items.value = [...items.value, {
      key: nextKey(),
      imageUrl: '',
      link: '',
      badgeType: '',
      translations: blankTranslations(),
    }]
  }

  const remove = (key: string) => {
    items.value = items.value.filter(item => item.key !== key)
  }

  async function pickImage(key: string, file: File | null) {
    if (!file) return

    uploading.value = key
    error.value = ''

    let settle = () => {}
    uploads = new Promise((resolve) => { settle = () => resolve(undefined) })

    try {
      const url = await upload(file)
      const item = items.value.find(candidate => candidate.key === key)

      if (item) {
        item.imageUrl = url
        items.value = [...items.value]
      }
    }
    catch {
      error.value = t('cms.lists.uploadFailed')
    }
    finally {
      uploading.value = null
      settle()
    }
  }

  const clearImage = (key: string) => {
    const item = items.value.find(candidate => candidate.key === key)

    if (item) {
      item.imageUrl = ''
      items.value = [...items.value]
    }
  }

  /**
   * Delete the stored file the picker has stopped referencing.
   *
   * Awaited after the replacement has uploaded, not before: deleting first
   * would lose the old image if the new one failed to arrive.
   */
  const discardImage = (url: string) => {
    void uploads.then(() => removeUpload(url))
  }

  /** Resolves once nothing is uploading, so a discard never races a replace. */
  let uploads: Promise<unknown> = Promise.resolve()

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.value.length) return

    const next = [...items.value]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    items.value = next
  }

  const missingTitles = computed(() =>
    items.value.filter(item => !CONTENT_LOCALES.some(code => item.translations[code].title.trim())))

  async function submit() {
    error.value = ''
    saved.value = false

    if (!name.value.trim()) {
      error.value = t('cms.lists.nameRequired')
      return
    }

    if (missingTitles.value.length) {
      error.value = t('cms.lists.titleRequired')
      return
    }

    saving.value = true

    try {
      await updateList(id, {
        name: name.value.trim(),
        items: items.value.map(item => ({
          image_url: item.imageUrl.trim() || null,
          link: item.link.trim() || null,
          badge_type: item.badgeType || null,
          translations: CONTENT_LOCALES.map(code => ({
            locale: code,
            title: item.translations[code].title,
            description: item.translations[code].description,
            badge_label: item.translations[code].badgeLabel,
          })),
        })),
      })

      saved.value = true
    }
    catch {
      error.value = t('cms.errors.save')
    }
    finally {
      saving.value = false
    }
  }

  const back = () => navigateTo(localePath('/app/content/lists'))

  return {
    locale, name, items, status, saving, saved, error, uploading,
    add, remove, move, submit, back, pickImage, clearImage, discardImage,
  }
}
