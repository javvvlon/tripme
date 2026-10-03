/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type TabsVariant = 'card' | 'pill' | 'segment' | 'floating'

export interface ITabItem {
  value: string
  label: string
  icon?: string
}

export interface ITabsProps {
  items: ITabItem[]
  variant?: TabsVariant
  ariaLabel?: string
}
