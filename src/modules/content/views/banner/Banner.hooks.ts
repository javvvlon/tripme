import { useContentRepository } from '~/modules/content/repositories'
import { CMS_DEFAULT_LOCALE, CONTENT_LOCALES } from '~/modules/content/contracts/content'
import { BANNER_TITLE_MAX } from './Banner.config'
import type { Banner } from '~/modules/content/models/Banner'
import type { BannerDraft, ContentLocale } from '~/modules/content/contracts/content'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const blank = (): BannerDraft => Object.fromEntries(
  CONTENT_LOCALES.map(locale => [locale, { title: '', subtitle: '', imageUrl: null }]),
) as BannerDraft

export const useBanner = () => {
  const { t } = useI18n()
  const { saved: cheer } = useToast()
  const { banner, saveBanner, upload, removeUpload } = useContentRepository()
  const { mediaLibrary } = useMediaLibrary()

  const locale = ref<ContentLocale>(CMS_DEFAULT_LOCALE)
  const draft = reactive<BannerDraft>(blank())

  const uploading = ref(false)

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  const fill = (model: Banner) => {
    for (const code of CONTENT_LOCALES) {
      const translation = model.get('translations')[code]

      draft[code].title = translation.title
      draft[code].subtitle = translation.subtitle
      draft[code].imageUrl = translation.imageUrl
    }
  }

  const { status, refresh } = useAsyncData('cms:banner', async () => {
    try {
      fill(await banner())
    }
    catch (e) {
      const response = e as { status?: number }

      if (response.status !== 404) error.value = t('cms.errors.load')
    }

    return true
  })

  const validation = useValidation(
    () => draft[locale.value],
    { title: [required(), maxLength(BANNER_TITLE_MAX)] },
  )

  const imageError = ref('')

  const inheritedImage = computed(() => {
    if (draft[locale.value].imageUrl) return null

    const donor = CONTENT_LOCALES.find(code => code !== locale.value && draft[code].imageUrl)

    return donor ? { locale: donor, url: draft[donor].imageUrl! } : null
  })

  let uploads: Promise<unknown> = Promise.resolve()

  async function pickImage(file: File | null) {
    if (!file) return

    const target = locale.value

    uploading.value = true
    error.value = ''

    let settle = () => {}
    uploads = new Promise((resolve) => { settle = () => resolve(undefined) })

    try {
      draft[target].imageUrl = await upload(file)
    }
    catch {
      error.value = t('cms.lists.uploadFailed')
    }
    finally {
      uploading.value = false
      settle()
    }
  }

  const useStored = (url: string) => {
    draft[locale.value].imageUrl = url
  }

  const clearImage = () => {
    draft[locale.value].imageUrl = null
  }

  /**
   * Deleted only once any replacement has landed — otherwise a failed upload
   * would leave the banner with neither the old image nor a new one.
   */
  const discardImage = (url: string) => {
    void uploads.then(() => removeUpload(url))
  }

  async function submit() {
    error.value = ''
    saved.value = false

    const missing = CONTENT_LOCALES.find(code => !draft[code].title.trim())

    if (missing) {
      locale.value = missing
      validation.validate()
      error.value = t('cms.errors.titleMissing')

      return
    }

    if (imageError.value) {
      error.value = t('cms.errors.imageRejected')

      return
    }

    saving.value = true

    try {
      fill(await saveBanner(draft))
      saved.value = true
      cheer()
    }
    catch {
      error.value = t('cms.errors.save')
    }
    finally {
      saving.value = false
    }
  }

  return {
    locale, draft, validation, imageError, inheritedImage, status, saving, saved, error, uploading,
    submit, refresh, pickImage, clearImage, discardImage, mediaLibrary, useStored,
  }
}
