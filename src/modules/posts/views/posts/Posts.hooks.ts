import { usePostsRepository } from '~/modules/posts/repositories'
import { CONTENT_LOCALES, preferredTranslation } from '~/modules/content/contracts/content'
import { TEXT_SORTS } from './Posts.config'
import type { PostFilter, PostSort } from './Posts.config'
import type { IPostAdminRaw } from '~/modules/posts/contracts/posts'

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

export const usePosts = () => {
  const { t } = useI18n()
  const { failed, saved: cheer, fail, loadFailed } = useToast()
  const { ask } = useConfirm()
  const localePath = useLocalePath()
  const { all, create, remove: removePost } = usePostsRepository()

  const error = ref('')
  const busy = ref(false)

  const query = ref('')
  const filter = ref<PostFilter>('all')
  const sort = ref<PostSort>('updated')
  const direction = ref<'asc' | 'desc'>('desc')

  const creating = ref(false)
  const draft = reactive({ title: '', slug: '', touched: false })

  const { data, status, refresh } = useAsyncData('cms:posts', () => all(), { default: () => [] as IPostAdminRaw[] })

  const titleOf = (post: IPostAdminRaw): string =>
    preferredTranslation(post.translations, translation => Boolean(translation.title))?.title ?? ''

  const authorOf = (post: IPostAdminRaw): string =>
    `${post.author?.first_name ?? ''} ${post.author?.last_name ?? ''}`.trim()

  const languagesOf = (post: IPostAdminRaw) => CONTENT_LOCALES.map(locale => ({
    locale,
    filled: post.translations.some(translation => translation.locale === locale && Boolean(translation.title?.trim())),
  }))

  const SORT_VALUE: Record<PostSort, (post: IPostAdminRaw) => string | number> = {
    title: post => titleOf(post).toLowerCase(),
    author: post => authorOf(post).toLowerCase(),
    status: post => (post.is_published ? 0 : 1),
    published: post => (post.published_at ? Date.parse(post.published_at) : 0),
    updated: post => Date.parse(post.updated_at),
  }

  const rows = computed(() => {
    const needle = query.value.trim().toLowerCase()
    const value = SORT_VALUE[sort.value]
    const sign = direction.value === 'asc' ? 1 : -1

    return (data.value ?? [])
      .filter(post => filter.value === 'all' || post.is_published === (filter.value === 'published'))
      .filter(post => !needle
        || post.slug.includes(needle)
        || authorOf(post).toLowerCase().includes(needle)
        || post.translations.some(translation => translation.title?.toLowerCase().includes(needle)))
      .sort((a, b) => {
        const left = value(a)
        const right = value(b)

        if (left === right) return 0

        return (left > right ? 1 : -1) * sign
      })
  })

  const counts = computed(() => {
    const posts = data.value ?? []

    return { total: posts.length, live: posts.filter(post => post.is_published).length }
  })

  function sortBy(column: PostSort) {
    if (sort.value === column) {
      direction.value = direction.value === 'asc' ? 'desc' : 'asc'
      return
    }

    sort.value = column
    direction.value = TEXT_SORTS.includes(column) ? 'asc' : 'desc'
  }

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

  return {
    posts: rows, counts, status, error, busy, creating, draft, canCreate, slugIsValid,
    query, filter, sort, direction, sortBy, titleOf, authorOf, languagesOf,
    open, submit, remove, refresh,
  }
}
