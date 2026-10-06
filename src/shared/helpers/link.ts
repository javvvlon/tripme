/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const linkProps = (link: string | null | undefined): { to?: string, href?: string } => {
  const target = link?.trim()

  if (!target) return {}

  return /^(https?:|mailto:|tel:)/i.test(target) ? { href: target } : { to: target }
}
