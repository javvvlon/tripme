<template>
    <div class="tm-ad-line">
        <label class="tm-ad-line__tier">
            <input v-model="form.tier" type="checkbox">
            {{ t('cms.marketing.own.tier') }}
        </label>

        <div class="tm-ad-line__grid">
            <SelectMenu v-if="form.tier" v-model="form.stars" :options="starOptions" :label="t('cms.marketing.own.stars')" />
            <Input v-else v-model="form.name" :label="t('cms.marketing.own.name')" dense />
            <Input v-if="!form.tier" v-model="form.stars" type="number" :label="t('cms.marketing.own.stars')" dense />
            <SelectMenu v-model="form.meal" :options="mealOptions" :label="t('cms.marketing.own.meal')" />
            <Input v-model="form.district" :label="t('cms.marketing.own.district')" dense />
            <Input v-model="form.date" type="date" :label="t('cms.marketing.own.date')" dense />
            <Input v-model="form.nights" type="number" :label="t('cms.marketing.own.nights')" dense />
            <Input v-model="form.price" type="number" :label="t('cms.marketing.own.price')" dense />
            <SelectMenu v-model="form.currency" :options="currencyOptions" :label="t('cms.marketing.own.currency')" />
        </div>

        <p v-if="error" class="tm-ad-line__error" role="alert">{{ error }}</p>

        <div class="tm-ad-line__actions">
            <Button type="submit" size="sm" :loading="busy">{{ t('cms.marketing.own.save') }}</Button>
            <Button type="button" size="sm" variant="ghost" :disabled="busy" @click="emit('cancel')">{{ t('cms.marketing.own.cancel') }}</Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'

defineProps<{
    form: { name: string, tier: boolean, stars: string, meal: string, district: string, date: string, nights: string, price: string, currency: string }
    error: string
    busy: boolean
}>()

const emit = defineEmits<{ cancel: [] }>()

const { t } = useI18n()

const starOptions = [1, 2, 3, 4, 5].map(stars => ({ value: String(stars), label: `${stars}*` }))

const mealOptions = computed(() => [
    { value: '', label: t('cms.marketing.own.anyMeal') },
    ...['RO', 'BB', 'HB', 'FB', 'AI', 'UAI'].map(value => ({ value, label: value })),
])

const currencyOptions = ['USD', 'EUR', 'UZS'].map(value => ({ value, label: value }))
</script>

<style lang="scss">
@use './_line-fields.scss';
</style>
