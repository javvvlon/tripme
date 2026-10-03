<template>
    <div class="tm-stepper" role="group" :aria-label="ariaLabel">
        <button
            type="button" class="tm-stepper__button"
            :disabled="model <= min"
            :aria-label="t('search.travellers.less', { what: ariaLabel ?? '' })"
            @click="step(-1)"
        >
            <Icon name="minus" :size="16" :stroke="2.4" />
        </button>

        <span class="tm-stepper__value" aria-live="polite">{{ model }}</span>

        <button
            type="button" class="tm-stepper__button tm-stepper__button--add"
            :disabled="model >= max"
            :aria-label="t('search.travellers.more', { what: ariaLabel ?? '' })"
            @click="step(1)"
        >
            <Icon name="plus" :size="16" :stroke="2.4" />
        </button>
    </div>
</template>

<script setup lang="ts">
import Icon from '~/shared/components/icon/Icon.vue'
import type { IStepperProps } from './Stepper.d'

const props = withDefaults(defineProps<IStepperProps>(), { min: 0, max: 9 })

const model = defineModel<number>({ required: true })

const { t } = useI18n()

const step = (by: number) => {
    model.value = Math.min(props.max, Math.max(props.min, model.value + by))
}
</script>

<style lang="scss">
@use './_stepper.scss';
</style>
