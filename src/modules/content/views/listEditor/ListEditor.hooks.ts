import { useContentRepository } from '~/modules/content/repositories'
import { CMS_DEFAULT_LOCALE, CONTENT_LOCALES } from '~/modules/content/contracts/content'
import type { ContentLocale } from '~/modules/content/contracts/content'
import { BLOCKS } from '~/modules/content/contracts/blocks'
import type { BadgeType, SectionKind } from '~/modules/content/contracts/blocks'

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
  const { saved: cheer, fail, loadFailed } = useToast()
  const localePath = useLocalePath()
  const { list, updateList, upload, removeUpload } = useContentRepository()
  const { mediaLibrary } = useMediaLibrary()

  const locale = ref<ContentLocale>(CMS_DEFAULT_LOCALE)
  const name = ref('')
  const kind = ref<SectionKind>('cards')
  const savedKind = ref<SectionKind>('cards')
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
    kind.value = raw.kind ?? 'cards'
    savedKind.value = kind.value
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
      error.value = fail(t('cms.lists.uploadFailed'))
    }
    finally {
      uploading.value = null
      settle()
    }
  }

  const useStored = (key: string, url: string) => {
    const item = items.value.find(candidate => candidate.key === key)

    if (item) {
      item.imageUrl = url
      items.value = [...items.value]
    }
  }

  const clearImage = (key: string) => {
    const item = items.value.find(candidate => candidate.key === key)

    if (item) {
      item.imageUrl = ''
      items.value = [...items.value]
    }
  }

  const discardImage = (url: string) => {
    void uploads.then(() => removeUpload(url))
  }

  let uploads: Promise<unknown> = Promise.resolve()

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.value.length) return

    const next = [...items.value]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    items.value = next
  }

  const fields = computed(() => BLOCKS[kind.value].item)

  const missingTitles = computed(() =>
    items.value.filter(item => !CONTENT_LOCALES.some(code => item.translations[code].title.trim())))

  async function submit() {
    error.value = ''
    saved.value = false

    if (!name.value.trim()) {
      error.value = fail(t('cms.lists.nameRequired'))
      return
    }

    if (missingTitles.value.length) {
      error.value = fail(t('cms.lists.titleRequired'))
      return
    }

    saving.value = true

    try {
      await updateList(id, {
        name: name.value.trim(),
        kind: kind.value,
        items: items.value.map(item => ({
          image_url: fields.value.image ? item.imageUrl.trim() || null : null,
          link: fields.value.link ? item.link.trim() || null : null,
          badge_type: fields.value.badge ? item.badgeType || null : null,
          translations: CONTENT_LOCALES.map(code => ({
            locale: code,
            title: item.translations[code].title,
            description: item.translations[code].description,
            badge_label: item.translations[code].badgeLabel,
          })),
        })),
      })

      savedKind.value = kind.value
      saved.value = true
      cheer()
    }
    catch {
      error.value = fail(t(kind.value === savedKind.value ? 'cms.errors.save' : 'cms.lists.kindLocked'))
    }
    finally {
      saving.value = false
    }
  }

  const back = () => navigateTo(localePath('/app/content/lists'))

  return {
    locale, name, kind, fields, items, status, saving, saved, error, uploading,
    add, remove, move, submit, back, pickImage, clearImage, discardImage, useStored, mediaLibrary,
  }
}
