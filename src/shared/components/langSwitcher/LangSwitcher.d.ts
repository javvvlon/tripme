/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type LangSwitcherTone = 'onLight' | 'onDark'

export type LangSwitcherVariant = 'menu' | 'inline'

export interface ILangSwitcherProps {
  tone?: LangSwitcherTone
  variant?: LangSwitcherVariant
}
