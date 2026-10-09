<template>
    <section class="tm-lead-history">
        <h2 class="tm-lead-history__title">{{ t('cms.ownership.history.title') }}</h2>

        <p v-if="!events?.length" class="tm-lead-history__empty">{{ t('cms.ownership.history.empty') }}</p>

        <ol v-else class="tm-lead-history__list">
            <li v-for="(event, index) in events" :key="index" class="tm-lead-history__item">
                <span class="tm-lead-history__at">{{ when(event.at) }}</span>
                <span class="tm-lead-history__what">{{ describe(event) }}</span>
                <span v-if="event.actor_name" class="tm-lead-history__who">{{ event.actor_name }}</span>
            </li>
        </ol>
    </section>
</template>

<script setup lang="ts">
import { useLeadsRepository } from '~/modules/leads/repositories'
import type { ILeadEvent } from '~/modules/leads/contracts/leads'
import type { ILeadHistoryProps } from './LeadHistory.d'

const props = defineProps<ILeadHistoryProps>()

const { t, locale } = useI18n()
const { history } = useLeadsRepository()

const { data: events } = useAsyncData(
  () => `cms:lead-history:${props.leadId}`,
  () => history(props.leadId),
  { default: () => [] as ILeadEvent[], watch: [() => props.version] },
)

const status = (value: string | null) => (value ? t(`cms.leads.status.${value}`) : '—')

const person = (name: string | null, id: string | null) => name || (id ? '—' : t('cms.ownership.queue'))

function describe(event: ILeadEvent): string {
  switch (event.kind) {
    case 'created':
      return event.to ? t('cms.ownership.history.createdFor', { name: person(event.to_name, event.to) }) : t('cms.ownership.history.created')
    case 'taken':
      return t('cms.ownership.history.taken', { name: person(event.to_name, event.to) })
    case 'assigned':
      return t('cms.ownership.history.assigned', { from: person(event.from_name, event.from), to: person(event.to_name, event.to) })
    case 'archived':
      return t('cms.archive.history.archived')
    case 'restored':
      return t('cms.archive.history.restored')
    case 'order_assigned':
      return t('cms.ownership.history.orderAssigned', { order: event.subject ?? '', to: person(event.to_name, event.to) })
    default:
      return t('cms.ownership.history.status', { from: status(event.from), to: status(event.to) })
  }
}

const when = (iso: string) => new Intl.DateTimeFormat(locale.value, {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(iso))
</script>

<style lang="scss">
@use './_lead-history.scss';
</style>
