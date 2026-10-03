<template>
    <div ref="root" class="tm-travellers" :class="`tm-travellers--${variant}`">
        <button
            :id="id" type="button" class="tm-travellers__control"
            :aria-expanded="open" :aria-haspopup="true" :aria-controls="`${id}-panel`"
            @click="open = !open"
        >
            <span class="tm-travellers__label">{{ label }}</span>
            <span class="tm-travellers__value">
                <span class="tm-travellers__summary">{{ summary }}</span>
                <Icon name="chevron" :size="16" class="tm-travellers__caret" />
            </span>
        </button>

        <div v-if="open" :id="`${id}-panel`" class="tm-travellers__panel">
            <div class="tm-travellers__row">
                <span class="tm-travellers__icon" aria-hidden="true"><Icon name="user" :size="18" /></span>

                <span class="tm-travellers__who">
                    <strong>{{ t('search.travellers.adults') }}</strong>
                    <span>{{ t('search.travellers.adultsHint') }}</span>
                </span>

                <Stepper
                    :model-value="model.adults"
                    :min="1" :max="maxAdults"
                    :aria-label="t('search.travellers.adults')"
                    @update:model-value="setAdults"
                />
            </div>

            <div class="tm-travellers__row">
                <span class="tm-travellers__icon" aria-hidden="true"><Icon name="kids" :size="18" /></span>

                <span class="tm-travellers__who">
                    <strong>{{ t('search.travellers.kids') }}</strong>
                    <span>{{ t('search.travellers.kidsHint', { max: KID_MAX_AGE }) }}</span>
                </span>

                <Stepper
                    :model-value="model.kidAges.length"
                    :min="0" :max="maxKids"
                    :aria-label="t('search.travellers.kids')"
                    @update:model-value="setKids"
                />
            </div>

            <div v-if="model.kidAges.length" class="tm-travellers__ages">
                <p class="tm-travellers__ages-lead">{{ t('search.travellers.agesLead') }}</p>

                <div class="tm-travellers__ages-grid">
                    <label v-for="(age, i) in model.kidAges" :key="i" class="tm-travellers__age">
                        <span>{{ t('search.travellers.child', { n: i + 1 }) }}</span>
                        <select :value="age" @change="setAge(i, $event)">
                            <option v-for="value in AGES" :key="value" :value="value">
                                {{ value === 0 ? t('search.travellers.infant') : t('search.travellers.years', { n: value }) }}
                            </option>
                        </select>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Icon from '~/shared/components/icon/Icon.vue'
import Stepper from '~/shared/components/stepper/Stepper.vue'
import { DEFAULT_KID_AGE } from '~/shared/composables/useSearchCriteria'
import type { ITravellers, ITravellersPickerProps } from './TravellersPicker.d'

const props = withDefaults(defineProps<ITravellersPickerProps>(), {
  maxAdults: 6,
  maxKids: 4,
  variant: 'panel',
})

const model = defineModel<ITravellers>({ required: true })

const { t } = useI18n()
const id = useId()

const KID_MAX_AGE = 12
const AGES = Array.from({ length: KID_MAX_AGE + 1 }, (_, age) => age)

const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')

const summary = computed(() => {
    const parts = [t('search.adults', model.value.adults)]

    if (model.value.kidAges.length) parts.push(t('search.kids', model.value.kidAges.length))

    return parts.join(', ')
})

const setAdults = (value: number) => {
    model.value = { ...model.value, adults: value }
}

const setKids = (count: number) => {
    const ages = model.value.kidAges.slice(0, count)

    while (ages.length < count) ages.push(DEFAULT_KID_AGE)

    model.value = { ...model.value, kidAges: ages }
}

const setAge = (index: number, event: Event) => {
    const ages = [...model.value.kidAges]

    ages[index] = Number((event.target as HTMLSelectElement).value)

    model.value = { ...model.value, kidAges: ages }
}

const onAway = (event: MouseEvent) => {
    if (!root.value?.contains(event.target as Node)) open.value = false
}

const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') open.value = false
}

watch(open, (next) => {
    if (next) {
        window.addEventListener('mousedown', onAway)
        window.addEventListener('keydown', onKey)
    }
    else {
        window.removeEventListener('mousedown', onAway)
        window.removeEventListener('keydown', onKey)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('mousedown', onAway)
    window.removeEventListener('keydown', onKey)
})
</script>

<style lang="scss">
@use './_travellers-picker.scss';
</style>
