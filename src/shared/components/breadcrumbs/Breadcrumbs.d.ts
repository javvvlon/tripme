/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IBreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

export interface IBreadcrumbsProps {
  items: IBreadcrumbItem[]
}
