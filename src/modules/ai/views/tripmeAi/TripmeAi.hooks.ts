import { useAiRepository } from '~/modules/ai/repositories'
import type { ITripmeAnswer } from '~/modules/ai/contracts/ai'
import type { IAssistantAnswer, IIntakeReport, ISelection } from '~/modules/marketing/contracts/marketing'
import type { IBlogAssistantAnswer } from '~/modules/posts/contracts/posts'
import type { IAiAnswer, IAiAsk, IAiCapability } from '~/shared/components/aiChat/AiChat.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTripmeAi = () => {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const repository = useAiRepository()

  const skipped = (report: IIntakeReport) =>
    report.skipped.map(item => `— ${item.hotel}: ${t(`cms.marketing.intake.reasons.${item.reason}`)}`)

  function built(selection: ISelection, report: IIntakeReport): IAiAnswer {
    const left = skipped(report)

    return {
      text: [
        ...(report.own
          ? [t('cms.marketing.assistant.ownReady', { title: selection.title })]
          : [t('cms.marketing.assistant.ready', { title: selection.title }), t('cms.marketing.assistant.found', { n: report.found }), t('cms.marketing.assistant.kept', { n: report.kept })]),
        ...(left.length ? [t('cms.marketing.assistant.left'), ...left] : []),
      ].join('\n'),
      cards: [{
        icon: 'megaphone',
        title: selection.title,
        sub: t('cms.marketing.assistant.card', { n: selection.tours.length, code: selection.code }),
        to: localePath(`/app/marketing/${selection.id}`),
        label: t('cms.marketing.assistant.open'),
      }],
    }
  }

  function marketing(answer: IAssistantAnswer, said: string): IAiAnswer {
    if (answer.kind === 'reply') {
      return { text: answer.reply || t('cms.marketing.assistant.emptyText'), suggestions: answer.suggestions, context: { domain: 'marketing', pending: '' } }
    }

    if (answer.selection) return { ...built(answer.selection, answer.report), context: { domain: 'marketing', pending: '' } }

    return {
      text: [answer.report.country ? t('cms.marketing.intake.noTours') : t('cms.marketing.assistant.noCountry'), ...skipped(answer.report)].join('\n'),
      suggestions: answer.report.country ? [] : [t('cms.marketing.assistant.tryShot')],
      context: { domain: 'marketing', pending: said },
    }
  }

  function blog(answer: IBlogAssistantAnswer): IAiAnswer {
    if (!answer.post) {
      return { text: answer.reply || t('cms.posts.assistant.emptyText'), suggestions: answer.suggestions, context: { domain: 'blog', pending: '' } }
    }

    const reply = answer.reply || t(answer.post.revised ? 'cms.posts.assistant.revisedText' : 'cms.posts.assistant.createdText')
    const missing = answer.post.missing_images ? t('cms.posts.assistant.missingImages', { n: answer.post.missing_images }) : ''
    const status = answer.post.revised ? t('cms.posts.assistant.revised') : t('cms.posts.assistant.created')

    return {
      text: [reply, missing].filter(Boolean).join('\n\n'),
      suggestions: answer.suggestions,
      context: { domain: 'blog', pending: '', post_id: answer.post.id },
      cards: [{
        icon: 'doc',
        title: answer.post.title,
        sub: answer.post.images ? `${status} · ${t('cms.posts.assistant.withImages', { n: answer.post.images })}` : status,
        to: localePath(`/app/posts/${answer.post.id}`),
        label: t('cms.posts.assistant.open'),
      }],
    }
  }

  function answerOf(answer: ITripmeAnswer): IAiAnswer {
    if (answer.domain === 'marketing') return marketing(answer.marketing, answer.text)
    if (answer.domain === 'blog') return blog(answer.blog)

    return { text: answer.reply || t('cms.ai.emptyText'), suggestions: answer.suggestions, context: { domain: 'general', pending: '' } }
  }

  async function send(ask: IAiAsk): Promise<IAiAnswer> {
    return answerOf(await repository.ask(ask.text, ask.image, ask.history, ask.context))
  }

  const capabilities = computed<IAiCapability[]>(() => [
    { key: 'link', icon: 'link', title: t('cms.marketing.assistant.can.link.title'), text: t('cms.marketing.assistant.can.link.text') },
    { key: 'shot', icon: 'image', title: t('cms.marketing.assistant.can.shot.title'), text: t('cms.marketing.assistant.can.shot.text'), attach: true },
    { key: 'own', icon: 'sparkle', title: t('cms.marketing.assistant.can.own.title'), text: t('cms.marketing.assistant.can.own.text'), prompt: t('cms.marketing.assistant.can.own.prompt') },
    { key: 'article', icon: 'pencil', title: t('cms.posts.assistant.can.article.title'), text: t('cms.posts.assistant.can.article.text'), prompt: t('cms.posts.assistant.can.article.prompt') },
    { key: 'ideas', icon: 'layers', title: t('cms.posts.assistant.can.ideas.title'), text: t('cms.posts.assistant.can.ideas.text'), prompt: t('cms.posts.assistant.can.ideas.prompt') },
    { key: 'advice', icon: 'megaphone', title: t('cms.marketing.assistant.can.advice.title'), text: t('cms.marketing.assistant.can.advice.text'), prompt: t('cms.marketing.assistant.can.advice.prompt') },
  ])

  const thinking = computed(() => [t('cms.ai.thinking.read'), t('cms.ai.thinking.pick'), t('cms.ai.thinking.work')])

  return { send, capabilities, thinking }
}
