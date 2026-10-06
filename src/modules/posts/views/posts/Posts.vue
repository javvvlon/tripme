<template>
    <div class="tm-cms-posts">
        <SectionHead :level="1" :title="t('cms.posts.title')" :sub="t('cms.posts.count', counts)" />

        <div class="tm-cms-posts__actions">
            <SearchField
                v-model="query"
                :label="t('cms.posts.search')"
                :placeholder="t('cms.posts.searchPlaceholder')"
                icon="search"
                clearable
                class="tm-cms-posts__search"
            />

            <SelectMenu v-model="filter" :options="filterOptions" class="tm-cms-posts__filter" />

            <Button size="md" @click="open">{{ t('cms.posts.create') }}</Button>
        </div>

        <EditorSkeleton v-if="status === 'pending'" variant="rows" />

        <p v-else-if="!posts.length" class="tm-cms-posts__empty">
            {{ query || filter !== 'all' ? t('cms.posts.noMatches') : t('cms.posts.empty') }}
        </p>

        <table v-else class="tm-cms-posts__table">
            <thead>
                <tr>
                    <th scope="col" class="is-cover"><span class="tm-cms-posts__sort">{{ t('cms.posts.columns.cover') }}</span></th>
                    <th
                        v-for="column in POST_COLUMNS" :key="column.key"
                        scope="col" :class="column.class"
                        :aria-sort="sort === column.key ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'"
                    >
                        <button type="button" class="tm-cms-posts__sort" @click="sortBy(column.key)">
                            {{ t(`cms.posts.columns.${column.key}`) }}
                            <Icon
                                v-if="sort === column.key"
                                :name="direction === 'asc' ? 'chevron-up' : 'chevron'" :size="12"
                            />
                        </button>
                    </th>
                    <th scope="col" class="is-langs"><span class="tm-cms-posts__sort">{{ t('cms.posts.columns.languages') }}</span></th>
                    <th scope="col" class="is-actions"><span class="tm-cms-posts__sort" /></th>
                </tr>
            </thead>

            <tbody>
                <tr
                    v-for="post in posts" :key="post.uuid"
                    class="tm-cms-posts__row"
                    tabindex="0"
                    @click="go(post.uuid)"
                    @keydown.enter="go(post.uuid)"
                >
                    <td class="is-cover">
                        <span class="tm-cms-posts__thumb">
                            <img v-if="post.image_url" :src="post.image_url" alt="" loading="lazy">
                            <Icon v-else name="doc" :size="16" />
                        </span>
                    </td>
                    <td class="is-title">
                        <span class="tm-cms-posts__title">{{ titleOf(post) || t('cms.posts.untitled') }}</span>
                        <span class="tm-cms-posts__slug">
                            /{{ post.slug }}
                            <span v-if="post.slug.startsWith(LEGAL_PREFIX)" class="tm-cms-posts__tag">{{ t('cms.posts.legal') }}</span>
                            <span v-if="post.tour" class="tm-cms-posts__tag">{{ t('cms.posts.withTour') }}</span>
                        </span>
                    </td>
                    <td class="is-author tm-cms-posts__muted">{{ authorOf(post) || '—' }}</td>
                    <td class="is-status">
                        <span class="tm-cms-posts__state" :class="{ 'is-live': post.is_published }">
                            {{ post.is_published ? t('cms.posts.published') : t('cms.posts.draft') }}
                        </span>
                    </td>
                    <td class="is-date tm-cms-posts__muted">{{ post.published_at ? shortDate(post.published_at) : '—' }}</td>
                    <td class="is-date tm-cms-posts__muted">{{ shortDate(post.updated_at) }}</td>
                    <td class="is-langs">
                        <span
                            v-for="language in languagesOf(post)" :key="language.locale"
                            class="tm-cms-posts__lang" :class="{ 'is-filled': language.filled }"
                            :title="language.filled ? t('cms.posts.translated') : t('cms.posts.notTranslated')"
                        >{{ language.locale.toUpperCase() }}</span>
                    </td>
                    <td class="is-actions" @click.stop>
                        <button
                            type="button" class="tm-cms-posts__delete"
                            :aria-label="t('cms.posts.delete')" :title="t('cms.posts.delete')"
                            @click="remove(post.uuid, titleOf(post))"
                        >
                            <Icon name="trash" :size="16" />
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <Modal
            v-model="creating"
            :title="t('cms.posts.newTitle')"
            :description="t('cms.posts.newLead')"
            :confirm-label="t('cms.posts.createConfirm')"
            :busy="busy"
            :disabled="!canCreate"
            :error="error"
            @confirm="submit"
        >
            <Input
                v-model="draft.title"
                :label="t('cms.posts.fields.title')"
                :placeholder="t('cms.posts.fields.titlePlaceholder')"
                required
            />

            <Input
                v-model="draft.slug"
                :label="t('cms.posts.fields.slug')"
                :placeholder="t('cms.posts.fields.slugPlaceholder')"
                :hint="t('cms.posts.fields.slugHint')"
                :error="draft.slug && !slugIsValid ? t('cms.posts.fields.slugInvalid') : ''"
                required
                @input="draft.touched = true"
            />
        </Modal>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import Modal from '~/shared/components/modal/Modal.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import { formatDate } from '~/shared/helpers/format-date'
import { usePosts } from './Posts.hooks'
import { LEGAL_PREFIX, POST_COLUMNS, POST_FILTERS } from './Posts.config'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const {
    posts, counts, status, error, busy, creating, draft, canCreate, slugIsValid,
    query, filter, sort, direction, sortBy, titleOf, authorOf, languagesOf,
    open, submit, remove,
} = usePosts()

const filterOptions = computed(() => POST_FILTERS.map(value => ({ value, label: t(`cms.posts.filters.${value}`) })))

const go = (id: string) => navigateTo(localePath(`/app/posts/${id}`))

const shortDate = (value: string): string =>
    formatDate(value, locale.value, { day: '2-digit', month: 'short', year: 'numeric' })

useSeoMeta({ title: () => t('cms.posts.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_posts.scss';
</style>
