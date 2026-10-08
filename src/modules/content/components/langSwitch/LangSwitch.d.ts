import type { ContentLocale } from '~/modules/content/contracts/content'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface ILangSwitchProps {
  label: string
  missing?: ContentLocale[]
  missingHint?: string
}
