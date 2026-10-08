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
                    <h1 class="tm-cms-order__number">{{ order.ref }}</h1>
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

            <section v-if="order.status === 'cancelled'" class="tm-cms-order__cancelled">
                <strong>{{ t('cms.orders.cancel.done') }}</strong>
                <span v-if="order.cancel_reason">{{ order.cancel_reason }}</span>
            </section>

            <section v-else-if="cancelling" class="tm-cms-order__cancel">
                <label :for="cancelId" class="tm-cms-order__cancel-label">{{ t('cms.orders.cancel.reason') }}</label>
                <textarea
                    :id="cancelId" v-model="cancelReason"
                    class="tm-cms-order__cancel-input" rows="2" maxlength="500"
                    :placeholder="t('cms.orders.cancel.placeholder')"
                />
                <div class="tm-cms-order__cancel-actions">
                    <Button size="sm" variant="danger" :disabled="saving || !cancelReason.trim()" @click="confirmCancel">
                        {{ t('cms.orders.cancel.confirm') }}
                    </Button>
                    <Button size="sm" variant="ghost" :disabled="saving" @click="cancelling = false">
                        {{ t('cms.orders.cancel.keep') }}
                    </Button>
                </div>
            </section>

            <section v-if="links.search || links.booking || links.hotel" class="tm-cms-order__card">
                <h2 class="tm-cms-order__card-title">{{ t('cms.leads.sections.offer') }}</h2>

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
            </section>

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
                        <Combobox
                            v-if="elevated"
                            :model-value="order.manager_id ?? ''"
                            variant="field"
                            :label="t('cms.ownership.column')"
                            :options="assignOptions"
                            :placeholder="t('cms.ownership.assignPlaceholder')"
                            :disabled="saving"
                            @update:model-value="assignManager"
                        />
                        <div v-else class="tm-cms-order__owner">
                            <span class="tm-cms-order__label">{{ t('cms.ownership.column') }}</span>
                            <strong>{{ order.manager_id === me ? t('cms.ownership.you') : order.manager_name || '—' }}</strong>
                        </div>
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
                <h2 class="tm-cms-order__card-title">{{ t('cms.orders.documents.title') }}</h2>

                <div class="tm-cms-order__doc-actions">
                    <Button
                        size="sm" variant="secondary" icon="doc"
                        :disabled="Boolean(working)"
                        @click="quoteOpen = true"
                    >
                        {{ t('cms.orders.documents.offer') }}
                    </Button>

                    <Button
                        size="sm" variant="ghost" icon="doc"
                        :disabled="Boolean(working)"
                        @click="generate('invoice')"
                    >
                        {{ working === 'invoice' ? t('cms.orders.documents.making') : t('cms.orders.documents.invoice') }}
                    </Button>

                    <Button
                        size="sm" variant="ghost" icon="upload"
                        :disabled="Boolean(working)"
                        @click="file?.click()"
                    >
                        {{ working === 'attachment' ? t('cms.orders.documents.attaching') : t('cms.orders.documents.attach') }}
                    </Button>

                    <input
                        ref="file"
                        type="file" class="tm-cms-order__doc-input"
                        :accept="ACCEPTED_DOCUMENTS"
                        @change="onFile"
                    >
                </div>

                <p v-if="documentsLoading" class="tm-cms-order__doc-state">{{ t('cms.loading') }}</p>

                <p v-else-if="!documents.length" class="tm-cms-order__doc-state">
                    {{ t('cms.orders.documents.empty') }}
                </p>

                <ul v-else class="tm-cms-order__docs">
                    <li v-for="document in documents" :key="document.id" class="tm-cms-order__doc">
                        <span class="tm-cms-order__doc-kind" :class="`is-${document.kind}`">
                            {{ t(`cms.orders.documents.kinds.${document.kind}`) }}
                        </span>

                        <a
                            class="tm-cms-order__doc-name"
                            :href="document.url" target="_blank" rel="noopener"
                        >{{ document.name }}</a>

                        <span class="tm-cms-order__doc-meta">
                            {{ weight(document.size) }} · {{ fullDate(document.created_at) }}
                        </span>

                        <button
                            type="button" class="tm-cms-order__doc-drop"
                            :aria-label="t('cms.orders.documents.remove')"
                            :title="t('cms.orders.documents.remove')"
                            @click="dropDocument(document)"
                        >
                            <Icon name="trash" :size="15" />
                        </button>
                    </li>
                </ul>
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
                        <span v-if="event.actor_name" class="tm-cms-order__event-who">{{ event.actor_name }}</span>
                    </li>
                </ol>
            </section>
        </template>

        <ClientOnly>
            <QuoteModal
                v-if="order"
                v-model="quoteOpen"
                :tours="quoteTours"
                :lead-id="order.lead_id"
                :passport="order.passport_expires_at"
                :destination="quoteDestination"
                :departure="quoteDeparture"
                pdf
                :pdf-busy="working === 'offer'"
                @pdf="generate('offer')"
            />
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { passportProblem } from '~/modules/leads/helpers/compliance'
import { tourFromOrder } from '~/modules/leads/helpers/quote'
import QuoteModal from '~/modules/leads/components/quoteModal/QuoteModal.vue'
import { PASSPORT_MARGIN_MONTHS } from '~/modules/leads/contracts/leads'
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import { useOrder } from './Order.hooks'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import Button from '~/shared/components/button/Button.vue'
import { formatDate } from '~/shared/helpers/format-date'
import Icon from '~/shared/components/icon/Icon.vue'
import PriceInput from '~/shared/components/priceInput/PriceInput.vue'
import CurrencySelect from '~/shared/components/currencySelect/CurrencySelect.vue'
import { offerLinks } from '~/modules/leads/helpers/offer'
import type { OrderStatus } from '~/modules/leads/contracts/leads'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const noteId = useId()

const {
    order, draft, status, error, saving, saved, history,
    statusOptions, change, submit, remove, assignManager,
    documents, documentsLoading, working, generate, attach, dropDocument,
    cancelling, cancelReason, confirmCancel,
} = useOrder()

const { elevated, me, assignOptions } = useManagers('orders')

const cancelId = useId()

const { label } = useCatalogLabel()

const quoteOpen = ref(false)

const quoteTours = computed(() => (order.value ? [tourFromOrder(order.value)] : []))

const quoteDestination = computed(() =>
    label(String(order.value?.trip?.route_to ?? '')) || order.value?.country || '')

const quoteDeparture = computed(() => label(String(order.value?.trip?.route_from ?? ''), 'city'))

const links = computed(() => offerLinks(order.value?.trip as never))

const file = useTemplateRef<HTMLInputElement>('file')

const ACCEPTED_DOCUMENTS = [
    'application/pdf',
    'image/png', 'image/jpeg', 'image/webp',
    '.doc', '.docx', '.xls', '.xlsx',
].join(',')

const weight = (bytes: number): string =>
    bytes >= 1024 * 1024
        ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1024))} KB`

function onFile(event: Event) {
    const input = event.target as HTMLInputElement

    void attach(input.files?.[0])

    input.value = ''
}

const backTo = computed(() =>
    localePath(order.value?.lead_id ? `/app/leads/${order.value.lead_id}` : '/app/orders'))

const fullDate = (value: string | null | undefined): string =>
    formatDate(value, locale.value, { dateStyle: 'medium', timeStyle: 'short' })

const passportWarning = computed(() => {
    const problem = passportProblem({
        return_date: draft.returnDate || null,
        check_in: draft.checkIn || null,
        nights: Number(draft.nights) || 0,
        passport_expires_at: draft.passportExpiresAt || null,
    })

    if (!problem) return ''

    return t(problem === 'expired' ? 'cms.orders.passportExpired' : 'cms.orders.passportShort', {
        n: PASSPORT_MARGIN_MONTHS,
    })
})

useSeoMeta({ title: () => t('cms.orders.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_order.scss';
</style>
