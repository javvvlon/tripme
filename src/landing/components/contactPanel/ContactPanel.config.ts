import { OFFICE_VISIT_ADDRESS } from '~/shared/config/brand'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CONTACT_CHANNELS = [
  { key: 'email', icon: 'mail', valueKey: 'contact.channels.emailValue', href: 'mailto:hi@tripme.uz' },
  { key: 'chat', icon: 'support', valueKey: 'contact.channels.chatValue', href: null },
  { key: 'office', icon: 'pin', address: OFFICE_VISIT_ADDRESS, href: null },
  { key: 'phone', icon: 'phone', valueKey: 'contact.channels.phoneValue', href: 'tel:+998936445555', hintKey: 'footer.hours' },
] as const

export const MESSAGE_MAX = 2000
