import { usePostsRepository } from '~/modules/posts/repositories'
import type { IAiAnswer, IAiAsk, IAiCapability } from '~/shared/components/aiChat/AiChat.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useBlogAssistant = () => {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const repository = usePostsRepository()

  async function send(ask: IAiAsk): Promise<IAiAnswer> {
    const draft = typeof ask.context.post_id === 'string' ? ask.context.post_id : null
    const answer = await repository.assistant({ text: ask.text, history: ask.history, post_id: draft })

    if (!answer.post) return { text: answer.reply || t('cms.posts.assistant.emptyText'), suggestions: answer.suggestions }

    const reply = answer.reply || t(answer.post.revised ? 'cms.posts.assistant.revisedText' : 'cms.posts.assistant.createdText')
    const missing = answer.post.missing_images ? t('cms.posts.assistant.missingImages', { n: answer.post.missing_images }) : ''
    const status = answer.post.revised ? t('cms.posts.assistant.revised') : t('cms.posts.assistant.created')

    return {
      text: [reply, missing].filter(Boolean).join('\n\n'),
      suggestions: answer.suggestions,
      context: { post_id: answer.post.id },
      cards: [{
        icon: 'doc',
        title: answer.post.title,
        sub: answer.post.images ? `${status} · ${t('cms.posts.assistant.withImages', { n: answer.post.images })}` : status,
        to: localePath(`/app/posts/${answer.post.id}`),
        label: t('cms.posts.assistant.open'),
      }],
    }
  }

  const capabilities = computed<IAiCapability[]>(() => (['article', 'ideas', 'review', 'revise'] as const).map(key => ({
    key,
    icon: { article: 'pencil', ideas: 'layers', review: 'eye', revise: 'undo' }[key],
    title: t(`cms.posts.assistant.can.${key}.title`),
    text: t(`cms.posts.assistant.can.${key}.text`),
    prompt: t(`cms.posts.assistant.can.${key}.prompt`),
  })))

  const thinking = computed(() => [
    t('cms.posts.assistant.thinking.read'),
    t('cms.posts.assistant.thinking.plan'),
    t('cms.posts.assistant.thinking.write'),
  ])

  return { send, capabilities, thinking }
}
