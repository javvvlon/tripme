<template>
    <div class="tm-cms-order">
        <NuxtLink :to="backTo" class="tm-cms-order__back">
            <Icon name="chevron-left" :size="16" />{{ t('cms.orders.back') }}
        </NuxtLink>

        <EditorSkeleton v-if="status === 'pending'" variant="form" />

        <p v-else-if="!order" class="tm-cms-order__empty">{{ t('cms.orders.missing') }}</p>

        <template v-else>
            <header class="tm-cms-order__head">
                <div>
                    <h1 class="tm-cms-order__number">#{{ order.order_no }}</h1>
                    <p class="tm-cms-order__sub">
                        {{ t('cms.orders.createdOn', { date: fullDate(order.created_at) }) }}
                    </p>
                </div>

                <div class="tm-cms-order__head-actions">
                    <SelectMenu
                        :model-value="order.status"
                        :options="statusOptions"
                        :tone="order.status"
                        :disabled="saving"
                        align="right"
                        @update:model-value="change($event as OrderStatus)"
                    />

                    <Button type="button" variant="danger-quiet" @click="remove">{{ t('cms.orders.delete') }}</Button>
                </div>
            </header>

            <p v-if="saved" class="tm-cms-order__saved" role="status">{{ t('cms.saved') }}</p>

            <form class="tm-cms-order__form" novalidate @submit.prevent="submit">
                <section class="tm-cms-order__card">
                    <h2 class="tm-cms-order__card-title">{{ t('cms.orders.sections.traveller') }}</h2>

                    <div class="tm-cms-order__row">
                        <Input v-model="draft.travellerName" :label="t('cms.orders.fields.traveller')" />
                        <Input v-model="draft.passportId" :label="t('cms.orders.fields.passport')" placeholder="AA1234567" />
                        <Input v-model="draft.passportExpiresAt" type="date" :label="t('cms.orders.fields.passportExpires')" />
                    </div>

                    <p v-if="passportWarning" class="tm-cms-order__warning">{{ passportWarning }}</p>
                </section>

                <section class="tm-cms-order__card">
                    <h2 class="tm-cms-order__card-title">{{ t('cms.orders.sections.trip') }}</h2>

                    <div class="tm-cms-order__row">
                        <Input v-model="draft.country" :label="t('cms.orders.fields.country')" />
                        <Input v-model="draft.hotelName" :label="t('cms.orders.fields.hotel')" />
                        <Input v-model="draft.supplierName" :label="t('cms.orders.fields.operator')" />
                    </div>

                    <div class="tm-cms-order__row is-four">
                        <Input v-model="draft.checkIn" type="date" :label="t('cms.orders.fields.departure')" />
                        <Input v-model="draft.returnDate" type="date" :label="t('cms.orders.fields.return')" />
                        <Input v-model="draft.nights" type="number" :label="t('cms.orders.fields.nights')" />
                        <Input v-model="draft.adults" type="number" :label="t('cms.orders.fields.adults')" />
                    </div>

                    <div class="tm-cms-order__row is-four">
                        <Input v-model="draft.children" type="number" :label="t('cms.orders.fields.children')" />
                        <PriceInput
                            v-model="draft.priceAmount"
                            :label="t('cms.orders.fields.price')"
                            :currency="draft.priceCurrency"
                        />
                        <CurrencySelect v-model="draft.priceCurrency" :label="t('cms.orders.fields.currency')" />
                        <Input v-model="draft.dealDate" type="date" :label="t('cms.orders.fields.dealDate')" />
                    </div>
                </section>

                <section class="tm-cms-order__card">
                    <h2 class="tm-cms-order__card-title">{{ t('cms.orders.sections.booking') }}</h2>

                    <div class="tm-cms-order__row">
                        <Input
                            v-model="draft.supplierOrderId"
                            :label="t('cms.orders.fields.supplierOrder')"
                            :hint="t('cms.orders.fields.supplierOrderHint')"
                        />
                        <Input v-model="draft.branch" :label="t('cms.orders.fields.branch')" />
                        <div />
                    </div>

                    <div class="tm-cms-order__field">
                        <label :for="noteId" class="tm-cms-order__label">{{ t('cms.orders.fields.note') }}</label>
                        <textarea :id="noteId" v-model="draft.note" class="tm-cms-order__textarea" rows="3" />
                    </div>
                </section>

                <footer class="tm-cms-order__foot">
                    <Button type="submit" size="lg" :disabled="saving">
                        {{ saving ? t('cms.saving') : t('cms.save') }}
                    </Button>
                </footer>
            </form>

            <section class="tm-cms-order__card">
                <h2 class="tm-cms-order__card-title">{{ t('cms.leads.sections.offer') }}</h2>

                <p class="tm-cms-order__offer-lead">{{ t('cms.leads.offer.lead') }}</p>

                <div class="tm-cms-order__offer-links">
                    <Button
                        v-if="links.search"
                        size="sm" variant="secondary" icon="search"
                        :to="links.search"
                    >
                        {{ t('cms.leads.offer.repeatSearch') }}
                    </Button>

                    <Button
                        v-if="links.booking"
                        size="sm" variant="ghost" icon="arrow-right"
                        :href="links.booking" target="_blank" rel="noopener"
                    >
                        {{ t('cms.leads.openAtOperator') }}
                    </Button>

                    <Button
                        v-if="links.hotel"
                        size="sm" variant="ghost" icon="bed"
                        :href="links.hotel" target="_blank" rel="noopener"
                    >
                        {{ t('cms.leads.openHotelPage') }}
                    </Button>
                </div>

                <p v-if="!links.booking" class="tm-cms-order__offer-note">{{ t('cms.leads.noBookingUrl') }}</p>
            </section>

            <section v-if="history.length" class="tm-cms-order__card tm-cms-order__history">
                <h2 class="tm-cms-order__card-title">{{ t('cms.orders.sections.history') }}</h2>

                <ol class="tm-cms-order__events">
                    <li v-for="(event, i) in history" :key="i">
                        <span class="tm-cms-order__event-when">{{ fullDate(event.at) }}</span>
                        <span class="tm-cms-order__event-move">
                            <template v-if="event.from">{{ t(`cms.orders.status.${event.from}`) }} →</template>
                            {{ t(`cms.orders.status.${event.to}`) }}
                        </span>
                    </li>
                </ol>
            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import { useOrder } from './Order.hooks'
import Button from '~/shared/components/button/Button.vue'
import PriceInput from '~/shared/components/priceInput/PriceInput.vue'
import CurrencySelect from '~/shared/components/currencySelect/CurrencySelect.vue'
import { offerLinks } from '~/modules/leads/helpers/offer'
import type { OrderStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const noteId = useId()

const {
    order, draft, status, error, saving, saved, history,
    statusOptions, change, submit, remove,
} = useOrder()

const links = computed(() => offerLinks(order.value?.trip as never))

const backTo = computed(() =>
    localePath(order.value?.lead_id ? `/app/leads/${order.value.lead_id}` : '/app/orders'))

const fullDate = (value: string): string =>
    new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

/**
 * A passport that expires within six months of departure is refused by most
 * consulates, so it is worth saying before the ticket is issued.
 */
const passportWarning = computed(() => {
    if (!draft.passportExpiresAt || !draft.checkIn) return ''

    const expires = new Date(draft.passportExpiresAt)
    const departure = new Date(draft.checkIn)
    const months = (expires.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24 * 30)

    if (months < 0) return t('cms.orders.passportExpired')

    return months < 6 ? t('cms.orders.passportShort') : ''
})

useSeoMeta({ title: () => t('cms.orders.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_order.scss';
</style>
