<template>
    <section class="tm-lead-history">
        <h2 class="tm-lead-history__title">{{ t('cms.ownership.history.title') }}</h2>

        <p v-if="!events?.length" class="tm-lead-history__empty">{{ t('cms.ownership.history.empty') }}</p>

        <ol v-else class="tm-lead-history__list">
            <li
                v-for="(event, index) in events" :key="index"
                class="tm-lead-history__item" :class="{ 'is-trip': event.kind === 'trip_started' }"
            >
                <span class="tm-lead-history__at">{{ when(event.at) }}</span>
                <span class="tm-lead-history__what">
                    <template v-if="linked(event)">
                        {{ linked(event)!.before }}<NuxtLink :to="localePath(`/app/leads/${linked(event)!.id}`)" class="tm-lead-history__link">{{ event.subject }}</NuxtLink>
                    </template>
                    <template v-else>{{ describe(event) }}</template>
                    <small v-if="event.kind === 'trip_started' && previousOf(event)" class="tm-lead-history__previous">{{ previousOf(event) }}</small>
                </span>
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
const localePath = useLocalePath()
const { history } = useLeadsRepository()

const { data: events } = useAsyncData(
  () => `cms:lead-history:${props.leadId}`,
  () => history(props.leadId),
  { default: () => [] as ILeadEvent[], watch: [() => props.version] },
)

const status = (value: string | null) => (value ? t(`cms.leads.status.${value}`) : '—')

const person = (name: string | null, id: string | null) => name || (id ? '—' : t('cms.ownership.queue'))

function linked(event: ILeadEvent): { before: string, id: string } | null {
  if (!event.subject) return null
  if (event.kind === 'next_request' && event.to) return { before: t('cms.leads.next.historyNext'), id: event.to }
  if (event.kind === 'created' && event.from) return { before: t('cms.leads.next.historyFrom'), id: event.from }

  return null
}

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
    case 'trip_started':
      return t('cms.leads.trip.historyStarted', { n: event.to ?? '' })
    case 'order_assigned':
      return t('cms.ownership.history.orderAssigned', { order: event.subject ?? '', to: person(event.to_name, event.to) })
    default:
      return t('cms.ownership.history.status', { from: status(event.from), to: status(event.to) })
  }
}

interface IPreviousTrip {
  hotel?: string
  destination?: string
  check_in?: string | null
  nights?: number
  price_amount?: number | null
  price_currency?: string
  orders?: Array<{ ref: string, status: string }>
}

function previousOf(event: ILeadEvent): string {
  let trip: IPreviousTrip

  try {
    trip = JSON.parse(event.subject ?? '') as IPreviousTrip
  }
  catch {
    return ''
  }

  const day = trip.check_in ? new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(trip.check_in)) : ''
  const price = trip.price_amount ? new Intl.NumberFormat(locale.value, { style: 'currency', currency: trip.price_currency || 'USD', maximumFractionDigits: 0 }).format(trip.price_amount) : ''
  const orders = (trip.orders ?? []).map(order => `${order.ref} · ${t(`cms.orders.status.${order.status}`)}`).join(', ')
  const parts = [trip.hotel || trip.destination || '', day, trip.nights ? t('search.nights', { n: trip.nights }, trip.nights) : '', price, orders].filter(Boolean)

  return parts.length ? t('cms.leads.trip.historyPrevious', { trip: parts.join(' · ') }) : ''
}

const when = (iso: string) => new Intl.DateTimeFormat(locale.value, {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(iso))
</script>

<style lang="scss">
@use './_lead-history.scss';
</style>
