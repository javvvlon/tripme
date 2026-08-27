<template>
    <section class="tm-accordion">
        <h3 class="tm-accordion__heading">
            <button
                type="button" class="tm-accordion__button"
                :aria-expanded="open" :aria-controls="id"
                @click="open = !open"
            >
                <span class="tm-accordion__title">
                    {{ title }}
                    <span v-if="count" class="tm-accordion__count">{{ count }}</span>
                </span>
                <Icon
                    name="chevron" :size="18"
                    class="tm-accordion__chevron" :class="{ 'is-open': open }"
                />
            </button>
        </h3>
        <div :id="id" v-show="open" class="tm-accordion__body">
            <slot />
        </div>
    </section>
</template>

<script setup lang="ts">
import type { IAccordionProps } from './Accordion.d'

defineProps<IAccordionProps>()

const open = defineModel<boolean>('open', { default: true })
const id = useId()
</script>

<style lang="scss">
@use './_accordion.scss';
</style>
