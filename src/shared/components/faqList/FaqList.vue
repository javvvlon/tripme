<template>
    <ul class="tm-faq">
        <li v-for="(item, i) in items" :key="item.uuid" class="tm-faq__item">
            <h3 class="tm-faq__heading">
                <button
                    type="button" class="tm-faq__question"
                    :aria-expanded="open === i" :aria-controls="`${id}-${i}`"
                    @click="toggle(i)"
                >
                    <span>{{ item.title }}</span>
                    <Icon :name="open === i ? 'chevron-up' : 'chevron'" :size="20" class="tm-faq__caret" />
                </button>
            </h3>

            <div v-show="open === i" :id="`${id}-${i}`" class="tm-faq__answer">
                <p>{{ item.description }}</p>

                <NuxtLink v-if="item.link" :to="localePath(item.link)" class="tm-faq__link">
                    {{ t('common.readMore') }}
                    <Icon name="arrow-right" :size="15" />
                </NuxtLink>
            </div>
        </li>
    </ul>
</template>

<script setup lang="ts">
import Icon from '~/shared/components/icon/Icon.vue'
import type { IContentItem } from '~/modules/content/models/PageContent'

defineProps<{ items: IContentItem[] }>()

const { t } = useI18n()
const localePath = useLocalePath()
const id = useId()

const open = ref<number | null>(0)

const toggle = (index: number) => {
    open.value = open.value === index ? null : index
}
</script>

<style lang="scss">
@use './_faq-list.scss';
</style>
