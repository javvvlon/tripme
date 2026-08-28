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
                        <FormRow
                            :label="t('cms.posts.fields.title')" :for="titleId" required
                            :error="touched.title ? errors.title : undefined"
                        >
                            <Input
                                :id="titleId"
                                v-model="draft.translations[locale].title"
                                :placeholder="t('cms.posts.fields.titlePlaceholder')"
                                @blur="validation.touch('title')"
                            />
                        </FormRow>

                        <FormRow
                            :label="t('cms.posts.fields.excerpt')" :for="excerptId"
                            :hint="t('cms.posts.fields.excerptHint')"
                            :error="touched.excerpt ? errors.excerpt : undefined"
                        >
                            <Input
                                :id="excerptId"
                                v-model="draft.translations[locale].excerpt"
                                :placeholder="t('cms.posts.fields.excerptPlaceholder')"
                                @blur="validation.touch('excerpt')"
                            />
                        </FormRow>

                        <FormRow :label="t('cms.posts.fields.body')">
                            <MarkdownEditor
                                v-model="draft.translations[locale].body"
                                :placeholder="t('cms.posts.fields.bodyPlaceholder')"
                                :hint="t('cms.posts.fields.bodyHint')"
                            />
                        </FormRow>
                    </div>

                    <aside class="tm-post-editor__side">
                        <FormRow :label="t('cms.posts.fields.state')">
                            <Checkbox v-model="draft.isPublished" :label="t('cms.posts.publishedLabel')" />
                        </FormRow>

                        <FormRow
                            :label="t('cms.posts.fields.slug')" :for="slugId"
                            :hint="t('cms.posts.fields.slugHint')" required
                        >
                            <Input :id="slugId" v-model="draft.slug" />
                        </FormRow>

                        <FormRow :label="t('cms.posts.fields.image')" :error="imageError || undefined">
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
                        </FormRow>

                        <FormRow :label="t('cms.posts.fields.badgeType')">
                            <select v-model="draft.badgeType" class="tm-post-editor__select">
                                <option :value="null">{{ t('cms.posts.fields.badgeNone') }}</option>
                                <option v-for="type in BADGE_TYPES" :key="type" :value="type">
                                    {{ t(`cms.lists.badgeTypes.${type}`) }}
                                </option>
                            </select>
                        </FormRow>

                        <FormRow
                            v-if="draft.badgeType"
                            :label="t('cms.posts.fields.badgeLabel')" :for="badgeId"
                        >
                            <Input :id="badgeId" v-model="draft.translations[locale].badgeLabel" />
                        </FormRow>

                        <FormRow :label="t('cms.posts.fields.link')" :for="linkId" :hint="t('cms.posts.fields.linkHint')">
                            <Input :id="linkId" v-model="draft.link" placeholder="https://" />
                        </FormRow>
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
    locale, draft, validation, status, saving, saved, error,
    uploading, imageError, submit, remove, pickImage, clearImage, discardImage,
} = usePostEditor()
const { errors, touched } = validation

const titleId = useId()
const excerptId = useId()
const slugId = useId()
const badgeId = useId()
const linkId = useId()

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
