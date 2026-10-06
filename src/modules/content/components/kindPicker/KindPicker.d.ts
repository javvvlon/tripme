/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
import type { SectionKind } from '~/modules/content/contracts/blocks'

export interface IKindPickerProps {
  label: string
  kinds?: readonly SectionKind[]
}
