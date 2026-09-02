<template>
    <div class="tm-file-upload">
        <div
            class="tm-file-upload__zone"
            :class="{ 'is-dragging': dragging, 'is-disabled': disabled, 'has-file': shown }"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop"
        >
            <template v-if="shown">
                <img class="tm-file-upload__preview" :src="shown" alt="" width="240" height="120">

                <div class="tm-file-upload__actions">
                    <button
                        type="button" class="tm-file-upload__action"
                        :aria-label="t('cms.upload.replace')" :title="t('cms.upload.replace')"
                        @click="open"
                    >
                        <Icon name="upload" :size="16" />
                    </button>
                    <button
                        v-if="library"
                        type="button" class="tm-file-upload__action"
                        :aria-label="t('cms.upload.library')" :title="t('cms.upload.library')"
                        @click="browsing = true"
                    >
                        <Icon name="image" :size="16" />
                    </button>
                    <button
                        type="button" class="tm-file-upload__action tm-file-upload__action--danger"
                        :aria-label="t('cms.upload.remove')" :title="t('cms.upload.remove')"
                        @click="remove"
                    >
                        <Icon name="trash" :size="16" />
                    </button>
                </div>
            </template>

            <template v-else>
                <span class="tm-file-upload__badge" aria-hidden="true">
                    <Icon name="upload" :size="22" />
                </span>

                <p class="tm-file-upload__cta">
                    <button type="button" class="tm-file-upload__link" :disabled="disabled" @click="open">
                        {{ t('cms.upload.choose') }}
                    </button>
                    {{ ' ' }}{{ t('cms.upload.orDrop') }}
                </p>

                <p v-if="library" class="tm-file-upload__cta">
                    <button type="button" class="tm-file-upload__link" :disabled="disabled" @click="browsing = true">
                        {{ t('cms.upload.library') }}
                    </button>
                </p>

                <p v-if="hint" class="tm-file-upload__hint">{{ hint }}</p>
            </template>

            <input
                :id="id" ref="input" type="file" class="tm-file-upload__input"
                :accept="acceptAttr" :disabled="disabled"
                @change="onChange"
            >
        </div>

        <MediaLibrary
            v-if="library"
            v-model="browsing"
            :library="library"
            :accept="accept"
            :current="current ?? null"
            @select="fromLibrary"
            @remove="onGalleryRemove"
        />
    </div>
</template>

<script setup lang="ts">
import MediaLibrary from '~/shared/components/mediaLibrary/MediaLibrary.vue'
import type { IFileUploadEmits, IFileUploadProps } from './FileUpload.d'

const props = defineProps<IFileUploadProps>()

const emit = defineEmits<IFileUploadEmits>()

const file = defineModel<File | null>({ default: null })

const error = defineModel<string>('error', { default: '' })

const { t } = useI18n()

const upload = useFileUpload(() => ({
  accept: props.accept,
  maxSize: props.maxSize,
  maxWidth: props.maxWidth,
  maxHeight: props.maxHeight,
}))

const { preview, acceptAttr } = upload

const input = useTemplateRef<HTMLInputElement>('input')
const dragging = ref(false)
const browsing = ref(false)

/**
 * Set when Remove was pressed, so a `current` that is still on its way out of
 * the parent's state stops being shown immediately.
 */
const cleared = ref(false)

const shown = computed(() => preview.value ?? (cleared.value ? null : props.current) ?? null)

/** The stored file this picker is about to stop referencing. */
const stored = computed(() => (cleared.value ? null : props.current ?? null))

watch(upload.error, value => { error.value = value })
watch(upload.file, value => { file.value = value })

watch(() => props.current, () => {
  upload.clear()
  cleared.value = false
  error.value = ''
})

const open = () => input.value?.click()

/**
 * A library image is already stored, so nothing is uploaded and nothing is
 * discarded — the file being replaced may still be used somewhere else.
 */
function fromLibrary(url: string) {
  upload.clear()
  cleared.value = false
  error.value = ''

  emit('pick', url)
}

/**
 * The gallery deleted the very file this field points at, so the field has
 * to let go of it — no discard, the bytes are already gone.
 */
function onGalleryRemove(url: string) {
  if (url !== props.current) return

  upload.clear()
  cleared.value = true
  file.value = null
  emit('clear')
}

async function take(candidate: File | null | undefined) {
  const previous = stored.value
  const accepted = await upload.select(candidate)

  if (input.value) input.value.value = ''

  // Replacing: the file that was there is now unreferenced.
  if (accepted && previous && props.override) emit('discard', previous)

  if (accepted) cleared.value = false
}

const onChange = (event: Event) => take((event.target as HTMLInputElement).files?.[0])

function onDrop(event: DragEvent) {
  dragging.value = false

  if (props.disabled) return

  void take(event.dataTransfer?.files?.[0])
}

function remove() {
  const previous = stored.value

  upload.clear()
  cleared.value = true
  error.value = ''

  /**
   * `clear` rather than relying on the model going null: when the image came
   * from the server the model was already null, so assigning null again
   * changed nothing and told the caller nothing — which is why Remove looked
   * like it did nothing at all.
   */
  file.value = null
  emit('clear')

  if (previous && props.override) emit('discard', previous)
}
</script>

<style lang="scss">
@use './_file-upload.scss';
</style>
