import type { IValidationMessage } from '~/shared/helpers/validation'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IFileConstraints {
  accept?: string[]
  maxSize?: number
  maxWidth?: number
  maxHeight?: number
}

const readDimensions = (file: File): Promise<{ width: number, height: number } | null> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
      URL.revokeObjectURL(url)
    }

    image.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }

    image.src = url
  })

export const useFileUpload = (constraints: MaybeRefOrGetter<IFileConstraints> = {}) => {
  const file = ref<File | null>(null)
  const failure = ref<IValidationMessage | null>(null)
  const preview = ref<string | null>(null)

  const { t } = useI18n()

  const rules = () => toValue(constraints)

  const acceptAttr = computed(() => rules().accept?.join(',') ?? undefined)

  const error = computed(() => (failure.value ? t(failure.value.key, failure.value.params ?? {}) : ''))

  const revoke = () => {
    if (preview.value) URL.revokeObjectURL(preview.value)
    preview.value = null
  }

  const clear = () => {
    revoke()
    file.value = null
    failure.value = null
  }

  const validate = async (candidate: File): Promise<IValidationMessage | null> => {
    const { accept, maxSize, maxWidth, maxHeight } = rules()

    if (accept?.length && !accept.includes(candidate.type)) {
      const kinds = accept
        .map(type => type.replace(/^image\//, '').replace(/^jpeg$/, 'jpg').toUpperCase())
        .join(', ')

      return { key: 'validation.fileType', params: { kinds } }
    }

    if (maxSize && candidate.size > maxSize) {
      return { key: 'validation.fileSize', params: { max: Math.round(maxSize / 1024 / 1024) } }
    }

    if (maxWidth || maxHeight) {
      const size = await readDimensions(candidate)

      if (size && ((maxWidth && size.width > maxWidth) || (maxHeight && size.height > maxHeight))) {
        return {
          key: 'validation.fileDimensions',
          params: { maxWidth, maxHeight, width: size.width, height: size.height },
        }
      }
    }

    return null
  }

  const select = async (candidate: File | null | undefined): Promise<boolean> => {
    if (!candidate) return false

    const problem = await validate(candidate)

    if (problem) {
      failure.value = problem
      return false
    }

    revoke()
    failure.value = null
    file.value = candidate
    preview.value = URL.createObjectURL(candidate)

    return true
  }

  onScopeDispose(revoke)

  return { file, preview, error, failure, acceptAttr, select, clear }
}
