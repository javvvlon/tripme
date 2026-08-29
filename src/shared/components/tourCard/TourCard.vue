<template>
    <article class="tm-tour-card" :class="{ 'is-stopped': tour.isStopped() }">
        <div class="tm-tour-card__media">
            <Photo :photo="photo" ratio="1 / 1" :eager="eager" sizes="(max-width: 1080px) 200px, 240px" />
            <ClientOnly>
                <Badge v-if="agentView" :tone="availabilityTone" class="tm-tour-card__badge">
                    {{ t(`availability.${tour.get('availability')}`) }}
                </Badge>
            </ClientOnly>
        </div>

        <div class="tm-tour-card__body">
            <div class="tm-tour-card__head">
                <h3 class="tm-tour-card__name">
                    <NuxtLink :to="localePath(`/hotels/${tour.get('hotelSupplierCode')}`)">
                        {{ tour.get('hotelName') }}
                    </NuxtLink>
                </h3>
                <Rating v-if="tour.stars()" :value="tour.stars()" />
            </div>

            <p v-if="tour.get('mealName')" class="tm-tour-card__meal">{{ tour.get('mealName') }}</p>

            <div class="tm-tour-card__meta">
                <span v-if="tour.location()" class="tm-tour-card__meta-item">
                    <Icon name="pin" :size="14" />{{ tour.location() }}
                </span>
                <span class="tm-tour-card__meta-item">
                    <Icon name="calendar" :size="14" />{{ dates }}
                </span>
                <span v-if="tour.get('roomName')" class="tm-tour-card__meta-item">
                    <Icon name="bed" :size="14" />{{ tour.get('roomName') }}
                </span>
            </div>

            <ClientOnly>
                <p v-if="agentView && stopReason" class="tm-tour-card__alert">
                    <Icon name="close" :size="14" :stroke="2.4" />
                    <span>{{ stopReason }}</span>
                </p>
            </ClientOnly>

            <ClientOnly>
                <dl v-if="agentView" class="tm-tour-card__specs">
                    <div v-if="tour.get('programme')" class="tm-tour-card__spec">
                        <dt>{{ t('results.programme') }}</dt>
                        <dd>{{ tour.get('programme') }}</dd>
                    </div>

                    <div v-if="tour.get('fare')" class="tm-tour-card__spec">
                        <dt>{{ t('results.fare') }}</dt>
                        <dd class="tm-tour-card__code">{{ tour.get('fare') }}</dd>
                    </div>
                </dl>
            </ClientOnly>

            <p v-if="tour.get('refundable') === false" class="tm-tour-card__nonref">
                {{ t('results.nonRefundable') }}
            </p>
        </div>

        <div class="tm-tour-card__aside">
            <div>
                <p class="tm-tour-card__price">{{ price }}</p>
                <p class="tm-tour-card__price-note">
                    {{ t('results.priceFor', {
                        nights: t('search.nights', tour.get('nights')),
                        rooms: tour.get('adults'),
                    }) }}
                </p>

                <ClientOnly>
                    <p v-if="agentView" class="tm-tour-card__supplier">
                        <Icon name="briefcase" :size="13" />
                        {{ tour.get('supplier').name }}
                    </p>
                </ClientOnly>

            </div>
            <div class="tm-tour-card__actions">
                <ClientOnly>
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
                </ClientOnly>

                <ClientOnly>
                    <Button
                        v-if="!agentView"
                        size="sm"
                        icon-right="arrow-right"
                        @click="requesting = true"
                    >
                        {{ t('lead.cta') }}
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
            <LeadModal v-if="!agentView" v-model="requesting" :trip="trip" :summary="summary" />
        </ClientOnly>
    </article>
</template>

<script setup lang="ts">
import { Availability } from '~/search_engine/models/Tour'
import LeadModal from '~/modules/leads/components/leadModal/LeadModal.vue'
import type { ILeadTrip } from '~/modules/leads/contracts/leads'
import type { BadgeTone } from '../badge/Badge.d'
import type { ITourCardProps } from './TourCard.d'

const props = defineProps<ITourCardProps>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const requesting = ref(false)

const price = computed(() => formatMoney(props.tour.get('price'), locale.value))

const summary = computed(() =>
  [props.tour.get('hotelName'), dates.value, price.value].filter(Boolean).join(' · '))

const trip = computed<ILeadTrip>(() => ({
  hotel_name: props.tour.get('hotelName'),
  hotel_stars: props.tour.get('hotelStars'),
  hotel_code: props.tour.get('hotelSupplierCode'),
  hotel_url: props.tour.get('hotelUrl'),
  supplier_id: props.tour.get('supplier').id,
  supplier_name: props.tour.get('supplier').name,
  offer_id: props.tour.get('id'),
  check_in: props.tour.get('checkIn'),
  nights: props.tour.get('nights'),
  adults: props.tour.get('adults'),
  children: props.tour.get('children'),
  meal_code: props.tour.get('mealCode'),
  meal_name: props.tour.get('mealName'),
  room_name: props.tour.get('roomName'),
  district: props.tour.get('district'),
  availability: props.tour.get('availability'),
  refundable: props.tour.get('refundable'),
  programme: props.tour.get('programme'),
  fare: props.tour.get('fare'),
  price_amount: props.tour.get('price').amount,
  price_currency: props.tour.get('price').currency,
  route_from: props.route?.from ?? '',
  route_to: props.route?.to ?? '',
}))


const photo = computed(() => ({ src: null, alt: props.tour.get('hotelName') }))

const dates = computed(() =>
  formatDateRange(props.tour.get('checkIn'), props.tour.get('nights'), locale.value),
)

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
