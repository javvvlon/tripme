/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IMoreMenuItem {
  key: string
  label: string
  icon?: string
  danger?: boolean
}

export interface IMoreMenuProps {
  items: IMoreMenuItem[]
  label: string
}

export interface IMoreMenuEmits {
  select: [key: string]
}
