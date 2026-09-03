import { readFailure } from '~/shared/services/ui/failure'
import type { ToastService } from '~/shared/services/ui/toast'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useToast = () => {
  const { $toast } = useNuxtApp() as unknown as { $toast: ToastService }
  const { t } = useI18n()

  /**
   * Says what went wrong in the reader's language. Hands back the text as
   * well, so a view that still shows an inline message can use the same words.
   */
  const failed = (error: unknown, fallback?: string): string => {
    const message = readFailure(error, (key, params) => t(key, params ?? {}))
    const text = message === t('cms.errors.save') && fallback ? fallback : message

    $toast.error(text)

    return text
  }

  const saved = (message?: string): void => {
    $toast.success(message ?? t('cms.saved'))
  }

  return {
    toasts: $toast.all,
    success: $toast.success.bind($toast),
    error: $toast.error.bind($toast),
    info: $toast.info.bind($toast),
    dismiss: $toast.dismiss.bind($toast),
    failed,
    saved,
  }
}
