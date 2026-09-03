<template>
    <div class="tm-cms-posts">
        <SectionHead :level="1" :title="t('cms.posts.title')" :sub="t('cms.posts.lead')" />


        <div class="tm-cms-posts__actions">
            <Button size="md" @click="open">{{ t('cms.posts.create') }}</Button>

            <div class="tm-cms-posts__views" role="group" :aria-label="t('cms.posts.view.label')">
                <button
                    v-for="mode in VIEW_MODES" :key="mode.value"
                    type="button" class="tm-cms-posts__view"
                    :class="{ 'is-active': view === mode.value }"
                    :aria-pressed="view === mode.value"
                    :title="t(`cms.posts.view.${mode.value}`)"
                    :aria-label="t(`cms.posts.view.${mode.value}`)"
                    @click="view = mode.value"
                >
                    <Icon :name="mode.icon" :size="18" />
                </button>
            </div>
        </div>

        <EditorSkeleton v-if="status === 'pending'" variant="rows" />

        <p v-else-if="!posts?.length" class="tm-cms-posts__empty">{{ t('cms.posts.empty') }}</p>

        <ul v-else class="tm-cms-posts__grid" :class="`is-${view}`">
            <li v-for="post in posts" :key="post.uuid" class="tm-cms-posts__row">
                <NuxtLink :to="localePath(`/app/posts/${post.uuid}`)" class="tm-cms-posts__cover">
                    <Photo :photo="{ src: post.image_url, alt: '' }" ratio="16x9" />
                </NuxtLink>

                <NuxtLink :to="localePath(`/app/posts/${post.uuid}`)" class="tm-cms-posts__name">
                    <Icon name="doc" :size="18" class="tm-cms-posts__icon" />
                    <span>{{ titleOf(post) }}</span>
                </NuxtLink>

                <p v-if="excerptOf(post)" class="tm-cms-posts__excerpt">{{ excerptOf(post) }}</p>

                <span class="tm-cms-posts__slug">/{{ post.slug }}</span>

                <span v-if="post.author" class="tm-cms-posts__author">{{ authorOf(post) }}</span>

                <span class="tm-cms-posts__state" :class="{ 'is-live': post.is_published }">
                    {{ post.is_published ? t('cms.posts.published') : t('cms.posts.draft') }}
                </span>

                <button
                    type="button" class="tm-cms-posts__delete"
                    :aria-label="t('cms.posts.delete')" :title="t('cms.posts.delete')"
                    @click="remove(post.uuid, titleOf(post))"
                >
                    <Icon name="close" :size="16" />
                </button>
            </li>
        </ul>

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
import { usePosts } from './Posts.hooks'
import { preferredTranslation } from '~/modules/content/contracts/content'
import type { IPostAdminRaw } from '~/modules/posts/contracts/posts'

const { t } = useI18n()
const localePath = useLocalePath()

const {
    posts, status, error, busy, view, creating, draft,
    canCreate, slugIsValid, open, submit, remove,
} = usePosts()

const VIEW_MODES = [
    { value: 'tile' as const, icon: 'list' },
    { value: 'card' as const, icon: 'image' },
]

const titleOf = (post: IPostAdminRaw): string =>
    preferredTranslation(post.translations, translation => Boolean(translation.title))?.title
    ?? t('cms.posts.untitled')

const excerptOf = (post: IPostAdminRaw): string =>
    preferredTranslation(post.translations, translation => Boolean(translation.excerpt))?.excerpt ?? ''

const authorOf = (post: IPostAdminRaw): string =>
    `${post.author?.first_name ?? ''} ${post.author?.last_name ?? ''}`.trim()

useSeoMeta({ title: () => t('cms.posts.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_posts.scss';
</style>
