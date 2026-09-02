<template>
    <div class="tm-cms-lists">
        <SectionHead :level="1" :title="t('cms.lists.title')" :sub="t('cms.lists.lead')" />

        <p v-if="error" class="tm-cms-lists__error" role="alert">{{ error }}</p>

        <div class="tm-cms-lists__actions">
            <Button size="md" :disabled="busy" @click="create">
                {{ t('cms.lists.create') }}
            </Button>
        </div>

        <EditorSkeleton v-if="status === 'pending'" variant="rows" />

        <p v-else-if="!lists?.length" class="tm-cms-lists__empty">{{ t('cms.lists.empty') }}</p>

        <ul v-else class="tm-cms-lists__grid">
            <li v-for="list in lists" :key="list.uuid" class="tm-cms-lists__row">
                <NuxtLink :to="localePath(`/app/content/lists/${list.uuid}`)" class="tm-cms-lists__name">
                    <Icon name="list" :size="18" />
                    {{ list.name }}
                </NuxtLink>

                <span class="tm-cms-lists__count">
                    {{ t('cms.lists.items', { count: list.items_count }) }}
                </span>

                <button
                    type="button" class="tm-cms-lists__delete"
                    :aria-label="t('cms.lists.delete')" :title="t('cms.lists.delete')"
                    @click="remove(list.uuid, list.name)"
                >
                    <Icon name="close" :size="16" />
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import { useLists } from './Lists.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { lists, status, error, busy, create, remove } = useLists()

useSeoMeta({ title: () => t('cms.lists.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_lists.scss';
</style>
