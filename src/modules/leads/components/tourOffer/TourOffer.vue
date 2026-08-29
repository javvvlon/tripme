<template>
    <section class="tm-tour-offer">
        <p v-if="heading" class="tm-tour-offer__eyebrow">{{ heading }}</p>

        <div class="tm-tour-offer__body">
            <div class="tm-tour-offer__main">
                <h3 class="tm-tour-offer__hotel">{{ trip.hotel_name || '—' }}</h3>

                <ul class="tm-tour-offer__facts">
                    <li v-if="dates">
                        <Icon name="calendar" :size="15" />{{ dates }}
                    </li>
                    <li>
                        <Icon name="users" :size="15" />{{ party }}
                    </li>
                    <li v-if="trip.meal_name">
                        <Icon name="check" :size="15" />{{ trip.meal_name }}
                    </li>
                    <li v-if="trip.room_name">
                        <Icon name="bed" :size="15" />{{ trip.room_name }}
                    </li>
                </ul>

                <p v-if="trip.supplier_name" class="tm-tour-offer__operator">
                    <Icon name="briefcase" :size="14" />{{ trip.supplier_name }}
                </p>
            </div>

            <div class="tm-tour-offer__aside">
                <p v-if="price" class="tm-tour-offer__price">{{ price }}</p>
                <p v-if="price" class="tm-tour-offer__price-note">{{ t('post.tour.priceNote') }}</p>

                <Button v-if="actionable" size="md" icon-right="arrow-right" @click="requesting = true">
                    {{ t('lead.cta') }}
                </Button>
            </div>
        </div>

        <ClientOnly v-if="actionable">
            <LeadModal v-model="requesting" :trip="trip" :summary="summary" />
        </ClientOnly>
    </section>
</template>

<script setup lang="ts">
import LeadModal from '~/modules/leads/components/leadModal/LeadModal.vue'
import type { ITourOfferProps } from './TourOffer.d'

const props = defineProps<ITourOfferProps>()

const { t, locale } = useI18n()

const requesting = ref(false)

const dates = computed(() => {
    if (!props.trip.check_in) return ''

    return formatDateRange(props.trip.check_in, props.trip.nights || 0, locale.value)
})

const party = computed(() => {
    const adults = t('search.adults', props.trip.adults || 0)

    return props.trip.children
        ? `${adults}, ${t('search.kids', props.trip.children)}`
        : adults
})

const price = computed(() => {
    if (!props.trip.price_amount) return ''

    return new Intl.NumberFormat(locale.value, {
        style: 'currency',
        currency: props.trip.price_currency || 'USD',
        maximumFractionDigits: 0,
    }).format(props.trip.price_amount)
})

const summary = computed(() =>
    [props.trip.hotel_name, dates.value, price.value].filter(Boolean).join(' · '))
</script>

<style lang="scss">
@use './_tour-offer.scss';
</style>
