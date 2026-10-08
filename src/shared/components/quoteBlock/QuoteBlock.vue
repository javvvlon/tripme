<template>
    <figure class="tm-quote-block">
        <Icon name="quote" :size="44" :stroke="1.4" class="tm-quote-block__mark" />

        <blockquote class="tm-quote-block__text">{{ quote }}</blockquote>

        <figcaption v-if="author || role" class="tm-quote-block__by">
            <img v-if="imageUrl" :src="imageUrl" :alt="author ?? ''" class="tm-quote-block__photo" loading="lazy" decoding="async">
            <span>
                <strong v-if="author">{{ author }}</strong>
                <span v-if="role">{{ role }}</span>
            </span>
        </figcaption>
    </figure>
</template>

<script setup lang="ts">
import type { IQuoteBlockProps } from './QuoteBlock.d'

defineProps<IQuoteBlockProps>()
</script>

<style lang="scss">
@use './_quote-block.scss';
</style>
