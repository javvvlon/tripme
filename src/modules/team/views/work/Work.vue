<template>
    <div class="tm-work">
        <header class="tm-work__head">
            <p class="tm-work__date">{{ today }}</p>
            <h1 class="tm-work__title">{{ greeting }}</h1>
            <p v-if="work && !total" class="tm-work__calm">
                <Icon name="check" :size="16" />{{ t('cms.work.allClear') }}
            </p>
        </header>

        <EditorSkeleton v-if="status === 'pending' && !work" variant="rows" />

        <ul v-else-if="work" class="tm-work__tiles">
            <li v-for="tile in WORK_TILES" :key="tile.key">
                <NuxtLink
                    :to="{ path: localePath(tile.to), query: tile.query }"
                    class="tm-work__tile"
                    :class="{ 'is-urgent': tile.urgent && work[tile.key] > 0, 'is-empty': !work[tile.key] }"
                >
                    <span class="tm-work__icon"><Icon :name="tile.icon" :size="20" /></span>
                    <span class="tm-work__count">{{ work[tile.key] }}</span>
                    <span class="tm-work__label">{{ t(`cms.work.tiles.${tile.key}`, work[tile.key]) }}</span>
                    <Icon name="arrow-right" :size="16" class="tm-work__go" />
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import { WORK_TILES } from './Work.config'
import { useWork } from './Work.hooks'

const { t } = useI18n()
const localePath = useLocalePath()

const { work, status, greeting, today, total } = useWork()

useSeoMeta({ title: () => t('cms.work.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_work.scss';
</style>
