import { useMarketingRepository } from '~/modules/marketing/repositories'
import type { IIntakeReport, ISelection } from '~/modules/marketing/contracts/marketing'
import type { IAiAnswer, IAiAsk, IAiCapability } from '~/shared/components/aiChat/AiChat.d'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const CLARIFICATION_CHARS = 300

export const useMarketingAssistant = () => {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const repository = useMarketingRepository()

  let pending = ''

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

  function missed(report: IIntakeReport): IAiAnswer {
    return {
      text: [report.country ? t('cms.marketing.intake.noTours') : t('cms.marketing.assistant.noCountry'), ...skipped(report)].join('\n'),
      suggestions: report.country ? [] : [t('cms.marketing.assistant.tryShot')],
    }
  }

  async function send(ask: IAiAsk): Promise<IAiAnswer> {
    const text = pending && !ask.image && ask.text.length < CLARIFICATION_CHARS ? `${pending}\n\n${ask.text}` : ask.text
    const answer = await repository.assistant(text, ask.image, ask.history)

    if (answer.kind === 'reply') {
      pending = ''

      return { text: answer.reply || t('cms.marketing.assistant.emptyText'), suggestions: answer.suggestions }
    }

    pending = answer.selection ? '' : text

    return answer.selection ? built(answer.selection, answer.report) : missed(answer.report)
  }

  const capabilities = computed<IAiCapability[]>(() => [
    { key: 'own', icon: 'sparkle', title: t('cms.marketing.assistant.can.own.title'), text: t('cms.marketing.assistant.can.own.text'), prompt: t('cms.marketing.assistant.can.own.prompt') },
    { key: 'link', icon: 'link', title: t('cms.marketing.assistant.can.link.title'), text: t('cms.marketing.assistant.can.link.text') },
    { key: 'shot', icon: 'image', title: t('cms.marketing.assistant.can.shot.title'), text: t('cms.marketing.assistant.can.shot.text'), attach: true },
    { key: 'advice', icon: 'megaphone', title: t('cms.marketing.assistant.can.advice.title'), text: t('cms.marketing.assistant.can.advice.text'), prompt: t('cms.marketing.assistant.can.advice.prompt') },
  ])

  const thinking = computed(() => [
    t('cms.marketing.assistant.thinking.read'),
    t('cms.marketing.assistant.thinking.search'),
    t('cms.marketing.assistant.thinking.build'),
  ])

  return { send, capabilities, thinking }
}
