<template>
    <section v-if="offer" class="tm-esim-offer" :class="{ 'is-staff': staff }">
        <span class="tm-esim-offer__icon" aria-hidden="true"><Icon name="sim" :size="20" /></span>

        <div class="tm-esim-offer__text">
            <strong class="tm-esim-offer__title">{{ t('esim.tripOffer.title') }}</strong>
            <span class="tm-esim-offer__lead">{{ t('esim.tripOffer.text', { country: offer.name, price: offer.price }) }}</span>
            <span class="tm-esim-offer__promo">{{ t('esim.tripOffer.promo', { discount: offer.discount, code: offer.code }) }}</span>
        </div>

        <div class="tm-esim-offer__actions">
            <Button v-if="staff" type="button" size="sm" variant="tinted" :icon="copied ? 'check' : 'copy'" @click="copyMessage">
                {{ copied ? t('esim.affiliate.copied') : t('esim.tripOffer.copy') }}
            </Button>

            <Button size="sm" :variant="staff ? 'ghost' : 'primary'" :to="offer.link" :target="staff ? '_blank' : undefined">
                {{ t('esim.tripOffer.cta') }}
            </Button>
        </div>
    </section>
</template>

<script setup lang="ts">
import Button from '~/shared/components/button/Button.vue'
import { useEsimCountries } from '~/modules/esim/hooks/use-esim-countries'
import { useEsimMode } from '~/modules/esim/hooks/use-esim-mode'
import { countryName, esimCountryOf, usdOf } from '~/modules/esim/helpers/esim'
import type { IEsimOfferProps } from './EsimOffer.d'

const props = defineProps<IEsimOfferProps>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { data: countries } = useEsimCountries()
const { affiliate } = useEsimMode()

const copied = ref(false)

const offer = computed(() => {
    if (!affiliate.value) return null

    const code = esimCountryOf(props.country, countries.value.map(entry => entry.code))
    const entry = countries.value.find(item => item.code === code)

    if (!code || !entry) return null

    return {
        code: affiliate.value.code,
        discount: affiliate.value.discount_percent,
        name: countryName(code, locale.value),
        price: usdOf(entry.from_usd, locale.value),
        link: localePath(`/esim/${code.toLowerCase()}`),
    }
})

async function copyMessage() {
    if (!offer.value) return

    const url = `${window.location.origin}${offer.value.link}`

    try {
        await navigator.clipboard.writeText(t('esim.tripOffer.message', { country: offer.value.name, url, code: offer.value.code, discount: offer.value.discount }))
        copied.value = true
        setTimeout(() => { copied.value = false }, 2400)
    }
    catch {
        copied.value = false
    }
}
</script>

<style lang="scss">
@use './_esim-offer.scss';
</style>
