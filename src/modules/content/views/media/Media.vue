<template>
    <div
        class="tm-cms-media" :class="{ 'is-dragging': dragging }"
        @dragover.prevent="dragging = true"
        @dragleave.self="dragging = false"
        @drop.prevent="dropped"
    >
        <header class="tm-cms-media__head">
            <h1 class="tm-cms-media__title">{{ t('cms.media.title') }}</h1>

            <div class="tm-cms-media__search">
                <Icon name="search" :size="15" />
                <input v-model="query" type="search" :placeholder="t('media.search')" :aria-label="t('media.search')">
            </div>

            <Button size="sm" icon="upload" :loading="upload.total > 0" @click="browse">
                {{ upload.total ? t('cms.media.uploading', { done: upload.done, total: upload.total }) : t('cms.media.upload') }}
            </Button>

            <input
                ref="fileInput" type="file" multiple hidden
                :accept="MEDIA_ACCEPT.join(',')"
                @change="onPicked"
            >
        </header>

        <nav class="tm-cms-media__folders" :aria-label="t('media.folders.field')">
            <button type="button" class="tm-cms-media__folder" :class="{ 'is-on': folder === '' }" @click="pickFolder('')">
                {{ t('media.folders.all') }}
            </button>
            <button
                v-for="entry in folders" :key="entry.id"
                type="button" class="tm-cms-media__folder" :class="{ 'is-on': folder === entry.id }"
                @click="pickFolder(entry.id)"
            >
                <Icon name="folder" :size="13" />{{ entry.name }}<span>{{ entry.count }}</span>
            </button>
            <button
                v-if="folders.length"
                type="button" class="tm-cms-media__folder" :class="{ 'is-on': folder === MEDIA_UNFILED }"
                @click="pickFolder(MEDIA_UNFILED)"
            >
                {{ t('media.folders.unfiled') }}
            </button>
            <button type="button" class="tm-cms-media__folder is-add" @click="startFolder()">
                <Icon name="plus" :size="13" />{{ t('media.folders.add') }}
            </button>

            <MoreMenu
                v-if="currentFolder"
                class="tm-cms-media__folder-menu"
                :label="t('media.folders.field')"
                :items="[
                    { key: 'rename', label: t('media.folders.rename'), icon: 'pencil' },
                    { key: 'remove', label: t('media.folders.remove'), icon: 'trash', danger: true },
                ]"
                @select="key => key === 'rename' ? startFolder(currentFolder!.id) : (dropFolderOpen = true)"
            />
        </nav>

        <div v-if="selecting" class="tm-cms-media__bar" role="toolbar">
            <strong>{{ t('cms.media.selected', { n: selected.length }) }}</strong>
            <button type="button" class="tm-cms-media__bar-link" @click="selectAll">{{ t('cms.media.selectAll') }}</button>
            <button type="button" class="tm-cms-media__bar-link" @click="clearSelection">{{ t('cms.media.clear') }}</button>

            <span class="tm-cms-media__bar-spacer" />

            <label v-if="folders.length" class="tm-cms-media__move">
                <Icon name="folder" :size="14" />
                <select :disabled="working === 'move'" :aria-label="t('cms.media.moveTo')" @change="moveSelected(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).selectedIndex = 0">
                    <option value="" disabled selected>{{ t('cms.media.moveTo') }}</option>
                    <option value="">{{ t('media.folders.none') }}</option>
                    <option v-for="entry in folders" :key="entry.id" :value="entry.id">{{ entry.name }}</option>
                </select>
            </label>

            <Button size="sm" variant="danger-quiet" icon="trash" @click="askRemove(picked)">{{ t('cms.media.remove') }}</Button>
        </div>

        <div class="tm-cms-media__body" :class="{ 'has-panel': focused }">
            <section class="tm-cms-media__library">
                <EditorSkeleton v-if="loading && !items.length" variant="rows" />

                <p v-else-if="failed" class="tm-cms-media__state">{{ t('media.failed') }}</p>

                <button v-else-if="!items.length" type="button" class="tm-cms-media__empty" @click="browse">
                    <Icon name="image" :size="28" />
                    {{ query ? t('media.noMatches') : folder ? t('media.folders.empty') : t('media.empty') }}
                </button>

                <ul v-else class="tm-cms-media__grid">
                    <li
                        v-for="item in visible" :key="item.path"
                        class="tm-cms-media__tile"
                        :class="{ 'is-focused': focused?.path === item.path, 'is-picked': selected.includes(item.path) }"
                    >
                        <Tooltip :text="nameOf(item)" class="tm-cms-media__thumb-tip">
                            <button type="button" class="tm-cms-media__thumb" @click="selecting ? toggle(item) : focus(item)">
                                <img :src="item.url" :alt="nameOf(item)" loading="lazy" decoding="async">
                                <span v-if="item.used" class="tm-cms-media__used">{{ t('cms.media.used', { n: item.used }) }}</span>
                            </button>
                        </Tooltip>

                        <Tooltip tag="label" :text="t('cms.media.select')" align="start" class="tm-cms-media__check">
                            <input type="checkbox" :checked="selected.includes(item.path)" :aria-label="nameOf(item)" @change="toggle(item)">
                            <Icon name="check" :size="12" :stroke="2.5" />
                        </Tooltip>

                        <span class="tm-cms-media__name">{{ nameOf(item) }}</span>
                    </li>
                </ul>

                <div v-if="items.length > visible.length" class="tm-cms-media__more">
                    <Button size="sm" variant="ghost" @click="limit += MEDIA_PAGE_SIZE">{{ t('cms.media.more') }}</Button>
                </div>
            </section>

            <aside v-if="focused" class="tm-cms-media__panel" :aria-label="nameOf(focused)">
                <header class="tm-cms-media__panel-head">
                    <span>{{ facts(focused) }}</span>
                    <button type="button" class="tm-cms-media__close" :aria-label="t('common.close')" @click="focus(focused)">
                        <Icon name="close" :size="16" />
                    </button>
                </header>

                <a :href="focused.url" target="_blank" rel="noopener" class="tm-cms-media__preview">
                    <img :key="focused.path" :src="focused.url" :alt="nameOf(focused)" @load="measured">
                </a>

                <Input
                    v-model="title"
                    :label="t('media.name')"
                    :placeholder="t('media.namePlaceholder')"
                    :disabled="working === 'title'"
                    @blur="saveTitle"
                    @keydown.enter.prevent="saveTitle"
                />

                <label v-if="folders.length" class="tm-cms-media__field">
                    <span>{{ t('media.folders.field') }}</span>
                    <select :value="focused.folderId ?? ''" :disabled="working === 'folder'" @change="moveFocused(($event.target as HTMLSelectElement).value)">
                        <option value="">{{ t('media.folders.none') }}</option>
                        <option v-for="entry in folders" :key="entry.id" :value="entry.id">{{ entry.name }}</option>
                    </select>
                </label>

                <div class="tm-cms-media__uses">
                    <span class="tm-cms-media__label">{{ t('cms.media.usedIn') }}</span>
                    <p v-if="!uses" class="tm-cms-media__muted">{{ t('common.loading') }}</p>
                    <p v-else-if="!uses.length" class="tm-cms-media__muted">{{ t('cms.media.unused') }}</p>
                    <ul v-else>
                        <li v-for="use in uses" :key="`${use.kind}:${use.id}`">
                            <NuxtLink :to="localePath(useLink(use))">
                                <span>{{ t(`cms.media.kinds.${use.kind}`) }}</span>
                                {{ useLabel(use) }}
                            </NuxtLink>
                        </li>
                    </ul>
                </div>

                <div class="tm-cms-media__actions">
                    <Button size="sm" icon="copy" @click="copyLink">{{ t('cms.media.copyLink') }}</Button>
                    <Button size="sm" variant="ghost" icon="layers" :loading="working === 'duplicate'" @click="duplicate">{{ t('cms.media.duplicate') }}</Button>
                    <Button size="sm" variant="ghost" icon="arrow-up-right" :href="focused.url" target="_blank" rel="noopener">{{ t('cms.media.open') }}</Button>
                </div>

                <button type="button" class="tm-cms-media__remove" @click="askRemove([focused])">
                    <Icon name="trash" :size="14" />{{ t('cms.media.remove') }}
                </button>
            </aside>
        </div>

        <div v-if="dragging" class="tm-cms-media__drop" aria-hidden="true">
            <Icon name="upload" :size="28" />{{ t('cms.media.drop') }}
        </div>

        <Modal
            v-model="removingOpen"
            :title="t('cms.media.removeTitle', { n: removing.length }, removing.length)"
            :description="t('cms.media.removeLead')"
            :confirm-label="t('cms.media.remove')"
            :busy="removeBusy" :error="removeError"
            tone="danger" size="sm"
            @confirm="confirmRemove"
        >
            <div class="tm-cms-media__confirm">
                <ul class="tm-cms-media__confirm-list">
                    <li v-for="item in removing.slice(0, 8)" :key="item.path">
                        <img :src="item.url" alt="">
                    </li>
                </ul>
                <p v-if="removingUsed" class="tm-cms-media__warn">
                    <Icon name="help" :size="15" />{{ t('cms.media.removeUsed') }}
                </p>
            </div>
        </Modal>

        <Modal
            v-model="folderOpen"
            :title="folderEditing ? t('media.folders.rename') : t('media.folders.add')"
            :confirm-label="t('common.save')"
            :busy="folderBusy" :error="folderError"
            :disabled="!folderName.trim()"
            size="sm"
            @confirm="saveFolder"
        >
            <Input v-model="folderName" :placeholder="t('media.folders.namePlaceholder')" @keydown.enter.prevent="saveFolder" />
        </Modal>

        <Modal
            v-model="dropFolderOpen"
            :title="t('media.folders.confirmRemove.title')"
            :description="t('media.folders.confirmRemove.lead')"
            :confirm-label="t('media.folders.remove')"
            :busy="dropFolderBusy" :error="dropFolderError"
            tone="danger" size="sm"
            @confirm="confirmDropFolder"
        />
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import Modal from '~/shared/components/modal/Modal.vue'
import MoreMenu from '~/shared/components/moreMenu/MoreMenu.vue'
import Tooltip from '~/shared/components/tooltip/Tooltip.vue'
import type { IMediaFile } from '~/shared/components/mediaLibrary/MediaLibrary.d'
import type { IMediaUseRaw } from '~/modules/content/contracts/blocks'
import { useMediaPage } from './Media.hooks'
import { MEDIA_ACCEPT, MEDIA_PAGE_SIZE, MEDIA_UNFILED } from './Media.config'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const {
    items, visible, folders, folder, query, limit, loading, failed,
    focused, focus, selected, picked, selecting, toggle, selectAll, clearSelection,
    uses, size, measured, title, working, saveTitle, moveFocused, moveSelected, duplicate, copyLink,
    nameOf, pickFolder, upload, fileInput, dragging, browse, onPicked, dropped,
    removing, removingOpen, removeBusy, removeError, removingUsed, askRemove, confirmRemove,
    folderOpen, folderName, folderEditing, folderBusy, folderError, startFolder, saveFolder,
    currentFolder, dropFolderOpen, dropFolderBusy, dropFolderError, confirmDropFolder,
} = useMediaPage()

const facts = (item: IMediaFile) => [
    size.value ? t('cms.media.dimensions', { w: size.value.w, h: size.value.h }) : '',
    item.size ? (item.size < 1024 * 1024 ? `${Math.max(1, Math.round(item.size / 1024))} KB` : `${(item.size / 1024 / 1024).toFixed(1)} MB`) : '',
    item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString(locale.value) : '',
].filter(Boolean).join(' · ')

const useLink = (use: IMediaUseRaw): string => {
    if (use.kind === 'post') return `/app/posts/${use.id}`
    if (use.kind === 'list') return `/app/content/lists/${use.id}`

    return use.page === 'blog' ? '/app/content/blog' : '/app/content/sections'
}

const useLabel = (use: IMediaUseRaw): string => {
    const page = use.page ? t(`cms.media.pages.${use.page}`) : ''

    if (use.kind === 'banner') return page

    return [use.label, use.kind === 'section' ? page : ''].filter(Boolean).join(' · ')
}

useSeoMeta({ title: () => t('cms.media.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_media.scss';
</style>
