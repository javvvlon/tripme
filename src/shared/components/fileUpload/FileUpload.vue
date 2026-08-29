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
                    <button type="button" class="tm-file-upload__link" @click="open">
                        {{ t('cms.upload.replace') }}
                    </button>
                    <button type="button" class="tm-file-upload__remove" @click="remove">
                        {{ t('cms.upload.remove') }}
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

                <p v-if="hint" class="tm-file-upload__hint">{{ hint }}</p>
            </template>

            <input
                :id="id" ref="input" type="file" class="tm-file-upload__input"
                :accept="acceptAttr" :disabled="disabled"
                @change="onChange"
            >
        </div>
    </div>
</template>

<script setup lang="ts">
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
