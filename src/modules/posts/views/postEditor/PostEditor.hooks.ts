import { usePostsRepository } from '~/modules/posts/repositories'
import { useContentRepository } from '~/modules/content/repositories'
import { CMS_DEFAULT_LOCALE, CONTENT_LOCALES } from '~/modules/content/contracts/content'
import { Post } from '~/modules/posts/models/Post'
import { POST_EXCERPT_MAX, POST_TITLE_MAX } from './PostEditor.config'
import { tripFromTour } from '~/modules/leads/helpers/trip'
import type { Tour } from '~/search_engine/models/Tour'
import type { ContentLocale } from '~/modules/content/contracts/content'
import type { IPostDraft } from '~/modules/posts/contracts/posts'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const usePostEditor = () => {
  const { t } = useI18n()
  const { failed, saved: cheer } = useToast()
  const { ask } = useConfirm()
  const route = useRoute()
  const localePath = useLocalePath()

  const { one, update, remove: removePost } = usePostsRepository()
  const { upload, removeUpload } = useContentRepository()
  const { mediaLibrary } = useMediaLibrary()

  const id = computed(() => String(route.params.id ?? ''))

  const locale = ref<ContentLocale>(CMS_DEFAULT_LOCALE)
  const draft = reactive<IPostDraft>(Post.emptyDraft())

  const author = ref<string | null>(null)

  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')
  const uploading = ref(false)
  const imageError = ref('')

  const fill = (raw: Awaited<ReturnType<typeof one>>) => {
    const next = Post.toDraft(raw)

    draft.slug = next.slug
    draft.imageUrl = next.imageUrl
    draft.badgeType = next.badgeType
    draft.link = next.link
    draft.isPublished = next.isPublished
    draft.tour = next.tour

    author.value = raw.author
      ? `${raw.author.first_name} ${raw.author.last_name}`.trim() || null
      : null

    for (const code of CONTENT_LOCALES) draft.translations[code] = next.translations[code]
  }

  const { status, refresh } = useAsyncData(`cms:post:${id.value}`, async () => {
    try {
      fill(await one(id.value))
    }
    catch {
      error.value = t('cms.errors.load')
    }

    return true
  })

  const validation = useValidation(
    () => draft.translations[locale.value],
    {
      title: [required(), maxLength(POST_TITLE_MAX)],
      excerpt: [maxLength(POST_EXCERPT_MAX)],
    },
  )

  let uploads: Promise<unknown> = Promise.resolve()

  async function pickImage(file: File | null) {
    if (!file) return

    uploading.value = true
    error.value = ''

    let settle = () => {}
    uploads = new Promise((resolve) => { settle = () => resolve(undefined) })

    try {
      draft.imageUrl = await upload(file)
    }
    catch {
      error.value = t('cms.lists.uploadFailed')
    }
    finally {
      uploading.value = false
      settle()
    }
  }

  const uploadInline = async (chosen: File): Promise<string> => upload(chosen)

  const assignTour = (chosen: Tour | null) => {
    draft.tour = chosen ? tripFromTour(chosen) : null
  }

  const useStored = (url: string) => {
    draft.imageUrl = url
  }

  const clearImage = () => {
    draft.imageUrl = null
  }

  const discardImage = (url: string) => {
    void uploads.then(() => removeUpload(url))
  }

  async function submit() {
    error.value = ''
    saved.value = false

    if (!draft.translations[locale.value].title.trim()) {
      validation.validate()
      error.value = t('cms.errors.titleMissing')

      return
    }

    if (draft.isPublished && !draft.translations.ru.title.trim()) {
      locale.value = 'ru'
      validation.validate()
      error.value = t('cms.posts.errors.needsRussian')

      return
    }

    if (imageError.value) {
      error.value = t('cms.errors.imageRejected')

      return
    }

    saving.value = true

    try {
      fill(await update(id.value, draft))
      saved.value = true
      cheer()
    }
    catch (e) {
      error.value = failed(e)
    }
    finally {
      saving.value = false
    }
  }

  async function remove() {
    if (!await ask({
      title: t('cms.posts.confirmDelete.title'),
      description: t('cms.posts.confirmDelete.lead'),
      subject: draft.translations[locale.value].title || undefined,
    })) return

    error.value = ''

    try {
      await removePost(id.value)
      await navigateTo(localePath('/app/posts'))
    }
    catch {
      error.value = t('cms.errors.save')
    }
  }

  return {
    id, locale, draft, author, validation, status, saving, saved, error,
    uploading, imageError, submit, remove, refresh, pickImage, clearImage, discardImage, uploadInline, mediaLibrary, assignTour, useStored,
  }
}
