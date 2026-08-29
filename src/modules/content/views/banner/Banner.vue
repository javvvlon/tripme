<template>
    <div class="tm-cms-banner">
        <SectionHead :level="1" :title="t('cms.banner.title')" :sub="t('cms.banner.lead')" />

        <EditorSkeleton v-if="status === 'pending'" variant="form" />

        <template v-else>
        <Tabs
            v-model="locale" :items="localeTabs" variant="segment"
            :aria-label="t('cms.banner.languageTabs')" class="tm-cms-banner__langs"
        />

        <form class="tm-cms-banner__form" novalidate @submit.prevent="submit">
            <FormRow
                :label="t('cms.banner.fields.title')"
                :for="titleId"
                required
                :error="touched.title ? errors.title : undefined"
            >
                <Input
                    :id="titleId"
                    v-model="draft[locale].title"
                    :placeholder="t('cms.banner.fields.titlePlaceholder')"
                    @blur="validation.touch('title')"
                />
            </FormRow>

            <FormRow :label="t('cms.banner.fields.subtitle')" :for="subtitleId" :hint="t('cms.banner.fields.subtitleHint')">
                <Input
                    :id="subtitleId"
                    v-model="draft[locale].subtitle"
                    :placeholder="t('cms.banner.fields.subtitlePlaceholder')"
                />
            </FormRow>

            <FormRow
                :label="t('cms.banner.fields.image')"
                :hint="imageHint"
                :error="imageError || undefined"
            >
                <FileUpload
                    v-model:error="imageError"
                    :accept="[...BANNER_IMAGE.accept]"
                    :max-size="BANNER_IMAGE.maxSize"
                    :max-width="BANNER_IMAGE.maxWidth"
                    :max-height="BANNER_IMAGE.maxHeight"
                    :current="draft[locale].imageUrl"
                    :hint="uploading ? t('cms.lists.uploading') : imageHint"
                    :disabled="uploading"
                    override
                    :library="mediaLibrary"
                    @update:model-value="pickImage"
                    @clear="clearImage"
                    @discard="discardImage"
                    @pick="useStored"
                />

                <p v-if="inheritedImage" class="tm-cms-banner__inherited">
                    <img :src="inheritedImage.url" alt="" width="64" height="36">
                    <span>{{ t('cms.banner.fields.inherited', { locale: inheritedImage.locale.toUpperCase() }) }}</span>
                </p>
            </FormRow>

            <footer class="tm-cms-banner__foot">
                <p v-if="error" class="tm-cms-banner__error" role="alert">{{ error }}</p>
                <p v-else-if="saved" class="tm-cms-banner__saved" role="status">{{ t('cms.saved') }}</p>

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
import { BANNER_IMAGE } from './Banner.config'
import { useBanner } from './Banner.hooks'
import { CONTENT_LOCALES } from '~/modules/content/contracts/content'

const { t, locales } = useI18n()

const {
  locale, draft, validation, imageError, inheritedImage, status, saving, saved, error, uploading,
  submit, pickImage, clearImage, discardImage, mediaLibrary, useStored,
} = useBanner()
const { errors, touched } = validation

const titleId = useId()
const subtitleId = useId()

const localeTabs = computed(() => CONTENT_LOCALES.map(code => ({
  value: code,
  label: (locales.value as LocaleObject[]).find(l => l.code === code)?.name ?? code,
})))

const imageHint = computed(() => t('cms.banner.fields.imageHint', {
  width: BANNER_IMAGE.maxWidth,
  height: BANNER_IMAGE.maxHeight,
  size: Math.round(BANNER_IMAGE.maxSize / 1024 / 1024),
}))

useSeoMeta({ title: () => t('cms.banner.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_banner.scss';
</style>
