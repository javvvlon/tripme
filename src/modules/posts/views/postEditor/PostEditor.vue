<template>
    <div class="tm-post-editor">
        <SectionHead
            :level="1"
            :title="draft.translations[locale].title || t('cms.posts.untitled')"
            :sub="t('cms.posts.editLead')"
        />

        <EditorSkeleton v-if="status === 'pending'" variant="form" />

        <template v-else>
            <Tabs
                v-model="locale" :items="localeTabs" variant="segment"
                :aria-label="t('cms.posts.languageTabs')" class="tm-post-editor__langs"
            />

            <form class="tm-post-editor__form" novalidate @submit.prevent="submit">
                <div class="tm-post-editor__grid">
                    <div class="tm-post-editor__main">
                        <Input
                            v-model="draft.translations[locale].title"
                            :label="t('cms.posts.fields.title')"
                            :placeholder="t('cms.posts.fields.titlePlaceholder')"
                            :error="touched.title ? errors.title : ''"
                            required
                            @blur="validation.touch('title')"
                        />

                        <Input
                            v-model="draft.translations[locale].excerpt"
                            :label="t('cms.posts.fields.excerpt')"
                            :placeholder="t('cms.posts.fields.excerptPlaceholder')"
                            :hint="t('cms.posts.fields.excerptHint')"
                            :error="touched.excerpt ? errors.excerpt : ''"
                            @blur="validation.touch('excerpt')"
                        />

                        <div class="tm-post-editor__field">
                            <span class="tm-post-editor__label">{{ t('cms.posts.fields.body') }}</span>

                            <MarkdownEditor
                                v-model="draft.translations[locale].body"
                                :placeholder="t('cms.posts.fields.bodyPlaceholder')"
                                :hint="t('cms.posts.fields.bodyHint')"
                            />
                        </div>
                    </div>

                    <aside class="tm-post-editor__side">
                        <div class="tm-post-editor__field">
                            <span class="tm-post-editor__label">{{ t('cms.posts.fields.state') }}</span>
                            <Checkbox v-model="draft.isPublished" :label="t('cms.posts.publishedLabel')" />

                            <p v-if="author" class="tm-post-editor__meta">
                                {{ t('cms.posts.fields.author') }}: <strong>{{ author }}</strong>
                            </p>
                        </div>

                        <Input
                            v-model="draft.slug"
                            :label="t('cms.posts.fields.slug')"
                            :hint="t('cms.posts.fields.slugHint')"
                            required
                        />

                        <div class="tm-post-editor__field">
                            <span class="tm-post-editor__label">{{ t('cms.posts.fields.image') }}</span>

                            <FileUpload
                                v-model:error="imageError"
                                :accept="[...POST_IMAGE.accept]"
                                :max-size="POST_IMAGE.maxSize"
                                :max-width="POST_IMAGE.maxWidth"
                                :max-height="POST_IMAGE.maxHeight"
                                :current="draft.imageUrl"
                                :hint="uploading ? t('cms.lists.uploading') : imageHint"
                                :disabled="uploading"
                                override
                                @update:model-value="pickImage"
                                @clear="clearImage"
                                @discard="discardImage"
                            />
                        </div>

                        <div class="tm-post-editor__field">
                            <label :for="badgeTypeId" class="tm-post-editor__label">
                                {{ t('cms.posts.fields.badgeType') }}
                            </label>

                            <select :id="badgeTypeId" v-model="draft.badgeType" class="tm-post-editor__select">
                                <option :value="null">{{ t('cms.posts.fields.badgeNone') }}</option>
                                <option v-for="type in BADGE_TYPES" :key="type" :value="type">
                                    {{ t(`cms.lists.badgeTypes.${type}`) }}
                                </option>
                            </select>
                        </div>

                        <Input
                            v-if="draft.badgeType"
                            v-model="draft.translations[locale].badgeLabel"
                            :label="t('cms.posts.fields.badgeLabel')"
                        />

                        <Input
                            v-model="draft.link"
                            :label="t('cms.posts.fields.link')"
                            :hint="t('cms.posts.fields.linkHint')"
                            placeholder="https://"
                        />
                    </aside>
                </div>

                <footer class="tm-post-editor__foot">
                    <Button type="button" variant="ghost" @click="remove">
                        {{ t('cms.posts.delete') }}
                    </Button>

                    <p v-if="error" class="tm-post-editor__error" role="alert">{{ error }}</p>
                    <p v-else-if="saved" class="tm-post-editor__saved" role="status">{{ t('cms.saved') }}</p>

                    <Button type="submit" size="lg" :disabled="saving">
                        {{ saving ? t('cms.saving') : t('cms.save') }}
                    </Button>
                </footer>
            </form>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import MarkdownEditor from '~/shared/components/markdownEditor/MarkdownEditor.vue'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'
import { BADGE_TYPES } from '~/modules/content/contracts/blocks'
import { POST_IMAGE } from './PostEditor.config'
import { usePostEditor } from './PostEditor.hooks'

const { t, locales } = useI18n()

const {
    locale, draft, author, validation, status, saving, saved, error,
    uploading, imageError, submit, remove, pickImage, clearImage, discardImage,
} = usePostEditor()
const { errors, touched } = validation

const badgeTypeId = useId()

const localeTabs = computed(() => CONTENT_LOCALES.map(code => ({
    value: code,
    label: (locales.value as LocaleObject[]).find(item => item.code === code)?.name ?? code,
})))

const imageHint = computed(() => t('cms.banner.fields.imageHint', {
    width: POST_IMAGE.maxWidth,
    height: POST_IMAGE.maxHeight,
    size: Math.round(POST_IMAGE.maxSize / 1024 / 1024),
}))

useSeoMeta({ title: () => t('cms.posts.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_post-editor.scss';
</style>
