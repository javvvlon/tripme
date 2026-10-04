<template>
    <article class="tm-tour-card" :class="{ 'is-stopped': agentView && tour.isStopped() }">
        <div class="tm-tour-card__stub">
            <span class="tm-tour-card__stub-label">
                <Icon name="plane" :size="13" />{{ t('results.departure') }}
            </span>
            <span class="tm-tour-card__stub-day">
                <strong>{{ checkIn.day }}</strong>
                <span class="tm-tour-card__stub-when">
                    <span>{{ checkIn.month }}</span>
                    <span>{{ checkIn.weekday }}</span>
                </span>
            </span>
            <span class="tm-tour-card__stub-stay">
                <span><Icon name="moon" :size="13" />{{ t('search.nights', tour.get('nights')) }}</span>
                <span class="tm-tour-card__stub-back">{{ t('results.returnOn', { date: checkOut }) }}</span>
            </span>
        </div>

        <div class="tm-tour-card__body">
            <div class="tm-tour-card__kicker">
                <Rating v-if="tour.stars()" :value="tour.stars()" :max="tour.stars()" :size="12" />
                <span v-if="tour.location()" class="tm-tour-card__place">
                    <Icon name="pin" :size="13" />{{ tour.location() }}
                </span>
                <ClientOnly>
                    <Badge v-if="agentView" :tone="availabilityTone" class="tm-tour-card__badge">
                        {{ t(`availability.${tour.get('availability')}`) }}
                    </Badge>
                </ClientOnly>
            </div>

            <h3 class="tm-tour-card__name">
                <NuxtLink v-if="hotelPage" :to="localePath(hotelPage)">{{ tour.displayName() }}</NuxtLink>
                <span v-else>{{ tour.displayName() }}</span>
            </h3>

            <ul class="tm-tour-card__facts">
                <li v-if="tour.get('mealName')" class="tm-tour-card__fact tm-tour-card__fact--meal">
                    <Icon name="check" :size="13" :stroke="2.4" />{{ tour.get('mealName') }}
                </li>
                <li v-if="tour.get('roomName')" class="tm-tour-card__fact">
                    <Icon name="bed" :size="14" />{{ tour.get('roomName') }}
                </li>
                <li v-if="tour.get('refundable') === false" class="tm-tour-card__fact tm-tour-card__fact--warn">
                    {{ t('results.nonRefundable') }}
                </li>
            </ul>

            <ClientOnly>
                <p v-if="agentView && stopReason" class="tm-tour-card__alert">
                    <Icon name="close" :size="14" :stroke="2.4" />
                    <span>{{ stopReason }}</span>
                </p>
            </ClientOnly>

            <ClientOnly>
                <dl v-if="agentView" class="tm-tour-card__specs">
                    <div v-if="programme" class="tm-tour-card__spec">
                        <dt>{{ t('results.programme') }}</dt>
                        <dd>{{ programme }}</dd>
                    </div>

                    <div v-if="tour.get('fare')" class="tm-tour-card__spec">
                        <dt>{{ t('results.fare') }}</dt>
                        <dd class="tm-tour-card__code">{{ tour.get('fare') }}</dd>
                    </div>

                    <div class="tm-tour-card__spec">
                        <dt>{{ t('results.operator') }}</dt>
                        <dd>{{ tour.get('supplier').name }}</dd>
                    </div>
                </dl>
            </ClientOnly>
        </div>

        <div class="tm-tour-card__aside">
            <div class="tm-tour-card__pricing">
                <p class="tm-tour-card__price">{{ price }}</p>
                <p v-if="priceUzs" class="tm-tour-card__uzs">{{ priceUzs }}</p>
                <p class="tm-tour-card__price-note">
                    {{ t('results.priceFor', { nights: t('search.nights', tour.get('nights')), guests }) }}
                </p>
                <p v-if="perPerson" class="tm-tour-card__per-person">{{ perPerson }}</p>
                <p v-if="sourcePrice" class="tm-tour-card__source">{{ sourcePrice }}</p>
            </div>

            <div class="tm-tour-card__actions">
                <ClientOnly>
                    <Button
                        v-if="agentView"
                        size="sm"
                        :variant="inQuote ? 'secondary' : 'ghost'"
                        :icon="inQuote ? 'check' : 'plus'"
                        :disabled="!inQuote && quoteFull"
                        :aria-pressed="inQuote"
                        @click="toggleQuote(tour)"
                    >
                        {{ inQuote ? t('quote.added') : t('quote.add') }}
                    </Button>

                    <Button
                        v-if="agentView && tour.canBook()"
                        :href="tour.get('bookingUrl')!"
                        size="sm"
                        target="_blank"
                        rel="noopener noreferrer"
                        icon-right="arrow-right"
                    >
                        {{ t('results.bookAtOperator') }}
                    </Button>

                    <Button
                        v-if="!agentView"
                        size="sm"
                        :variant="sent ? 'secondary' : 'primary'"
                        :icon="sent ? 'check' : undefined"
                        :icon-right="sent ? undefined : 'arrow-right'"
                        :disabled="sending || sent"
                        @click="request"
                    >
                        {{ sent ? t('lead.sentShort') : sending ? t('lead.sending') : t('lead.cta') }}
                    </Button>
                </ClientOnly>

                <a
                    v-if="tour.hasDetails()"
                    :href="tour.get('hotelUrl')!"
                    class="tm-tour-card__details"
                    target="_blank" rel="noopener noreferrer"
                >{{ t('results.aboutHotel') }}</a>
            </div>
        </div>

        <ClientOnly>
            <LeadModal v-if="!agentView" v-model="asking" :trip="trip" :summary="summary" />
        </ClientOnly>
    </article>
</template>

<script setup lang="ts">
import { Availability } from '~/search_engine/models/Tour'
import LeadModal from '~/modules/leads/components/leadModal/LeadModal.vue'
import { tripFromTour } from '~/modules/leads/helpers/trip'
import { useTourRequest } from '~/modules/leads/hooks/use-tour-request'
import { useQuote } from '~/modules/leads/hooks/use-quote'
import { addDays, fromIso } from '~/shared/helpers/dates'
import type { ILeadTrip } from '~/modules/leads/contracts/leads'
import type { BadgeTone } from '../badge/Badge.d'
import type { ITourCardProps } from './TourCard.d'

const props = defineProps<ITourCardProps>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const routeExists = useRouteExists()

const hotelPage = computed(() => {
  const path = `/hotels/${props.tour.get('hotelSupplierCode')}`

  return routeExists(path) ? path : null
})

const price = computed(() => formatMoney(props.tour.get('comparablePrice'), locale.value))

const { has: quoted, toggle: toggleQuote, full: quoteFull } = useQuote()

const inQuote = computed(() => quoted(props.tour))

const programme = computed(() =>
  (props.tour.get('programme') ?? '').replace(/<[^>]*>?/g, ' ').replace(/\s+/g, ' ').trim())

const { approxUzs } = useUzsRates()

const priceUzs = computed(() => approxUzs(props.tour.get('comparablePrice')))

const sourcePrice = computed(() => {
  const source = props.tour.get('price')

  return source.currency === props.tour.get('comparablePrice').currency
    ? ''
    : t('results.sourcePrice', { price: formatMoney(source, locale.value) })
})

const travellers = computed(() => props.tour.get('adults') + props.tour.get('children'))

const perPerson = computed(() => {
  if (travellers.value < 2) return ''

  const { amount, currency } = props.tour.get('comparablePrice')

  return t('results.perPerson', {
    price: formatMoney({ amount: amount / travellers.value, currency }, locale.value),
  })
})

const guests = computed(() => {
  const parts = [t('search.adults', props.tour.get('adults'))]

  if (props.tour.get('children')) parts.push(t('search.kids', props.tour.get('children')))

  return parts.join(', ')
})

const checkIn = computed(() => {
  const at = fromIso(props.tour.get('checkIn'))
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale.value, options).format(at)

  return {
    day: part({ day: 'numeric' }),
    month: part({ month: 'short' }).replace('.', ''),
    weekday: part({ weekday: 'short' }),
  }
})

const checkOut = computed(() =>
  formatDayRange(addDays(props.tour.get('checkIn'), props.tour.get('nights')), '', locale.value))

const dates = computed(() =>
  formatDateRange(props.tour.get('checkIn'), props.tour.get('nights'), locale.value))

const summary = computed(() =>
  [props.tour.displayName(), dates.value, price.value].filter(Boolean).join(' · '))

const trip = computed<ILeadTrip>(() =>
  tripFromTour(props.tour, { from: props.route?.from ?? '', to: props.route?.to ?? '' }))

const { asking, sending, sent, request } = useTourRequest(() => trip.value)

const stopReason = computed(() =>
  props.tour.isStopped() ? props.tour.get('availabilityNote') : null)

const availabilityTone = computed<BadgeTone>(() => {
  switch (props.tour.get('availability')) {
    case Availability.Available: return 'deal'
    case Availability.OnRequest: return 'glass'
    default: return 'hot'
  }
})
</script>

<style lang="scss">
@use './_tour-card.scss';
</style>
