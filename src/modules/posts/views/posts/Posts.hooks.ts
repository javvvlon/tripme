import { usePostsRepository } from '~/modules/posts/repositories'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[Ѐ-ӿ]/g, character => TRANSLITERATION[character] ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const TRANSLITERATION: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
}

const VIEW_KEY = 'tm:cms:posts:view'

export type PostsView = 'tile' | 'card'

export const usePosts = () => {
  const { t } = useI18n()
  const { failed, saved: cheer, fail, loadFailed } = useToast()
  const { ask } = useConfirm()
  const localePath = useLocalePath()
  const { all, create, remove: removePost } = usePostsRepository()

  const error = ref('')
  const busy = ref(false)

  const view = ref<PostsView>('tile')

  onMounted(() => {
    const stored = localStorage.getItem(VIEW_KEY)

    if (stored === 'tile' || stored === 'card') view.value = stored
  })

  watch(view, next => localStorage.setItem(VIEW_KEY, next))

  const creating = ref(false)
  const draft = reactive({ title: '', slug: '', touched: false })

  const { data, status, refresh } = useAsyncData('cms:posts', () => all(), { default: () => [] })

  const slugIsValid = computed(() => SLUG_PATTERN.test(draft.slug))
  const canCreate = computed(() => Boolean(draft.title.trim()) && slugIsValid.value)

  watch(() => draft.title, (next) => {
    if (!draft.touched) draft.slug = slugify(next)
  })

  function open() {
    draft.title = ''
    draft.slug = ''
    draft.touched = false
    error.value = ''
    creating.value = true
  }

  async function submit() {
    if (!canCreate.value) return

    busy.value = true
    error.value = ''

    try {
      const post = await create({ title: draft.title, slug: draft.slug, locale: 'ru' })

      creating.value = false

      await navigateTo(localePath(`/app/posts/${post.uuid}`))
    }
    catch (e) {
      error.value = failed(e)
    }
    finally {
      busy.value = false
    }
  }

  async function remove(id: string, title?: string) {
    if (!await ask({
      title: t('cms.posts.confirmDelete.title'),
      description: t('cms.posts.confirmDelete.lead'),
      subject: title || undefined,
    })) return

    error.value = ''

    try {
      await removePost(id)
      await refresh()
    }
    catch {
      error.value = fail(t('cms.errors.save'))
    }
  }

  return { posts: data, status, error, busy, view, creating, draft, canCreate, slugIsValid, open, submit, remove, refresh }
}
